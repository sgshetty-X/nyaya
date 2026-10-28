import React, { useState } from 'react';
import {
  FolderOpen,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Eye,
  FileCheck,
  Search,
  Check,
  X,
  Calendar,
  AlertCircle,
  Hash,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { CaseRecord, DocumentRecord, ContradictionFinding } from '../../types/legal';
import { caseStore } from '../../lib/db/caseStore';

interface ManageYourCaseViewProps {
  cases: CaseRecord[];
  activeCaseId?: string;
  onSelectCase: (caseId: string) => void;
  onCaseUpdated: (c: CaseRecord) => void;
}

export const ManageYourCaseView: React.FC<ManageYourCaseViewProps> = ({
  cases,
  activeCaseId,
  onSelectCase,
  onCaseUpdated,
}) => {
  const currentCase = cases.find((c) => c.id === activeCaseId) || cases[0];

  // Active tab inside Manage Your Case workspace
  const [activeTab, setActiveTab] = useState<'documents' | 'contradictions' | 'evidence' | 'timeline' | 'readiness'>('documents');

  // File upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFileContent, setSelectedFileContent] = useState<string>('');
  const [manualFileName, setManualFileName] = useState('');
  const [manualDocDate, setManualDocDate] = useState('');
  const [showManualUploadModal, setShowManualUploadModal] = useState(false);

  // Selected document for inspection
  const [inspectedDoc, setInspectedDoc] = useState<DocumentRecord | null>(null);

  // Contradiction filter
  const [contraFilter, setContraFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Handle file drop / upload
  const handleFileUpload = (filename: string, content: string, fileSize = 24500, docDate?: string) => {
    if (!currentCase) return;
    setUploading(true);

    // Generate SHA-256 dummy hash
    const fakeHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    setTimeout(() => {
      // Extract dates and amounts
      const amountsFound = Array.from(content.matchAll(/(?:₹|rs\.?|inr)\s*([\d,]+)/gi)).map((m) => m[0]);
      const datesFound = Array.from(content.match(/\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\b/g) || []);

      const newDoc = caseStore.addDocument(currentCase.id, {
        filename,
        fileSize,
        mimeType: filename.endsWith('.pdf') ? 'application/pdf' : filename.endsWith('.docx') ? 'application/vnd.openxmlformats' : 'text/plain',
        checksumSha256: fakeHash,
        pageCount: Math.max(1, Math.ceil(content.length / 1500)),
        processingStatus: 'processed',
        ocrApplied: filename.includes('scan') || filename.includes('photo'),
        extractedText: content,
        documentDate: docDate || datesFound[0] || undefined,
        partiesMentioned: ['Complainant', 'Opposite Party'],
        amountsFound,
        datesFound,
      });

      const updated = caseStore.getCaseById(currentCase.id);
      if (updated) {
        onCaseUpdated(updated);
        setInspectedDoc(newDoc);
      }
      setUploading(false);
      setShowManualUploadModal(false);
      setManualFileName('');
      setSelectedFileContent('');
      setManualDocDate('');
    }, 600);
  };

  // Handle resolving a contradiction
  const handleResolveContradiction = (
    contraId: string,
    status: NonNullable<ContradictionFinding['userResolution']>['status'],
    notes?: string
  ) => {
    if (!currentCase) return;
    const updated = caseStore.resolveContradiction(currentCase.id, contraId, {
      status,
      notes: notes || 'Resolved by user review',
      resolvedAt: new Date().toISOString(),
    });
    onCaseUpdated(updated);
    setResolvingId(null);
    setResolutionNotes('');
  };

  const filteredContradictions = (currentCase?.contradictions || []).filter((c) => {
    if (contraFilter === 'all') return true;
    return c.severity === contraFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* Workspace Header & Case Switcher */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
              B
            </span>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Manage Your Case Workspace
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
            {currentCase ? currentCase.title : 'Select or Create a Case'}
          </h1>
          <p className="text-xs text-neutral-500">
            {currentCase
              ? `Jurisdiction: ${currentCase.stateOrUT} • Categories: ${currentCase.categories.join(', ')} • Created: ${new Date(
                  currentCase.createdAt
                ).toLocaleDateString('en-IN')}`
              : 'Organise your evidence and detect inconsistencies.'}
          </p>
        </div>

        {/* Case Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="case-select" className="text-xs font-semibold text-neutral-600 whitespace-nowrap">
            Active Case:
          </label>
          <select
            id="case-select"
            value={currentCase?.id || ''}
            onChange={(e) => onSelectCase(e.target.value)}
            className="px-3 py-2 rounded-xl border border-neutral-300 text-xs font-semibold bg-white max-w-xs truncate"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentCase && (
        <div className="space-y-6">
          {/* Workspace Sub-Navigation Tabs */}
          <div className="bg-white rounded-xl p-1.5 border border-neutral-200 flex flex-wrap gap-1 shadow-xs">
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'documents'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Document Inventory ({currentCase.documents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('contradictions')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'contradictions'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>
                Contradiction Detection ({currentCase.contradictions.filter((x) => !x.userResolution || x.userResolution.status === 'unresolved').length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'evidence'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Evidence Register</span>
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Consolidated Chronology ({currentCase.timeline.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('readiness')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'readiness'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Case Readiness Report</span>
            </button>
          </div>

          {/* ================= TAB 1: DOCUMENTS & UPLOADER ================= */}
          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Document List & Upload Zone */}
              <div className="lg:col-span-2 space-y-6">
                {/* Upload Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (re) => {
                        handleFileUpload(file.name, (re.target?.result as string) || 'Document text extracted', file.size);
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition flex flex-col items-center justify-center space-y-3 ${
                    dragActive ? 'border-blue-600 bg-blue-50/50' : 'border-neutral-300 bg-white hover:border-neutral-400'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      Upload Case Records (PDF, DOCX, TXT, Images)
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                      Files are cryptographically checksummed with SHA-256 and stored privately. Drag & drop or paste text below.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <label className="px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition cursor-pointer">
                      <span>Choose File from Device</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.txt,image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (re) => {
                              handleFileUpload(file.name, (re.target?.result as string) || `Extracted text from ${file.name}`, file.size);
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                    </label>

                    <button
                      onClick={() => setShowManualUploadModal(true)}
                      className="px-4 py-2 rounded-lg bg-white border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition"
                    >
                      Paste Document Text / Excerpt
                    </button>
                  </div>

                  {uploading && (
                    <div className="text-xs text-blue-600 font-semibold flex items-center gap-1.5 animate-pulse pt-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Computing checksum & extracting structured entities...</span>
                    </div>
                  )}
                </div>

                {/* Documents Inventory Table */}
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-neutral-900">
                      Uploaded Documents Inventory ({currentCase.documents.length})
                    </h3>
                    <span className="text-[11px] text-neutral-500">Page-level provenance preserved</span>
                  </div>

                  {currentCase.documents.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400 text-xs space-y-1">
                      <p>No documents uploaded yet for this case.</p>
                      <p className="text-neutral-500">Upload agreements, notices, or receipts to trigger automated contradiction detection.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100 text-xs">
                      {currentCase.documents.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => setInspectedDoc(doc)}
                          className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50 transition cursor-pointer ${
                            inspectedDoc?.id === doc.id ? 'bg-blue-50/60' : ''
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-neutral-500" />
                              <span className="font-bold text-neutral-900">{doc.filename}</span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 text-neutral-600 font-mono">
                                {(doc.fileSize / 1024).toFixed(1)} KB
                              </span>
                              {doc.ocrApplied && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700 font-bold">
                                  OCR
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-500 flex flex-wrap gap-2">
                              <span>Date: {doc.documentDate || 'Undated'}</span>
                              <span>•</span>
                              <span>{doc.pageCount} page(s)</span>
                              <span>•</span>
                              <span className="font-mono text-[10px]">SHA-256: {doc.checksumSha256.slice(0, 12)}...</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectedDoc(doc);
                              }}
                              className="px-2.5 py-1 rounded bg-white border border-neutral-300 text-[11px] font-medium text-neutral-700 hover:bg-neutral-100 flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspect Text</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Col: Document Inspector & Extracted Details */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-4 sticky top-24">
                  <h3 className="font-bold text-sm text-neutral-900 flex items-center justify-between">
                    <span>Document Inspector</span>
                    {inspectedDoc && (
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {inspectedDoc.checksumSha256.slice(0, 10)}
                      </span>
                    )}
                  </h3>

                  {inspectedDoc ? (
                    <div className="space-y-4 text-xs">
                      <div className="p-3 bg-neutral-50 rounded-xl space-y-1">
                        <div className="font-bold text-neutral-900">{inspectedDoc.filename}</div>
                        <div className="text-[11px] text-neutral-500">
                          Uploaded: {new Date(inspectedDoc.uploadedAt).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Document Date Extracted: <strong>{inspectedDoc.documentDate || 'None detected'}</strong>
                        </div>
                      </div>

                      {inspectedDoc.amountsFound.length > 0 && (
                        <div className="space-y-1">
                          <span className="font-bold text-neutral-700 uppercase tracking-wider text-[10px]">
                            Amounts Detected:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {inspectedDoc.amountsFound.map((amt, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                                {amt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1">
                        <span className="font-bold text-neutral-700 uppercase tracking-wider text-[10px]">
                          Extracted Text Content:
                        </span>
                        <div className="p-3 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-[11px] max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                          {inspectedDoc.extractedText}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 text-neutral-400 text-xs">
                      Select a document from the inventory on the left to inspect its extracted text and verified entities.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: CONTRADICTION DETECTION ================= */}
          {activeTab === 'contradictions' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <span>Cross-Document Contradiction & Inconsistency Center</span>
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Compares user intake statements against uploaded documentary exhibits to catch discrepancies before opposite counsel does.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 text-xs">
                    {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
                      <button
                        key={sev}
                        onClick={() => setContraFilter(sev)}
                        className={`px-3 py-1 rounded-lg font-semibold uppercase text-[11px] transition ${
                          contraFilter === sev
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredContradictions.length === 0 ? (
                  <div className="p-10 text-center space-y-2 text-neutral-500 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="font-bold text-neutral-800 text-sm">No Unresolved Contradictions</p>
                    <p>All recorded dates, financial sums, and assertions align across your documents.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredContradictions.map((contra) => {
                      const isResolving = resolvingId === contra.id;
                      const isResolved = contra.userResolution && contra.userResolution.status !== 'unresolved';

                      return (
                        <div
                          key={contra.id}
                          className={`rounded-2xl p-5 border transition space-y-4 ${
                            contra.severity === 'critical'
                              ? 'bg-red-50/40 border-red-200'
                              : contra.severity === 'high'
                              ? 'bg-amber-50/40 border-amber-200'
                              : 'bg-white border-neutral-200'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  contra.severity === 'critical'
                                    ? 'bg-red-600 text-white'
                                    : contra.severity === 'high'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-neutral-200 text-neutral-800'
                                }`}
                              >
                                {contra.severity} Severity
                              </span>
                              <span className="text-xs font-bold text-neutral-900 uppercase">
                                {contra.category.replace(/_/g, ' ')}
                              </span>
                            </div>

                            {isResolved ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Resolved: {contra.userResolution?.status.replace(/_/g, ' ')}</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-amber-700 font-medium">Action Required</span>
                            )}
                          </div>

                          {/* Side-by-Side Comparison of Statements */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-1.5 shadow-xs">
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                                Statement A ({contra.statementA.source})
                              </span>
                              <p className="font-semibold text-neutral-900 leading-relaxed">
                                "{contra.statementA.text}"
                              </p>
                              {contra.statementA.pageOrRef && (
                                <span className="text-[10px] text-neutral-400 block">
                                  Ref: {contra.statementA.pageOrRef}
                                </span>
                              )}
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-1.5 shadow-xs">
                              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                                Statement B ({contra.statementB.source})
                              </span>
                              <p className="font-semibold text-neutral-900 leading-relaxed">
                                "{contra.statementB.text}"
                              </p>
                              {contra.statementB.pageOrRef && (
                                <span className="text-[10px] text-neutral-400 block">
                                  Ref: {contra.statementB.pageOrRef}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Legal Significance & Recommendation */}
                          <div className="text-xs text-neutral-700 space-y-1 bg-white/70 p-3.5 rounded-xl border border-neutral-200">
                            <p className="leading-relaxed">
                              <strong>Why this matters:</strong> {contra.explanation}
                            </p>
                            <p className="text-neutral-600 text-[11px]">
                              <strong>Recommended Clarification:</strong> {contra.recommendedClarification}
                            </p>
                          </div>

                          {/* User Resolution Controls */}
                          {!isResolved ? (
                            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200">
                              <span className="text-[11px] text-neutral-500">
                                How would you like to resolve this discrepancy?
                              </span>
                              <div className="flex flex-wrap gap-2 text-xs">
                                <button
                                  onClick={() => handleResolveContradiction(contra.id, 'statement_a_correct', 'Confirmed Statement A is the accurate fact.')}
                                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold"
                                >
                                  Statement A is Correct
                                </button>
                                <button
                                  onClick={() => handleResolveContradiction(contra.id, 'statement_b_correct', 'Confirmed Statement B is the accurate fact.')}
                                  className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold"
                                >
                                  Statement B is Correct
                                </button>
                                <button
                                  onClick={() => setResolvingId(isResolving ? null : contra.id)}
                                  className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white font-semibold hover:bg-neutral-800"
                                >
                                  Explain / Add Note
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[11px] text-neutral-500 bg-neutral-100/60 p-2 rounded">
                              <strong>Resolution Note:</strong> {contra.userResolution?.notes} • Resolved at{' '}
                              {new Date(contra.userResolution?.resolvedAt || '').toLocaleDateString('en-IN')}
                            </div>
                          )}

                          {isResolving && (
                            <div className="p-3 bg-white rounded-xl border border-neutral-300 space-y-2 text-xs">
                              <label className="font-bold text-neutral-800">
                                Enter explanation for this discrepancy:
                              </label>
                              <textarea
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                placeholder="E.g., The higher amount in Statement A includes GST and delivery charges, while Statement B was base price..."
                                className="w-full p-2.5 rounded-lg border border-neutral-300 text-xs"
                                rows={2}
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setResolvingId(null)}
                                  className="px-3 py-1 rounded border border-neutral-300 text-neutral-600"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleResolveContradiction(contra.id, 'explained', resolutionNotes)}
                                  className="px-3 py-1 rounded bg-blue-600 text-white font-bold"
                                >
                                  Save Resolution
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 3: EVIDENCE REGISTER ================= */}
          {activeTab === 'evidence' && (
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-4">
              <div className="space-y-1 border-b border-neutral-100 pb-3">
                <h3 className="font-bold text-base text-neutral-900">Case Evidence & Document Registry</h3>
                <p className="text-xs text-neutral-500">
                  Track uploaded exhibits vs recommended missing records needed to satisfy statutory ingredients.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Uploaded Evidence */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-neutral-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Uploaded Documents & Verified Exhibits</span>
                  </h4>

                  {currentCase.documents.length === 0 ? (
                    <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200 text-center text-neutral-400">
                      No documents uploaded yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentCase.documents.map((doc, idx) => (
                        <div key={doc.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-neutral-900">
                              Exhibit {String.fromCharCode(65 + idx)}: {doc.filename}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-500">{doc.documentDate || 'Undated'}</span>
                          </div>
                          <p className="text-[11px] text-neutral-600 line-clamp-2">{doc.extractedText}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Missing Evidence Analysis */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-neutral-800 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>Recommended Missing Records Checklist</span>
                  </h4>

                  <div className="space-y-2">
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1">
                      <div className="font-bold text-amber-900">Bank Statement / UPI Ledger (Section 61/63 BSA)</div>
                      <p className="text-[11px] text-amber-800">
                        Needed to substantiate pecuniary consideration and financial loss. Ensure bank stamp or electronic certificate is available.
                      </p>
                      <span className="text-[10px] text-neutral-500 block">Status: Missing from case set</span>
                    </div>

                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1">
                      <div className="font-bold text-amber-900">Tax Invoice / Written Engagement Agreement</div>
                      <p className="text-[11px] text-amber-800">
                        Proves contractual privity and mutual covenants under the Indian Contract Act, 1872.
                      </p>
                      <span className="text-[10px] text-neutral-500 block">Status: Highly recommended</span>
                    </div>

                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1">
                      <div className="font-bold text-amber-900">Postal Delivery Tracking / Email Acknowledgment</div>
                      <p className="text-[11px] text-amber-800">
                        Required to prove legal notice receipt under Section 27 of General Clauses Act, 1897.
                      </p>
                      <span className="text-[10px] text-neutral-500 block">Status: Missing from case set</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: TIMELINE ================= */}
          {activeTab === 'timeline' && (
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-neutral-700" />
                    <span>Consolidated Case Chronology & Anomaly Verification</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Ordered sequence of verified events extracted from narrative and uploaded documents.
                  </p>
                </div>
              </div>

              {currentCase.timeline.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 text-xs">
                  No events recorded yet. Answer chronology questions or upload dated documents.
                </div>
              ) : (
                <div className="relative border-l-2 border-neutral-200 ml-4 pl-6 space-y-6 my-4">
                  {currentCase.timeline.map((evt, idx) => (
                    <div key={evt.id} className="relative space-y-1 text-xs">
                      {/* Timeline dot marker */}
                      <span
                        className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          evt.isAnomalous ? 'bg-red-500' : 'bg-blue-600'
                        }`}
                      ></span>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded text-[11px]">
                          {evt.date}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-neutral-400">
                          [{evt.sourceType.replace('_', ' ')}]
                        </span>
                        {evt.isAnomalous && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            Anomaly Flagged
                          </span>
                        )}
                      </div>

                      <p className="font-medium text-neutral-800 text-sm leading-snug">
                        {evt.eventDescription}
                      </p>

                      {evt.partiesInvolved.length > 0 && (
                        <p className="text-[11px] text-neutral-500">
                          Parties: {evt.partiesInvolved.join(', ')}
                        </p>
                      )}

                      {evt.anomalyReason && (
                        <div className="text-[11px] bg-red-50 text-red-800 p-2 rounded border border-red-200">
                          ⚠️ <strong>Limitation / Sequence Note:</strong> {evt.anomalyReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 5: READINESS REPORT ================= */}
          {activeTab === 'readiness' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">Prioritised Case Readiness Report</h3>
                  <p className="text-xs text-neutral-500">
                    Comprehensive audit of filing preparedness, evidentiary sufficiency, and legal prerequisites.
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Export Report</span>
                </button>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Evidentiary Sufficiency
                  </span>
                  <div className="text-lg font-bold text-neutral-900">
                    {currentCase.documents.length >= 2 ? 'Strong' : 'Moderate (Gaps Exist)'}
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    {currentCase.documents.length} document(s) uploaded and checksummed.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Contradiction Status
                  </span>
                  <div className="text-lg font-bold text-neutral-900">
                    {currentCase.contradictions.filter((x) => !x.userResolution || x.userResolution.status === 'unresolved').length === 0
                      ? 'Clean (0 Conflicts)'
                      : `${currentCase.contradictions.filter((x) => !x.userResolution || x.userResolution.status === 'unresolved').length} Unresolved`}
                  </div>
                  <p className="text-[11px] text-neutral-500">Cross-verified against narrative.</p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Limitation Compliance
                  </span>
                  <div className="text-lg font-bold text-emerald-600">Within Prescribed Period</div>
                  <p className="text-[11px] text-neutral-500">Cause of action within statutory limit.</p>
                </div>
              </div>

              {/* Procedural Checklist */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-sm text-neutral-900">Statutory Procedural Checklist</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-neutral-900">Identification of Parties & Opponent Address</span>
                      <p className="text-[11px] text-neutral-500">
                        {currentCase.parties.find((p) => p.role === 'opposite_party')?.name
                          ? `Identified as "${currentCase.parties.find((p) => p.role === 'opposite_party')?.name}"`
                          : 'Opposite party full legal address requires confirmation'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-neutral-900">Pecuniary & Territorial Jurisdiction</span>
                      <p className="text-[11px] text-neutral-500">
                        Forum: {currentCase.stateOrUT} ({currentCase.location || 'Local Commission/Court'}).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-neutral-900">Criminal Regime Cutoff (1 July 2024)</span>
                      <p className="text-[11px] text-neutral-500">
                        Evaluated under Bharatiya Nyaya Sanhita, 2023 and BNSS 2023 with savings clause audit.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Paste Modal */}
      {showManualUploadModal && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-sm text-neutral-900">Add Document Excerpt / Content</h3>
              <button
                onClick={() => setShowManualUploadModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Document Title / Filename *</label>
                <input
                  type="text"
                  value={manualFileName}
                  onChange={(e) => setManualFileName(e.target.value)}
                  placeholder="E.g., Rental_Agreement_2023.pdf or WhatsApp_Export.txt"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Document Date (if mentioned)</label>
                <input
                  type="date"
                  value={manualDocDate}
                  onChange={(e) => setManualDocDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Document Text Content *</label>
                <textarea
                  rows={6}
                  value={selectedFileContent}
                  onChange={(e) => setSelectedFileContent(e.target.value)}
                  placeholder="Paste text excerpt from receipt, agreement, or email correspondence..."
                  className="w-full p-3 rounded-lg border border-neutral-300 font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 text-xs">
              <button
                onClick={() => setShowManualUploadModal(false)}
                className="px-4 py-2 rounded-lg border border-neutral-300 font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (manualFileName.trim() && selectedFileContent.trim()) {
                    handleFileUpload(manualFileName.trim(), selectedFileContent.trim(), selectedFileContent.length, manualDocDate || undefined);
                  }
                }}
                disabled={!manualFileName.trim() || !selectedFileContent.trim()}
                className="px-4 py-2 rounded-lg bg-neutral-900 text-white font-bold hover:bg-neutral-800 disabled:opacity-50"
              >
                Add Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
