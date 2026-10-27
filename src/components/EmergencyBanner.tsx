import React, { useState } from 'react';
import { AlertCircle, PhoneCall, X } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (dismissed) {
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-xs text-amber-900 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-800">Safety Notice:</span>
          <span>MediShare is a community coordination platform, not an emergency medical service.</span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="text-amber-800 underline hover:text-amber-950 font-medium cursor-pointer"
        >
          Emergency Helplines
        </button>
      </div>
    );
  }

  return (
    <>
      <aside aria-label="Emergency Medical Disclaimer" className="bg-rose-900 text-rose-50 text-xs px-4 py-2 border-b border-rose-950">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" aria-hidden="true" />
            <p className="leading-snug">
              <strong className="font-semibold text-white">For Acute Medical Emergencies:</strong> MediShare does not provide emergency dispatch. If in immediate danger, dial{' '}
              <span className="font-bold underline text-rose-200">112</span> (National Emergency) or{' '}
              <span className="font-bold underline text-rose-200">108</span> (Ambulance).
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowModal(true)}
              className="px-2.5 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Emergency Directory
            </button>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss banner"
              className="text-rose-300 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Emergency Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-display font-semibold text-lg text-slate-900">Immediate Medical Aid Contacts</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                MediShare connects communities with equipment, blood donor registries, and verified non-diagnostic assistance. For acute resuscitation, severe trauma, or cardiac crises, contact public emergency services immediately:
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg">
                  <div className="text-xs text-rose-600 font-medium">National Emergency</div>
                  <div className="text-xl font-bold font-display text-rose-900 tabular-nums">112</div>
                  <div className="text-[11px] text-rose-700">All-in-one Emergency</div>
                </div>
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <div className="text-xs text-red-600 font-medium">Medical Ambulance</div>
                  <div className="text-xl font-bold font-display text-red-900 tabular-nums">108 / 102</div>
                  <div className="text-[11px] text-red-700">Immediate Ambulance</div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="text-xs text-blue-600 font-medium">National Blood Bank</div>
                  <div className="text-xl font-bold font-display text-blue-900 tabular-nums">104</div>
                  <div className="text-[11px] text-blue-700">Blood Helpline / e-RaktKosh</div>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <div className="text-xs text-emerald-600 font-medium">Poison Information</div>
                  <div className="text-xl font-bold font-display text-emerald-900 tabular-nums">1800 116 117</div>
                  <div className="text-[11px] text-emerald-700">AIIMS National Center</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200 mt-2">
                <span className="font-semibold text-slate-800">Important Safety Guarantee:</span> MediShare strictly forbids the transfer or resale of prescription medicines. All equipment handovers require physical sanitation inspection.
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close & Continue to MediShare
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
