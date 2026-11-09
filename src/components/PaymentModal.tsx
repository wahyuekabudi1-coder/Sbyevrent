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
  const [activeQrisUrl, setActiveQrisUrl] = useState<string>('/assets/qris-official.svg');
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
      if (data.paymentStatus === 'paid') {
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
    };
    reader.readAsDataURL(file);
  };

  const handleProcessPayment = async () => {
    if (!bookingNumber) return;
    setIsProcessing(true);
    setError(null);

    try {
      const trxRef = `QRIS-${Date.now()}-${booking?.uniqueCode || Math.floor(100 + Math.random() * 899)}`;
      await api.processPayment({
        bookingNumber,
        paymentMethod: 'QRIS',
        transactionRef: trxRef,
        proofImage: proofImage || undefined
      });

      // Reload fresh data to show full e-receipt
      await loadBookingDetails();
      setIsPaidSuccess(true);
      onPaymentSuccess(bookingNumber);
    } catch (err: any) {
      setError(err.message || 'Gagal memproses pembayaran QRIS.');
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
                
                {/* Stempel / Badge Lunas */}
                <div className="text-left sm:text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300 shadow-2xs">
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                    <span>PEMBAYARAN QRIS DITERIMA</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Status: <strong className="text-brand-teal">Menunggu Konfirmasi Admin</strong>
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
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Nomor Pesanan:</span>
                  <span className="font-mono font-bold text-slate-900">{booking.bookingNumber}</span>
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
                    <span className="text-slate-500 block text-[11px]">Armada Kendaraan:</span>
                    <strong className="text-brand-primary">{booking.vehicleModel}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Durasi Paket:</span>
                    <strong className="text-brand-primary">Paket {booking.durationHours} Jam (Termasuk Driver &amp; Listrik)</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-brand-teal/15">
                  <span className="text-slate-500 block text-[11px]">Nama &amp; Kontak Pemesan:</span>
                  <strong className="text-brand-primary">{booking.customerName} ({booking.customerPhone})</strong>
                </div>

                <div className="pt-1">
                  <span className="text-slate-500 block text-[11px]">Titik Alamat Penjemputan:</span>
                  <p className="font-semibold text-slate-800 text-[11px] leading-relaxed">
                    {booking.pickupAddress}
                  </p>
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

              {/* Keterangan Proses Selanjutnya oleh Admin */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Proses Selanjutnya oleh Admin:</span>
                </p>
                <p className="text-amber-800 leading-relaxed">
                  Bukti pemesanan dan pembayaran QRIS Anda telah tersimpan resmi di sistem. Admin kami akan segera memverifikasi mutasi rekening berdasarkan nominal tepat dengan kode unik <strong>+Rp{uniqueCode}</strong>. Setelah pembayaran terverifikasi OK, admin kami akan mengonfirmasi jadwal armada dan langsung melakukan follow up ke nomor WhatsApp Anda.
                </p>
              </div>

            </div>

            {/* Tombol Aksi E-Receipt */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5 print:hidden">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs min-h-[44px]"
              >
                <Printer className="w-4 h-4 text-brand-lime" />
                <span>Cetak / Unduh E-Receipt</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs min-h-[44px]"
              >
                <Check className="w-4 h-4" />
                <span>Selesai &amp; Simpan Bukti</span>
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
            <div className="p-4 sm:p-5 rounded-2xl border-2 border-red-500/30 bg-gradient-to-b from-red-50/40 via-white to-red-50/20 text-center space-y-3">
              
              <div className="flex items-center justify-between pb-2 border-b border-red-100 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">QRIS</span>
                  <span>Scan Kode QRIS di Bawah Ini</span>
                </div>
                
                {/* Tombol Unggah QRIS Asli (memenuhi permintaan user: 'Nanti saya akan upload QRIS-nya') */}
                <button
                  type="button"
                  onClick={() => setShowQrisUploader(!showQrisUploader)}
                  className="text-[11px] font-bold text-brand-teal hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{showQrisUploader ? 'Tutup Uploader' : 'Unggah QRIS Asli'}</span>
                </button>
              </div>

              {/* Panel Uploader QRIS (jika user mau upload QRIS baru miliknya sekarang juga) */}
              {showQrisUploader && (
                <div className="p-3 bg-white rounded-xl border border-brand-teal/40 text-left space-y-2 text-xs">
                  <div className="font-bold text-slate-800 flex items-center justify-between">
                    <span>Ganti / Unggah Gambar QRIS Toko Anda:</span>
                    {qrisUploadSuccess && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Berhasil Diperbarui
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Pilih file gambar QRIS resmi milik toko/perusahaan Anda (PNG, JPG, WebP). QRIS akan langsung aktif di layar pemesanan.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleQrisFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingQris}
                      className="px-3 py-1.5 rounded-lg bg-brand-teal hover:bg-brand-teal-hover text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingQris ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>Pilih File Gambar QRIS</span>
                    </button>
                    <span className="text-[10px] text-slate-400">Ukuran maks 5MB</span>
                  </div>
                </div>
              )}

              {/* Gambar QRIS Utama */}
              <div className="max-w-[280px] sm:max-w-[320px] mx-auto bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-md">
                <img
                  src={activeQrisUrl}
                  alt="QRIS Resmi SURABAYA EV RENT"
                  className="w-full h-auto rounded-xl object-contain mx-auto"
                />
              </div>

              {/* Instruksi Scan */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-900">
                  SURABAYA EV RENT · PT SAWAH JAYA TRANS
                </div>
                <p className="text-[11px] text-slate-600 max-w-md mx-auto leading-relaxed">
                  Buka aplikasi mobile banking (<strong>BCA, Mandiri, BRI, BNI</strong>) atau dompet digital (<strong>GoPay, OVO, ShopeePay, DANA</strong>), lalu scan barcode QRIS di atas dan bayar tepat <strong>Rp{totalAmount.toLocaleString('id-ID')}</strong>.
                </p>
              </div>

            </div>

            {/* Lampirkan Bukti Transfer (Opsional / Dianjurkan) */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-brand-teal" />
                  <span>Lampirkan Struk / Bukti Bayar (Opsional):</span>
                </label>
                {proofImage && (
                  <button
                    type="button"
                    onClick={() => setProofImage(null)}
                    className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                  >
                    Hapus Bukti
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
                <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                  <img
                    src={proofImage}
                    alt="Preview Bukti"
                    className="w-12 h-12 object-cover rounded-md border border-slate-200"
                  />
                  <div className="flex-1 text-[11px]">
                    <span className="font-bold text-emerald-700 block flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Bukti transfer terlampir
                    </span>
                    <span className="text-slate-400">Siap dikirim bersama konfirmasi</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => proofInputRef.current?.click()}
                  className="w-full py-2 px-3 border border-dashed border-slate-300 hover:border-brand-teal rounded-lg bg-white text-xs font-semibold text-slate-600 hover:text-brand-teal transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Upload Screenshot / Struk Pembayaran</span>
                </button>
              )}
            </div>

            {/* Tombol Eksekusi: Konfirmasi Saya Sudah Bayar */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={isProcessing}
                className="w-full py-4 px-4 font-black text-sm text-white bg-brand-teal hover:bg-brand-teal-hover rounded-xl shadow-xs hover:shadow-sm cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-brand-lime" />
                    <span>Menerbitkan E-Receipt Resmi...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-brand-lime" />
                    <span>Konfirmasi Saya Sudah Bayar via QRIS</span>
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-slate-500">
                Setelah tombol diklik, E-Receipt resmi diterbitkan dan pesanan langsung masuk ke antrean verifikasi admin untuk di-follow up.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
