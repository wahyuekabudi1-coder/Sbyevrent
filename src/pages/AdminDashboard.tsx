import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, LayoutDashboard, Car, Calendar, FileText,
  Settings, TrendingUp, Plus, ArrowLeft, RefreshCw, Download,
  Edit2, Trash2, CheckCircle2, AlertTriangle, Phone, Search, X
} from 'lucide-react';
import { api } from '../lib/api';
import { Logo } from '../components/Logo';
import { Vehicle } from '../types';

interface AdminDashboardProps {
  onBackHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackHome }) => {
  const [adminPin, setAdminPin] = useState('admin2026');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab: 6 Modul Rapi & Terfokus
  const [activeTab, setActiveTab] = useState<
    'overview' | 'fleet' | 'calendar' | 'bookings' | 'pricing' | 'reports'
  >('fleet');

  // Overview Data
  const [stats, setStats] = useState<any>(null);

  // Fleet (Armada Mobil & Driver Langsung)
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fleetLoading, setFleetLoading] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [fleetSearch, setFleetSearch] = useState('');
  const [fleetCityFilter, setFleetCityFilter] = useState('Semua');
  const [fleetStatusFilter, setFleetStatusFilter] = useState('Semua');

  // State Form Input / Edit Mobil
  const [vehicleForm, setVehicleForm] = useState({
    code: '',
    model: 'VinFast VF 5',
    plateNumber: '',
    city: 'Surabaya',
    driverName: '',
    driverPhone: '',
    inMaintenance: false,
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

  // Pricing Data
  const [pricingList, setPricingList] = useState<any[]>([]);
  const [editPriceId, setEditPriceId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<number>(0);

  // Reports Data
  const [reportData, setReportData] = useState<any>(null);

  // Status feedback toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const data = await api.getAdminOverview(adminPin);
      setStats(data);
      setIsAuthenticated(true);
      loadFleet();
    } catch (err: any) {
      setAuthError('PIN Admin tidak valid. Default: admin2026');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'overview') loadOverview();
      if (activeTab === 'fleet') loadFleet();
      if (activeTab === 'calendar') loadCalendar(calendarDate);
      if (activeTab === 'bookings') loadBookings();
      if (activeTab === 'pricing') loadPricing();
      if (activeTab === 'reports') loadReports();
    }
  }, [isAuthenticated, activeTab]);

  const loadOverview = async () => {
    try {
      const s = await api.getAdminOverview(adminPin);
      setStats(s);
    } catch (e) {
      console.error(e);
    }
  };

  const loadFleet = async () => {
    setFleetLoading(true);
    try {
      const data = await api.getAdminVehicles(adminPin);
      setVehicles(data);
    } catch (e: any) {
      console.error(e);
      showNotification('Gagal memuat data armada: ' + e.message, 'error');
    } finally {
      setFleetLoading(false);
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

  // Reset form
  const resetVehicleForm = () => {
    setVehicleForm({
      code: '',
      model: 'VinFast VF 5',
      plateNumber: '',
      city: 'Surabaya',
      driverName: '',
      driverPhone: '',
      inMaintenance: false,
      notes: ''
    });
    setEditingVehicle(null);
    setShowAddVehicle(false);
  };

  // Buka Form Tambah Mobil
  const handleOpenAddVehicle = () => {
    resetVehicleForm();
    setShowAddVehicle(true);
  };

  // Buka Form Edit Mobil
  const handleOpenEditVehicle = (veh: Vehicle) => {
    setEditingVehicle(veh);
    setVehicleForm({
      code: veh.code,
      model: veh.model,
      plateNumber: veh.plate_number,
      city: veh.city,
      driverName: veh.driver_name || '',
      driverPhone: veh.driver_phone || '',
      inMaintenance: Boolean(veh.in_maintenance),
      notes: veh.notes || ''
    });
    setShowAddVehicle(true);
  };

  // Submit Simpan Mobil (Tambah / Edit)
  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.plateNumber.trim() || !vehicleForm.driverName.trim()) {
      showNotification('Nomor Plat Mobil dan Nama Driver wajib diisi!', 'error');
      return;
    }

    try {
      if (editingVehicle) {
        // Mode Update Mobil
        await api.updateAdminVehicle(adminPin, editingVehicle.id, {
          code: vehicleForm.code || editingVehicle.code,
          model: vehicleForm.model,
          plateNumber: vehicleForm.plateNumber,
          city: vehicleForm.city,
          driverName: vehicleForm.driverName,
          driverPhone: vehicleForm.driverPhone,
          inMaintenance: vehicleForm.inMaintenance,
          notes: vehicleForm.notes
        });
        showNotification(`Mobil ${vehicleForm.model} (${vehicleForm.plateNumber}) berhasil diperbarui.`);
      } else {
        // Mode Tambah Mobil Baru
        await api.addAdminVehicle(adminPin, {
          code: vehicleForm.code,
          model: vehicleForm.model,
          plateNumber: vehicleForm.plateNumber,
          city: vehicleForm.city,
          driverName: vehicleForm.driverName,
          driverPhone: vehicleForm.driverPhone,
          inMaintenance: vehicleForm.inMaintenance,
          notes: vehicleForm.notes
        });
        showNotification(`Mobil ${vehicleForm.model} (${vehicleForm.plateNumber}) dan Driver ${vehicleForm.driverName} berhasil ditambahkan!`);
      }

      resetVehicleForm();
      loadFleet();
    } catch (err: any) {
      showNotification(err.message || 'Gagal menyimpan armada mobil', 'error');
    }
  };

  // Toggle Status Perawatan Mobil
  const handleToggleMaintenance = async (v: Vehicle) => {
    try {
      await api.updateAdminVehicle(adminPin, v.id, {
        code: v.code,
        model: v.model,
        plateNumber: v.plate_number,
        city: v.city,
        driverName: v.driver_name,
        driverPhone: v.driver_phone,
        inMaintenance: !v.in_maintenance,
        isActive: v.is_active,
        notes: v.notes
      });
      showNotification(
        !v.in_maintenance
          ? `Mobil ${v.code} (${v.plate_number}) diset dalam PERAWATAN.`
          : `Mobil ${v.code} (${v.plate_number}) SIAP OPERASI kembali.`
      );
      loadFleet();
    } catch (err: any) {
      showNotification(err.message || 'Gagal memperbarui status perawatan', 'error');
    }
  };

  // Hapus Mobil
  const handleDeleteVehicle = async (v: Vehicle) => {
    if (!window.confirm(`Yakin ingin menghapus mobil ${v.model} (${v.plate_number}) dengan Driver ${v.driver_name}?`)) {
      return;
    }
    try {
      await api.deleteAdminVehicle(adminPin, v.id);
      showNotification(`Mobil ${v.plate_number} berhasil dihapus.`);
      loadFleet();
    } catch (err: any) {
      showNotification(err.message || 'Gagal menghapus armada', 'error');
    }
  };

  // Update Harga
  const handleSavePrice = async (id: string) => {
    try {
      await api.updatePricing(adminPin, id, editPriceValue);
      setEditPriceId(null);
      showNotification('Tarif berhasil diperbarui.');
      loadPricing();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  // Ekspor CSV
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

  // Filter list mobil
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch =
      v.code?.toLowerCase().includes(fleetSearch.toLowerCase()) ||
      v.plate_number?.toLowerCase().includes(fleetSearch.toLowerCase()) ||
      v.driver_name?.toLowerCase().includes(fleetSearch.toLowerCase()) ||
      v.model?.toLowerCase().includes(fleetSearch.toLowerCase());

    const matchesCity = fleetCityFilter === 'Semua' || v.city === fleetCityFilter;
    const matchesStatus =
      fleetStatusFilter === 'Semua' ||
      (fleetStatusFilter === 'ready' && !v.in_maintenance) ||
      (fleetStatusFilter === 'maintenance' && v.in_maintenance);

    return matchesSearch && matchesCity && matchesStatus;
  });

  const navModules = [
    { id: 'overview', label: 'Overview', fullLabel: '1. Dashboard Overview', icon: LayoutDashboard },
    { id: 'fleet', label: 'Armada Mobil', fullLabel: '2. Input & Manajemen Mobil', icon: Car },
    { id: 'calendar', label: 'Jadwal & Kalender', fullLabel: '3. Kalender Ketersediaan', icon: Calendar },
    { id: 'bookings', label: 'Data Booking', fullLabel: '4. Daftar Pemesanan', icon: FileText },
    { id: 'pricing', label: 'Tarif Rental', fullLabel: '5. Pengaturan Tarif', icon: Settings },
    { id: 'reports', label: 'Laporan', fullLabel: '6. Laporan & Ekspor', icon: TrendingUp },
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
              <h2 className="text-xl font-bold text-slate-900">Portal Pengelola Admin</h2>
              <p className="text-xs text-slate-500">
                PT Sawah Jaya Trans · Surabaya EV Rent
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
                placeholder="Ketik PIN..."
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
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-xs font-bold transition-all ${
            notification.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Admin Navbar */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            onClick={onBackHome}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white shrink-0 py-1.5 px-2.5 rounded-lg hover:bg-slate-800 min-h-[38px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Web Publik</span>
          </button>
          <div className="flex items-center gap-2 truncate">
            <Logo className="h-9 sm:h-11" showSubtitle={false} lightMode={true} />
            <span className="text-[9px] sm:text-[10px] bg-brand-primary text-brand-lime border border-brand-teal/30 px-2 py-0.5 rounded font-mono font-bold shrink-0">
              Admin Panel
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors font-semibold"
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
        <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 p-4 space-y-1.5 shrink-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
            Menu Pengelola
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

          <div className="pt-6 px-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <strong className="text-slate-800 block">Sistem Terintegrasi:</strong>
              <p>Admin menginput armada mobil secara langsung dengan informasi plat nomor dan nama driver.</p>
            </div>
          </div>
        </aside>

        {/* Main Content View */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto w-full max-w-full">
          
          {/* ============================================================== */}
          {/* MODUL 1: DASHBOARD OVERVIEW */}
          {/* ============================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Dashboard Overview</h2>
                  <p className="text-xs text-slate-500">Ringkasan performa armada dan pemesanan terkini</p>
                </div>
                <button
                  onClick={loadOverview}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 self-start sm:self-auto min-h-[38px]"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Segarkan Data
                </button>
              </div>

              {stats && (
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
                      {stats.availableFleetNow} Siap Operasi · {stats.maintenanceFleet} Perawatan
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-[11px] text-slate-500 block font-medium">Pemesanan Besok</span>
                    <span className="text-lg sm:text-xl font-black text-brand-teal mt-0.5 block">
                      {stats.tomorrowTrips?.length || 0} Jadwal
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Armada &amp; driver siap melayani
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* MODUL 2: MANAJEMEN ARMADA MOBIL (Admin Hanya Menginput Mobil)   */}
          {/* ============================================================== */}
          {activeTab === 'fleet' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    Input &amp; Manajemen Armada Mobil
                  </h2>
                  <p className="text-xs text-slate-500">
                    Admin cukup menginput data mobil. Di dalamnya sudah memuat Plat Nomor Polisi dan Nama Driver.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddVehicle}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-bold text-xs shadow-xs cursor-pointer min-h-[44px]"
                >
                  <Plus className="w-4 h-4" /> Input Mobil Baru
                </button>
              </div>

              {/* Form Input / Edit Mobil */}
              {showAddVehicle && (
                <form
                  onSubmit={handleSaveVehicle}
                  className="p-4 sm:p-6 rounded-2xl bg-white border-2 border-brand-teal/30 shadow-md space-y-4 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-brand-teal text-white flex items-center justify-center font-bold">
                        <Car className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {editingVehicle ? 'Edit Data Mobil & Driver' : 'Input Mobil Baru'}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Lengkapi informasi mobil, plat nomor, dan nama driver yang bertugas
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={resetVehicleForm}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Model Mobil */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Model Mobil Listrik *
                      </label>
                      <select
                        value={vehicleForm.model}
                        onChange={e => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white min-h-[42px] focus:ring-2 focus:ring-brand-teal"
                      >
                        <option value="VinFast VF 5">VinFast VF 5 (City Compact EV)</option>
                        <option value="VinFast VF e34">VinFast VF e34 (Premium Mid-SUV)</option>
                      </select>
                    </div>

                    {/* Nomor Plat Mobil */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Nomor Plat Polisi *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: L 1821 EV"
                        value={vehicleForm.plateNumber}
                        onChange={e => setVehicleForm({ ...vehicleForm, plateNumber: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 text-xs font-mono font-bold tracking-wider rounded-xl border border-slate-300 min-h-[42px] focus:ring-2 focus:ring-brand-teal uppercase"
                      />
                    </div>

                    {/* Nama Driver Mobil */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Nama Driver Mobil *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Budi Santoso"
                        value={vehicleForm.driverName}
                        onChange={e => setVehicleForm({ ...vehicleForm, driverName: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 min-h-[42px] focus:ring-2 focus:ring-brand-teal"
                      />
                    </div>

                    {/* Nomor WhatsApp / HP Driver */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        No. HP / WhatsApp Driver
                      </label>
                      <input
                        type="tel"
                        placeholder="Contoh: 081234567801"
                        value={vehicleForm.driverPhone}
                        onChange={e => setVehicleForm({ ...vehicleForm, driverPhone: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 min-h-[42px] focus:ring-2 focus:ring-brand-teal"
                      />
                    </div>

                    {/* Kota Operasional */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Kota Penempatan Operasional *
                      </label>
                      <select
                        value={vehicleForm.city}
                        onChange={e => setVehicleForm({ ...vehicleForm, city: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white min-h-[42px] focus:ring-2 focus:ring-brand-teal"
                      >
                        <option value="Surabaya">Surabaya</option>
                        <option value="Sidoarjo">Sidoarjo</option>
                        <option value="Malang">Malang</option>
                      </select>
                    </div>

                    {/* Kode Mobil (Opsional) */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Kode Internal Mobil (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="Otomatis (Contoh: SJT-VF5-05)"
                        value={vehicleForm.code}
                        onChange={e => setVehicleForm({ ...vehicleForm, code: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 min-h-[42px] focus:ring-2 focus:ring-brand-teal"
                      />
                    </div>
                  </div>

                  {/* Status Kesiapan & Catatan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                        Status Kesiapan Armada
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                          <input
                            type="radio"
                            name="inMaintenance"
                            checked={!vehicleForm.inMaintenance}
                            onChange={() => setVehicleForm({ ...vehicleForm, inMaintenance: false })}
                            className="text-brand-teal focus:ring-brand-teal"
                          />
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Siap Operasi (Siaga)
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                          <input
                            type="radio"
                            name="inMaintenance"
                            checked={vehicleForm.inMaintenance}
                            onChange={() => setVehicleForm({ ...vehicleForm, inMaintenance: true })}
                            className="text-amber-600 focus:ring-amber-600"
                          />
                          <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Dalam Perawatan
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Catatan / Posko Siaga Unit
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Standby Terminal 1 Bandara Juanda"
                        value={vehicleForm.notes}
                        onChange={e => setVehicleForm({ ...vehicleForm, notes: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 min-h-[42px]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={resetVehicleForm}
                      className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl min-h-[40px]"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-xs font-bold text-white bg-brand-teal hover:bg-brand-teal-hover rounded-xl shadow-xs cursor-pointer min-h-[40px]"
                    >
                      {editingVehicle ? 'Simpan Perubahan Mobil' : 'Daftarkan Mobil'}
                    </button>
                  </div>
                </form>
              )}

              {/* Filter & Search Bar Armada */}
              <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row flex-wrap gap-2.5 items-stretch sm:items-center justify-between text-xs shadow-xs">
                <div className="flex flex-1 flex-col sm:flex-row gap-2 min-w-0">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Cari Plat, Driver, Kode, Model..."
                      value={fleetSearch}
                      onChange={e => setFleetSearch(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs min-h-[40px] focus:ring-2 focus:ring-brand-teal"
                    />
                  </div>

                  <select
                    value={fleetCityFilter}
                    onChange={e => setFleetCityFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 min-h-[40px]"
                  >
                    <option value="Semua">Semua Kota</option>
                    <option value="Surabaya">Surabaya</option>
                    <option value="Sidoarjo">Sidoarjo</option>
                    <option value="Malang">Malang</option>
                  </select>

                  <select
                    value={fleetStatusFilter}
                    onChange={e => setFleetStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 min-h-[40px]"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="ready">Siap Operasi</option>
                    <option value="maintenance">Dalam Perawatan</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 text-slate-500 font-semibold self-end sm:self-auto shrink-0">
                  <span>Total: <strong>{filteredVehicles.length}</strong> unit</span>
                  <button
                    onClick={loadFleet}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                    title="Segarkan data mobil"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${fleetLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Tabel Armada Mobil Lengkap (Plat Nomor & Driver) */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs responsive-table-container">
                <table className="w-full text-left text-xs text-slate-700 min-w-[760px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <tr>
                      <th className="p-3.5">Mobil &amp; Kode</th>
                      <th className="p-3.5">Plat Nomor Polisi</th>
                      <th className="p-3.5">Driver Bertugas</th>
                      <th className="p-3.5">Kota Operasional</th>
                      <th className="p-3.5">Status Kesiapan</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVehicles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          Tidak ada data mobil yang cocok dengan filter atau belum ada mobil yang diinput.
                        </td>
                      </tr>
                    ) : (
                      filteredVehicles.map(v => (
                        <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Mobil & Kode */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 block">{v.model}</span>
                              <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                                {v.code}
                              </span>
                            </div>
                            {v.notes && (
                              <span className="text-[10px] text-slate-500 block mt-0.5 truncate max-w-xs">
                                {v.notes}
                              </span>
                            )}
                          </td>

                          {/* Plat Nomor Polisi (Badge Plat Otentik) */}
                          <td className="p-3.5">
                            <div className="inline-flex items-center px-2.5 py-1 rounded bg-slate-900 text-white font-mono font-bold tracking-widest text-xs border border-slate-700 shadow-2xs">
                              {v.plate_number}
                            </div>
                          </td>

                          {/* Driver Mobil */}
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{v.driver_name || '-'}</div>
                            {v.driver_phone && v.driver_phone !== '-' && (
                              <a
                                href={`https://wa.me/${v.driver_phone.replace(/^0/, '62')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-brand-teal hover:underline font-mono font-semibold mt-0.5"
                              >
                                <Phone className="w-3 h-3 text-brand-teal" />
                                <span>{v.driver_phone}</span>
                              </a>
                            )}
                          </td>

                          {/* Kota */}
                          <td className="p-3.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {v.city}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="p-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              v.in_maintenance
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${v.in_maintenance ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                              {v.in_maintenance ? 'Perawatan' : 'Siap Operasi'}
                            </span>
                          </td>

                          {/* Aksi */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleMaintenance(v)}
                                title={v.in_maintenance ? 'Set Siap Operasi' : 'Set Dalam Perawatan'}
                                className={`text-[11px] px-2.5 py-1.5 rounded-lg font-bold min-h-[32px] transition-colors ${
                                  v.in_maintenance
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                }`}
                              >
                                {v.in_maintenance ? 'Set Siap' : 'Set Rawat'}
                              </button>

                              <button
                                onClick={() => handleOpenEditVehicle(v)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 min-h-[32px] min-w-[32px] flex items-center justify-center"
                                title="Edit Data Mobil & Driver"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteVehicle(v)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 min-h-[32px] min-w-[32px] flex items-center justify-center"
                                title="Hapus Mobil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODUL 3: KALENDER & JADWAL UNIT                                */}
          {/* ============================================================== */}
          {activeTab === 'calendar' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Kalender Ketersediaan Mobil</h2>
                  <p className="text-xs text-slate-500">
                    Setiap mobil rental hanya menerima 1 pemesanan per tanggal aktif
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
                      Tanggal: <strong>{calendarData.date}</strong>
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
                        <div className="text-[11px] text-slate-500 flex items-center justify-between">
                          <span>Plat: <strong className="font-mono text-slate-700">{veh.plate_number}</strong></span>
                          <span>{veh.city}</span>
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

          {/* ============================================================== */}
          {/* MODUL 4: DATA PEMESANAN (Rental & Taksi)                       */}
          {/* ============================================================== */}
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
                  <option value="Malang">Malang</option>
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
                  className="px-5 py-2 bg-brand-teal hover:bg-brand-teal-hover text-white rounded-xl font-bold min-h-[40px] flex items-center justify-center"
                >
                  Terapkan Filter
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs responsive-table-container">
                <table className="w-full text-left text-xs text-slate-700 min-w-[720px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <tr>
                      <th className="p-3">No. Booking</th>
                      <th className="p-3">Layanan</th>
                      <th className="p-3">Pelanggan</th>
                      <th className="p-3">Jadwal</th>
                      <th className="p-3">Total Tagihan</th>
                      <th className="p-3">Pembayaran</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map(b => (
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
                        <td className="p-3 font-bold text-slate-900">
                          Rp{b.total_amount?.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {b.payment_status}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.booking_status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.booking_status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-brand-mint text-brand-teal'
                          }`}>
                            {b.booking_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODUL 5: PENGATURAN HARGA                                      */}
          {/* ============================================================== */}
          {activeTab === 'pricing' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Pengaturan Tarif Rental</h2>
                <p className="text-xs text-slate-500">
                  Dapat disesuaikan langsung oleh admin per durasi jam, km limit, dan model mobil
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

          {/* ============================================================== */}
          {/* MODUL 6: LAPORAN & EKSPOR                                      */}
          {/* ============================================================== */}
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

        </main>
      </div>
    </div>
  );
};
