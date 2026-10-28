import React from 'react';
import { ShieldCheck, Phone, ExternalLink, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-16 text-neutral-600 text-xs">
      {/* Statutory Legal Disclaimer Banner */}
      <div className="bg-neutral-50 border-b border-neutral-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-start space-x-3 text-neutral-600">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-neutral-800">Legal Assistance & Non-Advocate Disclaimer</p>
            <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">
              Nyaya is an automated legal case preparation, factual structuring, and evidence management technology platform. Nyaya does not provide formal legal advice, legal opinions, or court representation. No advocate-client privilege or fiduciary relationship is created by using this service. The laws of India, including the Bharatiya Nyaya Sanhita (BNS 2023), Bharatiya Nagarik Suraksha Sanhita (BNSS 2023), and relevant civil procedural codes, require human advocate scrutiny for court filings. If you are experiencing immediate danger or domestic violence, call emergency helpline 112 or Women Helpline 181 immediately.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="font-bold text-neutral-900 text-sm flex items-center space-x-1.5">
              <span>न्याय Nyaya Platform</span>
            </div>
            <p className="mt-2 text-neutral-500 text-[11px] leading-relaxed">
              Empowering citizens across India with structured legal fact-finding, evidence verification, and official legal aid resources.
            </p>
            <div className="mt-3 flex items-center space-x-2 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[11px] font-medium">DPDP Act, 2023 Compliant</span>
            </div>
          </div>

          <div>
            <p className="font-semibold text-neutral-800 uppercase tracking-wider text-[11px]">Primary Portals</p>
            <ul className="mt-2 space-y-1.5 text-neutral-500">
              <li>
                <a href="#know-your-case" className="hover:text-blue-600">Know Your Case Intake</a>
              </li>
              <li>
                <a href="#manage-your-case" className="hover:text-blue-600">Manage Your Case Workspace</a>
              </li>
              <li>
                <a href="#law-library" className="hover:text-blue-600">Indian Statutes & BNS/IPC Transition</a>
              </li>
              <li>
                <a href="#legal-aid" className="hover:text-blue-600">NALSA / SLSA Directory</a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-neutral-800 uppercase tracking-wider text-[11px]">Emergency & Help</p>
            <ul className="mt-2 space-y-1.5 text-neutral-500">
              <li className="flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                <span>NALSA Legal Aid: <strong className="text-neutral-800">15100</strong></span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                <span>Cyber Crime: <strong className="text-neutral-800">1930</strong></span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                <span>Police Emergency: <strong className="text-neutral-800">112</strong></span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                <span>Women in Distress: <strong className="text-neutral-800">181</strong></span>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-neutral-800 uppercase tracking-wider text-[11px]">Official Indian Portals</p>
            <ul className="mt-2 space-y-1.5 text-neutral-500">
              <li>
                <a href="https://www.indiacode.nic.in" target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 hover:text-blue-600">
                  <span>India Code (Govt. of India)</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </a>
              </li>
              <li>
                <a href="https://ecourts.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 hover:text-blue-600">
                  <span>eCourts Services Portal</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </a>
              </li>
              <li>
                <a href="https://nalsa.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 hover:text-blue-600">
                  <span>NALSA Official Portal</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </a>
              </li>
              <li>
                <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 hover:text-blue-600">
                  <span>National Cyber Crime Portal</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-center text-neutral-400 gap-2">
          <p>© {new Date().getFullYear()} Nyaya — Dedicated to accessible legal intelligence in India.</p>
          <div className="flex space-x-4">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
