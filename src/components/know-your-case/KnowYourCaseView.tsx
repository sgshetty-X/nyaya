import React, { useState } from 'react';
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  HelpCircle,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  ExternalLink,
  Printer,
  Copy,
  Download,
  Clock,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CaseRecord, ClarificationQuestion, LegalDocumentType, CandidateProvision, Party } from '../../types/legal';
import { caseStore } from '../../lib/db/caseStore';
import { INDIAN_STATES_AND_UTS } from '../legal-aid/statesData';

interface KnowYourCaseViewProps {
  caseRecord?: CaseRecord;
  onCaseCreatedOrUpdated: (c: CaseRecord) => void;
  onNavigateToManage: (caseId: string) => void;
}

export const KnowYourCaseView: React.FC<KnowYourCaseViewProps> = ({
  caseRecord,
  onCaseCreatedOrUpdated,
  onNavigateToManage,
}) => {
  // Wizard steps: 'intake' | 'assessment' | 'questionnaire' | 'report' | 'drafting'
  const [activeStep, setActiveStep] = useState<'intake' | 'assessment' | 'questionnaire' | 'report' | 'drafting'>(
    caseRecord ? 'assessment' : 'intake'
  );

  // Intake form state
  const [narrative, setNarrative] = useState(caseRecord?.description || '');
  const [title, setTitle] = useState(caseRecord?.title || '');
  const [stateOrUT, setStateOrUT] = useState(caseRecord?.stateOrUT || 'Delhi');
  const [incidentDate, setIncidentDate] = useState(caseRecord?.incidentDate || '');
  const [location, setLocation] = useState(caseRecord?.location || '');
  const [oppositePartyName, setOppositePartyName] = useState(
    caseRecord?.parties.find((p) => p.role === 'opposite_party')?.name || ''
  );
  const [desiredOutcome, setDesiredOutcome] = useState(caseRecord?.desiredOutcome || '');
  const [desiredDocType, setDesiredDocType] = useState<LegalDocumentType>(
    caseRecord?.desiredDocumentType || 'consumer_complaint'
  );

  // Questionnaire state
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [tempAnswers, setTempAnswers] = useState<Record<string, string>>({});
  const [savingAnswer, setSavingAnswer] = useState(false);

  // Draft state
  const [selectedDraftType, setSelectedDraftType] = useState<LegalDocumentType>(
    caseRecord?.desiredDocumentType || 'consumer_complaint'
  );
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Expanded cards state
  const [expandedProvisionId, setExpandedProvisionId] = useState<string | null>(null);

  // Handle Initial Intake Submit
  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!narrative.trim()) return;

    const parties: Party[] = [
      { id: `p_comp_${Date.now()}`, name: 'Complainant (You)', role: 'complainant' },
    ];
    if (oppositePartyName.trim()) {
      parties.push({
        id: `p_opp_${Date.now()}`,
        name: oppositePartyName.trim(),
        role: 'opposite_party',
      });
    }

    const created = caseStore.createCase({
      title: title.trim() || undefined,
      description: narrative.trim(),
      stateOrUT,
      incidentDate: incidentDate || undefined,
      location: location || undefined,
      desiredOutcome: desiredOutcome || undefined,
      desiredDocumentType: desiredDocType,
      parties,
    });

    onCaseCreatedOrUpdated(created);
    setActiveStep('assessment');
  };

  // Handle answering question
  const handleAnswerSubmit = (qId: string, answerText: string) => {
    if (!caseRecord) return;
    setSavingAnswer(true);
    try {
      const updated = caseStore.answerQuestion(caseRecord.id, qId, answerText);
      onCaseCreatedOrUpdated(updated);
      setTempAnswers((prev) => ({ ...prev, [qId]: answerText }));
      // Advance to next question
      if (activeQuestionIndex < (caseRecord.questions.length - 1)) {
        setActiveQuestionIndex((prev) => prev + 1);
      }
    } finally {
      setSavingAnswer(false);
    }
  };

  // Generate / update draft
  const handleGenerateDraft = (type: LegalDocumentType) => {
    if (!caseRecord) return;
    const draft = caseStore.createOrUpdateDraft(caseRecord.id, type);
    const updated = caseStore.getCaseById(caseRecord.id);
    if (updated) onCaseCreatedOrUpdated(updated);
  };

  // Current active draft
  const activeDraft =
    caseRecord?.drafts.find((d) => d.documentType === selectedDraftType) ||
    (caseRecord?.drafts.length ? caseRecord.drafts[caseRecord.drafts.length - 1] : undefined);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Workflow Step Tracker */}
      <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            A
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Know Your Case: Step-by-Step Preparation</h2>
            <p className="text-[11px] text-neutral-500">
              {caseRecord ? `Case: ${caseRecord.title}` : 'Start by describing your incident'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveStep('intake')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeStep === 'intake'
                ? 'bg-blue-600 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            1. Intake
          </button>
          <button
            disabled={!caseRecord}
            onClick={() => setActiveStep('assessment')}
            className={`px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-40 ${
              activeStep === 'assessment'
                ? 'bg-blue-600 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            2. Legal Assessment
          </button>
          <button
            disabled={!caseRecord}
            onClick={() => setActiveStep('questionnaire')}
            className={`px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-40 flex items-center gap-1 ${
              activeStep === 'questionnaire'
                ? 'bg-blue-600 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <span>3. Clarification Engine</span>
            {caseRecord && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 text-neutral-800">
                {caseRecord.questions.filter((q) => q.answer).length}/{caseRecord.questions.length}
              </span>
            )}
          </button>
          <button
            disabled={!caseRecord}
            onClick={() => setActiveStep('report')}
            className={`px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-40 ${
              activeStep === 'report'
                ? 'bg-blue-600 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            4. 20-Section Report
          </button>
          <button
            disabled={!caseRecord}
            onClick={() => {
              setActiveStep('drafting');
              if (caseRecord && (!activeDraft || activeDraft.documentType !== selectedDraftType)) {
                handleGenerateDraft(selectedDraftType);
              }
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-40 ${
              activeStep === 'drafting'
                ? 'bg-blue-600 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            5. Legal Draft
          </button>
        </div>
      </div>

      {/* ================= STEP 1: INTAKE ================= */}
      {activeStep === 'intake' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 1 of 5</span>
            <h2 className="text-2xl font-bold text-neutral-900">Explain What Happened</h2>
            <p className="text-sm text-neutral-600">
              Describe your incident in simple, ordinary English. You do not need to know Indian legal terminology or section numbers.
            </p>
          </div>

          <form onSubmit={handleIntakeSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="narrative" className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Incident Description *
              </label>
              <textarea
                id="narrative"
                required
                rows={6}
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                placeholder="E.g., I bought an electronic item online for ₹45,000. It broke down after 3 days. The seller refused warranty repair or refund. I sent multiple emails but received no resolution..."
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm leading-relaxed"
              />
              <p className="text-[11px] text-neutral-500">
                Include what happened, who was involved, any financial amounts, and what promise was broken.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <label htmlFor="stateOrUT" className="block text-xs font-semibold text-neutral-700">
                  State or Union Territory *
                </label>
                <select
                  id="stateOrUT"
                  value={stateOrUT}
                  onChange={(e) => setStateOrUT(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs bg-white"
                >
                  {INDIAN_STATES_AND_UTS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="incidentDate" className="block text-xs font-semibold text-neutral-700">
                  Incident Date (Approximate or Exact)
                </label>
                <input
                  id="incidentDate"
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs"
                />
                <span className="text-[10px] text-neutral-500 block">
                  Affects 1 July 2024 criminal law regime & limitation
                </span>
              </div>

              <div className="space-y-1">
                <label htmlFor="location" className="block text-xs font-semibold text-neutral-700">
                  City / District / Jurisdiction
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="E.g., Bengaluru, South District"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="oppositePartyName" className="block text-xs font-semibold text-neutral-700">
                  Opposite Party / Opponent Name
                </label>
                <input
                  id="oppositePartyName"
                  type="text"
                  value={oppositePartyName}
                  onChange={(e) => setOppositePartyName(e.target.value)}
                  placeholder="E.g., ABC Retail Pvt. Ltd. or Landlord name"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="desiredOutcome" className="block text-xs font-semibold text-neutral-700">
                  Desired Outcome
                </label>
                <input
                  id="desiredOutcome"
                  type="text"
                  value={desiredOutcome}
                  onChange={(e) => setDesiredOutcome(e.target.value)}
                  placeholder="E.g., Full refund of ₹45,000 with interest"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="desiredDocType" className="block text-xs font-semibold text-neutral-700">
                  Target Legal Document Type
                </label>
                <select
                  id="desiredDocType"
                  value={desiredDocType}
                  onChange={(e) => setDesiredDocType(e.target.value as LegalDocumentType)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs bg-white"
                >
                  <option value="consumer_complaint">Consumer Complaint (Sec 35 CPA)</option>
                  <option value="legal_notice">Formal Legal Demand Notice</option>
                  <option value="police_complaint">Police Complaint / FIR (Sec 173 BNSS)</option>
                  <option value="civil_plaint">Civil Plaint / Suit for Recovery</option>
                  <option value="reply_to_legal_notice">Reply to Legal Notice</option>
                  <option value="formal_representation">Representation to Authority</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-neutral-200">
              <span className="text-xs text-neutral-500">
                Your data is stored with private client-side isolation compliant with Indian privacy laws.
              </span>
              <button
                type="submit"
                disabled={!narrative.trim()}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <span>Analyse Legal Situation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= STEP 2: ASSESSMENT ================= */}
      {activeStep === 'assessment' && caseRecord && (
        <div className="space-y-6">
          {/* Urgency & Safety Notice Banner if triggered */}
          {caseRecord.urgency !== 'low' && (
            <div
              className={`rounded-2xl p-5 border flex items-start gap-3 ${
                caseRecord.urgency === 'critical'
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-bold text-sm">
                  {caseRecord.urgency === 'critical' ? 'Urgent / Immediate Action Alert' : 'Time-Sensitive Matter Alert'}
                </h3>
                <p className="text-xs leading-relaxed">{caseRecord.urgencyNotes}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="tel:15100"
                    className="px-3 py-1 rounded-md bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800"
                  >
                    Call NALSA Free Legal Aid: 15100
                  </a>
                  <a
                    href="tel:112"
                    className="px-3 py-1 rounded-md bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                  >
                    Emergency Police: 112
                  </a>
                  <a
                    href="tel:1930"
                    className="px-3 py-1 rounded-md bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                  >
                    Cyber Fraud Portal: 1930
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Classification Overview */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
              <div>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Case Classification</span>
                <div className="flex items-center gap-2 mt-1">
                  {caseRecord.categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase"
                    >
                      {cat}
                    </span>
                  ))}
                  <span className="text-xs text-neutral-500">• Jurisdiction: {caseRecord.stateOrUT}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveStep('questionnaire')}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1.5"
              >
                <span>Proceed to 20 Questions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Vague Statement Detection */}
            {caseRecord.vagueStatements.length > 0 && (
              <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200/70 space-y-2">
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Factual Gaps & Vague Statements Detected ({caseRecord.vagueStatements.length})</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-neutral-700">
                  {caseRecord.vagueStatements.map((v) => (
                    <div key={v.id} className="bg-white p-3 rounded-lg border border-amber-200 space-y-1">
                      <div className="font-semibold text-neutral-900">"{v.originalText}"</div>
                      <div className="text-[11px] text-amber-800">{v.whyItMatters}</div>
                      <div className="text-[10px] uppercase font-bold text-neutral-500">{v.category.replace('_', ' ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Candidate Legal Provisions Grounded in Statutes */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center justify-between">
                <span>Potentially Applicable Indian Legal Provisions</span>
                <span className="text-xs font-normal text-neutral-500">
                  Grounded in official India Code statutory text
                </span>
              </h3>

              <div className="space-y-3">
                {caseRecord.candidateProvisions.map((prov) => {
                  const isExpanded = expandedProvisionId === prov.id;
                  return (
                    <div
                      key={prov.id}
                      className="border border-neutral-200 rounded-xl p-4 bg-neutral-50/50 hover:bg-neutral-50 transition space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-neutral-900">
                              {prov.statute} — {prov.section}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              {prov.applicabilityState.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-600 font-medium">{prov.title}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={prov.officialSourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded bg-white border border-neutral-300 text-[11px] font-semibold text-neutral-700 hover:text-blue-600 flex items-center gap-1"
                          >
                            <span>India Code</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() => setExpandedProvisionId(isExpanded ? null : prov.id)}
                            className="p-1 rounded text-neutral-500 hover:bg-neutral-200"
                            aria-label={isExpanded ? 'Collapse statutory details' : 'Expand statutory details'}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-700 leading-relaxed">{prov.plainEnglishExplanation}</p>

                      {prov.transitionalNotes && (
                        <div className="text-[11px] bg-blue-50 text-blue-900 p-2.5 rounded-lg border border-blue-200">
                          <strong>Criminal Law Transition:</strong> {prov.transitionalNotes}
                        </div>
                      )}

                      {isExpanded && (
                        <div className="space-y-3 pt-2 border-t border-neutral-200 text-xs">
                          <div className="bg-white p-3 rounded-lg border border-neutral-200 space-y-1">
                            <span className="font-bold text-neutral-800 block text-[11px] uppercase tracking-wider">
                              Official Statutory Text Excerpt:
                            </span>
                            <p className="italic font-serif text-neutral-700 text-xs leading-relaxed">
                              "{prov.statutoryTextExcerpt}"
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <span className="font-bold text-neutral-800 block text-[11px] uppercase tracking-wider">
                              Statutory Ingredients & Fact-to-Law Verification:
                            </span>
                            <div className="space-y-1.5">
                              {prov.ingredients.map((ing) => (
                                <div
                                  key={ing.ingredientId}
                                  className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-neutral-200"
                                >
                                  {ing.isMet === 'yes' ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                  ) : (
                                    <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                  )}
                                  <div>
                                    <span className="font-medium text-neutral-900">{ing.description}</span>
                                    {ing.notes && <p className="text-[11px] text-neutral-500 mt-0.5">{ing.notes}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {prov.factsMissing.length > 0 && (
                            <div className="space-y-1 text-neutral-600">
                              <span className="font-bold text-neutral-800 text-[11px] uppercase tracking-wider">
                                Facts Still Missing:
                              </span>
                              <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                                {prov.factsMissing.map((f, i) => (
                                  <li key={i}>{f}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 3: QUESTIONNAIRE (UP TO 20 QUESTIONS) ================= */}
      {activeStep === 'questionnaire' && caseRecord && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 3 of 5</span>
              <h2 className="text-2xl font-bold text-neutral-900">Adaptive Fact-Clarification Engine</h2>
              <p className="text-sm text-neutral-600">
                Answer targeted clarification questions to complete the legal ingredients and resolve ambiguities.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-neutral-500">Progress</span>
              <div className="text-sm font-bold text-blue-600">
                {caseRecord.questions.filter((q) => q.answer).length} / {caseRecord.questions.length} answered
              </div>
            </div>
          </div>

          {/* Question Nav Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-2">
            {caseRecord.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setActiveQuestionIndex(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-bold shrink-0 transition flex items-center justify-center ${
                  activeQuestionIndex === idx
                    ? 'bg-blue-600 text-white shadow-sm'
                    : q.answer
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
                title={`Question ${q.questionNumber}: ${q.question.slice(0, 30)}...`}
              >
                {q.questionNumber}
              </button>
            ))}
          </div>

          {/* Active Question Card */}
          {caseRecord.questions[activeQuestionIndex] && (
            <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200 space-y-4">
              {(() => {
                const curQ = caseRecord.questions[activeQuestionIndex];
                const curVal = tempAnswers[curQ.id] !== undefined ? tempAnswers[curQ.id] : (curQ.answer || '');

                return (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-200 text-neutral-700 uppercase">
                          Section: {curQ.section.replace(/_/g, ' ')}
                        </span>
                        {curQ.required && (
                          <span className="text-[10px] font-bold text-red-600 uppercase">Required</span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug">
                        {curQ.questionNumber}. {curQ.question}
                      </h3>
                      <p className="text-xs text-neutral-600 leading-relaxed bg-white p-3 rounded-lg border border-neutral-200">
                        <strong>Why this matters under Indian law:</strong> {curQ.whyItMatters}
                      </p>
                    </div>

                    {/* Answer Inputs based on type */}
                    <div className="space-y-3 pt-2">
                      {curQ.inputType === 'choice' && curQ.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {curQ.options.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setTempAnswers((prev) => ({ ...prev, [curQ.id]: opt }));
                                handleAnswerSubmit(curQ.id, opt);
                              }}
                              className={`p-3 rounded-xl border text-left text-xs font-medium transition ${
                                curVal === opt
                                  ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                                  : 'bg-white border-neutral-200 hover:border-neutral-400 text-neutral-800'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}

                      {curQ.inputType === 'yes_no' && (
                        <div className="flex flex-wrap gap-2">
                          {(curQ.options || ['Yes', 'No', 'I do not know', 'Not applicable']).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setTempAnswers((prev) => ({ ...prev, [curQ.id]: opt }));
                                handleAnswerSubmit(curQ.id, opt);
                              }}
                              className={`px-4 py-2 rounded-xl border text-xs font-medium transition ${
                                curVal === opt
                                  ? 'bg-blue-600 text-white font-bold'
                                  : 'bg-white border-neutral-200 hover:border-neutral-400 text-neutral-800'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}

                      {(curQ.inputType === 'text' || curQ.inputType === 'number' || curQ.inputType === 'date') && (
                        <div className="space-y-2">
                          <input
                            type={curQ.inputType === 'number' ? 'number' : curQ.inputType === 'date' ? 'date' : 'text'}
                            value={curVal}
                            onChange={(e) => setTempAnswers((prev) => ({ ...prev, [curQ.id]: e.target.value }))}
                            placeholder="Enter your response here..."
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white"
                          />
                          <div className="flex flex-wrap gap-2 pt-1 text-xs">
                            <button
                              type="button"
                              onClick={() => handleAnswerSubmit(curQ.id, curVal)}
                              disabled={!curVal.trim()}
                              className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                            >
                              Save Answer
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAnswerSubmit(curQ.id, 'I do not know')}
                              className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                            >
                              I do not know
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAnswerSubmit(curQ.id, 'Not applicable')}
                              className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                            >
                              Not applicable
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Answer History & Revision */}
                    {curQ.answerHistory && curQ.answerHistory.length > 0 && (
                      <div className="text-[11px] text-neutral-400 pt-2 border-t border-neutral-200">
                        <span>Previous answers: </span>
                        {curQ.answerHistory.map((h, i) => (
                          <span key={i} className="line-through text-neutral-400 mr-2">
                            "{h.answer}"
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
            <button
              onClick={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeQuestionIndex === 0}
              className="px-4 py-2 rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Question</span>
            </button>

            <button
              onClick={() => setActiveStep('report')}
              className="px-5 py-2 rounded-lg bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition flex items-center gap-1.5"
            >
              <span>View Case Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: 20-SECTION STRUCTURED CASE REPORT ================= */}
      {activeStep === 'report' && caseRecord && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 4 of 5</span>
              <h2 className="text-2xl font-bold text-neutral-900">Structured Case Intelligence Report</h2>
              <p className="text-xs text-neutral-500">
                Comprehensive 20-Section legal analysis grounded in Indian statutes and verified facts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
              <button
                onClick={() => {
                  setActiveStep('drafting');
                  if (!activeDraft || activeDraft.documentType !== selectedDraftType) {
                    handleGenerateDraft(selectedDraftType);
                  }
                }}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-1"
              >
                <span>Generate Legal Draft</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 20 Canonical Report Sections */}
          <div className="space-y-6 text-xs text-neutral-800 divide-y divide-neutral-100">
            {/* Section 1 */}
            <div className="pt-3 space-y-1">
              <h4 className="font-bold text-sm text-neutral-900">1. Plain-English Case Summary</h4>
              <p className="text-neutral-600 leading-relaxed">{caseRecord.description}</p>
            </div>

            {/* Section 2 */}
            <div className="pt-3 space-y-1">
              <h4 className="font-bold text-sm text-neutral-900">2. Nature of the Dispute</h4>
              <p className="text-neutral-600">
                Primary Domain: <strong className="uppercase">{caseRecord.categories[0]}</strong>. Sub-domains:{' '}
                {caseRecord.categories.slice(1).join(', ') || 'None'}.
              </p>
            </div>

            {/* Section 3 */}
            <div className="pt-3 space-y-2">
              <h4 className="font-bold text-sm text-neutral-900">3. Parties and Roles</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {caseRecord.parties.map((p) => (
                  <div key={p.id} className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
                    <span className="font-bold text-neutral-900">{p.name}</span>
                    <span className="text-[11px] text-neutral-500 block">Role: {p.role.toUpperCase()}</span>
                    {p.address && <span className="text-[10px] text-neutral-400 block">{p.address}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4 & 5 */}
            <div className="pt-3 space-y-2">
              <h4 className="font-bold text-sm text-neutral-900">4. Facts Reported vs Facts Document-Supported</h4>
              <div className="space-y-1.5">
                {caseRecord.facts.map((f) => (
                  <div key={f.id} className="flex items-start gap-2 bg-neutral-50 p-2 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-neutral-900">{f.statement}</span>
                      <span className="text-[10px] text-neutral-500 block">
                        Source: {f.source} • Verified: {f.verified ? 'Yes' : 'Unverified'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 6 & 7: Disputed Facts */}
            <div className="pt-3 space-y-1">
              <h4 className="font-bold text-sm text-neutral-900">5. Disputed or Unverified Facts</h4>
              {caseRecord.vagueStatements.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-amber-800">
                  {caseRecord.vagueStatements.map((v) => (
                    <li key={v.id}>
                      "{v.originalText}" — <span className="text-neutral-500">{v.whyItMatters}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-neutral-500 italic">No material factual vagueness detected.</p>
              )}
            </div>

            {/* Section 8: Chronology */}
            <div className="pt-3 space-y-2">
              <h4 className="font-bold text-sm text-neutral-900">6. Chronology of Events</h4>
              <div className="space-y-1.5 border-l-2 border-blue-500 pl-3">
                {caseRecord.timeline.map((t) => (
                  <div key={t.id} className="space-y-0.5">
                    <span className="font-bold text-neutral-900">{t.date}: </span>
                    <span className="text-neutral-700">{t.eventDescription}</span>
                    {t.isAnomalous && (
                      <span className="text-red-600 block text-[10px] font-bold">⚠️ {t.anomalyReason}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 9 & 10: Legal Provisions & Ingredients */}
            <div className="pt-3 space-y-2">
              <h4 className="font-bold text-sm text-neutral-900">7. Applicable Provisions & Statutory Mapping</h4>
              <div className="space-y-2">
                {caseRecord.candidateProvisions.map((prov) => (
                  <div key={prov.id} className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
                    <div className="font-bold text-neutral-900">
                      {prov.statute} — {prov.section} ({prov.title})
                    </div>
                    <p className="text-neutral-600">{prov.plainEnglishExplanation}</p>
                    <div className="text-[11px] text-blue-700 font-medium">
                      Status: {prov.applicabilityState.replace(/_/g, ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 11 & 12: Missing Elements & Evidence */}
            <div className="pt-3 space-y-2">
              <h4 className="font-bold text-sm text-neutral-900">8. Available vs Missing Evidence</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-200">
                  <span className="font-bold text-emerald-900 block mb-1">Uploaded Evidence:</span>
                  {caseRecord.evidenceItems.length > 0 ? (
                    <ul className="list-disc pl-4 space-y-0.5 text-emerald-800">
                      {caseRecord.evidenceItems.map((e) => (
                        <li key={e.id}>{e.title}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-neutral-400 italic">No documents uploaded yet.</span>
                  )}
                </div>
                <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200">
                  <span className="font-bold text-amber-900 block mb-1">Recommended Missing Evidence:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
                    <li>Contemporaneous transaction receipts / bank statement</li>
                    <li>Written correspondence / notice acknowledgements</li>
                    <li>Certificate under Section 63 BSA 2023 for electronic records</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 16 & 17: Jurisdiction & Deadlines */}
            <div className="pt-3 space-y-1">
              <h4 className="font-bold text-sm text-neutral-900">9. Jurisdiction & Limitation Deadlines</h4>
              <p className="text-neutral-600">
                Territorial Forum: <strong>{caseRecord.stateOrUT}</strong> ({caseRecord.location || 'Local District'}).
              </p>
              <p className="text-neutral-600">
                Limitation: Consumer disputes must be initiated within 2 years (Sec 69 CPA); commercial contracts within 3 years.
              </p>
            </div>

            {/* Section 20: Next Steps */}
            <div className="pt-3 space-y-2">
              <h4 className="font-bold text-sm text-neutral-900">10. Recommended Next Actions</h4>
              <ol className="list-decimal pl-5 space-y-1 text-neutral-700">
                <li>Generate and review formal legal draft (Step 5).</li>
                <li>Verify all dates and exact financial sums against tax invoices or bank transfers.</li>
                <li>Upload documents to "Manage Your Case" to detect contradictions across records.</li>
                <li>If indigent or eligible under Section 12, contact NALSA on 15100 for panel advocate appointment.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 5: LEGAL DRAFTING & EDITOR ================= */}
      {activeStep === 'drafting' && caseRecord && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 5 of 5</span>
              <h2 className="text-2xl font-bold text-neutral-900">Legal Document Drafting Engine</h2>
              <p className="text-xs text-neutral-500">
                Versioned structured templates formatted for Indian courts and authorities.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedDraftType}
                onChange={(e) => {
                  const newType = e.target.value as LegalDocumentType;
                  setSelectedDraftType(newType);
                  handleGenerateDraft(newType);
                }}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-semibold bg-white"
              >
                <option value="consumer_complaint">Consumer Complaint (Sec 35 CPA)</option>
                <option value="legal_notice">Legal Demand Notice (Sec 106 TPA/Contract)</option>
                <option value="police_complaint">Police Complaint / FIR (Sec 173 BNSS)</option>
                <option value="civil_plaint">Civil Plaint / Suit for Recovery</option>
              </select>

              <button
                onClick={() => {
                  if (activeDraft) {
                    const text = `${activeDraft.heading}\n${activeDraft.forumOrRecipient}\n\n${activeDraft.partiesSection}\n\n${activeDraft.subject}\n\n${activeDraft.numberedParagraphs
                      .map((p) => `${p.number}. ${p.text}`)
                      .join('\n\n')}\n\nPRAYER:\n${activeDraft.requestedRelief
                      .map((r, i) => `(${String.fromCharCode(97 + i)}) ${r}`)
                      .join('\n')}\n\n${activeDraft.verificationClause}`;
                    navigator.clipboard.writeText(text);
                    setCopiedDraft(true);
                    setTimeout(() => setCopiedDraft(false), 2000);
                  }
                }}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1"
              >
                {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDraft ? 'Copied' : 'Copy Text'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          {/* Unresolved Verification Checklist (Separate from narrative to avoid literal N/A) */}
          {activeDraft && activeDraft.unresolvedChecklist.length > 0 && (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-1.5">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Unresolved Items & Verification Checklist</span>
              </h4>
              <p className="text-[11px] text-amber-800">
                To maintain high formal standards, missing details are kept out of the narrative. Confirm these before filing:
              </p>
              <ul className="list-disc pl-5 space-y-0.5 text-xs text-amber-900">
                {activeDraft.unresolvedChecklist.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Formatted Legal Document Preview */}
          {activeDraft ? (
            <div className="bg-neutral-50 p-6 sm:p-10 rounded-2xl border border-neutral-300 font-serif leading-relaxed text-sm text-neutral-900 space-y-6 legal-document-content shadow-inner">
              {/* Heading */}
              <div className="text-center font-bold uppercase tracking-wide space-y-1">
                <div className="text-base">{activeDraft.heading}</div>
                <div className="text-xs text-neutral-600">{activeDraft.forumOrRecipient}</div>
              </div>

              {/* Parties */}
              <div className="whitespace-pre-line text-xs font-mono bg-white p-4 rounded border border-neutral-200">
                {activeDraft.partiesSection}
              </div>

              {/* Subject */}
              <div className="font-bold underline text-center text-xs tracking-wide">
                {activeDraft.subject}
              </div>

              {/* Numbered Paragraphs */}
              <div className="space-y-4">
                <p className="italic text-xs font-sans text-neutral-500">
                  THE COMPLAINANT / PLAINTIFF RESPECTFULLY SHEWETH AS UNDER:
                </p>
                {activeDraft.numberedParagraphs.map((para) => (
                  <div key={para.number} className="flex items-start gap-3 text-justify">
                    <span className="font-bold shrink-0">{para.number}.</span>
                    <p>{para.text}</p>
                  </div>
                ))}
              </div>

              {/* Legal Grounds */}
              {activeDraft.legalGrounds.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-neutral-200">
                  <span className="font-bold uppercase tracking-wider text-xs font-sans">Legal Grounds:</span>
                  <div className="space-y-1.5 pl-4">
                    {activeDraft.legalGrounds.map((g, idx) => (
                      <div key={idx} className="text-xs">
                        <strong>({String.fromCharCode(97 + idx)}) {g.section}:</strong> {g.ground}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prayer / Relief */}
              <div className="space-y-2 pt-2 border-t border-neutral-200">
                <span className="font-bold uppercase tracking-wider text-xs font-sans">Prayer / Specific Relief:</span>
                <p className="italic text-xs">
                  WHEREFORE, in the light of the facts and grounds stated hereinabove, it is most respectfully prayed that this Hon'ble Authority may graciously be pleased to:
                </p>
                <div className="space-y-1.5 pl-4">
                  {activeDraft.requestedRelief.map((relief, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <span className="font-bold">({String.fromCharCode(97 + idx)})</span>
                      <span>{relief}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification Clause */}
              <div className="pt-4 border-t border-neutral-300 text-xs whitespace-pre-line leading-normal">
                {activeDraft.verificationClause}
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-neutral-500">Generating draft...</div>
          )}

          {/* Action to switch to Manage Your Case */}
          <div className="pt-4 flex items-center justify-between border-t border-neutral-200 text-xs">
            <span className="text-neutral-500">
              Draft Version {activeDraft?.version || 1} • Auto-saved to case record.
            </span>
            <button
              onClick={() => onNavigateToManage(caseRecord.id)}
              className="px-4 py-2 rounded-lg bg-neutral-900 text-white font-semibold hover:bg-neutral-800 flex items-center gap-1.5"
            >
              <span>Manage Case Documents & Evidence</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
