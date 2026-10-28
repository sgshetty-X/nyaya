/**
 * Nyaya Domain Models & Type Definitions
 * Covers Case Preparation, Legal Evaluation, Contradiction Detection, Document Analysis, and Legal Aid Directory
 */

export type MatterCategory =
  | 'criminal'
  | 'civil'
  | 'family'
  | 'property'
  | 'employment'
  | 'consumer'
  | 'contractual'
  | 'tenancy'
  | 'cybercrime'
  | 'constitutional'
  | 'administrative'
  | 'other';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type ApplicabilityState =
  | 'potentially_applicable'
  | 'requires_clarification'
  | 'insufficient_facts'
  | 'not_presently_supported'
  | 'requires_professional_review'
  | 'verified_statutory_text_unresolved';

export interface Party {
  id: string;
  name: string;
  role: 'complainant' | 'accused' | 'opposite_party' | 'witness' | 'advocate' | 'authority' | 'other';
  relationship?: string;
  contact?: string;
  address?: string;
  isOrganization?: boolean;
}

export interface CaseFact {
  id: string;
  statement: string;
  category: 'event' | 'communication' | 'payment' | 'agreement' | 'loss' | 'procedural' | 'other';
  source: 'user_narrative' | 'question_answer' | 'uploaded_document' | 'user_correction';
  sourceDocId?: string;
  pageNumber?: number;
  confidence: number;
  verified: boolean;
  dateEstablished?: string;
}

export interface StatutoryIngredient {
  ingredientId: string;
  description: string;
  isMet: 'yes' | 'no' | 'unclear';
  supportingFactIds: string[];
  missingFactDescription?: string;
  notes?: string;
}

export interface CandidateProvision {
  id: string;
  statute: string; // e.g. "Bharatiya Nyaya Sanhita, 2023"
  section: string; // e.g. "Section 318(4)"
  title: string; // e.g. "Cheating and dishonestly inducing delivery of property"
  applicabilityState: ApplicabilityState;
  officialSourceUrl: string;
  statutoryTextExcerpt: string;
  jurisdiction: string;
  commencementDate: string;
  transitionalNotes?: string;
  plainEnglishExplanation: string;
  ingredients: StatutoryIngredient[];
  factsMissing: string[];
  alternativeProvisions: string[];
  verificationStatus: 'verified_official_source' | 'pending_verification';
}

export interface ClarificationQuestion {
  id: string;
  questionNumber: number;
  section:
    | 'parties_and_relationships'
    | 'events_and_chronology'
    | 'conduct_and_communications'
    | 'harm_and_impact'
    | 'evidence_and_witnesses'
    | 'existing_legal_proceedings'
    | 'jurisdiction_and_dates'
    | 'desired_relief';
  question: string;
  whyItMatters: string;
  inputType: 'text' | 'date' | 'approximate_date' | 'number' | 'yes_no' | 'choice';
  options?: string[];
  required: boolean;
  answer?: string;
  answeredAt?: string;
  answerHistory?: { answer: string; timestamp: string }[];
  relatedIssueIds: string[];
  relatedStatuteSections: string[];
}

export interface VagueStatementFinding {
  id: string;
  originalText: string;
  category: 'missing_date' | 'ambiguous_amount' | 'unidentified_person' | 'unsupported_allegation' | 'unclear_location' | 'conclusory_statement';
  whyItMatters: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
  clarifiedText?: string;
}

export interface TimelineEvent {
  id: string;
  eventDescription: string;
  date: string; // YYYY-MM-DD or readable string
  precision: 'exact' | 'month_year' | 'approximate' | 'disputed';
  sourceDocId?: string;
  sourceType: 'user_intake' | 'document' | 'answer';
  pageNumber?: number;
  partiesInvolved: string[];
  isAnomalous?: boolean;
  anomalyReason?: string;
}

export interface ContradictionFinding {
  id: string;
  category: 'date_discrepancy' | 'amount_mismatch' | 'party_designation' | 'factual_inconsistency' | 'sequence_conflict';
  severity: 'critical' | 'high' | 'medium' | 'low';
  statementA: {
    text: string;
    source: string;
    pageOrRef?: string;
  };
  statementB: {
    text: string;
    source: string;
    pageOrRef?: string;
  };
  explanation: string;
  recommendedClarification: string;
  userResolution?: {
    status: 'unresolved' | 'explained' | 'statement_a_correct' | 'statement_b_correct' | 'both_incorrect';
    notes?: string;
    resolvedAt?: string;
  };
}

export interface EvidenceItem {
  id: string;
  title: string;
  description: string;
  category: 'agreement' | 'receipt_payment' | 'correspondence' | 'photograph' | 'medical' | 'electronic_record' | 'notice' | 'other';
  status: 'uploaded' | 'missing_from_record' | 'unconfirmed_existence';
  relevanceToLegalElement: string;
  preservationGuidance: string;
  documentId?: string;
}

export interface DocumentRecord {
  id: string;
  caseId: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  checksumSha256: string;
  pageCount: number;
  processingStatus: 'queued' | 'processing' | 'processed' | 'failed';
  ocrApplied: boolean;
  extractedText: string;
  documentDate?: string;
  partiesMentioned: string[];
  amountsFound: string[];
  datesFound: string[];
}

export type LegalDocumentType =
  | 'police_complaint'
  | 'legal_notice'
  | 'reply_to_legal_notice'
  | 'consumer_complaint'
  | 'civil_plaint'
  | 'written_statement'
  | 'formal_representation'
  | 'affidavit';

export interface LegalDraft {
  id: string;
  caseId: string;
  documentType: LegalDocumentType;
  title: string;
  forumOrRecipient: string;
  subject: string;
  heading: string;
  partiesSection: string;
  numberedParagraphs: { number: number; text: string; factualSource?: string }[];
  legalGrounds: { section: string; ground: string }[];
  requestedRelief: string[];
  verificationClause: string;
  unresolvedChecklist: string[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface CaseRecord {
  id: string;
  userId: string;
  title: string;
  description: string;
  categories: MatterCategory[];
  urgency: UrgencyLevel;
  urgencyNotes?: string;
  stateOrUT: string;
  incidentDate?: string;
  location?: string;
  desiredOutcome?: string;
  desiredDocumentType?: LegalDocumentType;
  parties: Party[];
  facts: CaseFact[];
  vagueStatements: VagueStatementFinding[];
  candidateProvisions: CandidateProvision[];
  questions: ClarificationQuestion[];
  timeline: TimelineEvent[];
  contradictions: ContradictionFinding[];
  evidenceItems: EvidenceItem[];
  documents: DocumentRecord[];
  drafts: LegalDraft[];
  createdAt: string;
  updatedAt: string;
}

export interface LegalAidResource {
  id: string;
  name: string;
  type: 'national' | 'state' | 'district' | 'specialized' | 'helpline';
  stateOrUT: string;
  district?: string;
  website: string;
  contactPhone: string;
  helpline: string;
  email?: string;
  address: string;
  serviceDescription: string;
  eligibilityCriteria: string[];
  sourceUrl: string;
  lastVerifiedDate: string;
}

export interface AuditLogEntry {
  id: string;
  caseId: string;
  action: string;
  actor: string;
  details: string;
  timestamp: string;
}
