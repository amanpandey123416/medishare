import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BloodDonor } from '../types';
import {
  Droplet,
  Search,
  Filter,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  Heart,
  MessageSquare,
  X,
  CheckCircle2,
  PhoneCall,
  Clock,
  Sparkles
} from 'lucide-react';

export const BloodDonorView: React.FC = () => {
  const { bloodDonors, registerBloodDonor, currentUser, setCurrentRole } = useApp();

  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('All');
  const [searchArea, setSearchArea] = useState<string>('');

  // Opt-in Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [contactDonorModal, setContactDonorModal] = useState<BloodDonor | null>(null);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Form State
  const [donorForm, setDonorForm] = useState({
    displayName: currentUser.name || '',
    bloodGroup: 'O+' as BloodDonor['bloodGroup'],
    city: currentUser.city || 'Mumbai',
    serviceArea: '',
    preferredContact: 'In-App Secure Chat' as BloodDonor['preferredContact'],
    availability: 'Available to Donate' as BloodDonor['availability'],
    consentToParticipate: true,
  });

  const bloodGroups: (BloodDonor['bloodGroup'] | 'All')[] = [
    'All',
    'O+',
    'O-',
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-'
  ];

  const filteredDonors = bloodDonors.filter((donor) => {
    const matchesGroup = selectedGroup === 'All' || donor.bloodGroup === selectedGroup;
    const matchesCity = selectedCity === 'All' || donor.city === selectedCity;
    const matchesAvailability = selectedAvailability === 'All' || donor.availability === selectedAvailability;
    const matchesArea =
      !searchArea ||
      donor.serviceArea.toLowerCase().includes(searchArea.toLowerCase()) ||
      donor.displayName.toLowerCase().includes(searchArea.toLowerCase());

    return matchesGroup && matchesCity && matchesAvailability && matchesArea;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorForm.displayName.trim() || !donorForm.serviceArea.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    registerBloodDonor({
      displayName: donorForm.displayName,
      bloodGroup: donorForm.bloodGroup,
      city: donorForm.city,
      serviceArea: donorForm.serviceArea,
      preferredContact: donorForm.preferredContact,
      availability: donorForm.availability,
      consentToParticipate: donorForm.consentToParticipate,
      verifiedDonorBadge: true,
    });

    setShowRegisterModal(false);
  };

  const handleSendContactRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setContactDonorModal(null);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 rounded-full text-xs font-semibold text-rose-800 mb-2">
            <Droplet className="w-3.5 h-3.5 text-rose-600" />
            <span>Voluntary Blood Donor Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
            Opt-in Voluntary Blood Donor Network
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Discover consented standby blood donors in your area for scheduled surgery, thalassemia care, and clinical standby reserves.
          </p>
        </div>

        <button
          onClick={() => {
            if (currentUser.role !== 'donor') setCurrentRole('donor');
            setShowRegisterModal(true);
          }}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start md:self-auto"
        >
          <Heart className="w-4 h-4 fill-white/20" />
          <span>Opt In as a Blood Donor</span>
        </button>
      </div>

      {/* Mandatory Safety Notice */}
      <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl text-xs text-rose-950 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-semibold text-rose-900">Mandatory Medical Safety Notice:</strong>
          <p className="text-slate-700 leading-relaxed">
            Blood donor profiles are informational only. Donation eligibility, compatibility, infectious testing, hemoglobin screening, and collection must be confirmed by a qualified blood bank or healthcare professional. MediShare does not certify clinical donor eligibility or cross-match safety.
          </p>
        </div>
      </div>

      {/* Blood Group Compatibility Reference Matrix */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-slate-900 text-xs sm:text-sm">
            Quick Blood Compatibility Guide
          </h3>
          <span className="text-[11px] text-slate-400">Standard Transfusion Guidelines</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-bold text-rose-700 font-display">O Negative (O-)</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Universal Red Cell Donor (can donate to all groups)</p>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-bold text-rose-700 font-display">AB Positive (AB+)</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Universal Red Cell Recipient (can receive all groups)</p>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-bold text-rose-700 font-display">A+ / B+</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Common groups; recipient requires matched ABO/Rh</p>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-bold text-rose-700 font-display">Platelet Apheresis</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Donations can be performed every 14 days at blood banks</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
              placeholder="Search by donor pseudonym or neighborhood (e.g. Bandra, Koramangala)..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
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
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="All">All Availabilities</option>
              <option value="Available to Donate">Available to Donate</option>
              <option value="Temporarily Unavailable">Temporarily Unavailable</option>
              <option value="Recently Donated (Cooldown)">Cooldown Window</option>
            </select>
          </div>
        </div>

        {/* Blood Group Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium text-[11px] mr-1 shrink-0">Blood Group:</span>
          {bloodGroups.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer text-xs font-semibold tabular-nums ${
                selectedGroup === group
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Donors Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Found {filteredDonors.length} opted-in volunteers</span>
          <span>Contact details are masked for privacy compliance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDonors.map((donor) => (
            <div
              key={donor.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 font-extrabold font-display text-lg flex items-center justify-center tabular-nums shadow-xs">
                      {donor.bloodGroup}
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-slate-900 text-sm">
                        {donor.displayName}
                      </h3>
                      <div className="text-xs text-slate-500">{donor.city} · {donor.serviceArea}</div>
                    </div>
                  </div>

                  {donor.verifiedDonorBadge && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3" />
                      Opt-in Verified
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Availability:</span>
                    <span
                      className={`font-semibold ${
                        donor.availability === 'Available to Donate'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {donor.availability}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Lifetime Donations:</span>
                    <span className="font-medium text-slate-800 tabular-nums">
                      {donor.totalDonations || 0} times
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Routing Channel:</span>
                    <span className="text-slate-700">{donor.preferredContact}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Profile Refreshed:</span>
                    <span className="tabular-nums">{donor.lastUpdated}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 italic">No phone exposed</span>
                <button
                  onClick={() => setContactDonorModal(donor)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Request Contact</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Donor Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-display font-semibold text-slate-900 text-base">
                  Voluntary Blood Donor Registration
                </h3>
                <p className="text-xs text-slate-500">
                  Consent-based, non-diagnostic community standby registry.
                </p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Display Name or Pseudonym *
                </label>
                <input
                  type="text"
                  required
                  value={donorForm.displayName}
                  onChange={(e) => setDonorForm({ ...donorForm, displayName: e.target.value })}
                  placeholder="e.g. Priya D. or Donor #402"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  You may use a pseudonym to safeguard privacy. No government IDs collected.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Blood Group *
                  </label>
                  <select
                    value={donorForm.bloodGroup}
                    onChange={(e) => setDonorForm({ ...donorForm, bloodGroup: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-bold text-rose-700"
                  >
                    {bloodGroups.filter((g) => g !== 'All').map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City *
                  </label>
                  <select
                    value={donorForm.city}
                    onChange={(e) => setDonorForm({ ...donorForm, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Pune">Pune</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service Area / Locality *
                </label>
                <input
                  type="text"
                  required
                  value={donorForm.serviceArea}
                  onChange={(e) => setDonorForm({ ...donorForm, serviceArea: e.target.value })}
                  placeholder="e.g. Bandra West or Indiranagar"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Preference
                  </label>
                  <select
                    value={donorForm.preferredContact}
                    onChange={(e) => setDonorForm({ ...donorForm, preferredContact: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="In-App Secure Chat">In-App Secure Chat</option>
                    <option value="Verified Phone Request">Verified Phone Request</option>
                    <option value="Email Dispatch">Email Dispatch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Availability
                  </label>
                  <select
                    value={donorForm.availability}
                    onChange={(e) => setDonorForm({ ...donorForm, availability: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Available to Donate">Available to Donate</option>
                    <option value="Temporarily Unavailable">Temporarily Unavailable</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="consent"
                    required
                    checked={donorForm.consentToParticipate}
                    onChange={(e) => setDonorForm({ ...donorForm, consentToParticipate: e.target.checked })}
                    className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <label htmlFor="consent" className="text-[11px] text-slate-700 leading-snug">
                    I consent to being listed in this voluntary standby directory. I understand my eligibility will be clinically checked by a licensed blood bank before any collection.
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Confirm Opt-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Donor Modal */}
      {contactDonorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-display font-semibold text-slate-900 text-base">
                  Connect with Volunteer Donor
                </h3>
                <p className="text-slate-500">{contactDonorModal.displayName} ({contactDonorModal.bloodGroup})</p>
              </div>
              <button
                onClick={() => setContactDonorModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {contactSuccess ? (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto" />
                <div className="font-semibold text-sm">Standby Request Dispatched!</div>
                <p className="text-[11px] text-teal-700">
                  The volunteer donor has received your procedure notice via {contactDonorModal.preferredContact}. You will receive an in-app confirmation once accepted.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendContactRequest} className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 space-y-1">
                  <div><strong>Location:</strong> {contactDonorModal.city} ({contactDonorModal.serviceArea})</div>
                  <div><strong>Preferred Channel:</strong> {contactDonorModal.preferredContact}</div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hospital / Blood Bank Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KEM Hospital Blood Bank, Parel"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Required Date / Timeline *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scheduled for Wednesday morning, 28th Oct"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Additional Clinical Context
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Replacement standby for planned bypass surgery; blood requisition form available..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="p-2.5 bg-rose-50 rounded-lg text-[11px] text-rose-800 border border-rose-100">
                  Transfusion safety guidelines prohibit direct cash compensation for voluntary donations.
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setContactDonorModal(null)}
                    className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                  >
                    Send Standby Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
