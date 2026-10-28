import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyIncident } from './classification';
import { determineCriminalStatuteRegime, evaluateCandidateProvisions } from './legalSources';
import { detectVagueStatements, generateAdaptiveQuestions } from './factualGaps';
import { detectContradictions } from './contradictions';
import { buildCaseTimeline } from './timeline';
import { generateLegalDraft } from './documentDrafting';
import { searchLegalAid } from './legalAidDirectory';
import { CaseRecord } from '../../types/legal';

test('1. classifyIncident correctly identifies Consumer and Tenancy categories with urgency', () => {
  const consumerCase = classifyIncident('I bought a defective refrigerator from an online seller and they refuse refund or repair.');
  assert.ok(consumerCase.categories.includes('consumer'), 'Should classify as consumer');

  const urgentThreat = classifyIncident('My ex-husband is outside threatening to kill me right now.');
  assert.equal(urgentThreat.urgency, 'critical', 'Immediate threat should be critical urgency');
  assert.ok(urgentThreat.emergencyContacts && urgentThreat.emergencyContacts.length > 0, 'Emergency numbers must be provided');
});

test('2. determineCriminalStatuteRegime respects 1 July 2024 transition', () => {
  // Pre-July 1, 2024 -> IPC 1860
  const preRegime = determineCriminalStatuteRegime('2024-05-15');
  assert.equal(preRegime.regime, 'IPC_1860', 'Offence before 1 July 2024 must be governed by IPC 1860');

  // Post-July 1, 2024 -> BNS 2023
  const postRegime = determineCriminalStatuteRegime('2024-08-10');
  assert.equal(postRegime.regime, 'BNS_2023', 'Offence on or after 1 July 2024 must be governed by BNS 2023');

  // Undated -> TRANSITIONAL_UNCERTAIN
  const uncertainRegime = determineCriminalStatuteRegime(undefined);
  assert.equal(uncertainRegime.regime, 'TRANSITIONAL_UNCERTAIN', 'Undated case must acknowledge transition uncertainty');
});

test('3. evaluateCandidateProvisions grounds in verified statutes', () => {
  const provisions = evaluateCandidateProvisions('He cheated me out of ₹50,000 on false promises', '2024-08-01');
  assert.ok(provisions.length > 0, 'Should find candidate provisions');
  assert.ok(
    provisions.some((p) => p.section.includes('318') || p.section.includes('420')),
    'Should map cheating to Section 318 BNS or 420 IPC'
  );
  provisions.forEach((p) => {
    assert.ok(p.officialSourceUrl.startsWith('https://'), 'Every provision must have an official source URL');
    assert.ok(p.ingredients.length > 0, 'Every provision must specify ingredients');
  });
});

test('4. detectVagueStatements detects missing dates, ambiguous amounts, and conclusory phrases', () => {
  const narrative = 'Recently a guy took huge amount of money from me and he cheated me in Bengaluru.';
  const findings = detectVagueStatements(narrative);
  assert.ok(findings.some((f) => f.category === 'missing_date'), 'Should detect "recently" as missing date');
  assert.ok(findings.some((f) => f.category === 'ambiguous_amount'), 'Should detect "huge amount" as ambiguous amount');
  assert.ok(findings.some((f) => f.category === 'conclusory_statement'), 'Should detect "he cheated me" as conclusory statement');
});

test('5. generateAdaptiveQuestions generates bounded questions <= 20', () => {
  const questions = generateAdaptiveQuestions('Someone refused to refund my money', ['consumer', 'contractual']);
  assert.ok(questions.length > 0 && questions.length <= 20, 'Questions must be bounded to maximum 20');
  assert.ok(
    questions.some((q) => q.section === 'parties_and_relationships'),
    'Should include party identification question'
  );
  assert.ok(
    questions.some((q) => q.section === 'harm_and_impact'),
    'Should include pecuniary loss question'
  );
});

test('6. detectContradictions catches amount and date discrepancies', () => {
  const mockAnswers = [
    {
      id: 'q_exact_financial_loss',
      questionNumber: 7,
      section: 'harm_and_impact' as const,
      question: 'Exact loss?',
      whyItMatters: 'Jurisdiction',
      inputType: 'number' as const,
      required: true,
      answer: '75000',
      relatedIssueIds: [],
      relatedStatuteSections: [],
    },
  ];
  const findings = detectContradictions('I lost ₹40,000 in this incident.', mockAnswers, []);
  assert.ok(findings.length > 0, 'Should detect discrepancy between ₹40,000 and ₹75,000');
  assert.equal(findings[0].category, 'amount_mismatch');
  assert.equal(findings[0].severity, 'high');
});

test('7. buildCaseTimeline detects chronological ordering and limitation alerts', () => {
  const timeline = buildCaseTimeline('Transaction occurred', '2021-01-01');
  assert.ok(timeline.events.length > 0, 'Should build timeline events');
  assert.ok(
    timeline.anomalies.some((a) => a.includes('Limitation Alert')),
    'Should flag events older than statutory limitation periods'
  );
});

test('8. generateLegalDraft produces structured output without literal "N/A" placeholders', () => {
  const dummyCase: CaseRecord = {
    id: 'case_test_1',
    userId: 'user_default',
    title: 'Test Consumer Dispute',
    description: 'Seller delivered broken television and refused service.',
    categories: ['consumer'],
    urgency: 'low',
    stateOrUT: 'Karnataka',
    parties: [
      { id: 'p1', name: 'Ravi Kumar', role: 'complainant', address: 'Bengaluru' },
      { id: 'p2', name: 'ElectroMart Ltd', role: 'opposite_party', address: 'Bengaluru' },
    ],
    facts: [],
    vagueStatements: [],
    candidateProvisions: [],
    questions: [],
    timeline: [],
    contradictions: [],
    evidenceItems: [],
    documents: [],
    drafts: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const draft = generateLegalDraft(dummyCase, 'consumer_complaint');
  assert.ok(draft.numberedParagraphs.length >= 4, 'Must have multiple numbered factual paragraphs');
  assert.ok(draft.requestedRelief.length > 0, 'Must have formal prayers/reliefs');
  assert.ok(draft.verificationClause.includes('Ravi Kumar'), 'Verification clause must contain complainant name');
  // Check no literal "N/A" or "I don't know" in numbered paragraphs
  for (const p of draft.numberedParagraphs) {
    assert.doesNotMatch(p.text, /\bN\/A\b/i, 'Legal draft must not contain "N/A" placeholders');
    assert.doesNotMatch(p.text, /I don'?t know/i, 'Legal draft must not contain "I don\'t know" placeholders');
  }
});

test('9. searchLegalAid returns verified statutory authorities', () => {
  const nationalResults = searchLegalAid('', 'All India');
  assert.ok(nationalResults.some((r) => r.id === 'nalsa_central'), 'Should find NALSA');
  assert.ok(nationalResults.some((r) => r.helpline === '15100'), 'Should have national helpline 15100');

  const delhiResults = searchLegalAid('Delhi', 'Delhi');
  assert.ok(delhiResults.length > 0, 'Should return Delhi legal aid');
});
