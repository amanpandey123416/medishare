import React from 'react';
import { useApp } from '../context/AppContext';
import {
  HeartHandshake,
  Search,
  PackagePlus,
  Droplet,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  Building2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  QrCode,
  Recycle,
  Pill,
  PlusCircle
} from 'lucide-react';
import { AnalyticsCharts } from '../components/AnalyticsCharts';

export const HomeView: React.FC = () => {
  const { setActiveTab, equipment, bloodDonors, organizations, setCurrentRole } = useApp();

  const featuredEquipment = equipment.slice(0, 4);
  const availableDonors = bloodDonors.filter((b) => b.availability === 'Available to Donate').slice(0, 4);

  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-teal-50/60 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col (Text) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100/70 border border-teal-200/80 rounded-full text-xs font-semibold text-teal-800">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                <span>BTech CSE Social-Impact Mini Project</span>
                <span className="text-teal-400">·</span>
                <span className="font-normal text-teal-700">Open Access Demo</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-slate-900 leading-[1.15] text-balance">
                Healthcare Resources Should Reach Those Who Need Them.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                MediShare connects communities with medical resources, eligible blood donors, equipment assistance, and verified healthcare organisations.
              </p>

              {/* 3 Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('requests')}
                  className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Medical Help</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentRole('donor');
                    setActiveTab('equipment');
                  }}
                  className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2"
                >
                  <PackagePlus className="w-4 h-4" />
                  <span>Donate Medical Equipment</span>
                </button>

                <button
                  onClick={() => setActiveTab('blood-donors')}
                  className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Droplet className="w-4 h-4 text-rose-600" />
                  <span>Find Blood Donors</span>
                </button>
              </div>

              {/* Key Trust Signals */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-4 text-xs text-slate-600">
                <div>
                  <div className="font-bold text-slate-900 font-display text-sm tabular-nums">100% Non-Commercial</div>
                  <div className="text-[11px] text-slate-500">Free community sharing</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 font-display text-sm tabular-nums">QR Handover Proof</div>
                  <div className="text-[11px] text-slate-500">Tamper-evident log</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 font-display text-sm tabular-nums">Safety Compliant</div>
                  <div className="text-[11px] text-slate-500">No drug resale allowed</div>
                </div>
              </div>
            </div>

            {/* Right Col: Interactive Visual Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-xs text-slate-800">
                        Live Community Coordination
                      </h3>
                      <p className="text-[11px] text-slate-400">Real-time mock resource feed</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded-full">
                    Active Demo
                  </span>
                </div>

                {/* Micro preview cards */}
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <span>Wheelchair Lending</span>
                        <span>·</span>
                        <span>Bengaluru</span>
                      </div>
                      <div className="font-semibold text-slate-800">Karma Lightweight Folding Wheelchair</div>
                      <div className="text-[11px] text-emerald-700 font-medium">Sanitized & Inspected · Free Loan</div>
                    </div>
                    <button
                      onClick={() => setActiveTab('equipment')}
                      className="px-2.5 py-1 bg-teal-600 text-white rounded text-[11px] font-medium hover:bg-teal-700 cursor-pointer shrink-0"
                    >
                      Reserve
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <span>Blood Donor Registry</span>
                        <span>·</span>
                        <span>Mumbai</span>
                      </div>
                      <div className="font-semibold text-slate-800">Group O- Voluntary Standby Donor</div>
                      <div className="text-[11px] text-rose-700 font-medium">Opted-in Volunteer · 8 Prior Donations</div>
                    </div>
                    <button
                      onClick={() => setActiveTab('blood-donors')}
                      className="px-2.5 py-1 bg-rose-600 text-white rounded text-[11px] font-medium hover:bg-rose-700 cursor-pointer shrink-0"
                    >
                      Connect
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <span>Safe Disposal Kiosk</span>
                        <span>·</span>
                        <span>Indiranagar</span>
                      </div>
                      <div className="font-semibold text-slate-800">Apollo 24/7 Authorized Take-Back Drop Box</div>
                      <div className="text-[11px] text-amber-700 font-medium">Licensed Pharmaceutical Incineration</div>
                    </div>
                    <button
                      onClick={() => setActiveTab('safe-medicine')}
                      className="px-2.5 py-1 border border-slate-300 text-slate-700 rounded text-[11px] font-medium hover:bg-slate-100 cursor-pointer shrink-0"
                    >
                      Guide
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('facilities')}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span>Explore Verified Map of 8 Facilities</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How MediShare Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
            How MediShare Works
          </h2>
          <p className="text-sm text-slate-600">
            A transparent 4-stage lifecycle ensuring medical hardware reaches families quickly, hygienically, and safely.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm font-display">
              01
            </div>
            <h3 className="font-display font-semibold text-slate-900 text-sm">
              Discover or Request
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Patients and caregivers search available equipment by city and category, or post a non-diagnostic medical assistance request.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm font-display">
              02
            </div>
            <h3 className="font-display font-semibold text-slate-900 text-sm">
              Smart Rule Matching
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our automated engine matches requests with nearby inventory by urgency, service locality, and sanitation inspection status.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm font-display">
              03
            </div>
            <h3 className="font-display font-semibold text-slate-900 text-sm">
              QR Handover Verification
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Unique encrypted QR codes verify custody during collection at donor homes or verified NGO lending depots.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm font-display">
              04
            </div>
            <h3 className="font-display font-semibold text-slate-900 text-sm">
              Sanitization & Return
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Loaned equipment is returned, disinfected according to guidelines, and made available again for the next patient.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Available Medical Equipment Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
              Available Medical Equipment
            </h2>
            <p className="text-xs text-slate-600">
              Sanitized wheelchairs, hospital beds, and mobility hardware ready for immediate lending or donation.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('equipment')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View All {equipment.length} Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredEquipment.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{item.category}</span>
                  <span className="font-semibold text-teal-700">{item.type}</span>
                </div>

                <h3 className="font-display font-semibold text-slate-900 text-sm leading-snug">
                  {item.name}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {item.description}
                </p>

                <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{item.city} · {item.serviceArea}</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-700 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{item.cleaningStatus}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {item.maxLendingDays ? `Up to ${item.maxLendingDays} days` : 'Permanent Gift'}
                </span>
                <button
                  onClick={() => setActiveTab('equipment')}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Request
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Blood Donation Awareness & Standby Registry */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-rose-200 rounded-full text-xs font-semibold text-rose-700">
                <Droplet className="w-3.5 h-3.5 text-rose-600" />
                <span>Voluntary Blood Donor Network</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight text-balance">
                Every Blood Donation Can Save Up to Three Lives.
              </h2>

              <p className="text-sm text-slate-700 leading-relaxed">
                MediShare provides a private, opt-in volunteer donor discovery registry. Connect with willing donors in your city for scheduled medical procedures and blood bank standby replacements.
              </p>

              <div className="p-3.5 bg-white/90 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Clinical Safety & Compatibility Notice</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-700">
                  Blood donor profiles are informational only. Donation eligibility, infectious disease testing, and clinical compatibility cross-matching must be performed by a qualified blood bank or licensed hospital transfusion service.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('blood-donors')}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Search Blood Donors ({bloodDonors.length} Registered)
                </button>
                <button
                  onClick={() => {
                    setCurrentRole('donor');
                    setActiveTab('blood-donors');
                  }}
                  className="px-4 py-2.5 bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Opt In as a Volunteer Donor
                </button>
              </div>
            </div>

            {/* Donor Micro Roster */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-rose-100 shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                <span className="font-semibold text-slate-800">Recently Opted-in Donors</span>
                <span className="text-[11px] text-slate-400">Consent Verified</span>
              </div>

              <div className="space-y-2.5">
                {availableDonors.map((donor) => (
                  <div
                    key={donor.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 font-bold font-display flex items-center justify-center tabular-nums">
                        {donor.bloodGroup}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{donor.displayName}</div>
                        <div className="text-[11px] text-slate-500">{donor.city} · {donor.serviceArea}</div>
                      </div>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                      Available
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Leftover Medicine Sharing System (Supervised Healthcare Channel) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-800/80 border border-teal-600/50 rounded-full text-xs font-semibold text-teal-200">
                <Pill className="w-3.5 h-3.5 text-teal-300" />
                <span>Supervised Medicine Sharing Module</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-balance">
                Donate Sealed Leftover Medicines. Verified by Licensed Pharmacists.
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                MediShare's Leftover Medicine Sharing System allows users to donate unexpired, sealed medicines. All listings undergo automated safety verification, physical pharmacist inspection, and are distributed exclusively through authorized healthcare organisations upon valid prescription check.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('medicines')}
                  className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-xl text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Medicines Directory</span>
                </button>

                <button
                  onClick={() => setActiveTab('medicines')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4 text-teal-400" />
                  <span>Donate Leftover Medicines</span>
                </button>

                <button
                  onClick={() => setActiveTab('safe-medicine')}
                  className="px-4 py-2.5 bg-transparent hover:bg-slate-800/60 text-slate-300 border border-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Recycle className="w-4 h-4 text-amber-400" />
                  <span>Expired Medicine Disposal</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 bg-slate-800/90 rounded-2xl p-5 border border-slate-700 space-y-3 text-xs">
              <div className="font-semibold text-teal-300 text-xs flex items-center gap-1.5 pb-2 border-b border-slate-700">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>3-Tier Clinical Safety Safeguards</span>
              </div>

              <div className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Auto-Screening:</strong> Flags expired, recalled, or opened packages instantly.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Authorised Intake:</strong> Inspection performed by DARPAN-vetted NGOs & pharmacies.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Rx Verification:</strong> Physical doctor prescription required at collection desk.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Safe Medicine Disposal Education */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/90 rounded-full text-xs font-semibold text-amber-900">
                <Recycle className="w-3.5 h-3.5 text-amber-700" />
                <span>Zero Drug Resale Protocol</span>
              </div>
              <h2 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
                Safe Medicine Take-Back & Disposal Guidance
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                To prevent antimicrobial resistance, toxic water contamination, and accidental poisoning, MediShare does not permit peer-to-peer redistribution of prescription pharmaceuticals. We direct citizens to authorized take-back kiosks and incineration drop boxes.
              </p>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <button
                onClick={() => setActiveTab('safe-medicine')}
                className="px-5 py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>Read Safe Disposal Guide</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Community Impact & Analytics (Chart.js) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
            Community Impact & Platform Velocity
          </h2>
          <p className="text-sm text-slate-600">
            Real-time analytics displaying equipment circulation, handover verification rates, and assistance case fulfillment.
          </p>
        </div>

        <AnalyticsCharts />
      </section>

      {/* 7. Verified Partner Organisations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <h2 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
            Verified Healthcare Organisations & NGOs
          </h2>
          <p className="text-xs text-slate-600">
            Charitable trusts and healthcare volunteers vetted via DARPAN registration records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {organizations.slice(0, 3).map((org) => (
            <div
              key={org.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                {org.verified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    Under Review
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-display font-semibold text-slate-900 text-sm">{org.name}</h4>
                <div className="text-xs text-slate-500">{org.city} · {org.type}</div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2">
                {org.description}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{org.activeEquipmentCount} Active Devices</span>
                <span className="font-medium text-slate-700 tabular-nums">{org.casesCompleted} Cases Aided</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Frequently Asked Questions (FAQ) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-600">
            Answers to common questions about equipment safety, blood donor privacy, and platform rules.
          </p>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">
              Can I donate leftover prescription medicines on MediShare?
            </h4>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              <strong>No.</strong> In accordance with drug safety laws and health safety guidelines, MediShare strictly prohibits the transfer or resale of prescription medicines. We instead provide an authorized directory of licensed pharmacies and government take-back drop boxes for environmentally safe disposal.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">
              How is equipment safety and hygiene ensured?
            </h4>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Every medical equipment listing includes explicit cleaning and sanitization status records. For powered or transfer devices (such as electric hoists or patient beds), clinical supervision reminders and assembly checklists are attached. Handover confirmation via QR code records the inspection timestamp.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">
              Are blood donor contact numbers displayed publicly?
            </h4>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              <strong>No.</strong> Blood donor participation is strictly opt-in. Contact details are never publicly broadcast to prevent spam and protect privacy; communication occurs through masked secure channels or verified hospital request routing.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">
              Does MediShare require paid API keys or subscriptions?
            </h4>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              No. MediShare is engineered as an open-access social impact prototype for a BTech CSE mini project. It operates completely without paid APIs, utilizing OpenStreetMap for geographical points, Chart.js for data visualization, and LocalStorage with Firebase readiness.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
