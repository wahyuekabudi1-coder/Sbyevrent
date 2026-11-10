import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle,
  Clock,
  QrCode,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Printer,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Phone,
  RefreshCw,
  Building2,
  FileCheck
} from 'lucide-react';
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
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 menit
  const [isPaidSuccess, setIsPaidSuccess] = useState<boolean>(false);
  const [copiedAmount, setCopiedAmount] = useState<boolean>(false);
  
  // Custom QRIS & Proof State
  const [activeQrisUrl, setActiveQrisUrl] = useState<string>('/assets/qris-official.jpeg');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isUploadingQris, setIsUploadingQris] = useState<boolean>(false);
  const [qrisUploadSuccess, setQrisUploadSuccess] = useState<boolean>(false);
  const [showQrisUploader, setShowQrisUploader] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);

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
      if (data.qrisImageUrl) {
        setActiveQrisUrl(data.qrisImageUrl);
      }
      if (data.proofImageUrl) {
        setProofImage(data.proofImageUrl);
      }
      if (data.secondsLeft !== undefined) {
        setTimeLeft(data.secondsLeft);
      }
      if (
        data.paymentStatus === 'paid' ||
        data.paymentStatus === 'waiting_verification' ||
        data.bookingStatus === 'waiting_admin_confirmation' ||
        data.adminConfirmedAt ||
        data.proofImageUrl
      ) {
        setIsPaidSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat tagihan pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  // Upload QRIS asli dari pemilik/merchant
  const handleQrisFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Format file harus berupa gambar (JPG, PNG, WebP, SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file gambar maksimal 5MB.');
      return;
    }

    setIsUploadingQris(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        await api.uploadQrisImage(base64);
        setActiveQrisUrl(base64);
        setQrisUploadSuccess(true);
        setTimeout(() => setQrisUploadSuccess(false), 3000);
      } catch (err: any) {
        alert(err.message || 'Gagal mengunggah QRIS baru.');
      } finally {
        setIsUploadingQris(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload bukti transfer pelanggan
  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Format file harus berupa gambar (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProofImage(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleProcessPayment = async () => {
    if (!bookingNumber) return;

    // Validasi: Wajib unggah bukti bayar QRIS
    if (!proofImage) {
      setError('Mohon lampirkan foto/screenshot bukti pembayaran QRIS Anda terlebih dahulu agar admin dapat mengonfirmasi transaksi.');
      proofInputRef.current?.click();
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const trxRef = `QRIS-${Date.now()}-${booking?.uniqueCode || Math.floor(100 + Math.random() * 899)}`;
      await api.processPayment({
        bookingNumber,
        paymentMethod: 'QRIS',
        transactionRef: trxRef,
        proofImage: proofImage
      });

      // Reload fresh data to show full e-receipt
      await loadBookingDetails();
      setIsPaidSuccess(true);
      onPaymentSuccess(bookingNumber);
    } catch (err: any) {
      setError(err.message || 'Gagal memproses pengiriman bukti pembayaran QRIS.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !bookingNumber) return null;

  const totalAmount = booking?.totalAmount || 0;
  const uniqueCode = booking?.uniqueCode || 0;
  const basePrice = booking?.basePrice || (totalAmount - uniqueCode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col print:max-h-none print:shadow-none print:border-none print:m-0 print:w-full print:rounded-none">
        
        {/* Header Pembayaran QRIS Resmi */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-xs tracking-tighter">
              QRIS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight">Pembayaran QRIS Resmi</span>
                <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                  Standar BI &amp; ASPI
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 block font-mono">
                SURABAYA EV RENT (PT SAWAH JAYA TRANS)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Tutup pembayaran"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 sm:p-14 flex flex-col items-center justify-center text-slate-500 space-y-3 flex-1">
            <Loader2 className="w-9 h-9 animate-spin text-brand-teal" />
            <p className="text-xs sm:text-sm font-semibold">Menyiapkan Barcode QRIS &amp; Kode Unik Pembayaran...</p>
          </div>
        ) : error ? (
          <div className="p-6 sm:p-8 text-center space-y-4 flex-1">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-xs sm:text-sm text-slate-700 font-medium">{error}</p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-800 min-h-[44px] cursor-pointer"
            >
              Tutup
            </button>
          </div>
        ) : isPaidSuccess ? (
          /* ======================================================== */
          /* TAMPILAN E-RECEIPT RESMI (BUKTI PEMESANAN & PEMBAYARAN)   */
          /* ======================================================== */
          <div className="p-4 sm:p-7 overflow-y-auto flex-1 space-y-4 bg-slate-50/50 print:p-6 print:bg-white">
            
            {/* Kop E-Receipt */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 print:border-none print:shadow-none print:p-0">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                <div>
                  <Logo className="h-10 sm:h-12" showSubtitle={true} />
                  <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                    Layanan Rental &amp; Taksi Mobil Listrik Resmi Jawa Timur
                  </span>
                </div>
                
                {/* Stempel / Badge Status */}
                <div className="text-left sm:text-right">
                  {booking?.adminConfirmedAt ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300 shadow-2xs">
                      <CheckCircle className="w-4 h-4 text-emerald-700" />
                      <span>PEMBAYARAN TERKONFIRMASI (LUNAS)</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold border border-amber-300 shadow-2xs">
                      <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
                      <span>MENUNGGU KONFIRMASI MANUAL ADMIN</span>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {booking?.adminConfirmedAt ? (
                      <span className="text-emerald-700 font-semibold">Diverifikasi Admin: {new Date(booking.adminConfirmedAt).toLocaleString('id-ID')}</span>
                    ) : (
                      <span>Bukti Diterima · Menunggu Pengecekan Mutasi</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Judul Dokumen */}
              <div className="text-center py-1">
                <h2 className="text-base sm:text-lg font-black text-brand-primary uppercase tracking-tight">
                  E-RECEIPT BUKTI PEMBAYARAN RESMI
                </h2>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  No. Bukti: SJT-{booking.bookingNumber} · Dicetak Otomatis oleh Sistem
                </p>
              </div>

              {/* Rincian Finansial & Kode Unik */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Nomor Pesanan:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {booking.bookingNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(booking.bookingNumber)}
                      className="px-2 py-1 rounded bg-brand-mint hover:bg-brand-teal hover:text-white text-[10px] font-bold text-brand-teal transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Salin Kode Pemesanan untuk Pelacakan"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedAmount ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Waktu Pembayaran:</span>
                  <span className="font-semibold text-slate-900">
                    {booking.paidAt ? new Date(booking.paidAt).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')} WIB
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Metode Pembayaran:</span>
                  <span className="font-bold text-red-600 flex items-center gap-1">
                    <span className="bg-red-600 text-white text-[9px] font-black px-1 rounded">QRIS</span>
                    <span>Nasional (Semua Bank &amp; E-Wallet)</span>
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Tarif Sewa Pokok:</span>
                  <span className="font-semibold text-slate-800">Rp{basePrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 flex items-center gap-1">
                    <span>Kode Unik Verifikasi:</span>
                    <span className="text-[10px] text-slate-400 font-mono">(Strictly &lt; Rp1.000)</span>
                  </span>
                  <span className="font-bold text-brand-teal">+Rp{uniqueCode}</span>
                </div>
                <div className="flex justify-between pt-1.5 text-sm font-extrabold text-slate-900">
                  <span>Total yang Ditransfer:</span>
                  <span className="text-base font-black text-brand-teal font-mono">
                    Rp{totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Rincian Jadwal & Unit Armada */}
              <div className="p-4 rounded-xl bg-brand-mint/40 border border-brand-teal/20 space-y-2 text-xs">
                <div className="font-bold text-brand-primary flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-brand-lime" />
                  <span>Rincian Layanan &amp; Penjemputan:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Kota Layanan:</span>
                    <strong className="text-brand-primary">{booking.city}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Jadwal Tanggal &amp; Jam:</span>
                    <strong className="text-brand-primary">{booking.bookingDate} · Pukul {booking.bookingTime} WIB</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Jenis Layanan:</span>
                    <strong className="text-brand-primary">
                      {booking.serviceType === 'taxi' ? 'Taksi Listrik (Point-to-Point)' : 'Rental Mobil Listrik (Harian)'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">
                      {booking.serviceType === 'taxi' ? 'Rincian Jarak / Durasi:' : 'Durasi Paket:'}
                    </span>
                    <strong className="text-brand-primary">
                      {booking.serviceType === 'taxi'
                        ? `${booking.distanceKm || 0} km (Rp7.000/km)`
                        : `Paket ${booking.durationHours} Jam (Termasuk Driver & Listrik)`}
                    </strong>
                  </div>
                </div>

                {booking.serviceType === 'taxi' && (
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200/80 text-[10px] text-amber-900">
                    <strong>Catatan:</strong> Tarif di atas <strong>tidak termasuk tol dan parkir</strong> (dibayar mandiri oleh penumpang jika melalui tol/tempat parkir).
                  </div>
                )}

                <div className="pt-2 border-t border-brand-teal/15">
                  <span className="text-slate-500 block text-[11px]">Nama &amp; Kontak Pemesan:</span>
                  <strong className="text-brand-primary">{booking.customerName} ({booking.customerPhone})</strong>
                </div>

                <div className="pt-1 space-y-1">
                  <div>
                    <span className="text-slate-500 block text-[11px]">
                      {booking.serviceType === 'taxi' ? 'Dari (Titik Penjemputan):' : 'Titik Alamat Penjemputan:'}
                    </span>
                    <p className="font-semibold text-slate-800 text-[11px] leading-relaxed">
                      {booking.pickupAddress}
                    </p>
                  </div>
                  {booking.serviceType === 'taxi' && booking.dropoffAddress && (
                    <div>
                      <span className="text-slate-500 block text-[11px]">Tujuan (Lokasi Pengantaran):</span>
                      <p className="font-semibold text-slate-800 text-[11px] leading-relaxed">
                        {booking.dropoffAddress}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bukti Transfer jika sudah dilampirkan */}
              {proofImage && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-500 block text-[11px] font-bold mb-1.5 flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Lampiran Bukti Transfer Pelanggan:</span>
                  </span>
                  <img
                    src={proofImage}
                    alt="Bukti Transfer"
                    className="max-h-36 rounded-lg border border-slate-300 object-contain mx-auto"
                  />
                </div>
              )}

              {/* Keterangan Proses Verifikasi Manual oleh Admin */}
              <div className={`p-3.5 rounded-xl border text-[11px] space-y-1.5 ${
                booking?.adminConfirmedAt 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center justify-between">
                  <p className="font-bold flex items-center gap-1.5">
                    {booking?.adminConfirmedAt ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Pembayaran Telah Dikonfirmasi Manual oleh Admin</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Proses Konfirmasi Manual oleh Admin:</span>
                      </>
                    )}
                  </p>
                  {!booking?.adminConfirmedAt && (
                    <button
                      type="button"
                      onClick={() => loadBookingDetails()}
                      className="px-2 py-0.5 rounded bg-amber-200/70 hover:bg-amber-300 text-[10px] font-bold text-amber-900 transition-colors cursor-pointer"
                      title="Periksa apakah admin sudah mengonfirmasi"
                    >
                      Cek Status Terkini
                    </button>
                  )}
                </div>
                <p className="leading-relaxed">
                  {booking?.adminConfirmedAt ? (
                    <span>
                      Admin telah memverifikasi mutasi rekening dengan nominal tepat beserta kode unik <strong>+Rp{uniqueCode}</strong>. Armada dan driver resmi telah dijadwalkan. Admin akan segera menghubungi WhatsApp Anda untuk koordinasi teknis penjemputan.
                    </span>
                  ) : (
                    <span>
                      Bukti transfer QRIS Anda telah berhasil diunggah dan disimpan ke sistem. Admin kami sedang memverifikasi mutasi bank/settlement secara manual berdasarkan kode unik <strong>+Rp{uniqueCode}</strong>. Setelah dikonfirmasi, status pesanan otomatis terverifikasi dan admin langsung melakukan follow up via WhatsApp.
                    </span>
                  )}
                </p>
              </div>

            </div>

            {/* Tombol Aksi E-Receipt */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5 print:hidden">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 px-5 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs min-h-[46px]"
              >
                <Check className="w-4 h-4 text-brand-lime" />
                <span>Simpan Bukti &amp; Selesai</span>
              </button>
            </div>

          </div>
        ) : (
          /* ======================================================== */
          /* LAYAR PEMBAYARAN QRIS RESMI LANGSUNG (SCAN & BAYAR)      */
          /* ======================================================== */
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
            
            {/* Countdown Lock Banner */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 sm:gap-2 text-amber-900 font-medium">
                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Selesaikan pembayaran dalam:</span>
              </div>
              <div className="font-mono font-bold text-xs sm:text-sm text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded">
                {formatTimer(timeLeft)}
              </div>
            </div>

            {/* Total Tagihan dengan Kode Unik (< Rp1.000) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Rincian Tagihan Resmi:</span>
                <span className="font-mono font-bold text-slate-700">Ref: {booking.bookingNumber}</span>
              </div>

              <div className="flex justify-between text-xs text-slate-600">
                <span>Tarif Paket ({booking.vehicleModel}):</span>
                <span className="font-semibold text-slate-900">Rp{basePrice.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1 text-brand-teal font-semibold">
                  <span>Kode Unik Verifikasi Transaksi:</span>
                </span>
                <span className="font-bold text-brand-teal font-mono">+Rp{uniqueCode}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Total Transfer Tepat:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-black text-brand-primary font-mono">
                      Rp{totalAmount.toLocaleString('id-ID')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(totalAmount.toString())}
                      className="px-2 py-1 rounded-md bg-white border border-slate-300 hover:border-brand-teal text-[10px] font-bold text-slate-700 hover:text-brand-teal transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Salin total nominal tepat"
                    >
                      {copiedAmount ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-brand-teal" />}
                      <span>{copiedAmount ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                </div>
                <span className="text-[10px] text-amber-700 font-semibold bg-amber-100/70 px-2 py-1 rounded">
                  Wajib Sesuai 3 Digit Akhir
                </span>
              </div>
            </div>

              {/* QRIS Scan Area */}
              <div className="relative p-4 sm:p-5 rounded-2xl border-2 border-brand-teal/40 bg-gradient-to-b from-brand-mint/40 via-white to-brand-mint/20 text-center space-y-3 overflow-hidden shadow-xs">
                {/* Accent top stripe */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-lime via-brand-teal to-brand-primary" />

                <div className="flex items-center justify-center pb-2 border-b border-brand-teal/20 text-xs gap-2">
                  <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-2xs">QRIS</span>
                  <span className="font-extrabold text-slate-900">Scan Barcode QRIS Resmi di Bawah Ini</span>
                </div>

                {/* Gambar QRIS Utama */}
                <div className="max-w-[280px] sm:max-w-[320px] mx-auto bg-white p-2 rounded-2xl border-2 border-slate-200 shadow-sm">
                  <img
                    src={activeQrisUrl}
                    alt="QRIS Resmi OTI*SMART JOURNEY"
                    className="w-full h-auto rounded-xl object-contain mx-auto"
                  />
                </div>

                {/* Identitas Rekening Perusahaan & Instruksi Scan */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-xs font-black text-brand-primary uppercase tracking-tight">
                    OTI*SMART JOURNEY · PT SAWAH JAYA TRANS
                  </div>
                  
                  {/* Rekening Perusahaan Resmi */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-brand-teal/30 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-bold">Rekening Perusahaan (BCA):</span>
                    <strong className="text-xs font-mono font-extrabold text-brand-teal">8290-315-779</strong>
                    <span className="text-[9px] text-slate-400 font-mono">a/n PT Sawah Jaya Trans</span>
                  </div>

                  <p className="text-[11px] text-slate-600 max-w-md mx-auto leading-relaxed pt-1">
                    Buka aplikasi m-Banking (<strong>BCA, Mandiri, BRI, BNI</strong>) atau e-Wallet (<strong>GoPay, OVO, ShopeePay, DANA</strong>), scan barcode QRIS di atas dan pastikan transfer tepat <strong>Rp{totalAmount.toLocaleString('id-ID')}</strong>.
                  </p>
                </div>

              </div>

            {/* Lampirkan Bukti Transfer (Wajib diunggah pelanggan) */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-brand-teal" />
                  <span>Unggah Bukti Pembayaran QRIS (Wajib):</span>
                </label>
                {proofImage && (
                  <button
                    type="button"
                    onClick={() => setProofImage(null)}
                    className="text-[10px] text-rose-600 hover:underline cursor-pointer font-semibold"
                  >
                    Ganti Bukti
                  </button>
                )}
              </div>

              <input
                ref={proofInputRef}
                type="file"
                accept="image/*"
                onChange={handleProofFileChange}
                className="hidden"
              />

              {proofImage ? (
                <div className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-emerald-300 shadow-2xs">
                  <img
                    src={proofImage}
                    alt="Preview Bukti"
                    className="w-14 h-14 object-cover rounded-md border border-slate-200 shadow-xs"
                  />
                  <div className="flex-1 text-[11px]">
                    <span className="font-bold text-emerald-800 block flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Bukti Pembayaran Siap Dikirim
                    </span>
                    <span className="text-slate-500 text-[10px] block mt-0.5">
                      Akan diverifikasi manual oleh admin dengan mutasi bank
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => proofInputRef.current?.click()}
                  className="w-full py-3 px-3 border-2 border-dashed border-brand-teal/40 hover:border-brand-teal rounded-xl bg-white text-xs font-bold text-brand-teal hover:bg-brand-mint/20 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs min-h-[46px]"
                >
                  <Upload className="w-4 h-4 text-brand-teal" />
                  <span>Pilih / Upload Struk / Bukti Bayar QRIS</span>
                </button>
              )}
            </div>

            {/* Tombol Eksekusi: Kirim Bukti & Minta Konfirmasi Admin */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={isProcessing}
                className="w-full py-4 px-4 font-black text-sm text-white bg-brand-teal hover:bg-brand-teal-hover rounded-xl shadow-xs hover:shadow-sm cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-brand-lime" />
                    <span>Mengirim Bukti & Menerbitkan E-Receipt...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-brand-lime" />
                    <span>Kirim Bukti Pembayaran &amp; Minta Konfirmasi Admin</span>
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-slate-500 leading-relaxed">
                Setelah bukti dikirim, E-Receipt resmi diterbitkan dan pesanan langsung masuk antrean untuk diverifikasi manual oleh admin sebelum armada diberangkatkan.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
