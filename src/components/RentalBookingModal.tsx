import React, { useState, useEffect } from 'react';
import { X, MapPin, Check, AlertCircle, ArrowRight, ArrowLeft, Loader2, Zap } from 'lucide-react';
import { api } from '../lib/api';
import { AvailabilitySummary, RentalPricingItem } from '../types';

interface RentalBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pricingList: RentalPricingItem[];
  prefill?: { model?: string; hours?: number };
  onSuccessBooking: (bookingNumber: string) => void;
}

export const RentalBookingModal: React.FC<RentalBookingModalProps> = ({
  isOpen,
  onClose,
  pricingList,
  prefill,
  onSuccessBooking
}) => {
  // Wizard Steps (1-4)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form States
  const [city, setCity] = useState<'Surabaya' | 'Sidoarjo' | 'Malang'>('Surabaya');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('08:00');
  const [vehicleModel, setVehicleModel] = useState<'VinFast VF 5' | 'VinFast VF e34'>('VinFast VF 5');
  const [durationHours, setDurationHours] = useState<number>(3);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [dropoffAddress, setDropoffAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Availability State
  const [availability, setAvailability] = useState<AvailabilitySummary | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState<boolean>(false);
  const [availError, setAvailError] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Lock body scroll when modal is open
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

  // Set default min date (H+1)
  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (isOpen) {
      const minD = getMinDate();
      if (!date || date < minD) {
        setDate(minD);
      }
      if (prefill?.model && (prefill.model === 'VinFast VF 5' || prefill.model === 'VinFast VF e34')) {
        setVehicleModel(prefill.model as any);
      }
      if (prefill?.hours) {
        setDurationHours(prefill.hours);
      }
      setStep(1);
      setSubmitError(null);
    }
  }, [isOpen, prefill]);

  // Cek ketersediaan dinamis saat kota atau tanggal berubah
  useEffect(() => {
    if (isOpen && city && date) {
      checkInventory();
    }
  }, [city, date, isOpen]);

  const checkInventory = async () => {
    setLoadingAvailability(true);
    setAvailError(null);
    try {
      const data = await api.getAvailability(city, date);
      setAvailability(data);
    } catch (err: any) {
      setAvailError(err.message || 'Gagal memuat ketersediaan.');
    } finally {
      setLoadingAvailability(false);
    }
  };

  if (!isOpen) return null;

  // Temukan item harga
  const currentPricing = pricingList.find(
    p => p.vehicle_model === vehicleModel && p.city === city && p.duration_hours === durationHours
  ) || {
    price: vehicleModel === 'VinFast VF 5' ? (durationHours === 3 ? 240000 : durationHours === 5 ? 390000 : durationHours === 8 ? 620000 : 930000) : (durationHours === 3 ? 290000 : durationHours === 5 ? 460000 : durationHours === 8 ? 740000 : 1100000),
    km_limit: durationHours === 3 ? 45 : durationHours === 5 ? 75 : durationHours === 8 ? 120 : 180
  };

  const currentAvailableUnits = availability?.inventory?.[vehicleModel]?.available ?? 0;
  const isSelectedSoldOut = availability !== null && currentAvailableUnits <= 0;

  // Handler Submit Booking
  const handleCreateBooking = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await api.createRentalBooking({
        city,
        date,
        time,
        vehicleModel,
        durationHours,
        customerName,
        customerPhone,
        passengerCount,
        pickupAddress,
        dropoffAddress,
        notes
      });

      onClose();
      onSuccessBooking(res.bookingNumber);
    } catch (err: any) {
      setSubmitError(err.message || 'Terjadi kesalahan saat memproses booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    'Wilayah & Jadwal',
    'Kendaraan & Paket',
    'Data Pemesan',
    'Konfirmasi Booking'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-teal">
              Pemesanan Resmi (H-1)
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Form Booking Rental Mobil Listrik
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Tutup form booking"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator (Fully Responsive) */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50/50 border-b border-slate-100 shrink-0">
          {/* Mobile Step Header (<640px) */}
          <div className="flex sm:hidden items-center justify-between text-xs">
            <span className="font-bold text-brand-teal">
              Langkah {step} dari 4: <span className="text-slate-700">{stepTitles[step - 1]}</span>
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(s => (
                <div
                  key={s}
                  className={`h-1.5 w-6 rounded-full transition-all ${
                    step >= s ? 'bg-brand-teal' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Desktop/Tablet Step Header (>=640px) */}
          <div className="hidden sm:flex items-center justify-between text-xs text-slate-500">
            {stepTitles.map((t, idx) => (
              <React.Fragment key={idx}>
                <span className={`font-semibold ${step === idx + 1 ? 'text-brand-teal' : step > idx + 1 ? 'text-slate-800' : 'text-slate-400'}`}>
                  {idx + 1}. {t}
                </span>
                {idx < 3 && <span className="text-slate-300">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content Scroll Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">

          {/* TAHAP 1: PILIH WILAYAH, TANGGAL & JAM */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Pilih Wilayah */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                  Tahap 1 — Pilih Wilayah Layanan
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {(['Surabaya', 'Sidoarjo', 'Malang'] as const).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCity(c)}
                      className={`p-2.5 sm:p-3 text-center sm:text-left rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[56px] flex flex-col justify-center items-center sm:items-start ${
                        city === c
                          ? 'border-brand-teal bg-brand-mint text-brand-primary shadow-xs ring-1 ring-brand-teal'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <MapPin className={`w-4 h-4 mb-1 ${city === c ? 'text-brand-teal' : 'text-slate-400'}`} />
                      <span>{c}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pilih Tanggal & Waktu Penjemputan */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                  Tahap 2 — Pilih Tanggal (Minimal H-1)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Tanggal Perjalanan</label>
                    <input
                      type="date"
                      min={getMinDate()}
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal font-semibold text-slate-900 bg-white min-h-[44px]"
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block">
                      Hari ini &amp; masa lampau tidak dapat dipilih.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Jam Mulai Penjemputan</label>
                    <input
                      type="time"
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal font-semibold text-slate-900 bg-white min-h-[44px]"
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block">
                      Driver siap di lokasi tepat waktu.
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Pengecekan Ketersediaan Real-Time */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800">
                    Ketersediaan Armada ({date} di {city}):
                  </span>
                  {loadingAvailability && (
                    <span className="flex items-center gap-1 text-brand-teal font-semibold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memeriksa...
                    </span>
                  )}
                </div>

                {availError ? (
                  <p className="text-amber-700">{availError}</p>
                ) : availability ? (
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div className="p-2 sm:p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-500 block text-[10px] sm:text-xs">VinFast VF 5</span>
                      <strong className={`text-xs sm:text-sm font-bold ${availability.inventory['VinFast VF 5']?.available > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {availability.inventory['VinFast VF 5']?.available || 0} unit tersedia
                      </strong>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-500 block text-[10px] sm:text-xs">VinFast VF e34</span>
                      <strong className={`text-xs sm:text-sm font-bold ${availability.inventory['VinFast VF e34']?.available > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {availability.inventory['VinFast VF e34']?.available || 0} unit tersedia
                      </strong>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* TAHAP 2: PILIH KENDARAAN & PAKET */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Pilih Kendaraan */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                  Tahap 3 — Pilih Model Kendaraan Listrik
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['VinFast VF 5', 'VinFast VF e34'] as const).map(model => {
                    const unitsLeft = availability?.inventory?.[model]?.available ?? 0;
                    const isSoldOut = unitsLeft <= 0;
                    return (
                      <button
                        key={model}
                        type="button"
                        disabled={isSoldOut}
                        onClick={() => setVehicleModel(model)}
                        className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all relative cursor-pointer min-h-[80px] ${
                          isSoldOut
                            ? 'opacity-50 border-slate-200 bg-slate-100 cursor-not-allowed'
                            : vehicleModel === model
                            ? 'border-brand-teal bg-brand-mint text-brand-primary shadow-xs ring-1 ring-brand-teal'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-brand-teal uppercase">
                              {model === 'VinFast VF 5' ? 'Compact Crossover' : 'Spacious SUV'}
                            </span>
                            <h4 className="font-bold text-sm sm:text-base text-slate-900 mt-0.5">{model}</h4>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              Maks. 3 Penumpang · Include Driver
                            </span>
                          </div>
                          {vehicleModel === model && !isSoldOut && (
                            <div className="w-5 h-5 rounded-full bg-brand-teal text-white flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                          <span className="text-slate-500 text-[11px]">Ketersediaan DB:</span>
                          <span className={`font-bold ${unitsLeft > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {unitsLeft > 0 ? `${unitsLeft} unit tersedia` : 'Habis Terpesan'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {isSelectedSoldOut && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>
                      Maaf, seluruh unit model ini sudah dipesan pada tanggal {date}. Silakan pilih model lain atau tanggal lainnya.
                    </span>
                  </div>
                )}
              </div>

              {/* Pilih Paket Durasi */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                  Tahap 4 — Pilih Paket Durasi &amp; Batas Jarak
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {[3, 5, 8, 12].map(hrs => {
                    const pkgPrice = pricingList.find(
                      p => p.vehicle_model === vehicleModel && p.duration_hours === hrs
                    )?.price || (vehicleModel === 'VinFast VF 5' ? (hrs === 3 ? 240000 : hrs === 5 ? 390000 : hrs === 8 ? 620000 : 930000) : (hrs === 3 ? 290000 : hrs === 5 ? 460000 : hrs === 8 ? 740000 : 1100000));
                    
                    const kmLimit = hrs === 3 ? 45 : hrs === 5 ? 75 : hrs === 8 ? 120 : 180;

                    return (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => setDurationHours(hrs)}
                        className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer min-h-[64px] flex flex-col justify-center ${
                          durationHours === hrs
                            ? 'border-brand-teal bg-brand-mint text-brand-primary shadow-xs ring-1 ring-brand-teal'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-sm sm:text-base font-bold text-slate-900">{hrs} Jam</div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500">Maks. {kmLimit} km</div>
                        <div className="mt-1 text-xs font-bold text-brand-teal">
                          Rp{pkgPrice.toLocaleString('id-ID')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAHAP 3: INFORMASI PELANGGAN & PENJEMPUTAN */}
          {step === 3 && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Tahap 5 — Informasi Pelanggan &amp; Rute
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs text-slate-700 mb-1 font-semibold">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Hendra Kusuma"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal text-slate-900 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-700 mb-1 font-semibold">Nomor WhatsApp Aktif *</label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal text-slate-900 min-h-[44px]"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Untuk koordinasi penjemputan driver &amp; bukti booking.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs text-slate-700 mb-1 font-semibold">Jumlah Penumpang (Maks. 3)</label>
                  <select
                    value={passengerCount}
                    onChange={e => setPassengerCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal text-slate-900 bg-white min-h-[44px]"
                  >
                    <option value={1}>1 Orang Penumpang</option>
                    <option value={2}>2 Orang Penumpang</option>
                    <option value={3}>3 Orang Penumpang (Maksimal)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-700 mb-1 font-semibold">Perkiraan Tujuan / Rute</label>
                  <input
                    type="text"
                    placeholder="Contoh: Area Bisnis Surabaya & Bandara"
                    value={dropoffAddress}
                    onChange={e => setDropoffAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal text-slate-900 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-700 mb-1 font-semibold">Lokasi Penjemputan Lengkap *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Nama hotel, alamat kantor, perumahan, atau titik jemput spesifik..."
                  value={pickupAddress}
                  onChange={e => setPickupAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal text-slate-900 min-h-[64px]"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 mb-1 font-semibold">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Misal: Mohon driver tepat waktu pukul 08.00 pagi"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal text-slate-900 min-h-[44px]"
                />
              </div>
            </div>
          )}

          {/* TAHAP 4: RINCIAN PEMESANAN & PEMBAYARAN */}
          {step === 4 && (
            <div className="space-y-4 sm:space-y-5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Tahap 6 — Rincian Pemesanan &amp; Verifikasi
              </label>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5 space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Layanan:</span>
                  <span className="font-bold text-slate-900">Rental Mobil Listrik · {city}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Jadwal:</span>
                  <span className="font-bold text-slate-900">{date} pukul {time} WIB</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Armada:</span>
                  <span className="font-bold text-slate-900">{vehicleModel}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Paket:</span>
                  <span className="font-bold text-slate-900">
                    {durationHours} Jam (Batas {currentPricing.km_limit} km)
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Pemesan:</span>
                  <span className="font-bold text-slate-900">{customerName} ({customerPhone})</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Titik Jemput:</span>
                  <span className="font-medium text-slate-900 text-right max-w-xs truncate">{pickupAddress}</span>
                </div>
                
                <div className="pt-2 flex justify-between items-center text-sm sm:text-base">
                  <span className="font-bold text-slate-900">Total Tarif Rental:</span>
                  <span className="font-black text-brand-teal text-lg sm:text-xl">
                    Rp{currentPricing.price.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Info Penting Pembayaran & Perlindungan Unit */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-brand-mint border border-brand-teal/20 text-xs text-brand-primary space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-brand-primary">
                  <Zap className="w-4 h-4 text-brand-teal shrink-0" />
                  <span>Kunci Unit &amp; Pembayaran Digital ArtoPay:</span>
                </div>
                <p>
                  Unit kendaraan akan dikunci selama <strong>15 menit</strong> di database untuk menyelesaikan pembayaran.
                </p>
                <p className="text-slate-600 text-[11px]">
                  Plat nomor &amp; kontak driver akan dibuka H-1 malam setelah konfirmasi kesiapan driver.
                </p>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 gap-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="inline-flex items-center gap-1 px-3.5 sm:px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer min-h-[44px]"
            >
              Batal
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              disabled={
                (step === 1 && (!date || loadingAvailability)) ||
                (step === 2 && isSelectedSoldOut) ||
                (step === 3 && (!customerName || !customerPhone || !pickupAddress))
              }
              onClick={() => setStep((step + 1) as any)}
              className="inline-flex items-center gap-1.5 px-5 sm:px-6 py-2.5 text-xs font-bold text-white bg-brand-teal hover:bg-brand-teal-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs cursor-pointer min-h-[44px]"
            >
              <span>Lanjutkan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCreateBooking}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 text-xs font-bold text-white bg-brand-teal hover:bg-brand-teal-hover disabled:opacity-60 rounded-xl shadow-xs cursor-pointer min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Mengunci Unit...</span>
                </>
              ) : (
                <>
                  <span>Kunci Unit &amp; Bayar</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
