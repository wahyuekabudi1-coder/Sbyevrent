import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, LayoutDashboard, Car, Users, Calendar, FileText,
  Settings, TrendingUp, Plus, ArrowLeft, RefreshCw, Download, Clock,
  QrCode, Upload, Eye, X, CheckCircle2, FileImage, Loader2
} from 'lucide-react';
import { api } from '../lib/api';
import { Logo } from '../components/Logo';

interface AdminDashboardProps {
  onBackHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackHome }) => {
  const [adminPin, setAdminPin] = useState('admin2026');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'fleet' | 'drivers' | 'calendar' | 'bookings' | 'dispatch' | 'pricing' | 'reports'
  >('overview');

  // Overview Data & QRIS Management
  const [stats, setStats] = useState<any>(null);
  const [adminQrisUrl, setAdminQrisUrl] = useState<string>('/assets/qris-official.svg');
  const [isUploadingQris, setIsUploadingQris] = useState<boolean>(false);
  const [qrisSuccessMsg, setQrisSuccessMsg] = useState<string | null>(null);
  const [proofModalImage, setProofModalImage] = useState<string | null>(null);
  const qrisFileInputRef = useRef<HTMLInputElement>(null);

  // Fleet Data
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    code: '',
    model: 'VinFast VF 5',
    plateNumber: '',
    city: 'Surabaya',
    inMaintenance: false,
    notes: ''
  });

  // Drivers Data
  const [drivers, setDrivers] = useState<any[]>([]);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    idCardNumber: '',
    notes: ''
  });

  // Calendar Data
  const [calendarDate, setCalendarDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [calendarData, setCalendarData] = useState<any>(null);

  // Bookings Data
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilterCity, setBookingFilterCity] = useState('');
  const [bookingFilterService, setBookingFilterService] = useState('');

  // Dispatch Data
  const [dispatches, setDispatches] = useState<any[]>([]);

  // Pricing Data
  const [pricingList, setPricingList] = useState<any[]>([]);
  const [editPriceId, setEditPriceId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<number>(0);

  // Reports Data
  const [reportData, setReportData] = useState<any>(null);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const data = await api.getAdminOverview(adminPin);
      setStats(data);
      setIsAuthenticated(true);
    } catch (err: any) {
      setAuthError('PIN Admin tidak valid. Default: admin2026');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'overview') loadOverview();
      if (activeTab === 'fleet') loadFleet();
      if (activeTab === 'drivers') loadDrivers();
      if (activeTab === 'calendar') loadCalendar(calendarDate);
      if (activeTab === 'bookings') loadBookings();
      if (activeTab === 'dispatch') loadDispatch();
      if (activeTab === 'pricing') loadPricing();
      if (activeTab === 'reports') loadReports();
    }
  }, [isAuthenticated, activeTab]);

  const loadOverview = async () => {
    try {
      const s = await api.getAdminOverview(adminPin);
      setStats(s);
      const settings = await api.getSettings();
      if (settings?.qris_image_url) {
        setAdminQrisUrl(settings.qris_image_url);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdminQrisFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar (JPG, PNG, WebP, SVG).');
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
        setQrisSuccessMsg('Gambar QRIS Toko resmi berhasil disimpan dan langsung aktif di sistem checkout.');
        setTimeout(() => setQrisSuccessMsg(null), 4000);
      } catch (err: any) {
        alert(err.message || 'Gagal menyimpan QRIS.');
      } finally {
        setIsUploadingQris(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const loadFleet = async () => {
    try {
      const data = await api.getAdminVehicles(adminPin);
      setVehicles(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDrivers = async () => {
    try {
      const data = await api.getAdminDrivers(adminPin);
      setDrivers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadCalendar = async (d: string) => {
    try {
      const data = await api.getAdminCalendar(adminPin, d);
      setCalendarData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadBookings = async () => {
    try {
      const data = await api.getAdminBookings(adminPin, {
        search: bookingSearch,
        city: bookingFilterCity,
        service: bookingFilterService
      });
      setBookings(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDispatch = async () => {
    try {
      const data = await api.getAdminDispatches(adminPin);
      setDispatches(data);
    } catch (e) {
      console.error(e);
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

  const loadReports = async () => {
    try {
      const data = await api.getAdminReports(adminPin);
      setReportData(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Add Vehicle Handler
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addAdminVehicle(adminPin, newVehicle);
      setShowAddVehicle(false);
      setNewVehicle({
        code: '',
        model: 'VinFast VF 5',
        plateNumber: '',
        city: 'Surabaya',
        inMaintenance: false,
        notes: ''
      });
      loadFleet();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Toggle Vehicle Maintenance
  const handleToggleMaintenance = async (v: any) => {
    try {
      await api.updateAdminVehicle(adminPin, v.id, {
        ...v,
        inMaintenance: !v.in_maintenance
      });
      loadFleet();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Add Driver Handler
  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addAdminDriver(adminPin, newDriver);
      setShowAddDriver(false);
      setNewDriver({ name: '', phone: '', idCardNumber: '', notes: '' });
      loadDrivers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Update Price
  const handleSavePrice = async (id: string) => {
    try {
      await api.updatePricing(adminPin, id, editPriceValue);
      setEditPriceId(null);
      loadPricing();
    } catch (err: any) {
      alert(err.message);
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
      b.customer_name,
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

  const navModules = [
    { id: 'overview', label: '1. Overview', fullLabel: '1. Dashboard Overview', icon: LayoutDashboard },
    { id: 'fleet', label: '2. Armada', fullLabel: '2. Manajemen Armada', icon: Car },
    { id: 'drivers', label: '3. Driver', fullLabel: '3. Manajemen Driver', icon: Users },
    { id: 'calendar', label: '4. Kalender', fullLabel: '4. Kalender Booking', icon: Calendar },
    { id: 'bookings', label: '5. Pemesanan', fullLabel: '5. Data Pemesanan', icon: FileText },
    { id: 'dispatch', label: '6. Dispatch H-1', fullLabel: '6. Konfirmasi Driver (H-1)', icon: Clock },
    { id: 'pricing', label: '7. Harga', fullLabel: '7. Pengaturan Harga', icon: Settings },
    { id: 'reports', label: '8. Laporan', fullLabel: '8. Laporan & Ekspor', icon: TrendingUp },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <Logo className="h-16 sm:h-20" showSubtitle={false} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Portal Pengelola</h2>
              <p className="text-xs text-slate-500">
                Surabaya EV Rent (Powered by Smart Journey)
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                PIN Keamanan Admin (Default: admin2026)
              </label>
              <input
                type="password"
                required
                value={adminPin}
                onChange={e => setAdminPin(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal text-slate-900 min-h-[44px]"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs cursor-pointer min-h-[44px]"
            >
              Masuk Dashboard Admin
            </button>
          </form>

          <button
            onClick={onBackHome}
            className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer py-2 min-h-[44px] flex items-center justify-center"
          >
            ← Kembali ke Website Publik
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Navbar */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            onClick={onBackHome}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white shrink-0 py-1.5 px-2 rounded-lg hover:bg-slate-800 min-h-[38px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Web Publik</span>
          </button>
          <div className="flex items-center gap-2 truncate">
            <Logo className="h-10 sm:h-12" showSubtitle={false} lightMode={true} />
            <span className="text-[9px] sm:text-[10px] bg-brand-primary text-brand-lime border border-brand-teal/30 px-1.5 py-0.5 rounded font-mono shrink-0">
              Admin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-2.5 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors font-semibold"
          >
            Keluar
          </button>
        </div>
      </header>

      {/* Mobile/Tablet Horizontal Module Switcher (<1024px) */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-3 py-2 overflow-x-auto responsive-table-container flex gap-1.5 sticky top-12 sm:top-14 z-20 shadow-xs">
        {navModules.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                isActive
                  ? 'bg-brand-teal text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Desktop Sidebar Nav (1024px+) */}
        <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 p-4 space-y-1 shrink-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
            Modul Operasional
          </div>

          {navModules.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'bg-brand-mint text-brand-teal'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-teal' : 'text-slate-500'}`} />
                <span>{item.fullLabel}</span>
              </button>
            );
          })}
        </aside>

        {/* Main Content View */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto w-full max-w-full">
          
          {/* MODUL 1: DASHBOARD OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Dashboard Overview</h2>
                  <p className="text-xs text-slate-500">Ringkasan operasional dan status armada terkini</p>
                </div>
                <button
                  onClick={loadOverview}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 self-start sm:self-auto min-h-[38px]"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Segarkan Data
                </button>
              </div>

              {stats && (
                <>
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-[11px] text-slate-500 block font-medium">Total Pendapatan Terverifikasi</span>
                    <span className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 block truncate">
                      Rp{stats.totalRevenue?.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                      Rental: Rp{stats.rentalRevenue?.toLocaleString('id-ID')} · Taksi: Rp{stats.taxiRevenue?.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-[11px] text-slate-500 block font-medium">Total Booking Terdaftar</span>
                    <span className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 block">
                      {stats.totalBookings} Pesanan
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Hari ini: {stats.todayBookings} · Besok: {stats.tomorrowBookings}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-[11px] text-slate-500 block font-medium">Kondisi Armada Kendaraan</span>
                    <span className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 block">
                      {stats.totalFleet} Unit
                    </span>
                    <span className="text-[10px] text-brand-teal font-semibold block mt-1">
                      {stats.availableFleetNow} Siap Jalan · {stats.maintenanceFleet} Perawatan
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-[11px] text-slate-500 block font-medium">Jadwal Tugas Besok (H-1)</span>
                    <span className="text-lg sm:text-xl font-black text-brand-teal mt-0.5 block">
                      {stats.tomorrowTrips?.length || 0} Tugas
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Memerlukan konfirmasi driver malam ini
                    </span>
                  </div>
                </div>

                {/* Kartu Manajemen QRIS Resmi Toko */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">QRIS</span>
                        <span>Pengaturan &amp; Unggah QRIS Resmi Toko</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Upload QRIS asli Anda agar pelanggan langsung scan &amp; transfer saat booking sewa mobil listrik tanpa menunggu approval gateway.
                      </p>
                    </div>
                    {qrisSuccessMsg && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{qrisSuccessMsg}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    {/* Preview Box QRIS */}
                    <div className="w-40 h-40 sm:w-44 sm:h-44 shrink-0 bg-slate-50 rounded-xl border-2 border-slate-200 p-2 flex items-center justify-center shadow-2xs">
                      <img
                        src={adminQrisUrl}
                        alt="QRIS Aktif"
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    </div>

                    <div className="flex-1 space-y-3 text-xs text-slate-600">
                      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 space-y-1">
                        <strong className="block font-bold">QRIS Langsung Aktif Real-Time</strong>
                        <p className="text-[11px] leading-relaxed">
                          Tidak perlu menunggu persetujuan merchant pihak ketiga yang memakan waktu lama. Gambar QRIS yang Anda unggah langsung ditampilkan kepada pelanggan di layar pemesanan lengkap dengan verifikasi kode unik nominal transfer.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
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
                          className="px-4 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-xs disabled:opacity-50 min-h-[42px]"
                        >
                          {isUploadingQris ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          <span>Unggah / Ganti Gambar QRIS Asli</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            </div>
          )}

          {/* MODUL 2: MANAJEMEN ARMADA */}
          {activeTab === 'fleet' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Manajemen Armada Kendaraan</h2>
                  <p className="text-xs text-slate-500">
                    Kelola data armada VinFast VF 5 dan VF e34 secara dinamis
                  </p>
                </div>
                <button
                  onClick={() => setShowAddVehicle(!showAddVehicle)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-bold text-xs shadow-xs cursor-pointer min-h-[44px]"
                >
                  <Plus className="w-4 h-4" /> Tambah Armada Baru
                </button>
              </div>

              {/* Form Tambah Armada */}
              {showAddVehicle && (
                <form onSubmit={handleAddVehicle} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Form Pendaftaran Armada Listrik Baru
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Kode Kendaraan *</label>
                      <input
                        type="text"
                        required
                        placeholder="SJT-VF5-04"
                        value={newVehicle.code}
                        onChange={e => setNewVehicle({ ...newVehicle, code: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 min-h-[40px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Model *</label>
                      <select
                        value={newVehicle.model}
                        onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white min-h-[40px]"
                      >
                        <option value="VinFast VF 5">VinFast VF 5</option>
                        <option value="VinFast VF e34">VinFast VF e34</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Nomor Polisi *</label>
                      <input
                        type="text"
                        required
                        placeholder="L 1826 EV"
                        value={newVehicle.plateNumber}
                        onChange={e => setNewVehicle({ ...newVehicle, plateNumber: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 min-h-[40px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Kota Operasional *</label>
                      <select
                        value={newVehicle.city}
                        onChange={e => setNewVehicle({ ...newVehicle, city: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white min-h-[40px]"
                      >
                        <option value="Surabaya">Surabaya</option>
                        <option value="Sidoarjo">Sidoarjo</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddVehicle(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 min-h-[40px]"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-brand-teal hover:bg-brand-teal-hover rounded-xl min-h-[40px]"
                    >
                      Simpan Armada
                    </button>
                  </div>
                </form>
              )}

              {/* Tabel Armada Responsive */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs responsive-table-container">
                <table className="w-full text-left text-xs text-slate-700 min-w-[640px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <tr>
                      <th className="p-3">Kode</th>
                      <th className="p-3">Model</th>
                      <th className="p-3">Plat Nomor (Rahasia)</th>
                      <th className="p-3">Kota</th>
                      <th className="p-3">Driver Tetap</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vehicles.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-900">{v.code}</td>
                        <td className="p-3 font-semibold">{v.model}</td>
                        <td className="p-3 font-mono text-brand-teal font-bold">{v.plate_number}</td>
                        <td className="p-3">{v.city}</td>
                        <td className="p-3 text-slate-600">{v.dedicated_driver_name || '-'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            v.in_maintenance ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {v.in_maintenance ? 'Perawatan' : 'Aktif / Siaga'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleToggleMaintenance(v)}
                            className="text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold min-h-[32px]"
                          >
                            {v.in_maintenance ? 'Set Siaga' : 'Set Perawatan'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODUL 3: MANAJEMEN DRIVER */}
          {activeTab === 'drivers' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Manajemen Driver Resmi</h2>
                  <p className="text-xs text-slate-500">Kelola profil dan kontak driver Surabaya EV Rent</p>
                </div>
                <button
                  onClick={() => setShowAddDriver(!showAddDriver)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-bold text-xs shadow-xs cursor-pointer min-h-[44px]"
                >
                  <Plus className="w-4 h-4" /> Daftarkan Driver Baru
                </button>
              </div>

              {showAddDriver && (
                <form onSubmit={handleAddDriver} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Form Pendaftaran Driver
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Nama Lengkap *</label>
                      <input
                        type="text"
                        required
                        placeholder="Bambang Supriyadi"
                        value={newDriver.name}
                        onChange={e => setNewDriver({ ...newDriver, name: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 min-h-[40px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Nomor WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        placeholder="081234567899"
                        value={newDriver.phone}
                        onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 min-h-[40px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">No. KTP</label>
                      <input
                        type="text"
                        placeholder="357801..."
                        value={newDriver.idCardNumber}
                        onChange={e => setNewDriver({ ...newDriver, idCardNumber: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 min-h-[40px]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddDriver(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 min-h-[40px]"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-brand-teal hover:bg-brand-teal-hover rounded-xl min-h-[40px]"
                    >
                      Simpan Driver
                    </button>
                  </div>
                </form>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs responsive-table-container">
                <table className="w-full text-left text-xs text-slate-700 min-w-[560px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <tr>
                      <th className="p-3">Nama Driver</th>
                      <th className="p-3">Nomor WhatsApp</th>
                      <th className="p-3">Kendaraan Ditugaskan</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {drivers.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900">{d.name}</td>
                        <td className="p-3 font-mono font-semibold">{d.phone}</td>
                        <td className="p-3">{d.assigned_vehicle_model || 'Belum ditautkan'} ({d.assigned_vehicle_plate || '-'})</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Aktif
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODUL 4: KALENDER BOOKING */}
          {activeTab === 'calendar' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Kalender Ketersediaan &amp; Booking</h2>
                  <p className="text-xs text-slate-500">
                    1 kendaraan rental hanya menerima 1 booking per tanggal (Aturan Baku)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">Tanggal:</label>
                  <input
                    type="date"
                    value={calendarDate}
                    onChange={e => {
                      setCalendarDate(e.target.value);
                      loadCalendar(e.target.value);
                    }}
                    className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white min-h-[40px]"
                  />
                </div>
              </div>

              {calendarData && (
                <div className="space-y-4">
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                    <div>
                      Tanggal Ditinjau: <strong>{calendarData.date}</strong>
                    </div>
                    <div className="flex flex-wrap gap-3 sm:gap-4 font-semibold">
                      <span>Total: <strong>{calendarData.totalFleet}</strong></span>
                      <span className="text-rose-700">Dipesan: <strong>{calendarData.bookedCount}</strong></span>
                      <span className="text-emerald-700">Tersedia: <strong>{calendarData.availableCount}</strong></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {calendarData.fleet.map((veh: any) => (
                      <div
                        key={veh.id}
                        className={`p-4 rounded-2xl border bg-white shadow-xs space-y-2 ${
                          veh.isBooked ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-slate-900">{veh.code}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            veh.statusLabel === 'Dipesan'
                              ? 'bg-amber-100 text-amber-800'
                              : veh.statusLabel === 'Perawatan'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {veh.statusLabel}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-800">{veh.model}</div>
                        <div className="text-[11px] text-slate-500">
                          Plat: <span className="font-mono font-bold text-slate-700">{veh.plate_number}</span> · {veh.city}
                        </div>
                        {veh.booking && (
                          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] space-y-0.5">
                            <span className="text-slate-500 block">Penyewa:</span>
                            <strong className="text-slate-900 block truncate">{veh.booking.customer_name}</strong>
                            <span className="text-slate-600 block">{veh.booking.duration_hours} Jam · {veh.booking.booking_time} WIB</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODUL 5: DATA PEMESANAN */}
          {activeTab === 'bookings' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Manajemen Semua Pemesanan</h2>
                  <p className="text-xs text-slate-500">Pencarian, filter, dan monitoring status pemesanan</p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs cursor-pointer min-h-[44px] self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5" /> Ekspor CSV
                </button>
              </div>

              {/* Filter Bar */}
              <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row flex-wrap gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Cari No. Booking / Nama..."
                  value={bookingSearch}
                  onChange={e => setBookingSearch(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 w-full sm:w-64 min-h-[40px]"
                />
                <select
                  value={bookingFilterCity}
                  onChange={e => setBookingFilterCity(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white min-h-[40px]"
                >
                  <option value="">Semua Kota</option>
                  <option value="Surabaya">Surabaya</option>
                  <option value="Sidoarjo">Sidoarjo</option>
                </select>
                <select
                  value={bookingFilterService}
                  onChange={e => setBookingFilterService(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white min-h-[40px]"
                >
                  <option value="">Semua Layanan</option>
                  <option value="rental">Rental Mobil Listrik</option>
                  <option value="taxi">Taksi Listrik</option>
                </select>
                <button
                  onClick={loadBookings}
                  className="px-5 py-2 bg-brand-teal hover:bg-brand-teal-hover text-white rounded-xl font-bold min-h-[40px] flex items-center justify-center cursor-pointer"
                >
                  Terapkan Filter
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs responsive-table-container">
                <table className="w-full text-left text-xs text-slate-700 min-w-[850px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <tr>
                      <th className="p-3">No. Booking</th>
                      <th className="p-3">Layanan &amp; Kota</th>
                      <th className="p-3">Pelanggan</th>
                      <th className="p-3">Jadwal</th>
                      <th className="p-3">Kode Unik</th>
                      <th className="p-3">Bukti Transfer</th>
                      <th className="p-3">Total Tagihan</th>
                      <th className="p-3">Pembayaran</th>
                      <th className="p-3">Konfirmasi Admin &amp; Follow Up</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map(b => {
                      const isConfirmed = b.booking_status === 'confirmed' || Boolean(b.admin_confirmed_at);
                      const waText = encodeURIComponent(
                        `Halo Kak ${b.customer_name}, pembayaran rental mobil listrik ${b.vehicle_model || 'VinFast'} untuk jadwal tanggal ${b.booking_date} (No. Booking: ${b.booking_number}) sebesar Rp${b.total_amount?.toLocaleString('id-ID')} telah diverifikasi OK oleh Admin Surabaya EV Rent. Unit armada dan driver profesional resmi telah dijadwalkan untuk penjemputan Anda. Terima kasih!`
                      );
                      const waLink = `https://wa.me/${(b.customer_phone || '').replace(/[^0-9]/g, '')}?text=${waText}`;

                      return (
                        <tr key={b.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono font-bold text-slate-900">{b.booking_number}</td>
                          <td className="p-3 capitalize">{b.service_type} ({b.city})</td>
                          <td className="p-3">
                            <strong className="text-slate-900 block truncate">{b.customer_name}</strong>
                            <span className="text-[10px] text-slate-500 font-mono">{b.customer_phone}</span>
                          </td>
                          <td className="p-3">
                            <span>{b.booking_date}</span>
                            <span className="text-[10px] text-slate-500 block">{b.booking_time} WIB</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-brand-teal">
                            {b.unique_code ? `+Rp${b.unique_code}` : '-'}
                          </td>
                          <td className="p-3">
                            {b.proof_image_url ? (
                              <button
                                type="button"
                                onClick={() => setProofModalImage(b.proof_image_url)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-brand-mint border border-brand-teal/30 hover:bg-brand-teal hover:text-white text-[10px] font-bold text-brand-primary cursor-pointer transition-colors shadow-2xs"
                                title="Klik untuk melihat bukti transfer pelanggan"
                              >
                                <Eye className="w-3 h-3 text-brand-teal" />
                                <span>Lihat Bukti</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Tanpa Upload</span>
                            )}
                          </td>
                          <td className="p-3 font-bold text-slate-900">
                            Rp{b.total_amount?.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              b.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {b.payment_status === 'paid' ? 'Lunas' : b.payment_status}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {!isConfirmed ? (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await api.confirmAdminBookingPayment(adminPin, b.id);
                                      loadBookings();
                                    } catch (err: any) {
                                      alert(err.message || 'Gagal mengonfirmasi');
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-2xs"
                                >
                                  Konfirmasi Pembayaran
                                </button>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  ✓ Terkonfirmasi OK
                                </span>
                              )}

                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                                title="Follow Up ke WhatsApp Customer"
                              >
                                <span>Follow Up WA</span>
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

          {/* MODUL 6: KONFIRMASI DRIVER (H-1) */}
          {activeTab === 'dispatch' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Konfirmasi Driver (H-1 Malam)</h2>
                  <p className="text-xs text-slate-500">
                    Inspeksi kesiapan driver sebelum membuka identitas &amp; nomor polisi ke pelanggan
                  </p>
                </div>
                <button
                  onClick={loadDispatch}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 min-h-[38px] self-start sm:self-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Segarkan Jadwal
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs responsive-table-container">
                <table className="w-full text-left text-xs text-slate-700 min-w-[680px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <tr>
                      <th className="p-3">Jam</th>
                      <th className="p-3">No. Booking</th>
                      <th className="p-3">Pelanggan</th>
                      <th className="p-3">Titik Jemput</th>
                      <th className="p-3">Kendaraan</th>
                      <th className="p-3">Driver</th>
                      <th className="p-3">Status Kesiapan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dispatches.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          Tidak ada pesanan besok yang memerlukan konfirmasi saat ini.
                        </td>
                      </tr>
                    ) : (
                      dispatches.map(d => (
                        <tr key={d.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900">{d.booking_time} WIB</td>
                          <td className="p-3 font-mono">{d.booking_number}</td>
                          <td className="p-3">{d.customer_name}</td>
                          <td className="p-3 max-w-xs truncate">{d.pickup_address}</td>
                          <td className="p-3 font-mono">{d.vehicle_model} ({d.plate_number})</td>
                          <td className="p-3 font-semibold">{d.driver_name || 'Belum ditugaskan'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              d.driver_status === 'ready'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {d.driver_status === 'ready' ? 'Siap Bertugas' : 'Menunggu Konfirmasi'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODUL 7: PENGATURAN HARGA */}
          {activeTab === 'pricing' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Pengaturan Harga &amp; Tarif</h2>
                <p className="text-xs text-slate-500">
                  Dapat diedit oleh admin secara langsung tanpa mengubah kode sumber
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs responsive-table-container">
                <table className="w-full text-left text-xs text-slate-700 min-w-[620px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <tr>
                      <th className="p-3">Model Kendaraan</th>
                      <th className="p-3">Kota</th>
                      <th className="p-3">Durasi</th>
                      <th className="p-3">Batas Jarak</th>
                      <th className="p-3">Harga Sekarang</th>
                      <th className="p-3 text-right">Aksi Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pricingList.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900">{p.vehicle_model}</td>
                        <td className="p-3">{p.city}</td>
                        <td className="p-3">{p.duration_hours} Jam</td>
                        <td className="p-3">{p.km_limit} km</td>
                        <td className="p-3">
                          {editPriceId === p.id ? (
                            <input
                              type="number"
                              value={editPriceValue}
                              onChange={e => setEditPriceValue(Number(e.target.value))}
                              className="w-28 sm:w-32 px-2 py-1.5 text-xs border rounded-lg font-bold"
                            />
                          ) : (
                            <strong className="text-brand-teal">
                              Rp{p.price.toLocaleString('id-ID')}
                            </strong>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {editPriceId === p.id ? (
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleSavePrice(p.id)}
                                className="px-2.5 py-1 text-[11px] bg-emerald-600 text-white rounded-lg font-bold min-h-[30px]"
                              >
                                Simpan
                              </button>
                              <button
                                onClick={() => setEditPriceId(null)}
                                className="px-2.5 py-1 text-[11px] bg-slate-200 text-slate-700 rounded-lg min-h-[30px]"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditPriceId(p.id);
                                setEditPriceValue(p.price);
                              }}
                              className="text-[11px] text-brand-teal font-bold hover:underline px-2 py-1 min-h-[32px]"
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

          {/* MODUL 8: LAPORAN & EKSPOR */}
          {activeTab === 'reports' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Laporan &amp; Analisis Kinerja</h2>
                  <p className="text-xs text-slate-500">Statistik transaksi, utilisasi unit, dan performa kota</p>
                </div>
                <button
                  onClick={loadReports}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 min-h-[38px] self-start sm:self-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Segarkan
                </button>
              </div>

              {reportData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Performa Kendaraan */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Performa Berdasarkan Model Kendaraan
                    </h3>
                    <div className="space-y-2">
                      {reportData.vehicleStats?.map((v: any, idx: number) => (
                        <div key={idx} className="flex justify-between p-2.5 rounded-xl bg-slate-50 text-xs">
                          <span className="font-bold text-slate-900">{v.model}</span>
                          <span className="text-slate-600 font-semibold">{v.trip_count} Trip · Rp{v.total_revenue?.toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performa Kota */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Pendapatan Berdasarkan Kota Layanan
                    </h3>
                    <div className="space-y-2">
                      {reportData.cityStats?.map((c: any, idx: number) => (
                        <div key={idx} className="flex justify-between p-2.5 rounded-xl bg-slate-50 text-xs">
                          <span className="font-bold text-slate-900">{c.city}</span>
                          <span className="text-slate-600 font-semibold">{c.count} Pesanan · Rp{c.revenue?.toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        {/* Modal Lihat Bukti Transfer Pelanggan */}
        {proofModalImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
            <div className="relative bg-white rounded-2xl max-w-lg w-full p-4 sm:p-5 border border-slate-200 shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <FileImage className="w-4 h-4 text-brand-teal" />
                  <span>Bukti Transfer Pembayaran Pelanggan</span>
                </span>
                <button
                  type="button"
                  onClick={() => setProofModalImage(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-slate-50 rounded-xl p-2 border border-slate-100">
                <img
                  src={proofModalImage}
                  alt="Bukti Transfer Pelanggan"
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xs"
                />
              </div>
              <div className="flex justify-between items-center pt-1 text-xs">
                <span className="text-slate-400 text-[11px]">Pastikan nominal sesuai dengan kode unik</span>
                <button
                  type="button"
                  onClick={() => setProofModalImage(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        </main>
      </div>
    </div>
  );
};
