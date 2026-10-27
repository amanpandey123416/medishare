import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AssistanceRequest, RequestUrgency, EquipmentCategory } from '../types';
import { findMatchesForRequest, MatchResult } from '../utils/matchingEngine';
import {
  FileText,
  PlusCircle,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export const AssistanceView: React.FC = () => {
  const {
    requests,
    createAssistanceRequest,
    updateRequestStatus,
    assignMatchedResource,
    equipment,
    supplies,
    currentUser,
    setActiveTab
  } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequestForMatch, setSelectedRequestForMatch] = useState<AssistanceRequest | null>(null);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterCity, setFilterCity] = useState<string>('All');

  // Form State
  const [newReq, setNewReq] = useState({
    title: '',
    category: 'Wheelchairs & Mobility' as AssistanceRequest['category'],
    description: '',
    quantityRequired: 1,
    city: currentUser.city || 'Mumbai',
    serviceArea: '',
    urgency: 'Urgent (1-3 Days)' as RequestUrgency,
    contactPreference: 'In-App Message' as AssistanceRequest['contactPreference'],
  });

  const categories = [
    'Wheelchairs & Mobility',
    'Hospital Beds & Mattresses',
    'Walking Aids & Crutches',
    'Patient Transfer & Lifts',
    'Respiratory & Suction',
    'Bathroom & Hygiene Aids',
    'Blood donor connection',
    'Hospital resource information',
    'Medical supply assistance',
    'Other non-diagnostic assistance'
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReq.title.trim() || !newReq.description.trim() || !newReq.serviceArea.trim()) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    createAssistanceRequest({
      userId: currentUser.id,
      userName: currentUser.name,
      userContact: currentUser.phone || currentUser.email,
      title: newReq.title,
      category: newReq.category,
      description: newReq.description,
      quantityRequired: Number(newReq.quantityRequired),
      city: newReq.city,
      serviceArea: newReq.serviceArea,
      urgency: newReq.urgency,
      contactPreference: newReq.contactPreference,
    });

    setShowCreateModal(false);
    setNewReq({
      title: '',
      category: 'Wheelchairs & Mobility',
      description: '',
      quantityRequired: 1,
      city: currentUser.city || 'Mumbai',
      serviceArea: '',
      urgency: 'Urgent (1-3 Days)',
      contactPreference: 'In-App Message',
    });
  };

  const handleOpenSmartMatch = (req: AssistanceRequest) => {
    setSelectedRequestForMatch(req);
    const results = findMatchesForRequest(req, equipment, supplies);
    setMatchResults(results);
  };

  const handleAssignMatch = (resId: string, resName: string) => {
    if (!selectedRequestForMatch) return;
    assignMatchedResource(selectedRequestForMatch.id, resId, resName);
    setSelectedRequestForMatch(null);
  };

  // Status pill helper
  const renderStatus = (status: AssistanceRequest['status']) => {
    switch (status) {
      case 'Submitted':
        return <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Submitted</span>;
      case 'Under Review':
        return <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Under Review</span>;
      case 'Matched':
        return <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Matched to Resource</span>;
      case 'Assistance Arranged':
        return <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">Assistance Arranged</span>;
      case 'Completed':
        return <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Completed</span>;
      case 'Cancelled':
        return <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">Cancelled</span>;
    }
  };

  const getUrgencyBadge = (urgency: RequestUrgency) => {
    if (urgency.startsWith('Critical')) {
      return <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">Critical (24h)</span>;
    }
    if (urgency.startsWith('Urgent')) {
      return <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">Urgent (1-3 Days)</span>;
    }
    return <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Standard</span>;
  };

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    const matchesCity = filterCity === 'All' || r.city === filterCity;
    return matchesStatus && matchesCity;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
            Medical Assistance Request System
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Submit non-diagnostic healthcare assistance requests for mobility equipment, hospital resources, and verified NGO coordination.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Assistance Request</span>
        </button>
      </div>

      {/* Safety Notice */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="font-semibold text-amber-900">Non-Emergency Service Notice:</strong>
          <p className="text-slate-700 leading-relaxed">
            MediShare facilitates volunteer community aid and medical hardware lending. It is not an emergency dispatch system or clinical hotline. For immediate life-threatening events, dial 112 or contact the nearest hospital trauma unit immediately.
          </p>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Filter Requests:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Matched">Matched</option>
            <option value="Assistance Arranged">Assistance Arranged</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="All">All Cities</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Pune">Pune</option>
            <option value="Delhi NCR">Delhi NCR</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{filteredRequests.length}</span> active assistance cases
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((req) => (
          <div
            key={req.id}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {getUrgencyBadge(req.urgency)}
                <span className="text-xs text-slate-500 font-medium">Category: {req.category}</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-400">Qty: {req.quantityRequired}</span>
              </div>
              <div className="flex items-center gap-2">
                {renderStatus(req.status)}
                <span className="text-[11px] text-slate-400 tabular-nums">
                  Submitted: {req.requestedDate}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              <div className="lg:col-span-8 space-y-2">
                <h3 className="font-display font-semibold text-slate-900 text-base leading-snug">
                  {req.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {req.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.city} · {req.serviceArea}</span>
                  </div>
                  <div>
                    Requester: <strong className="text-slate-700">{req.userName}</strong>
                  </div>
                  <div>
                    Preferred Contact: <strong className="text-slate-700">{req.contactPreference}</strong>
                  </div>
                </div>

                {req.matchedResourceName && (
                  <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2 mt-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Matched Resource:</span> {req.matchedResourceName}
                      {req.assignedOrgName && (
                        <span className="block text-[11px] text-blue-700">Assigned Coordinator: {req.assignedOrgName}</span>
                      )}
                    </div>
                  </div>
                )}

                {req.notes && (
                  <div className="text-[11px] text-slate-500 italic">
                    Log note: {req.notes}
                  </div>
                )}
              </div>

              {/* Action Buttons Column */}
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2 lg:items-end justify-center pt-2 lg:pt-0">
                {/* 1-Click Smart Matching Trigger */}
                <button
                  onClick={() => handleOpenSmartMatch(req)}
                  className="w-full sm:w-auto lg:w-full px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Run Smart Match Engine</span>
                </button>

                {/* Status modification for NGO or Admin or Request Owner */}
                {(currentUser.role === 'ngo' || currentUser.role === 'admin' || currentUser.id === req.userId) && (
                  <div className="flex items-center gap-1.5 w-full justify-end">
                    {req.status === 'Submitted' && (
                      <button
                        onClick={() => updateRequestStatus(req.id, 'Under Review', 'Review initiated by coordinator')}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg cursor-pointer"
                      >
                        Start Review
                      </button>
                    )}
                    {req.status !== 'Completed' && req.status !== 'Cancelled' && (
                      <button
                        onClick={() => updateRequestStatus(req.id, 'Completed', 'Assistance handed over and closed')}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg cursor-pointer font-medium"
                      >
                        Mark Completed
                      </button>
                    )}
                    {req.status !== 'Cancelled' && req.status !== 'Completed' && (
                      <button
                        onClick={() => updateRequestStatus(req.id, 'Cancelled', 'Cancelled by requester')}
                        className="px-2.5 py-1.5 border border-slate-200 text-slate-500 hover:text-rose-700 text-xs rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Smart Match Results Drawer / Modal */}
      {selectedRequestForMatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-teal-700 font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>Rule-Based Smart Resource Matcher</span>
                </div>
                <h3 className="font-display font-semibold text-slate-900 text-base mt-1">
                  Matching Inventory for: "{selectedRequestForMatch.title}"
                </h3>
                <p className="text-xs text-slate-500">
                  Target: {selectedRequestForMatch.city} · {selectedRequestForMatch.serviceArea} ({selectedRequestForMatch.urgency})
                </p>
              </div>
              <button
                onClick={() => setSelectedRequestForMatch(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
              <strong>Application Recommendation Notice:</strong> Recommendations and match percentages are computed using local rule logic (category, geographic locality, quantity, and verified sanitation). The score represents an application-level inventory match, not a clinical prescription.
            </div>

            {matchResults.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Search className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">No direct inventory match in this specific locality.</p>
                <button
                  onClick={() => {
                    setSelectedRequestForMatch(null);
                    setActiveTab('equipment');
                  }}
                  className="text-xs text-teal-700 font-semibold underline cursor-pointer"
                >
                  Browse all equipment catalogue
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {matchResults.map((match) => (
                  <div
                    key={match.resourceId}
                    className="p-4 rounded-xl border border-teal-200/80 bg-teal-50/30 hover:bg-teal-50/60 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-slate-900 text-sm">
                            {match.resourceName}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                            {match.resourceType}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Location: {match.city} ({match.serviceArea})
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-extrabold font-display text-teal-700 tabular-nums">
                          {match.score}%
                        </div>
                        <div className="text-[10px] text-teal-600 font-medium">Match Fit</div>
                      </div>
                    </div>

                    {/* Explanations */}
                    <div className="space-y-1 pt-1 border-t border-teal-100 text-[11px] text-slate-600">
                      {match.explanations.map((exp, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-teal-600 shrink-0" />
                          <span>{exp}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleAssignMatch(match.resourceId, match.resourceName)}
                        className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Assign This Resource
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedRequestForMatch(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close Matcher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Assistance Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-display font-semibold text-slate-900 text-base">
                  Create Healthcare Assistance Request
                </h3>
                <p className="text-xs text-slate-500">
                  Submitting as: <strong className="text-slate-800">{currentUser.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Request Summary / Title *
                </label>
                <input
                  type="text"
                  required
                  value={newReq.title}
                  onChange={(e) => setNewReq({ ...newReq, title: e.target.value })}
                  placeholder="e.g. Need manual wheelchair for 3 weeks post hip-fracture surgery"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Resource Category *
                  </label>
                  <select
                    value={newReq.category}
                    onChange={(e) => setNewReq({ ...newReq, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Urgency Level *
                  </label>
                  <select
                    value={newReq.urgency}
                    onChange={(e) => setNewReq({ ...newReq, urgency: e.target.value as RequestUrgency })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Critical (Within 24h)">Critical (Within 24h)</option>
                    <option value="Urgent (1-3 Days)">Urgent (1-3 Days)</option>
                    <option value="Standard (Within a Week)">Standard (Within a Week)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantity Required
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newReq.quantityRequired}
                    onChange={(e) => setNewReq({ ...newReq, quantityRequired: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City *
                  </label>
                  <select
                    value={newReq.city}
                    onChange={(e) => setNewReq({ ...newReq, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Pune">Pune</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Preference
                  </label>
                  <select
                    value={newReq.contactPreference}
                    onChange={(e) => setNewReq({ ...newReq, contactPreference: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="In-App Message">In-App Message</option>
                    <option value="Phone">Phone</option>
                    <option value="Email">Email</option>
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
                  value={newReq.serviceArea}
                  onChange={(e) => setNewReq({ ...newReq, serviceArea: e.target.value })}
                  placeholder="e.g. Koramangala 4th Block / Indiranagar"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description of Need *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newReq.description}
                  onChange={(e) => setNewReq({ ...newReq, description: e.target.value })}
                  placeholder="Provide context regarding patient mobility, delivery accessibility, or duration..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
