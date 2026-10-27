import React from 'react';
import { useApp } from '../context/AppContext';
import { HeartHandshake, ShieldCheck, AlertCircle, FileText, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-display font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span>MediShare</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Share Care, Save Lives. A social-impact healthcare resource coordination initiative connecting communities with medical equipment lending, blood donor directories, and verified NGOs.
            </p>
            <div className="text-[11px] text-teal-400 font-medium">
              BTech CSE Mini Project · Academic Prototype
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">
              Core Modules
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => setActiveTab('equipment')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Medical Equipment Lending
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('medicines')}
                  className="hover:text-white transition-colors cursor-pointer text-teal-400 font-medium"
                >
                  Leftover Medicines Sharing
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('requests')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Assistance Request Hub
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('blood-donors')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Voluntary Blood Donors
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('safe-medicine')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Safe Medicine Disposal Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('supplies')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Medical Supply Coordination
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">
              Safety & Verification
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => setActiveTab('facilities')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Verified Facilities Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  DARPAN NGO Verification
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  QR Handover Chain-of-Custody
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Data Protection & Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">
              Safety Compliance
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              MediShare strictly prohibits the direct peer-to-peer sale or transfer of prescription pharmaceuticals. Expired or unneeded medications must be routed through licensed take-back drop boxes.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Offline LocalStorage Demo Active</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} MediShare. Built for BTech Computer Science & Engineering Capstone / Mini Project.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('about')} className="hover:text-white transition-colors cursor-pointer">
              Architecture & Documentation
            </button>
            <span>·</span>
            <button onClick={() => setActiveTab('about')} className="hover:text-white transition-colors cursor-pointer">
              Firebase Security Rules
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
