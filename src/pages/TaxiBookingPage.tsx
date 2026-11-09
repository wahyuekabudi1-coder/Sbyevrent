import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Navigation,
  Clock,
  MapPin,
  User,
  Phone,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  Calculator,
  ChevronRight,
  Sparkles,
  Loader2,
  Info,
  Timer
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

export const TaxiBookingPage: React.FC<TaxiBookingPageProps> = ({
  onBackHome,
  onOpenPaymentModal,
  onOpenTracker
}) => {
  // Wizard Steps: 1: Rute & Waktu, 2: Rincian Pemesanan (Summary)
  const [step, setStep] = useState<1 | 2>(1);

  // Wilayah Layanan Taksi: Taksi Surabaya dan Sidoarjo (tanpa perlu diklik)
  const serviceCityText = 'Taksi Surabaya dan Sidoarjo';
  const effectiveCity = 'Surabaya'; // default query context

  // Rute Penjemputan: Dari (dengan Map & Gunakan Lokasi Saya) dan Tujuan (ketik manual, tanpa peta)
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffAddress, setDropoffAddress] = useState<string>('');
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);

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

  // Kode unik acak (< Rp1.000)
  const [uniqueCode] = useState<number>(() => Math.floor(100 + Math.random() * 899));

  // State Submisi
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Hitung estimasi waktu tempuh dari jarak (rata-rata kecepatan dalam kota 25-30 km/jam)
  const formatTravelTime = (mins: number) => {
    if (mins < 60) {
      return `± ${mins} Menit`;
    }
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `± ${hours} Jam ${remainingMins > 0 ? remainingMins + ' Menit' : ''}`;
  };

  // Geocode alamat tujuan dan kalkulasi jarak + waktu tempuh riil dari peta (OSRM / OpenStreetMap)
  const calculateRealRoute = async (pCoords: { lat: number; lng: number }, dAddressText: string) => {
    if (!pCoords || !dAddressText.trim()) return;

    setIsCalculatingRoute(true);
    try {
      // 1. Geocode dropoff address via Nominatim (scoped to Jawa Timur / Surabaya-Sidoarjo)
      let dLat = dropoffCoords?.lat;
      let dLng = dropoffCoords?.lng;

      if (!dLat || !dLng) {
        const query = encodeURIComponent(`${dAddressText}, Jawa Timur, Indonesia`);
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

      // 2. Hitung jarak & durasi via routing engine OSRM
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

      // Fallback jarak jika OSRM rate-limited (Haversine x 1.35 faktor jalanan)
      if (dLat && dLng) {
        const R = 6371;
        const dLatRad = (dLat - pCoords.lat) * (Math.PI / 180);
        const dLonRad = (dLng - pCoords.lng) * (Math.PI / 180);
        const a =
          Math.sin(dLatRad / 2) * Math.sin(dLatRad / 2) +
          Math.cos(pCoords.lat * (Math.PI / 180)) * Math.cos(dLat * (Math.PI / 180)) * Math.sin(dLonRad / 2) * Math.sin(dLonRad / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const fallbackKm = Math.max(1, Math.round(R * c * 1.35 * 10) / 10);
        const fallbackMins = Math.round(fallbackKm * 2.2); // estimasi kecepatan rata-rata perkotaan
        setDistanceKm(fallbackKm);
        setEstimatedDurationMinutes(fallbackMins);
      }
    } catch {
      // Jika geocode gagal, pertahankan nilai jarak saat ini
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Debounced trigger saat dropoffAddress atau pickupCoords berubah
  useEffect(() => {
    if (!pickupCoords || !dropoffAddress.trim()) return;
    const timer = setTimeout(() => {
      calculateRealRoute(pickupCoords, dropoffAddress);
    }, 900);
    return () => clearTimeout(timer);
  }, [pickupCoords, dropoffAddress]);

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

  // Eksekusi Pemesanan Taksi & Langsung Masuk ke Payment QRIS
  const handleConfirmAndPay = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const result = await api.createTaxiBooking({
        city: 'Surabaya', // Area Surabaya & Sidoarjo
        pickupAddress,
        dropoffAddress,
        pickupCoords: pickupCoords || undefined,
        dropoffCoords: dropoffCoords || undefined,
        distanceKm,
        bookingDate: new Date().toISOString().split('T')[0],
        bookingTime: pickupTimeOption,
        customerName,
        customerPhone,
        passengerCount: 1, // Bebas penumpang tanpa form
        notes: notes.trim() ? notes : undefined,
        uniqueCode
      });

      // Langsung buka modal Pembayaran QRIS Resmi (seperti pada rental mobil)
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackHome}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali ke Beranda</span>
            </button>
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <Logo className="h-8" showSubtitle={false} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-brand-teal bg-brand-mint px-3 py-1 rounded-full border border-brand-teal/25 font-mono hidden sm:inline-block">
              Tarif Resmi Rp7.000 / km
            </span>
            <button
              onClick={() => onOpenTracker('')}
              className="text-xs font-bold text-slate-600 hover:text-brand-teal py-2 px-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cek Status Booking
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">

        {/* Progress Tracker / Step Indicator (Halaman Fix) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5">
          <div className="flex items-center justify-between max-w-xl mx-auto">
            {/* Step 1 */}
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 1 ? 'bg-brand-teal text-white shadow-2xs' : 'bg-slate-100 text-slate-400'
              }`}>
                1
              </div>
              <span className={`text-xs font-bold hidden sm:inline ${
                step === 1 ? 'text-brand-primary' : 'text-slate-500'
              }`}>
                Rute &amp; Waktu Jemput
              </span>
            </div>

            <div className={`h-1 flex-1 mx-3 rounded-full ${step >= 2 ? 'bg-brand-teal' : 'bg-slate-200'}`} />

            {/* Step 2 */}
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                step === 2 ? 'bg-brand-teal text-white shadow-2xs' : 'bg-slate-100 text-slate-400'
              }`}>
                2
              </div>
              <span className={`text-xs font-bold hidden sm:inline ${
                step === 2 ? 'text-brand-primary' : 'text-slate-500'
              }`}>
                Rincian Pemesanan &amp; Pembayaran
              </span>
            </div>
          </div>
        </div>

        {/* Banner Alert Pesan Error jika ada */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Perhatian</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAHAP 1: RUTE, WAKTU JEMPUT, PETA PENJEMPUTAN & DATA     */}
        {/* ======================================================== */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-8 space-y-6">
            
            {/* Header Form */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LiveryStripe variant="slanted" />
                <span className="text-[11px] font-bold text-brand-teal uppercase tracking-wider font-mono">
                  Layanan Taksi Mobil Listrik Resmi Jawa Timur
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-brand-primary tracking-tight">
                FORM PEMESANAN TAKSI MOBIL LISTRIK
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Layanan point-to-point berbasis jarak riil (Rp7.000/km). Tentukan titik penjemputan dan tujuan perjalanan Anda.
              </p>
            </div>

            {/* 1. Wilayah Layanan Taksi (Fix Text: Taksi Surabaya dan Sidoarjo, tidak usah diklik) */}
            <div className="p-4 rounded-xl bg-brand-mint/40 border border-brand-teal/25 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-teal text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <MapPin className="w-4 h-4 text-brand-lime" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-brand-teal tracking-wider block font-mono">
                    Wilayah Layanan Resmi
                  </span>
                  <strong className="text-sm sm:text-base font-extrabold text-brand-primary">
                    {serviceCityText}
                  </strong>
                </div>
              </div>
              <span className="text-[11px] font-bold text-brand-teal bg-white px-3 py-1 rounded-full border border-brand-teal/30 shadow-2xs">
                Aktif Melayani 24 Jam
              </span>
            </div>

            {/* 2. Rute: Dari (Ketik + Peta Penjemputan + Gunakan Lokasi Saya) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs sm:text-sm font-bold text-brand-primary">
                  Dari (Lokasi Penjemputan) <span className="text-rose-600">*</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  Ketik alamat atau geser pin pada peta penjemputan
                </span>
              </div>

              {/* Peta Hanya Terbaca untuk Lokasi Penjemputan Saja */}
              <InteractivePickupMap
                city="Surabaya"
                currentAddress={pickupAddress}
                onLocationSelect={(loc) => {
                  setPickupAddress(loc.address);
                  setPickupCoords({ lat: loc.lat, lng: loc.lng });
                  if (dropoffAddress.trim()) {
                    calculateRealRoute({ lat: loc.lat, lng: loc.lng }, dropoffAddress);
                  }
                }}
              />

              {/* Input Teks Alamat Dari / Penjemputan */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600">
                  Ketik / Perjelas Alamat Penjemputan (Dari):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ketik alamat penjemputan, nama gedung, atau patokan rumah Anda..."
                  value={pickupAddress}
                  onChange={(e) => {
                    setPickupAddress(e.target.value);
                    if (pickupCoords && dropoffAddress.trim()) {
                      calculateRealRoute(pickupCoords, dropoffAddress);
                    }
                  }}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-brand-teal shadow-2xs"
                />
              </div>
            </div>

            {/* 3. Rute: Tujuan (Lokasi Pengantaran - Ketik Manual Saja, Tidak Ada Peta) */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs sm:text-sm font-bold text-brand-primary">
                Tujuan (Lokasi Pengantaran) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ketik alamat lengkap atau gedung lokasi tujuan pengantaran Anda..."
                value={dropoffAddress}
                onChange={(e) => setDropoffAddress(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-brand-teal shadow-2xs"
              />
              <span className="text-[10px] text-slate-500 block">
                Cukup ketik alamat atau nama lokasi tujuan Anda. Sistem akan langsung mengukur jarak tempuh kilometer dari peta.
              </span>
            </div>

            {/* 4. Panel Kalkulasi Jarak & Waktu Tempuh Riil dari Peta */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-700 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-teal text-white flex items-center justify-center shrink-0">
                    <Calculator className="w-4 h-4 text-brand-lime" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-brand-lime tracking-wider">
                      Kalkulasi Jarak &amp; Waktu Tempuh Riil
                    </h3>
                    <p className="text-[10px] text-slate-300">
                      Terbaca langsung dari peta navigasi rute penjemputan
                    </p>
                  </div>
                </div>

                {isCalculatingRoute && (
                  <div className="flex items-center gap-1.5 text-[11px] text-brand-lime font-mono">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghitung rute riil...</span>
                  </div>
                )}
              </div>

              {/* Jarak Hitung & Waktu Tempuh */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Jarak Hitung:</span>
                    <span className="text-[10px] text-brand-lime font-mono font-bold">Rute Peta</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white font-mono">
                      {distanceKm}
                    </span>
                    <span className="text-sm font-bold text-brand-lime font-mono">km</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Dikalikan tarif resmi Rp7.000 / km
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Timer className="w-3.5 h-3.5 text-brand-lime" />
                      <span>Estimasi Waktu Tempuh:</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Lalu Lintas Normal</span>
                  </div>
                  <div className="text-2xl font-black text-brand-lime font-mono">
                    {formatTravelTime(estimatedDurationMinutes)}
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Perjalanan nyaman dengan mobil listrik modern
                  </span>
                </div>
              </div>

              {/* Total Tarif Sementara & Catatan Tidak Termasuk Tol & Parkir */}
              <div className="pt-2 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] text-slate-400 block">Estimasi Tarif Taksi:</span>
                  <div className="text-xl sm:text-2xl font-black text-brand-lime font-mono">
                    Rp{baseFare.toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Penegasan: Tidak Termasuk Tol dan Parkir */}
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs flex items-center gap-2 max-w-md">
                  <Info className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="text-[11px] leading-relaxed text-amber-100">
                    Tarif di atas <strong>tidak termasuk tol dan parkir</strong> (biaya tol &amp; parkir dibayar tersendiri oleh penumpang jika ada).
                  </span>
                </div>
              </div>

            </div>

            {/* 5. Waktu Penjemputan (Drop Down Sesuai Permintaan) */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs sm:text-sm font-bold text-brand-primary">
                Waktu Penjemputan (Pilihan Drop Down) <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <select
                  value={pickupTimeOption}
                  onChange={(e) => setPickupTimeOption(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:border-brand-teal shadow-2xs font-bold"
                >
                  <option value="Sekarang (Segera Meluncur)">Sekarang (Segera Meluncur)</option>
                  <option value="5 Menit">5 Menit</option>
                  <option value="10 Menit">10 Menit</option>
                  <option value="30 Menit">30 Menit</option>
                  <option value="1 Jam">1 Jam</option>
                </select>
              </div>
            </div>

            {/* 6. Data Pemesan (Nama pemesan, nomor WhatsApp, catatan patokan) */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <h2 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                Informasi Kontak Pemesan
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-primary">
                    Nama Pemesan <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap pemesan..."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-brand-teal shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-primary">
                    Nomor WhatsApp <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      placeholder="081234567890"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-brand-teal shadow-2xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Catatan Patokan */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Catatan Patokan Penjemputan (Boleh Diisi / Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Tunggu di depan pos satpam, pagar warna hitam, dekat masjid..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-brand-teal shadow-2xs"
                />
              </div>
            </div>

            {/* Navigasi Tombol Step 1 */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBackHome}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                &larr; Batalkan &amp; Kembali
              </button>

              <button
                type="button"
                onClick={handleProceedToSummary}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-bold text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Lanjutkan Pemesanan Taksi</span>
                <ChevronRight className="w-4 h-4 text-brand-lime" />
              </button>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAHAP 2: RINCIAN PEMESANAN & LANJUT KE PAYMENT QRIS      */}
        {/* ======================================================== */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LiveryStripe variant="slanted" />
                <span className="text-[11px] font-bold text-brand-teal uppercase tracking-wider font-mono">
                  Langkah 2 dari 2 · Rincian Pemesanan Taksi
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-brand-primary tracking-tight">
                RINCIAN PEMESANAN TAKSI LISTRIK
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Periksa kembali rincian perjalanan Anda. Setelah mengeklik tombol di bawah, Anda akan langsung diarahkan ke pembayaran QRIS resmi.
              </p>
            </div>

            {/* Kartu Rincian Lengkap */}
            <div className="rounded-2xl border border-brand-teal/25 bg-gradient-to-br from-brand-mint/40 via-white to-brand-mint/15 p-5 sm:p-6 space-y-4">
              
              {/* Header Layanan Taksi */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-teal text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Navigation className="w-6 h-6 text-brand-lime" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal block font-mono">
                      Layanan Taksi Listrik (Point-to-Point)
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-brand-primary">
                      {serviceCityText}
                    </h3>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-500 block">Total Tagihan (Termasuk Kode Unik):</span>
                  <div className="text-xl sm:text-2xl font-black text-brand-teal font-mono">
                    Rp{totalAmount.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* Rincian Rute & Jadwal Penjemputan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-brand-teal font-bold">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Dari (Titik Penjemputan):</span>
                  </div>
                  <p className="font-semibold text-slate-800 leading-relaxed">
                    {pickupAddress}
                  </p>
                  {pickupCoords && (
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Koordinat: {pickupCoords.lat.toFixed(5)}, {pickupCoords.lng.toFixed(5)}
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-600 font-bold">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Tujuan (Lokasi Pengantaran):</span>
                  </div>
                  <p className="font-semibold text-slate-800 leading-relaxed">
                    {dropoffAddress}
                  </p>
                  <span className="text-[10px] text-slate-400 block">
                    Alamat tujuan pengantaran langsung
                  </span>
                </div>
              </div>

              {/* Data Finansial & Kalkulasi Kilometer */}
              <div className="p-4 rounded-xl bg-white border-2 border-brand-teal/20 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Jarak Tempuh Riil dari Peta:</span>
                  <span className="font-bold text-slate-900 font-mono">{distanceKm} km</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Estimasi Waktu Tempuh:</span>
                  <span className="font-bold text-brand-teal font-mono">{formatTravelTime(estimatedDurationMinutes)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Waktu Penjemputan:</span>
                  <span className="font-bold text-slate-900">{pickupTimeOption}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Nama Pemesan / WhatsApp:</span>
                  <span className="font-bold text-slate-900">{customerName} ({customerPhone})</span>
                </div>
                {notes && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Catatan Patokan:</span>
                    <span className="font-medium text-slate-800">{notes}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Tarif Pokok ({distanceKm} km x Rp7.000):</span>
                  <span className="font-bold text-slate-900">Rp{baseFare.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-brand-teal font-bold">Kode Unik Verifikasi Transaksi:</span>
                  <span className="font-bold text-brand-teal font-mono">+Rp{uniqueCode}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-extrabold text-brand-primary">
                  <span>Total Tagihan Pembayaran:</span>
                  <span className="text-lg font-black text-brand-teal font-mono">
                    Rp{totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Keterangan Tidak Termasuk Tol dan Parkir */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Penting:</strong> Tarif taksi <strong>tidak termasuk biaya tol dan parkir</strong>. Pembayaran tol dan parkir ditanggung mandiri jika rute perjalanan melintasi gerbang tol atau titik parkir.
                </span>
              </div>

            </div>

            {/* Navigasi Tombol Step 2 */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                &larr; Ubah Rute &amp; Data Pemesan
              </button>

              <button
                type="button"
                onClick={handleConfirmAndPay}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-black text-sm sm:text-base shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-brand-lime" />
                    <span>Menghubungkan ke Pembayaran QRIS...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-brand-lime fill-brand-lime" />
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
