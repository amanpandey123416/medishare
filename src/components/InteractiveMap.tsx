import React, { useEffect, useRef, useState } from 'react';
import { HealthcareFacility, FacilityCategory } from '../types';
import L from 'leaflet';
import { MapPin, Navigation, Clock, Phone, ExternalLink, ShieldCheck } from 'lucide-react';

interface InteractiveMapProps {
  facilities: HealthcareFacility[];
  selectedCategory?: string;
  onSelectFacility?: (facility: HealthcareFacility) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  facilities,
  selectedCategory,
  onSelectFacility,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [activeFacility, setActiveFacility] = useState<HealthcareFacility | null>(null);

  const filteredFacilities = selectedCategory && selectedCategory !== 'All'
    ? facilities.filter((f) => f.category === selectedCategory)
    : facilities;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map centered at India coordinates (approx central point between Mumbai/Pune/Bengaluru)
      const map = L.map(mapContainerRef.current, {
        center: [16.5, 75.0],
        zoom: 6,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Custom icon generator
    const getMarkerIcon = (category: FacilityCategory) => {
      let bg = '#0d9488'; // teal
      if (category === 'Blood Bank') bg = '#e11d48'; // rose
      if (category === 'Authorised Medicine Disposal Site') bg = '#d97706'; // amber
      if (category === 'Hospital') bg = '#2563eb'; // blue

      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="background-color: ${bg}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); border: 2px solid white;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      });
    };

    // Add markers
    const group = L.featureGroup();

    filteredFacilities.forEach((fac) => {
      const marker = L.marker(fac.coordinates, { icon: getMarkerIcon(fac.category) });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; min-width: 180px;">
          <strong style="color: #0f172a; font-size: 13px; display: block; margin-bottom: 2px;">${fac.name}</strong>
          <span style="color: #64748b; font-size: 11px;">${fac.category} · ${fac.city}</span>
          <p style="margin: 6px 0; color: #334155; font-size: 11px;">${fac.address}</p>
          <div style="font-size: 10px; color: #0d9488; font-weight: 600;">${fac.operatingHours}</div>
        </div>
      `);

      marker.on('click', () => {
        setActiveFacility(fac);
        if (onSelectFacility) onSelectFacility(fac);
      });

      marker.addTo(map);
      group.addLayer(marker);
      markersRef.current.push(marker);
    });

    if (filteredFacilities.length > 0 && map) {
      map.fitBounds(group.getBounds().pad(0.2));
    }

    return () => {
      // cleanup markers
    };
  }, [filteredFacilities, onSelectFacility]);

  return (
    <div className="space-y-4">
      {/* Map Card */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
        <div
          ref={mapContainerRef}
          className="w-full h-80 sm:h-96 z-10"
          style={{ minHeight: '340px' }}
        />

        {/* Floating Legend */}
        <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-xs px-3 py-2 rounded-xl border border-slate-200 text-[11px] shadow-sm space-y-1">
          <div className="font-semibold text-slate-700 mb-1">Resource Pins</div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
            <span>Blood Bank</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span>Hospital</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
            <span>Medicine Take-Back Site</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
            <span>Equipment Lending Hub</span>
          </div>
        </div>
      </div>

      {/* Selected Facility Details Card (if clicked) */}
      {activeFacility && (
        <div className="p-4 bg-white rounded-xl border border-teal-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                {activeFacility.category}
              </span>
              {activeFacility.verified && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Partner
                </span>
              )}
            </div>
            <h4 className="font-display font-semibold text-slate-900 text-sm">{activeFacility.name}</h4>
            <p className="text-xs text-slate-500">{activeFacility.address}, {activeFacility.city}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {activeFacility.operatingHours}
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {activeFacility.phone}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${activeFacility.coordinates[0]},${activeFacility.coordinates[1]}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              Get Directions
            </a>
            {activeFacility.website && (
              <a
                href={activeFacility.website}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Website
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
