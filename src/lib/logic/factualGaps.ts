import { ClarificationQuestion, VagueStatementFinding } from '../../types/legal';

export function detectVagueStatements(narrative: string): VagueStatementFinding[] {
  const findings: VagueStatementFinding[] = [];
  const sentences = narrative
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  sentences.forEach((sentence, idx) => {
    // 1. Missing / Ambiguous dates
    if (/\b(recently|few days ago|some time ago|last year|few months back|earlier|long back)\b/i.test(sentence)) {
      findings.push({
        id: `vague_date_${idx}`,
        originalText: sentence,
        category: 'missing_date',
        whyItMatters:
          'Exact or approximate dates determine statutory limitation periods, applicable statutory regimes (e.g. BNS 2023 vs IPC 1860 cutoff of 1 July 2024), and chronological sequencing.',
        severity: 'high',
        resolved: false,
      });
    }

    // 2. Ambiguous amounts
    if (/\b(huge amount|lot of money|some money|certain amount|heavy sum|fees|costly)\b/i.test(sentence) && !/₹|\brs\.?|\binr|\b\d{2,}\b/i.test(sentence)) {
      findings.push({
        id: `vague_amount_${idx}`,
        originalText: sentence,
        category: 'ambiguous_amount',
        whyItMatters:
          'Quantifiable pecuniary values determine court or consumer commission pecuniary jurisdiction, statutory court fee, and exact prayer relief.',
        severity: 'high',
        resolved: false,
      });
    }

    // 3. Unidentified person or ambiguous entity
    if (/\b(they|someone|a guy|the company people|support person|the agent|manager)\b/i.test(sentence) && !/\b(named|mr\.|ms\.|shri|smt|called)\b/i.test(sentence)) {
      findings.push({
        id: `vague_person_${idx}`,
        originalText: sentence,
        category: 'unidentified_person',
        whyItMatters:
          'Legal actions, legal notices, and complaints require specific natural or juristic persons with identifiable names, designations, and addresses.',
        severity: 'medium',
        resolved: false,
      });
    }

    // 4. Conclusory statement without primary fact
    if (/\b(he cheated me|they defrauded me|they are frauds|they committed a crime|it is totally illegal)\b/i.test(sentence)) {
      findings.push({
        id: `vague_conclusory_${idx}`,
        originalText: sentence,
        category: 'conclusory_statement',
        whyItMatters:
          'Courts and authorities require primary factual ingredients (who said what, when was money transferred, what exact promise was unfulfilled) rather than legal conclusions.',
        severity: 'medium',
        resolved: false,
      });
    }

    // 5. Unclear location or forum
    if (/\b(at their office|somewhere in the city|in the shop|online)\b/i.test(sentence) && !/\b(bengaluru|bangalore|delhi|mumbai|chennai|hyderabad|pune|kolkata|district)\b/i.test(sentence)) {
      findings.push({
        id: `vague_loc_${idx}`,
        originalText: sentence,
        category: 'unclear_location',
        whyItMatters:
          'Territorial jurisdiction is determined by where the cause of action wholly or in part arose, or where the opposite party resides or carries on business.',
        severity: 'medium',
        resolved: false,
      });
    }
  });

  return findings;
}

/**
 * Generates an adaptive set of up to 20 targeted clarification questions
 * grounded in missing legal elements, vague statements, and matter category.
 */
export function generateAdaptiveQuestions(
  narrative: string,
  categories: string[],
  incidentDateStr?: string,
  stateOrUT?: string
): ClarificationQuestion[] {
  const text = narrative.toLowerCase();
  const questions: ClarificationQuestion[] = [];
  let qNum = 1;

  // SECTION 1: Parties and Relationships (Max 3 questions)
  questions.push({
    id: 'q_party_opponent',
    questionNumber: qNum++,
    section: 'parties_and_relationships',
    question: 'What is the full legal name and official contact/address of the opposite party or person involved?',
    whyItMatters:
      'Legal notices and complaints cannot be served or enforced against unknown personas; legal entities or individuals must be formally identified.',
    inputType: 'text',
    required: true,
    relatedIssueIds: ['issue_party_identity'],
    relatedStatuteSections: ['Order VII Rule 1 CPC', 'Section 173 BNSS'],
  });

  questions.push({
    id: 'q_party_relationship',
    questionNumber: qNum++,
    section: 'parties_and_relationships',
    question: 'What was your pre-existing relationship or interaction with this party (e.g. landlord-tenant, consumer-seller, client-freelancer, acquaintance, stranger)?',
    whyItMatters:
      'Establishes whether rights arise from contract, fiduciary duty, statutory consumer protection, or tortious/criminal conduct.',
    inputType: 'choice',
    options: ['Consumer and Seller / Platform', 'Tenant and Landlord', 'Client and Vendor / Freelancer', 'Acquaintance or Relative', 'Complete Stranger / Online Contact', 'Employer and Employee'],
    required: true,
    relatedIssueIds: ['issue_privity_contract'],
    relatedStatuteSections: ['Indian Contract Act 1872', 'Consumer Protection Act 2019'],
  });

  // SECTION 2: Events and Chronology (Max 3 questions)
  if (!incidentDateStr || /recently|few months ago/i.test(narrative)) {
    questions.push({
      id: 'q_incident_date',
      questionNumber: qNum++,
      section: 'events_and_chronology',
      question: 'On what exact or approximate date did the primary incident, dispute, or transaction occur?',
      whyItMatters:
        'Determines whether the 1 July 2024 new criminal laws (BNS) apply, and whether claims fall within statutory limitation periods (e.g. 2 years for Consumer Commission, 3 years for contract recovery).',
      inputType: 'date',
      required: true,
      relatedIssueIds: ['issue_limitation', 'issue_transitional_regime'],
      relatedStatuteSections: ['Section 358 BNS', 'Article 55 Limitation Act', 'Section 69 Consumer Protection Act'],
    });
  }

  questions.push({
    id: 'q_last_communication_date',
    questionNumber: qNum++,
    section: 'events_and_chronology',
    question: 'What was the date of your last interaction, written reply, or demand sent to the opposite party?',
    whyItMatters:
      'The date of the last refusal or acknowledgement often resets or defines the starting point of the cause of action.',
    inputType: 'date',
    required: false,
    relatedIssueIds: ['issue_cause_of_action'],
    relatedStatuteSections: ['Section 18 Limitation Act 1963'],
  });

  // SECTION 3: Conduct and Communications (Max 3 questions)
  questions.push({
    id: 'q_written_record',
    questionNumber: qNum++,
    section: 'conduct_and_communications',
    question: 'Did you communicate with the party in writing (via email, WhatsApp, SMS, registered post, or support tickets)?',
    whyItMatters:
      'Contemporaneous written communications provide reliable documentary proof of representations, demands, and refusals.',
    inputType: 'yes_no',
    options: ['Yes, written records exist', 'No, only oral/verbal conversations', 'Partially in writing', 'Not sure'],
    required: true,
    relatedIssueIds: ['issue_electronic_evidence'],
    relatedStatuteSections: ['Section 61/63 Bharatiya Sakshya Adhiniyam, 2023'],
  });

  questions.push({
    id: 'q_specific_representation',
    questionNumber: qNum++,
    section: 'conduct_and_communications',
    question: 'What specific promise, representation, or terms did the other party state or write before you took action?',
    whyItMatters:
      'To establish fraud or cheating, the law requires proving that the promise was intentionally false when made, not merely an unfulfilled subsequent commercial agreement.',
    inputType: 'text',
    required: true,
    relatedIssueIds: ['issue_misrepresentation'],
    relatedStatuteSections: ['Section 318 BNS', 'Section 18 Indian Contract Act'],
  });

  // SECTION 4: Harm, Loss, and Impact (Max 2 questions)
  questions.push({
    id: 'q_exact_financial_loss',
    questionNumber: qNum++,
    section: 'harm_and_impact',
    question: 'What is the exact financial amount (in Indian Rupees ₹) lost, withheld, or claimed?',
    whyItMatters:
      'Pecuniary jurisdiction depends strictly on the claim amount (e.g. District Consumer Commission hears claims up to ₹50 Lakhs; High Court original jurisdiction vs District Court).',
    inputType: 'number',
    required: true,
    relatedIssueIds: ['issue_pecuniary_jurisdiction'],
    relatedStatuteSections: ['Section 34 CPA 2019', 'Court Fees Act 1870'],
  });

  questions.push({
    id: 'q_consequential_damages',
    questionNumber: qNum++,
    section: 'harm_and_impact',
    question: 'Did you suffer any physical harm, mental harassment, loss of business, or out-of-pocket expenses due to this incident?',
    whyItMatters:
      'Claims for compensation or damages under civil and consumer law require itemised particulars of consequential distress or expenses.',
    inputType: 'text',
    required: false,
    relatedIssueIds: ['issue_damages_particulars'],
    relatedStatuteSections: ['Section 73 Indian Contract Act', 'Section 39 CPA 2019'],
  });

  // SECTION 5: Evidence and Witnesses (Max 3 questions)
  questions.push({
    id: 'q_proof_of_payment',
    questionNumber: qNum++,
    section: 'evidence_and_witnesses',
    question: 'Do you have bank account statements, UPI transaction IDs, tax invoices, or payment receipts showing the transfer of funds?',
    whyItMatters:
      'Direct banking and transaction logs establish prima facie proof of consideration and unjust enrichment.',
    inputType: 'yes_no',
    options: ['Yes, I have bank/UPI/invoice receipts', 'No receipts available', 'Only cash payments with no receipt', 'I do not know'],
    required: true,
    relatedIssueIds: ['issue_consideration_proof'],
    relatedStatuteSections: ['Bharatiya Sakshya Adhiniyam, 2023'],
  });

  questions.push({
    id: 'q_independent_witnesses',
    questionNumber: qNum++,
    section: 'evidence_and_witnesses',
    question: 'Were there any independent witnesses present during oral agreements, incidents, or handovers who can corroborate your account?',
    whyItMatters:
      'Corroborating witness testimony strengthens oral evidence when formal written contracts are absent.',
    inputType: 'text',
    required: false,
    relatedIssueIds: ['issue_witness_corroboration'],
    relatedStatuteSections: ['Section 114 BSA 2023'],
  });

  // Category-specific adaptive questions
  if (categories.includes('consumer')) {
    questions.push({
      id: 'q_consumer_purpose',
      questionNumber: qNum++,
      section: 'evidence_and_witnesses',
      question: 'Was the product or service purchased exclusively for personal use, or was it used for commercial, resale, or profit-generating activities?',
      whyItMatters:
        'Under Section 2(7) of the Consumer Protection Act 2019, goods or services purchased for "commercial purpose" are excluded from Consumer Commission protection.',
      inputType: 'choice',
      options: ['Exclusively for personal/domestic use', 'For commercial / business resale', 'Partially for freelance/work-from-home', 'Not sure'],
      required: true,
      relatedIssueIds: ['issue_cpa_consumer_definition'],
      relatedStatuteSections: ['Section 2(7) CPA 2019'],
    });
  }

  if (categories.includes('tenancy')) {
    questions.push({
      id: 'q_tenancy_handover',
      questionNumber: qNum++,
      section: 'evidence_and_witnesses',
      question: 'Did you give written notice before moving out, and did you formally hand over the keys and flat possession?',
      whyItMatters:
        'A landlord is legally entitled to rent until actual possession is delivered back. Written notice and key handover prevent counterclaims of unauthorised holding.',
      inputType: 'choice',
      options: ['Yes, gave full contractual notice and handed over keys', 'Vacated but handover was disputed', 'No written notice given', 'I have not vacated yet'],
      required: true,
      relatedIssueIds: ['issue_tenancy_handover'],
      relatedStatuteSections: ['Section 106 & 108 Transfer of Property Act'],
    });
  }

  if (categories.includes('cybercrime')) {
    questions.push({
      id: 'q_cyber_portal_report',
      questionNumber: qNum++,
      section: 'evidence_and_witnesses',
      question: 'Have you reported the transaction to National Cyber Crime portal (cybercrime.gov.in / 1930) or your bank to freeze beneficiary accounts?',
      whyItMatters:
        'Immediate reporting enables the Citizen Financial Cyber Fraud Reporting System to freeze fraudulent beneficiary bank accounts before cash withdrawal.',
      inputType: 'choice',
      options: ['Yes, already reported on 1930 / portal', 'Reported only to my bank', 'Not reported yet', 'I do not know how to report'],
      required: true,
      relatedIssueIds: ['issue_cyber_freeze'],
      relatedStatuteSections: ['Section 66D IT Act', 'SOP MHA Cyber Crime Reporting'],
    });
  }

  // SECTION 6: Existing Legal Proceedings (Max 2 questions)
  questions.push({
    id: 'q_prior_police_complaint',
    questionNumber: qNum++,
    section: 'existing_legal_proceedings',
    question: 'Have you or the other party already lodged an FIR, police complaint, or initiated court/arbitration proceedings regarding this matter?',
    whyItMatters:
      'Prevents filing duplicative or contradictory proceedings and ensures pending proceedings are disclosed as required by affidavit procedural rules.',
    inputType: 'choice',
    options: ['No existing proceedings filed', 'Filed a police complaint (no FIR yet)', 'FIR registered', 'Court case / summons received', 'Arbitration notice received'],
    required: true,
    relatedIssueIds: ['issue_res_sub_judice'],
    relatedStatuteSections: ['Section 10 CPC', 'Section 173 BNSS'],
  });

  // SECTION 7: Jurisdiction and Location (Max 2 questions)
  if (!stateOrUT) {
    questions.push({
      id: 'q_jurisdiction_state',
      questionNumber: qNum++,
      section: 'jurisdiction_and_dates',
      question: 'In which State and City / District did the primary transaction, agreement, or incident occur?',
      whyItMatters:
        'Territorial jurisdiction dictates which specific Police Station, District Court, or District Consumer Commission has legal authority.',
      inputType: 'text',
      required: true,
      relatedIssueIds: ['issue_territorial_jurisdiction'],
      relatedStatuteSections: ['Section 20 CPC', 'Section 197 BNSS', 'Section 34 CPA 2019'],
    });
  }

  // SECTION 8: Desired Relief or Outcome (Max 2 questions)
  questions.push({
    id: 'q_desired_relief_primary',
    questionNumber: qNum++,
    section: 'desired_relief',
    question: 'What is your primary desired outcome (e.g. full refund of money, criminal FIR and investigation, apology/settlement, repair/replacement, injunction)?',
    whyItMatters:
      'Determines whether the appropriate procedural vehicle is a Police Complaint, Legal Notice, Consumer Complaint, or Civil Plaint.',
    inputType: 'choice',
    options: [
      'Full refund or recovery of money with interest',
      'Police investigation, FIR and penal action against fraudster',
      'Formal legal notice demanding settlement within 15 days',
      'Consumer complaint for replacement, refund and compensation for harassment',
      'Civil injunction or decree of possession',
    ],
    required: true,
    relatedIssueIds: ['issue_prayer_relief'],
    relatedStatuteSections: ['Order VII Rule 7 CPC', 'Section 39 CPA 2019'],
  });

  // Limit to at most 20 primary questions strictly
  return questions.slice(0, 20);
}
