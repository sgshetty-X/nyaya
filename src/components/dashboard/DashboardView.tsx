import React from 'react';
import { BookOpen, FolderOpen, ArrowRight, ShieldCheck, Clock, FileText, AlertCircle, Sparkles, ChevronRight, Phone } from 'lucide-react';
import { CaseRecord } from '../../types/legal';
import { AppView } from '../layout/Navbar';

interface DashboardViewProps {
  cases: CaseRecord[];
  onNavigate: (view: AppView) => void;
  onSelectCase: (caseId: string, view: 'know-your-case' | 'manage-your-case') => void;
  onLoadDemoCase: (caseId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cases,
  onNavigate,
  onSelectCase,
  onLoadDemoCase,
}) => {
  const recentCases = cases.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero / Main Greeting */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Indian Legal Intelligence & Drafting Platform</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 font-sans">
          How can we help you today?
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 font-normal">
          Understand your legal situation or review the documents you already have.
        </p>
      </div>

      {/* The Two Primary Cards — STRICT REQUIREMENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Primary Card: KNOW YOUR CASE */}
        <button
          onClick={() => onNavigate('know-your-case')}
          className="group relative bg-white rounded-2xl p-8 border-2 border-blue-600/30 hover:border-blue-600 hover:shadow-xl transition-all duration-200 text-left flex flex-col justify-between overflow-hidden cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 group-hover:scale-105 transition-transform"></div>
          <div className="relative z-10 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:bg-blue-700 transition">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Primary Action A</span>
              <h2 className="text-2xl font-bold text-neutral-900 mt-1">Know Your Case</h2>
              <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                Explain what happened, understand the law, and prepare a legal document.
              </p>
            </div>
            <ul className="text-xs text-neutral-500 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Plain-English incident description without legal jargon
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                BNS 2023 vs IPC 1860 statutory applicability analysis
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Adaptive 20-question fact-clarification engine
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Generate police complaint, legal notice, or consumer plaint
              </li>
            </ul>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
            <span>Start Case Intake</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        {/* Secondary Card: MANAGE YOUR CASE */}
        <button
          onClick={() => onNavigate('manage-your-case')}
          className="group relative bg-white rounded-2xl p-8 border-2 border-neutral-300 hover:border-neutral-900 hover:shadow-xl transition-all duration-200 text-left flex flex-col justify-between overflow-hidden cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-neutral-100 rounded-bl-full -z-0 group-hover:scale-105 transition-transform"></div>
          <div className="relative z-10 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-md group-hover:bg-neutral-800 transition">
              <FolderOpen className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Primary Action B</span>
              <h2 className="text-2xl font-bold text-neutral-900 mt-1">Manage Your Case</h2>
              <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                Review your documents, find inconsistencies, and organise your evidence.
              </p>
            </div>
            <ul className="text-xs text-neutral-500 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900"></span>
                Secure PDF, DOCX, image, and scan text extraction with SHA-256
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900"></span>
                Detect conflicting dates, amounts, and contradictory statements
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900"></span>
                Consolidated event chronology & statutory limitation checks
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900"></span>
                Missing evidence inventory & preservation checklist
              </li>
            </ul>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-neutral-900 font-semibold text-sm group-hover:translate-x-1 transition-transform">
            <span>Open Case Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Emergency & Official Legal Aid Bar */}
      <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-50 to-neutral-50 rounded-xl p-5 border border-blue-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-left">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-900">Need Immediate Government Legal Aid?</h4>
            <p className="text-xs text-neutral-600">
              National Legal Services Authority provides free advocate appointment under Section 12 of LSA Act 1987.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:15100"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1.5"
          >
            <span>Dial 15100</span>
          </a>
          <button
            onClick={() => onNavigate('legal-aid')}
            className="px-4 py-2 rounded-lg bg-white border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition"
          >
            View Directory
          </button>
        </div>
      </div>

      {/* Recent Cases Section */}
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-900">Recent Cases & Workspaces</h3>
          <button
            onClick={() => onNavigate('saved-cases')}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>View All ({cases.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentCases.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-neutral-200 text-center space-y-3">
            <FileText className="w-10 h-10 text-neutral-300 mx-auto" />
            <p className="text-neutral-600 font-medium text-sm">No cases saved yet.</p>
            <p className="text-neutral-400 text-xs">
              Start by selecting "Know Your Case" or load one of the synthetic demonstration cases below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentCases.map((c) => {
              const pendingQuestions = c.questions.filter((q) => !q.answer).length;
              const hasContradictions = c.contradictions.filter((x) => !x.userResolution || x.userResolution.status === 'unresolved').length;

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-xl p-5 border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-700 uppercase tracking-wider">
                        {c.categories[0] || 'General'}
                      </span>
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(c.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-neutral-900 line-clamp-1">{c.title}</h4>
                    <p className="text-xs text-neutral-500 line-clamp-2">{c.description}</p>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-neutral-500">
                      <span>{c.documents.length} docs</span>
                      <span>•</span>
                      {pendingQuestions > 0 ? (
                        <span className="text-amber-600 font-medium">{pendingQuestions} questions left</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">Assessed</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectCase(c.id, 'know-your-case')}
                        className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        Intake
                      </button>
                      <button
                        onClick={() => onSelectCase(c.id, 'manage-your-case')}
                        className="px-2.5 py-1 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded transition"
                      >
                        Workspace
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Synthetic Demonstration Cases Exploration */}
      <div className="max-w-5xl mx-auto bg-neutral-100/70 rounded-2xl p-6 border border-neutral-200 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <span>Explore Pre-Seeded Indian Legal Scenarios (Synthetic Data)</span>
            <span className="px-2 py-0.5 rounded bg-neutral-200 text-[10px] uppercase font-semibold text-neutral-600">
              Demo Ready
            </span>
          </h4>
          <p className="text-xs text-neutral-500 mt-1">
            Load sample cases with complete pre-filled documents, timelines, contradiction findings, and statutory citations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => onLoadDemoCase('case_consumer_laptop_001')}
            className="p-3 bg-white rounded-xl border border-neutral-200 hover:border-blue-500 hover:shadow-sm text-left transition space-y-1.5 cursor-pointer"
          >
            <div className="text-[11px] font-bold text-blue-600">Consumer Dispute</div>
            <div className="text-xs font-bold text-neutral-900 line-clamp-1">Defective Laptop & Warranty</div>
            <div className="text-[11px] text-neutral-500">CPA 2019 • ₹84,999 • Bengaluru</div>
          </button>

          <button
            onClick={() => onLoadDemoCase('case_tenancy_deposit_002')}
            className="p-3 bg-white rounded-xl border border-neutral-200 hover:border-blue-500 hover:shadow-sm text-left transition space-y-1.5 cursor-pointer"
          >
            <div className="text-[11px] font-bold text-emerald-600">Tenancy Deposit</div>
            <div className="text-xs font-bold text-neutral-900 line-clamp-1">₹1,20,000 Deposit Withheld</div>
            <div className="text-[11px] text-neutral-500">TPA Sec 108 • Koramangala</div>
          </button>

          <button
            onClick={() => onLoadDemoCase('case_unpaid_invoice_003')}
            className="p-3 bg-white rounded-xl border border-neutral-200 hover:border-blue-500 hover:shadow-sm text-left transition space-y-1.5 cursor-pointer"
          >
            <div className="text-[11px] font-bold text-purple-600">Contract & Dispute</div>
            <div className="text-xs font-bold text-neutral-900 line-clamp-1">Unpaid Invoice & Delivery Conflict</div>
            <div className="text-[11px] text-neutral-500">Contradiction Finding • Mumbai</div>
          </button>

          <button
            onClick={() => onLoadDemoCase('case_cyber_upi_004')}
            className="p-3 bg-white rounded-xl border border-neutral-200 hover:border-blue-500 hover:shadow-sm text-left transition space-y-1.5 cursor-pointer"
          >
            <div className="text-[11px] font-bold text-red-600">Cyber Crime & BNS</div>
            <div className="text-xs font-bold text-neutral-900 line-clamp-1">UPI Impersonation Fraud</div>
            <div className="text-[11px] text-neutral-500">BNS 318(4) • IT Act • New Delhi</div>
          </button>
        </div>
      </div>
    </div>
  );
};
