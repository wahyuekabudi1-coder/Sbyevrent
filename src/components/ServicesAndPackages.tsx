import React, { useState } from 'react';
import { Calendar, Navigation, CheckCircle2, Info, Zap } from 'lucide-react';
import {
  LiveryStripe,
  CornerStrapDecal,
  LiveryDividerStripe,
  SectionTechPattern
} from './EvLiveryDecals';
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
    <div className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-slate-100 via-white to-slate-50 space-y-14 sm:space-y-18 overflow-hidden">
      {/* Background Tech Pattern */}
      <SectionTechPattern />

      {/* SECTION 5 — DUA KARTU LAYANAN UTAMA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center justify-center gap-2.5 mb-2.5">
            <LiveryStripe variant="slanted" />
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border-2 border-brand-teal/40 text-[11px] sm:text-xs font-black tracking-wider text-brand-teal uppercase shadow-xs">
              <Zap className="w-3.5 h-3.5 text-brand-lime fill-brand-lime" />
              <span>Solusi Perjalanan Terpadu</span>
            </span>
            <LiveryStripe variant="slanted" className="rotate-180" />
          </div>

          <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-brand-primary">
            DUA LAYANAN UTAMA KAMI
          </h2>

          <div className="flex justify-center my-3">
            <LiveryStripe variant="horizontal" />
          </div>

          <p className="mt-1 text-slate-600 text-xs sm:text-sm lg:text-base leading-relaxed max-w-2xl mx-auto font-medium">
            Fleksibilitas penuh untuk kebutuhan perjalanan harian, drop-off bandara, maupun sewa harian bersama driver berpengalaman.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
          {/* KARTU A: RENTAL MOBIL LISTRIK */}
          <div
            id="rental-section"
            className="relative p-6 sm:p-9 rounded-2xl sm:rounded-3xl border-2 border-brand-teal/40 bg-gradient-to-br from-brand-mint/60 via-white to-brand-mint/30 flex flex-col justify-between hover:border-brand-teal hover:shadow-2xl transition-all duration-300 shadow-md overflow-hidden"
          >
            {/* Corner Livery Strap Tebal */}
            <div className="absolute top-0 right-0 z-10">
              <CornerStrapDecal label="RENTAL H-1" />
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-teal text-white flex items-center justify-center shadow-md border-2 border-brand-teal/30">
                  <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-brand-lime" />
                </div>
                <span className="text-xs font-black text-brand-teal bg-white px-3 py-1.5 rounded-xl border-2 border-brand-teal/30 shadow-xs uppercase tracking-wider font-mono">
                  Layanan Resmi H-1
                </span>
              </div>

              <div>
                <span className="text-xs font-black text-brand-teal uppercase tracking-widest font-mono">
                  Sewa Per Jam &amp; Harian
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-brand-primary mt-1">
                  RENTAL MOBIL LISTRIK
                </h3>
                <p className="text-slate-600 mt-2 text-xs sm:text-sm leading-relaxed">
                  Rasakan pengalaman perjalanan menggunakan mobil listrik dengan layanan rental bersama driver profesional.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Pilihan wilayah Surabaya, Sidoarjo, dan Malang</span>
                </div>
                <div className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Pilihan armada resmi VinFast VF 5 dan VF e34</span>
                </div>
                <div className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Paket fleksibel: 3 jam, 5 jam, 8 jam, dan 12 jam</span>
                </div>
                <div className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Sudah termasuk driver dan listrik kendaraan</span>
                </div>
                <div className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Pemesanan terverifikasi dengan pembayaran online aman</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={() => onOpenRental()}
                className="w-full py-4 px-5 text-center font-black text-xs sm:text-sm text-white bg-brand-teal hover:bg-brand-teal-hover border-2 border-brand-teal rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer min-h-[50px] flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-brand-lime" />
                <span>Pesan Rental Mobil Sekarang</span>
              </button>
            </div>

            {/* Bottom Livery Stripe Tebal */}
            <div className="absolute bottom-0 inset-x-0 h-2 flex">
              <div className="w-1/3 bg-brand-lime" />
              <div className="w-1/3 bg-brand-teal" />
              <div className="w-1/3 bg-brand-primary" />
            </div>
          </div>

          {/* KARTU B: TAKSI MOBIL LISTRIK */}
          <div
            id="taxi-section"
            className="relative p-6 sm:p-9 rounded-2xl sm:rounded-3xl border-2 border-slate-300 bg-white flex flex-col justify-between hover:border-brand-teal hover:shadow-2xl transition-all duration-300 shadow-md overflow-hidden"
          >
            {/* Corner Livery Strap Tebal */}
            <div className="absolute top-0 right-0 z-10">
              <CornerStrapDecal label="TAKSI // KM" />
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-primary text-white flex items-center justify-center shadow-md border-2 border-brand-teal/30">
                  <Navigation className="w-6 h-6 sm:w-7 sm:h-7 text-brand-lime" />
                </div>
                <span className="text-xs font-black text-brand-primary bg-brand-mint px-3 py-1.5 rounded-xl border-2 border-brand-teal/30 shadow-xs uppercase tracking-wider font-mono">
                  Point-to-Point
                </span>
              </div>

              <div>
                <span className="text-xs font-black text-brand-teal uppercase tracking-widest font-mono">
                  Tarif Berdasarkan Jarak
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-brand-primary mt-1">
                  TAKSI MOBIL LISTRIK
                </h3>
                <p className="text-slate-600 mt-2 text-xs sm:text-sm leading-relaxed">
                  Layanan perjalanan instan menggunakan mobil listrik dengan tarif transparan berdasarkan jarak tempuh kilometer.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-brand-mint/60 border-2 border-brand-teal/30 shadow-xs">
                <span className="text-xs text-brand-teal font-black block uppercase tracking-wider font-mono">
                  Tarif Dasar Resmi
                </span>
                <div className="text-3xl sm:text-4xl font-black text-brand-primary mt-1">
                  Rp7.000 <span className="text-sm sm:text-base font-bold text-slate-500">/ kilometer</span>
                </div>
                <span className="text-xs text-slate-500 font-semibold block mt-1.5">
                  Minimal tarif Rp25.000 · Perhitungan rute presisi otomatis
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Pilih titik penjemputan dan tujuan langsung</span>
                </div>
                <div className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Estimasi jarak dan biaya transparan seketika</span>
                </div>
                <div className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Bisa dipesan sekarang atau dijadwalkan ke depan</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={onOpenTaxi}
                className="w-full py-4 px-5 text-center font-black text-xs sm:text-sm text-white bg-brand-primary hover:bg-brand-teal border-2 border-brand-primary hover:border-brand-teal rounded-xl transition-all cursor-pointer min-h-[50px] shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4 text-brand-lime" />
                <span>Kalkulasi Rute &amp; Pesan Taksi Listrik</span>
              </button>
            </div>

            {/* Bottom Livery Stripe Tebal */}
            <div className="absolute bottom-0 inset-x-0 h-2 flex">
              <div className="w-1/3 bg-brand-teal" />
              <div className="w-1/3 bg-brand-lime" />
              <div className="w-1/3 bg-brand-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — PAKET RENTAL & HARGA RESMI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="border-t-2 border-slate-200/90 pt-12 sm:pt-16">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <div className="inline-flex items-center gap-2 mb-1.5">
                <LiveryStripe variant="compact" />
                <span className="text-xs font-black tracking-wider text-brand-teal uppercase font-mono">
                  Daftar Paket Durasi
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-primary">
                PAKET RENTAL MOBIL LISTRIK
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                Tersedia 4 pilihan durasi waktu dengan batas kilometer yang transparan.
              </p>
            </div>

            {/* Model Selector Tabs: Tebal & Berbobot */}
            <div className="flex items-center p-1.5 bg-slate-200/80 rounded-2xl border-2 border-slate-300 w-full sm:w-auto shadow-inner">
              <button
                onClick={() => setSelectedModel('VinFast VF 5')}
                className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer min-h-[42px] ${
                  selectedModel === 'VinFast VF 5'
                    ? 'bg-brand-teal text-white shadow-md'
                    : 'text-slate-700 hover:text-brand-primary'
                }`}
              >
                VinFast VF 5
              </button>
              <button
                onClick={() => setSelectedModel('VinFast VF e34')}
                className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer min-h-[42px] ${
                  selectedModel === 'VinFast VF e34'
                    ? 'bg-brand-teal text-white shadow-md'
                    : 'text-slate-700 hover:text-brand-primary'
                }`}
              >
                VinFast VF e34
              </button>
            </div>
          </div>

          {/* Grid 4 Paket Durasi Tebal & Elegan */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayPackages.map((pkg, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl sm:rounded-3xl border-2 border-slate-300 bg-white p-5 sm:p-6 flex flex-col justify-between hover:border-brand-teal hover:shadow-xl transition-all duration-300 shadow-sm overflow-hidden"
              >
                {/* Top Corner Stripe */}
                <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden">
                  <div className="absolute transform rotate-45 bg-gradient-to-r from-brand-lime to-brand-teal w-12 h-1.5 top-1 -right-3 shadow-2xs" />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-bold text-slate-600">Durasi Paket</span>
                    <span className="font-black text-brand-teal bg-brand-mint px-2 py-0.5 rounded-md border border-brand-teal/20 text-[10px]">
                      + Driver &amp; Listrik
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-brand-primary">
                    Paket {pkg.duration_hours} Jam
                  </h3>
                  <div className="mt-1 text-xs text-slate-600 font-semibold">
                    Batas Jarak: <strong className="text-brand-primary font-black">{pkg.km_limit} km</strong>
                  </div>

                  <div className="my-5 py-4 border-y-2 border-slate-100 bg-slate-50/60 -mx-5 sm:-mx-6 px-5 sm:px-6">
                    <div className="text-2xl sm:text-3xl font-black text-brand-primary">
                      Rp{pkg.price.toLocaleString('id-ID')}
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-1 font-bold">
                      {selectedModel} · All-in supir &amp; baterai
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenRental({ model: selectedModel, hours: pkg.duration_hours })}
                  className="w-full py-3 px-4 text-center text-xs font-black text-brand-teal bg-brand-mint hover:bg-brand-teal hover:text-white border-2 border-brand-teal/30 hover:border-brand-teal rounded-xl transition-all cursor-pointer min-h-[46px] flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>Pilih Paket {pkg.duration_hours} Jam</span>
                </button>

                {/* Bottom Livery Stripe */}
                <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-lime to-brand-teal opacity-60 hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          {/* Aturan & Kebijakan Transparan dengan Top Livery Tebal */}
          <div className="mt-8 sm:mt-10 p-5 sm:p-6 rounded-2xl bg-white border-2 border-brand-teal/30 shadow-md text-xs text-slate-700 space-y-2 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-brand-lime via-brand-teal to-brand-primary" />
            <div className="flex items-center gap-2 font-black text-brand-primary text-xs sm:text-sm pt-1">
              <Info className="w-4 h-4 text-brand-teal shrink-0 stroke-[2.5]" />
              <span>Ketentuan Pemakaian Rental Surabaya EV Rent:</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-1 font-medium leading-relaxed">
              <li>Pemesanan rental wajib dilakukan minimal H-1 sebelum tanggal perjalanan.</li>
              <li>Satu kendaraan hanya melayani 1 penyewa per hari untuk menjamin kebersihan dan kesiapan daya baterai.</li>
              <li>Harga sudah termasuk driver dan pengisian daya baterai kendaraan.</li>
              <li>Biaya tol, parkir, dan tiket destinasi ditanggung oleh penyewa sesuai rute.</li>
              <li>Kapasitas maksimal 3 penumpang. Kelebihan jam atau kilometer dihitung sesuai tarif resmi.</li>
            </ul>
          </div>

        </div>
      </section>

      {/* Garis Pembatas Section Tebal */}
      <div className="pt-6 sm:pt-10">
        <LiveryDividerStripe />
      </div>
    </div>
  );
};
