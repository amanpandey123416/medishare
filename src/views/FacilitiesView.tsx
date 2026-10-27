import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HealthcareFacility, FacilityCategory } from '../types';
import { InteractiveMap } from '../components/InteractiveMap';
import {
  Building2,
  Search,
  Filter,
  MapPin,
  Clock,
  Phone,
  ExternalLink,
  ShieldCheck,
  Navigation,
  Globe
} from 'lucide-react';

export const FacilitiesView: React.FC = () => {
  const { facilities } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'map-list' | 'map-only' | 'list-only'>('map-list');

  const categories: (FacilityCategory | 'All')[] = [
    'All',
    'Blood Bank',
    'Hospital',
    'Medical Equipment Lending Hub',
    'Authorised Medicine Disposal Site',
    'Licensed 24/7 Pharmacy',
  ];

  const filteredFacilities = facilities.filter((fac) => {
    const matchesCategory = selectedCategory === 'All' || fac.category === selectedCategory;
    const matchesCity = selectedCity === 'All' || fac.city === selectedCity;
    const matchesSearch =
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.services.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesCity && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
            Healthcare Facilities & Community Hubs Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Search verified regional blood banks, charitable equipment lending depots, hospitals, and licensed medicine disposal drop-offs.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-medium self-start md:self-auto border border-slate-200">
          <button
            onClick={() => setViewMode('map-list')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'map-list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Map + Directory
          </button>
          <button
            onClick={() => setViewMode('map-only')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'map-only' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Full Map
          </button>
          <button
            onClick={() => setViewMode('list-only')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'list-only' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cards Only
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search facility by name, service, or locality..."
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

        {/* Quick category pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium text-[11px] mr-1 shrink-0">Filter:</span>
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

      {/* Interactive Leaflet Map */}
      {(viewMode === 'map-list' || viewMode === 'map-only') && (
        <section className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Geographic OpenStreetMap View</span>
            <span>Click any marker to inspect services and get turn-by-turn directions</span>
          </div>
          <InteractiveMap
            facilities={filteredFacilities}
            selectedCategory={selectedCategory}
          />
        </section>
      )}

      {/* Facility Cards Grid */}
      {(viewMode === 'map-list' || viewMode === 'list-only') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredFacilities.length} verified healthcare institutions</span>
            <span className="text-[11px] text-slate-400">Sample verified directory</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFacilities.map((fac) => (
              <div
                key={fac.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                      {fac.category}
                    </span>
                    {fac.verified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-semibold text-slate-900 text-base leading-snug">
                    {fac.name}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{fac.address}, {fac.city}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700">{fac.operatingHours}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{fac.phone}</span>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium block mb-1">
                      Key Services & Support:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {fac.services.map((svc, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded"
                        >
                          {svc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {fac.website ? (
                    <a
                      href={fac.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Website
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400">Direct desk only</span>
                  )}

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${fac.coordinates[0]},${fac.coordinates[1]}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
