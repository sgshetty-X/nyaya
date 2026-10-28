import React, { useState } from 'react';
import { FileText, Search, Trash2, ArrowRight, Clock, Plus, AlertCircle, BookOpen, FolderOpen } from 'lucide-react';
import { CaseRecord } from '../../types/legal';
import { caseStore } from '../../lib/db/caseStore';
import { AppView } from '../layout/Navbar';

interface SavedCasesViewProps {
  cases: CaseRecord[];
  onSelectCase: (caseId: string, view: 'know-your-case' | 'manage-your-case') => void;
  onNavigate: (view: AppView) => void;
  onRefreshCases: () => void;
}

export const SavedCasesView: React.FC<SavedCasesViewProps> = ({
  cases,
  onSelectCase,
  onNavigate,
  onRefreshCases,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.stateOrUT.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || c.categories.includes(selectedCategory as any);

    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string) => {
    caseStore.deleteCase(id);
    setDeletingId(null);
    onRefreshCases();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Saved Cases & Workspaces</h1>
          <p className="text-xs text-neutral-500">
            All stored cases, legal drafts, and uploaded evidence registers.
          </p>
        </div>

        <button
          onClick={() => onNavigate('know-your-case')}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Case Intake</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 border border-neutral-200 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description, or jurisdiction..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-neutral-600 whitespace-nowrap">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-neutral-300 text-xs bg-white"
          >
            <option value="all">All Categories</option>
            <option value="consumer">Consumer</option>
            <option value="tenancy">Tenancy</option>
            <option value="contractual">Contractual</option>
            <option value="criminal">Criminal</option>
            <option value="cybercrime">Cybercrime</option>
            <option value="civil">Civil</option>
          </select>
        </div>
      </div>

      {/* Cases List */}
      {filteredCases.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200 space-y-3">
          <FileText className="w-12 h-12 text-neutral-300 mx-auto" />
          <h3 className="font-bold text-neutral-800 text-base">No Matching Cases Found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try adjusting your search query, or start a new case intake via "Know Your Case".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCases.map((c) => {
            const pendingQuestions = c.questions.filter((q) => !q.answer).length;
            const contraCount = c.contradictions.filter(
              (x) => !x.userResolution || x.userResolution.status === 'unresolved'
            ).length;

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-neutral-300 hover:shadow-xs transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {c.categories.map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-700 uppercase"
                        >
                          {cat}
                        </span>
                      ))}
                      <span className="text-[11px] text-neutral-400">• {c.stateOrUT}</span>
                    </div>

                    <button
                      onClick={() => setDeletingId(c.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 rounded transition"
                      title="Delete Case"
                      aria-label="Delete Case"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-neutral-900 leading-snug line-clamp-2">{c.title}</h3>
                  <p className="text-xs text-neutral-500 line-clamp-3 leading-relaxed">{c.description}</p>
                </div>

                <div className="pt-3 border-t border-neutral-100 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Updated {new Date(c.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <span>{c.documents.length} docs • {c.drafts.length} drafts</span>
                  </div>

                  {contraCount > 0 && (
                    <div className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                      ⚠️ {contraCount} unresolved contradiction finding(s)
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onSelectCase(c.id, 'know-your-case')}
                      className="flex-1 py-1.5 px-3 rounded-lg border border-neutral-300 text-neutral-700 font-semibold hover:bg-neutral-50 transition flex items-center justify-center gap-1 text-xs"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Know Your Case</span>
                    </button>

                    <button
                      onClick={() => onSelectCase(c.id, 'manage-your-case')}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition flex items-center justify-center gap-1 text-xs"
                    >
                      <FolderOpen className="w-3 h-3" />
                      <span>Manage Workspace</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Confirm Permanent Deletion</span>
            </div>
            <p className="text-neutral-600">
              Are you sure you want to delete this case? All associated questions, documents, and drafts will be permanently removed.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700"
              >
                Delete Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
