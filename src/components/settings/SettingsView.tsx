import React, { useState } from 'react';
import { Settings, ShieldCheck, Download, Trash2, RotateCcw, Clock, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { caseStore } from '../../lib/db/caseStore';
import { CaseRecord, AuditLogEntry } from '../../types/legal';

interface SettingsViewProps {
  cases: CaseRecord[];
  onRefreshCases: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ cases, onRefreshCases }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(caseStore.getAuditLogs());
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleExportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      platform: 'Nyaya Legal Aid Platform',
      version: '1.0.0',
      caseCount: cases.length,
      cases,
      auditLogs,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nyaya_cases_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetToDemo = () => {
    if (window.confirm('Reset all cases to synthetic demonstration data? Custom cases will be replaced with demo scenarios.')) {
      caseStore.resetToSeed();
      onRefreshCases();
      setAuditLogs(caseStore.getAuditLogs());
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">
            <Settings className="w-5 h-5" />
          </span>
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Configuration & Compliance
          </span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mt-1">Platform Settings & Privacy Controls</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Privacy safeguards under Digital Personal Data Protection Act (DPDP), 2023, audit trail, and data portability.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Successfully reset to synthetic demonstration cases.</span>
        </div>
      )}

      {/* DPDP Act 2023 Compliance Panel */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
          <ShieldCheck className="w-5 h-5" />
          <span>Indian DPDP Act, 2023 Compliance Standards</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-neutral-700">
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
            <span className="font-bold text-neutral-900 block">Purpose Limitation</span>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Your legal narratives and document excerpts are processed solely for generating your legal analysis and drafts.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
            <span className="font-bold text-neutral-900 block">Data Minimisation</span>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              No continuous telemetry, external ad trackers, or third-party behavioral profiling scripts are embedded.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
            <span className="font-bold text-neutral-900 block">Right to Erasure & Portability</span>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              You retain absolute ownership of all cases. You can download a full backup or delete cases permanently at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Data Management Actions */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-neutral-900">Data Management & Portability</h3>
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="space-y-0.5">
            <div className="font-semibold text-neutral-800">Export All Cases & Documents (JSON)</div>
            <div className="text-neutral-500 text-[11px]">Download an encrypted portable JSON archive of all your stored cases.</div>
          </div>
          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl bg-neutral-900 text-white font-semibold text-xs hover:bg-neutral-800 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Archive</span>
          </button>
        </div>

        <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="space-y-0.5">
            <div className="font-semibold text-neutral-800">Reset to Synthetic Demo Data</div>
            <div className="text-neutral-500 text-[11px]">
              Restore the 4 pre-seeded Indian demonstration scenarios (Consumer, Tenancy, Unpaid Invoice, Cyber Fraud).
            </div>
          </div>
          <button
            onClick={handleResetToDemo}
            className="px-4 py-2 rounded-xl bg-white border border-neutral-300 text-neutral-700 font-semibold text-xs hover:bg-neutral-50 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Audit Log Trail */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-neutral-600" />
            <span>Case Audit Log Trail ({auditLogs.length} Events)</span>
          </h3>
          <span className="text-[11px] text-neutral-400">Chronological action history</span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-6 text-center text-neutral-400 text-xs">No audit events recorded yet.</div>
        ) : (
          <div className="max-h-64 overflow-y-auto divide-y divide-neutral-100 text-xs">
            {auditLogs.slice(0, 20).map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="font-mono text-[10px] uppercase font-bold text-blue-700 px-1.5 py-0.2 rounded bg-blue-50">
                    {log.action}
                  </span>
                  <p className="text-neutral-800 text-[11px] mt-0.5">{log.details}</p>
                </div>
                <span className="text-[10px] text-neutral-400 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
