import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Car,
  MapPin,
  User,
  Phone,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Info,
  Search,
  Crosshair,
  Map,
  X,
  Check,
  Lock,
  RotateCcw,
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

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export const RentalBookingPage: React.FC<RentalBookingPageProps> = ({
  pricingList,
  prefill,
  onBackHome,
  onOpenPaymentModal,
  onOpenTracker
}) => {
  // Wizard Steps: 1: Kota & Jadwal, 2: Armada & Paket, 3: Data Pemesan & Titik Jemput, 4: Rincian Pemesanan (Summary)
  const [step, setStep] = useState<number>(1);

  // Tahap 1: Kota & Jadwal (Strictly Surabaya & Sidoarjo tanpa embel-embel)
  const [city, setCity] = useState<string>(prefill?.city || '');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('08:00');

  // Tahap 2: Armada & Paket Durasi (Hanya VinFast VF e34)
  const [vehicleModel, setVehicleModel] = useState<string>('VinFast VF e34');
  const [durationHours, setDurationHours] = useState<number>(prefill?.hours || 3);
  const [isArmadaLocked, setIsArmadaLocked] = useState<boolean>(true);

  // Tahap 3: Informasi Pemesan & Alamat Penjemputan
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [notes, setNotes] = useState<string>('');

  // Autocomplete Suggestions Alamat Jemput
  const [pickupSuggestions, setPickupSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [showPickupDropdown, setShowPickupDropdown] = useState<boolean>(false);
  const [showPickupMap, setShowPickupMap] = useState<boolean>(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState<boolean>(false);

  const addressInputRef = useRef<HTMLDivElement>(null);

  // Kode Unik Acak (Tidak lebih dari Rp300, utamakan 100-200 rupiah)
  const [uniqueCode] = useState<number>(() =>
    Math.random() < 0.7 ? Math.floor(101 + Math.random() * 99) : Math.floor(201 + Math.random() * 98)
  );

  // State Pesanan & Pembayaran
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ketersediaan Real-Time
  const [availability, setAvailability] = useState<{ [model: string]: { available: number; total: number; booked: number } } | null>(null);

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

  // Cek ketersediaan dinamis saat kota atau tanggal berubah
  useEffect(() => {
    if (city && date) {
      api.getAvailability(city, date)
        .then((res: any) => {
          if (res?.inventory) setAvailability(res.inventory);
        })
        .catch(() => {});
    }
  }, [city, date]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addressInputRef.current && !addressInputRef.current.contains(e.target as Node)) {
        setShowPickupDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autocomplete debounced search for pickup address
  useEffect(() => {
    if (!pickupAddress || pickupAddress.trim().length < 3 || pickupCoords) {
      setPickupSuggestions([]);
      setShowPickupDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const effectiveCity = city || 'Surabaya';
        const q = encodeURIComponent(`${pickupAddress.trim()}, ${effectiveCity} Jawa Timur Indonesia`);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=4&countrycodes=id`,
          { headers: { 'Accept-Language': 'id' } }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setPickupSuggestions(data);
            setShowPickupDropdown(data.length > 0);
          }
        }
      } catch {
        // ignore network error
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [pickupAddress, city, pickupCoords]);

  // Handler "Pilih Lokasi Saya (GPS)" -> Baru memunculkan peta dan mengambil koordinat GPS
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
            }
          }
        } catch {
          setPickupAddress(`Lokasi Saya [${lat.toFixed(5)}, ${lng.toFixed(5)}]`);
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

  // Hitung tarif pokok sesuai armada, kota, dan durasi dari pricingList
  const calculateBasePrice = (): number => {
    if (!vehicleModel || !durationHours) return 0;
    const effectiveCity = city || 'Surabaya';
    const item = pricingList.find(
      p => p.vehicle_model === vehicleModel && p.duration_hours === durationHours && (p.city === effectiveCity || p.city === 'Surabaya')
    );
    if (item) return item.price;

    // Fallback baseline standard price (VinFast VF e34)
    const basePrices: Record<number, number> = {
      3: 290000,
      5: 460000,
      8: 740000,
      12: 1100000
    };
    return basePrices[durationHours] || 290000;
  };

  const getPackagePrice = (hours: number): number => {
    const effectiveCity = city || 'Surabaya';
    const item = pricingList.find(
      p => p.vehicle_model === vehicleModel && p.duration_hours === hours && (p.city === effectiveCity || p.city === 'Surabaya')
    );
    if (item) return item.price;
    const basePrices: Record<number, number> = {
      3: 290000,
      5: 460000,
      8: 740000,
      12: 1100000
    };
    return basePrices[hours] || 0;
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
      setErrorMsg('Nomor WhatsApp aktif wajib diisi.');
      return;
    }
    if (!pickupAddress.trim()) {
      setErrorMsg('Lokasi / alamat penjemputan lengkap wajib diisi.');
      return;
    }
    setStep(4);
  };

  // Submit Order & Buka Modal Pembayaran QRIS Resmi
  const handleConfirmAndPay = async () => {
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
        pickupAddress,
        notes: notes.trim() ? notes : undefined,
        uniqueCode,
        passengerCount: 1
      });

      onOpenPaymentModal(result.bookingNumber);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses pemesanan. Silakan periksa kembali data Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Fixed Header Nav */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
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
        {/* Progress Tracker / Step Indicator (1 s.d 4) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3.5 sm:p-4">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[
              { num: 1, label: 'Kota & Waktu' },
              { num: 2, label: 'Armada & Paket' },
              { num: 3, label: 'Data & Lokasi' },
              { num: 4, label: 'Rincian' }
            ].map((s, idx, arr) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                      step >= s.num
                        ? 'bg-brand-teal text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span className={`text-[10px] font-bold ${
                    step === s.num ? 'text-brand-primary' : 'text-slate-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {idx < arr.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 rounded-full mb-4 ${
                      step > s.num ? 'bg-brand-teal' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

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
        {/* TAHAP 1: PEMILIHAN KOTA & JADWAL TANGGAL/JAM (H-1)       */}
        {/* ======================================================== */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <LiveryStripe variant="compact" />
                <div>
                  <h1 className="text-base sm:text-lg font-black text-brand-primary tracking-tight">
                    Pilih Kota &amp; Jadwal Rental
                  </h1>
                  <p className="text-[11px] text-slate-500">
                    Layanan resmi pemesanan rental mobil listrik minimal H-1
                  </p>
                </div>
              </div>
            </div>

            {/* Pilihan Wilayah: Dropdown Surabaya atau Sidoarjo */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-bold text-brand-primary">
                Pilih Wilayah Layanan <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-brand-teal absolute left-3.5 top-3.5 pointer-events-none" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border-2 border-brand-teal/40 bg-white font-bold text-xs sm:text-sm text-brand-primary focus:outline-none focus:border-brand-teal shadow-2xs cursor-pointer"
                >
                  <option value="">-- Pilih Wilayah Pemesanan (Surabaya / Sidoarjo) --</option>
                  <option value="Surabaya">Surabaya</option>
                  <option value="Sidoarjo">Sidoarjo</option>
                </select>
              </div>
              {!city && (
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-block font-medium">
                  Pilih wilayah di dropdown terlebih dahulu untuk mengaktifkan jadwal dan tombol lanjut.
                </span>
              )}
            </div>

            {/* Tanggal & Jam (Tidak berfungsi / Disabled jika wilayah belum dipilih) */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 transition-opacity ${
              !city ? 'opacity-40 pointer-events-none' : 'opacity-100'
            }`}>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-primary">
                  Tanggal Sewa (Minimal H-1) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="date"
                    required
                    disabled={!city}
                    min={tomorrowStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-brand-teal shadow-2xs font-semibold disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-primary">
                  Jam Mulai Penjemputan <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="time"
                    required
                    disabled={!city}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-brand-teal shadow-2xs font-mono font-bold disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Tombol Lanjut ke Step 2 (Tidak berfungsi / Disabled jika wilayah belum dipilih) */}
            <div className="pt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBackHome}
                className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                &larr; Beranda
              </button>

              <button
                type="button"
                onClick={handleProceedFromStep1}
                disabled={!city}
                className={`flex-1 sm:flex-initial px-6 py-3.5 rounded-xl font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 ${
                  !city
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-50'
                    : 'bg-brand-teal hover:bg-brand-teal-hover text-white cursor-pointer'
                }`}
              >
                <span>Lanjut Pilih Armada &amp; Paket</span>
                <ChevronRight className="w-4 h-4 text-brand-lime" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAHAP 2: ARMADA (TERKUNCI / MATI AGAR TIDAK SALAH) & DURASI */}
        {/* ======================================================== */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <LiveryStripe variant="compact" />
                <div>
                  <h1 className="text-base sm:text-lg font-black text-brand-primary tracking-tight">
                    Pilih Armada &amp; Paket Durasi
                  </h1>
                  <p className="text-[11px] text-slate-500">
                    Pilih tipe mobil listrik VinFast yang Anda inginkan
                  </p>
                </div>
              </div>
            </div>

            {/* Armada Resmi: VinFast VF e34 */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-bold text-brand-primary">
                Armada Kendaraan Listrik Resmi <span className="text-rose-600">*</span>
              </label>

              <div className="grid grid-cols-1 gap-3">
                {/* Armada Tunggal: VinFast VF e34 */}
                <button
                  type="button"
                  onClick={() => setVehicleModel('VinFast VF e34')}
                  className="relative p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex gap-3.5 items-center border-brand-teal bg-gradient-to-br from-brand-mint/60 via-white to-brand-mint/20 ring-2 ring-brand-teal/40 shadow-sm opacity-100"
                >
                  <div className="w-24 h-18 sm:w-28 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-brand-teal/40 bg-slate-900 relative">
                    <img
                      src="/src/assets/images/vinfast_vfe34_1794185371447.jpg"
                      alt="VinFast VF e34"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded font-mono bg-brand-primary/90 text-brand-lime">
                      VF e34
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-brand-teal">
                        Spacious Mid-SUV
                      </span>
                      <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded">
                        Dipilih
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-brand-primary truncate mt-0.5">
                      VinFast VF e34
                    </h3>
                    <p className="text-[11px] mt-0.5 text-slate-500 line-clamp-1">
                      Maks. 3 Penumpang · Include Driver &amp; Listrik
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] font-extrabold text-brand-teal">
                      <span>Mulai Rp290.000 (3 Jam)</span>
                      {availability && (
                        <span className={`font-mono font-bold text-[10px] ${
                          (availability['VinFast VF e34']?.available ?? 0) > 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          · {(availability['VinFast VF e34']?.available ?? 0) > 0 ? `${availability['VinFast VF e34'].available} Unit Siaga` : 'Penuh'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-6 h-6 rounded-full border-2 border-brand-teal bg-brand-teal text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </button>
              </div>
            </div>

            {/* Dropdown Pilih Paket Durasi */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs sm:text-sm font-bold text-brand-primary">
                Pilih Paket Durasi Rental <span className="text-rose-600">*</span>
              </label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white font-bold text-xs sm:text-sm text-brand-primary focus:outline-none focus:border-brand-teal shadow-2xs cursor-pointer"
              >
                <option value={3}>
                  Paket 3 Jam — Rp{getPackagePrice(3).toLocaleString('id-ID')} (Termasuk Driver &amp; Listrik)
                </option>
                <option value={5}>
                  Paket 5 Jam — Rp{getPackagePrice(5).toLocaleString('id-ID')} (Termasuk Driver &amp; Listrik)
                </option>
                <option value={8}>
                  Paket 8 Jam — Rp{getPackagePrice(8).toLocaleString('id-ID')} (Termasuk Driver &amp; Listrik)
                </option>
                <option value={12}>
                  Paket 12 Jam — Rp{getPackagePrice(12).toLocaleString('id-ID')} (Termasuk Driver &amp; Listrik)
                </option>
              </select>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Tarif Sewa Pokok:</span>
                  <span className="text-base font-extrabold text-brand-teal font-mono">
                    Rp{basePrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 font-semibold flex items-center gap-2">
                  <span className="text-brand-teal">✓ Driver</span>
                  <span>·</span>
                  <span className="text-brand-teal">✓ Listrik</span>
                </div>
              </div>
            </div>

            {/* Tombol Lanjut */}
            <div className="pt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                &larr; Ubah Kota &amp; Waktu
              </button>

              <button
                type="button"
                onClick={handleProceedFromStep2}
                className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-bold text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Lanjut Isi Data &amp; Lokasi</span>
                <ChevronRight className="w-4 h-4 text-brand-lime" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAHAP 3: INFORMASI PEMESAN, ALAMAT & MAP TOGGLE           */}
        {/* ======================================================== */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <LiveryStripe variant="compact" />
                <div>
                  <h1 className="text-base sm:text-lg font-black text-brand-primary tracking-tight">
                    Data Pemesan &amp; Titik Penjemputan
                  </h1>
                  <p className="text-[11px] text-slate-500">
                    Isi data diri dan alamat penjemputan Anda di {city}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Data Pemesan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-primary">
                  Nama Lengkap Pemesan <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-brand-teal shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-primary">
                  Nomor WhatsApp Aktif <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-brand-teal shadow-2xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Input Alamat dengan Live Autocomplete Suggestions */}
            <div className="space-y-1.5" ref={addressInputRef}>
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-brand-primary flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-brand-teal" />
                  <span>Alamat Lengkap Penjemputan</span>
                  <span className="text-rose-600">*</span>
                </label>

                {/* Tombol Pilih Lokasi Saya (GPS) */}
                <button
                  type="button"
                  onClick={handleGetLiveLocation}
                  disabled={isLocatingGPS}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-brand-teal bg-brand-mint border border-brand-teal/25 hover:bg-brand-teal hover:text-white transition-all cursor-pointer shadow-2xs"
                >
                  {isLocatingGPS ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-teal" />
                  ) : (
                    <Crosshair className="w-3.5 h-3.5" />
                  )}
                  <span>{isLocatingGPS ? 'Mencari...' : 'Pilih Lokasi Saya (GPS)'}</span>
                </button>
              </div>

              {/* Input Teks Alamat */}
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ketik alamat penjemputan, jalan, perumahan, atau gedung..."
                  value={pickupAddress}
                  onChange={(e) => {
                    setPickupAddress(e.target.value);
                    setPickupCoords(null);
                  }}
                  onFocus={() => {
                    if (pickupSuggestions.length > 0) setShowPickupDropdown(true);
                  }}
                  className="w-full h-11 pl-9 pr-24 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-brand-teal shadow-2xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />

                {/* Tombol Toggle Peta */}
                <button
                  type="button"
                  onClick={() => setShowPickupMap(!showPickupMap)}
                  className="absolute right-2 top-2 h-7 px-2.5 rounded-lg text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Map className="w-3 h-3 text-brand-teal" />
                  <span>{showPickupMap ? 'Tutup Peta' : 'Peta'}</span>
                </button>

                {isLoadingSuggestions && (
                  <Loader2 className="w-4 h-4 animate-spin text-brand-teal absolute right-20 top-3.5" />
                )}

                {/* Suggestions Dropdown */}
                {showPickupDropdown && pickupSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-12 z-50 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
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
                      <span>Peta Titik Jemput (Geser pin jika perlu disesuaikan)</span>
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
                    city={(city as 'Surabaya' | 'Sidoarjo') || 'Surabaya'}
                    currentAddress={pickupAddress}
                    selectedCoords={pickupCoords}
                    onLocationSelect={(loc) => {
                      setPickupAddress(loc.address);
                      setPickupCoords({ lat: loc.lat, lng: loc.lng });
                    }}
                  />
                </div>
              )}
            </div>

            {/* Keterangan (Opsional) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Keterangan (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Titik jemput di lobi gedung, pagar hitam depan minimarket, atau keperluan dinas..."
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-teal shadow-2xs"
              />
            </div>

            {/* Navigasi Tombol */}
            <div className="pt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                &larr; Ubah Armada &amp; Paket
              </button>

              <button
                type="button"
                onClick={handleProceedFromStep3}
                className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-bold text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Tinjau Rincian Pemesanan</span>
                <ChevronRight className="w-4 h-4 text-brand-lime" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAHAP 4: RINCIAN PEMESANAN (SUMMARY) & TABEL INCLUDE/EXCLUDE */}
        {/* ======================================================== */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <LiveryStripe variant="compact" />
                <div>
                  <h1 className="text-base sm:text-lg font-black text-brand-primary tracking-tight">
                    Rincian Pemesanan Rental Mobil Listrik
                  </h1>
                  <p className="text-[11px] text-slate-500">
                    Periksa kembali rincian pemesanan Anda sebelum lanjut ke pembayaran QRIS resmi
                  </p>
                </div>
              </div>
            </div>

            {/* Kartu Rincian Ringkas */}
            <div className="rounded-xl border border-brand-teal/20 bg-brand-mint/20 p-4 space-y-3">
              
              {/* Header Armada Terpilih */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-brand-teal/30">
                    <img
                      src="/src/assets/images/vinfast_vfe34_1794185371447.jpg"
                      alt={vehicleModel}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal block font-mono">
                      Armada Terpilih ({city})
                    </span>
                    <h3 className="text-base font-black text-brand-primary">
                      {vehicleModel} · Paket {durationHours} Jam
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Total Tagihan:</span>
                  <div className="text-lg sm:text-xl font-black text-brand-teal font-mono">
                    Rp{totalAmount.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* Rincian Jadwal & Pemesan */}
              <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Kota Layanan:</span>
                  <strong className="text-brand-primary">{city}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Jadwal Perjalanan:</span>
                  <strong className="text-brand-primary">{date} · Pukul {time} WIB</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Nama Pemesan:</span>
                  <strong className="text-brand-primary">{customerName} ({customerPhone})</strong>
                </div>
                <div className="py-1 border-b border-slate-100">
                  <span className="text-slate-500 block">Titik Penjemputan:</span>
                  <p className="font-semibold text-slate-800 leading-snug mt-0.5">{pickupAddress}</p>
                </div>
                {notes && (
                  <div className="py-1 border-b border-slate-100">
                    <span className="text-slate-500 block">Keterangan:</span>
                    <p className="font-medium text-slate-700 mt-0.5">{notes}</p>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Tarif Sewa Pokok ({durationHours} Jam):</span>
                  <span className="font-bold text-slate-900 font-mono">Rp{basePrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-brand-teal font-bold">
                  <span>Kode Unik Verifikasi Transaksi:</span>
                  <span className="font-mono">+Rp{uniqueCode}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-extrabold text-brand-primary">
                  <span>Total yang Harus Ditransfer:</span>
                  <span className="text-base font-black text-brand-teal font-mono">
                    Rp{totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* TABEL INKLUSI LAYANAN: INCLUDE & EXCLUDE (MERAH UNTUK TOL & PARKIR) */}
              <div className="rounded-xl border border-slate-200 overflow-hidden text-xs bg-white shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                  
                  {/* Kolom 1: INCLUDE (TERMASUK) */}
                  <div className="p-3.5 space-y-2 bg-emerald-50/50">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-black text-emerald-800 uppercase tracking-wide">
                        Termasuk dalam Paket (Include):
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-slate-700 text-[11px]">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span><strong>Unit Mobil Listrik {vehicleModel}</strong> (Baterai 100%, bersih, sejuk ber-AC)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span><strong>Jasa Driver Profesional</strong> resmi Surabaya EV Rent</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span><strong>Konsumsi &amp; Pengisian Daya Listrik</strong> selama pemakaian sewa</span>
                      </li>
                    </ul>
                  </div>

                  {/* Kolom 2: EXCLUDE (TIDAK TERMASUK - MERAH) */}
                  <div className="p-3.5 space-y-2 bg-rose-50/50">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-rose-200">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span className="font-black text-rose-700 uppercase tracking-wide">
                        Tidak Termasuk (Exclude):
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-rose-900 text-[11px]">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <span><strong>Biaya Tarif Jalan Tol</strong> (dibayar mandiri oleh penyewa jika rute lewat tol)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <span><strong>Biaya Retribusi Parkir</strong> di gedung / bandara / tempat singgah</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <span><strong>Tiket Masuk Destinasi</strong> wisata atau keperluan pribadi lainnya</span>
                      </li>
                    </ul>
                  </div>

                </div>
              </div>

            </div>

            {/* Tombol Lanjut ke QRIS */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                &larr; Ubah Data Pemesan
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
