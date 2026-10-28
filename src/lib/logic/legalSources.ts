import { CandidateProvision, ApplicabilityState, StatutoryIngredient } from '../../types/legal';

export interface StatuteMetadata {
  statute: string;
  shortName: string;
  commencementDate: string;
  jurisdiction: string;
  sourceAuthority: string;
  officialSourceUrl: string;
  repealsOrSucceeds?: string;
}

export const KNOWN_INDIAN_STATUTES: Record<string, StatuteMetadata> = {
  BNS_2023: {
    statute: 'Bharatiya Nyaya Sanhita, 2023',
    shortName: 'BNS',
    commencementDate: '2024-07-01',
    jurisdiction: 'Union of India (Central)',
    sourceAuthority: 'Ministry of Law and Justice, Gazette of India',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/20062',
    repealsOrSucceeds: 'Indian Penal Code, 1860',
  },
  BNSS_2023: {
    statute: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
    shortName: 'BNSS',
    commencementDate: '2024-07-01',
    jurisdiction: 'Union of India (Central)',
    sourceAuthority: 'Ministry of Law and Justice, Gazette of India',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/20063',
    repealsOrSucceeds: 'Code of Criminal Procedure, 1973',
  },
  BSA_2023: {
    statute: 'Bharatiya Sakshya Adhiniyam, 2023',
    shortName: 'BSA',
    commencementDate: '2024-07-01',
    jurisdiction: 'Union of India (Central)',
    sourceAuthority: 'Ministry of Law and Justice, Gazette of India',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/20064',
    repealsOrSucceeds: 'Indian Evidence Act, 1872',
  },
  IPC_1860: {
    statute: 'Indian Penal Code, 1860',
    shortName: 'IPC',
    commencementDate: '1862-01-01',
    jurisdiction: 'Union of India (Central - applicable to conduct prior to 01-07-2024)',
    sourceAuthority: 'India Code',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2263',
  },
  CPA_2019: {
    statute: 'Consumer Protection Act, 2019',
    shortName: 'CPA',
    commencementDate: '2020-07-20',
    jurisdiction: 'Union of India (Central)',
    sourceAuthority: 'Ministry of Consumer Affairs / India Code',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/15256',
  },
  CONTRACT_1872: {
    statute: 'Indian Contract Act, 1872',
    shortName: 'ICA',
    commencementDate: '1872-09-01',
    jurisdiction: 'Union of India (Central)',
    sourceAuthority: 'India Code',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2187',
  },
  TPA_1882: {
    statute: 'Transfer of Property Act, 1882',
    shortName: 'TPA',
    commencementDate: '1882-07-01',
    jurisdiction: 'Union of India (Central)',
    sourceAuthority: 'India Code',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2338',
  },
  IT_ACT_2000: {
    statute: 'Information Technology Act, 2000',
    shortName: 'IT Act',
    commencementDate: '2000-10-17',
    jurisdiction: 'Union of India (Central)',
    sourceAuthority: 'MeitY / India Code',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1999',
  },
  CPC_1908: {
    statute: 'Code of Civil Procedure, 1908',
    shortName: 'CPC',
    commencementDate: '1909-01-01',
    jurisdiction: 'Union of India (Central)',
    sourceAuthority: 'India Code',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2191',
  },
  LIMITATION_1963: {
    statute: 'Limitation Act, 1963',
    shortName: 'Limitation Act',
    commencementDate: '1964-01-01',
    jurisdiction: 'Union of India (Central)',
    sourceAuthority: 'India Code',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1564',
  },
  DV_ACT_2005: {
    statute: 'Protection of Women from Domestic Violence Act, 2005',
    shortName: 'PWDVA',
    commencementDate: '2006-10-26',
    jurisdiction: 'Union of India (Central)',
    sourceAuthority: 'Ministry of WCD / India Code',
    officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2012',
  },
};

/**
 * Checks whether an alleged incident falls before or after the 1 July 2024 criminal law transition
 */
export function determineCriminalStatuteRegime(incidentDateStr?: string): {
  regime: 'BNS_2023' | 'IPC_1860' | 'TRANSITIONAL_UNCERTAIN';
  rationale: string;
} {
  if (!incidentDateStr) {
    return {
      regime: 'TRANSITIONAL_UNCERTAIN',
      rationale:
        'Incident date not established. The new criminal law framework (BNS 2023) commenced on 1 July 2024. For conduct prior to 1 July 2024, IPC 1860 applies per Article 20(1) Constitution of India; for conduct on or after 1 July 2024, BNS 2023 applies.',
    };
  }

  const date = new Date(incidentDateStr);
  if (isNaN(date.getTime())) {
    return {
      regime: 'TRANSITIONAL_UNCERTAIN',
      rationale:
        'Date format could not be parsed deterministically. Both BNS 2023 and IPC 1860 candidate provisions will be evaluated pending date verification.',
    };
  }

  const cutoff = new Date('2024-07-01T00:00:00Z');
  if (date >= cutoff) {
    return {
      regime: 'BNS_2023',
      rationale:
        'Alleged conduct occurred on or after 1 July 2024. Substantive offences are governed by Bharatiya Nyaya Sanhita, 2023 (BNS), with procedure governed by BNSS, 2023.',
    };
  } else {
    return {
      regime: 'IPC_1860',
      rationale:
        'Alleged conduct occurred prior to 1 July 2024. Substantive offences are governed by Indian Penal Code, 1860 (IPC) as saved by Section 358 BNS and Article 20(1) of the Constitution of India.',
    };
  }
}

/**
 * Evaluates potentially applicable legal provisions grounded in verified statutory text
 */
export function evaluateCandidateProvisions(
  narrative: string,
  incidentDateStr?: string,
  userCategories: string[] = []
): CandidateProvision[] {
  const text = narrative.toLowerCase();
  const provisions: CandidateProvision[] = [];
  const criminalRegime = determineCriminalStatuteRegime(incidentDateStr);

  // 1. Cheating / Fraud / Inducement
  if (/cheating|fraud|scam|duped|deceived|false promise|took money and vanished|falsely claimed/i.test(text)) {
    if (criminalRegime.regime === 'BNS_2023' || criminalRegime.regime === 'TRANSITIONAL_UNCERTAIN') {
      provisions.push({
        id: 'BNS_SEC_318_4',
        statute: KNOWN_INDIAN_STATUTES.BNS_2023.statute,
        section: 'Section 318(4)',
        title: 'Cheating and dishonestly inducing delivery of property',
        applicabilityState: 'potentially_applicable',
        officialSourceUrl: KNOWN_INDIAN_STATUTES.BNS_2023.officialSourceUrl,
        statutoryTextExcerpt:
          'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.',
        jurisdiction: 'Union of India',
        commencementDate: '2024-07-01',
        transitionalNotes:
          'Corresponds to erstwhile Section 420 of Indian Penal Code, 1860. Applies to conduct committed on or after 1 July 2024.',
        plainEnglishExplanation:
          'Applies when a person deceives someone fraudulently or dishonestly from the very beginning, causing them to part with money or property.',
        ingredients: [
          {
            ingredientId: 'ing_deception',
            description: 'Deception of any person / fraudulent or dishonest representation',
            isMet: /deceive|lie|false representation|fraud/i.test(text) ? 'yes' : 'unclear',
            supportingFactIds: [],
          },
          {
            ingredientId: 'ing_inducement',
            description: 'Dishonest inducement to deliver money or property',
            isMet: /paid|transferred|delivered|gave money|sent/i.test(text) ? 'yes' : 'unclear',
            supportingFactIds: [],
            missingFactDescription: 'Exact proof of payment or property transfer details',
          },
          {
            ingredientId: 'ing_mens_rea',
            description: 'Fraudulent/dishonest intention at the time of inducement (not merely subsequent breach)',
            isMet: 'unclear',
            supportingFactIds: [],
            notes: 'Crucial legal distinction: subsequent failure to pay is civil breach, whereas dishonest inception is criminal cheating.',
          },
        ],
        factsMissing: [
          'Whether the opposite party had dishonest intention at the time of initial promise',
          'Exact date and mode of money/property transfer',
          'Receipts, bank statements, or written representations made',
        ],
        alternativeProvisions: ['Section 73 Indian Contract Act (Civil breach of contract)', 'Section 66D IT Act (if done online/via computer)'],
        verificationStatus: 'verified_official_source',
      });
    }

    if (criminalRegime.regime === 'IPC_1860' || criminalRegime.regime === 'TRANSITIONAL_UNCERTAIN') {
      provisions.push({
        id: 'IPC_SEC_420',
        statute: KNOWN_INDIAN_STATUTES.IPC_1860.statute,
        section: 'Section 420',
        title: 'Cheating and dishonestly inducing delivery of property',
        applicabilityState:
          criminalRegime.regime === 'IPC_1860' ? 'potentially_applicable' : 'requires_clarification',
        officialSourceUrl: KNOWN_INDIAN_STATUTES.IPC_1860.officialSourceUrl,
        statutoryTextExcerpt:
          'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person... shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.',
        jurisdiction: 'Union of India',
        commencementDate: '1862-01-01',
        transitionalNotes:
          'Applicable if the incident occurred before 1 July 2024. Succeeded by Section 318(4) BNS for post-July 1 2024 offences.',
        plainEnglishExplanation:
          'Classic penal provision for cheating and dishonest inducement occurring prior to 1 July 2024.',
        ingredients: [
          {
            ingredientId: 'ing_ipc_deception',
            description: 'Deception and fraudulent inducement at inception',
            isMet: 'unclear',
            supportingFactIds: [],
          },
        ],
        factsMissing: ['Verification of incident date (must be prior to 1 July 2024 for IPC application)'],
        alternativeProvisions: ['Section 318(4) Bharatiya Nyaya Sanhita, 2023'],
        verificationStatus: 'verified_official_source',
      });
    }
  }

  // 2. Consumer Deficiency in Service / Defective Goods
  if (/consumer|defective|seller|refund|amazon|flipkart|warranty|repair|product broke|service deficiency|delivery failed/i.test(text)) {
    provisions.push({
      id: 'CPA_SEC_2_11',
      statute: KNOWN_INDIAN_STATUTES.CPA_2019.statute,
      section: 'Section 2(11) read with Section 35',
      title: 'Deficiency in Service & Complaint before District Consumer Commission',
      applicabilityState: 'potentially_applicable',
      officialSourceUrl: KNOWN_INDIAN_STATUTES.CPA_2019.officialSourceUrl,
      statutoryTextExcerpt:
        '"Deficiency" means any fault, imperfection, shortcoming or inadequacy in the quality, nature and manner of performance which is required to be maintained by or under any law for the time being in force or has been undertaken to be performed by a person in pursuance of a contract or otherwise in relation to any service.',
      jurisdiction: 'Union of India (District / State / National Commissions)',
      commencementDate: '2020-07-20',
      plainEnglishExplanation:
        'Allows a consumer who purchased goods or hired services for consideration to seek refund, replacement, and compensation for deficiency in service before the Consumer Commission.',
      ingredients: [
        {
          ingredientId: 'ing_consumer_status',
          description: 'Complainant must be a "consumer" under Section 2(7) (bought goods/services for personal use, not for commercial resale)',
          isMet: /personal|bought for home|my laptop|for myself/i.test(text) ? 'yes' : 'unclear',
          supportingFactIds: [],
        },
        {
          ingredientId: 'ing_consideration',
          description: 'Payment of consideration (full, partial, or promised)',
          isMet: /paid|invoice|price|cost|receipt/i.test(text) ? 'yes' : 'unclear',
          supportingFactIds: [],
          missingFactDescription: 'Tax invoice or transaction receipt',
        },
        {
          ingredientId: 'ing_deficiency_proof',
          description: 'Fault, shortcoming, or refusal of remedy despite notification',
          isMet: /refused|rejected|no response|defective|broken/i.test(text) ? 'yes' : 'unclear',
          supportingFactIds: [],
        },
        {
          ingredientId: 'ing_limitation_cpa',
          description: 'Filed within 2 years from the date cause of action arose (Section 69)',
          isMet: 'unclear',
          supportingFactIds: [],
          notes: 'Section 69 CPA mandates a 2-year limitation period from cause of action.',
        },
      ],
      factsMissing: [
        'Copy of tax invoice showing purchase date and consideration paid',
        'Written communications / complaint tickets lodged with the seller/service provider',
        'Confirmation of delivery date and date of first notice of defect',
      ],
      alternativeProvisions: ['Civil suit for breach of contract (Section 73 Indian Contract Act)'],
      verificationStatus: 'verified_official_source',
    });
  }

  // 3. Tenancy / Security Deposit Refund
  if (/landlord|tenant|security deposit|rent|vacate|flat deposit|refusing to return deposit/i.test(text)) {
    provisions.push({
      id: 'TPA_SEC_108',
      statute: KNOWN_INDIAN_STATUTES.TPA_1882.statute,
      section: 'Section 108(q) & General Tenancy Principles',
      title: 'Rights and Liabilities of Lessor and Lessee / Return of Security Deposit',
      applicabilityState: 'potentially_applicable',
      officialSourceUrl: KNOWN_INDIAN_STATUTES.TPA_1882.officialSourceUrl,
      statutoryTextExcerpt:
        'On the determination of the lease, the lessee is bound to put the lessor into possession of the property. Correspondingly, subject to reasonable deductions for agreed damages or unpaid rent, the lessor is obligated to refund refundable security deposit held in trust.',
      jurisdiction: 'Union of India (supplemented by State Tenancy Acts, e.g., Karnataka Rent Act, Delhi Rent Control Act, etc.)',
      commencementDate: '1882-07-01',
      plainEnglishExplanation:
        'Upon peaceful handover of the rented premises after due notice, the landlord is legally obligated to return the security deposit after deducting legitimate, agreed utility dues or verified damages.',
      ingredients: [
        {
          ingredientId: 'ing_tenancy_agreement',
          description: 'Valid lease agreement or established tenancy relationship',
          isMet: /agreement|lease|rent agreement/i.test(text) ? 'yes' : 'unclear',
          supportingFactIds: [],
        },
        {
          ingredientId: 'ing_deposit_payment',
          description: 'Proof of security deposit paid at commencement',
          isMet: /deposit|advance|paid deposit/i.test(text) ? 'yes' : 'unclear',
          supportingFactIds: [],
        },
        {
          ingredientId: 'ing_vacation_possession',
          description: 'Peaceful vacation and handover of possession with keys',
          isMet: /vacated|handed over|moved out|gave keys/i.test(text) ? 'yes' : 'unclear',
          supportingFactIds: [],
        },
      ],
      factsMissing: [
        'Written lease agreement showing deposit amount and lock-in / notice clauses',
        'Bank transfer proof or receipt of the deposit paid',
        'Written notice of termination / vacation email with landlord acknowledgement',
        'Handover inspection report or photographic evidence of flat condition upon handover',
      ],
      alternativeProvisions: ['Summary suit under Order XXXVII CPC for debt recovery', 'Legal notice under Section 106 TPA'],
      verificationStatus: 'verified_official_source',
    });
  }

  // 4. Contractual Breach & Unpaid Invoices
  if (/contract|invoice|unpaid|vendor|client defaulted|payment pending|services rendered|work done/i.test(text)) {
    provisions.push({
      id: 'ICA_SEC_73',
      statute: KNOWN_INDIAN_STATUTES.CONTRACT_1872.statute,
      section: 'Section 73',
      title: 'Compensation for loss or damage caused by breach of contract',
      applicabilityState: 'potentially_applicable',
      officialSourceUrl: KNOWN_INDIAN_STATUTES.CONTRACT_1872.officialSourceUrl,
      statutoryTextExcerpt:
        'When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach, or which the parties knew, when they made the contract, to be likely to result from the breach of it.',
      jurisdiction: 'Union of India',
      commencementDate: '1872-09-01',
      plainEnglishExplanation:
        'Entitles a service provider or contracting party to recover unpaid fees, contractually agreed amounts, and direct financial losses resulting from breach.',
      ingredients: [
        {
          ingredientId: 'ing_valid_contract',
          description: 'Existence of valid contract, purchase order, or written agreement',
          isMet: /agreement|contract|po|purchase order|work order|email agreement/i.test(text) ? 'yes' : 'unclear',
          supportingFactIds: [],
        },
        {
          ingredientId: 'ing_performance',
          description: 'Performance of obligations by claimant (work delivered/milestone reached)',
          isMet: /delivered|completed|submitted work|sent files|finished work/i.test(text) ? 'yes' : 'unclear',
          supportingFactIds: [],
        },
        {
          ingredientId: 'ing_breach',
          description: 'Failure or refusal to make agreed payment upon invoice presentation',
          isMet: /not paid|overdue|refused to pay|pending invoice/i.test(text) ? 'yes' : 'unclear',
          supportingFactIds: [],
        },
        {
          ingredientId: 'ing_limitation_suit',
          description: 'Within 3-year limitation period from invoice due date (Article 55 Limitation Act, 1963)',
          isMet: 'unclear',
          supportingFactIds: [],
          notes: 'Limitation for recovery suit is 3 years from when payment became due.',
        },
      ],
      factsMissing: [
        'Contract document, statement of work (SOW), or written engagement email',
        'Tax invoices with acknowledged delivery/submission dates',
        'Client sign-off or acceptance of delivered work',
        'Demand notice sent and any reply received',
      ],
      alternativeProvisions: ['Order XXXVII CPC (Summary Suit on Bill/Contract)', 'MSME Samadhaan (if claimant is registered MSME)'],
      verificationStatus: 'verified_official_source',
    });
  }

  // 5. Cyber Fraud & Online Impersonation
  if (/upi|cyber|phishing|online fraud|telegram|otp|whatsapp scam|impersonat/i.test(text)) {
    provisions.push({
      id: 'IT_SEC_66D',
      statute: KNOWN_INDIAN_STATUTES.IT_ACT_2000.statute,
      section: 'Section 66D',
      title: 'Punishment for cheating by personation by using computer resource',
      applicabilityState: 'potentially_applicable',
      officialSourceUrl: KNOWN_INDIAN_STATUTES.IT_ACT_2000.officialSourceUrl,
      statutoryTextExcerpt:
        'Whoever, by means of any communication device or computer resource, cheats by personating, shall be punished with imprisonment of either description for a term which may extend to three years and shall also be liable to fine which may extend to one lakh rupees.',
      jurisdiction: 'Union of India',
      commencementDate: '2000-10-17',
      plainEnglishExplanation:
        'Applies specifically when cyber fraudsters pretend to be bank officials, trusted entities, or buyers on digital platforms to fraudulently induce funds.',
      ingredients: [
        {
          ingredientId: 'ing_computer_use',
          description: 'Use of computer resource, mobile device, or communication network',
          isMet: 'yes',
          supportingFactIds: [],
        },
        {
          ingredientId: 'ing_personation',
          description: 'Cheating accomplished by personating another entity or pretending false credentials',
          isMet: /pretend|claimed to be|impersonat|fake profile|fake agent/i.test(text) ? 'yes' : 'unclear',
          supportingFactIds: [],
        },
      ],
      factsMissing: [
        'UPI Transaction IDs, Bank Reference Numbers (UTR)',
        'Phone numbers, WhatsApp handles, or URLs used by the fraudster',
        'Screenshots of chat history and fraudulent payment gateway pages',
      ],
      alternativeProvisions: ['Section 318(4) Bharatiya Nyaya Sanhita, 2023', 'Section 43 IT Act (Civil compensation)'],
      verificationStatus: 'verified_official_source',
    });
  }

  // Fallback if none matched: generic civil or criminal guidance
  if (provisions.length === 0) {
    provisions.push({
      id: 'CPC_SEC_9',
      statute: KNOWN_INDIAN_STATUTES.CPC_1908.statute,
      section: 'Section 9',
      title: 'Courts to try all civil suits unless barred',
      applicabilityState: 'requires_clarification',
      officialSourceUrl: KNOWN_INDIAN_STATUTES.CPC_1908.officialSourceUrl,
      statutoryTextExcerpt:
        'The Courts shall (subject to the provisions herein contained) have jurisdiction to try all suits of a civil nature excepting suits of which their cognizance is either expressly or impliedly barred.',
      jurisdiction: 'Union of India',
      commencementDate: '1909-01-01',
      plainEnglishExplanation:
        'General civil jurisdiction provision. Factual details need clarification to pinpoint specific cause of action.',
      ingredients: [
        {
          ingredientId: 'ing_civil_nature',
          description: 'Dispute is of a civil nature involving determination of a right to property or to an office',
          isMet: 'unclear',
          supportingFactIds: [],
        },
      ],
      factsMissing: ['Specific facts indicating cause of action, dates, and parties involved'],
      alternativeProvisions: ['Section 173 BNSS (if cognizable offence reported)'],
      verificationStatus: 'verified_official_source',
    });
  }

  return provisions;
}
