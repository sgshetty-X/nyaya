import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { caseStore } from './src/lib/db/caseStore.js';
import { classifyIncident } from './src/lib/logic/classification.js';
import { evaluateCandidateProvisions, KNOWN_INDIAN_STATUTES, determineCriminalStatuteRegime } from './src/lib/logic/legalSources.js';
import { searchLegalAid } from './src/lib/logic/legalAidDirectory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true }));

  // --- API Routes ---

  // Health check & status
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Nyaya Legal Aid Platform',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      statutesIndexed: Object.keys(KNOWN_INDIAN_STATUTES).length,
    });
  });

  // GET /api/cases - List all cases
  app.get('/api/cases', (_req: Request, res: Response) => {
    try {
      const cases = caseStore.getCases();
      res.json({ success: true, data: cases });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/cases - Create new case
  app.post('/api/cases', (req: Request, res: Response) => {
    try {
      const { title, description, stateOrUT, incidentDate, location, desiredOutcome, desiredDocumentType, parties } = req.body;
      if (!description || description.trim().length < 5) {
        return res.status(400).json({ success: false, error: 'A descriptive narrative is required.' });
      }
      const newCase = caseStore.createCase({
        title,
        description,
        stateOrUT: stateOrUT || 'Delhi',
        incidentDate,
        location,
        desiredOutcome,
        desiredDocumentType,
        parties,
      });
      res.status(201).json({ success: true, data: newCase });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/cases/:id - Get specific case
  app.get('/api/cases/:id', (req: Request, res: Response) => {
    try {
      const caseRec = caseStore.getCaseById(req.params.id);
      if (!caseRec) {
        return res.status(404).json({ success: false, error: 'Case not found' });
      }
      res.json({ success: true, data: caseRec });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/cases/:id/answers - Submit answer to clarification question
  app.post('/api/cases/:id/answers', (req: Request, res: Response) => {
    try {
      const { questionId, answer } = req.body;
      if (!questionId || answer === undefined) {
        return res.status(400).json({ success: false, error: 'questionId and answer are required' });
      }
      const updatedCase = caseStore.answerQuestion(req.params.id, questionId, String(answer));
      res.json({ success: true, data: updatedCase });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/cases/:id/documents - Ingest document
  app.post('/api/cases/:id/documents', (req: Request, res: Response) => {
    try {
      const { filename, fileSize, mimeType, extractedText, checksumSha256, documentDate, partiesMentioned, amountsFound, datesFound } = req.body;
      if (!filename || !extractedText) {
        return res.status(400).json({ success: false, error: 'Filename and extractedText are required' });
      }
      const newDoc = caseStore.addDocument(req.params.id, {
        filename,
        fileSize: fileSize || 1024,
        mimeType: mimeType || 'application/pdf',
        checksumSha256: checksumSha256 || 'manual_upload_checksum',
        pageCount: 1,
        processingStatus: 'processed',
        ocrApplied: false,
        extractedText,
        documentDate,
        partiesMentioned: partiesMentioned || [],
        amountsFound: amountsFound || [],
        datesFound: datesFound || [],
      });
      res.status(201).json({ success: true, data: newDoc });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // PATCH /api/cases/:id/contradictions/:contraId - Resolve contradiction
  app.patch('/api/cases/:id/contradictions/:contraId', (req: Request, res: Response) => {
    try {
      const { status, notes } = req.body;
      const updatedCase = caseStore.resolveContradiction(req.params.id, req.params.contraId, {
        status,
        notes,
        resolvedAt: new Date().toISOString(),
      });
      res.json({ success: true, data: updatedCase });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/cases/:id/drafts - Create draft
  app.post('/api/cases/:id/drafts', (req: Request, res: Response) => {
    try {
      const { documentType } = req.body;
      const draft = caseStore.createOrUpdateDraft(req.params.id, documentType);
      res.status(201).json({ success: true, data: draft });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/legal-sources - Search statutes & provisions
  app.get('/api/legal-sources', (req: Request, res: Response) => {
    try {
      const q = (req.query.q as string) || '';
      const incidentDate = (req.query.incidentDate as string) || '';
      const results = evaluateCandidateProvisions(q || 'cheating fraud breach contract', incidentDate);
      res.json({
        success: true,
        data: results,
        statutes: Object.values(KNOWN_INDIAN_STATUTES),
        transitionStatus: determineCriminalStatuteRegime(incidentDate),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/legal-aid - Search legal aid directory
  app.get('/api/legal-aid', (req: Request, res: Response) => {
    try {
      const q = (req.query.q as string) || '';
      const state = (req.query.state as string) || '';
      const results = searchLegalAid(q, state);
      res.json({ success: true, count: results.length, data: results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // DELETE /api/cases/:id
  app.delete('/api/cases/:id', (req: Request, res: Response) => {
    try {
      const success = caseStore.deleteCase(req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite integration
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Nyaya Legal Aid Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
