import { CaseRecord, AuditLogEntry, ClarificationQuestion, DocumentRecord, ContradictionFinding, LegalDraft, Party, CaseFact } from '../../types/legal';
import { SYNTHETIC_SEED_CASES } from './seedData';
import { classifyIncident } from '../logic/classification';
import { evaluateCandidateProvisions } from '../logic/legalSources';
import { detectVagueStatements, generateAdaptiveQuestions } from '../logic/factualGaps';
import { detectContradictions } from '../logic/contradictions';
import { buildCaseTimeline } from '../logic/timeline';
import { generateLegalDraft } from '../logic/documentDrafting';

const STORAGE_KEY = 'nyaya_cases_store_v1';
const AUDIT_KEY = 'nyaya_audit_logs_v1';

class CaseStore {
  private cases: Map<string, CaseRecord> = new Map();
  private auditLogs: AuditLogEntry[] = [];
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized) return;

    // Check localStorage if in browser environment
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as CaseRecord[];
          parsed.forEach((c) => this.cases.set(c.id, c));
        }
        const storedLogs = window.localStorage.getItem(AUDIT_KEY);
        if (storedLogs) {
          this.auditLogs = JSON.parse(storedLogs);
        }
      } catch (err) {
        console.warn('Error reading from localStorage:', err);
      }
    }

    // If empty, populate with synthetic seed cases
    if (this.cases.size === 0) {
      SYNTHETIC_SEED_CASES.forEach((c) => this.cases.set(c.id, { ...c }));
    }

    this.isInitialized = true;
  }

  private persist() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const list = Array.from(this.cases.values());
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        window.localStorage.setItem(AUDIT_KEY, JSON.stringify(this.auditLogs));
      } catch (err) {
        console.warn('Error persisting to localStorage:', err);
      }
    }
  }

  public logAudit(caseId: string, action: string, details: string) {
    const entry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      caseId,
      action,
      actor: 'User',
      details,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    this.persist();
  }

  public getCases(userId = 'user_default'): CaseRecord[] {
    this.init();
    return Array.from(this.cases.values()).filter((c) => c.userId === userId);
  }

  public getCaseById(caseId: string, userId = 'user_default'): CaseRecord | undefined {
    this.init();
    const c = this.cases.get(caseId);
    if (!c || c.userId !== userId) return undefined;
    return c;
  }

  public createCase(input: {
    title?: string;
    description: string;
    stateOrUT: string;
    incidentDate?: string;
    location?: string;
    desiredOutcome?: string;
    desiredDocumentType?: CaseRecord['desiredDocumentType'];
    parties?: Party[];
    userId?: string;
  }): CaseRecord {
    this.init();
    const id = `case_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    const classification = classifyIncident(input.description, input.incidentDate);
    const vagueStatements = detectVagueStatements(input.description);
    const candidateProvisions = evaluateCandidateProvisions(input.description, input.incidentDate, classification.categories);
    const questions = generateAdaptiveQuestions(input.description, classification.categories, input.incidentDate, input.stateOrUT);
    const timelineData = buildCaseTimeline(input.description, input.incidentDate, questions, []);

    const defaultTitle = input.title || `${classification.primaryCategory.toUpperCase()} Dispute — ${input.location || input.stateOrUT || 'India'}`;

    const newCase: CaseRecord = {
      id,
      userId: input.userId || 'user_default',
      title: defaultTitle,
      description: input.description,
      categories: classification.categories,
      urgency: classification.urgency,
      urgencyNotes: classification.urgencyReasons.join('. '),
      stateOrUT: input.stateOrUT,
      incidentDate: input.incidentDate,
      location: input.location,
      desiredOutcome: input.desiredOutcome,
      desiredDocumentType: input.desiredDocumentType,
      parties: input.parties && input.parties.length > 0 ? input.parties : [
        { id: `p_${Date.now()}_1`, name: 'Complainant (You)', role: 'complainant' }
      ],
      facts: [
        {
          id: `fact_init_${Date.now()}`,
          statement: input.description,
          category: 'event',
          source: 'user_narrative',
          confidence: 0.9,
          verified: false,
          dateEstablished: input.incidentDate,
        },
      ],
      vagueStatements,
      candidateProvisions,
      questions,
      timeline: timelineData.events,
      contradictions: [],
      evidenceItems: [],
      documents: [],
      drafts: [],
      createdAt: now,
      updatedAt: now,
    };

    this.cases.set(id, newCase);
    this.logAudit(id, 'CREATE_CASE', `Created case "${newCase.title}" with category ${classification.primaryCategory}`);
    this.persist();
    return newCase;
  }

  public answerQuestion(caseId: string, questionId: string, answerText: string): CaseRecord {
    const caseRec = this.getCaseById(caseId);
    if (!caseRec) throw new Error('Case not found');

    const question = caseRec.questions.find((q) => q.id === questionId);
    if (!question) throw new Error('Question not found');

    const oldAnswer = question.answer;
    question.answer = answerText;
    question.answeredAt = new Date().toISOString();

    if (!question.answerHistory) question.answerHistory = [];
    if (oldAnswer) {
      question.answerHistory.push({ answer: oldAnswer, timestamp: new Date().toISOString() });
    }

    // Reassess case with new facts
    this.reassessCase(caseRec);
    this.logAudit(caseId, 'ANSWER_QUESTION', `Answered question "${question.question.slice(0, 30)}..." with: "${answerText}"`);
    this.persist();
    return caseRec;
  }

  public reassessCase(caseRec: CaseRecord) {
    const classification = classifyIncident(caseRec.description, caseRec.incidentDate);
    caseRec.candidateProvisions = evaluateCandidateProvisions(caseRec.description, caseRec.incidentDate, classification.categories);
    const contradictions = detectContradictions(caseRec.description, caseRec.questions, caseRec.documents);
    caseRec.contradictions = contradictions;
    const timelineData = buildCaseTimeline(caseRec.description, caseRec.incidentDate, caseRec.questions, caseRec.documents);
    caseRec.timeline = timelineData.events;
    caseRec.updatedAt = new Date().toISOString();
  }

  public addDocument(caseId: string, doc: Omit<DocumentRecord, 'id' | 'caseId' | 'uploadedAt'>): DocumentRecord {
    const caseRec = this.getCaseById(caseId);
    if (!caseRec) throw new Error('Case not found');

    const newDoc: DocumentRecord = {
      ...doc,
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      caseId,
      uploadedAt: new Date().toISOString(),
    };

    caseRec.documents.push(newDoc);
    this.reassessCase(caseRec);
    this.logAudit(caseId, 'UPLOAD_DOCUMENT', `Uploaded and processed document "${newDoc.filename}" (${newDoc.fileSize} bytes)`);
    this.persist();
    return newDoc;
  }

  public resolveContradiction(caseId: string, contradictionId: string, resolution: ContradictionFinding['userResolution']): CaseRecord {
    const caseRec = this.getCaseById(caseId);
    if (!caseRec) throw new Error('Case not found');

    const finding = caseRec.contradictions.find((c) => c.id === contradictionId);
    if (finding) {
      finding.userResolution = resolution;
      this.logAudit(caseId, 'RESOLVE_CONTRADICTION', `Contradiction ${contradictionId} resolved with status ${resolution?.status}`);
      this.persist();
    }
    return caseRec;
  }

  public createOrUpdateDraft(caseId: string, docType: CaseRecord['desiredDocumentType']): LegalDraft {
    const caseRec = this.getCaseById(caseId);
    if (!caseRec) throw new Error('Case not found');

    const type = docType || caseRec.desiredDocumentType || 'consumer_complaint';
    const draft = generateLegalDraft(caseRec, type);
    caseRec.drafts.push(draft);
    this.logAudit(caseId, 'GENERATE_DRAFT', `Generated legal draft for ${type}`);
    this.persist();
    return draft;
  }

  public updateDraft(caseId: string, draftId: string, updates: Partial<LegalDraft>): LegalDraft {
    const caseRec = this.getCaseById(caseId);
    if (!caseRec) throw new Error('Case not found');

    const draft = caseRec.drafts.find((d) => d.id === draftId);
    if (!draft) throw new Error('Draft not found');

    Object.assign(draft, updates, { updatedAt: new Date().toISOString(), version: draft.version + 1 });
    this.logAudit(caseId, 'UPDATE_DRAFT', `Updated draft ${draftId} to version ${draft.version}`);
    this.persist();
    return draft;
  }

  public deleteCase(caseId: string): boolean {
    this.init();
    const deleted = this.cases.delete(caseId);
    if (deleted) {
      this.logAudit(caseId, 'DELETE_CASE', 'Case and associated records deleted');
      this.persist();
    }
    return deleted;
  }

  public getAuditLogs(caseId?: string): AuditLogEntry[] {
    this.init();
    if (!caseId) return this.auditLogs;
    return this.auditLogs.filter((l) => l.caseId === caseId);
  }

  public resetToSeed(): void {
    this.cases.clear();
    this.auditLogs = [];
    SYNTHETIC_SEED_CASES.forEach((c) => this.cases.set(c.id, { ...c }));
    this.persist();
  }
}

export const caseStore = new CaseStore();
