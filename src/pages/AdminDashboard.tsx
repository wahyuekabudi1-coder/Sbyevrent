import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ShieldCheck, TrendingUp, Car, Calendar, FileText, Settings,
  ArrowLeft, RefreshCw, Download, CheckCircle2,
  FileImage, Loader2, KeyRound, ExternalLink, Search,
  AlertCircle, ChevronRight, ChevronLeft, Bell, Trash2, Edit3,
  UserCheck, MapPin, Eye, Check, X, Phone, DollarSign
} from 'lucide-react';
import { api } from '../lib/api';
import { Logo } from '../components/Logo';

interface AdminDashboardProps {
  onBackHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackHome }) => {
  const [adminPin, setAdminPin] = useState('admin2026');
  const [showPin, setShowPin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 5 Menu Ramping Sesuai Permintaan
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'vehicles' | 'calendar' | 'bookings' | 'pricing'
  >('analytics');

  // Lonceng Notifikasi Order Baru
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Data Analitik & QRIS Toko
  const [stats, setStats] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [adminQrisUrl, setAdminQrisUrl] = useState<string>('/assets/qris-official.jpeg');
  const [isUploadingQris, setIsUploadingQris] = useState<boolean>(false);
  const [qrisSuccessMsg, setQrisSuccessMsg] = useState<string | null>(null);
  const qrisFileInputRef = useRef<HTMLInputElement>(null);

  // Data Mobil (CRUD Lengkap: Tambah, Edit, Hapus, Kurangi)
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [vehicleFormData, setVehicleFormData] = useState({
    code: '',
    model: 'VinFast VF e34' as 'VinFast VF e34',
    plateNumber: '',
    city: 'Surabaya' as 'Surabaya' | 'Sidoarjo',
    driverName: 'Driver Profesional',
    driverPhone: '081234567890',
    notes: ''
  });

  // Data Kalender Bulanan
  const today = new Date();
  const [calendarYear, setCalendarYear] = useState<number>(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(today.getMonth()); // 0-11
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(
    today.toISOString().split('T')[0]
  );

  // Data Pemesanan
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilterCity, setBookingFilterCity] = useState('');
  const [bookingFilterService, setBookingFilterService] = useState('');

  // Detail & Dispatch Driver Terintegrasi untuk Pesanan Terpilih (Inline Halaman)
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<any | null>(null);

  // Data Pengaturan Tarif
  const [pricingList, setPricingList] = useState<any[]>([]);
  const [editPriceId, setEditPriceId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<number>(0);

  // Klik di luar dropdown notifikasi untuk menutup
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotificationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);
    try {
      const data = await api.getAdminOverview(adminPin);
      setStats(data);
      setIsAuthenticated(true);
    } catch {
      setAuthError('PIN Admin tidak valid. Silakan gunakan PIN resmi (Default: admin2026)');
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'analytics') loadAnalytics();
      if (activeTab === 'vehicles') loadVehicles();
      if (activeTab === 'calendar') {
        loadBookings();
        loadVehicles();
      }
      if (activeTab === 'bookings') loadBookings();
      if (activeTab === 'pricing') loadPricing();
    }
  }, [isAuthenticated, activeTab]);

  // Loaders
  const loadAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const [s, rep, sett] = await Promise.all([
        api.getAdminOverview(adminPin),
        api.getAdminReports(adminPin).catch(() => null),
        api.getSettings().catch(() => null)
      ]);
      setStats(s);
      setReportData(rep);
      if (sett?.qris_image_url) {
        setAdminQrisUrl(sett.qris_image_url);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const loadVehicles = async () => {
    setIsLoadingVehicles(true);
    try {
      const data = await api.getAdminVehicles(adminPin);
      setVehicles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const loadBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const data = await api.getAdminBookings(adminPin, {
        search: bookingSearch,
        city: bookingFilterCity,
        service: bookingFilterService
      });
      setBookings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const loadPricing = async () => {
    try {
      const data = await api.getPricing();
      setPricingList(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Upload QRIS Toko
  const handleAdminQrisFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB.');
      return;
    }

    setIsUploadingQris(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        await api.uploadQrisImage(base64);
        setAdminQrisUrl(base64);
        setQrisSuccessMsg('QRIS resmi PT Sawah Jaya Trans berhasil diperbarui!');
        setTimeout(() => setQrisSuccessMsg(null), 4000);
      } catch (err: any) {
        alert(err.message || 'Gagal menyimpan QRIS.');
      } finally {
        setIsUploadingQris(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // CRUD Mobil (Tambah, Edit, Hapus)
  const handleOpenAddVehicle = () => {
    setEditingVehicleId(null);
    setVehicleFormData({
      code: `SJT-${vehicles.length < 9 ? '0' : ''}${vehicles.length + 1}`,
      model: 'VinFast VF e34',
      plateNumber: '',
      city: 'Surabaya',
      driverName: 'Driver Profesional',
      driverPhone: '081234567890',
      notes: ''
    });
    setShowVehicleForm(true);
  };

  const handleOpenEditVehicle = (veh: any) => {
    setEditingVehicleId(veh.id);
    setVehicleFormData({
      code: veh.code || '',
      model: veh.model || 'VinFast VF e34',
      plateNumber: veh.plate_number || '',
      city: veh.city || 'Surabaya',
      driverName: veh.dedicated_driver_name || 'Driver Profesional',
      driverPhone: veh.driver_phone || '081234567890',
      notes: veh.notes || ''
    });
    setShowVehicleForm(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVehicleId) {
        await api.updateAdminVehicle(adminPin, editingVehicleId, vehicleFormData);
      } else {
        await api.addAdminVehicle(adminPin, vehicleFormData);
      }
      setShowVehicleForm(false);
      setEditingVehicleId(null);
      loadVehicles();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan unit mobil');
    }
  };

  const handleDeleteVehicle = async (veh: any) => {
    if (!window.confirm(`Yakin ingin menghapus unit mobil ${veh.model} (${veh.code} - ${veh.plate_number})?`)) {
      return;
    }
    try {
      await api.deleteAdminVehicle(adminPin, veh.id);
      loadVehicles();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus unit mobil');
    }
  };

  const handleToggleMaintenance = async (veh: any) => {
    try {
      await api.updateAdminVehicle(adminPin, veh.id, {
        ...veh,
        inMaintenance: !veh.in_maintenance
      });
      loadVehicles();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status');
    }
  };

  // Update Harga
  const handleSavePrice = async (id: string) => {
    try {
      await api.updatePricing(adminPin, id, editPriceValue);
      setEditPriceId(null);
      loadPricing();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan tarif');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!bookings.length) return;
    const headers = ['Nomor Booking', 'Layanan', 'Kota', 'Tanggal', 'Pelanggan', 'WhatsApp', 'Total', 'Status Pembayaran', 'Status Booking'];
    const rows = bookings.map(b => [
      b.booking_number,
      b.service_type,
      b.city,
      b.booking_date,
      `"${b.customer_name}"`,
      b.customer_phone,
      b.total_amount,
      b.payment_status,
      b.booking_status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Booking_SJT_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // List Order Baru yang Menunggu Verifikasi
  const pendingBookings = useMemo(() => {
    return bookings.filter(
      b => b.payment_status === 'waiting_verification' || 
           (b.proof_image_url && b.booking_status !== 'confirmed') ||
           b.booking_status === 'pending'
    );
  }, [bookings]);

  // Kalender Bulanan Helpers
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const handleJumpToday = () => {
    const now = new Date();
    setCalendarYear(now.getFullYear());
    setCalendarMonth(now.getMonth());
    setSelectedCalendarDate(now.toISOString().split('T')[0]);
  };

  // Hitung matriks hari dalam bulan
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 = Sun
    // Sesuaikan agar Senin = 0, Minggu = 6
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    // Map bookings berdasarkan tanggal format 'YYYY-MM-DD'
    const dateMap: { [key: string]: any[] } = {};
    for (const b of bookings) {
      if (b.booking_date && b.booking_status !== 'cancelled') {
        if (!dateMap[b.booking_date]) dateMap[b.booking_date] = [];
        dateMap[b.booking_date].push(b);
      }
    }

    const cells: Array<{
      dateNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      bookings: any[];
      vfe34Count: number;
      totalBooked: number;
    }> = [];

    // Slot kosong sebelum tanggal 1
    for (let i = 0; i < adjustedFirstDay; i++) {
      cells.push({
        dateNumber: 0,
        dateStr: '',
        isCurrentMonth: false,
        isToday: false,
        bookings: [],
        vfe34Count: 0,
        totalBooked: 0
      });
    }

    // Tanggal 1 sampai akhir bulan
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(calendarMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${calendarYear}-${mStr}-${dStr}`;
      const dayBookings = dateMap[dateStr] || [];

      const vfe34Count = dayBookings.length;

      const isToday = dateStr === today.toISOString().split('T')[0];

      cells.push({
        dateNumber: d,
        dateStr,
        isCurrentMonth: true,
        isToday,
        bookings: dayBookings,
        vfe34Count,
        totalBooked: dayBookings.length
      });
    }

    return cells;
  }, [calendarYear, calendarMonth, bookings]);

  // Kapasitas harian aktual unit VinFast VF e34 aktif & tidak perawatan
  const dailyCapacity = useMemo(() => {
    const active = vehicles.filter(v => v.is_active !== 0 && !v.in_maintenance).length;
    return active > 0 ? active : 2;
  }, [vehicles]);

  // Pesanan pada tanggal yang sedang dipilih di Kalender
  const selectedDateBookings = useMemo(() => {
    return bookings.filter(b => b.booking_date === selectedCalendarDate && b.booking_status !== 'cancelled');
  }, [bookings, selectedCalendarDate]);

  // Definisi 5 Menu Navigasi
  const navItems = [
    { id: 'analytics', label: 'Analitik', icon: TrendingUp },
    { id: 'vehicles', label: 'Mobil', icon: Car },
    { id: 'calendar', label: 'Kalender', icon: Calendar },
    { id: 'bookings', label: 'Data Pemesanan', icon: FileText, badge: pendingBookings.length },
    { id: 'pricing', label: 'Pengaturan Tarif', icon: Settings },
  ];

  // =========================================================================
  // HALAMAN MASUK / LOGIN DEDIKASI
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <Logo className="h-10" showSubtitle={false} lightMode={true} />
            <span className="text-xs font-mono font-bold text-slate-400 border-l border-slate-700 pl-3">
              Konsol Pengelola Resmi
            </span>
          </div>
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white py-2 px-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Website Utama</span>
          </button>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row">
          <div className="lg:w-3/5 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="space-y-6 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-brand-primary border border-brand-teal/40 text-brand-lime text-xs font-mono font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-lime" />
                <span>PT SAWAH JAYA TRANS · SURABAYA EV RENT</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
                Konsol Operasional &amp; Manajemen Pemesanan Mobil Listrik
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Akses terpusat untuk memantau analitik pendapatan, ketersediaan unit mobil listrik VinFast VF e34, kalender booking harian, verifikasi transaksi transfer bank/QRIS, serta pengaturan tarif operasional Surabaya &amp; Sidoarjo.
              </p>
            </div>
            <div className="pt-8 text-xs text-slate-500 font-mono">
              Sistem Terverifikasi · Enkripsi TLS 256-Bit
            </div>
          </div>

          <div className="lg:w-2/5 p-8 sm:p-12 lg:p-16 flex items-center justify-center bg-slate-900/50">
            <div className="w-full max-w-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Otentikasi Pengelola</h2>
                <p className="text-xs text-slate-400 mt-1">Masukkan PIN keamanan untuk membuka akses administrasi</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>PIN Keamanan Admin</span>
                    <span className="text-[10px] text-slate-500 font-mono">Default: admin2026</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      required
                      value={adminPin}
                      onChange={e => setAdminPin(e.target.value)}
                      placeholder="admin2026"
                      className="w-full px-3.5 py-3 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white font-mono tracking-wider focus:outline-none focus:border-brand-teal"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                    >
                      {showPin ? 'Sembunyikan' : 'Tampilkan'}
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 px-4 font-bold text-xs sm:text-sm text-slate-950 bg-brand-lime hover:bg-brand-lime/90 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 min-h-[46px]"
                >
                  {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <KeyRound className="w-4 h-4 text-slate-950" />}
                  <span>Buka Konsol Pengelola</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // HALAMAN UTAMA WORKSPACE ADMIN
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-14 sm:h-16 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={onBackHome}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
            title="Kembali ke Web Publik"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Web Publik</span>
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block shrink-0" />

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs truncate">
            <span className="font-bold text-white tracking-wide truncate">Surabaya EV Rent</span>
            <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
            <span className="text-brand-lime font-bold capitalize truncate">
              {navItems.find(item => item.id === activeTab)?.label}
            </span>
          </div>
        </div>

        {/* Notifikasi Lonceng & Aksi Profil */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Lonceng Notifikasi Order Baru */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Notifikasi Pemesanan Baru"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {pendingBookings.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {pendingBookings.length}
                </span>
              )}
            </button>

            {/* Dropdown Notifikasi */}
            {showNotificationDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-brand-lime" />
                    <span>Notifikasi Order Masuk ({pendingBookings.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNotificationDropdown(false)}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {pendingBookings.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      Tidak ada pesanan baru yang menunggu tindakan saat ini.
                    </div>
                  ) : (
                    pendingBookings.map(b => (
                      <div
                        key={b.id}
                        onClick={() => {
                          setSelectedBookingDetail(b);
                          setActiveTab('bookings');
                          setShowNotificationDropdown(false);
                        }}
                        className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-colors space-y-1"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs text-white truncate">{b.customer_name}</span>
                          <span className="text-[10px] font-mono font-bold text-brand-lime">
                            Rp{b.total_amount?.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {b.vehicle_model || 'VinFast'} · {b.booking_date} ({b.booking_time} WIB)
                        </div>
                        <div className="flex items-center justify-between pt-1 text-[10px]">
                          <span className="text-amber-400 font-semibold">
                            {b.proof_image_url ? 'Bukti transfer sudah diunggah' : 'Menunggu verifikasi'}
                          </span>
                          <span className="text-brand-teal font-bold hover:underline">Lihat Order →</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsAuthenticated(false)}
            className="px-3 py-1.5 text-xs text-rose-300 hover:text-white hover:bg-rose-950/70 border border-rose-900/50 rounded-lg transition-colors font-semibold cursor-pointer"
          >
            Kunci &amp; Keluar
          </button>
        </div>
      </header>

      {/* Navigasi Bar Tab untuk Mobile */}
      <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-3 py-2 overflow-x-auto flex gap-1.5 sticky top-14 z-20">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id as any);
                setSelectedBookingDetail(null);
              }}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                isActive
                  ? 'bg-brand-primary text-brand-lime border border-brand-teal/50 shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.badge ? (
                <span className="ml-1 px-1.5 py-0.2 text-[9px] font-black rounded bg-amber-400 text-slate-950">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Main Container: Sidebar di Samping + Content Viewport */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Desktop Sidebar di Samping (240px) */}
        <aside className="hidden lg:flex w-60 bg-slate-950 border-r border-slate-800 p-4 flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-3 pb-2 border-b border-slate-800/80">
              Menu Pengelola
            </div>

            <div className="space-y-1.5">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setSelectedBookingDetail(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 text-white font-bold border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-brand-lime' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-amber-400 text-slate-950 font-mono">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
            <div className="font-bold text-slate-300 font-sans">PT Sawah Jaya Trans</div>
            <div className="text-[10px]">Rek: 0113528246</div>
            <div className="text-[10px] text-slate-500">Surabaya &amp; Sidoarjo</div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {/* ========================================================================= */}
          {/* MENU 1: ANALITIK (MENGGANTIKAN OVERVIEW & LAPORAN) */}
          {/* ========================================================================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Analitik &amp; Performa Penjualan
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Statistik pendapatan, performa per model mobil, dan distribusi kota operasional
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadAnalytics}
                  disabled={isLoadingAnalytics}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors min-h-[38px] self-start sm:self-auto cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
                  <span>Segarkan Analitik</span>
                </button>
              </div>

              {stats && (
                <>
                  {/* KPI Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-[11px] font-medium text-slate-400 block">Total Omset Terverifikasi</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-white mt-1 block font-mono tabular-nums">
                        Rp{stats.totalRevenue?.toLocaleString('id-ID')}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800 flex justify-between font-mono">
                        <span>Rental: Rp{stats.rentalRevenue?.toLocaleString('id-ID')}</span>
                        <span>·</span>
                        <span>Taksi: Rp{stats.taxiRevenue?.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-[11px] font-medium text-slate-400 block">Total Pesanan Terdaftar</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-white mt-1 block font-mono tabular-nums">
                        {stats.totalBookings} Pemesanan
                      </span>
                      <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800 flex justify-between">
                        <span>Hari Ini: {stats.todayBookings}</span>
                        <span>·</span>
                        <span>Besok: {stats.tomorrowBookings}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-[11px] font-medium text-slate-400 block">Kesiapan Mobil Listrik</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-brand-lime mt-1 block font-mono tabular-nums">
                        {stats.totalFleet} Unit EV
                      </span>
                      <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800 flex justify-between">
                        <span className="text-emerald-400 font-semibold">{stats.availableFleetNow} Siap Jalan</span>
                        <span>·</span>
                        <span className="text-amber-400">{stats.maintenanceFleet} Perawatan</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-[11px] font-medium text-slate-400 block">Kapasitas Harian Terjaga</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-white mt-1 block font-mono tabular-nums">
                        {stats.availableFleetNow ?? stats.totalFleet} Mobil / Hari
                      </span>
                      <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
                        <span>1 Mobil = 1 Sewa Per Tanggal</span>
                      </div>
                    </div>
                  </div>

                  {/* Analisis Performa Model Mobil & Wilayah */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Model Mobil */}
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                        <span>Armada Resmi Mobil Listrik</span>
                        <span className="text-[10px] text-brand-lime font-mono">100% VinFast EV</span>
                      </h2>
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                          <div className="flex justify-between font-bold text-sm text-white">
                            <span>VinFast VF e34</span>
                            <span className="text-brand-teal font-mono">Spacious Mid-SUV</span>
                          </div>
                          <p className="text-xs text-slate-400">
                            SUV listrik berkapasitas luas dengan kenyamanan ekstra untuk perjalanan bisnis, delegasi, dan rombongan keluarga di Surabaya &amp; Sidoarjo.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Wilayah Operasional */}
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Distribusi Wilayah Layanan
                      </h2>
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                          <div>
                            <strong className="block text-white text-sm">Surabaya</strong>
                            <span className="text-slate-400">Pusat Bisnis &amp; Urban</span>
                          </div>
                          <span className="font-mono font-bold text-brand-lime">Layanan 24 Jam</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                          <div>
                            <strong className="block text-white text-sm">Sidoarjo</strong>
                            <span className="text-slate-400">Area Residensial &amp; Industri</span>
                          </div>
                          <span className="font-mono font-bold text-brand-lime">Layanan 24 Jam</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pengaturan QRIS Toko Resmi */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                          <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded font-mono">
                            QRIS
                          </span>
                          <span>Pengaturan QRIS Resmi PT Sawah Jaya Trans</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Terkoneksi langsung ke rekening resmi 0113528246 tanpa perantara payment gateway luar.
                        </p>
                      </div>
                      {qrisSuccessMsg && (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>{qrisSuccessMsg}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      <div className="w-40 h-40 shrink-0 bg-white rounded-xl p-2 flex items-center justify-center border-2 border-slate-700 shadow-md">
                        <img
                          src={adminQrisUrl}
                          alt="QRIS Toko"
                          className="max-w-full max-h-full object-contain rounded"
                        />
                      </div>

                      <div className="flex-1 space-y-3 text-xs text-slate-300">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <strong className="block font-bold text-white mb-1">Verifikasi Kode Unik Otomatis</strong>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Setiap pemesanan otomatis menambahkan kode unik acak (maksimal Rp200) untuk mempermudah pencocokan mutasi rekening Anda secara manual.
                          </p>
                        </div>
                        <input
                          ref={qrisFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAdminQrisFile}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => qrisFileInputRef.current?.click()}
                          disabled={isUploadingQris}
                          className="px-4 py-2.5 rounded-xl bg-brand-primary text-brand-lime border border-brand-teal hover:bg-brand-primary/80 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          {isUploadingQris ? <Loader2 className="w-4 h-4 animate-spin text-brand-lime" /> : <RefreshCw className="w-4 h-4" />}
                          <span>Unggah / Ganti Gambar QRIS Baru</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* MENU 2: MOBIL (CRUD LENGKAP: TAMBAH, EDIT, HAPUS, KURANGI) */}
          {/* ========================================================================= */}
          {activeTab === 'vehicles' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Manajemen Mobil Listrik
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Model mobil resmi: VinFast VF e34. Unit dapat ditambah, diedit, atau dihapus.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddVehicle}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-lime hover:bg-brand-lime/90 text-slate-950 font-bold text-xs shadow-sm cursor-pointer min-h-[42px]"
                >
                  <Car className="w-4 h-4" />
                  <span>Tambah Mobil Baru</span>
                </button>
              </div>

              {/* Form Tambah / Edit Mobil (Inline Halaman) */}
              {showVehicleForm && (
                <form onSubmit={handleSaveVehicle} className="p-5 rounded-2xl bg-slate-950 border-2 border-brand-teal/50 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-brand-lime">
                      {editingVehicleId ? 'Edit Data Mobil' : 'Pendaftaran Mobil Baru'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowVehicleForm(false)}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Kode Unit *</label>
                      <input
                        type="text"
                        required
                        placeholder="SJT-VFE34-03"
                        value={vehicleFormData.code}
                        onChange={e => setVehicleFormData({ ...vehicleFormData, code: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white min-h-[40px]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Model Mobil *</label>
                      <select
                        value={vehicleFormData.model}
                        onChange={e => setVehicleFormData({ ...vehicleFormData, model: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white min-h-[40px]"
                      >
                        <option value="VinFast VF e34">VinFast VF e34 (Spacious SUV)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Nomor Polisi *</label>
                      <input
                        type="text"
                        required
                        placeholder="L 1826 EV"
                        value={vehicleFormData.plateNumber}
                        onChange={e => setVehicleFormData({ ...vehicleFormData, plateNumber: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white font-mono min-h-[40px]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Kota Layanan *</label>
                      <select
                        value={vehicleFormData.city}
                        onChange={e => setVehicleFormData({ ...vehicleFormData, city: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white min-h-[40px]"
                      >
                        <option value="Surabaya">Surabaya</option>
                        <option value="Sidoarjo">Sidoarjo</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowVehicleForm(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white min-h-[38px] cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-slate-950 bg-brand-lime hover:bg-brand-lime/90 rounded-xl min-h-[38px] cursor-pointer"
                    >
                      {editingVehicleId ? 'Simpan Perubahan' : 'Daftarkan Mobil'}
                    </button>
                  </div>
                </form>
              )}

              {/* Tabel Daftar Mobil dengan Fitur Edit & Hapus Lengkap */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 min-w-[750px]">
                  <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold">
                    <tr>
                      <th className="p-3.5">Kode Unit</th>
                      <th className="p-3.5">Jenis Model Mobil</th>
                      <th className="p-3.5">Nomor Polisi</th>
                      <th className="p-3.5">Kota Operasional</th>
                      <th className="p-3.5">Status Unit</th>
                      <th className="p-3.5 text-right">Aksi Kelola</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {vehicles.map(v => (
                      <tr key={v.id} className="hover:bg-slate-900/40">
                        <td className="p-3.5 font-bold text-white">{v.code}</td>
                        <td className="p-3.5 font-sans">
                          <span className="font-bold text-brand-teal">
                            {v.model}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-white">{v.plate_number}</td>
                        <td className="p-3.5 font-sans">{v.city}</td>
                        <td className="p-3.5 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            v.in_maintenance ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}>
                            {v.in_maintenance ? 'Perawatan / Bengkel' : 'Aktif / Siaga'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-sans">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleMaintenance(v)}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                              title="Ganti status siaga atau perawatan"
                            >
                              {v.in_maintenance ? 'Set Siap' : 'Perawatan'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditVehicle(v)}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer inline-flex items-center gap-1"
                              title="Edit data mobil"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteVehicle(v)}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800/60 font-semibold cursor-pointer inline-flex items-center gap-1"
                              title="Hapus / Kurangi unit mobil"
                            >
                              <Trash2 className="w-3 h-3 text-rose-400" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MENU 3: KALENDER BOOKING (BULANAN + KUOTA UNIT VF e34 / HARI) */}
          {/* ========================================================================= */}
          {activeTab === 'calendar' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Kalender Booking Bulanan
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Kapasitas {dailyCapacity} mobil/hari. Terlihat tanggal mana yang laku dan yang sepi beserta kuota VinFast VF e34.
                  </p>
                </div>

                {/* Kontrol Navigasi Bulan */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    title="Bulan Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="font-bold text-sm text-white px-3 font-mono">
                    {monthNames[calendarMonth]} {calendarYear}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    title="Bulan Berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleJumpToday}
                    className="ml-2 px-3 py-1.5 rounded-xl bg-brand-primary text-brand-lime border border-brand-teal hover:bg-brand-primary/80 text-xs font-bold cursor-pointer"
                  >
                    Hari Ini
                  </button>
                </div>
              </div>

              {/* Legenda Indikator */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span>VinFast VF e34</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Penuh ({dailyCapacity}/{dailyCapacity} Unit)</span>
                  </div>
                </div>
                <div className="font-mono text-[11px] text-slate-400">
                  Total Kapasitas: <strong>{dailyCapacity} Unit EV Per Hari</strong>
                </div>
              </div>

              {/* Grid Kalender Bulanan */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3 sm:p-5">
                {/* Header Hari (Senin - Minggu) */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-xs font-bold text-slate-400 pb-2 border-b border-slate-800">
                  <span>Senin</span>
                  <span>Selasa</span>
                  <span>Rabu</span>
                  <span>Kamis</span>
                  <span>Jumat</span>
                  <span className="text-amber-400">Sabtu</span>
                  <span className="text-rose-400">Minggu</span>
                </div>

                {/* Sel Tanggal */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-2">
                  {calendarDays.map((cell, idx) => {
                    if (!cell.isCurrentMonth) {
                      return <div key={idx} className="min-h-[75px] sm:min-h-[90px] rounded-xl bg-slate-900/20" />;
                    }

                    const isSelected = cell.dateStr === selectedCalendarDate;
                    const isFullyBooked = cell.totalBooked >= dailyCapacity;

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedCalendarDate(cell.dateStr)}
                        className={`min-h-[75px] sm:min-h-[95px] p-1.5 sm:p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-brand-lime bg-slate-800 ring-2 ring-brand-lime/30'
                            : cell.totalBooked > 0
                            ? 'border-slate-700 bg-slate-900/90 hover:bg-slate-800/60'
                            : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold font-mono ${
                            cell.isToday
                              ? 'w-5 h-5 rounded-full bg-brand-lime text-slate-950 flex items-center justify-center font-black'
                              : isSelected ? 'text-brand-lime font-black' : 'text-slate-300'
                          }`}>
                            {cell.dateNumber}
                          </span>

                          {cell.totalBooked > 0 && (
                            <span className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded ${
                              isFullyBooked ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {cell.totalBooked}/{dailyCapacity}
                            </span>
                          )}
                        </div>

                        {/* Rincian Mobil Terisi */}
                        <div className="space-y-1 mt-1">
                          {cell.totalBooked === 0 ? (
                            <span className="text-[9px] text-slate-500 block truncate">{dailyCapacity} Kosong</span>
                          ) : (
                            <>
                              {cell.vfe34Count > 0 && (
                                <div className="text-[9px] font-bold text-cyan-400 bg-slate-950/80 px-1 py-0.5 rounded truncate border border-cyan-800/40">
                                  e34: {cell.vfe34Count}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rincian Pemesanan Tanggal Terpilih di Kalender (Inline Bawah) */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-lime" />
                      <span>Rincian Tanggal: {selectedCalendarDate}</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedDateBookings.length} dari {dailyCapacity} unit mobil telah terpesan pada tanggal ini
                    </p>
                  </div>
                  <div className="text-xs font-mono text-slate-300">
                    Sisa Unit Tersedia: <strong className="text-brand-lime">{Math.max(0, dailyCapacity - selectedDateBookings.length)} Unit</strong>
                  </div>
                </div>

                {selectedDateBookings.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    Belum ada penyewaan pada tanggal ini. Seluruh {dailyCapacity} armada VinFast VF e34 dalam posisi siap jalan.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedDateBookings.map(b => (
                      <div
                        key={b.id}
                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-mono font-bold text-white">{b.booking_number}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            b.booking_status === 'confirmed' || b.payment_status === 'paid'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {b.booking_status === 'confirmed' ? 'Lunas / Terkonfirmasi' : 'Menunggu Konfirmasi'}
                          </span>
                        </div>
                        <div>
                          <strong className="text-slate-100 block text-sm">{b.customer_name}</strong>
                          <span className="text-[11px] font-mono text-brand-lime">{b.customer_phone}</span>
                        </div>
                        <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-800/80">
                          <span>{b.vehicle_model} · Mulai {b.booking_time} WIB</span>
                          <strong className="block text-white font-mono mt-0.5">
                            Rp{b.total_amount?.toLocaleString('id-ID')}
                          </strong>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBookingDetail(b);
                              setActiveTab('bookings');
                            }}
                            className="text-[10px] text-brand-lime font-bold hover:underline"
                          >
                            Buka Detail &amp; Dispatch →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MENU 4: DATA PEMESANAN (DISPATCH DRIVER & BUKTI TERINTEGRASI) */}
          {/* ========================================================================= */}
          {activeTab === 'bookings' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Data Pemesanan &amp; Verifikasi Transaksi
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Data pesanan masuk, konfirmasi pembayaran manual admin, follow-up WhatsApp, dan detail tugas driver
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer min-h-[42px] self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor CSV</span>
                </button>
              </div>

              {/* Panel Detail & Dispatch Driver Pelanggan (Inline Halaman) */}
              {selectedBookingDetail && (
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border-2 border-brand-teal/50 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-brand-lime" />
                      <h2 className="text-sm sm:text-base font-bold text-white">
                        Detail Pemesanan: {selectedBookingDetail.customer_name} ({selectedBookingDetail.booking_number})
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedBookingDetail(null)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                    >
                      Tutup Detail
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Kolom 1: Informasi Pelanggan & Booking */}
                    <div className="space-y-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-800">
                        Data Pelanggan &amp; Rute
                      </span>
                      <div className="space-y-2">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Nama Lengkap:</span>
                          <strong className="text-white text-sm">{selectedBookingDetail.customer_name}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Nomor WhatsApp:</span>
                          <span className="font-mono text-brand-lime font-bold">{selectedBookingDetail.customer_phone}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Alamat Penjemputan:</span>
                          <span className="text-slate-200 leading-relaxed block">{selectedBookingDetail.pickup_address}</span>
                        </div>
                        {selectedBookingDetail.notes && (
                          <div>
                            <span className="text-slate-400 block text-[10px]">Keterangan / Patokan:</span>
                            <span className="text-slate-300 italic">{selectedBookingDetail.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Kolom 2: Dispatch Driver H-1 (Sesuai Permintaan Poin 8) */}
                    <div className="space-y-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-brand-lime block pb-1 border-b border-slate-800 flex items-center justify-between">
                        <span>Dispatcher Driver (H-1)</span>
                        <UserCheck className="w-3.5 h-3.5 text-brand-lime" />
                      </span>
                      <div className="space-y-2">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Driver Bertugas:</span>
                          <strong className="text-white">
                            {selectedBookingDetail.assigned_driver_name || 'Driver Siaga Surabaya EV Rent'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Armada Kendaraan:</span>
                          <span className="font-mono text-slate-200">
                            {selectedBookingDetail.vehicle_model || 'VinFast VF e34'} ({selectedBookingDetail.plate_number || 'L 1855 EV'})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Jadwal Penjemputan:</span>
                          <span className="text-slate-200 font-mono">
                            {selectedBookingDetail.booking_date} · {selectedBookingDetail.booking_time} WIB
                          </span>
                        </div>
                        <div className="pt-2 border-t border-slate-800">
                          <span className="text-slate-400 block text-[10px] mb-1">Status Kesiapan Pengemudi:</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            ✓ Siap Bertugas &amp; Telah Dijadwalkan
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Kolom 3: Bukti Transfer & Konfirmasi */}
                    <div className="space-y-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-800">
                        Tagihan &amp; Bukti Transfer
                      </span>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Total Tagihan:</span>
                        <span className="font-mono font-bold text-brand-lime">
                          Rp{selectedBookingDetail.total_amount?.toLocaleString('id-ID')}
                        </span>
                      </div>
                      {selectedBookingDetail.unique_code && (
                        <div className="text-[11px] text-slate-400 font-mono">
                          Termasuk kode unik transfer: +Rp{selectedBookingDetail.unique_code}
                        </div>
                      )}

                      {selectedBookingDetail.proof_image_url ? (
                        <div className="space-y-2 pt-2">
                          <span className="text-[10px] text-slate-400 block">Foto Bukti Transfer:</span>
                          <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800 max-h-48 overflow-auto flex items-center justify-center">
                            <img
                              src={selectedBookingDetail.proof_image_url}
                              alt="Bukti Transfer"
                              className="max-h-44 object-contain rounded"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-950 rounded-lg text-slate-500 italic text-[11px]">
                          Pelanggan belum mengunggah foto bukti transfer.
                        </div>
                      )}

                      <div className="pt-2 space-y-2">
                        {selectedBookingDetail.booking_status !== 'confirmed' && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await api.confirmAdminBookingPayment(adminPin, selectedBookingDetail.id);
                                setSelectedBookingDetail(null);
                                loadBookings();
                              } catch (err: any) {
                                alert(err.message || 'Gagal konfirmasi');
                              }
                            }}
                            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Konfirmasi Pembayaran Manual</span>
                          </button>
                        )}

                        <a
                          href={`https://wa.me/${(selectedBookingDetail.customer_phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Halo Kak ${selectedBookingDetail.customer_name}, pesanan No. Booking ${selectedBookingDetail.booking_number} mobil ${selectedBookingDetail.vehicle_model} tanggal ${selectedBookingDetail.booking_date} sebesar Rp${selectedBookingDetail.total_amount?.toLocaleString('id-ID')} telah dikonfirmasi OK oleh Admin Surabaya EV Rent. Terima kasih!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4 text-emerald-400" />
                          <span>Follow-up WhatsApp Pelanggan</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Filter Bar */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row flex-wrap gap-2 text-xs">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari No. Booking / Nama Pelanggan..."
                    value={bookingSearch}
                    onChange={e => setBookingSearch(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white min-h-[40px] focus:outline-none focus:border-brand-teal"
                  />
                </div>
                <select
                  value={bookingFilterCity}
                  onChange={e => setBookingFilterCity(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white min-h-[40px]"
                >
                  <option value="">Semua Kota</option>
                  <option value="Surabaya">Surabaya</option>
                  <option value="Sidoarjo">Sidoarjo</option>
                </select>
                <select
                  value={bookingFilterService}
                  onChange={e => setBookingFilterService(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white min-h-[40px]"
                >
                  <option value="">Semua Layanan</option>
                  <option value="rental">Rental Listrik</option>
                  <option value="taxi">Taksi Listrik</option>
                </select>
                <button
                  type="button"
                  onClick={loadBookings}
                  className="px-5 py-2 bg-brand-primary text-brand-lime border border-brand-teal hover:bg-brand-primary/80 rounded-xl font-bold min-h-[40px] flex items-center justify-center cursor-pointer transition-colors"
                >
                  Terapkan Filter
                </button>
              </div>

              {/* Tabel Pemesanan Lengkap */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 min-w-[880px]">
                  <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold">
                    <tr>
                      <th className="p-3.5">No. Booking</th>
                      <th className="p-3.5">Layanan &amp; Kota</th>
                      <th className="p-3.5">Pelanggan</th>
                      <th className="p-3.5">Jadwal</th>
                      <th className="p-3.5">Kode Unik</th>
                      <th className="p-3.5">Bukti Bayar</th>
                      <th className="p-3.5">Total Tagihan</th>
                      <th className="p-3.5">Status Pembayaran</th>
                      <th className="p-3.5 text-right">Aksi Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {bookings.map(b => {
                      const isConfirmed = b.booking_status === 'confirmed' || Boolean(b.admin_confirmed_at);
                      const waLink = `https://wa.me/${(b.customer_phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Halo Kak ${b.customer_name}, pesanan rental mobil listrik Anda dengan No. Booking ${b.booking_number} sebesar Rp${b.total_amount?.toLocaleString('id-ID')} telah diverifikasi oleh Admin Surabaya EV Rent. Terima kasih!`
                      )}`;

                      return (
                        <tr key={b.id} className="hover:bg-slate-900/40">
                          <td className="p-3.5 font-mono font-bold text-white">{b.booking_number}</td>
                          <td className="p-3.5 capitalize">{b.service_type} ({b.city})</td>
                          <td className="p-3.5">
                            <strong className="text-white block truncate">{b.customer_name}</strong>
                            <span className="text-[10px] text-slate-400 font-mono">{b.customer_phone}</span>
                          </td>
                          <td className="p-3.5 font-mono text-[11px]">
                            <span>{b.booking_date}</span>
                            <span className="text-slate-400 block">{b.booking_time} WIB</span>
                          </td>
                          <td className="p-3.5 font-mono text-brand-lime font-bold">
                            {b.unique_code ? `+Rp${b.unique_code}` : '-'}
                          </td>
                          <td className="p-3.5">
                            {b.proof_image_url ? (
                              <button
                                type="button"
                                onClick={() => setSelectedBookingDetail(b)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 border border-slate-700 cursor-pointer transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-brand-lime" />
                                <span>Lihat Bukti</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic">Tanpa Bukti</span>
                            )}
                          </td>
                          <td className="p-3.5 font-mono font-bold text-white">
                            Rp{b.total_amount?.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isConfirmed
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : b.proof_image_url || b.payment_status === 'waiting_verification'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}>
                              {isConfirmed
                                ? 'Lunas (Terkonfirmasi)'
                                : b.proof_image_url || b.payment_status === 'waiting_verification'
                                ? 'Menunggu Konfirmasi'
                                : b.payment_status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setSelectedBookingDetail(b)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] cursor-pointer"
                                title="Buka Detail Pesanan & Dispatch Driver"
                              >
                                Detail
                              </button>

                              {!isConfirmed && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await api.confirmAdminBookingPayment(adminPin, b.id);
                                      loadBookings();
                                    } catch (err: any) {
                                      alert(err.message || 'Gagal');
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                                >
                                  Konfirmasi
                                </button>
                              )}

                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-[11px] inline-flex items-center gap-1"
                                title="Kirim Pesan WhatsApp"
                              >
                                <span>WA</span>
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MENU 5: PENGATURAN TARIF */}
          {/* ========================================================================= */}
          {activeTab === 'pricing' && (
            <div className="space-y-6 max-w-6xl">
              <div className="pb-4 border-b border-slate-800">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Pengaturan Tarif Rental Mobil Listrik
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Penyesuaian harga sewa VinFast VF e34 untuk wilayah Surabaya &amp; Sidoarjo
                </p>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 min-w-[650px]">
                  <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold">
                    <tr>
                      <th className="p-3.5">Model Kendaraan</th>
                      <th className="p-3.5">Kota Layanan</th>
                      <th className="p-3.5">Durasi Sewa</th>
                      <th className="p-3.5">Batas Jarak</th>
                      <th className="p-3.5">Tarif Saat Ini</th>
                      <th className="p-3.5 text-right">Aksi Penyesuaian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {pricingList.map(p => (
                      <tr key={p.id} className="hover:bg-slate-900/40">
                        <td className="p-3.5 font-bold font-sans text-white">{p.vehicle_model}</td>
                        <td className="p-3.5 font-sans">{p.city}</td>
                        <td className="p-3.5">{p.duration_hours} Jam</td>
                        <td className="p-3.5">{p.km_limit} km</td>
                        <td className="p-3.5">
                          {editPriceId === p.id ? (
                            <input
                              type="number"
                              value={editPriceValue}
                              onChange={e => setEditPriceValue(Number(e.target.value))}
                              className="w-32 px-2.5 py-1.5 text-xs rounded-lg border border-slate-600 bg-slate-900 text-white font-bold"
                            />
                          ) : (
                            <strong className="text-brand-lime">
                              Rp{p.price.toLocaleString('id-ID')}
                            </strong>
                          )}
                        </td>
                        <td className="p-3.5 text-right font-sans">
                          {editPriceId === p.id ? (
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSavePrice(p.id)}
                                className="px-3 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold min-h-[30px] cursor-pointer"
                              >
                                Simpan
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditPriceId(null)}
                                className="px-3 py-1 text-[11px] bg-slate-800 text-slate-300 rounded-lg min-h-[30px] cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setEditPriceId(p.id);
                                setEditPriceValue(p.price);
                              }}
                              className="text-[11px] text-brand-lime font-bold hover:underline px-2.5 py-1 min-h-[32px] cursor-pointer"
                            >
                              Ubah Tarif
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
