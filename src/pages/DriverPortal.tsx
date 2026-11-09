import React, { useState, useEffect } from 'react';
import {
  Car,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Phone,
  User,
  Shield,
  ArrowLeft,
  Calendar,
  LogOut,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { api } from '../lib/api';
import { Logo } from '../components/Logo';

interface DriverPortalProps {
  onBackHome: () => void;
}

export const DriverPortal: React.FC<DriverPortalProps> = ({ onBackHome }) => {
  const [driver, setDriver] = useState<any>(null);
  const [phone, setPhone] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [trips, setTrips] = useState<any[]>([]);
  const [tripsLoading, setTripsLoading] = useState<boolean>(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Check saved session in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sjt_driver_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDriver(parsed);
      } catch (e) {
        localStorage.removeItem('sjt_driver_session');
      }
    }
  }, []);

  useEffect(() => {
    if (driver?.id) {
      loadTrips(driver.id);
    }
  }, [driver]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const data = await api.driverLogin(phone, pin);
      setDriver(data);
      localStorage.setItem('sjt_driver_session', JSON.stringify(data));
    } catch (err: any) {
      setLoginError(err.message || 'Nomor telepon atau PIN salah.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sjt_driver_session');
    setDriver(null);
    setTrips([]);
  };

  const loadTrips = async (driverId: string) => {
    setTripsLoading(true);
    try {
      const data = await api.getDriverTrips(driverId);
      setTrips(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setTripsLoading(false);
    }
  };

  const handleConfirmReady = async (bookingId: string, status: 'ready' | 'unable') => {
    if (!driver?.id) return;
    try {
      await api.confirmDriverReady(bookingId, driver.id, status);
      setActionMsg(status === 'ready' ? 'Konfirmasi siap bertugas berhasil disimpan.' : 'Status berhalangan telah dilaporkan ke admin.');
      setTimeout(() => setActionMsg(null), 3000);
      loadTrips(driver.id);
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackHome}
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
            aria-label="Kembali ke Beranda"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <Logo className="h-8" showSubtitle={false} />
            <span className="text-[10px] text-brand-teal font-bold tracking-wider uppercase block font-mono">
              Portal Driver EV Profesional
            </span>
          </div>
        </div>

        {driver && (
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 space-y-4">
        
        {!driver ? (
          /* Login Card */
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-5 my-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 border border-brand-teal/20 text-brand-teal flex items-center justify-center mx-auto mb-3">
                <Car className="w-6 h-6" />
              </div>
              <h1 className="text-lg sm:text-xl font-black text-brand-primary">
                Login Driver Resmi SJ Trans
              </h1>
              <p className="text-xs text-slate-500">
                Akses jadwal penjemputan armada VinFast VF 5 &amp; VF e34
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor HP Driver Terdaftar *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="081234567801"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-teal"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Contoh: 081234567801 (Budi Santoso) / 081234567802 (Ahmad Fauzi)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PIN Keamanan (6 Digit) *
                </label>
                <input
                  type="password"
                  required
                  placeholder="PIN Default: 123456"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-teal font-mono tracking-widest text-center"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full h-11 bg-brand-teal hover:bg-brand-teal-hover text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <span>Masuk ke Portal Driver</span>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Driver Logged-in Dashboard */
          <div className="space-y-4">
            
            {/* Kartu Profil Driver */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-teal text-white flex items-center justify-center font-bold text-base">
                  {driver.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">{driver.name}</h2>
                  <span className="text-xs text-slate-500 block font-mono">{driver.phone}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      EV Certified
                    </span>
                    {driver.vehicleModel && (
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded">
                        {driver.vehicleModel} ({driver.plateNumber || 'Armada'})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => loadTrips(driver.id)}
                disabled={tripsLoading}
                className="p-2 text-slate-500 hover:text-brand-teal rounded-lg hover:bg-slate-50 cursor-pointer"
                title="Segarkan Jadwal"
              >
                <RefreshCw className={`w-4 h-4 ${tripsLoading ? 'animate-spin text-brand-teal' : ''}`} />
              </button>
            </div>

            {actionMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{actionMsg}</span>
              </div>
            )}

            {/* Daftar Tugas & Jadwal */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Jadwal Penjemputan Anda ({trips.length})
                </h3>
                <span className="text-[11px] text-slate-400">Konfirmasi Kesiapan H-1</span>
              </div>

              {tripsLoading ? (
                <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-teal" />
                  <span>Memuat jadwal tugas...</span>
                </div>
              ) : trips.length === 0 ? (
                <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-1">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Belum Ada Tugas Aktif</p>
                  <p className="text-[11px] text-slate-400">
                    Admin akan menugaskan penjemputan armada VinFast saat pemesanan baru terkonfirmasi.
                  </p>
                </div>
              ) : (
                trips.map((trip) => {
                  const isReady = trip.driver_status === 'ready';

                  return (
                    <div
                      key={trip.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-[11px] font-mono font-bold text-slate-500">
                          {trip.booking_number}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isReady ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isReady ? '✓ Siap Bertugas' : 'Menunggu Konfirmasi Anda'}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-brand-primary font-bold">
                          <Calendar className="w-4 h-4 text-brand-teal" />
                          <span>{trip.booking_date} · Pukul {trip.booking_time} WIB</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-700">
                          <Car className="w-4 h-4 text-brand-teal" />
                          <span>{trip.vehicle_model} {trip.plate_number ? `(${trip.plate_number})` : ''} · Paket {trip.duration_hours || '-'} Jam</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-700">
                          <User className="w-4 h-4 text-brand-teal" />
                          <span>Pelanggan: <strong>{trip.customer_name}</strong> ({trip.customer_phone})</span>
                        </div>

                        <div className="pt-1 text-slate-600 flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Alamat Jemput:</span>
                            <span className="font-medium text-slate-800">{trip.pickup_address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Tombol Konfirmasi Kesiapan */}
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                        {!isReady ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleConfirmReady(trip.id, 'ready')}
                              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Konfirmasi Siap Bertugas</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfirmReady(trip.id, 'unable')}
                              className="py-2 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
                            >
                              Berhalangan
                            </button>
                          </>
                        ) : (
                          <div className="w-full flex items-center justify-between text-xs">
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Anda telah mengonfirmasi siap bertugas
                            </span>
                            <button
                              type="button"
                              onClick={() => handleConfirmReady(trip.id, 'unable')}
                              className="text-[10px] text-slate-400 hover:text-rose-600 hover:underline cursor-pointer"
                            >
                              Batalkan
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

      </main>

      {/* Footer Minimal */}
      <footer className="py-3 border-t border-slate-200 bg-white text-center text-[11px] text-slate-400">
        &copy; {new Date().getFullYear()} PT Sawah Jaya Trans · Dedicated Driver Portal
      </footer>

    </div>
  );
};
