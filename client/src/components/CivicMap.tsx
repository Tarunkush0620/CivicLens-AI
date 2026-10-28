import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { ComplaintRecord } from '../types';
import { getCategoryColor } from './CategoryChip';
import { Navigation, MapPin } from 'lucide-react';

interface CivicMapProps {
  cases: ComplaintRecord[];
  selectedCaseId?: string | null;
  onSelectCase?: (caseItem: ComplaintRecord) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
  showFilters?: boolean;
  disablePopups?: boolean;
  userLocation?: [number, number] | null;
}

export const CivicMap: React.FC<CivicMapProps> = ({
  cases = [],
  selectedCaseId,
  onSelectCase,
  center = [28.6139, 77.2090], // Default center
  zoom = 13,
  className = '',
  disablePopups = false,
  userLocation: propUserLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userLocationLayerRef = useRef<L.LayerGroup | null>(null);

  const [liveUserCoords, setLiveUserCoords] = useState<[number, number] | null>(() => {
    if (propUserLocation) return propUserLocation;
    try {
      const saved = localStorage.getItem('civiclens_user_coords');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lat && parsed.lng) return [parsed.lat, parsed.lng];
      }
    } catch {}
    return null;
  });

  const [liveUserAddress, setLiveUserAddress] = useState<string>(() => {
    return localStorage.getItem('civiclens_user_location_name') || 'Your Live Location';
  });

  // Listen to custom location updates from permission modal or GPS tracker
  useEffect(() => {
    const handleLocationUpdate = (e: any) => {
      if (e.detail && e.detail.lat && e.detail.lng) {
        const newCoords: [number, number] = [e.detail.lat, e.detail.lng];
        setLiveUserCoords(newCoords);
        if (e.detail.address) {
          setLiveUserAddress(e.detail.address);
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(newCoords, 14, { duration: 1.2 });
        }
      }
    };

    const handleRecenterEvent = () => {
      handleRecenterOnUser();
    };

    window.addEventListener('civiclens_location_updated', handleLocationUpdate);
    window.addEventListener('civiclens_recenter_user_location', handleRecenterEvent);
    return () => {
      window.removeEventListener('civiclens_location_updated', handleLocationUpdate);
      window.removeEventListener('civiclens_recenter_user_location', handleRecenterEvent);
    };
  }, []);

  // Center on user's actual location if provided in props
  useEffect(() => {
    if (propUserLocation) {
      setLiveUserCoords(propUserLocation);
    }
  }, [propUserLocation]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // If live user location is available initially, center on it
      const initialCenter: [number, number] = liveUserCoords || center;
      const initialZoom = liveUserCoords ? 14 : zoom;

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView(initialCenter, initialZoom);

      // Clean OpenStreetMap tiles
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add Zoom control bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add Markers Layer Group for Complaints
      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;

      // Add User Location Layer Group
      const userGroup = L.layerGroup().addTo(map);
      userLocationLayerRef.current = userGroup;

      mapInstanceRef.current = map;

      // Invalidate size once DOM stabilizes
      setTimeout(() => {
        map.invalidateSize();
      }, 200);

      const handleResize = () => {
        map.invalidateSize();
      };
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render & Update User Live Location Beacon on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocationLayerRef.current) return;

    userLocationLayerRef.current.clearLayers();

    if (!liveUserCoords) return;

    // High precision pulsating blue radar marker
    const userLocationIcon = L.divIcon({
      className: 'civic-user-live-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; cursor: pointer;">
          <!-- Animated Radar Ring 1 -->
          <div style="position: absolute; width: 42px; height: 42px; border-radius: 9999px; background: rgba(59, 130, 246, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <!-- Pulse Halo -->
          <div style="position: absolute; width: 26px; height: 26px; border-radius: 9999px; background: rgba(37, 99, 235, 0.25); border: 2px solid rgba(59, 130, 246, 0.8);"></div>
          <!-- Solid Core Dot -->
          <div style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background: #2563EB; border: 2.5px solid #FFFFFF; box-shadow: 0 0 10px rgba(37, 99, 235, 0.9);"></div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const userMarker = L.marker(liveUserCoords, {
      icon: userLocationIcon,
      zIndexOffset: 1000, // keep on top of complaint pins
    });

    const popupHtml = `
      <div style="font-family: 'Manrope', system-ui, sans-serif; padding: 6px; text-align: center; min-width: 170px;">
        <div style="display: flex; items-center; justify-content: center; gap: 4px; margin-bottom: 3px;">
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #2563EB; letter-spacing: 0.05em;">
            📍 Your Actual Location
          </span>
        </div>
        <div style="font-size: 12px; font-weight: 800; color: #0F172A; line-height: 1.3;">
          ${liveUserAddress}
        </div>
        <div style="font-size: 10px; color: #64748B; margin-top: 4px;">
          Live GPS Position (${liveUserCoords[0].toFixed(4)}°, ${liveUserCoords[1].toFixed(4)}°)
        </div>
      </div>
    `;

    userMarker.bindPopup(popupHtml);
    userLocationLayerRef.current.addLayer(userMarker);
  }, [liveUserCoords, liveUserAddress]);

  // Update Markers when cases or selectedCaseId changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    cases.forEach((item) => {
      const isSelected = selectedCaseId === item.case_id;
      const color = getCategoryColor(item.category);
      const isResolved = item.status === 'RESOLVED';

      const customIcon = L.divIcon({
        className: 'custom-civic-pin',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '38px' : '30px'};
            height: ${isSelected ? '38px' : '30px'};
            border-radius: 9999px;
            background-color: ${isResolved ? '#64748b' : color};
            border: 2.5px solid ${isSelected ? '#1D4ED8' : '#FFFFFF'};
            box-shadow: 0 3px 10px rgba(0,0,0,0.22);
            transition: all 0.3s ease;
            cursor: pointer;
            ${isSelected ? 'transform: scale(1.15);' : ''}
          ">
            <span style="color: white; font-size: ${isSelected ? '14px' : '11px'}; font-weight: bold;">
              ${isResolved ? '✓' : item.category.slice(0, 1)}
            </span>
          </div>
        `,
        iconSize: isSelected ? [38, 38] : [30, 30],
        iconAnchor: isSelected ? [19, 19] : [15, 15],
      });

      const lat = item.latitude ?? (item as any).lat ?? 28.4744;
      const lng = item.longitude ?? (item as any).lng ?? 77.504;
      const marker = L.marker([lat, lng], { icon: customIcon });

      // Popup Content
      const sevColor = item.severity === 'CRITICAL' ? '#BE123C' : item.severity === 'HIGH' ? '#C2410C' : item.severity === 'MEDIUM' ? '#B45309' : '#15803D';
      const sevBg = item.severity === 'CRITICAL' ? '#FFF1F2' : item.severity === 'HIGH' ? '#FFF7ED' : item.severity === 'MEDIUM' ? '#FFFBEB' : '#F0FDF4';

      const popupHtml = `
        <div style="font-family: 'Manrope', system-ui, sans-serif; min-width: 220px; padding: 6px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 800; font-family: monospace; color: #2563EB;">${item.case_id}</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: ${sevBg}; color: ${sevColor}; border: 1px solid ${sevColor}30;">
              ${item.severity}
            </span>
          </div>
          <div style="font-size: 12px; font-weight: 800; color: #0F172A; margin-bottom: 4px; line-height: 1.35;">
            ${item.complaint_title || item.category}
          </div>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 10px;">
            📍 ${item.address || 'Reported Location, India'}
          </div>
          <a href="/case/${item.case_id}" style="
            display: block;
            text-align: center;
            font-size: 11px;
            font-weight: 700;
            color: white;
            background: linear-gradient(90deg, #2563EB 0%, #4338CA 100%);
            padding: 7px 12px;
            border-radius: 8px;
            text-decoration: none;
            box-shadow: 0 2px 6px rgba(37,99,235,0.25);
          ">
            Track Case Details →
          </a>
        </div>
      `;

      if (!disablePopups) {
        marker.bindPopup(popupHtml);
      }

      marker.on('click', () => {
        if (onSelectCase) {
          onSelectCase(item);
        }
      });

      markersLayerRef.current?.addLayer(marker);

      if (isSelected && mapInstanceRef.current) {
        mapInstanceRef.current.panTo([lat, lng], { animate: true });
        if (!disablePopups) {
          marker.openPopup();
        }
      }
    });
  }, [cases, selectedCaseId, onSelectCase, disablePopups]);

  // Handler for floating "Locate Me" button
  const handleRecenterOnUser = useCallback(() => {
    if (liveUserCoords && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(liveUserCoords, 15, { duration: 1.2 });
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setLiveUserCoords(coords);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo(coords, 15, { duration: 1.2 });
          }
        },
        (err) => {
          console.warn('Geolocation error:', err);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, [liveUserCoords]);

  return (
    <div className={`relative overflow-hidden w-full h-full ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating "Locate Me" GPS Button on Map */}
      <div className="absolute bottom-20 right-3 z-[400] flex flex-col gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={handleRecenterOnUser}
          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-300/80 shadow-md flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-400 active:scale-95 transition-all cursor-pointer group"
          title={liveUserCoords ? `Center on Your Location (${liveUserAddress})` : 'Acquire My GPS Location'}
          aria-label="Recenter on your location"
        >
          <Navigation className={`w-4 h-4 transition-transform group-hover:scale-110 ${liveUserCoords ? 'text-blue-600' : 'text-slate-500'}`} />
        </button>
      </div>
    </div>
  );
};

export default CivicMap;
