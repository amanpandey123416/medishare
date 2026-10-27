import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EquipmentItem, EquipmentCategory, EquipmentCondition } from '../types';
import {
  Search,
  Filter,
  PackagePlus,
  ShieldCheck,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  X,
  Star,
  Info,
  Check
} from 'lucide-react';
import { QRHandoverModal } from '../components/QRHandoverModal';

export const EquipmentView: React.FC = () => {
  const {
    equipment,
    requestEquipment,
    addEquipment,
    currentUser,
    handovers,
    reviews,
    setCurrentRole
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');

  // Modals
  const [activeItemForDetail, setActiveItemForDetail] = useState<EquipmentItem | null>(null);
  const [requestModalItem, setRequestModalItem] = useState<EquipmentItem | null>(null);
  const [borrowerNotes, setBorrowerNotes] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeHandoverForQR, setActiveHandoverForQR] = useState<any | null>(null);

  // New Equipment Form State
  const [newEquip, setNewEquip] = useState({
    name: '',
    category: 'Wheelchairs & Mobility' as EquipmentCategory,
    condition: 'Gently Used / Certified' as EquipmentCondition,
    type: 'Lending' as 'Lending' | 'Donation',
    city: currentUser.city || 'Mumbai',
    serviceArea: '',
    description: '',
    cleaningStatus: 'Sanitized & Inspected' as const,
    handlingInstructions: '',
    maxLendingDays: 30,
    requiresInspectionNotice: true,
  });

  // Categories list
  const categories: (EquipmentCategory | 'All')[] = [
    'All',
    'Wheelchairs & Mobility',
    'Hospital Beds & Mattresses',
    'Walking Aids & Crutches',
    'Patient Transfer & Lifts',
    'Respiratory & Suction',
    'Bathroom & Hygiene Aids',
    'Monitoring & Non-Invasive'
  ];

  // Filtering
  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serviceArea.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesType = selectedType === 'All' || item.type === selectedType;
    const matchesCity = selectedCity === 'All' || item.city === selectedCity;
    const matchesCondition = selectedCondition === 'All' || item.condition === selectedCondition;

    return matchesSearch && matchesCategory && matchesType && matchesCity && matchesCondition;
  });

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestModalItem) return;

    const res = requestEquipment(requestModalItem.id, borrowerNotes);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      if (res.handover) {
        setActiveHandoverForQR(res.handover);
      }
      setTimeout(() => {
        setRequestModalItem(null);
        setBorrowerNotes('');
        setFeedback(null);
      }, 1800);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEquip.name.trim() || !newEquip.serviceArea.trim() || !newEquip.description.trim()) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    addEquipment({
      name: newEquip.name,
      category: newEquip.category,
      condition: newEquip.condition,
      type: newEquip.type,
      status: 'Available',
      donorId: currentUser.id,
      donorName: currentUser.name,
      donorOrg: currentUser.organizationName,
      city: newEquip.city,
      serviceArea: newEquip.serviceArea,
      description: newEquip.description,
      cleaningStatus: newEquip.cleaningStatus,
      handlingInstructions: newEquip.handlingInstructions,
      maxLendingDays: newEquip.type === 'Lending' ? Number(newEquip.maxLendingDays) : undefined,
      requiresInspectionNotice: newEquip.requiresInspectionNotice,
    });

    setShowAddModal(false);
    // Reset form
    setNewEquip({
      name: '',
      category: 'Wheelchairs & Mobility',
      condition: 'Gently Used / Certified',
      type: 'Lending',
      city: currentUser.city || 'Mumbai',
      serviceArea: '',
      description: '',
      cleaningStatus: 'Sanitized & Inspected',
      handlingInstructions: '',
      maxLendingDays: 30,
      requiresInspectionNotice: true,
    });
  };

  // Helper for status badge
  const renderStatusBadge = (status: EquipmentItem['status']) => {
    switch (status) {
      case 'Available':
        return <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Available</span>;
      case 'Requested':
        return <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Pending Approval</span>;
      case 'Approved':
      case 'Handover Scheduled':
        return <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Handover Scheduled</span>;
      case 'Handed Over':
        return <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">In Patient Use</span>;
      case 'Under Maintenance':
        return <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">Maintenance</span>;
      default:
        return <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
            Medical Equipment Lending & Donation
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Discover sanitized wheelchairs, adjustable beds, and walking aids loaned or gifted by vetted community donors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (currentUser.role !== 'donor' && currentUser.role !== 'ngo' && currentUser.role !== 'admin') {
                setCurrentRole('donor');
              }
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <PackagePlus className="w-4 h-4" />
            <span>List Equipment</span>
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-950 flex items-start gap-3">
        <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold text-teal-900">Sanitation & Handling Protocol:</strong> All equipment must be cleaned and disinfected according to manufacturer guidelines prior to handover. Equipment that requires calibration, mechanical assembly, or clinical supervision should only be operated after consulting a qualified healthcare professional. MediShare does not certify safety or clinical efficacy.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by equipment name, description, or neighborhood..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="All">All Types (Lending / Gift)</option>
              <option value="Lending">Lending Only</option>
              <option value="Donation">Permanent Donation</option>
            </select>

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
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="All">All Conditions</option>
              <option value="Brand New">Brand New</option>
              <option value="Gently Used / Certified">Gently Used</option>
              <option value="Good Condition">Good Condition</option>
            </select>
          </div>
        </div>

        {/* Category Pills (Interactive Filter Controls as permitted by frontend-design Section 1.A) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium text-[11px] mr-1 shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer text-xs font-medium ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredEquipment.length} items</span>
          <span>Role mode: <strong className="text-slate-800">{currentUser.role}</strong></span>
        </div>

        {filteredEquipment.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-3">
            <PackagePlus className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="font-semibold text-slate-700 text-sm">No matching equipment found</h3>
            <p className="text-xs">Try adjusting your keyword, city filter, or category selection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">{item.category}</span>
                    {renderStatusBadge(item.status)}
                  </div>

                  <h3
                    onClick={() => setActiveItemForDetail(item)}
                    className="font-display font-semibold text-slate-900 text-base leading-snug hover:text-teal-700 cursor-pointer"
                  >
                    {item.name}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.city} · {item.serviceArea}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-emerald-700">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.cleaningStatus}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Condition: {item.condition} · {item.type === 'Lending' ? `Max ${item.maxLendingDays} days` : 'Permanent Gift'}</span>
                    </div>

                    {item.donorOrg && (
                      <div className="text-[11px] text-teal-800 font-medium">
                        Coordination: {item.donorOrg}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveItemForDetail(item)}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium underline cursor-pointer"
                  >
                    View Details
                  </button>

                  {item.status === 'Available' ? (
                    <button
                      onClick={() => setRequestModalItem(item)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Request Item
                    </button>
                  ) : item.status === 'Requested' ? (
                    <span className="text-xs text-amber-700 font-medium">
                      Under Review
                    </span>
                  ) : item.status === 'Handed Over' ? (
                    <span className="text-xs text-purple-700 font-medium">
                      Currently Loaned
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Equipment Detail Modal */}
      {activeItemForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="text-xs text-teal-700 font-semibold">{activeItemForDetail.category}</div>
                <h3 className="font-display font-bold text-slate-900 text-lg leading-snug">
                  {activeItemForDetail.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveItemForDetail(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <span className="font-semibold text-slate-900 block mb-1">Description:</span>
                <p className="leading-relaxed">{activeItemForDetail.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block">Condition</span>
                  <span className="font-semibold text-slate-800">{activeItemForDetail.condition}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Transaction Type</span>
                  <span className="font-semibold text-slate-800">{activeItemForDetail.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Service Area</span>
                  <span className="font-semibold text-slate-800">{activeItemForDetail.city} · {activeItemForDetail.serviceArea}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Lending Window</span>
                  <span className="font-semibold text-slate-800">
                    {activeItemForDetail.maxLendingDays ? `${activeItemForDetail.maxLendingDays} Days` : 'Permanent'}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-900 block mb-1">Sanitization & Handling Checklist:</span>
                <div className="space-y-1.5 p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-emerald-950">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cleaning Status: {activeItemForDetail.cleaningStatus}</span>
                  </div>
                  {activeItemForDetail.handlingInstructions && (
                    <p className="text-[11px] text-slate-600 pt-1">
                      Instructions: {activeItemForDetail.handlingInstructions}
                    </p>
                  )}
                </div>
              </div>

              {activeItemForDetail.requiresInspectionNotice && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] space-y-1">
                  <div className="font-semibold flex items-center gap-1 text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Inspection Notice</span>
                  </div>
                  <p>
                    This hardware involves patient transfer or mechanical support. Caregivers must verify brake locks, pins, and harness clips prior to each patient use.
                  </p>
                </div>
              )}

              {/* Reviews for this equipment */}
              <div className="pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-900 block mb-2">Community Feedback:</span>
                {reviews.filter((r) => r.equipmentId === activeItemForDetail.id).length === 0 ? (
                  <p className="text-slate-400 italic">No feedback submitted for this item yet.</p>
                ) : (
                  <div className="space-y-2">
                    {reviews
                      .filter((r) => r.equipmentId === activeItemForDetail.id)
                      .map((rev) => (
                        <div key={rev.id} className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-800">{rev.reviewerName}</span>
                            <div className="flex items-center text-amber-500">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span className="ml-1 text-[11px] font-bold">{rev.rating}/5</span>
                            </div>
                          </div>
                          <p className="text-slate-600">{rev.comment}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setActiveItemForDetail(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>

              {activeItemForDetail.status === 'Available' && (
                <button
                  onClick={() => {
                    setRequestModalItem(activeItemForDetail);
                    setActiveItemForDetail(null);
                  }}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Request This Item
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {requestModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-display font-semibold text-slate-900 text-base">
                  Request Equipment Loan / Donation
                </h3>
                <p className="text-xs text-slate-500">{requestModalItem.name}</p>
              </div>
              <button
                onClick={() => setRequestModalItem(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Requester:</span>
                  <span className="font-medium text-slate-800">{currentUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">City / Service Area:</span>
                  <span className="font-medium text-slate-800">{requestModalItem.city} · {requestModalItem.serviceArea}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lending Terms:</span>
                  <span className="font-medium text-slate-800">
                    {requestModalItem.type === 'Lending' ? `Up to ${requestModalItem.maxLendingDays} days (Return required)` : 'Permanent gift'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Coordination Note for Donor (Optional)
                </label>
                <textarea
                  rows={3}
                  value={borrowerNotes}
                  onChange={(e) => setBorrowerNotes(e.target.value)}
                  placeholder="Need for post-surgery rehabilitation for 3 weeks; will pick up via personal vehicle..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-teal-900 text-[11px]">
                Upon reservation submission, a unique Handover QR Code will be generated. The donor or assigned NGO will verify this code when you receive the equipment.
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                    feedback.type === 'success'
                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRequestModalItem(null)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Submit Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-display font-semibold text-slate-900 text-base">
                  List Medical Equipment for Donation or Lending
                </h3>
                <p className="text-xs text-slate-500">
                  Listing as: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.role})
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Equipment Name & Model *
                </label>
                <input
                  type="text"
                  required
                  value={newEquip.name}
                  onChange={(e) => setNewEquip({ ...newEquip, name: e.target.value })}
                  placeholder="e.g. Karma VIP 515 Lightweight Wheelchair"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newEquip.category}
                    onChange={(e) => setNewEquip({ ...newEquip, category: e.target.value as EquipmentCategory })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Condition *
                  </label>
                  <select
                    value={newEquip.condition}
                    onChange={(e) => setNewEquip({ ...newEquip, condition: e.target.value as EquipmentCondition })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Gently Used / Certified">Gently Used / Certified</option>
                    <option value="Good Condition">Good Condition</option>
                    <option value="Requires Minor Service">Requires Minor Service</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Option *
                  </label>
                  <select
                    value={newEquip.type}
                    onChange={(e) => setNewEquip({ ...newEquip, type: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Lending">Lending (Returnable)</option>
                    <option value="Donation">Permanent Donation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City *
                  </label>
                  <select
                    value={newEquip.city}
                    onChange={(e) => setNewEquip({ ...newEquip, city: e.target.value })}
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
                    Max Loan Days
                  </label>
                  <input
                    type="number"
                    min={7}
                    max={180}
                    disabled={newEquip.type === 'Donation'}
                    value={newEquip.maxLendingDays}
                    onChange={(e) => setNewEquip({ ...newEquip, maxLendingDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service Area / Locality *
                </label>
                <input
                  type="text"
                  required
                  value={newEquip.serviceArea}
                  onChange={(e) => setNewEquip({ ...newEquip, serviceArea: e.target.value })}
                  placeholder="e.g. Andheri West / Juhu / Bandra"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description & Specifications *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newEquip.description}
                  onChange={(e) => setNewEquip({ ...newEquip, description: e.target.value })}
                  placeholder="Describe dimensions, weight limit, folding mechanism, accessories included..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cleaning & Sanitation Status *
                  </label>
                  <select
                    value={newEquip.cleaningStatus}
                    onChange={(e) => setNewEquip({ ...newEquip, cleaningStatus: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Sanitized & Inspected">Sanitized & Inspected</option>
                    <option value="Cleaned">Cleaned</option>
                    <option value="Pending Disinfection">Pending Disinfection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Handling Instructions
                  </label>
                  <input
                    type="text"
                    value={newEquip.handlingInstructions}
                    onChange={(e) => setNewEquip({ ...newEquip, handlingInstructions: e.target.value })}
                    placeholder="e.g. Assembly requires two adults"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <input
                  type="checkbox"
                  id="inspectNotice"
                  checked={newEquip.requiresInspectionNotice}
                  onChange={(e) => setNewEquip({ ...newEquip, requiresInspectionNotice: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="inspectNotice" className="text-[11px] text-slate-700">
                  Include Safety & Clinical Inspection Notice for borrowers
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Handover Code display if just requested */}
      {activeHandoverForQR && (
        <QRHandoverModal
          handover={activeHandoverForQR}
          mode="view-qr"
          actionType="HANDOVER"
          onClose={() => setActiveHandoverForQR(null)}
        />
      )}
    </div>
  );
};
