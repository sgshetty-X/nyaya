import { ContradictionFinding, DocumentRecord, ClarificationQuestion } from '../../types/legal';

export function detectContradictions(
  userNarrative: string,
  answers: ClarificationQuestion[],
  documents: DocumentRecord[] = []
): ContradictionFinding[] {
  const findings: ContradictionFinding[] = [];
  let findingCounter = 1;

  // 1. Amount Extraction & Comparison
  const extractAmounts = (text: string): { raw: string; value: number }[] => {
    const matches = text.matchAll(/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)/gi);
    const results: { raw: string; value: number }[] = [];
    for (const match of matches) {
      const numStr = match[1].replace(/,/g, '');
      const val = parseFloat(numStr);
      if (!isNaN(val) && val > 0) {
        results.push({ raw: match[0], value: val });
      }
    }
    return results;
  };

  const narrativeAmounts = extractAmounts(userNarrative);
  const qLoss = answers.find((q) => q.id === 'q_exact_financial_loss');
  let answeredLossVal: number | null = null;
  if (qLoss?.answer) {
    const parsed = parseFloat(qLoss.answer.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed)) answeredLossVal = parsed;
  }

  // Compare narrative amounts vs question answer
  if (answeredLossVal && narrativeAmounts.length > 0) {
    for (const na of narrativeAmounts) {
      if (Math.abs(na.value - answeredLossVal) > 50) {
        findings.push({
          id: `contra_amt_${findingCounter++}`,
          category: 'amount_mismatch',
          severity: 'high',
          statementA: {
            text: `Claimed amount in initial description: ${na.raw} (₹${na.value.toLocaleString('en-IN')})`,
            source: 'Initial Incident Narrative',
          },
          statementB: {
            text: `Specified financial loss in clarification questionnaire: ₹${answeredLossVal.toLocaleString('en-IN')}`,
            source: 'Clarification Question #7 (Financial Loss)',
          },
          explanation: `There is a numerical discrepancy between the amount reported in the initial account (₹${na.value.toLocaleString(
            'en-IN'
          )}) and the clarified loss amount (₹${answeredLossVal.toLocaleString(
            'en-IN'
          )}). In legal claims, courts require exact itemisation of principal debt, security deposits, interest, and incidental costs.`,
          recommendedClarification:
            'Review bank statements or tax invoices to confirm whether the higher figure includes interest, security deposit, or consequential damages.',
          userResolution: { status: 'unresolved' },
        });
        break; // Keep to 1 primary amount mismatch to avoid redundancy
      }
    }
  }

  // Compare across documents and narrative amounts
  if (documents.length > 0) {
    for (const doc of documents) {
      const docAmounts = extractAmounts(doc.extractedText);
      for (const da of docAmounts) {
        if (answeredLossVal && Math.abs(da.value - answeredLossVal) > 100) {
          findings.push({
            id: `contra_doc_amt_${findingCounter++}`,
            category: 'amount_mismatch',
            severity: 'medium',
            statementA: {
              text: `Amount in document "${doc.filename}": ${da.raw}`,
              source: `Document: ${doc.filename}`,
              pageOrRef: 'Page 1',
            },
            statementB: {
              text: `Specified claim amount in case record: ₹${answeredLossVal.toLocaleString('en-IN')}`,
              source: 'Case Claim Record',
            },
            explanation: `Document figure (${da.raw}) differs from claimed case loss (₹${answeredLossVal.toLocaleString(
              'en-IN'
            )}). This could be due to partial advance payments, TDS deductions, or unverified claims.`,
            recommendedClarification:
              'Verify whether the document figure represents a gross invoice, net payment, or partial settlement.',
            userResolution: { status: 'unresolved' },
          });
          break;
        }
      }
    }
  }

  // 2. Date Inconsistencies
  const extractDates = (text: string): string[] => {
    const matches = text.match(/\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b/gi);
    return matches ? Array.from(matches) : [];
  };

  const narrativeDates = extractDates(userNarrative);
  const qDate = answers.find((q) => q.id === 'q_incident_date');

  if (qDate?.answer && narrativeDates.length > 0) {
    const answeredDate = qDate.answer;
    const matchesExisting = narrativeDates.some(
      (nd) => nd.includes(answeredDate) || answeredDate.includes(nd)
    );
    if (!matchesExisting && narrativeDates[0] !== answeredDate) {
      findings.push({
        id: `contra_date_${findingCounter++}`,
        category: 'date_discrepancy',
        severity: 'high',
        statementA: {
          text: `Date referenced in account: "${narrativeDates[0]}"`,
          source: 'Incident Description',
        },
        statementB: {
          text: `Date supplied in questionnaire: "${answeredDate}"`,
          source: 'Questionnaire (Primary Incident Date)',
        },
        explanation: `The incident date mentioned in the initial description ("${narrativeDates[0]}") appears inconsistent with the verified date provided in the questionnaire ("${answeredDate}"). Conflicting dates jeopardize limitation defences and credibility during cross-examination.`,
        recommendedClarification:
          'Consult written correspondence, courier receipts, or transaction history to confirm the definitive date of the cause of action.',
        userResolution: { status: 'unresolved' },
      });
    }
  }

  // 3. Document Sequence & Notice Discrepancy
  const qWritten = answers.find((q) => q.id === 'q_written_record');
  if (
    qWritten?.answer &&
    qWritten.answer.toLowerCase().includes('no, only oral') &&
    documents.some((d) => /notice|email|letter|agreement/i.test(d.filename) || /dear|subject|regards/i.test(d.extractedText))
  ) {
    findings.push({
      id: `contra_seq_${findingCounter++}`,
      category: 'factual_inconsistency',
      severity: 'medium',
      statementA: {
        text: 'User answered that only oral/verbal conversations took place.',
        source: 'Question #4 (Written Record)',
      },
      statementB: {
        text: 'Uploaded documents include letters, notices, or written correspondence.',
        source: 'Uploaded Document Inventory',
      },
      explanation:
        'The answer indicates no written records exist, yet written documents were uploaded to the case workspace. Resolving this ensures documents are formally tendered as exhibits.',
      recommendedClarification:
        'Update question #4 to acknowledge the uploaded letters or emails as written documentary evidence.',
      userResolution: { status: 'unresolved' },
    });
  }

  return findings;
}
