import React, { useState, useEffect } from 'react';
import { X, Search, Car, Phone, AlertCircle, Loader2, Shield } from 'lucide-react';
import { api } from '../lib/api';

interface BookingTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
}

export const BookingTrackerModal: React.FC<BookingTrackerModalProps> = ({
  isOpen,
  onClose,
  initialCode = ''
}) => {
  const [code, setCode] = useState(initialCode);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Body scroll lock
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
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      const data = await api.trackBooking(code.trim().toUpperCase());
      setBooking(data);
    } catch (err: any) {
      setError(err.message || 'Nomor booking tidak ditemukan. Mohon periksa kembali.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-teal">
              Pelacakan Status Pesanan
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Cek Status Booking &amp; Driver
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Tutup pelacak booking"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Input Form */}
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Contoh: SJT-20261102-1234 atau TXI-..."
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm uppercase font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal text-slate-900 min-h-[44px]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="px-5 py-2.5 text-xs font-bold text-white bg-brand-teal hover:bg-brand-teal-hover disabled:opacity-50 rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Search className="w-4 h-4 shrink-0" />}
              <span>Lacak Pesanan</span>
            </button>
          </form>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Hasil Pencarian Booking */}
          {booking && (
            <div className="space-y-3 sm:space-y-4">
              {/* Header Status */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 uppercase block font-semibold">Status Pemesanan</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-slate-900 capitalize text-sm">
                      {booking.bookingStatus.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                      {booking.paymentStatus === 'paid' ? 'LUNAS (Paid)' : booking.paymentStatus}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-500 block">Jadwal Perjalanan:</span>
                  <span className="text-xs font-bold text-slate-900">{booking.bookingDate} · {booking.bookingTime} WIB</span>
                </div>
              </div>

              {/* Rincian Perjalanan */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Layanan:</span>
                  <span className="font-semibold text-slate-900 capitalize">
                    {booking.serviceType} Mobil Listrik ({booking.city})
                  </span>
                </div>
                {booking.vehicleModel && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Model Kendaraan:</span>
                    <span className="font-bold text-slate-900">{booking.vehicleModel}</span>
                  </div>
                )}
                {booking.durationHours && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Paket Durasi:</span>
                    <span className="font-semibold text-slate-900">
                      {booking.durationHours} Jam (Batas {booking.kmLimit} km)
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Titik Jemput:</span>
                  <span className="font-medium text-slate-900 text-right max-w-[200px] sm:max-w-xs truncate">
                    {booking.pickupAddress}
                  </span>
                </div>
              </div>

              {/* Informasi Mobil & Driver */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-brand-teal/20 bg-brand-mint/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-primary flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-brand-teal shrink-0" />
                    <span>Armada Mobil &amp; Driver Penjemput</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                    Armada &amp; Driver Siap
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-brand-teal/20">
                    <span className="text-slate-600">Nomor Plat Mobil:</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-xs tracking-wider">
                      {booking.plateNumber || '-'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-brand-teal/20">
                    <span className="text-slate-600">Nama Driver:</span>
                    <strong className="text-slate-900 font-bold">{booking.driverName || 'Driver Operasional'}</strong>
                  </div>

                  {booking.driverPhone && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600">Kontak Driver (WA):</span>
                      <a
                        href={`https://wa.me/${booking.driverPhone.replace(/^0/, '62')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-brand-teal hover:underline flex items-center gap-1 min-h-[36px]"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{booking.driverPhone}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
