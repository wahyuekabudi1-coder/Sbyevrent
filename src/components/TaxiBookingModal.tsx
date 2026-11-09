import React, { useState, useEffect } from 'react';
import {
  X,
  Navigation,
  Calculator,
  ArrowRight,
  Loader2,
  MapPin,
  Crosshair,
  Sparkles,
  Info,
  Car,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api';
import { InteractiveTaxiRouteMap } from './InteractiveTaxiRouteMap';

interface TaxiBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessBooking: (bookingNumber: string) => void;
}

// Data Lokasi Populer di Surabaya dan Sidoarjo
const POPULAR_LOCATIONS: Record<'Surabaya' | 'Sidoarjo', { name: string; lat: number; lng: number; address: string }[]> = {
  Surabaya: [
    { name: 'Bandara Juanda (T1/T2)', lat: -7.3798, lng: 112.7875, address: 'Bandara Internasional Juanda, Sedati, Sidoarjo/Surabaya' },
    { name: 'Tunjungan Plaza (TP)', lat: -7.2625, lng: 112.7397, address: 'Tunjungan Plaza, Jl. Jenderal Basuki Rachmat No.8-12, Tegalsari, Surabaya' },
    { name: 'Stasiun Gubeng', lat: -7.2654, lng: 112.7523, address: 'Stasiun Surabaya Gubeng, Jl. Gubeng Masjid No.1, Tambaksari, Surabaya' },
    { name: 'Stasiun Pasar Turi', lat: -7.2478, lng: 112.7314, address: 'Stasiun Pasar Turi, Jl. Semarang No.1, Gundih, Bubutan, Surabaya' },
    { name: 'Pakuwon Mall', lat: -7.2995, lng: 112.6756, address: 'Pakuwon Mall, Jl. Puncak Indah Lontar No.2, Babatan, Wiyung, Surabaya' },
  ],
  Sidoarjo: [
    { name: 'Bandara Juanda', lat: -7.3798, lng: 112.7875, address: 'Bandara Internasional Juanda, Jl. Ir. H. Juanda, Sedati, Sidoarjo' },
    { name: 'Alun-Alun Sidoarjo', lat: -7.4478, lng: 112.7178, address: 'Alun-Alun Sidoarjo, Jl. Cokronegoro, Sidokumpul, Sidoarjo' },
    { name: 'Terminal Bungurasih (Purabaya)', lat: -7.3533, lng: 112.7246, address: 'Terminal Purabaya, Jl. Letjend Sutoyo, Bungurasih, Waru, Sidoarjo' },
    { name: 'Stasiun Sidoarjo Kota', lat: -7.4567, lng: 112.7132, address: 'Stasiun Sidoarjo, Jl. Pahlawan No.1, Lemahputro, Sidoarjo' },
    { name: 'Lippo Plaza Sidoarjo', lat: -7.4529, lng: 112.7058, address: 'Lippo Plaza Sidoarjo, Jl. Jati Raya No.1, Jati, Sidoarjo' },
  ]
};

export const TaxiBookingModal: React.FC<TaxiBookingModalProps> = ({
  isOpen,
  onClose,
  onSuccessBooking
}) => {
  const [city, setCity] = useState<'Surabaya' | 'Sidoarjo'>('Surabaya');

  // Rute: Dari (Lokasi Jemput) dan Tujuan
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [dropoffAddress, setDropoffAddress] = useState<string>('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Status target aktif klik peta: 'pickup' atau 'dropoff'
  const [activeTarget, setActiveTarget] = useState<'pickup' | 'dropoff'>('pickup');

  // Jarak (km) & Tarif (Rp7.000 / km)
  const [distanceKm, setDistanceKm] = useState<number>(10);
  const ratePerKm = 7000;
  const calculatedFare = Math.round(distanceKm * ratePerKm);

  // Jadwal & Penumpang
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('Sekarang (Segera)');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLocatingSelf, setIsLocatingSelf] = useState<boolean>(false);

  // Lock body scroll saat modal aktif
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Set default saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setBookingDate(today);
      setErrorMsg(null);

      if (!pickupAddress && POPULAR_LOCATIONS[city][0]) {
        const p1 = POPULAR_LOCATIONS[city][0];
        const p2 = POPULAR_LOCATIONS[city][1] || POPULAR_LOCATIONS[city][0];
        setPickupAddress(p1.address);
        setPickupCoords({ lat: p1.lat, lng: p1.lng });
        setDropoffAddress(p2.address);
        setDropoffCoords({ lat: p2.lat, lng: p2.lng });
        calcDistance(p1.lat, p1.lng, p2.lat, p2.lng);
      }
    }
  }, [isOpen, city]);

  // Hitung jarak Haversine (dengan faktor jalan 1.35) jika belum melalui OSRM
  const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const roadDist = Math.max(1, Math.round(R * c * 1.35 * 10) / 10);
    setDistanceKm(roadDist);
  };

  // Reverse geocode via Nominatim
  const fetchAddressFromCoords = async (lat: number, lng: number, target: 'pickup' | 'dropoff') => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'id' } }
      );
      if (res.ok) {
        const data = await res.json();
        const road = data.address?.road || data.address?.pedestrian || data.address?.suburb || '';
        const suburb = data.address?.suburb || data.address?.village || data.address?.city_district || '';
        const cityDistrict = data.address?.city || data.address?.county || city;
        const formatted = road || suburb
          ? `${road ? road + ', ' : ''}${suburb ? suburb + ', ' : ''}${cityDistrict}, Jawa Timur`
          : data.display_name;

        if (target === 'pickup') {
          setPickupAddress(formatted);
        } else {
          setDropoffAddress(formatted);
        }
      }
    } catch {
      const fallback = `Titik ${target === 'pickup' ? 'Penjemputan' : 'Tujuan'} [${lat.toFixed(5)}, ${lng.toFixed(5)}], ${city}`;
      if (target === 'pickup') {
        setPickupAddress(fallback);
      } else {
        setDropoffAddress(fallback);
      }
    }
  };

  // Handler: Pilih "Lokasi Saya" untuk Titik Dari (Jemput)
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Perangkat Anda tidak mendukung fitur lokasi GPS.');
      return;
    }

    setIsLocatingSelf(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingSelf(false);
        const { latitude, longitude } = pos.coords;
        setPickupCoords({ lat: latitude, lng: longitude });
        fetchAddressFromCoords(latitude, longitude, 'pickup');

        if (dropoffCoords) {
          calcDistance(latitude, longitude, dropoffCoords.lat, dropoffCoords.lng);
        }
        setActiveTarget('dropoff'); // Pindah otomatis ke titik tujuan
      },
      (err) => {
        setIsLocatingSelf(false);
        if (err.code === 1) {
          setErrorMsg('Izin akses lokasi GPS ditolak. Silakan ketik alamat penjemputan atau klik di peta.');
        } else {
          setErrorMsg('Gagal mendeteksi lokasi GPS. Silakan tentukan lokasi penjemputan di peta.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Handler Quick Pick
  const handleSelectPopularPickup = (loc: any) => {
    setPickupAddress(loc.address);
    setPickupCoords({ lat: loc.lat, lng: loc.lng });
    if (dropoffCoords) {
      calcDistance(loc.lat, loc.lng, dropoffCoords.lat, dropoffCoords.lng);
    }
    setActiveTarget('dropoff');
  };

  const handleSelectPopularDropoff = (loc: any) => {
    setDropoffAddress(loc.address);
    setDropoffCoords({ lat: loc.lat, lng: loc.lng });
    if (pickupCoords) {
      calcDistance(pickupCoords.lat, pickupCoords.lng, loc.lat, loc.lng);
    }
  };

  // Submit Order
  const handleSubmitTaxi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupAddress || !dropoffAddress) {
      setErrorMsg('Mohon lengkapi titik penjemputan (Dari) dan titik tujuan.');
      return;
    }
    if (!customerName || !customerPhone) {
      setErrorMsg('Mohon isi nama lengkap dan nomor WhatsApp pemesan.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.createTaxiBooking({
        city,
        pickupAddress,
        dropoffAddress,
        pickupCoords: pickupCoords || undefined,
        dropoffCoords: dropoffCoords || undefined,
        distanceKm,
        bookingDate,
        bookingTime,
        customerName,
        customerPhone,
        passengerCount,
        notes
      });

      onClose();
      onSuccessBooking(res.bookingNumber);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses pemesanan taksi listrik.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-teal text-white flex items-center justify-center shadow-xs">
              <Navigation className="w-5 h-5 text-brand-lime" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Pemesanan Taksi Mobil Listrik
                </h3>
                <span className="text-[10px] bg-brand-teal/40 text-brand-lime border border-brand-teal px-2 py-0.5 rounded-full font-mono font-bold">
                  Rp7.000 / km
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Layanan antar jemput Point-to-Point (Tanpa sewa per jam)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Tutup form pemesanan taksi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitTaxi} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
          
          {/* Pilih Wilayah Layanan (Surabaya atau Sidoarjo tanpa embel-embel) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Wilayah Layanan Taksi
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Surabaya', 'Sidoarjo'] as const).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCity(c)}
                  className={`py-2.5 px-3 text-xs sm:text-sm font-black rounded-xl border text-center transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-2 ${
                    city === c
                      ? 'border-brand-teal bg-brand-mint text-brand-primary ring-2 ring-brand-teal/40 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className={`w-3.5 h-3.5 ${city === c ? 'text-brand-teal' : 'text-slate-400'}`} />
                  <span>{c}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION RUTE: DARI (LOKASI & LOKASI SAYA) DAN TUJUAN */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-brand-teal" />
                <span>Rute Penjemputan (Dari &amp; Tujuan)</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Tentukan titik dari dan tujuan perjalanan Anda
              </span>
            </div>

            {/* Input 1: DARI (Lokasi Penjemputan) + Tombol "Lokasi Saya" */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-teal ring-2 ring-brand-teal/30" />
                  <span>Dari (Lokasi Penjemputan) *</span>
                </label>

                {/* Tombol Lokasi Saya */}
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={isLocatingSelf}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-mint hover:bg-brand-teal hover:text-white border border-brand-teal/30 text-[11px] font-bold text-brand-teal transition-all cursor-pointer shadow-2xs disabled:opacity-50 min-h-[32px]"
                  title="Gunakan koordinat GPS perangkat Anda sebagai titik dari"
                >
                  {isLocatingSelf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-teal" />
                  ) : (
                    <Crosshair className="w-3.5 h-3.5 text-brand-teal" />
                  )}
                  <span>{isLocatingSelf ? 'Mendeteksi GPS...' : 'Gunakan Lokasi Saya'}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ketik alamat penjemputan atau klik tombol 'Lokasi Saya'..."
                  value={pickupAddress}
                  onFocus={() => setActiveTarget('pickup')}
                  onChange={e => setPickupAddress(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white focus:outline-none text-slate-900 min-h-[44px] transition-all ${
                    activeTarget === 'pickup'
                      ? 'border-brand-teal ring-2 ring-brand-teal/20'
                      : 'border-slate-300'
                  }`}
                />
              </div>

              {/* Quick Pick Titik Dari */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 py-1 font-semibold">Pilih Cepat Dari:</span>
                {POPULAR_LOCATIONS[city].map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPopularPickup(loc)}
                    className="text-[10px] sm:text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-brand-mint hover:text-brand-teal text-slate-700 border border-slate-200 hover:border-brand-teal/30 transition-colors font-medium min-h-[28px] flex items-center cursor-pointer"
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Input 2: TUJUAN (Lokasi Pengantaran) */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-rose-300" />
                <span>Tujuan (Lokasi Pengantaran) *</span>
              </label>

              <input
                type="text"
                required
                placeholder="Ketik alamat atau nama gedung tujuan perjalanan..."
                value={dropoffAddress}
                onFocus={() => setActiveTarget('dropoff')}
                onChange={e => setDropoffAddress(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white focus:outline-none text-slate-900 min-h-[44px] transition-all ${
                  activeTarget === 'dropoff'
                    ? 'border-rose-500 ring-2 ring-rose-200'
                    : 'border-slate-300'
                }`}
              />

              {/* Quick Pick Titik Tujuan */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 py-1 font-semibold">Pilih Cepat Tujuan:</span>
                {POPULAR_LOCATIONS[city].map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPopularDropoff(loc)}
                    className="text-[10px] sm:text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200 hover:border-rose-300 transition-colors font-medium min-h-[28px] flex items-center cursor-pointer"
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            </div>

            {/* PETA RUTE INTERAKTIF */}
            <div className="pt-2">
              <InteractiveTaxiRouteMap
                city={city}
                pickupCoords={pickupCoords}
                dropoffCoords={dropoffCoords}
                activeTarget={activeTarget}
                setActiveTarget={setActiveTarget}
                onPickupSelect={(loc) => {
                  setPickupCoords({ lat: loc.lat, lng: loc.lng });
                  setPickupAddress(loc.address);
                  if (dropoffCoords) {
                    calcDistance(loc.lat, loc.lng, dropoffCoords.lat, dropoffCoords.lng);
                  }
                  setActiveTarget('dropoff');
                }}
                onDropoffSelect={(loc) => {
                  setDropoffCoords({ lat: loc.lat, lng: loc.lng });
                  setDropoffAddress(loc.address);
                  if (pickupCoords) {
                    calcDistance(pickupCoords.lat, pickupCoords.lng, loc.lat, loc.lng);
                  }
                }}
                onDistanceCalculated={(dist) => {
                  setDistanceKm(dist);
                }}
              />
            </div>
          </div>

          {/* KALKULATOR KILOMETER & PERHITUNGAN OTOMATIS: KM x 7.000 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-brand-primary via-slate-900 to-slate-900 text-white shadow-md space-y-3">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-700/80 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-teal/40 flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-brand-lime" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-brand-lime block">
                    Perhitungan Tarif Taksi
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Otomatis: Jarak (km) x Rp7.000 (Transparan)
                  </span>
                </div>
              </div>

              {/* Kontrol Penyesuaian Jarak Manual jika diperlukan */}
              <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700">
                <label className="text-[11px] text-slate-400">Jarak Terhitung:</label>
                <input
                  type="number"
                  min={1}
                  max={250}
                  step={0.5}
                  value={distanceKm}
                  onChange={e => setDistanceKm(Math.max(1, Number(e.target.value)))}
                  className="w-16 px-1.5 py-0.5 text-xs font-mono font-bold text-center rounded bg-slate-900 text-white border border-slate-600 focus:outline-none"
                />
                <span className="text-xs font-bold text-brand-lime font-mono">km</span>
              </div>
            </div>

            {/* Rincian Finansial Tarif */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-brand-lime font-mono">
                    Rp{calculatedFare.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ({distanceKm} km x Rp7.000)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Sudah termasuk unit mobil listrik VinFast, jasa driver profesional, dan daya baterai.
                </p>
              </div>

              {/* Keterangan Khusus: Tidak termasuk tol dan parkir */}
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-300 font-bold text-[11px]">Catatan Tarif:</strong>
                  <span className="text-[11px] leading-relaxed text-amber-100">
                    Tarif di atas <strong>tidak termasuk tol dan parkir</strong> (biaya tol &amp; parkir dibayar tersendiri sesuai rute yang dilalui jika ada).
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Waktu & Jumlah Penumpang */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Waktu Penjemputan
              </label>
              <select
                value={bookingTime}
                onChange={e => setBookingTime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal bg-white text-slate-900 min-h-[44px]"
              >
                <option value="Sekarang (Segera)">Sekarang (Segera Meluncur)</option>
                <option value="30 Menit Lagi">30 Menit Lagi</option>
                <option value="1 Jam Lagi">1 Jam Lagi</option>
                <option value="Besok Pagi (06:00 WIB)">Besok Pagi (06:00 WIB)</option>
                <option value="Besok Siang (12:00 WIB)">Besok Siang (12:00 WIB)</option>
                <option value="Besok Sore (17:00 WIB)">Besok Sore (17:00 WIB)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jumlah Penumpang (Maks. 3 Orang)
              </label>
              <select
                value={passengerCount}
                onChange={e => setPassengerCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal bg-white text-slate-900 min-h-[44px]"
              >
                <option value={1}>1 Penumpang</option>
                <option value={2}>2 Penumpang</option>
                <option value={3}>3 Penumpang (Maksimal)</option>
              </select>
            </div>
          </div>

          {/* Data Pelanggan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Pemesan *</label>
              <input
                type="text"
                required
                placeholder="Nama lengkap Anda..."
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal text-slate-900 min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp Aktif *</label>
              <input
                type="tel"
                required
                placeholder="081234567890"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal text-slate-900 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan / Patokan Penjemputan (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: Tunggu di depan gerbang utama pos satpam..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal text-slate-900 min-h-[44px]"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tombol Eksekusi Pesan Taksi Listrik */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-5 font-black text-sm text-white bg-brand-teal hover:bg-brand-teal-hover rounded-xl shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all min-h-[48px] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0 text-brand-lime" />
                  <span>Memproses Pesanan Taksi Listrik...</span>
                </>
              ) : (
                <>
                  <span>Lanjutkan Pemesanan Taksi (Rp{calculatedFare.toLocaleString('id-ID')})</span>
                  <ArrowRight className="w-4 h-4 shrink-0 text-brand-lime" />
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-500 mt-2">
              Setelah dikonfirmasi, Anda akan diarahkan ke layar pembayaran QRIS resmi.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
