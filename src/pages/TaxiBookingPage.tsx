import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Navigation,
  Clock,
  MapPin,
  User,
  Phone,
  Zap,
  AlertCircle,
  Calculator,
  ChevronRight,
  Loader2,
  Info,
  Timer,
  Search,
  Crosshair,
  Map,
  X,
  Check
} from 'lucide-react';
import { api } from '../lib/api';
import { InteractivePickupMap } from '../components/InteractivePickupMap';
import { Logo } from '../components/Logo';
import { LiveryStripe } from '../components/EvLiveryDecals';

interface TaxiBookingPageProps {
  onBackHome: () => void;
  onOpenPaymentModal: (bookingNumber: string) => void;
  onOpenTracker: (bookingNumber: string) => void;
}

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export const TaxiBookingPage: React.FC<TaxiBookingPageProps> = ({
  onBackHome,
  onOpenPaymentModal,
  onOpenTracker
}) => {
  // Wizard Steps: 1: Form & Rute, 2: Rincian Pemesanan (Summary)
  const [step, setStep] = useState<1 | 2>(1);

  // Rute Penjemputan: Dari (Ketik + Autocomplete, Map disembunyikan secara default)
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showPickupMap, setShowPickupMap] = useState<boolean>(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState<boolean>(false);

  // Rute Tujuan: Pengantaran (Hanya ketik, tanpa map)
  const [dropoffAddress, setDropoffAddress] = useState<string>('');
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Autocomplete Suggestions saat ngetik alamat
  const [pickupSuggestions, setPickupSuggestions] = useState<AddressSuggestion[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingPickupSuggestions, setIsLoadingPickupSuggestions] = useState<boolean>(false);
  const [isLoadingDropoffSuggestions, setIsLoadingDropoffSuggestions] = useState<boolean>(false);
  const [showPickupDropdown, setShowPickupDropdown] = useState<boolean>(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState<boolean>(false);

  const pickupInputRef = useRef<HTMLDivElement>(null);
  const dropoffInputRef = useRef<HTMLDivElement>(null);

  // Waktu Penjemputan (Drop down: Sekarang segera meluncur, 5 menit, 10 menit, 30 menit, 1 jam)
  const [pickupTimeOption, setPickupTimeOption] = useState<string>('Sekarang (Segera Meluncur)');

  // Data Pemesan (Nama pemesan, nomor WhatsApp, catatan patokan)
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Jarak (km), Waktu Tempuh (menit/jam), dan Tarif (Rp7.000 / km)
  const [distanceKm, setDistanceKm] = useState<number>(10);
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState<number>(25);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false);
  const ratePerKm = 7000;
  const minFare = 25000;

  // Kode unik acak (Tidak lebih dari Rp300, mengutamakan 100-200 rupiah)
  const [uniqueCode] = useState<number>(() =>
    Math.random() < 0.7 ? Math.floor(101 + Math.random() * 99) : Math.floor(201 + Math.random() * 98)
  );

  // State Submisi
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickupInputRef.current && !pickupInputRef.current.contains(e.target as Node)) {
        setShowPickupDropdown(false);
      }
      if (dropoffInputRef.current && !dropoffInputRef.current.contains(e.target as Node)) {
        setShowDropoffDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format estimasi waktu tempuh dari menit
  const formatTravelTime = (mins: number) => {
    if (mins < 60) {
      return `± ${mins} Menit`;
    }
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `± ${hours} Jam ${remainingMins > 0 ? remainingMins + ' Menit' : ''}`;
  };

  // Autocomplete API (OpenStreetMap Nominatim gratis, scoped to Jawa Timur / Surabaya-Sidoarjo)
  const fetchAddressSuggestions = async (
    query: string,
    type: 'pickup' | 'dropoff'
  ) => {
    if (!query || query.trim().length < 3) {
      if (type === 'pickup') {
        setPickupSuggestions([]);
        setShowPickupDropdown(false);
      } else {
        setDropoffSuggestions([]);
        setShowDropoffDropdown(false);
      }
      return;
    }

    if (type === 'pickup') setIsLoadingPickupSuggestions(true);
    else setIsLoadingDropoffSuggestions(true);

    try {
      const q = encodeURIComponent(`${query.trim()}, Surabaya Sidoarjo Jawa Timur Indonesia`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=4&countrycodes=id`,
        { headers: { 'Accept-Language': 'id' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          if (type === 'pickup') {
            setPickupSuggestions(data);
            setShowPickupDropdown(data.length > 0);
          } else {
            setDropoffSuggestions(data);
            setShowDropoffDropdown(data.length > 0);
          }
        }
      }
    } catch {
      // ignore network errors for autocomplete
    } finally {
      if (type === 'pickup') setIsLoadingPickupSuggestions(false);
      else setIsLoadingDropoffSuggestions(false);
    }
  };

  // Debounced autocomplete for pickup
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pickupAddress && !pickupCoords) {
        fetchAddressSuggestions(pickupAddress, 'pickup');
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [pickupAddress]);

  // Debounced autocomplete for dropoff
  useEffect(() => {
    const timer = setTimeout(() => {
      if (dropoffAddress && !dropoffCoords) {
        fetchAddressSuggestions(dropoffAddress, 'dropoff');
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [dropoffAddress]);

  // Kalkulasi jarak & waktu tempuh riil dari peta menggunakan OSRM Routing Engine
  const calculateRealRoute = async (
    pCoords: { lat: number; lng: number },
    dAddressText: string,
    targetDropoffCoords?: { lat: number; lng: number }
  ) => {
    if (!pCoords || !dAddressText.trim()) return;

    setIsCalculatingRoute(true);
    try {
      let dLat = targetDropoffCoords?.lat || dropoffCoords?.lat;
      let dLng = targetDropoffCoords?.lng || dropoffCoords?.lng;

      if (!dLat || !dLng) {
        const query = encodeURIComponent(`${dAddressText}, Surabaya Sidoarjo Jawa Timur`);
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
          { headers: { 'Accept-Language': 'id' } }
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData && geoData[0]) {
            dLat = parseFloat(geoData[0].lat);
            dLng = parseFloat(geoData[0].lon);
            setDropoffCoords({ lat: dLat, lng: dLng });
          }
        }
      }

      // Hitung jarak riil rute berkendara via OSRM
      if (dLat && dLng) {
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pCoords.lng},${pCoords.lat};${dLng},${dLat}?overview=false`;
        const routeRes = await fetch(osrmUrl);
        if (routeRes.ok) {
          const routeData = await routeRes.json();
          if (routeData.routes && routeData.routes[0]) {
            const r = routeData.routes[0];
            const distInKm = Math.max(1, Math.round((r.distance / 1000) * 10) / 10);
            const durationInMins = Math.max(5, Math.round(r.duration / 60));
            setDistanceKm(distInKm);
            setEstimatedDurationMinutes(durationInMins);
            setIsCalculatingRoute(false);
            return;
          }
        }
      }

      // Fallback rumus jalanan jika routing OSRM sibuk
      if (dLat && dLng) {
        const R = 6371;
        const deltaLat = (dLat - pCoords.lat) * (Math.PI / 180);
        const deltaLon = (dLng - pCoords.lng) * (Math.PI / 180);
        const a =
          Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
          Math.cos(pCoords.lat * (Math.PI / 180)) *
            Math.cos(dLat * (Math.PI / 180)) *
            Math.sin(deltaLon / 2) *
            Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const fallbackKm = Math.max(1, Math.round(R * c * 1.35 * 10) / 10);
        const fallbackMins = Math.round(fallbackKm * 2.2);
        setDistanceKm(fallbackKm);
        setEstimatedDurationMinutes(fallbackMins);
      }
    } catch {
      // maintain current distance on lookup error
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Hitung ulang jika pickupCoords atau dropoffAddress berubah
  useEffect(() => {
    if (!pickupCoords || !dropoffAddress.trim()) return;
    const timer = setTimeout(() => {
      calculateRealRoute(pickupCoords, dropoffAddress);
    }, 700);
    return () => clearTimeout(timer);
  }, [pickupCoords, dropoffAddress]);

  // Handler "Lokasi Saya (GPS)" -> Baru memunculkan peta dan mengambil koordinat GPS
  const handleGetLiveLocation = () => {
    setShowPickupMap(true);
    if (!navigator.geolocation) {
      setErrorMsg('Perangkat Anda tidak mendukung fitur lokasi GPS.');
      return;
    }

    setIsLocatingGPS(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocatingGPS(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPickupCoords({ lat, lng });

        // Reverse geocode via Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'id' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              setPickupAddress(data.display_name);
              if (dropoffAddress.trim()) {
                calculateRealRoute({ lat, lng }, dropoffAddress);
              }
            }
          }
        } catch {
          // fallback string
          setPickupAddress(`Titik Lokasi Saya [${lat.toFixed(5)}, ${lng.toFixed(5)}]`);
        }
      },
      (err) => {
        setIsLocatingGPS(false);
        if (err.code === 1) {
          setErrorMsg('Izin akses lokasi ditolak oleh browser. Anda dapat menggeser pin pada peta secara manual.');
        } else {
          setErrorMsg('Gagal mendeteksi lokasi GPS. Peta telah dibuka, silakan klik atau geser pin langsung pada peta.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Kalkulasi total tarif
  const baseFare = Math.max(minFare, Math.ceil(distanceKm * ratePerKm));
  const totalAmount = baseFare + uniqueCode;

  // Lanjut ke Step 2 (Rincian Pemesanan / Summary)
  const handleProceedToSummary = () => {
    setErrorMsg(null);
    if (!pickupAddress.trim()) {
      setErrorMsg('Mohon lengkapi alamat penjemputan (Dari) atau gunakan lokasi peta.');
      return;
    }
    if (!dropoffAddress.trim()) {
      setErrorMsg('Mohon ketik lokasi tujuan pengantaran Anda.');
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg('Mohon isi nama pemesan.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg('Mohon isi nomor WhatsApp aktif pemesan.');
      return;
    }
    setStep(2);
  };

  // Submit Order & Buka Modal Pembayaran QRIS
  const handleConfirmAndPay = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const result = await api.createTaxiBooking({
        city: 'Surabaya',
        pickupAddress,
        dropoffAddress,
        pickupCoords: pickupCoords || undefined,
        dropoffCoords: dropoffCoords || undefined,
        distanceKm,
        bookingDate: new Date().toISOString().split('T')[0],
        bookingTime: pickupTimeOption,
        customerName,
        customerPhone,
        passengerCount: 1,
        notes: notes.trim() ? notes : undefined,
        uniqueCode
      });

      // Buka modal QRIS resmi
      onOpenPaymentModal(result.bookingNumber);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses pemesanan taksi. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Fixed Header Nav */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackHome}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer min-h-[40px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Beranda</span>
            </button>
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <Logo className="h-7 sm:h-8" showSubtitle={false} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenTracker('')}
              className="text-xs font-bold text-slate-600 hover:text-brand-teal py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cek Status Booking
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Banner Alert Pesan Error jika ada */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Perhatian</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAHAP 1: ORDER TAKSI (DARI & TUJUAN LANGSUNG BERSIH)    */}
        {/* ======================================================== */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-4">
            {/* Header Ringkas */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <LiveryStripe variant="compact" />
                <div>
                  <h1 className="text-base sm:text-lg font-black text-brand-primary tracking-tight">
                    Pesan Taksi Surabaya &amp; Sidoarjo
                  </h1>
                  <p className="text-[11px] text-slate-500">
                    Tarif resmi Rp7.000 / km · Layanan Mobil Listrik Nyaman
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-brand-teal bg-brand-mint px-2.5 py-1 rounded-full border border-brand-teal/20 font-mono">
                Rp7.000 / km
              </span>
            </div>

            {/* 1. DARI: Penjemputan dengan Input Teks + Tombol Lokasi Saya */}
            <div className="space-y-1.5" ref={pickupInputRef}>
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-brand-primary flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-teal" />
                  <span>Dari (Lokasi Penjemputan)</span>
                  <span className="text-rose-600">*</span>
                </label>

                {/* Tombol Lokasi Saya (Baru Munculkan Peta Ketika Diklik) */}
                <button
                  type="button"
                  onClick={handleGetLiveLocation}
                  disabled={isLocatingGPS}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-brand-teal bg-brand-mint border border-brand-teal/25 hover:bg-brand-teal hover:text-white transition-all cursor-pointer shadow-2xs disabled:opacity-60"
                >
                  {isLocatingGPS ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-teal" />
                  ) : (
                    <Crosshair className="w-3.5 h-3.5" />
                  )}
                  <span>{isLocatingGPS ? 'Mencari...' : 'Lokasi Saya (GPS)'}</span>
                </button>
              </div>

              {/* Input Teks Alamat Dari dengan Live Autocomplete Suggestions */}
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ketik alamat penjemputan atau klik Lokasi Saya..."
                  value={pickupAddress}
                  onChange={(e) => {
                    setPickupAddress(e.target.value);
                    setPickupCoords(null);
                  }}
                  onFocus={() => {
                    if (pickupSuggestions.length > 0) setShowPickupDropdown(true);
                  }}
                  className="w-full h-11 pl-9 pr-24 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal shadow-2xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />

                {/* Tombol Pilih di Peta */}
                <button
                  type="button"
                  onClick={() => setShowPickupMap(!showPickupMap)}
                  className="absolute right-2 top-2 h-7 px-2.5 rounded-lg text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Map className="w-3 h-3 text-brand-teal" />
                  <span>{showPickupMap ? 'Tutup Peta' : 'Peta'}</span>
                </button>

                {isLoadingPickupSuggestions && (
                  <Loader2 className="w-4 h-4 animate-spin text-brand-teal absolute right-20 top-3.5" />
                )}

                {/* Dropdown Suggestions saat mengetik */}
                {showPickupDropdown && pickupSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-12 z-50 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {pickupSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const lat = parseFloat(item.lat);
                          const lng = parseFloat(item.lon);
                          setPickupAddress(item.display_name);
                          setPickupCoords({ lat, lng });
                          setShowPickupDropdown(false);
                          if (dropoffAddress.trim()) {
                            calculateRealRoute({ lat, lng }, dropoffAddress);
                          }
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 hover:bg-brand-mint/40 hover:text-brand-primary flex items-start gap-2.5 transition-colors cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-brand-teal shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">{item.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Peta HANYA MUNCUL ketika tombol Lokasi Saya / Peta diklik */}
              {showPickupMap && (
                <div className="pt-2 pb-1 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold text-brand-teal flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-teal" />
                      <span>Peta Penjemputan Terbuka (Geser pin jika perlu)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPickupMap(false)}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Sembunyikan Peta</span>
                    </button>
                  </div>

                  <InteractivePickupMap
                    city="Surabaya"
                    currentAddress={pickupAddress}
                    selectedCoords={pickupCoords}
                    onLocationSelect={(loc) => {
                      setPickupAddress(loc.address);
                      setPickupCoords({ lat: loc.lat, lng: loc.lng });
                      if (dropoffAddress.trim()) {
                        calculateRealRoute({ lat: loc.lat, lng: loc.lng }, dropoffAddress);
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {/* 2. TUJUAN: Lokasi Pengantaran (Langsung Tampil di Bawah Dari, Tanpa Map) */}
            <div className="space-y-1.5" ref={dropoffInputRef}>
              <label className="text-xs sm:text-sm font-bold text-brand-primary flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-rose-600" />
                <span>Tujuan (Lokasi Pengantaran)</span>
                <span className="text-rose-600">*</span>
              </label>

              {/* Input Teks Tujuan dengan Autocomplete */}
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ketik lokasi tujuan pengantaran Anda..."
                  value={dropoffAddress}
                  onChange={(e) => {
                    setDropoffAddress(e.target.value);
                    setDropoffCoords(null);
                  }}
                  onFocus={() => {
                    if (dropoffSuggestions.length > 0) setShowDropoffDropdown(true);
                  }}
                  className="w-full h-11 pl-9 pr-8 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal shadow-2xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />

                {isLoadingDropoffSuggestions && (
                  <Loader2 className="w-4 h-4 animate-spin text-brand-teal absolute right-3 top-3.5" />
                )}

                {/* Dropdown Suggestions Tujuan saat mengetik */}
                {showDropoffDropdown && dropoffSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-12 z-50 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {dropoffSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const lat = parseFloat(item.lat);
                          const lng = parseFloat(item.lon);
                          setDropoffAddress(item.display_name);
                          setDropoffCoords({ lat, lng });
                          setShowDropoffDropdown(false);
                          if (pickupCoords) {
                            calculateRealRoute(pickupCoords, item.display_name, { lat, lng });
                          }
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 hover:bg-brand-mint/40 hover:text-brand-primary flex items-start gap-2.5 transition-colors cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">{item.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Panel Kalkulasi Jarak & Waktu Tempuh Riil dari Peta (Desain Clean) */}
            <div className="p-4 rounded-xl bg-slate-900 text-white shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <LiveryStripe variant="compact" />
                  <span className="text-xs font-black uppercase text-brand-lime tracking-wider font-mono">
                    Kalkulasi Jarak &amp; Waktu Tempuh Riil
                  </span>
                </div>
                {isCalculatingRoute && (
                  <div className="flex items-center gap-1.5 text-[10px] text-brand-lime font-mono">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Menghitung rute...</span>
                  </div>
                )}
              </div>

              {/* Jarak Hitung & Waktu Tempuh */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">Jarak Hitung:</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl font-black text-white font-mono">
                      {distanceKm}
                    </span>
                    <span className="text-xs font-bold text-brand-lime font-mono">km</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                    x Rp7.000 / km
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block mb-0.5 font-medium flex items-center gap-1">
                    <Timer className="w-3 h-3 text-brand-lime" />
                    <span>Waktu Tempuh:</span>
                  </span>
                  <div className="text-lg sm:text-xl font-black text-brand-lime font-mono">
                    {formatTravelTime(estimatedDurationMinutes)}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Lalu lintas normal
                  </span>
                </div>
              </div>

              {/* Total Tarif Pokok & Catatan Tol / Parkir */}
              <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Tarif Taksi:</span>
                  <div className="text-xl font-black text-brand-lime font-mono">
                    Rp{baseFare.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-200 text-[11px] flex items-center gap-1.5 max-w-sm">
                  <Info className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>
                    Tarif <strong>tidak termasuk tol dan parkir</strong> (jika ada).
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Waktu Penjemputan (Drop down) */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs sm:text-sm font-bold text-brand-primary flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Waktu Penjemputan</span>
                <span className="text-rose-600">*</span>
              </label>
              <select
                value={pickupTimeOption}
                onChange={(e) => setPickupTimeOption(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:border-brand-teal shadow-2xs font-semibold"
              >
                <option value="Sekarang (Segera Meluncur)">Sekarang (Segera Meluncur)</option>
                <option value="5 Menit">5 Menit</option>
                <option value="10 Menit">10 Menit</option>
                <option value="30 Menit">30 Menit</option>
                <option value="1 Jam">1 Jam</option>
              </select>
            </div>

            {/* 5. Data Pemesan (Nama pemesan, nomor WhatsApp, catatan patokan) */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <h2 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                Data Pemesan
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-primary block">
                    Nama Pemesan <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap pemesan..."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full h-11 pl-9 pr-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-brand-teal shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-primary block">
                    Nomor WhatsApp <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      required
                      placeholder="081234567890"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full h-11 pl-9 pr-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-brand-teal shadow-2xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Catatan Patokan */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Catatan Patokan (Boleh Diisi / Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Depan pos satpam, pagar hitam, dekat minimarket..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-brand-teal shadow-2xs"
                />
              </div>
            </div>

            {/* Tombol Lanjutkan Pemesanan Taksi */}
            <div className="pt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBackHome}
                className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                &larr; Batal
              </button>

              <button
                type="button"
                onClick={handleProceedToSummary}
                className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-bold text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Lanjutkan Pemesanan Taksi</span>
                <ChevronRight className="w-4 h-4 text-brand-lime" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAHAP 2: RINCIAN PEMESANAN & LANGSUNG BAYAR QRIS         */}
        {/* ======================================================== */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <LiveryStripe variant="compact" />
                <div>
                  <h1 className="text-base sm:text-lg font-black text-brand-primary tracking-tight">
                    Rincian Pemesanan Taksi
                  </h1>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Periksa kembali rincian perjalanan Anda sebelum lanjut ke pembayaran QRIS
                  </p>
                </div>
              </div>
            </div>

            {/* Rincian Box */}
            <div className="rounded-xl border border-brand-teal/20 bg-brand-mint/20 p-4 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal block font-mono">
                    Layanan Taksi Listrik
                  </span>
                  <h3 className="text-base font-black text-brand-primary">
                    Surabaya &amp; Sidoarjo
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Total Tagihan:</span>
                  <div className="text-lg sm:text-xl font-black text-brand-teal font-mono">
                    Rp{totalAmount.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* Rincian Rute */}
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-brand-teal uppercase flex items-center gap-1 font-mono">
                    <MapPin className="w-3 h-3" /> Dari (Penjemputan):
                  </span>
                  <p className="font-semibold text-slate-800 leading-snug">{pickupAddress}</p>
                </div>

                <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-rose-600 uppercase flex items-center gap-1 font-mono">
                    <Navigation className="w-3 h-3" /> Tujuan (Pengantaran):
                  </span>
                  <p className="font-semibold text-slate-800 leading-snug">{dropoffAddress}</p>
                </div>
              </div>

              {/* Breakdown Biaya */}
              <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Jarak Hitung Peta:</span>
                  <span className="font-bold text-slate-900 font-mono">{distanceKm} km</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Waktu Tempuh:</span>
                  <span className="font-bold text-brand-teal font-mono">
                    {formatTravelTime(estimatedDurationMinutes)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Waktu Penjemputan:</span>
                  <span className="font-bold text-slate-900">{pickupTimeOption}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Pemesan:</span>
                  <span className="font-bold text-slate-900">{customerName} ({customerPhone})</span>
                </div>
                {notes && (
                  <div className="flex justify-between text-slate-600">
                    <span>Catatan:</span>
                    <span className="font-medium text-slate-800">{notes}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
                  <span>Tarif Pokok ({distanceKm} km x Rp7.000):</span>
                  <span className="font-bold text-slate-900 font-mono">
                    Rp{baseFare.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-brand-teal font-bold">
                  <span>Kode Unik Verifikasi:</span>
                  <span className="font-mono">+Rp{uniqueCode}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-200 text-sm font-extrabold text-brand-primary">
                  <span>Total yang Harus Dibayar:</span>
                  <span className="text-base font-black text-brand-teal font-mono">
                    Rp{totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Keterangan Tol & Parkir */}
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  <strong>Catatan:</strong> Tarif di atas <strong>tidak termasuk tol dan parkir</strong> (dibayar mandiri jika melintasi tol/parkir).
                </span>
              </div>
            </div>

            {/* Tombol Lanjut ke QRIS */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                &larr; Ubah Rute / Data
              </button>

              <button
                type="button"
                onClick={handleConfirmAndPay}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-black text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-brand-lime" />
                    <span>Mempersiapkan QRIS...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-brand-lime fill-brand-lime" />
                    <span>Lanjut ke Pembayaran QRIS (Rp{totalAmount.toLocaleString('id-ID')})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
