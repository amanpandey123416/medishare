import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, HandoverRecord, EquipmentItem } from '../types';
import { QRHandoverModal } from '../components/QRHandoverModal';
import { ReviewModal } from '../components/ReviewModal';
import {
  User,
  Package,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Star,
  Users,
  Building2,
  Calendar,
  Activity,
  Repeat,
  PlusCircle,
  Ban,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Heart,
  Pill
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    setCurrentRole,
    equipment,
    requests,
    handovers,
    bloodDonors,
    supplies,
    organizations,
    verifyOrganization,
    auditLogs,
    allUsers,
    approveEquipmentRequest,
    rejectEquipmentRequest,
    updateEquipmentStatus,
    updateRequestStatus,
    reviews,
    medicines,
    medicineRequests,
    setActiveTab,
    resetToSampleData
  } = useApp();

  // Modals
  const [selectedHandoverForQR, setSelectedHandoverForQR] = useState<{
    record: HandoverRecord;
    mode: 'view-qr' | 'verify-code';
    actionType: 'HANDOVER' | 'RETURN';
  } | null>(null);

  const [selectedHandoverForReview, setSelectedHandoverForReview] = useState<HandoverRecord | null>(null);
  const [scheduledDateInput, setScheduledDateInput] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [activeTabSub, setActiveTabSub] = useState<'overview' | 'requests' | 'handovers' | 'medicines' | 'moderation' | 'audit'>('overview');

  // Role data subsets
  // Patient
  const myRequests = requests.filter((r) => r.userId === currentUser.id);
  const myReservations = handovers.filter((h) => h.borrowerId === currentUser.id);
  const myMedicineDonations = medicines.filter((m) => m.donorId === currentUser.id);
  const myMedicineRequests = medicineRequests.filter((r) => r.userId === currentUser.id);

  // Donor
  const myDonatedEquipment = equipment.filter((e) => e.donorId === currentUser.id);
  const myPendingHandovers = handovers.filter(
    (h) => h.donorId === currentUser.id && (h.status === 'Scheduled' || h.status === 'Handed Over')
  );

  // NGO
  const orgHandovers = handovers;
  const pendingAssistanceCases = requests.filter((r) => r.status === 'Submitted' || r.status === 'Under Review');

  // Admin stats
  const pendingOrgs = organizations.filter((o) => !o.verified);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-display font-bold text-2xl shadow-sm">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                {currentUser.name}
              </h1>
              {currentUser.organizationName && (
                <span className="text-xs bg-teal-50 text-teal-800 font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">
                  {currentUser.organizationName}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Active Persona: <strong className="text-slate-800 uppercase">{currentUser.role}</strong> · {currentUser.city} · Member since {currentUser.joinedDate}
            </p>
          </div>
        </div>

        {/* Quick Role Switcher Buttons on Dashboard */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Switch Dashboard:</span>
          {(['patient', 'donor', 'ngo', 'admin'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setCurrentRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                currentUser.role === r
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Role-Specific Sub-Navigation / Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold overflow-x-auto border border-slate-200">
        <button
          onClick={() => setActiveTabSub('overview')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            activeTabSub === 'overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview & Quick Actions
        </button>
        <button
          onClick={() => setActiveTabSub('requests')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            activeTabSub === 'requests' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {currentUser.role === 'patient' ? 'My Assistance Requests' : 'Assistance Cases'}
        </button>
        <button
          onClick={() => setActiveTabSub('handovers')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            activeTabSub === 'handovers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Handovers & QR Verification ({handovers.length})
        </button>
        <button
          onClick={() => setActiveTabSub('medicines')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTabSub === 'medicines' ? 'bg-white text-teal-800 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Pill className="w-3.5 h-3.5 text-teal-600" />
          <span>My Medicines ({myMedicineDonations.length + myMedicineRequests.length})</span>
        </button>
        {(currentUser.role === 'admin' || currentUser.role === 'ngo') && (
          <button
            onClick={() => setActiveTabSub('moderation')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTabSub === 'moderation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {currentUser.role === 'admin' ? 'Admin Moderation & Verifications' : 'Organization Inventory'}
          </button>
        )}
        {currentUser.role === 'admin' && (
          <button
            onClick={() => setActiveTabSub('audit')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTabSub === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Security Audit Logs ({auditLogs.length})
          </button>
        )}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTabSub === 'overview' && (
        <div className="space-y-6">
          {/* Persona-specific highlight cards */}
          {currentUser.role === 'patient' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div
                onClick={() => setActiveTab('requests')}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 cursor-pointer transition-colors space-y-2"
              >
                <div className="text-xs text-slate-500 font-medium">My Active Requests</div>
                <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">{myRequests.length}</div>
                <p className="text-[11px] text-teal-700">Click to track real-time status</p>
              </div>

              <div
                onClick={() => setActiveTabSub('handovers')}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 cursor-pointer transition-colors space-y-2"
              >
                <div className="text-xs text-slate-500 font-medium">Equipment Reserved</div>
                <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">{myReservations.length}</div>
                <p className="text-[11px] text-blue-700">View Handover QR codes</p>
              </div>

              <div
                onClick={() => setActiveTab('equipment')}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 cursor-pointer transition-colors space-y-2"
              >
                <div className="text-xs text-slate-500 font-medium">Available Hardware</div>
                <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">
                  {equipment.filter((e) => e.status === 'Available').length}
                </div>
                <p className="text-[11px] text-slate-500">Ready for immediate loan</p>
              </div>

              <div
                onClick={() => setActiveTab('blood-donors')}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 cursor-pointer transition-colors space-y-2"
              >
                <div className="text-xs text-slate-500 font-medium">Standby Blood Donors</div>
                <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">
                  {bloodDonors.filter((b) => b.availability === 'Available to Donate').length}
                </div>
                <p className="text-[11px] text-rose-700">Consent verified</p>
              </div>
            </div>
          )}

          {currentUser.role === 'donor' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs text-slate-500 font-medium">My Listed Equipment</div>
                <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">{myDonatedEquipment.length}</div>
                <p className="text-[11px] text-teal-700 font-medium">In active circulation</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs text-slate-500 font-medium">Pending Handovers</div>
                <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">{myPendingHandovers.length}</div>
                <p className="text-[11px] text-blue-700 font-medium">Awaiting pickup scan</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs text-slate-500 font-medium">Blood Donor Opt-in</div>
                <div className="text-lg font-bold font-display text-slate-900">
                  {currentUser.isBloodDonorOptedIn ? `Opted-in (${currentUser.bloodGroup || 'O+'})` : 'Not Opted In'}
                </div>
                <p className="text-[11px] text-rose-700 font-medium">Standby volunteer</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs text-slate-500 font-medium">Completed Contributions</div>
                <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">
                  {handovers.filter((h) => h.donorId === currentUser.id && h.status === 'Handed Over').length}
                </div>
                <p className="text-[11px] text-emerald-700 font-medium">Verified by QR code</p>
              </div>
            </div>
          )}

          {currentUser.role === 'ngo' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs text-slate-500 font-medium">Verification Status</div>
                <div className="inline-flex items-center gap-1.5 text-base font-bold text-emerald-700">
                  <ShieldCheck className="w-5 h-5" />
                  <span>DARPAN Verified</span>
                </div>
                <p className="text-[11px] text-slate-500">MH/2024/0088492</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs text-slate-500 font-medium">Assistance Queue</div>
                <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">{pendingAssistanceCases.length}</div>
                <p className="text-[11px] text-amber-700 font-medium">Awaiting resource match</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs text-slate-500 font-medium">Managed Lending Units</div>
                <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">
                  {equipment.filter((e) => e.donorOrg?.includes('CareShare')).length}
                </div>
                <p className="text-[11px] text-teal-700 font-medium">Sanitized & tracked</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs text-slate-500 font-medium">Total Cases Resolved</div>
                <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">142</div>
                <p className="text-[11px] text-emerald-700 font-medium">Lifetime social impact</p>
              </div>
            </div>
          )}

          {currentUser.role === 'admin' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs text-slate-500 font-medium">Registered User Accounts</div>
                <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">{allUsers.length + 24}</div>
                <p className="text-[11px] text-teal-700 font-medium">Across 4 roles</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs text-slate-500 font-medium">NGO Verification Queue</div>
                <div className="text-2xl font-bold font-display text-amber-700 tabular-nums">{pendingOrgs.length}</div>
                <p className="text-[11px] text-amber-700 font-medium">Applications pending</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs text-slate-500 font-medium">Total Active Equipment</div>
                <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">{equipment.length}</div>
                <p className="text-[11px] text-slate-500">Zero policy violations</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs text-slate-500 font-medium">Security Audit Events</div>
                <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">{auditLogs.length}</div>
                <p className="text-[11px] text-blue-700 font-medium">Immutable audit trail</p>
              </div>
            </div>
          )}

          {/* Quick Actions Strip */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-display font-semibold text-slate-900 text-sm">
              Quick Coordination Actions
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveTab('requests')}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Medical Request</span>
              </button>

              <button
                onClick={() => setActiveTab('equipment')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>Browse Equipment Directory</span>
              </button>

              <button
                onClick={() => setActiveTab('blood-donors')}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <Heart className="w-4 h-4 text-rose-600" />
                <span>Find Blood Donors</span>
              </button>

              <button
                onClick={() => setActiveTab('facilities')}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-teal-600" />
                <span>Locate Healthcare Facilities</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REQUESTS TRACKING */}
      {activeTabSub === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-slate-900 text-base">
              {currentUser.role === 'patient' ? 'My Submitted Assistance Requests' : 'All Assistance Cases'}
            </h3>
            <button
              onClick={() => setActiveTab('requests')}
              className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
            >
              Go to Request Hub
            </button>
          </div>

          <div className="space-y-3">
            {(currentUser.role === 'patient' ? myRequests : requests).map((req) => (
              <div
                key={req.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-800">{req.category}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">{req.city} ({req.serviceArea})</span>
                  </div>
                  <h4 className="font-display font-semibold text-slate-900 text-sm">
                    {req.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-1">{req.description}</p>
                  {req.matchedResourceName && (
                    <div className="text-[11px] text-teal-700 font-medium">
                      Matched to: {req.matchedResourceName}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                    {req.status}
                  </span>

                  {(currentUser.role === 'ngo' || currentUser.role === 'admin') && req.status !== 'Completed' && (
                    <button
                      onClick={() => updateRequestStatus(req.id, 'Completed', 'Assistance completed by coordinator')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Close as Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HANDOVERS & QR CODES */}
      {activeTabSub === 'handovers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-slate-900 text-base">
                Equipment Handover & Return Chain-of-Custody
              </h3>
              <p className="text-xs text-slate-500">
                Live transaction tokens verified via QR code during equipment pickup or physical return.
              </p>
            </div>

            <button
              onClick={() => {
                const dummyHO = handovers[0];
                if (dummyHO) {
                  setSelectedHandoverForQR({
                    record: dummyHO,
                    mode: 'verify-code',
                    actionType: 'HANDOVER',
                  });
                }
              }}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan / Enter Code</span>
            </button>
          </div>

          <div className="space-y-3">
            {handovers.map((ho) => (
              <div
                key={ho.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
                      {ho.transactionCode}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Type: {ho.type}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        ho.status === 'Handed Over'
                          ? 'bg-purple-50 text-purple-700'
                          : ho.status === 'Returned'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {ho.status}
                    </span>
                    {ho.qrVerified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        QR Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block">Equipment:</span>
                    <span className="font-semibold text-slate-900">{ho.equipmentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Donor Account:</span>
                    <span className="text-slate-800">{ho.donorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Recipient / Borrower:</span>
                    <span className="text-slate-800">{ho.borrowerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Scheduled Date:</span>
                    <span className="text-slate-800 tabular-nums">{ho.scheduledDate}</span>
                  </div>
                </div>

                {ho.handoverNotes && (
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    Handover Log: {ho.handoverNotes}
                  </div>
                )}

                {/* Handover Action Row */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                  {/* View QR Code Button */}
                  <button
                    onClick={() =>
                      setSelectedHandoverForQR({
                        record: ho,
                        mode: 'view-qr',
                        actionType: 'HANDOVER',
                      })
                    }
                    className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5 text-teal-600" />
                    <span>View QR Code</span>
                  </button>

                  {/* Donor Approval for Scheduled Item */}
                  {ho.status === 'Scheduled' && (
                    <button
                      onClick={() =>
                        setSelectedHandoverForQR({
                          record: ho,
                          mode: 'verify-code',
                          actionType: 'HANDOVER',
                        })
                      }
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Confirm Handover
                    </button>
                  )}

                  {/* Return Confirmation if currently loaned */}
                  {ho.status === 'Handed Over' && ho.type === 'Lending' && (
                    <button
                      onClick={() =>
                        setSelectedHandoverForQR({
                          record: ho,
                          mode: 'verify-code',
                          actionType: 'RETURN',
                        })
                      }
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>Confirm Return to Depot</span>
                    </button>
                  )}

                  {/* Submit Feedback Review if handed over or returned */}
                  {(ho.status === 'Handed Over' || ho.status === 'Returned') && (
                    <button
                      onClick={() => setSelectedHandoverForReview(ho)}
                      className="px-3 py-1.5 border border-amber-300 text-amber-800 hover:bg-amber-50 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span>Leave Feedback</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: MY MEDICINES & PRESCRIPTION ALLOCATIONS */}
      {activeTabSub === 'medicines' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-display font-semibold text-slate-900 text-base">
                My Medicine Donations & Requests
              </h3>
              <p className="text-xs text-slate-500">
                Track your donated leftover medicines, verification inspection logs, and prescription-backed medicine requests.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('medicines')}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Medicine Sharing Hub</span>
              </button>
              <button
                onClick={() => setActiveTab('safe-medicine')}
                className="px-3 py-1.5 border border-amber-300 text-amber-800 hover:bg-amber-50 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Disposal Kiosks
              </button>
            </div>
          </div>

          {/* Section 1: My Donated Medicines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-semibold text-slate-900 text-sm">
                Leftover Medicines Donated by You ({myMedicineDonations.length})
              </h4>
              <span className="text-xs text-slate-400">Inspected by licensed pharmacists</span>
            </div>

            {myMedicineDonations.length === 0 ? (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400 space-y-2">
                <Pill className="w-8 h-8 text-slate-300 mx-auto" />
                <p>You have not listed any leftover medicines yet.</p>
                <button
                  onClick={() => setActiveTab('medicines')}
                  className="text-teal-700 font-semibold hover:underline cursor-pointer"
                >
                  Donate unexpired sealed medicines
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myMedicineDonations.map((med) => (
                  <div
                    key={med.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-slate-900 text-sm">{med.brand}</span>
                          <span className="text-xs font-semibold text-teal-700">({med.strength})</span>
                        </div>
                        <p className="text-xs text-slate-500">{med.medicineName} · {med.dosageForm}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded border ${
                          med.verificationStatus === 'Verified & Approved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : med.verificationStatus === 'Flagged Unsafe'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {med.verificationStatus}
                        </span>
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          Listed: {med.dateListed}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400 block">Quantity:</span>
                        <span className="font-medium text-slate-800">{med.quantity} {med.unit}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Expiry Date:</span>
                        <span className="font-medium text-slate-800 tabular-nums">{med.expiryDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Batch Code:</span>
                        <span className="font-mono text-slate-800">{med.batchNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Packaging:</span>
                        <span className="text-slate-800">{med.packagingCondition}</span>
                      </div>
                    </div>

                    {med.verificationNotes && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <strong>Pharmacist Audit Note:</strong> {med.verificationNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: My Medicine Requests */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-semibold text-slate-900 text-sm">
                Your Medicine Requests ({myMedicineRequests.length})
              </h4>
              <span className="text-xs text-slate-400">Prescription-verified community allocation</span>
            </div>

            {myMedicineRequests.length === 0 ? (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400 space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No active medicine requests found for your account.</p>
                <button
                  onClick={() => setActiveTab('medicines')}
                  className="text-teal-700 font-semibold hover:underline cursor-pointer"
                >
                  Submit a medicine request
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myMedicineRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-slate-900 text-sm">{req.medicineName}</span>
                          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                            {req.strength}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">Qty Needed: {req.quantityNeeded} {req.unit} · {req.city} ({req.serviceArea})</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded ${
                          req.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : req.status === 'Under Review'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {req.status}
                        </span>
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          {req.requestDate}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div><strong>Prescription Note:</strong> {req.prescriptionDetails}</div>
                      {req.matchedListingName && (
                        <div className="text-teal-800 font-medium">
                          Allocated Donation: {req.matchedListingName} (Ready for counter verification at {req.assignedOrgName || 'CareShare Pharmacy'})
                        </div>
                      )}
                      {req.reviewNotes && (
                        <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
                          {req.reviewNotes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {activeTabSub === 'moderation' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-slate-900 text-base">
              Healthcare Organisation DARPAN Verification Queue
            </h3>
            <p className="text-xs text-slate-500">
              Review NGO registration paperwork to approve lending privilege on MediShare.
            </p>

            <div className="space-y-3">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold text-slate-900 text-sm">
                        {org.name}
                      </span>
                      <span className="text-xs text-slate-400">· {org.city}</span>
                    </div>
                    <p className="text-xs text-slate-600">{org.serviceFocus}</p>
                    <div className="text-[11px] text-slate-400 font-mono">
                      DARPAN Registration: {org.darpanId}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {org.verified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                        <Check className="w-4 h-4" />
                        Verified
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => verifyOrganization(org.id, true)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Approve Verification
                        </button>
                        <button
                          onClick={() => verifyOrganization(org.id, false)}
                          className="px-3 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Listing Moderation */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <h3 className="font-display font-semibold text-slate-900 text-base">
              Active Equipment Moderation
            </h3>
            <div className="space-y-2">
              {equipment.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <span className="text-slate-400 ml-2">({item.category} · {item.city})</span>
                    <div className="text-[11px] text-slate-500">Status: {item.status}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status !== 'Under Maintenance' ? (
                      <button
                        onClick={() => updateEquipmentStatus(item.id, 'Under Maintenance')}
                        className="px-2.5 py-1 text-amber-700 hover:bg-amber-50 rounded border border-amber-200 cursor-pointer text-[11px]"
                      >
                        Flag for Maintenance
                      </button>
                    ) : (
                      <button
                        onClick={() => updateEquipmentStatus(item.id, 'Available')}
                        className="px-2.5 py-1 text-emerald-700 hover:bg-emerald-50 rounded border border-emerald-200 cursor-pointer text-[11px]"
                      >
                        Restore Available
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTabSub === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-slate-900 text-base">
                System Security & Administrative Audit Trail
              </h3>
              <p className="text-xs text-slate-500">
                Timestamped records of role switches, handover verifications, and resource allocations.
              </p>
            </div>
            <button
              onClick={resetToSampleData}
              className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg text-xs hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-100">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Action Event</th>
                    <th className="px-4 py-3">Actor / Role</th>
                    <th className="px-4 py-3">Audit Details</th>
                    <th className="px-4 py-3">Client Host</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 whitespace-nowrap text-slate-500 tabular-nums">
                        {log.timestamp}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-teal-800 whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">
                        {log.actorName} ({log.actorRole})
                      </td>
                      <td className="px-4 py-2.5 font-sans text-slate-600 max-w-md truncate">
                        {log.details}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* QR Handover Modal instance */}
      {selectedHandoverForQR && (
        <QRHandoverModal
          handover={selectedHandoverForQR.record}
          mode={selectedHandoverForQR.mode}
          actionType={selectedHandoverForQR.actionType}
          onClose={() => setSelectedHandoverForQR(null)}
        />
      )}

      {/* Review Modal instance */}
      {selectedHandoverForReview && (
        <ReviewModal
          handover={selectedHandoverForReview}
          onClose={() => setSelectedHandoverForReview(null)}
        />
      )}
    </div>
  );
};
