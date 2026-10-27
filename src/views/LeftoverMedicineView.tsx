import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MedicineListing,
  MedicineRequest,
  MedicinePackagingCondition,
  MedicineVerificationStatus
} from '../types';
import {
  autoVerifyMedicineSafety,
  findMedicineMatchesForRequest,
  MedicineMatchResult
} from '../utils/medicineMatcher';
import {
  Pill,
  Search,
  PlusCircle,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Building2,
  FileText,
  AlertOctagon,
  X,
  FileCheck,
  Recycle,
  Filter,
  ArrowRight,
  Info
} from 'lucide-react';

export const LeftoverMedicineView: React.FC = () => {
  const {
    medicines,
    medicineRequests,
    addMedicineListing,
    verifyMedicineDonation,
    createMedicineRequest,
    updateMedicineRequestStatus,
    allocateMedicineToRequest,
    currentUser,
    setCurrentRole,
    setActiveTab
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'find' | 'donate' | 'request' | 'verification' | 'matching'>('find');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Donation Form State
  const [donationForm, setDonationForm] = useState({
    medicineName: '',
    brand: '',
    strength: '500 mg',
    dosageForm: 'Tablets' as MedicineListing['dosageForm'],
    quantity: 1,
    unit: 'Strips',
    expiryDate: '2027-12-31',
    batchNumber: '',
    packagingCondition: 'Intact Blister / Strip' as MedicinePackagingCondition,
    storageDetails: 'Stored in dry indoor medicine cabinet below 25°C away from moisture.',
    city: currentUser.city || 'Mumbai',
    serviceArea: '',
    pickupLocation: 'Nearest Authorized Drop-off Pharmacy',
  });

  // Request Form State
  const [requestForm, setRequestForm] = useState({
    medicineName: '',
    strength: '500 mg',
    quantityNeeded: 1,
    unit: 'Strips',
    prescriptionDetails: '',
    city: currentUser.city || 'Mumbai',
    serviceArea: '',
    urgency: 'Standard (Within a Week)' as MedicineRequest['urgency'],
  });

  // Verification Desk State (for NGO/Admin)
  const [selectedMedForVerify, setSelectedMedForVerify] = useState<MedicineListing | null>(null);
  const [verifyNotes, setVerifyNotes] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Smart Matching View State
  const [selectedReqForMatch, setSelectedReqForMatch] = useState<MedicineRequest | null>(null);

  // Live Auto Safety Check Preview for Donation Form
  const liveSafetyCheck = autoVerifyMedicineSafety({
    expiryDate: donationForm.expiryDate,
    packagingCondition: donationForm.packagingCondition,
    storageDetails: donationForm.storageDetails,
    batchNumber: donationForm.batchNumber,
  });

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.strength.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'All' || m.city === selectedCity;
    const matchesStatus = selectedStatus === 'All' || m.verificationStatus === selectedStatus;
    return matchesSearch && matchesCity && matchesStatus;
  });

  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationForm.medicineName.trim() || !donationForm.brand.trim() || !donationForm.serviceArea.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    const res = addMedicineListing({
      medicineName: donationForm.medicineName.trim(),
      brand: donationForm.brand.trim(),
      strength: donationForm.strength.trim(),
      dosageForm: donationForm.dosageForm,
      quantity: Number(donationForm.quantity),
      unit: donationForm.unit.trim(),
      expiryDate: donationForm.expiryDate,
      batchNumber: donationForm.batchNumber.trim() || `GEN-${Math.floor(1000 + Math.random() * 9000)}`,
      packagingCondition: donationForm.packagingCondition,
      storageDetails: donationForm.storageDetails.trim(),
      city: donationForm.city,
      serviceArea: donationForm.serviceArea.trim(),
      pickupLocation: donationForm.pickupLocation.trim(),
      donorId: currentUser.id,
      donorName: currentUser.name,
      donorContact: currentUser.phone || currentUser.email,
    });

    if (res.autoSafetyCheck.isSafeToReview) {
      setFeedback({
        type: 'success',
        message: 'Medicine donation listing submitted! Routed to authorized healthcare organisation for verification.',
      });
    } else {
      setFeedback({
        type: 'error',
        message: `Safety Alert: Automatically flagged (${res.autoSafetyCheck.issues[0]}). Routed to safe disposal guidance.`,
      });
    }

    setTimeout(() => {
      setFeedback(null);
      setActiveSubTab('find');
    }, 2500);
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.medicineName.trim() || !requestForm.serviceArea.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    const res = createMedicineRequest({
      userId: currentUser.id,
      userName: currentUser.name,
      userContact: currentUser.phone || currentUser.email,
      medicineName: requestForm.medicineName.trim(),
      strength: requestForm.strength.trim(),
      quantityNeeded: Number(requestForm.quantityNeeded),
      unit: requestForm.unit.trim(),
      prescriptionDetails: requestForm.prescriptionDetails.trim() || 'Prescription verified at pharmacy counter upon collection.',
      city: requestForm.city,
      serviceArea: requestForm.serviceArea.trim(),
      urgency: requestForm.urgency,
    });

    setFeedback({
      type: 'success',
      message: res.matchesFound > 0
        ? `Request registered! Found ${res.matchesFound} matching verified donations. Awaiting pharmacist allocation.`
        : 'Request registered. Authorized organisations notified to source this medication.',
    });

    setTimeout(() => {
      setFeedback(null);
      setActiveSubTab('matching');
    }, 2200);
  };

  const handleVerifySubmit = (decision: 'Approved' | 'Rejected') => {
    if (!selectedMedForVerify) return;
    const res = verifyMedicineDonation(
      selectedMedForVerify.id,
      decision,
      verifyNotes || (decision === 'Approved' ? 'Verified intact packaging and unexpired batch.' : 'Failed quality inspection.')
    );
    setSelectedMedForVerify(null);
    setVerifyNotes('');
  };

  const renderStatusBadge = (status: MedicineVerificationStatus) => {
    switch (status) {
      case 'Verified & Approved':
        return (
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
            Verified & Approved
          </span>
        );
      case 'Pending Verification':
        return (
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded">
            Pending Pharmacist Review
          </span>
        );
      case 'Flagged Unsafe':
        return (
          <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded">
            Flagged Unsafe / Ineligible
          </span>
        );
      case 'Allocated to Pharmacy':
        return (
          <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
            Allocated to Pharmacy
          </span>
        );
      case 'Rejected':
        return (
          <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
            Rejected
          </span>
        );
      default:
        return <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{status}</span>;
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const exp = new Date(expiryDate);
    const now = new Date();
    const diffTime = exp.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 rounded-full text-xs font-semibold text-teal-800 mb-2">
            <Pill className="w-3.5 h-3.5 text-teal-600" />
            <span>Supervised Pharmaceutical Redistribution Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
            Leftover Medicine Sharing System
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Donate unexpired, factory-sealed leftover medicines for redistribution strictly through authorized healthcare organisations, registered NGOs, and licensed pharmacies upon valid prescription verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('donate')}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Donate Medicines</span>
          </button>
          <button
            onClick={() => setActiveSubTab('request')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <FileText className="w-4 h-4" />
            <span>Request Medicine</span>
          </button>
        </div>
      </div>

      {/* Safety Notice & Lawful Protocol Box */}
      <div className="p-4 sm:p-5 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-2">
        <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs sm:text-sm">
          <AlertOctagon className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Mandatory Safety & Legal Compliance Rules</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-700 pt-1 text-[11px] sm:text-xs">
          <div className="p-2.5 bg-white/80 rounded-xl border border-amber-100">
            <strong>1. No Direct Peer-to-Peer Transfer:</strong> Prescription drugs must never be given directly to strangers. All donations must be inspected by an authorized pharmacy or registered hospital partner.
          </div>
          <div className="p-2.5 bg-white/80 rounded-xl border border-amber-100">
            <strong>2. Professional Inspection Gate:</strong> Medicines must have intact blister foil or manufacturer seals. Expired, opened, or improperly stored items are automatically rejected.
          </div>
          <div className="p-2.5 bg-white/80 rounded-xl border border-amber-100">
            <strong>3. Valid Prescription Required:</strong> Patients requesting medicines must present a valid medical prescription before physical dispensation at the licensed partner desk.
          </div>
        </div>
      </div>

      {/* Module Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold overflow-x-auto border border-slate-200">
        <button
          onClick={() => setActiveSubTab('find')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            activeSubTab === 'find' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Find Available Medicines ({medicines.filter((m) => m.verificationStatus === 'Verified & Approved').length})
        </button>
        <button
          onClick={() => setActiveSubTab('donate')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            activeSubTab === 'donate' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Donate Leftover Medicine
        </button>
        <button
          onClick={() => setActiveSubTab('request')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            activeSubTab === 'request' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Request Medicine (Rx)
        </button>
        <button
          onClick={() => setActiveSubTab('matching')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'matching' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Smart Matching Hub</span>
        </button>
        <button
          onClick={() => setActiveSubTab('verification')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'verification' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Authorised Organisation Verification Desk</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-start gap-2.5 border ${
            feedback.type === 'success'
              ? 'bg-teal-50 text-teal-900 border-teal-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* SUB-TAB 1: FIND MEDICINES */}
      {activeSubTab === 'find' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by generic molecule (e.g. Metformin, Amoxicillin), brand name, or strength..."
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="All">All Cities</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Pune">Pune</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="All">All Listings</option>
                  <option value="Verified & Approved">Verified & Approved Only</option>
                  <option value="Pending Verification">Pending Verification</option>
                  <option value="Flagged Unsafe">Flagged Unsafe</option>
                </select>
              </div>
            </div>
          </div>

          {/* Medicine Listings Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filteredMedicines.length} medicine donation listings</span>
              <span className="text-[11px] text-slate-400">Dispensation occurs at authorized healthcare partner desks</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedicines.map((med) => {
                const daysLeft = getDaysUntilExpiry(med.expiryDate);
                const isExpired = daysLeft <= 0;

                return (
                  <div
                    key={med.id}
                    className={`p-5 bg-white rounded-2xl border shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                      med.verificationStatus === 'Flagged Unsafe'
                        ? 'border-rose-200 bg-rose-50/20'
                        : med.verificationStatus === 'Verified & Approved'
                        ? 'border-emerald-200'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {med.dosageForm}
                        </span>
                        {renderStatusBadge(med.verificationStatus)}
                      </div>

                      <div>
                        <h3 className="font-display font-bold text-slate-900 text-base leading-snug">
                          {med.brand}
                        </h3>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                          {med.medicineName} · <strong className="text-teal-700">{med.strength}</strong>
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Available Quantity:</span>
                          <span className="font-bold text-slate-900 tabular-nums">
                            {med.quantity} {med.unit}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Batch Number:</span>
                          <span className="font-mono text-[11px] text-slate-700">{med.batchNumber}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Expiry Date:</span>
                          <span
                            className={`font-semibold tabular-nums ${
                              isExpired ? 'text-rose-700 underline font-bold' : daysLeft < 90 ? 'text-amber-700' : 'text-slate-800'
                            }`}
                          >
                            {med.expiryDate} ({isExpired ? 'EXPIRED' : `${daysLeft} days left`})
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Packaging:</span>
                          <span className="text-slate-700 font-medium">{med.packagingCondition}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 space-y-1 pt-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{med.city} ({med.serviceArea})</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Pickup / Drop: {med.pickupLocation}
                        </div>
                        {med.verifiedByOrgName && (
                          <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Vetted by: {med.verifiedByOrgName}</span>
                          </div>
                        )}
                      </div>

                      {med.verificationNotes && (
                        <div className={`p-2.5 rounded-lg text-[11px] ${
                          med.verificationStatus === 'Flagged Unsafe'
                            ? 'bg-rose-100/70 text-rose-900 border border-rose-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {med.verificationNotes}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {med.verificationStatus === 'Flagged Unsafe' ? (
                        <button
                          onClick={() => setActiveTab('safe-medicine')}
                          className="w-full py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Recycle className="w-3.5 h-3.5" />
                          <span>Locate Disposal Kiosk</span>
                        </button>
                      ) : med.verificationStatus === 'Verified & Approved' ? (
                        <button
                          onClick={() => {
                            setRequestForm({
                              ...requestForm,
                              medicineName: med.medicineName,
                              strength: med.strength,
                              city: med.city,
                              serviceArea: med.serviceArea,
                            });
                            setActiveSubTab('request');
                          }}
                          className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Request with Prescription</span>
                        </button>
                      ) : (
                        <span className="text-xs text-amber-700 italic w-full text-center">
                          Awaiting Pharmacist Inspection
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DONATE LEFTOVER MEDICINE */}
      {activeSubTab === 'donate' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              Submit Leftover Medicine for Verification
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Provide accurate batch details and packaging conditions. Medicines undergo automated safety scans and inspection by authorised health organisations prior to redistribution.
            </p>
          </div>

          <form onSubmit={handleDonationSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Active Generic Molecule Name *
                </label>
                <input
                  type="text"
                  required
                  value={donationForm.medicineName}
                  onChange={(e) => setDonationForm({ ...donationForm, medicineName: e.target.value })}
                  placeholder="e.g. Metformin Hydrochloride or Amoxicillin"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Commercial Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={donationForm.brand}
                  onChange={(e) => setDonationForm({ ...donationForm, brand: e.target.value })}
                  placeholder="e.g. Glycomet-GP or Augmentin"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Strength *
                </label>
                <input
                  type="text"
                  required
                  value={donationForm.strength}
                  onChange={(e) => setDonationForm({ ...donationForm, strength: e.target.value })}
                  placeholder="e.g. 500 mg, 625 mg, 50 mcg"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dosage Form *
                </label>
                <select
                  value={donationForm.dosageForm}
                  onChange={(e) => setDonationForm({ ...donationForm, dosageForm: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Tablets">Tablets</option>
                  <option value="Capsules">Capsules</option>
                  <option value="Syrup (Sealed)">Syrup (Sealed)</option>
                  <option value="Inhaler (Sealed)">Inhaler (Sealed)</option>
                  <option value="Eye/Ear Drops (Sealed)">Eye/Ear Drops (Sealed)</option>
                  <option value="Ointment (Sealed)">Ointment (Sealed)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity & Unit *
                </label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    min={1}
                    value={donationForm.quantity}
                    onChange={(e) => setDonationForm({ ...donationForm, quantity: Number(e.target.value) })}
                    className="w-16 px-2 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={donationForm.unit}
                    onChange={(e) => setDonationForm({ ...donationForm, unit: e.target.value })}
                    placeholder="Strips"
                    className="flex-1 px-2 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expiry Date Printed on Strip/Bottle *
                </label>
                <input
                  type="date"
                  required
                  value={donationForm.expiryDate}
                  onChange={(e) => setDonationForm({ ...donationForm, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Manufacturer Batch Number *
                </label>
                <input
                  type="text"
                  required
                  value={donationForm.batchNumber}
                  onChange={(e) => setDonationForm({ ...donationForm, batchNumber: e.target.value })}
                  placeholder="e.g. GLY-2024-811"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Packaging Condition *
                </label>
                <select
                  value={donationForm.packagingCondition}
                  onChange={(e) => setDonationForm({ ...donationForm, packagingCondition: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Intact Blister / Strip">Intact Blister / Strip (Eligible)</option>
                  <option value="Original Sealed Bottle">Original Sealed Bottle (Eligible)</option>
                  <option value="Intact Foil">Intact Foil (Eligible)</option>
                  <option value="Opened / Loose Pack">Opened / Loose Pack (Ineligible)</option>
                  <option value="Damaged Box / Broken Seal">Damaged Box / Broken Seal (Ineligible)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City *
                </label>
                <select
                  value={donationForm.city}
                  onChange={(e) => setDonationForm({ ...donationForm, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Pune">Pune</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service Locality & Pickup / Pharmacy Drop Location *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={donationForm.serviceArea}
                  onChange={(e) => setDonationForm({ ...donationForm, serviceArea: e.target.value })}
                  placeholder="e.g. Andheri West or Indiranagar"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  value={donationForm.pickupLocation}
                  onChange={(e) => setDonationForm({ ...donationForm, pickupLocation: e.target.value })}
                  placeholder="Drop-off point (e.g. CareShare Kiosk)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Home Storage History Details *
              </label>
              <input
                type="text"
                required
                value={donationForm.storageDetails}
                onChange={(e) => setDonationForm({ ...donationForm, storageDetails: e.target.value })}
                placeholder="e.g. Stored in dry indoor medicine cabinet below 25°C away from moisture"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            {/* Automated Safety Check Preview Box */}
            <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
              liveSafetyCheck.isSafeToReview
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-center gap-2 font-semibold">
                {liveSafetyCheck.isSafeToReview ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>
                  Automated Safety Pre-Scan: {liveSafetyCheck.isSafeToReview ? 'Passed Initial Safety Check' : 'Ineligible for Redistribution'}
                </span>
              </div>
              {liveSafetyCheck.issues.length > 0 ? (
                <ul className="list-disc pl-5 text-[11px] text-rose-800 space-y-0.5">
                  {liveSafetyCheck.issues.map((iss, idx) => (
                    <li key={idx}>{iss}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-emerald-800">
                  Batch meets eligibility criteria (unexpired, sealed packaging, dry storage). Will proceed to physical verification by a registered healthcare organisation.
                </p>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('find')}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
              >
                Submit Donation Listing
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: REQUEST MEDICINE */}
      {activeSubTab === 'request' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              Request Verified Leftover Medicine
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Submit your required medicine name and dosage. Our smart engine matches your request with available verified donations, and routes the approval to a licensed pharmacy partner.
            </p>
          </div>

          <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medicine / Molecule Name *
                </label>
                <input
                  type="text"
                  required
                  value={requestForm.medicineName}
                  onChange={(e) => setRequestForm({ ...requestForm, medicineName: e.target.value })}
                  placeholder="e.g. Metformin or Salbutamol Inhaler"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Strength *
                </label>
                <input
                  type="text"
                  required
                  value={requestForm.strength}
                  onChange={(e) => setRequestForm({ ...requestForm, strength: e.target.value })}
                  placeholder="e.g. 500 mg, 625 mg, 100 mcg"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity Needed *
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={requestForm.quantityNeeded}
                  onChange={(e) => setRequestForm({ ...requestForm, quantityNeeded: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit Type
                </label>
                <input
                  type="text"
                  value={requestForm.unit}
                  onChange={(e) => setRequestForm({ ...requestForm, unit: e.target.value })}
                  placeholder="Strips"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Urgency Level *
                </label>
                <select
                  value={requestForm.urgency}
                  onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Critical (Within 24h)">Critical (Within 24h)</option>
                  <option value="Urgent (1-3 Days)">Urgent (1-3 Days)</option>
                  <option value="Standard (Within a Week)">Standard (Within a Week)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City *
                </label>
                <select
                  value={requestForm.city}
                  onChange={(e) => setRequestForm({ ...requestForm, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Pune">Pune</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service Area / Neighborhood *
                </label>
                <input
                  type="text"
                  required
                  value={requestForm.serviceArea}
                  onChange={(e) => setRequestForm({ ...requestForm, serviceArea: e.target.value })}
                  placeholder="e.g. Andheri West, Koramangala"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Doctor Prescription (Rx) Reference & Clinical Notes *
              </label>
              <textarea
                rows={2}
                required
                value={requestForm.prescriptionDetails}
                onChange={(e) => setRequestForm({ ...requestForm, prescriptionDetails: e.target.value })}
                placeholder="Prescribing Doctor Name, Hospital/Clinic, Registration number, or prescription date..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                A valid physical or digital prescription will be verified by the licensed dispensing pharmacist at the time of handover.
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('find')}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
              >
                Submit Medicine Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 4: SMART MATCHING HUB */}
      {activeSubTab === 'matching' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900">
                Medicine Smart Matching Engine
              </h2>
              <p className="text-xs text-slate-500">
                Matches patient medicine requests with available verified donor batches by molecule, strength, and locality.
              </p>
            </div>
            <span className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              Matches require licensed pharmacist clearance
            </span>
          </div>

          <div className="space-y-4">
            {medicineRequests.map((req) => {
              const matches = findMedicineMatchesForRequest(req, medicines);

              return (
                <div
                  key={req.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{req.medicineName}</span>
                      <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        {req.strength}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-xs text-slate-500">{req.city} ({req.serviceArea})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        Status: {req.status}
                      </span>
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        Requested on {req.requestDate}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div><strong>Patient:</strong> {req.userName}</div>
                    <div><strong>Prescription Info:</strong> {req.prescriptionDetails}</div>
                    {req.matchedListingName && (
                      <div className="text-teal-800 font-medium">
                        Linked Donation Batch: <strong>{req.matchedListingName}</strong> ({req.assignedOrgName || 'CareShare Pharmacy'})
                      </div>
                    )}
                  </div>

                  {/* Matching Results for this Request */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-700 block mb-2">
                      Available Matching Inventory ({matches.length} found):
                    </span>

                    {matches.length === 0 ? (
                      <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-400 text-center">
                        No direct approved inventory match found in this city yet. Healthcare coordinators notified to source from partner hospitals.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {matches.map((match) => (
                          <div
                            key={match.listing.id}
                            className="p-3.5 bg-teal-50/50 rounded-xl border border-teal-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{match.listing.brand}</span>
                                <span className="text-slate-600">({match.listing.strength})</span>
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.2 rounded">
                                  {match.score}% Match Fit
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600">
                                {match.reasons.join(' · ')}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Batch: {match.listing.batchNumber} · Exp: {match.listing.expiryDate} · Loc: {match.listing.city}
                              </div>
                            </div>

                            {(currentUser.role === 'ngo' || currentUser.role === 'admin') && req.status !== 'Approved' && (
                              <button
                                onClick={() => allocateMedicineToRequest(req.id, match.listing.id)}
                                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                              >
                                Allocate to Pharmacy Desk
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: AUTHORISED ORGANISATION VERIFICATION DESK */}
      {activeSubTab === 'verification' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900">
                Authorised Organisation Verification Desk
              </h2>
              <p className="text-xs text-slate-500">
                Authorised hospital pharmacists and DARPAN-vetted NGOs inspect leftover medicine submissions, verify packaging integrity, and approve lawful redistribution.
              </p>
            </div>
            {currentUser.role !== 'ngo' && currentUser.role !== 'admin' && (
              <button
                onClick={() => setCurrentRole('ngo')}
                className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Switch to NGO Coordinator Role
              </button>
            )}
          </div>

          <div className="space-y-3">
            {medicines.map((med) => (
              <div
                key={med.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{med.brand}</span>
                    <span className="text-xs text-slate-600">({med.medicineName} {med.strength})</span>
                    {renderStatusBadge(med.verificationStatus)}
                  </div>
                  <div className="text-xs text-slate-500">
                    Donor: <strong className="text-slate-700">{med.donorName}</strong> · City: {med.city} · Qty: {med.quantity} {med.unit}
                  </div>
                  <div className="text-xs text-slate-600">
                    Batch: <span className="font-mono">{med.batchNumber}</span> · Expiry: <strong className="text-slate-800">{med.expiryDate}</strong> · Condition: {med.packagingCondition}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Storage: {med.storageDetails}
                  </div>
                  {med.verificationNotes && (
                    <div className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100">
                      Notes: {med.verificationNotes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {med.verificationStatus === 'Pending Verification' && (
                    <>
                      <button
                        onClick={() => setSelectedMedForVerify(med)}
                        className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Inspect & Verify
                      </button>
                    </>
                  )}
                  {med.verificationStatus === 'Flagged Unsafe' && (
                    <button
                      onClick={() => setActiveTab('safe-medicine')}
                      className="px-3 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Safe Disposal Kiosk
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification Inspection Modal */}
      {selectedMedForVerify && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-display font-semibold text-slate-900 text-base">
                  Pharmacist Verification & Quality Audit
                </h3>
                <p className="text-slate-500">{selectedMedForVerify.brand} ({selectedMedForVerify.strength})</p>
              </div>
              <button
                onClick={() => setSelectedMedForVerify(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div><strong>Batch:</strong> {selectedMedForVerify.batchNumber}</div>
              <div><strong>Expiry Date:</strong> {selectedMedForVerify.expiryDate}</div>
              <div><strong>Condition:</strong> {selectedMedForVerify.packagingCondition}</div>
              <div><strong>Reported Storage:</strong> {selectedMedForVerify.storageDetails}</div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Pharmacist Checklist:
              </label>
              <div className="space-y-1 text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Blister foil / bottle security seal is untampered</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Expiry date has more than 90 days validity</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Batch number cross-referenced against recall database</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inspection Assessment Notes *
              </label>
              <textarea
                rows={2}
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                placeholder="Inspected by Clinical Pharmacist. Tamper-evident strip intact, approved for licensed community dispensation."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleVerifySubmit('Rejected')}
                className="px-3.5 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Reject Listing
              </button>
              <button
                type="button"
                onClick={() => handleVerifySubmit('Approved')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Approve for Redistribution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
