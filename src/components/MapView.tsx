import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Filter,
  Layers,
  MapPin,
  Crosshair,
  AlertTriangle,
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';
import { CivicIssue, IssueCategory, IssuePriority, IssueStatus } from '../types/issue';

interface MapViewProps {
  issues: CivicIssue[];
  onSelectIssue: (issue: CivicIssue) => void;
  pickerMode?: boolean;
  onPickLocation?: (coords: { lat: number; lng: number; address: string }) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
  highlightIssueId?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  issues,
  onSelectIssue,
  pickerMode = false,
  onPickLocation,
  initialCenter = [37.7785, -122.4150],
  initialZoom = 13,
  highlightIssueId
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [mapStyle, setMapStyle] = useState<'carto' | 'osm'>('carto');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Default tile layer: CartoDB Positron for clean startup-grade modern UI
    const tileUrl =
      mapStyle === 'carto'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tiles = L.tileLayer(tileUrl, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = markersGroup;

    // Picker Mode click listener
    if (pickerMode && onPickLocation) {
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;

        if (pickerMarkerRef.current) {
          pickerMarkerRef.current.setLatLng(e.latlng);
        } else {
          const pickerIcon = L.divIcon({
            className: 'custom-picker-pin',
            html: `
              <div style="background-color: #2563EB; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(37,99,235,0.5); border: 2.5px solid white;">
                <div style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 14px;">📍</div>
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 36]
          });
          pickerMarkerRef.current = L.marker([lat, lng], { icon: pickerIcon }).addTo(map);
        }

        // Reverse geocoding via OpenStreetMap Nominatim with fallback
        let address = `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'User-Agent': 'CivicPulse-AI-Hackathon' } }
          );
          if (resp.ok) {
            const data = await resp.json();
            if (data.display_name) {
              const parts = data.display_name.split(',');
              address = parts.slice(0, 3).join(',').trim();
            }
          }
        } catch {
          // Keep coordinate string fallback
        }

        onPickLocation({ lat, lng, address });
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Style
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Find and remove existing tile layer
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl =
      mapStyle === 'carto'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);
  }, [mapStyle]);

  // Render Issue Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const group = markersLayerRef.current;
    group.clearLayers();

    // Filter issues
    const filtered = issues.filter((issue) => {
      if (selectedCategory !== 'All' && issue.category !== selectedCategory) return false;
      if (selectedPriority !== 'All' && issue.priority !== selectedPriority) return false;
      if (selectedStatus !== 'All' && issue.status !== selectedStatus) return false;
      return true;
    });

    filtered.forEach((issue) => {
      const isHighPriority = issue.priority === 'High' && issue.status !== 'Resolved';
      const isHighlighted = issue.id === highlightIssueId;

      // Category color mapping
      const categoryColor = {
        Pothole: '#F59E0B',
        Garbage: '#8B5CF6',
        'Blocked Drain': '#06B6D4',
        'Water Leakage': '#2563EB',
        Other: '#64748B'
      }[issue.category];

      // Custom HTML Marker Icon
      const iconHtml = `
        <div class="relative group cursor-pointer ${isHighPriority ? 'pulse-critical' : ''}" style="width: 32px; height: 32px;">
          <div style="background-color: ${categoryColor}; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(15,23,42,0.25); border: 2.5px solid white;">
            <div style="transform: rotate(45deg); width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
          </div>
          ${
            isHighPriority
              ? `<span style="position: absolute; top: -4px; right: -4px; width: 10px; height: 10px; background-color: #EF4444; border-radius: 50%; border: 2px solid white;"></span>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'civic-marker-icon',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([issue.location.lat, issue.location.lng], {
        icon: customIcon
      });

      // Custom Leaflet Popup
      const popupHtml = `
        <div style="font-family: inherit; width: 260px; overflow: hidden; border-radius: 12px;">
          <div style="position: relative; height: 120px; width: 100%; background: #e2e8f0;">
            <img src="${issue.imageUrl}" alt="${issue.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'" />
            <div style="position: absolute; top: 8px; left: 8px; display: flex; gap: 4px;">
              <span style="font-size: 10px; font-weight: 700; background: rgba(15, 23, 42, 0.85); color: white; padding: 2px 6px; border-radius: 4px;">
                ${issue.id}
              </span>
              <span style="font-size: 10px; font-weight: 700; background: ${
                issue.priority === 'High' ? '#DC2626' : issue.priority === 'Medium' ? '#D97706' : '#059669'
              }; color: white; padding: 2px 6px; border-radius: 4px;">
                ${issue.priority}
              </span>
            </div>
            ${
              issue.isDemo
                ? `<span style="position: absolute; bottom: 6px; right: 6px; font-size: 9px; font-weight: 700; background: rgba(37,99,235,0.9); color: white; padding: 1px 5px; border-radius: 4px;">DEMO</span>`
                : ''
            }
          </div>
          <div style="padding: 12px; background: white;">
            <h4 style="font-weight: 700; font-size: 13px; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3;">
              ${issue.title}
            </h4>
            <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0;">
              📍 ${issue.location.address}
            </p>
            ${
              issue.aiAnalysis
                ? `<div style="font-size: 11px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 6px; border-radius: 6px; margin-bottom: 8px;">
                    <strong>AI:</strong> ${issue.aiAnalysis.summary.slice(0, 80)}...
                  </div>`
                : ''
            }
            <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 6px; border-top: 1px solid #f1f5f9;">
              <span style="font-size: 11px; font-weight: 600; color: ${
                issue.status === 'Resolved' ? '#059669' : issue.status === 'In Progress' ? '#D97706' : '#2563EB'
              };">
                ● ${issue.status}
              </span>
              <button id="btn-view-${issue.id}" style="background: #0f172a; color: white; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 600; cursor: pointer;">
                Inspect →
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 300 });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-view-${issue.id}`);
        if (btn) {
          btn.onclick = () => onSelectIssue(issue);
        }
      });

      marker.addTo(group);

      if (isHighlighted) {
        marker.openPopup();
      }
    });
  }, [issues, selectedCategory, selectedPriority, selectedStatus, highlightIssueId]);

  // Geolocation trigger
  const handleLocateUser = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapInstanceRef.current?.setView([latitude, longitude], 15);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err);
      }
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
      {/* Top Filter Bar Header */}
      <div className="p-3 sm:p-4 bg-white border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Pothole">Pothole</option>
            <option value="Garbage">Garbage</option>
            <option value="Blocked Drain">Blocked Drain</option>
            <option value="Water Leakage">Water Leakage</option>
            <option value="Other">Other</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* Right Tools: Map Style & Locate Me */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMapStyle(mapStyle === 'carto' ? 'osm' : 'carto')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition"
            title="Toggle map cartography style"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">
              {mapStyle === 'carto' ? 'Clean Light' : 'Standard OSM'}
            </span>
          </button>

          <button
            onClick={handleLocateUser}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 transition"
            title="Center on my location"
            aria-label="Locate me"
          >
            <Crosshair className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative flex-1 w-full min-h-[420px]">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {/* Picker Mode Instruction Banner */}
        {pickerMode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-navy-950/90 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-medium shadow-lg flex items-center gap-2 border border-slate-700 pointer-events-none">
            <MapPin className="w-4 h-4 text-blue-400 animate-bounce" />
            <span>Click anywhere on the map to place the issue pin</span>
          </div>
        )}

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-card border border-slate-200/80 text-xs hidden sm:block">
          <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2">
            Incident Legend
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pothole
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Garbage
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Blocked Drain
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Water Leak
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-rose-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Pulsing Pin: High Priority / Active Hazard
          </div>
        </div>
      </div>
    </div>
  );
};
