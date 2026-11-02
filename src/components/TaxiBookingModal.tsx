import React, { useState, useEffect } from 'react';
import { X, Navigation, Calculator, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

interface TaxiBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessBooking: (bookingNumber: string) => void;
}

// Data Lokasi Populer di Jawa Timur untuk kemudahan pemilihan cepat
const POPULAR_LOCATIONS: Record<string, { name: string; lat: number; lng: number; address: string }[]> = {
  Surabaya: [
    { name: 'Bandara Juanda (T1/T2)', lat: -7.3798, lng: 112.7875, address: 'Bandara Juanda, Sedati, Sidoarjo/Surabaya' },
    { name: 'Tunjungan Plaza (Pusat)', lat: -7.2618, lng: 112.7388, address: 'Jl. Jenderal Basuki Rachmat No.8-12, Surabaya' },
    { name: 'Stasiun Surabaya Gubeng', lat: -7.2655, lng: 112.7523, address: 'Jl. Gubeng Masjid No.1, Surabaya' },
    { name: 'Pakuwon Mall (Barat)', lat: -7.2894, lng: 112.6756, address: 'Jl. Mayjend Jonosewojo No.2, Babatan, Surabaya' },
  ],
  Sidoarjo: [
    { name: 'Alun-Alun Sidoarjo', lat: -7.4478, lng: 112.7183, address: 'Jl. Achmad Yani, Sidokumpul, Sidoarjo' },
    { name: 'Terminal Purabaya (Bungurasih)', lat: -7.3524, lng: 112.7247, address: 'Bungurasih, Waru, Sidoarjo' },
    { name: 'Suncity Mall Sidoarjo', lat: -7.4542, lng: 112.7121, address: 'Jl. Pahlawan No.1, Sidokumpul, Sidoarjo' },
  ],
  Malang: [
    { name: 'Stasiun Malang Kota Baru', lat: -7.9775, lng: 112.6372, address: 'Jl. Trunojoyo No.10, Klojen, Malang' },
    { name: 'Alun-Alun Kota Batu', lat: -7.8712, lng: 112.5268, address: 'Jl. Agus Salim, Sisir, Kota Batu' },
    { name: 'Universitas Brawijaya (UB)', lat: -7.9525, lng: 112.6144, address: 'Jl. Veteran, Ketawanggede, Malang' },
  ]
};

export const TaxiBookingModal: React.FC<TaxiBookingModalProps> = ({
  isOpen,
  onClose,
  onSuccessBooking
}) => {
  const [city, setCity] = useState<'Surabaya' | 'Sidoarjo' | 'Malang'>('Surabaya');
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [dropoffAddress, setDropoffAddress] = useState<string>('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number>(12);
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('Sekarang');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const baseRatePerKm = 7000;
  const minFare = 25000;
  const estimatedFare = Math.max(minFare, Math.ceil(distanceKm * baseRatePerKm));

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

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setBookingDate(today);
      setErrorMsg(null);
      if (!pickupAddress && POPULAR_LOCATIONS[city][0]) {
        const p1 = POPULAR_LOCATIONS[city][0];
        const p2 = POPULAR_LOCATIONS[city][1];
        setPickupAddress(p1.address);
        setPickupCoords({ lat: p1.lat, lng: p1.lng });
        setDropoffAddress(p2.address);
        setDropoffCoords({ lat: p2.lat, lng: p2.lng });
        calcDistance(p1.lat, p1.lng, p2.lat, p2.lng);
      }
    }
  }, [isOpen, city]);

  const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const rawDist = R * c;
    const roadDist = Math.max(2, Math.round(rawDist * 1.35 * 10) / 10);
    setDistanceKm(roadDist);
  };

  const handleSelectPopularPickup = (loc: any) => {
    setPickupAddress(loc.address);
    setPickupCoords({ lat: loc.lat, lng: loc.lng });
    if (dropoffCoords) {
      calcDistance(loc.lat, loc.lng, dropoffCoords.lat, dropoffCoords.lng);
    }
  };

  const handleSelectPopularDropoff = (loc: any) => {
    setDropoffAddress(loc.address);
    setDropoffCoords({ lat: loc.lat, lng: loc.lng });
    if (pickupCoords) {
      calcDistance(pickupCoords.lat, pickupCoords.lng, loc.lat, loc.lng);
    }
  };

  const handleSubmitTaxi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupAddress || !dropoffAddress || !customerName || !customerPhone) {
      setErrorMsg('Mohon lengkapi semua kolom wajib.');
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
      setErrorMsg(err.message || 'Gagal memproses pemesanan taksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-teal">
              Tarif Resmi Rp7.000 / km
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Pemesanan Taksi Mobil Listrik
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Tutup form pemesanan taksi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitTaxi} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
          
          {/* Pilih Wilayah */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Wilayah Layanan Taksi
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Surabaya', 'Sidoarjo', 'Malang'] as const).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCity(c)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer min-h-[44px] flex items-center justify-center ${
                    city === c
                      ? 'border-brand-teal bg-brand-mint text-brand-primary ring-1 ring-brand-teal'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Rute Penjemputan & Tujuan */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lokasi Penjemputan *
              </label>
              <input
                type="text"
                required
                placeholder="Alamat atau nama gedung penjemputan..."
                value={pickupAddress}
                onChange={e => setPickupAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal text-slate-900 min-h-[44px]"
              />
              {/* Quick Pick Penjemputan */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400 py-1 font-semibold">Pilih Cepat:</span>
                {POPULAR_LOCATIONS[city].map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPopularPickup(loc)}
                    className="text-[10px] sm:text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-mint hover:text-brand-teal text-slate-700 border border-slate-200 transition-colors font-medium min-h-[28px] flex items-center"
                  >
                    {loc.name.split('(')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lokasi Tujuan *
              </label>
              <input
                type="text"
                required
                placeholder="Alamat atau nama lokasi tujuan..."
                value={dropoffAddress}
                onChange={e => setDropoffAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal text-slate-900 min-h-[44px]"
              />
              {/* Quick Pick Tujuan */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400 py-1 font-semibold">Pilih Cepat:</span>
                {POPULAR_LOCATIONS[city].map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPopularDropoff(loc)}
                    className="text-[10px] sm:text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-mint hover:text-brand-teal text-slate-700 border border-slate-200 transition-colors font-medium min-h-[28px] flex items-center"
                  >
                    {loc.name.split('(')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Kalkulator Jarak & Estimasi Tarif */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex flex-wrap items-center justify-between pb-2.5 border-b border-slate-200 gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Calculator className="w-4 h-4 text-brand-teal" />
                <span>Kalkulasi Jarak &amp; Tarif</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-slate-500">Sesuaikan Jarak:</label>
                <input
                  type="number"
                  min={1}
                  max={250}
                  step={0.5}
                  value={distanceKm}
                  onChange={e => setDistanceKm(Math.max(1, Number(e.target.value)))}
                  className="w-16 sm:w-20 px-2 py-1 text-xs font-bold text-center rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-xs font-bold text-slate-600">km</span>
              </div>
            </div>

            <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] sm:text-[11px] text-slate-500 block">Estimasi Tarif Transparan ({distanceKm} km x Rp7.000)</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  Rp{estimatedFare.toLocaleString('id-ID')}
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-500">
                Tarif min. Rp25.000 · Sudah termasuk armada &amp; driver
              </span>
            </div>
          </div>

          {/* Jadwal Perjalanan & Penumpang */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                <option value="Jadwalkan Besok Pagi (06:00)">Besok Pagi (06:00)</option>
                <option value="Jadwalkan Besok Siang (12:00)">Besok Siang (12:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Penumpang (Maks. 3)
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Pemesan *</label>
              <input
                type="text"
                required
                placeholder="Nama lengkap..."
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal text-slate-900 min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor WhatsApp *</label>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Patokan Jemput (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: Tunggu di lobby utama..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal text-slate-900 min-h-[44px]"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Submit: 48px touch target */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors min-h-[48px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Memproses Pesanan...</span>
                </>
              ) : (
                <>
                  <span>Pesan Taksi (Rp{estimatedFare.toLocaleString('id-ID')})</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
