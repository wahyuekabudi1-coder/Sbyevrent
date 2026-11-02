import React, { useState, useEffect } from 'react';
import { UserCheck, Phone, MapPin, Calendar, Clock, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { Logo } from '../components/Logo';

interface DriverPortalProps {
  onBackHome: () => void;
}

export const DriverPortal: React.FC<DriverPortalProps> = ({ onBackHome }) => {
  const [driver, setDriver] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [trips, setTrips] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Daftar driver untuk demonstrasi/kemudahan testing
  const [publicDrivers, setPublicDrivers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/driver/list-public')
      .then(res => res.json())
      .then(json => {
        if (json.success) setPublicDrivers(json.data);
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);

    try {
      const data = await api.driverLogin(phone, pin);
      setDriver(data);
      loadTrips(data.id);
    } catch (err: any) {
      setLoginError(err.message || 'Login gagal. Periksa nomor telepon atau PIN Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelectDriver = (d: any) => {
    setPhone(d.phone);
    setPin('123456');
  };

  const loadTrips = async (driverId: string) => {
    setLoadingTrips(true);
    try {
      const data = await api.getDriverTrips(driverId);
      setTrips(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleConfirmReady = async (bookingId: string, status: 'ready' | 'unable') => {
    if (!driver) return;
    try {
      await api.confirmDriverReady(bookingId, driver.id, status);
      setActionMsg(
        status === 'ready'
          ? 'Sukses! Anda telah terkonfirmasi SIAP BERTUGAS. Plat nomor & kontak Anda telah dibuka ke pelanggan.'
          : 'Laporan ketidaksediaan telah terkirim ke admin pengelola.'
      );
      loadTrips(driver.id);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan konfirmasi.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      
      {/* Top Mobile Bar */}
      <div className="bg-slate-900 text-white px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-xs sticky top-0 z-30">
        <button
          onClick={onBackHome}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white py-1 px-2 rounded-lg hover:bg-slate-800 min-h-[38px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Beranda</span>
        </button>
        <div className="flex items-center gap-2 truncate">
          <Logo className="h-10 sm:h-12" showSubtitle={false} lightMode={true} />
          <span className="text-xs font-bold tracking-tight text-brand-lime">Driver</span>
        </div>
      </div>

      <div className="max-w-md mx-auto px-3 sm:px-4 pt-4 sm:pt-6 space-y-4 sm:space-y-6">

        {/* Jika belum login: Form Login Driver Mobile */}
        {!driver ? (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4 sm:space-y-5">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <Logo className="h-16 sm:h-20" showSubtitle={false} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Masuk Akun Driver</h2>
                <p className="text-xs text-slate-500">
                  Surabaya EV Rent (Powered by Smart Journey)
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Telepon Driver
                </label>
                <input
                  type="tel"
                  required
                  placeholder="081234567801"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal text-slate-900 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PIN Pengemudi (Default: 123456)
                </label>
                <input
                  type="password"
                  required
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal text-slate-900 min-h-[44px]"
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 font-bold text-xs sm:text-sm text-white bg-brand-teal hover:bg-brand-teal-hover disabled:opacity-50 rounded-xl shadow-xs cursor-pointer min-h-[44px]"
              >
                {loading ? 'Memverifikasi...' : 'Masuk Portal Driver'}
              </button>
            </form>

            {/* Quick Demo Pickers */}
            {publicDrivers.length > 0 && (
              <div className="pt-3 sm:pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 block">
                  Pilih Cepat Akun Driver:
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {publicDrivers.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleQuickSelectDriver(d)}
                      className="w-full p-2.5 text-left rounded-xl bg-slate-50 hover:bg-brand-mint border border-slate-200 text-xs flex justify-between items-center cursor-pointer min-h-[44px]"
                    >
                      <div>
                        <strong className="text-slate-800 block">{d.name}</strong>
                        <span className="text-[10px] text-slate-500 block">{d.phone}</span>
                      </div>
                      <span className="text-[10px] text-brand-teal font-bold bg-white px-2 py-1 rounded border border-slate-200">Pilih</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Setelah Login: Dashboard Tugas Driver */
          <div className="space-y-4 sm:space-y-5">
            {/* Kartu Profil Driver */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-brand-teal font-bold block">
                  Driver Aktif
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">{driver.name}</h3>
                <span className="text-xs text-slate-500 font-mono">{driver.phone}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Unit Tetap:</span>
                <span className="text-xs font-bold text-slate-900">{driver.vehicleModel || 'VinFast EV'}</span>
                <span className="text-xs font-mono font-bold text-brand-teal block">{driver.plateNumber}</span>
                <button
                  onClick={() => setDriver(null)}
                  className="mt-1 text-[11px] text-slate-400 hover:text-rose-600 block min-h-[28px] py-0.5"
                >
                  Keluar
                </button>
              </div>
            </div>

            {actionMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{actionMsg}</span>
              </div>
            )}

            {/* Daftar Jadwal Tugas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Jadwal Tugas Perjalanan</h4>
                <button
                  onClick={() => loadTrips(driver.id)}
                  className="text-xs text-brand-teal font-bold min-h-[36px] flex items-center px-2 py-1 hover:bg-white rounded-lg"
                >
                  Segarkan
                </button>
              </div>

              {loadingTrips ? (
                <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-teal" />
                  <span>Memuat jadwal penugasan...</span>
                </div>
              ) : trips.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 sm:p-8 text-center text-slate-500 border border-slate-200 text-xs">
                  Belum ada penugasan perjalanan aktif untuk akun Anda saat ini.
                </div>
              ) : (
                trips.map(trip => {
                  const isReady = trip.driver_status === 'ready';

                  return (
                    <div
                      key={trip.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-3 sm:space-y-4"
                    >
                      <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-brand-teal block">
                            {trip.service_type === 'rental' ? 'Rental Mobil Listrik' : 'Taksi Listrik'}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-800">
                            {trip.booking_number}
                          </span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isReady ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isReady ? 'Siap Bertugas' : 'Perlu Konfirmasi'}
                        </span>
                      </div>

                      {/* Detail Penjemputan */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Tanggal: <strong>{trip.booking_date}</strong></span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Pukul: <strong>{trip.booking_time} WIB</strong> ({trip.duration_hours ? `${trip.duration_hours} Jam` : 'Taksi'})</span>
                        </div>

                        <div className="flex items-start gap-2 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-brand-teal shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 block text-[10px]">Titik Jemput:</span>
                            <strong className="text-slate-900">{trip.pickup_address}</strong>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-slate-500 text-[10px] block">Nama Pelanggan:</span>
                            <span className="font-bold text-slate-900">{trip.customer_name}</span>
                          </div>
                          <a
                            href={`https://wa.me/${trip.customer_phone.replace(/^0/, '62')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs min-h-[40px]"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>

                      {/* Tombol Konfirmasi Siap Bertugas: min 44px touch target */}
                      <div className="pt-2 sm:pt-3 border-t border-slate-100 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleConfirmReady(trip.id, 'ready')}
                          disabled={isReady}
                          className={`flex-1 py-3 px-3 text-xs font-bold rounded-xl text-white text-center cursor-pointer min-h-[44px] flex items-center justify-center ${
                            isReady
                              ? 'bg-emerald-600/70 cursor-default'
                              : 'bg-emerald-600 hover:bg-emerald-700 shadow-xs'
                          }`}
                        >
                          {isReady ? '✓ Sudah Siap Bertugas' : 'Konfirmasi Siap Bertugas'}
                        </button>

                        {!isReady && (
                          <button
                            type="button"
                            onClick={() => handleConfirmReady(trip.id, 'unable')}
                            className="px-3.5 py-3 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl cursor-pointer min-h-[44px] flex items-center justify-center"
                          >
                            Berhalangan
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
