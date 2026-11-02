import React, { useState } from 'react';
import { Calendar, Navigation, CheckCircle2, Info } from 'lucide-react';
import { LiveryStripe, CornerStrapDecal } from './EvLiveryDecals';
import { RentalPricingItem } from '../types';

interface ServicesAndPackagesProps {
  pricingList: RentalPricingItem[];
  onOpenRental: (prefill?: { model?: string; hours?: number }) => void;
  onOpenTaxi: () => void;
}

export const ServicesAndPackages: React.FC<ServicesAndPackagesProps> = ({
  pricingList,
  onOpenRental,
  onOpenTaxi
}) => {
  const [selectedModel, setSelectedModel] = useState<'VinFast VF 5' | 'VinFast VF e34'>('VinFast VF 5');

  // Filter paket berdasarkan model yang dipilih
  const modelPackages = pricingList.filter(p => p.vehicle_model === selectedModel && p.city === 'Surabaya');
  
  // Fallback data jika backend baru booting
  const defaultVF5 = [
    { duration_hours: 3, km_limit: 45, price: 240000 },
    { duration_hours: 5, km_limit: 75, price: 390000 },
    { duration_hours: 8, km_limit: 120, price: 620000 },
    { duration_hours: 12, km_limit: 180, price: 930000 },
  ];

  const defaultVFe34 = [
    { duration_hours: 3, km_limit: 45, price: 290000 },
    { duration_hours: 5, km_limit: 75, price: 460000 },
    { duration_hours: 8, km_limit: 120, price: 740000 },
    { duration_hours: 12, km_limit: 180, price: 1100000 },
  ];

  const displayPackages = modelPackages.length > 0 
    ? modelPackages 
    : (selectedModel === 'VinFast VF 5' ? defaultVF5 : defaultVFe34);

  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-20 py-12 sm:py-16 lg:py-20 bg-white">
      {/* SECTION 5 — DUA KARTU LAYANAN UTAMA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-2 mb-2">
            <LiveryStripe variant="slanted" />
            <span className="text-[11px] sm:text-xs font-bold tracking-wider text-brand-teal uppercase">
              Solusi Perjalanan Terpadu
            </span>
            <LiveryStripe variant="slanted" className="rotate-180" />
          </div>
          <h2 className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-brand-primary">
            DUA LAYANAN UTAMA KAMI
          </h2>
          <div className="flex justify-center my-2.5">
            <LiveryStripe variant="horizontal" />
          </div>
          <p className="mt-1 text-slate-600 text-xs sm:text-sm lg:text-base leading-relaxed">
            Fleksibilitas penuh untuk kebutuhan perjalanan harian, drop-off bandara, maupun sewa harian bersama driver berpengalaman.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* KARTU A: RENTAL MOBIL LISTRIK */}
          <div
            id="rental-section"
            className="relative p-5 sm:p-8 rounded-2xl border-2 border-brand-teal/20 bg-brand-mint/40 flex flex-col justify-between hover:border-brand-teal transition-all shadow-xs overflow-hidden"
          >
            {/* Corner Livery Strap */}
            <div className="absolute top-0 right-0 z-10">
              <CornerStrapDecal label="RENTAL H-1" />
            </div>
            <div className="space-y-5 sm:space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-brand-teal text-white flex items-center justify-center shadow-xs">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-brand-lime" />
                </div>
                <span className="text-[11px] font-bold text-brand-teal bg-white px-2.5 py-1 rounded-lg border border-brand-teal/20 shadow-2xs">
                  Layanan Resmi H-1
                </span>
              </div>

              <div>
                <span className="text-[10px] sm:text-xs font-bold text-brand-teal uppercase tracking-wider">
                  Sewa Per Jam &amp; Harian (H-1)
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-brand-primary mt-1">
                  RENTAL MOBIL LISTRIK
                </h3>
                <p className="text-slate-600 mt-1.5 text-xs sm:text-sm leading-relaxed">
                  Rasakan pengalaman perjalanan menggunakan mobil listrik dengan layanan rental bersama driver.
                </p>
              </div>

              <div className="space-y-2 sm:space-y-2.5 pt-1 sm:pt-2">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                  <span>Pilihan wilayah Surabaya, Sidoarjo, dan Malang</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                  <span>Pilihan armada VinFast VF 5 dan VF e34</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                  <span>Paket fleksibel: 3 jam, 5 jam, 8 jam, dan 12 jam</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                  <span>Termasuk driver dan listrik kendaraan</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                  <span>Pemesanan terverifikasi dengan pembayaran online ArtoPay</span>
                </div>
              </div>
            </div>

            <div className="pt-6 sm:pt-8">
              <button
                onClick={() => onOpenRental()}
                className="w-full py-3.5 px-4 text-center font-bold text-xs sm:text-sm text-white bg-brand-teal hover:bg-brand-teal-hover rounded-xl shadow-xs transition-colors cursor-pointer min-h-[48px] flex items-center justify-center"
              >
                Pesan Rental Mobil Sekarang
              </button>
            </div>
          </div>

          {/* KARTU B: TAKSI MOBIL LISTRIK */}
          <div
            id="taxi-section"
            className="relative p-5 sm:p-8 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between hover:border-brand-teal transition-all shadow-xs overflow-hidden"
          >
            {/* Corner Livery Strap */}
            <div className="absolute top-0 right-0 z-10">
              <CornerStrapDecal label="TAKSI // KM" />
            </div>
            <div className="space-y-5 sm:space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-xs">
                  <Navigation className="w-5 h-5 sm:w-6 sm:h-6 text-brand-lime" />
                </div>
                <span className="text-[11px] font-bold text-brand-teal bg-brand-mint px-2.5 py-1 rounded-lg border border-brand-teal/20 shadow-2xs">
                  Point-to-Point
                </span>
              </div>

              <div>
                <span className="text-[10px] sm:text-xs font-bold text-brand-teal uppercase tracking-wider">
                  Tarif Berdasarkan Jarak
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-brand-primary mt-1">
                  TAKSI MOBIL LISTRIK
                </h3>
                <p className="text-slate-600 mt-1.5 text-xs sm:text-sm leading-relaxed">
                  Layanan perjalanan menggunakan mobil listrik dengan tarif berdasarkan jarak perjalanan.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-brand-mint/60 border border-brand-teal/20">
                <span className="text-[11px] sm:text-xs text-brand-teal font-semibold block">Tarif Dasar Resmi</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-brand-primary mt-0.5">
                  Rp7.000 <span className="text-xs sm:text-sm font-normal text-slate-500">/ kilometer</span>
                </div>
                <span className="text-[11px] sm:text-xs text-slate-500 block mt-1">
                  Minimal tarif Rp25.000 · Perhitungan rute presisi OpenStreetMap
                </span>
              </div>

              <div className="space-y-2 sm:space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                  <span>Pilih titik penjemputan dan tujuan langsung</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                  <span>Estimasi jarak dan biaya transparan seketika</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                  <span>Bisa dipesan sekarang atau dijadwalkan</span>
                </div>
              </div>
            </div>

            <div className="pt-6 sm:pt-8">
              <button
                onClick={onOpenTaxi}
                className="w-full py-3.5 px-4 text-center font-bold text-xs sm:text-sm text-white bg-brand-primary hover:bg-brand-teal rounded-xl transition-colors cursor-pointer min-h-[48px] flex items-center justify-center"
              >
                Kalkulasi Rute &amp; Pesan Taksi Listrik
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — PAKET RENTAL & HARGA RESMI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-slate-200 pt-10 sm:pt-16">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <span className="text-[11px] sm:text-xs font-bold tracking-wider text-brand-teal uppercase">
                Daftar Paket Durasi
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-primary mt-1">
                PAKET RENTAL MOBIL LISTRIK
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Tersedia 4 pilihan durasi waktu dengan batas kilometer yang jelas.
              </p>
            </div>

            {/* Model Selector Tabs: Responsive width */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setSelectedModel('VinFast VF 5')}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[38px] ${
                  selectedModel === 'VinFast VF 5'
                    ? 'bg-brand-teal text-white shadow-xs'
                    : 'text-slate-600 hover:text-brand-primary'
                }`}
              >
                VinFast VF 5
              </button>
              <button
                onClick={() => setSelectedModel('VinFast VF e34')}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[38px] ${
                  selectedModel === 'VinFast VF e34'
                    ? 'bg-brand-teal text-white shadow-xs'
                    : 'text-slate-600 hover:text-brand-primary'
                }`}
              >
                VinFast VF e34
              </button>
            </div>
          </div>

          {/* Grid 4 Paket Durasi: 1 col on <540px, 2 col on sm, 4 col on lg */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayPackages.map((pkg, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between hover:border-brand-teal hover:shadow-xs transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 sm:mb-2">
                    <span>Durasi</span>
                    <span className="font-bold text-brand-teal">Termasuk Driver</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-brand-primary">
                    Paket {pkg.duration_hours} Jam
                  </h3>
                  <div className="mt-1 text-xs text-slate-600">
                    Batas Jarak: <strong className="text-brand-primary font-bold">{pkg.km_limit} km</strong>
                  </div>

                  <div className="my-4 sm:my-6 py-3 sm:py-4 border-y border-slate-100">
                    <div className="text-xl sm:text-2xl font-extrabold text-brand-primary">
                      Rp{pkg.price.toLocaleString('id-ID')}
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5">
                      {selectedModel} · All-in supir &amp; listrik
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenRental({ model: selectedModel, hours: pkg.duration_hours })}
                  className="w-full py-2.5 px-3 text-center text-xs font-bold text-brand-teal bg-brand-mint hover:bg-brand-teal hover:text-white border border-brand-teal/20 rounded-xl transition-all cursor-pointer min-h-[44px] flex items-center justify-center"
                >
                  Pilih Paket {pkg.duration_hours} Jam
                </button>
              </div>
            ))}
          </div>

          {/* Aturan & Kebijakan Transparan */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-5 rounded-2xl bg-brand-mint/60 border border-brand-teal/20 text-xs text-slate-700 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-brand-primary">
              <Info className="w-4 h-4 text-brand-teal shrink-0" />
              <span>Ketentuan Pemakaian Rental Surabaya EV Rent:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>Pemesanan rental wajib dilakukan minimal H-1 sebelum tanggal perjalanan.</li>
              <li>Satu kendaraan hanya melayani 1 penyewa per hari untuk menjamin kebersihan dan kesiapan daya baterai.</li>
              <li>Harga sudah termasuk driver dan pengisian daya baterai kendaraan.</li>
              <li>Biaya tol, parkir, dan tiket destinasi ditanggung oleh penyewa.</li>
              <li>Kapasitas maksimal 3 penumpang. Kelebihan jam atau kilometer dihitung sesuai tarif operasional resmi.</li>
            </ul>
          </div>

        </div>
      </section>
    </div>
  );
};
