import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MedicalSupply } from '../types';
import {
  Boxes,
  PlusCircle,
  ShieldCheck,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Building2,
  PackageCheck,
  X,
  Search
} from 'lucide-react';

export const MedicalSuppliesView: React.FC = () => {
  const { supplies, addMedicalSupply, reserveSupply, currentUser, setCurrentRole } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [reserveModalItem, setReserveModalItem] = useState<MedicalSupply | null>(null);
  const [reserveQuantity, setReserveQuantity] = useState(1);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [supplyForm, setSupplyForm] = useState({
    name: '',
    category: 'Sterile Dressings & Bandages' as MedicalSupply['category'],
    quantity: 10,
    unit: 'Boxes',
    packagingCondition: 'Factory Sealed & Pristine' as const,
    expiryDate: '2028-12-31',
    storageRequirements: 'Cool, dry ambient storage below 30°C',
    city: currentUser.city || 'Mumbai',
    serviceArea: '',
    donorOrg: currentUser.organizationName || 'MediShare Community Partner',
  });

  const categories: (MedicalSupply['category'] | 'All')[] = [
    'All',
    'Unopened First-Aid',
    'Sterile Dressings & Bandages',
    'Personal Protective Equipment',
    'Non-Drug Diagnostic Consumables',
    'Sanitation & Disinfection',
  ];

  const filteredSupplies = supplies.filter((s) => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesCity = selectedCity === 'All' || s.city === selectedCity;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.donorOrg.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesCity && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplyForm.name.trim() || !supplyForm.serviceArea.trim()) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    // Check expiry
    const exp = new Date(supplyForm.expiryDate);
    if (exp <= new Date()) {
      alert('Cannot list expired supplies. Expiry date must be in the future.');
      return;
    }

    addMedicalSupply({
      name: supplyForm.name,
      category: supplyForm.category,
      quantity: Number(supplyForm.quantity),
      unit: supplyForm.unit,
      packagingCondition: supplyForm.packagingCondition,
      expiryDate: supplyForm.expiryDate,
      storageRequirements: supplyForm.storageRequirements,
      city: supplyForm.city,
      serviceArea: supplyForm.serviceArea,
      donorOrg: supplyForm.donorOrg,
      donorId: currentUser.id,
      status: 'Available',
    });

    setShowAddModal(false);
  };

  const handleReserveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserveModalItem) return;

    const res = reserveSupply(reserveModalItem.id, reserveQuantity);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setReserveModalItem(null);
        setFeedback(null);
      }, 1500);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
            Medical Supply Donation & Allocation
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Coordination of legally permitted, factory-sealed first-aid kits, surgical PPE, and non-drug clinical disposables.
          </p>
        </div>

        <button
          onClick={() => {
            if (currentUser.role !== 'ngo' && currentUser.role !== 'donor' && currentUser.role !== 'admin') {
              setCurrentRole('ngo');
            }
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>List Verified Supplies</span>
        </button>
      </div>

      {/* Safety Notice */}
      <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-950 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold text-teal-900">Permitted Supplies Protocol:</strong> Only unopened, non-expired, and non-drug consumables (e.g. sterile gauze, nitrile gloves, digital thermometers, and PPE) are eligible for donation. All items must remain in factory moisture-barrier packaging.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search supplies by name or donor organization..."
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
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="All">All Categories</option>
              {categories.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Supply Cards Grid */}
      <div className="space-y-4">
        <div className="text-xs text-slate-500">
          Showing {filteredSupplies.length} verified supply batches
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSupplies.map((supply) => (
            <div
              key={supply.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                    {supply.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Exp: {supply.expiryDate}
                  </span>
                </div>

                <h3 className="font-display font-semibold text-slate-900 text-sm leading-snug">
                  {supply.name}
                </h3>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Available Quantity:</span>
                    <span className="font-bold font-display text-slate-900 tabular-nums">
                      {supply.quantity} {supply.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Packaging:</span>
                    <span className="text-slate-700">{supply.packagingCondition}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{supply.city} · {supply.serviceArea}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{supply.donorOrg}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 italic">
                    Storage: {supply.storageRequirements}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-700 font-medium">
                  {supply.status}
                </span>

                {supply.status === 'Available' && supply.quantity > 0 ? (
                  <button
                    onClick={() => {
                      setReserveModalItem(supply);
                      setReserveQuantity(1);
                    }}
                    className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Request Batch
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">Allocated</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reserve Supply Modal */}
      {reserveModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-display font-semibold text-slate-900 text-base">
                  Allocate Medical Supply Batch
                </h3>
                <p className="text-slate-500">{reserveModalItem.name}</p>
              </div>
              <button
                onClick={() => setReserveModalItem(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReserveSubmit} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div><strong>Donor Organisation:</strong> {reserveModalItem.donorOrg}</div>
                <div><strong>Location:</strong> {reserveModalItem.city} ({reserveModalItem.serviceArea})</div>
                <div><strong>In Stock:</strong> {reserveModalItem.quantity} {reserveModalItem.unit}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity Required ({reserveModalItem.unit}) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={reserveModalItem.quantity}
                  value={reserveQuantity}
                  onChange={(e) => setReserveQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purpose / Clinic Camp Description *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Free suburban community medical camp dressing requirements..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                    feedback.type === 'success'
                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600 mt-0.5" />
                  <span>{feedback.message}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReserveModalItem(null)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Confirm Batch Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supply Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-display font-semibold text-slate-900 text-base">
                  List Verified Non-Drug Medical Supplies
                </h3>
                <p className="text-slate-500">Unused, factory-sealed first aid & clinical consumables.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Item Name & Specification *
                </label>
                <input
                  type="text"
                  required
                  value={supplyForm.name}
                  onChange={(e) => setSupplyForm({ ...supplyForm, name: e.target.value })}
                  placeholder="e.g. Sterile Gauze Bandages (Pack of 50)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={supplyForm.category}
                    onChange={(e) => setSupplyForm({ ...supplyForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Packaging Condition *
                  </label>
                  <select
                    value={supplyForm.packagingCondition}
                    onChange={(e) => setSupplyForm({ ...supplyForm, packagingCondition: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Factory Sealed & Pristine">Factory Sealed & Pristine</option>
                    <option value="Original Intact Packaging">Original Intact Packaging</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={supplyForm.quantity}
                    onChange={(e) => setSupplyForm({ ...supplyForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit Type *
                  </label>
                  <input
                    type="text"
                    value={supplyForm.unit}
                    onChange={(e) => setSupplyForm({ ...supplyForm, unit: e.target.value })}
                    placeholder="e.g. Boxes of 100"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={supplyForm.expiryDate}
                    onChange={(e) => setSupplyForm({ ...supplyForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City *
                  </label>
                  <select
                    value={supplyForm.city}
                    onChange={(e) => setSupplyForm({ ...supplyForm, city: e.target.value })}
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
                    Service Area / Locality *
                  </label>
                  <input
                    type="text"
                    required
                    value={supplyForm.serviceArea}
                    onChange={(e) => setSupplyForm({ ...supplyForm, serviceArea: e.target.value })}
                    placeholder="e.g. Dadar & Parel"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Storage Requirements
                </label>
                <input
                  type="text"
                  value={supplyForm.storageRequirements}
                  onChange={(e) => setSupplyForm({ ...supplyForm, storageRequirements: e.target.value })}
                  placeholder="e.g. Cool, dry cabinet away from direct heat"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
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
                  Submit Supply Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
