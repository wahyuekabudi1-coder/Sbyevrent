import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  QrCode,
  ChevronRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { api } from '../lib/api';
import { RentalPricingItem } from '../types';
import { InteractivePickupMap } from '../components/InteractivePickupMap';
import { Logo } from '../components/Logo';
import { LiveryStripe } from '../components/EvLiveryDecals';

interface RentalBookingPageProps {
  pricingList: RentalPricingItem[];
  prefill?: { model?: string; hours?: number; city?: string };
  onBackHome: () => void;
  onOpenPaymentModal: (bookingNumber: string) => void;
  onOpenTracker: (bookingNumber: string) => void;
}

export const RentalBookingPage: React.FC<RentalBookingPageProps> = ({
  pricingList,
  prefill,
  onBackHome,
  onOpenPaymentModal,
  onOpenTracker,
}) => {
  // Wizard Steps: 1: Kota & Jadwal, 2: Armada & Paket, 3: Data Pemesan & Titik Jemput, 4: Rincian Pemesanan (Summary)
  const [step, setStep] = useState<number>(1);

  // Tahap 1: Kota & Jadwal (Strictly Surabaya & Sidoarjo tanpa embel-embel)
  const [city, setCity] = useState<string>(prefill?.city || '');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('08:00');

  // Tahap 2: Armada & Paket Durasi (Dropdown)
  const [vehicleModel, setVehicleModel] = useState<string>(prefill?.model || 'VinFast VF 5');
  const [durationHours, setDurationHours] = useState<number>(prefill?.hours || 3);

  // Tahap 3: Informasi Pemesan & Peta
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [notes, setNotes] = useState<string>('');

  // Kode Unik Acak (Tidak lebih dari Rp300, utamakan 100-200 rupiah)
  const [uniqueCode] = useState<number>(() => (Math.random() < 0.7 ? Math.floor(101 + Math.random() * 99) : Math.floor(201 + Math.random() * 98)));

  // State Pesanan & Pembayaran
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdBookingNumber, setCreatedBookingNumber] = useState<string | null>(null);

  // Minimum date: H-1 (besok)
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Set default date jika belum ada
  useEffect(() => {
    if (!date) {
      setDate(tomorrowStr);
    }
  }, [tomorrowStr]);

  // Hitung tarif pokok sesuai armada, kota, dan durasi dari pricingList
  const calculateBasePrice = (): number => {
    if (!vehicleModel || !durationHours) return 0;
    const effectiveCity = city || 'Surabaya';
    const item = pricingList.find(
      p => p.vehicle_model === vehicleModel && p.duration_hours === durationHours && (p.city === effectiveCity || p.city === 'Surabaya')
    );
    if (item) return item.price;

    // Fallback baseline standard price
    const basePrices: Record<string, Record<number, number>> = {
      'VinFast VF 5': { 3: 240000, 5: 370000, 8: 540000, 12: 760000 },
      'VinFast VF e34': { 3: 290000, 5: 450000, 8: 660000, 12: 920000 },
    };
    return basePrices[vehicleModel]?.[durationHours] || 240000;
  };

  const getPackagePrice = (hours: number): number => {
    const effectiveCity = city || 'Surabaya';
    const item = pricingList.find(
      p => p.vehicle_model === vehicleModel && p.duration_hours === hours && (p.city === effectiveCity || p.city === 'Surabaya')
    );
    if (item) return item.price;
    const basePrices: Record<string, Record<number, number>> = {
      'VinFast VF 5': { 3: 240000, 5: 370000, 8: 540000, 12: 760000 },
      'VinFast VF e34': { 3: 290000, 5: 450000, 8: 660000, 12: 920000 },
    };
    return basePrices[vehicleModel]?.[hours] || 0;
  };

  const basePrice = calculateBasePrice();
  const totalAmount = basePrice + uniqueCode;

  // Navigasi Langkah
  const handleProceedFromStep1 = () => {
    setErrorMsg(null);
    if (!city) {
      setErrorMsg('Silakan pilih kota terlebih dahulu (Surabaya atau Sidoarjo).');
      return;
    }
    if (!date) {
      setErrorMsg('Silakan tentukan tanggal pemesanan.');
      return;
    }
    setStep(2);
  };

  const handleProceedFromStep2 = () => {
    setErrorMsg(null);
    if (!vehicleModel) {
      setErrorMsg('Silakan pilih salah satu armada VinFast.');
      return;
    }
    if (!durationHours) {
      setErrorMsg('Silakan pilih paket durasi sewa.');
      return;
    }
    setStep(3);
  };

  const handleProceedFromStep3 = () => {
    setErrorMsg(null);
    if (!customerName.trim()) {
      setErrorMsg('Nama lengkap pemesan wajib diisi.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg('Nomor WhatsApp / telepon aktif wajib diisi.');
      return;
    }
    if (!pickupAddress.trim()) {
      setErrorMsg('Lokasi / alamat penjemputan lengkap wajib diisi atau ditentukan pada peta.');
      return;
    }
    setStep(4);
  };

  // Langsung Lanjutkan ke Pembayaran QRIS Resmi (Scan Barcode & Kode Unik)
  const handleDirectToQrisPayment = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const result = await api.createRentalBooking({
        city,
        date,
        time,
        vehicleModel,
        durationHours,
        customerName,
        customerPhone,
        passengerCount: 3, // Standar kapasitas resmi maks 3 penumpang
        pickupAddress,
        notes: notes.trim() ? notes : undefined,
        uniqueCode
      });

      setCreatedBookingNumber(result.bookingNumber);
      
      // Langsung buka modal Pembayaran QRIS Resmi
      onOpenPaymentModal(result.bookingNumber);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat pesanan. Silakan coba beberapa saat lagi.');
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-brand-teal hover:bg-brand-mint border border-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-brand-teal" />
              <span>Kembali</span>
            </button>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div className="hidden sm:block">
              <Logo size="sm" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-600 font-mono">
              <span className={`px-2 py-0.5 rounded ${step >= 1 ? 'bg-brand-teal text-white' : 'bg-slate-100 text-slate-400'}`}>1. Kota</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className={`px-2 py-0.5 rounded ${step >= 2 ? 'bg-brand-teal text-white' : 'bg-slate-100 text-slate-400'}`}>2. Paket</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className={`px-2 py-0.5 rounded ${step >= 3 ? 'bg-brand-teal text-white' : 'bg-slate-100 text-slate-400'}`}>3. Titik Jemput</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className={`px-2 py-0.5 rounded ${step >= 4 ? 'bg-brand-teal text-white' : 'bg-slate-100 text-slate-400'}`}>4. Pembayaran</span>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-mint border border-brand-teal/20 text-brand-teal text-xs font-extrabold">
              <Zap className="w-3.5 h-3.5 text-brand-lime fill-brand-lime" />
              <span>Rental H-1 Resmi</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1">
          <div
            className="bg-brand-teal h-1 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Content Page Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* Error Alert Box */}
        {errorMsg && (
          <div className="mb-6 p-3.5 sm:p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAHAP 1: PILIH KOTA & JADWAL (MURNI SURABAYA & SIDOARJO) */}
        {/* ======================================================== */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LiveryStripe variant="slanted" />
                <span className="text-[11px] font-bold text-brand-teal uppercase tracking-wider font-mono">
                  Langkah 1 dari 4
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-brand-primary tracking-tight">
                PILIH KOTA &amp; JADWAL PENJEMPUTAN
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Pilih kota layanan terlebih dahulu untuk membuka pemilihan tanggal dan jam penjemputan.
              </p>
            </div>

            {/* 1.1 Dropdown Kota (Murni Surabaya dan Sidoarjo tanpa embel-embel) */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-bold text-brand-primary">
                Kota <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border-2 border-brand-teal/40 bg-white font-bold text-sm text-brand-primary focus:outline-none focus:border-brand-teal shadow-2xs cursor-pointer"
                >
                  <option value="">-- Pilih Kota --</option>
                  <option value="Surabaya">Surabaya</option>
                  <option value="Sidoarjo">Sidoarjo</option>
                </select>
              </div>
              {!city ? (
                <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1.5 pt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Silakan pilih kota (Surabaya atau Sidoarjo) agar tanggal dan jam dapat ditentukan.</span>
                </p>
              ) : (
                <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5 pt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Kota <strong>{city}</strong> terpilih. Silakan tentukan tanggal dan jam penjemputan.</span>
                </p>
              )}
            </div>

            {/* 1.2 Tanggal & Jam Penjemputan (Disabled jika kota belum dipilih) */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${city ? 'bg-brand-mint/30 border-brand-teal/20' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Tanggal */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Tanggal Perjalanan (Wajib Min. H-1) <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={tomorrowStr}
                      disabled={!city}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-brand-teal disabled:cursor-not-allowed shadow-2xs"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Pemesanan rental wajib dilakukan minimal H-1 sebelum tanggal perjalanan.
                  </span>
                </div>

                {/* Jam Mulai */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Jam Mulai Penjemputan <span className="text-rose-600">*</span>
                  </label>
                  <select
                    disabled={!city}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-brand-teal disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                  >
                    {[
                      '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
                      '09:00', '09:30', '10:00', '11:00', '12:00', '13:00',
                      '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
                    ].map(t => (
                      <option key={t} value={t}>{t} WIB</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-500 block">
                    Armada &amp; driver akan tiba tepat waktu di titik penjemputan Anda.
                  </span>
                </div>

              </div>
            </div>

            {/* Inklusi Informasi Cepat */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-teal shrink-0" />
                <span className="font-semibold text-slate-700">Sudah Termasuk Driver</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand-lime fill-brand-lime shrink-0" />
                <span className="font-semibold text-slate-700">Sudah Termasuk Listrik</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-teal shrink-0" />
                <span className="font-semibold text-slate-700">Maks. 3 Penumpang</span>
              </div>
            </div>

            {/* Tombol Lanjut ke Tahap 2 */}
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleProceedFromStep1}
                disabled={!city}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-bold text-sm shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>Lanjutkan ke Pilihan Armada &amp; Paket</span>
                <ChevronRight className="w-4 h-4 text-brand-lime" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAHAP 2: PILIH ARMADA & PAKET DURASI (DROPDOWN)           */}
        {/* ======================================================== */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LiveryStripe variant="slanted" />
                <span className="text-[11px] font-bold text-brand-teal uppercase tracking-wider font-mono">
                  Langkah 2 dari 4 · {city}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-brand-primary tracking-tight">
                PILIH ARMADA VINFAST &amp; PAKET DURASI
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Pilih model kendaraan listrik resmi dan durasi sewa melalui menu dropdown di bawah.
              </p>
            </div>

            {/* 2.1 Pilihan Armada VinFast */}
            <div className="space-y-3">
              <label className="block text-xs sm:text-sm font-bold text-brand-primary">
                Pilih Armada Kendaraan Listrik <span className="text-rose-600">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Opsi 1: VinFast VF 5 */}
                <button
                  type="button"
                  onClick={() => setVehicleModel('VinFast VF 5')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex gap-3.5 items-center ${
                    vehicleModel === 'VinFast VF 5'
                      ? 'border-brand-teal bg-brand-mint/50 ring-2 ring-brand-teal/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-brand-teal/50'
                  }`}
                >
                  <div className="w-24 h-18 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 relative">
                    <img
                      src="/src/assets/images/vinfast_vf5_1794185355445.jpg"
                      alt="VinFast VF 5"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 text-[8px] font-bold bg-brand-primary/90 text-brand-lime px-1 py-0.5 rounded font-mono">
                      VF 5
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal block font-mono">
                      Compact Crossover
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-brand-primary truncate">
                      VinFast VF 5
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      Maks. 3 Penumpang · Include Driver
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] font-extrabold text-brand-teal">
                      <span>Mulai Rp240.000 (3 Jam)</span>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    vehicleModel === 'VinFast VF 5' ? 'border-brand-teal bg-brand-teal text-white' : 'border-slate-300'
                  }`}>
                    {vehicleModel === 'VinFast VF 5' && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </button>

                {/* Opsi 2: VinFast VF e34 */}
                <button
                  type="button"
                  onClick={() => setVehicleModel('VinFast VF e34')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex gap-3.5 items-center ${
                    vehicleModel === 'VinFast VF e34'
                      ? 'border-brand-teal bg-brand-mint/50 ring-2 ring-brand-teal/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-brand-teal/50'
                  }`}
                >
                  <div className="w-24 h-18 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 relative">
                    <img
                      src="/src/assets/images/vinfast_vfe34_1794185371447.jpg"
                      alt="VinFast VF e34"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 text-[8px] font-bold bg-brand-primary/90 text-brand-lime px-1 py-0.5 rounded font-mono">
                      VF e34
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal block font-mono">
                      Spacious Mid-SUV
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-brand-primary truncate">
                      VinFast VF e34
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      Maks. 3 Penumpang · Include Driver
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] font-extrabold text-brand-teal">
                      <span>Mulai Rp290.000 (3 Jam)</span>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    vehicleModel === 'VinFast VF e34' ? 'border-brand-teal bg-brand-teal text-white' : 'border-slate-300'
                  }`}>
                    {vehicleModel === 'VinFast VF e34' && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </button>

              </div>
            </div>

            {/* 2.2 Dropdown Pilih Paket Durasi (Dropdown) */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs sm:text-sm font-bold text-brand-primary">
                Pilih Paket Durasi Rental (Dropdown) <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full h-12 px-4 rounded-xl border-2 border-brand-teal/40 bg-white font-bold text-xs sm:text-sm text-brand-primary focus:outline-none focus:border-brand-teal shadow-2xs cursor-pointer"
                >
                  <option value={3}>
                    Paket 3 Jam — Rp{getPackagePrice(3).toLocaleString('id-ID')} (Sudah Termasuk Driver &amp; Listrik)
                  </option>
                  <option value={5}>
                    Paket 5 Jam — Rp{getPackagePrice(5).toLocaleString('id-ID')} (Sudah Termasuk Driver &amp; Listrik)
                  </option>
                  <option value={8}>
                    Paket 8 Jam — Rp{getPackagePrice(8).toLocaleString('id-ID')} (Sudah Termasuk Driver &amp; Listrik)
                  </option>
                  <option value={12}>
                    Paket 12 Jam — Rp{getPackagePrice(12).toLocaleString('id-ID')} (Sudah Termasuk Driver &amp; Listrik)
                  </option>
                </select>
              </div>

              {/* Rincian Paket Terpilih */}
              <div className="mt-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Tarif Sewa Pokok ({durationHours} Jam - {vehicleModel}):</span>
                  <span className="text-lg font-extrabold text-brand-teal">
                    Rp{basePrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                  <span className="inline-flex items-center gap-1 text-brand-teal font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Termasuk Driver
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-brand-teal font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Termasuk Listrik
                  </span>
                </div>
              </div>
            </div>

            {/* Navigasi Tombol */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                &larr; Kembali ke Kota &amp; Jadwal
              </button>

              <button
                type="button"
                onClick={handleProceedFromStep2}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-bold text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Lanjutkan ke Titik Jemput &amp; Data Pemesan</span>
                <ChevronRight className="w-4 h-4 text-brand-lime" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAHAP 3: INFORMASI PEMESAN & PETA INTERAKTIF TITIK JEMPUT */}
        {/* ======================================================== */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LiveryStripe variant="slanted" />
                <span className="text-[11px] font-bold text-brand-teal uppercase tracking-wider font-mono">
                  Langkah 3 dari 4 · {city}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-brand-primary tracking-tight">
                INFORMASI PEMESAN &amp; PETA TITIK JEMPUT
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Isi data pemesan dan tentukan titik lokasi penjemputan di peta interaktif atau gunakan lokasi GPS Anda.
              </p>
            </div>

            {/* Form Data Pemesan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-primary">
                  Nama Lengkap Pemesan <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-brand-teal shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-primary">
                  Nomor WhatsApp / HP Aktif <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-brand-teal shadow-2xs font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Admin dan driver resmi akan menghubungi nomor ini untuk konfirmasi pesanan.
                </span>
              </div>
            </div>

            {/* PETA INTERAKTIF PENJEMPUTAN (Leaflet dengan Draggable Pin & GPS Location) */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs sm:text-sm font-bold text-brand-primary">
                Tentukan Titik Jemput di Peta &amp; Pilih Lokasi Saya <span className="text-rose-600">*</span>
              </label>

              <InteractivePickupMap
                city={(city as 'Surabaya' | 'Sidoarjo') || 'Surabaya'}
                currentAddress={pickupAddress}
                onLocationSelect={(loc) => {
                  setPickupAddress(loc.address);
                  setPickupCoords({ lat: loc.lat, lng: loc.lng });
                }}
              />
            </div>

            {/* Detail Alamat Tambahan / Catatan Patokan Rumah */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Alamat / Catatan Penjemputan Lengkap (Nomor Rumah, Patokan, Blok)
              </label>
              <textarea
                rows={2}
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Tuliskan nomor rumah, warna pagar, atau patokan agar driver mudah menemukan lokasi Anda..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-brand-teal shadow-2xs"
              />
            </div>

            {/* Catatan Perjalanan (Opsional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Catatan Rute / Keperluan Perjalanan (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Meeting kantor, penjemputan tamu delegasi, acara keluarga"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-teal shadow-2xs"
              />
            </div>

            {/* Navigasi Tombol */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                &larr; Kembali ke Armada &amp; Paket
              </button>

              <button
                type="button"
                onClick={handleProceedFromStep3}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-bold text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Tinjau Rincian Pemesanan</span>
                <ChevronRight className="w-4 h-4 text-brand-lime" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAHAP 4: RINCIAN PEMESANAN (SUMMARY) & LANGSUNG BAYAR    */}
        {/* ======================================================== */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LiveryStripe variant="slanted" />
                <span className="text-[11px] font-bold text-brand-teal uppercase tracking-wider font-mono">
                  Langkah 4 dari 4 · Rincian Pemesanan
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-brand-primary tracking-tight">
                RINCIAN PEMESANAN
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Periksa kembali ringkasan pesanan Anda. Klik tombol di bawah untuk langsung membuka kode QRIS resmi dan menyelesaikan pembayaran.
              </p>
            </div>

            {/* Kartu Rincian Lengkap */}
            <div className="rounded-2xl border border-brand-teal/25 bg-gradient-to-br from-brand-mint/40 via-white to-brand-mint/15 p-5 sm:p-6 space-y-4">
              
              {/* Header Kartu Rincian */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-brand-teal/30">
                    <img
                      src={vehicleModel === 'VinFast VF 5' 
                        ? '/src/assets/images/vinfast_vf5_1794185355445.jpg'
                        : '/src/assets/images/vinfast_vfe34_1794185371447.jpg'
                      }
                      alt={vehicleModel}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal block font-mono">
                      Armada Terpilih
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-brand-primary">
                      {vehicleModel}
                    </h3>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-500 block">Total Tagihan (Termasuk Kode Unik):</span>
                  <span className="text-2xl sm:text-3xl font-black text-brand-primary font-mono">
                    Rp{totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Data Detail Rincian Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Layanan:</span>
                    <span className="font-bold text-brand-primary">Rental Mobil Listrik (H-1)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Kota:</span>
                    <span className="font-bold text-brand-primary">{city}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Jadwal Perjalanan:</span>
                    <span className="font-bold text-brand-primary">{date} · Pukul {time} WIB</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Durasi Paket:</span>
                    <span className="font-bold text-brand-teal">Paket {durationHours} Jam</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Nama Pemesan:</span>
                    <span className="font-bold text-brand-primary">{customerName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">WhatsApp / HP:</span>
                    <span className="font-bold text-brand-primary font-mono">{customerPhone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Kapasitas Maksimal:</span>
                    <span className="font-bold text-brand-primary">Maks. 3 Penumpang</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Inklusi Layanan:</span>
                    <span className="font-bold text-emerald-700">Driver &amp; Listrik Termasuk</span>
                  </div>
                </div>
              </div>

              {/* Titik Jemput Box */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 text-brand-teal font-bold mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Titik Penjemputan:</span>
                </div>
                <p className="font-semibold text-slate-800 leading-relaxed">
                  {pickupAddress}
                </p>
                {pickupCoords && (
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    Koordinat GPS: {pickupCoords.lat.toFixed(6)}, {pickupCoords.lng.toFixed(6)}
                  </p>
                )}
                {notes && (
                  <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                    <strong>Catatan:</strong> {notes}
                  </div>
                )}
              </div>

              {/* Breakdown Biaya dengan Kode Unik (< Rp1.000) */}
              <div className="p-4 rounded-xl bg-white border-2 border-brand-teal/20 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Tarif Sewa Paket ({vehicleModel} {durationHours} Jam):</span>
                  <span className="font-bold text-slate-900">Rp{basePrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-brand-teal font-bold flex items-center gap-1">
                    <span>Kode Unik Verifikasi Transaksi:</span>
                  </span>
                  <span className="font-bold text-brand-teal font-mono">+Rp{uniqueCode}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-extrabold text-brand-primary">
                  <span>Total Tagihan Pembayaran:</span>
                  <span className="text-lg font-black text-brand-teal font-mono">
                    Rp{totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 pt-1">
                  * Kode unik (3 digit di bawah Rp1.000) digenerate secara acak untuk mempermudah admin memverifikasi pembayaran Anda.
                </p>
              </div>

            </div>

            {/* Tombol Aksi: Langsung Menuju Pembayaran Payment Gateway Xendit */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                &larr; Ubah Titik Jemput &amp; Data
              </button>

              <button
                type="button"
                onClick={handleDirectToQrisPayment}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-black text-sm sm:text-base shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-brand-lime" />
                    <span>Menyiapkan QRIS Resmi...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5 text-brand-lime" />
                    <span>Lanjutkan ke Pembayaran QRIS</span>
                    <ChevronRight className="w-5 h-5 text-brand-lime" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer Minimal */}
      <footer className="py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Surabaya EV Rent. Platform Resmi Rental &amp; Taksi Mobil Listrik VinFast.</p>
      </footer>

    </div>
  );
};
