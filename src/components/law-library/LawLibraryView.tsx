import React, { useState } from 'react';
import { Library, Search, ExternalLink, Calendar, Scale, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { KNOWN_INDIAN_STATUTES, determineCriminalStatuteRegime } from '../../lib/logic/legalSources';

export const LawLibraryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [testDate, setTestDate] = useState('2024-08-15');

  const statutesList = Object.values(KNOWN_INDIAN_STATUTES);

  const filteredStatutes = statutesList.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.statute.toLowerCase().includes(q) ||
      s.shortName.toLowerCase().includes(q) ||
      s.jurisdiction.toLowerCase().includes(q)
    );
  });

  const transitionEvaluation = determineCriminalStatuteRegime(testDate);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            <Library className="w-5 h-5" />
          </span>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Authoritative Statutory Reference
          </span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mt-1">Indian Statutes & Law Library</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Verified central statutes, transitional criminal jurisprudence, and official India Code links.
        </p>
      </div>

      {/* Interactive Criminal Law Transition Checker (1 July 2024 Cutoff) */}
      <div className="bg-gradient-to-r from-blue-50 to-neutral-50 rounded-2xl p-6 border border-blue-200 space-y-4 shadow-xs">
        <div className="space-y-1">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Interactive Statutory Checker</span>
          <h2 className="text-lg font-bold text-neutral-900">
            Criminal Law Transition: BNS 2023 vs IPC 1860
          </h2>
          <p className="text-xs text-neutral-600 max-w-2xl leading-relaxed">
            On 1 July 2024, the new criminal laws came into effect. Under Article 20(1) of the Constitution of India (protection against ex-post facto laws), substantive criminal offences are governed strictly by the law in force at the time of the commission of the act.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
          <label htmlFor="test-date" className="text-xs font-bold text-neutral-800 whitespace-nowrap">
            Select Date of Alleged Incident:
          </label>
          <input
            id="test-date"
            type="date"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-neutral-300 text-xs bg-white font-mono"
          />
        </div>

        <div className="p-4 rounded-xl bg-white border border-neutral-200 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-800">Applicable Substantive Regime:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                transitionEvaluation.regime === 'BNS_2023'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {transitionEvaluation.regime === 'BNS_2023'
                ? 'Bharatiya Nyaya Sanhita, 2023 (BNS)'
                : 'Indian Penal Code, 1860 (IPC)'}
            </span>
          </div>
          <p className="text-neutral-700 leading-relaxed">{transitionEvaluation.rationale}</p>
          <div className="text-[11px] text-neutral-500 pt-1 border-t border-neutral-100 flex flex-wrap gap-4">
            <span><strong>Procedure:</strong> BNSS 2023 applies to all investigations/filings from 01-07-2024</span>
            <span><strong>Evidence:</strong> BSA 2023 governs admissibility</span>
          </div>
        </div>
      </div>

      {/* Statutes Search */}
      <div className="bg-white rounded-xl p-4 border border-neutral-200 flex gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Indian statutes by title or code abbreviation..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 text-xs"
          />
        </div>
      </div>

      {/* Statutes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStatutes.map((st) => (
          <div
            key={st.shortName}
            className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-neutral-300 transition space-y-4 shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-700 uppercase font-mono">
                  {st.shortName}
                </span>
                <span className="text-[11px] text-neutral-400">Commenced: {st.commencementDate}</span>
              </div>

              <h3 className="font-bold text-base text-neutral-900 leading-snug">{st.statute}</h3>
              <p className="text-xs text-neutral-500">
                <strong>Jurisdiction:</strong> {st.jurisdiction}
              </p>
              {st.repealsOrSucceeds && (
                <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-100">
                  <strong>Successor Relationship:</strong> Succeeds / repeals {st.repealsOrSucceeds}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-neutral-500">Authority: {st.sourceAuthority}</span>
              <a
                href={st.officialSourceUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-800 font-semibold flex items-center gap-1 transition"
              >
                <span>India Code Link</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
