import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  Recycle,
  AlertOctagon,
  Building,
  CheckCircle2,
  MapPin,
  ExternalLink,
  Phone,
  Clock,
  Sparkles,
  HelpCircle,
  FileCheck
} from 'lucide-react';

export const SafeMedicineView: React.FC = () => {
  const { facilities, setActiveTab } = useApp();
  const [selectedCity, setSelectedCity] = useState<string>('All');

  // Filter facilities that provide safe medicine take-back disposal services
  const disposalSites = facilities.filter(
    (f) =>
      f.category === 'Authorised Medicine Disposal Site' ||
      f.services.some((s) => s.toLowerCase().includes('disposal') || s.toLowerCase().includes('take-back'))
  );

  const filteredSites = selectedCity === 'All'
    ? disposalSites
    : disposalSites.filter((f) => f.city === selectedCity);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-slate-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-semibold">
          <Recycle className="w-3.5 h-3.5 text-amber-700" />
          <span>Pharmaceutical Safety & Eco-Responsibility Protocol</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold font-display text-slate-900 tracking-tight text-balance">
          Safe Medicine Disposal & Take-Back Directory
        </h1>
        <p className="text-xs sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          MediShare strictly opposes the casual peer-to-peer redistribution of prescription pharmaceuticals. Learn why leftover medicines require professional disposal and locate licensed take-back kiosks.
        </p>
      </div>

      {/* Critical Core Policy Alert */}
      <div className="p-6 bg-rose-50 border-2 border-rose-200 rounded-3xl space-y-4">
        <div className="flex items-start gap-3">
          <AlertOctagon className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display font-bold text-rose-900 text-base sm:text-lg">
              Why MediShare Does NOT Support Peer-to-Peer Medicine Sharing
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
              Transferring opened, leftover, or expired prescription medications among unverified individuals carries acute clinical hazards:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 bg-white rounded-2xl border border-rose-100 shadow-xs space-y-1.5">
            <h4 className="font-semibold text-rose-900">1. Degradation & Storage Compromise</h4>
            <p className="text-slate-600 leading-relaxed">
              Biologics, syrups, and heat-sensitive tablets degrade rapidly when stored outside monitored 15–25°C ranges, transforming into inactive or toxic byproducts.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-rose-100 shadow-xs space-y-1.5">
            <h4 className="font-semibold text-rose-900">2. Antimicrobial Resistance (AMR)</h4>
            <p className="text-slate-600 leading-relaxed">
              Incomplete courses of shared antibiotics fuel drug-resistant superbugs, rendering essential treatments ineffective for the wider population.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-rose-100 shadow-xs space-y-1.5">
            <h4 className="font-semibold text-rose-900">3. Lethal Contraindications & Misuse</h4>
            <p className="text-slate-600 leading-relaxed">
              Prescription drugs require personalized clinical diagnosis, renal/hepatic monitoring, and allergy verification that peer platforms cannot provide.
            </p>
          </div>
        </div>
      </div>

      {/* Authorized Take-Back Program Directory */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
              Approved Medicine Take-Back & Disposal Kiosks
            </h2>
            <p className="text-xs text-slate-600">
              Drop off unneeded, expired, or discontinued pharmaceutical packaging into verified tamper-evident incinerator bins.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="All">All Cities ({disposalSites.length})</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSites.map((site) => (
            <div
              key={site.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-teal-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                    {site.category}
                  </span>
                  <h3 className="font-display font-semibold text-slate-900 text-base mt-1.5">
                    {site.name}
                  </h3>
                </div>

                {site.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <FileCheck className="w-3.5 h-3.5" />
                    Verified Facility
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{site.address}, {site.city}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{site.operatingHours}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{site.phone}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Supported Disposal Services:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {site.services.map((svc, i) => (
                    <span key={i} className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${site.coordinates[0]},${site.coordinates[1]}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Locate Drop Box</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step Safe Home Disposal Guidelines */}
      <div className="p-6 sm:p-8 bg-slate-100 rounded-3xl border border-slate-200 space-y-6">
        <div className="max-w-2xl">
          <h3 className="font-display font-bold text-slate-900 text-lg sm:text-xl">
            Step-by-Step Home Medicine Disposal Checklist
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            If you cannot immediately access an authorized take-back kiosk, follow standard pharmacological safety instructions:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-bold flex items-center justify-center font-display">
              1
            </div>
            <h4 className="font-semibold text-slate-900">Remove Personal Labels</h4>
            <p className="text-slate-600 leading-relaxed">
              Scratch out or peel off patient name, prescription numbers, and doctor names to protect privacy.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-bold flex items-center justify-center font-display">
              2
            </div>
            <h4 className="font-semibold text-slate-900">Never Flush Down Toilets</h4>
            <p className="text-slate-600 leading-relaxed">
              Flushing pharmaceuticals contaminates water supply and municipal reservoirs, poisoning aquatic life.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-bold flex items-center justify-center font-display">
              3
            </div>
            <h4 className="font-semibold text-slate-900">Mix with Coffee Grounds</h4>
            <p className="text-slate-600 leading-relaxed">
              Combine pills (do not crush) with undesirable substance like used coffee grounds or cat litter in a sealed bag.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-bold flex items-center justify-center font-display">
              4
            </div>
            <h4 className="font-semibold text-slate-900">Seal in Trash Container</h4>
            <p className="text-slate-600 leading-relaxed">
              Place the sealed bag into regular household trash to prevent children or animals from accessing it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
