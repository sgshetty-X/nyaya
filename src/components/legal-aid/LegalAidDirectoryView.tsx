import React, { useState } from 'react';
import { LifeBuoy, Search, Phone, ExternalLink, MapPin, Mail, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { searchLegalAid } from '../../lib/logic/legalAidDirectory';
import { INDIAN_STATES_AND_UTS } from './statesData';

export const LegalAidDirectoryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All India');
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);

  const results = searchLegalAid(searchQuery, selectedState);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              <LifeBuoy className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Statutory Legal Services Authorities
            </span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mt-1">Official Legal Aid Directory (India)</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Verified contact details for NALSA, State Legal Services Authorities (SLSAs), and Tele-Law.
          </p>
        </div>

        <button
          onClick={() => setShowEligibilityModal(true)}
          className="px-4 py-2 rounded-xl bg-neutral-900 text-white font-semibold text-xs hover:bg-neutral-800 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Who is Eligible for Free Legal Aid?</span>
        </button>
      </div>

      {/* Emergency Callout */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-200">24x7 Nationwide Toll-Free</div>
          <div className="text-2xl font-extrabold tracking-tight">National Legal Aid Helpline: 15100</div>
          <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
            Administered by the National Legal Services Authority (NALSA) for immediate legal advice, advocate assignment, and information on pending Lok Adalats.
          </p>
        </div>

        <a
          href="tel:15100"
          className="px-5 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition shadow-xs flex items-center gap-2 shrink-0"
        >
          <Phone className="w-4 h-4" />
          <span>Call 15100 Toll-Free</span>
        </a>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-neutral-200 flex flex-col sm:flex-row gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by state, authority name, or services offered..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-neutral-600 whitespace-nowrap">State / UT:</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-2 rounded-lg border border-neutral-300 text-xs bg-white max-w-xs"
          >
            {INDIAN_STATES_AND_UTS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((res) => (
          <div
            key={res.id}
            className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-neutral-300 transition space-y-4 shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-700 uppercase">
                  {res.type} authority
                </span>
                <span className="text-[11px] text-neutral-400">Jurisdiction: {res.stateOrUT}</span>
              </div>

              <h3 className="font-bold text-base text-neutral-900 leading-snug">{res.name}</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">{res.serviceDescription}</p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-neutral-100 text-xs text-neutral-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <span className="text-[11px]">{res.address}</span>
              </div>

              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <a href={`tel:${res.helpline}`} className="hover:underline">
                    Helpline: {res.helpline}
                  </a>
                </div>

                {res.contactPhone && (
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <span className="text-[11px]">Office: {res.contactPhone}</span>
                  </div>
                )}
              </div>

              {res.email && (
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{res.email}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
              <span className="text-[10px] text-neutral-400">Verified: {res.lastVerifiedDate}</span>
              <a
                href={res.website}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-800 font-semibold flex items-center gap-1 transition"
              >
                <span>Visit Official Portal</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Section 12 Eligibility Modal */}
      {showEligibilityModal && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Eligibility Criteria under Section 12 of LSA Act, 1987</span>
              </h3>
              <button
                onClick={() => setShowEligibilityModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 leading-relaxed text-neutral-700">
              <p>
                Every person who has to file or defend a case is entitled to free legal services under Section 12 of the Legal Services Authorities Act, 1987 if they fall into any of the following categories:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-800">
                <li>
                  <strong>Women and Children:</strong> Automatically eligible without any income threshold.
                </li>
                <li>
                  <strong>Scheduled Castes (SC) or Scheduled Tribes (ST):</strong> Automatically eligible.
                </li>
                <li>
                  <strong>Persons with Disabilities:</strong> Physical disabilities or persons with mental illness.
                </li>
                <li>
                  <strong>Victims of Human Trafficking or Begar:</strong> As protected under Article 23 of the Constitution.
                </li>
                <li>
                  <strong>Industrial Workmen:</strong> Any workman affected by industrial disputes.
                </li>
                <li>
                  <strong>Persons in Custody:</strong> Undertrials, prisoners, or persons detained in protective custody or psychiatric institutions.
                </li>
                <li>
                  <strong>Victims of Disasters:</strong> Mass disasters, ethnic violence, caste atrocities, floods, earthquakes, or industrial disasters.
                </li>
                <li>
                  <strong>Income Criteria:</strong> General category citizens having an annual income of less than ₹3,00,000/- (in most States) or less than ₹5,00,000/- (for Supreme Court cases).
                </li>
              </ul>

              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-blue-900 text-[11px]">
                <strong>What Free Legal Services Include:</strong> Payment of court fee, process fee, advocate fees, preparation of paper books, and representation at all stages of civil and criminal litigation.
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-neutral-100">
              <button
                onClick={() => setShowEligibilityModal(false)}
                className="px-4 py-2 rounded-lg bg-neutral-900 text-white font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
