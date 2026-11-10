import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Crosshair, Loader2, Sparkles } from 'lucide-react';

interface InteractivePickupMapProps {
  city: 'Surabaya' | 'Sidoarjo';
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
  currentAddress?: string;
  selectedCoords?: { lat: number; lng: number } | null;
}

const CITY_COORDS: Record<'Surabaya' | 'Sidoarjo', { lat: number; lng: number }> = {
  Surabaya: { lat: -7.2575, lng: 112.7521 },
  Sidoarjo: { lat: -7.4478, lng: 112.7183 },
};


export const InteractivePickupMap: React.FC<InteractivePickupMapProps> = ({
  city,
  onLocationSelect,
  currentAddress,
  selectedCoords
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [coords, setCoords] = useState<{ lat: number; lng: number }>(CITY_COORDS[city]);
  const [addressDisplay, setAddressDisplay] = useState<string>(currentAddress || '');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Custom marker icon HTML with brand teal and lime
  const createCustomIcon = () => {
    return L.divIcon({
      className: 'custom-pin-marker',
      html: `
        <div style="position: relative; width: 40px; height: 48px; transform: translate(-20px, -48px);">
          <div style="
            width: 40px; 
            height: 40px; 
            background: linear-gradient(135deg, #017A83 0%, #01565C 100%); 
            border: 3px solid #94C806; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg); 
            box-shadow: 0 4px 12px rgba(1, 122, 131, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg style="transform: rotate(45deg); width: 20px; height: 20px; color: #FFFFFF;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div style="
            position: absolute; 
            bottom: -4px; 
            left: 50%; 
            transform: translateX(-50%); 
            width: 12px; 
            height: 4px; 
            background: rgba(0, 0, 0, 0.25); 
            border-radius: 50%;
            filter: blur(1px);
          "></div>
        </div>
      `,
      iconSize: [40, 48],
      iconAnchor: [20, 48],
    });
  };

  // Reverse geocode via OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    setGeoError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'id' } }
      );
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      
      const road = data.address?.road || data.address?.pedestrian || data.address?.suburb || '';
      const suburb = data.address?.suburb || data.address?.village || data.address?.city_district || '';
      const cityDistrict = data.address?.city || data.address?.county || city;
      
      let formatted = data.display_name;
      if (road || suburb) {
        formatted = `${road ? road + ', ' : ''}${suburb ? suburb + ', ' : ''}${cityDistrict}, Jawa Timur`;
      }

      setAddressDisplay(formatted);
      onLocationSelect({ address: formatted, lat, lng });
    } catch {
      // Fallback: koordinat dengan nama wilayah
      const fallback = `Lokasi Titik Jemput [${lat.toFixed(5)}, ${lng.toFixed(5)}], ${city}, Jawa Timur`;
      setAddressDisplay(fallback);
      onLocationSelect({ address: fallback, lat, lng });
    } finally {
      setIsGeocoding(false);
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCoords = CITY_COORDS[city] || CITY_COORDS.Surabaya;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialCoords.lat, initialCoords.lng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      const marker = L.marker([initialCoords.lat, initialCoords.lng], {
        icon: createCustomIcon(),
        draggable: true,
        title: 'Geser titik lokasi penjemputan Anda',
      }).addTo(map);

      // Drag event
      marker.on('dragend', (e) => {
        const target = e.target as L.Marker;
        const newPos = target.getLatLng();
        setCoords({ lat: newPos.lat, lng: newPos.lng });
        reverseGeocode(newPos.lat, newPos.lng);
      });

      // Click on map to move marker
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords({ lat, lng });
        reverseGeocode(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Trigger initial reverse geocode if no current address
      if (!currentAddress) {
        reverseGeocode(initialCoords.lat, initialCoords.lng);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update center when city prop changes
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      const newCenter = CITY_COORDS[city] || CITY_COORDS.Surabaya;
      mapInstanceRef.current.setView([newCenter.lat, newCenter.lng], 14);
      markerRef.current.setLatLng([newCenter.lat, newCenter.lng]);
      setCoords(newCenter);
      reverseGeocode(newCenter.lat, newCenter.lng);
    }
  }, [city]);

  // Sync marker when selectedCoords passed from autocomplete
  useEffect(() => {
    if (selectedCoords && mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([selectedCoords.lat, selectedCoords.lng], 15);
      markerRef.current.setLatLng([selectedCoords.lat, selectedCoords.lng]);
      setCoords(selectedCoords);
    }
  }, [selectedCoords]);

  // Handle GPS "Gunakan Lokasi Saya"
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Perangkat Anda tidak mendukung fitur lokasi GPS.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 16, { animate: true, duration: 1.2 });
          markerRef.current.setLatLng([latitude, longitude]);
        }

        reverseGeocode(latitude, longitude);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setGeoError('Izin akses lokasi ditolak. Silakan geser pin pada peta secara manual.');
        } else {
          setGeoError('Gagal mendeteksi lokasi GPS. Silakan tentukan pin langsung di peta.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-2">
      {/* Top Map Action Bar */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-500 font-medium">
          Geser pin pada peta untuk menyesuaikan titik penjemputan persis di depan rumah Anda
        </span>

        {/* Tombol Pilih Lokasi Saya */}
        <button
          type="button"
          onClick={handleGetLiveLocation}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-teal bg-brand-mint hover:bg-brand-teal hover:text-white border border-brand-teal/30 rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-teal" />
          ) : (
            <Crosshair className="w-3.5 h-3.5 text-brand-teal" />
          )}
          <span>{isLocating ? 'Mendeteksi...' : 'Lokasi Saya (GPS)'}</span>
        </button>
      </div>

      {geoError && (
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Map Canvas Container */}
      <div className="relative rounded-xl overflow-hidden border-2 border-brand-teal/20 shadow-xs h-64 sm:h-72 w-full z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating helper overlay */}
        <div className="absolute top-2 left-2 z-1000 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200 shadow-xs text-[10px] text-slate-600 flex items-center gap-1.5 font-medium pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
          <span>Klik atau drag pin untuk mengubah posisi</span>
        </div>

        {isGeocoding && (
          <div className="absolute bottom-2 right-2 z-1000 bg-brand-primary/90 text-white px-2.5 py-1 rounded-md text-[10px] flex items-center gap-1.5 shadow-md">
            <Loader2 className="w-3 h-3 animate-spin text-brand-lime" />
            <span>Memperbarui alamat...</span>
          </div>
        )}
      </div>

      {/* Alamat Terpilih dari Peta */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="font-semibold text-brand-teal">Alamat Terpilih dari Titik Peta:</span>
          <span className="font-mono text-[10px] text-slate-400">
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </span>
        </div>
        <p className="font-bold text-brand-primary text-xs sm:text-sm leading-snug">
          {addressDisplay || 'Belum ada titik yang dipilih'}
        </p>
      </div>
    </div>
  );
};
