import React, { useState } from 'react';
import {
  FileText,
  Code,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Server,
  Database,
  Lock,
  Cpu,
  HeartHandshake
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const [copiedRules, setCopiedRules] = useState(false);

  const firestoreRulesContent = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    function isAdmin() {
      return isAuthenticated() && request.auth.token.role == 'admin';
    }
    function isVerifiedOrg() {
      return isAuthenticated() && (request.auth.token.role == 'ngo' || request.auth.token.role == 'admin');
    }

    // User profiles
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) || isAdmin();
    }

    // Medical Equipment listings
    match /equipment/{itemId} {
      allow read: if true; // Public discovery
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.donorId) || isVerifiedOrg() || isAdmin();
      allow delete: if isAdmin();
    }

    // Assistance Requests
    match /requests/{requestId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.userId) || isVerifiedOrg() || isAdmin();
      allow delete: if isAdmin();
    }

    // Blood Donors (Opt-in consented only)
    match /blood_donors/{donorId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated();
      allow delete: if isOwner(donorId) || isAdmin();
    }

    // Handover & Return Records
    match /handovers/{handoverId} {
      allow read: if isAuthenticated() && (
        request.auth.uid == resource.data.donorId ||
        request.auth.uid == resource.data.borrowerId ||
        isVerifiedOrg()
      );
      allow create: if isAuthenticated();
      allow update: if isAuthenticated(); // Verified through QR code token validation
    }

    // Audit Logs
    match /audit_logs/{logId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if false; // Append-only immutable log
    }
  }
}`;

  const handleCopyRules = () => {
    navigator.clipboard.writeText(firestoreRulesContent);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-slate-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-100 text-teal-900 rounded-full text-xs font-semibold">
          <HeartHandshake className="w-3.5 h-3.5 text-teal-700" />
          <span>BTech Computer Science & Engineering Mini Project Documentation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 tracking-tight">
          MediShare — Share Care, Save Lives
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Project architecture, system requirements, security engineering, and future scope documentation prepared for academic submission and prototype demonstration.
        </p>
      </div>

      {/* 1. Project Overview & Problem Statement */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-xl font-bold font-display text-slate-900">
          1. Problem Statement & Motivation
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Families and patients recovering from surgeries, acute injuries, or terminal palliative illnesses frequently experience severe hurdles in locating temporary, expensive medical equipment (such as wheelchairs, semi-fowler hospital beds, and portable phlegm suction machines). Once a patient recovers, this hardware often sits idle in households, while other families in the same neighborhood face prohibitive rental fees or supply shortages.
        </p>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Concurrently, volunteer blood donors wish to help their communities but lack a privacy-preserving mechanism to indicate availability for scheduled surgeries without broadcasting their phone numbers. MediShare provides a centralized social-impact platform to discover medical hardware, coordinate equipment loans via cryptographic QR verification, connect voluntary blood donors, promote safe pharmaceutical take-back programs, and facilitate non-diagnostic assistance through verified NGOs.
        </p>
      </section>

      {/* 2. Objectives */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-xl font-bold font-display text-slate-900">
          2. Project Objectives
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-semibold text-slate-900 block">1. Improve Medical Resource Discovery</span>
            <p className="text-xs text-slate-600">Provide an interactive, searchable catalog of available wheelchairs, beds, and walking aids filterable by city and condition.</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-semibold text-slate-900 block">2. Voluntary Blood Donor Directory</span>
            <p className="text-xs text-slate-600">Enable privacy-protected, opt-in standby donor connections with clear clinical cross-match safety disclaimers.</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-semibold text-slate-900 block">3. Coordinate Equipment Lending & Returns</span>
            <p className="text-xs text-slate-600">Track the complete equipment lifecycle: Available → Requested → Approved → Handover → Sanitized Return.</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-semibold text-slate-900 block">4. Verified Organisation Participation</span>
            <p className="text-xs text-slate-600">Integrate NGO-DARPAN and charitable trust validation to maintain trust and prevent bad-faith hoarding.</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-semibold text-slate-900 block">5. QR Handover Chain-of-Custody</span>
            <p className="text-xs text-slate-600">Generate tamper-evident verification codes confirming physical handovers and returns between donors and recipients.</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-semibold text-slate-900 block">6. Safe Medicine Disposal Education</span>
            <p className="text-xs text-slate-600">Strictly ban prescription drug redistribution while guiding users to authorized pharmaceutical take-back kiosks.</p>
          </div>
        </div>
      </section>

      {/* 3. System Architecture */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-xl font-bold font-display text-slate-900">
          3. System Architecture & Technical Specifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Cpu className="w-4 h-4 text-teal-600" />
              <span>Frontend Architecture</span>
            </div>
            <ul className="text-slate-600 space-y-1">
              <li>· React 19 & TypeScript</li>
              <li>· Tailwind CSS v4 styling</li>
              <li>· Plus Jakarta Sans display typography</li>
              <li>· Leaflet & OpenStreetMap (No paid keys)</li>
              <li>· Chart.js analytics engine</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Database className="w-4 h-4 text-blue-600" />
              <span>Persistence & State</span>
            </div>
            <ul className="text-slate-600 space-y-1">
              <li>· React Context state management</li>
              <li>· LocalStorage offline persistence</li>
              <li>· Seamless Firebase Firestore connector</li>
              <li>· 12+ pre-seeded realistic test records</li>
              <li>· Instant demo state reset</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Security & Ethics</span>
            </div>
            <ul className="text-slate-600 space-y-1">
              <li>· Role-Based Access Control (RBAC)</li>
              <li>· Masked contact channels for donors</li>
              <li>· Immutable administrative audit log</li>
              <li>· Zero-drug-resale enforcement</li>
              <li>· Non-emergency banner & routing</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Firebase Firestore Security Rules */}
      <section className="bg-slate-900 text-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Production Security Hardening</span>
            </div>
            <h3 className="font-display font-bold text-white text-lg mt-1">
              Cloud Firestore Security Rules (firestore.rules)
            </h3>
            <p className="text-xs text-slate-400">
              Enforces backend RBAC permissions preventing unauthorized listings, reservations, or tampering.
            </p>
          </div>

          <button
            onClick={handleCopyRules}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            {copiedRules ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedRules ? 'Copied to Clipboard' : 'Copy firestore.rules'}</span>
          </button>
        </div>

        <pre className="p-4 bg-slate-950 rounded-2xl text-[11px] font-mono text-teal-300 overflow-x-auto max-h-80 border border-slate-800">
          {firestoreRulesContent}
        </pre>
      </section>

      {/* 5. Future Roadmap */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-xl font-bold font-display text-slate-900">
          5. Future Scope & Enhancements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="space-y-1">
            <strong className="text-slate-800 block">1. Direct Hospital API Integration</strong>
            <p>Direct integration with government e-RaktKosh and hospital blood bank APIs to verify real-time blood unit deficits.</p>
          </div>
          <div className="space-y-1">
            <strong className="text-slate-800 block">2. Automated SMS / WhatsApp Dispatch</strong>
            <p>Twilio or WhatsApp Business Webhooks for volunteer standby alerts upon urgent surgical blood requests.</p>
          </div>
          <div className="space-y-1">
            <strong className="text-slate-800 block">3. Reverse Logistics & Courier Alliances</strong>
            <p>Partnerships with electric intra-city logistics fleets to handle wheelchair transport from donor doorsteps.</p>
          </div>
          <div className="space-y-1">
            <strong className="text-slate-800 block">4. Municipal Medicine Take-Back Expansion</strong>
            <p>IoT-connected smart drop boxes that notify local bio-medical incineration crews when pharmacy bins reach 80% capacity.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
