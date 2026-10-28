import { CaseRecord, LegalDraft, LegalDocumentType } from '../../types/legal';

export function generateLegalDraft(
  caseRecord: CaseRecord,
  selectedType: LegalDocumentType
): LegalDraft {
  const complainant = caseRecord.parties.find((p) => p.role === 'complainant') || {
    id: 'p_comp_default',
    name: 'Complainant / Aggrieved Person',
    role: 'complainant',
    address: '[Insert Full Residential Address]',
    contact: '[Insert Contact Phone & Email]',
  };

  const opponent = caseRecord.parties.find((p) => p.role === 'opposite_party' || p.role === 'accused') || {
    id: 'p_opp_default',
    name: 'Opposite Party / Respondent',
    role: 'opposite_party',
    address: '[Insert Address of Opposite Party]',
  };

  const now = new Date();
  const formattedToday = now.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const unresolvedChecklist: string[] = [];

  // Extract answers
  const getAnswer = (qid: string): string | undefined => {
    const q = caseRecord.questions.find((x) => x.id === qid);
    if (!q || !q.answer || q.answer === 'I do not know' || q.answer === 'Not applicable' || q.answer === 'Not sure') {
      return undefined;
    }
    return q.answer;
  };

  const incidentDate = getAnswer('q_incident_date') || caseRecord.incidentDate || '[Date of Incident to be confirmed]';
  if (incidentDate.includes('to be confirmed')) {
    unresolvedChecklist.push('Confirm exact date or date range of the cause of action');
  }

  const lossAmountStr = getAnswer('q_exact_financial_loss');
  const lossAmount = lossAmountStr ? `₹${parseFloat(lossAmountStr.replace(/[^0-9.]/g, '')).toLocaleString('en-IN')}` : '[Pecuniary Amount to be itemised]';
  if (lossAmount.includes('to be itemised')) {
    unresolvedChecklist.push('Itemise exact principal debt, loss, or security deposit amount with receipts');
  }

  const writtenRecord = getAnswer('q_written_record');
  if (!writtenRecord) {
    unresolvedChecklist.push('Confirm whether written or electronic communications exist (WhatsApp/Email/Notice)');
  }

  let heading = '';
  let forumOrRecipient = '';
  let subject = '';
  let partiesSection = '';
  const numberedParagraphs: { number: number; text: string; factualSource?: string }[] = [];
  const legalGrounds: { section: string; ground: string }[] = [];
  const requestedRelief: string[] = [];
  let verificationClause = '';

  let pNum = 1;

  if (selectedType === 'consumer_complaint') {
    heading = 'BEFORE THE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION';
    forumOrRecipient = `AT ${caseRecord.stateOrUT.toUpperCase() || '[DISTRICT/STATE]'}`;
    partiesSection = `IN THE MATTER OF:\n\n${complainant.name}\nResiding at: ${complainant.address || '[Address]'}\nContact: ${complainant.contact || '[Contact]'}\n... COMPLAINANT\n\nVERSUS\n\n${opponent.name}\nHaving Office at: ${opponent.address || '[Address of Opposite Party]'}\n... OPPOSITE PARTY`;
    subject = `COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019 FOR DEFICIENCY IN SERVICE, UNFAIR TRADE PRACTICE AND COMPENSATION`;

    numberedParagraphs.push({
      number: pNum++,
      text: `That the Complainant is a bonafide consumer within the meaning of Section 2(7) of the Consumer Protection Act, 2019, having purchased goods / availed services from the Opposite Party for personal, domestic use and valuable consideration.`,
      factualSource: 'Section 2(7) Consumer Protection Act, 2019',
    });

    numberedParagraphs.push({
      number: pNum++,
      text: `That on or around ${incidentDate}, the Complainant availed the services / purchased the subject matter goods from the Opposite Party, for which valuable consideration amounting to ${lossAmount} was duly tendered and paid.`,
      factualSource: 'Initial narrative & transaction records',
    });

    numberedParagraphs.push({
      number: pNum++,
      text: `That contrary to the assurances, express warranties, and standard representations made by the Opposite Party, the goods / services suffered from grave defect and severe deficiency in service, as detailed: ${caseRecord.description}.`,
      factualSource: 'Incident factual particulars',
    });

    numberedParagraphs.push({
      number: pNum++,
      text: `That despite repeated representations, communications, and formal grievance tickets lodged by the Complainant, the Opposite Party willfully failed, neglected, and refused to rectify the defect, provide replacement, or refund the consideration paid, causing immense mental agony and financial distress to the Complainant.`,
      factualSource: 'Grievance record',
    });

    numberedParagraphs.push({
      number: pNum++,
      text: `That the cause of action arose within the territorial and pecuniary jurisdiction of this Hon'ble District Commission where the transaction took place / payment was received, and the present complaint is well within the 2-year limitation period prescribed under Section 69 of the Act.`,
      factualSource: 'Territorial & Limitation compliance',
    });

    legalGrounds.push(
      { section: 'Section 2(11) CPA 2019', ground: 'The failure of the Opposite Party constitutes clear "deficiency in service" and supply of defective goods.' },
      { section: 'Section 35 CPA 2019', ground: 'The Complainant is entitled to approach this Hon\'ble Commission for summary adjudication and consumer redressal.' }
    );

    requestedRelief.push(
      `Direct the Opposite Party to immediately refund the sum of ${lossAmount} along with interest at the rate of 12% per annum from the date of payment until realisation;`,
      `Direct the Opposite Party to pay a sum of ₹50,000/- as compensation for mental agony, severe harassment, and deficiency in service;`,
      `Award a sum of ₹20,000/- towards the litigation costs incurred by the Complainant;`,
      `Pass such other and further order(s) as this Hon'ble Commission may deem fit and proper in the interest of justice.`
    );

    verificationClause = `I, ${complainant.name}, the Complainant above-named, do hereby verify and declare on solemn affirmation that the contents of paragraphs 1 to ${pNum - 1} are true and correct to the best of my personal knowledge and belief, no part of it is false, and nothing material has been concealed therefrom.\n\nVerified at [City/District] on this ${formattedToday}.\n\n_______________________\nCOMPLAINANT`;

  } else if (selectedType === 'legal_notice') {
    heading = 'LEGAL DEMAND NOTICE';
    forumOrRecipient = `TO:\n${opponent.name}\n${opponent.address || '[Opposite Party Address]'}`;
    partiesSection = `UNDER INSTRUCTIONS FROM MY CLIENT:\n${complainant.name}, residing at ${complainant.address || '[Client Address]'}`;
    subject = `LEGAL NOTICE UNDER SECTION 106 TRANSFER OF PROPERTY ACT / SECTION 73 INDIAN CONTRACT ACT / SECTION 80 CPC REQUIRING IMMEDIATE SETTLEMENT`;

    numberedParagraphs.push({
      number: pNum++,
      text: `Under express instructions from and on behalf of my Client, ${complainant.name}, I hereby serve upon you this formal Legal Notice.`,
    });

    numberedParagraphs.push({
      number: pNum++,
      text: `That our Client had entered into an arrangement/transaction with you on or about ${incidentDate}, pursuant to which financial obligations and contractual covenants were explicitly agreed upon.`,
    });

    numberedParagraphs.push({
      number: pNum++,
      text: `That our Client has fully and faithfully complied with all obligations on their part. However, you have willfully defaulted in discharging your lawful liabilities, namely: ${caseRecord.description}.`,
    });

    numberedParagraphs.push({
      number: pNum++,
      text: `That a total liquidated sum of ${lossAmount} remains outstanding, withheld, or due from you to our Client without any justifiable lawful excuse.`,
    });

    numberedParagraphs.push({
      number: pNum++,
      text: `That by your aforesaid unilateral acts, defaults, and omissions, you have caused wrongful financial loss, severe inconvenience, and contractual injury to our Client.`,
    });

    legalGrounds.push(
      { section: 'Indian Contract Act, 1872', ground: 'Willful failure to discharge contractual obligations and settle liquidated debt.' },
      { section: 'Specific Relief Act, 1963', ground: 'Obligation to perform statutory and contractual duties.' }
    );

    requestedRelief.push(
      `Pay and remit the full outstanding sum of ${lossAmount} to our Client within 15 (fifteen) days from the receipt of this legal notice;`,
      `Pay interest at the rate of 18% per annum on the outstanding sum from the due date until the date of actual payment;`,
      `Pay a sum of ₹10,000/- towards the cost of drafting and issuing this legal notice;`,
      `TAKE NOTICE that upon your failure to comply within the stipulated 15 days, our Client shall initiate appropriate civil suits for recovery and/or criminal proceedings against you entirely at your risk, cost, and consequences.`
    );

    verificationClause = `Issued under instructions and on behalf of ${complainant.name}.\n\nDate: ${formattedToday}\nPlace: [City/State]\n\n_______________________\nAdvocate / Authorized Signatory`;

  } else if (selectedType === 'police_complaint') {
    heading = 'COMPLAINT FOR REGISTRATION OF FIRST INFORMATION REPORT (FIR)';
    forumOrRecipient = `TO:\nTHE STATION HOUSE OFFICER (SHO) / OFFICER-IN-CHARGE\n[Name of Police Station]\n${caseRecord.stateOrUT.toUpperCase() || '[Jurisdiction Police Station]'}`;
    partiesSection = `COMPLAINANT:\n${complainant.name}, S/o or D/o [Father's Name], Aged about [Age] years,\nResiding at: ${complainant.address || '[Address]'}\nContact: ${complainant.contact || '[Phone Number]'}\n\nACCUSED PERSON(S):\n${opponent.name}, having office/residence at: ${opponent.address || '[Accused Address]'}`;
    subject = `COMPLAINT UNDER SECTION 173 OF BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 (BNSS) FOR COMMISSION OF COGNIZABLE OFFENCES UNDER BHARATIYA NYAYA SANHITA, 2023 (BNS)`;

    numberedParagraphs.push({
      number: pNum++,
      text: `That the Complainant is a law-abiding citizen of India residing at the address stated above and is lodging this formal complaint for immediate registration of FIR and investigation into cognizable offences.`,
    });

    numberedParagraphs.push({
      number: pNum++,
      text: `That on or about ${incidentDate}, within the territorial limits of this Police Station, the Accused person(s) approached/contacted the Complainant and with dishonest and fraudulent intention made representations regarding: ${caseRecord.description}.`,
    });

    numberedParagraphs.push({
      number: pNum++,
      text: `That relying upon the said dishonest representations and assurances of the Accused, the Complainant was fraudulently induced to deliver/transfer property/funds to the tune of ${lossAmount}.`,
    });

    numberedParagraphs.push({
      number: pNum++,
      text: `That subsequent events have revealed that the Accused never intended to fulfil their assurances and had from the very inception harboured the criminal intent to cheat, misappropriate, and defraud the Complainant.`,
    });

    numberedParagraphs.push({
      number: pNum++,
      text: `That contemporaneous documentary evidence, transaction logs, and communications corroborating the commission of the offence are enclosed herewith as Annexures.`,
    });

    legalGrounds.push(
      { section: 'Section 173 BNSS 2023', ground: 'Mandatory registration of FIR upon receipt of information disclosing cognizable offence (Lalita Kumari v. Govt. of UP).' },
      { section: 'Section 318(4) BNS 2023', ground: 'Cheating and dishonestly inducing delivery of property.' },
      { section: 'Section 66D IT Act 2000 (if applicable)', ground: 'Cheating by personation using computer resource.' }
    );

    requestedRelief.push(
      `Register a First Information Report (FIR) under the relevant provisions of Bharatiya Nyaya Sanhita, 2023 and the Information Technology Act, 2000;`,
      `Conduct a swift and impartial investigation into the fraudulent scheme and seize relevant electronic and banking records;`,
      `Take immediate steps to freeze the fraudulent beneficiary bank accounts / UPI handles to prevent dissipation of cheated funds;`,
      `Arrest and prosecute the Accused person(s) in accordance with law.`
    );

    verificationClause = `I, ${complainant.name}, do hereby affirm that the statements made herein are true to the best of my knowledge and that this complaint is lodged bonafide for the administration of criminal justice.\n\nDate: ${formattedToday}\nPlace: [City/State]\n\n_______________________\nSignature of Complainant`;

  } else {
    // Generic Civil Plaint / Representation
    heading = 'IN THE COURT OF THE PRINCIPAL CIVIL JUDGE / DISTRICT COURT';
    forumOrRecipient = `AT ${caseRecord.stateOrUT.toUpperCase() || '[DISTRICT/STATE]'}`;
    partiesSection = `SUIT NO. ______ OF ${now.getFullYear()}\n\n${complainant.name}\n... PLAINTIFF\n\nVERSUS\n\n${opponent.name}\n... DEFENDANT`;
    subject = `SUIT FOR RECOVERY OF MONEY UNDER ORDER VII RULE 1 OF THE CODE OF CIVIL PROCEDURE, 1908`;

    numberedParagraphs.push({
      number: pNum++,
      text: `That the Plaintiff is a resident of the address set forth above, and the Defendant resides / carries on business within the local limits of this Hon'ble Court.`,
    });
    numberedParagraphs.push({
      number: pNum++,
      text: `That on or around ${incidentDate}, the parties entered into a binding legal transaction wherein: ${caseRecord.description}.`,
    });
    numberedParagraphs.push({
      number: pNum++,
      text: `That the Defendant owes a liquidated principal debt of ${lossAmount} which has fallen due and remains unpaid despite statutory demand.`,
    });
    numberedParagraphs.push({
      number: pNum++,
      text: `That the cause of action for the present suit arose within the jurisdiction of this Hon'ble Court and is within the prescribed period of limitation.`,
    });

    requestedRelief.push(
      `Pass a decree for recovery of ${lossAmount} in favour of the Plaintiff and against the Defendant;`,
      `Award pendente lite and future interest at the rate of 18% per annum until realization;`,
      `Award costs of the suit.`
    );

    verificationClause = `I, ${complainant.name}, do hereby verify that the contents of paragraphs 1 to ${pNum - 1} are true to my knowledge and belief.\n\nVerified at [City] on ${formattedToday}.\n\n_______________________\nPLAINTIFF`;
  }

  return {
    id: `draft_${Date.now()}`,
    caseId: caseRecord.id,
    documentType: selectedType,
    title: `${selectedType.replace(/_/g, ' ').toUpperCase()} — ${caseRecord.title}`,
    forumOrRecipient,
    subject,
    heading,
    partiesSection,
    numberedParagraphs,
    legalGrounds,
    requestedRelief,
    verificationClause,
    unresolvedChecklist,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    version: 1,
  };
}
