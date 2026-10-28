import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ShieldCheck, X, CheckCircle2, AlertTriangle } from 'lucide-react';

interface CoordsData {
  lat: number;
  lng: number;
  accuracy: number;
  address: string;
  timestamp: number;
}

export const LocationPermissionModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [detectedAddress, setDetectedAddress] = useState<string | null>(null);

  useEffect(() => {
    const handleOpenModal = () => {
      setIsOpen(true);
      setDetectedAddress(null);
      setStatusMessage('');
    };

    window.addEventListener('civiclens_open_location_modal', handleOpenModal);

    // Check if permission already handled
    const localPerm = localStorage.getItem('civiclens_location_permission');
    const sessionPerm = sessionStorage.getItem('civiclens_location_permission');

    if (localPerm === 'granted') {
      // User previously chose "Allow" (remembered) — silently refresh position in background
      refreshLocationSilently();
      return () => window.removeEventListener('civiclens_open_location_modal', handleOpenModal);
    }

    if (sessionPerm === 'granted' || sessionPerm === 'denied') {
      return () => window.removeEventListener('civiclens_open_location_modal', handleOpenModal);
    }

    // New visit: wait a moment for the page to render then show permission prompt
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 600);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('civiclens_open_location_modal', handleOpenModal);
    };
  }, []);

  const refreshLocationSilently = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        saveLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy, false);
      },
      (err) => {
        console.warn('Silent geolocation refresh error:', err);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const saveLocation = async (lat: number, lng: number, accuracy: number, showToast = true) => {
    let resolvedAddress = `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;

    try {
      // Reverse geocode using OpenStreetMap Nominatim
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const city = data.address?.city || data.address?.town || data.address?.suburb || data.address?.county || '';
        const state = data.address?.state || '';
        const road = data.address?.road || data.address?.neighbourhood || '';

        const parts = [road, city, state].filter(Boolean);
        if (parts.length > 0) {
          resolvedAddress = parts.join(', ');
        } else if (data.display_name) {
          resolvedAddress = data.display_name.split(',').slice(0, 3).join(',');
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding fallback to coords:', e);
    }

    const payload: CoordsData = {
      lat,
      lng,
      accuracy,
      address: resolvedAddress,
      timestamp: Date.now(),
    };

    localStorage.setItem('civiclens_user_coords', JSON.stringify(payload));
    localStorage.setItem('civiclens_user_location_name', resolvedAddress);

    // Dispatch custom event so CivicMap, Dashboard & Report immediately react and re-center
    window.dispatchEvent(
      new CustomEvent('civiclens_location_updated', {
        detail: payload,
      })
    );

    setDetectedAddress(resolvedAddress);
    return resolvedAddress;
  };

  const handleGrant = (mode: 'allow' | 'session') => {
    if (!navigator.geolocation) {
      setStatusMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Acquiring high-accuracy GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (mode === 'allow') {
          localStorage.setItem('civiclens_location_permission', 'granted');
        } else {
          sessionStorage.setItem('civiclens_location_permission', 'granted');
        }

        const address = await saveLocation(
          pos.coords.latitude,
          pos.coords.longitude,
          pos.coords.accuracy,
          true
        );

        setStatusMessage(`Location acquired: ${address}`);
        setIsLoading(false);

        // Auto close after brief confirmation
        setTimeout(() => {
          setIsOpen(false);
        }, 1200);
      },
      (err) => {
        setIsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setStatusMessage('Browser location permission was denied in your browser settings.');
          sessionStorage.setItem('civiclens_location_permission', 'denied');
        } else {
          setStatusMessage('Could not determine exact location. Please try again.');
        }
        setTimeout(() => setIsOpen(false), 2500);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleDeny = () => {
    sessionStorage.setItem('civiclens_location_permission', 'denied');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl border text-slate-800 p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 relative overflow-hidden"
        style={{
          backgroundColor: '#F5F5DC',
          borderColor: 'rgba(215, 210, 175, 0.95)',
          boxShadow: '0 25px 60px -15px rgba(35, 30, 15, 0.4), 0 0 0 1px rgba(220, 215, 180, 0.9)',
        }}
      >
        {/* Subtle decorative glowing corner wash */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-200/40 via-cyan-100/20 to-transparent rounded-bl-full pointer-events-none" />

        {/* Close (Deny) X button */}
        <button
          type="button"
          onClick={handleDeny}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
          title="Deny / Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon + Titles */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30 relative">
            <MapPin className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500 border-2 border-white" />
            </span>
          </div>

          <div className="min-w-0 pr-6">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                Allow Location Access?
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              CivicLens AI uses your actual location to center the live intelligence map around you, discover nearby civic issues, and verify incident coordinates.
            </p>
          </div>
        </div>

        {/* Feature Highlights Pill Box */}
        <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-300/60 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <Navigation className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span>Pinpoints your position on the full-screen dashboard map</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>Precise GPS coordinates attached only to verified reports you submit</span>
          </div>
        </div>

        {/* Status / Loading Banner */}
        {isLoading && (
          <div className="p-3 rounded-xl bg-blue-100/80 border border-blue-200 text-xs font-bold text-blue-900 flex items-center gap-2.5">
            <span className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {detectedAddress && !isLoading && (
          <div className="p-3 rounded-xl bg-emerald-100/80 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span className="truncate">Active: {detectedAddress}</span>
          </div>
        )}

        {/* 3 Explicit Permission Buttons */}
        <div className="space-y-2 pt-1">
          {/* 1. Allow Always */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleGrant('allow')}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Allow</span>
          </button>

          {/* 2. Allow only while using this website */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleGrant('session')}
            className="w-full py-2.5 px-4 rounded-xl bg-white/90 hover:bg-white text-slate-800 border border-slate-300/80 hover:border-slate-400 active:scale-[0.99] text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Navigation className="w-3.5 h-3.5 text-slate-600" />
            <span>Allow only while using this website</span>
          </button>

          {/* 3. Deny */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleDeny}
            className="w-full py-2 px-4 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 text-xs font-bold transition-colors flex items-center justify-center cursor-pointer"
          >
            <span>Deny</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionModal;
