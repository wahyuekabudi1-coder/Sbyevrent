import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Crosshair, Loader2, Navigation, MapPin } from 'lucide-react';

interface InteractiveTaxiRouteMapProps {
  city: 'Surabaya' | 'Sidoarjo';
  pickupCoords: { lat: number; lng: number } | null;
  dropoffCoords: { lat: number; lng: number } | null;
  onPickupSelect: (location: { address: string; lat: number; lng: number }) => void;
  onDropoffSelect: (location: { address: string; lat: number; lng: number }) => void;
  activeTarget: 'pickup' | 'dropoff';
  setActiveTarget: (target: 'pickup' | 'dropoff') => void;
  onDistanceCalculated?: (distanceKm: number) => void;
}

const CITY_COORDS: Record<'Surabaya' | 'Sidoarjo', { lat: number; lng: number }> = {
  Surabaya: { lat: -7.2575, lng: 112.7521 },
  Sidoarjo: { lat: -7.4478, lng: 112.7183 },
};

export const InteractiveTaxiRouteMap: React.FC<InteractiveTaxiRouteMapProps> = ({
  city,
  pickupCoords,
  dropoffCoords,
  onPickupSelect,
  onDropoffSelect,
  activeTarget,
  setActiveTarget,
  onDistanceCalculated,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropoffMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Pin Icons (Teal for Pickup, Rose for Dropoff)
  const createPinIcon = (type: 'pickup' | 'dropoff') => {
    const isPickup = type === 'pickup';
    const bgGradient = isPickup
      ? 'linear-gradient(135deg, #017A83 0%, #01565C 100%)'
      : 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)';
    const borderColor = isPickup ? '#94C806' : '#FDE047';
    const textLabel = isPickup ? 'JEMPUT' : 'TUJUAN';

    return L.divIcon({
      className: `taxi-pin-${type}`,
      html: `
        <div style="position: relative; width: 38px; height: 46px; transform: translate(-19px, -46px);">
          <div style="
            width: 38px; 
            height: 38px; 
            background: ${bgGradient}; 
            border: 3px solid ${borderColor}; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg); 
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="
              transform: rotate(45deg); 
              font-family: ui-sans-serif, system-ui, sans-serif;
              font-size: 8px; 
              font-weight: 900; 
              color: #FFFFFF; 
              letter-spacing: -0.2px;
            ">${textLabel}</span>
          </div>
          <div style="
            position: absolute; 
            bottom: -3px; 
            left: 50%; 
            transform: translateX(-50%); 
            width: 12px; 
            height: 4px; 
            background: rgba(0, 0, 0, 0.3); 
            border-radius: 50%;
            filter: blur(1px);
          "></div>
        </div>
      `,
      iconSize: [38, 46],
      iconAnchor: [19, 46],
    });
  };

  // Reverse Geocoding via Nominatim
  const reverseGeocode = async (lat: number, lng: number, target: 'pickup' | 'dropoff') => {
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

      if (target === 'pickup') {
        onPickupSelect({ address: formatted, lat, lng });
      } else {
        onDropoffSelect({ address: formatted, lat, lng });
      }
    } catch {
      const fallback = `Titik ${target === 'pickup' ? 'Penjemputan' : 'Tujuan'} [${lat.toFixed(5)}, ${lng.toFixed(5)}], ${city}`;
      if (target === 'pickup') {
        onPickupSelect({ address: fallback, lat, lng });
      } else {
        onDropoffSelect({ address: fallback, lat, lng });
      }
    } finally {
      setIsGeocoding(false);
    }
  };

  // Fetch OSRM Road Distance or Fallback to Haversine
  const fetchRouteAndDistance = async (pLat: number, pLng: number, dLat: number, dLng: number) => {
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pLng},${pLat};${dLng},${dLat}?overview=full&geometries=geojson`;
      const res = await fetch(osrmUrl);
      if (res.ok) {
        const json = await res.json();
        if (json.routes && json.routes[0]) {
          const route = json.routes[0];
          const distKm = Math.max(1, Math.round((route.distance / 1000) * 10) / 10);
          if (onDistanceCalculated) onDistanceCalculated(distKm);

          // Render polyline from OSRM coordinates
          if (mapInstanceRef.current) {
            const latlngs = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
            if (routeLineRef.current) {
              routeLineRef.current.setLatLngs(latlngs);
            } else {
              routeLineRef.current = L.polyline(latlngs, {
                color: '#017A83',
                weight: 5,
                opacity: 0.85,
                dashArray: undefined,
              }).addTo(mapInstanceRef.current);
            }
            mapInstanceRef.current.fitBounds(L.latLngBounds(latlngs), { padding: [35, 35] });
          }
          return;
        }
      }
    } catch {
      // Fallback below
    }

    // Haversine fallback with road factor 1.35
    const R = 6371;
    const deltaLat = (dLat - pLat) * (Math.PI / 180);
    const deltaLon = (dLng - pLng) * (Math.PI / 180);
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(pLat * (Math.PI / 180)) * Math.cos(dLat * (Math.PI / 180)) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distKm = Math.max(1, Math.round(R * c * 1.35 * 10) / 10);
    if (onDistanceCalculated) onDistanceCalculated(distKm);

    if (mapInstanceRef.current) {
      const latlngs: L.LatLngExpression[] = [
        [pLat, pLng],
        [dLat, dLng],
      ];
      if (routeLineRef.current) {
        routeLineRef.current.setLatLngs(latlngs);
      } else {
        routeLineRef.current = L.polyline(latlngs, {
          color: '#017A83',
          weight: 4,
          dashArray: '6, 8',
          opacity: 0.8,
        }).addTo(mapInstanceRef.current);
      }
      mapInstanceRef.current.fitBounds(L.latLngBounds(latlngs), { padding: [35, 35] });
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const defaultCenter = CITY_COORDS[city] || CITY_COORDS.Surabaya;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [defaultCenter.lat, defaultCenter.lng],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Click on Map to set active target
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (activeTarget === 'pickup') {
          if (pickupMarkerRef.current) {
            pickupMarkerRef.current.setLatLng([lat, lng]);
          } else {
            pickupMarkerRef.current = L.marker([lat, lng], {
              icon: createPinIcon('pickup'),
              draggable: true,
            }).addTo(map);
            pickupMarkerRef.current.on('dragend', (evt) => {
              const pos = (evt.target as L.Marker).getLatLng();
              reverseGeocode(pos.lat, pos.lng, 'pickup');
            });
          }
          reverseGeocode(lat, lng, 'pickup');
        } else {
          if (dropoffMarkerRef.current) {
            dropoffMarkerRef.current.setLatLng([lat, lng]);
          } else {
            dropoffMarkerRef.current = L.marker([lat, lng], {
              icon: createPinIcon('dropoff'),
              draggable: true,
            }).addTo(map);
            dropoffMarkerRef.current.on('dragend', (evt) => {
              const pos = (evt.target as L.Marker).getLatLng();
              reverseGeocode(pos.lat, pos.lng, 'dropoff');
            });
          }
          reverseGeocode(lat, lng, 'dropoff');
        }
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        pickupMarkerRef.current = null;
        dropoffMarkerRef.current = null;
        routeLineRef.current = null;
      }
    };
  }, []);

  // Update Markers when pickupCoords or dropoffCoords change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Pickup Marker
    if (pickupCoords) {
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setLatLng([pickupCoords.lat, pickupCoords.lng]);
      } else {
        const marker = L.marker([pickupCoords.lat, pickupCoords.lng], {
          icon: createPinIcon('pickup'),
          draggable: true,
          title: 'Titik Penjemputan',
        }).addTo(map);
        marker.on('dragend', (evt) => {
          const pos = (evt.target as L.Marker).getLatLng();
          reverseGeocode(pos.lat, pos.lng, 'pickup');
        });
        pickupMarkerRef.current = marker;
      }
    }

    // Dropoff Marker
    if (dropoffCoords) {
      if (dropoffMarkerRef.current) {
        dropoffMarkerRef.current.setLatLng([dropoffCoords.lat, dropoffCoords.lng]);
      } else {
        const marker = L.marker([dropoffCoords.lat, dropoffCoords.lng], {
          icon: createPinIcon('dropoff'),
          draggable: true,
          title: 'Titik Tujuan',
        }).addTo(map);
        marker.on('dragend', (evt) => {
          const pos = (evt.target as L.Marker).getLatLng();
          reverseGeocode(pos.lat, pos.lng, 'dropoff');
        });
        dropoffMarkerRef.current = marker;
      }
    }

    // Calculate Route & Fit Bounds if both present
    if (pickupCoords && dropoffCoords) {
      fetchRouteAndDistance(pickupCoords.lat, pickupCoords.lng, dropoffCoords.lat, dropoffCoords.lng);
    } else if (pickupCoords) {
      map.setView([pickupCoords.lat, pickupCoords.lng], 14);
    } else if (dropoffCoords) {
      map.setView([dropoffCoords.lat, dropoffCoords.lng], 14);
    }
  }, [pickupCoords, dropoffCoords]);

  // Handle GPS "Gunakan Lokasi Saya" for Pickup
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

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 15, { animate: true, duration: 1 });
        }
        reverseGeocode(latitude, longitude, 'pickup');
        setActiveTarget('dropoff'); // Pindah otomatis ke tujuan setelah titik jemput terisi
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setGeoError('Izin GPS ditolak. Silakan klik titik penjemputan langsung pada peta.');
        } else {
          setGeoError('Gagal mendeteksi GPS. Silakan tentukan titik penjemputan pada peta.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-3">
      {/* Top Map Switcher & GPS Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-600">Klik Peta Untuk:</span>
          <div className="inline-flex rounded-lg p-0.5 bg-slate-200 border border-slate-300">
            <button
              type="button"
              onClick={() => setActiveTarget('pickup')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                activeTarget === 'pickup'
                  ? 'bg-brand-teal text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-brand-lime" />
              <span>Titik Dari (Jemput)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTarget('dropoff')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                activeTarget === 'dropoff'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-yellow-300" />
              <span>Titik Tujuan</span>
            </button>
          </div>
        </div>

        {/* Tombol Lokasi Saya */}
        <button
          type="button"
          onClick={handleGetLiveLocation}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-teal bg-white hover:bg-brand-teal hover:text-white border border-brand-teal/30 rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-50 min-h-[36px]"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-teal" />
          ) : (
            <Crosshair className="w-3.5 h-3.5 text-brand-teal" />
          )}
          <span>{isLocating ? 'Mendeteksi...' : 'Lokasi Saya (Titik Dari)'}</span>
        </button>
      </div>

      {geoError && (
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Map Container */}
      <div className="relative rounded-xl overflow-hidden border-2 border-brand-teal/20 shadow-xs h-64 sm:h-72 w-full z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        <div className="absolute top-2 left-2 z-1000 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200 shadow-xs text-[10px] text-slate-600 flex items-center gap-1.5 font-medium pointer-events-none">
          <span className={`w-2 h-2 rounded-full ${activeTarget === 'pickup' ? 'bg-brand-teal' : 'bg-rose-600'} animate-pulse`} />
          <span>Sedang memilih: <strong>{activeTarget === 'pickup' ? 'Titik Dari (Jemput)' : 'Titik Tujuan'}</strong>. Klik di peta atau drag pin.</span>
        </div>

        {isGeocoding && (
          <div className="absolute bottom-2 right-2 z-1000 bg-brand-primary/90 text-white px-2.5 py-1 rounded-md text-[10px] flex items-center gap-1.5 shadow-md">
            <Loader2 className="w-3 h-3 animate-spin text-brand-lime" />
            <span>Menghitung titik & alamat...</span>
          </div>
        )}
      </div>
    </div>
  );
};
