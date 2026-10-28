import React, { useState } from 'react';
import { MapPin, Navigation, Edit2, Check } from 'lucide-react';

interface LocationPickerProps {
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  onChange: (loc: { latitude: number; longitude: number; address: string }) => void;
  className?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  location,
  onChange,
  className = '',
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState(location.address);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        onChange({
          latitude: lat,
          longitude: lng,
          address: `Current location (${lat}, ${lng})`,
        });
        setAddressInput(`Current location (${lat}, ${lng})`);
      },
      (err) => {
        setIsLocating(false);
        alert(`Could not fetch your location: ${err.message}. Using default.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSaveAddress = () => {
    onChange({
      ...location,
      address: addressInput.trim() || 'New Delhi, India',
    });
    setIsEditingAddress(false);
  };

  return (
    <div className={`p-4 rounded-2xl premium-card space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Confirmed Incident Location
          </h4>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Locating...' : 'Use current GPS'}</span>
        </button>
      </div>

      {isEditingAddress ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none shadow-xs"
            placeholder="Enter street, landmark or sector"
            autoFocus
          />
          <button
            type="button"
            onClick={handleSaveAddress}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Set</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/70 border border-slate-200/80 text-xs shadow-2xs">
          <div className="space-y-0.5">
            <span className="font-bold text-slate-900 block">{location.address}</span>
            <span className="text-[11px] font-mono text-slate-500">
              Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setAddressInput(location.address);
              setIsEditingAddress(true);
            }}
            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
            title="Edit address"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
