import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, QrCode, CreditCard, Building2, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Logo } from './Logo';

interface PaymentModalProps {
  isOpen: boolean;
  bookingNumber: string | null;
  onClose: () => void;
  onPaymentSuccess: (bookingNumber: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  bookingNumber,
  onClose,
  onPaymentSuccess
}) => {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'VA_BCA' | 'VA_MANDIRI' | 'CREDIT_CARD'>('QRIS');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 menit
  const [isPaidSuccess, setIsPaidSuccess] = useState<boolean>(false);

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
    if (isOpen && bookingNumber) {
      loadBookingDetails();
    }
  }, [isOpen, bookingNumber]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isPaidSuccess || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isPaidSuccess, timeLeft]);

  const loadBookingDetails = async () => {
    if (!bookingNumber) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPaymentDetails(bookingNumber);
      setBooking(data);
      if (data.secondsLeft !== undefined) {
        setTimeLeft(data.secondsLeft);
      }
      if (data.paymentStatus === 'paid') {
        setIsPaidSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat tagihan pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateOrProcessPayment = async () => {
    if (!bookingNumber) return;
    setIsProcessing(true);
    setError(null);

    try {
      await api.processPayment({
        bookingNumber,
        paymentMethod,
        transactionRef: `ARTOPAY-${Date.now()}`
      });

      setIsPaidSuccess(true);
      onPaymentSuccess(bookingNumber);
    } catch (err: any) {
      setError(err.message || 'Gagal memproses pembayaran.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !bookingNumber) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header ArtoPay Payment Gateway */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Logo className="h-8 sm:h-9" showSubtitle={false} lightMode={true} />
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-xs sm:text-sm tracking-tight">ArtoPay Gateway</span>
                <span className="text-[9px] sm:text-[10px] bg-brand-mint0/30 text-brand-lime px-1.5 py-0.5 rounded font-mono">
                  Sandbox
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate max-w-[180px] sm:max-w-none">
                SURABAYA EV RENT
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Tutup pembayaran"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-slate-500 space-y-3 flex-1">
            <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
            <p className="text-xs sm:text-sm">Menghubungkan ke Gateway ArtoPay...</p>
          </div>
        ) : error ? (
          <div className="p-6 sm:p-8 text-center space-y-4 flex-1">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-xs sm:text-sm text-slate-700">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-800 min-h-[44px]"
            >
              Tutup
            </button>
          </div>
        ) : isPaidSuccess ? (
          /* Tampilan Pembayaran Berhasil */
          <div className="p-5 sm:p-8 text-center space-y-5 overflow-y-auto flex-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>

            <div>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wide">
                Pembayaran Terverifikasi
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                Booking Resmi Dikonfirmasi!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Nomor Pesanan: <strong className="font-mono text-slate-900">{booking.bookingNumber}</strong>
              </p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Layanan:</span>
                <span className="font-bold text-slate-900 capitalize">{booking.serviceType} Mobil Listrik</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Terbayar:</span>
                <span className="font-extrabold text-slate-900">Rp{booking.totalAmount?.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Metode Bayar:</span>
                <span className="font-semibold text-slate-800">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Armada:</span>
                <span className="font-bold text-emerald-700">Terkunci untuk Anda</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-brand-mint border border-brand-teal/20 text-left text-xs text-brand-primary space-y-1">
              <div className="font-bold text-brand-primary flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-teal shrink-0" />
                <span>Pengungkapan Identitas Driver &amp; Plat:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Nomor plat mobil dan identitas driver dapat langsung Anda pantau di menu <strong>Cek Booking</strong> menggunakan nomor pemesanan di atas.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 font-bold text-xs sm:text-sm text-white bg-brand-teal hover:bg-brand-teal-hover rounded-xl shadow-xs cursor-pointer transition-colors min-h-[48px] flex items-center justify-center"
            >
              Selesai &amp; Simpan Nomor Booking
            </button>
          </div>
        ) : (
          /* Layar Pemilihan Metode & Checkout */
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
            
            {/* Countdown Lock Banner */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 sm:gap-2 text-amber-900 font-medium">
                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Unit dikunci sementara:</span>
              </div>
              <div className="font-mono font-bold text-xs sm:text-sm text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                {formatTimer(timeLeft)}
              </div>
            </div>

            {/* Total Tagihan */}
            <div className="flex items-baseline justify-between pb-3 sm:pb-4 border-b border-slate-200">
              <div>
                <span className="text-[11px] sm:text-xs text-slate-500 block">Total Tagihan</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  Rp{booking.totalAmount?.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="text-right text-xs">
                <span className="text-slate-500">Ref:</span>
                <span className="font-mono font-bold text-slate-800 block text-xs sm:text-sm">{booking.bookingNumber}</span>
              </div>
            </div>

            {/* Pilihan Metode Pembayaran ArtoPay */}
            <div className="space-y-2 sm:space-y-2.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Pilih Metode Pembayaran
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 sm:gap-3 transition-all cursor-pointer min-h-[56px] ${
                    paymentMethod === 'QRIS'
                      ? 'border-brand-teal bg-brand-mint text-brand-primary font-bold ring-1 ring-brand-teal'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-brand-teal shrink-0" />
                  <div>
                    <div className="text-xs font-bold">QRIS (Semua Bank / e-Wallet)</div>
                    <div className="text-[10px] text-slate-500">BCA, Mandiri, GoPay, OVO, Shopee</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('VA_BCA')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 sm:gap-3 transition-all cursor-pointer min-h-[56px] ${
                    paymentMethod === 'VA_BCA'
                      ? 'border-brand-teal bg-brand-mint text-brand-primary font-bold ring-1 ring-brand-teal'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-brand-teal shrink-0" />
                  <div>
                    <div className="text-xs font-bold">BCA Virtual Account</div>
                    <div className="text-[10px] text-slate-500">Verifikasi otomatis 24 jam</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('VA_MANDIRI')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 sm:gap-3 transition-all cursor-pointer min-h-[56px] ${
                    paymentMethod === 'VA_MANDIRI'
                      ? 'border-brand-teal bg-brand-mint text-brand-primary font-bold ring-1 ring-brand-teal'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-brand-teal shrink-0" />
                  <div>
                    <div className="text-xs font-bold">Mandiri Virtual Account</div>
                    <div className="text-[10px] text-slate-500">Verifikasi instan Livin</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CREDIT_CARD')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 sm:gap-3 transition-all cursor-pointer min-h-[56px] ${
                    paymentMethod === 'CREDIT_CARD'
                      ? 'border-brand-teal bg-brand-mint text-brand-primary font-bold ring-1 ring-brand-teal'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-brand-teal shrink-0" />
                  <div>
                    <div className="text-xs font-bold">Kartu Kredit / Debit</div>
                    <div className="text-[10px] text-slate-500">Visa, Mastercard, JCB</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Simulasi Instruksi Pembayaran */}
            {paymentMethod === 'QRIS' && (
              <div className="p-3.5 sm:p-4 rounded-xl border border-dashed border-brand-teal/30 bg-brand-mint/40 text-center space-y-2">
                <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center">
                  <QrCode className="w-20 h-20 sm:w-24 sm:h-24 text-slate-800" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  SURABAYA EV RENT · QRIS
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500">
                  Scan kode QRIS di atas melalui m-Banking atau e-Wallet Anda.
                </p>
              </div>
            )}

            {paymentMethod.startsWith('VA') && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="text-slate-500 block">Nomor Rekening Virtual Account:</span>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="font-mono text-sm sm:text-base font-bold text-slate-900">
                    8809 1829 4001 2831
                  </span>
                  <span className="text-[11px] font-bold text-brand-teal">Salin No. VA</span>
                </div>
              </div>
            )}

            {/* Tombol Eksekusi: 48px touch target */}
            <div className="pt-1">
              <button
                type="button"
                disabled={isProcessing || timeLeft <= 0}
                onClick={handleSimulateOrProcessPayment}
                className="w-full py-3.5 px-4 font-bold text-xs sm:text-sm text-white bg-brand-teal hover:bg-brand-teal-hover disabled:opacity-50 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors min-h-[48px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Memverifikasi Pembayaran...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Bayar Sekarang (Konfirmasi ArtoPay)</span>
                  </>
                )}
              </button>
              <span className="block text-center text-[10px] sm:text-[11px] text-slate-500 mt-2">
                Didukung enkripsi keamanan ArtoPay 256-bit SSL &amp; webhook HMAC-SHA256.
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
