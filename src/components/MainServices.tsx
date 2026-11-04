import React from 'react';
import { Calendar, Navigation, ShieldCheck, Zap, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { LiveryStripe, LiveryDividerStripe, SectionTechPattern } from './EvLiveryDecals';

interface MainServicesProps {
  onOpenRental: () => void;
  onOpenTaxi: () => void;
}

export const MainServices: React.FC<MainServicesProps> = ({ onOpenRental, onOpenTaxi }) => {
  return (
    <section id="services-section" className="relative py-10 sm:py-14 lg:py-16 bg-slate-50/70 overflow-hidden">
      {/* Background Tech Pattern */}
      <SectionTechPattern />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <LiveryStripe variant="compact" />
            <span className="text-[11px] sm:text-xs font-black tracking-wider text-brand-teal uppercase font-mono">
              Solusi Mobilitas Lengkap
            </span>
            <LiveryStripe variant="compact" className="rotate-180" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-primary">
            DUA LAYANAN UTAMA
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">
            Pilih jenis layanan yang paling tepat untuk mobilitas harian maupun agenda penting Anda.
          </p>
        </div>

        {/* 2 Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          
          {/* KARTU 1: RENTAL MOBIL LISTRIK DENGAN DRIVER */}
          <div className="relative rounded-2xl sm:rounded-3xl bg-white border-2 border-slate-200 hover:border-brand-teal transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-lg overflow-hidden group">
            {/* Top Accent Livery Stripe */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-lime via-brand-teal to-brand-primary" />

            <div>
              {/* Header Card */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-mint text-brand-teal flex items-center justify-center border-2 border-brand-teal/20 group-hover:scale-105 transition-transform">
                  <Calendar className="w-6 h-6 text-brand-teal" />
                </div>
                <span className="text-[11px] font-black text-brand-teal bg-brand-mint px-3 py-1 rounded-full border border-brand-teal/25 font-mono">
                  Sewa Harian · Reservasi H-1
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-brand-primary tracking-tight">
                Rental Mobil Listrik dengan Driver
              </h3>

              {/* Manfaat Layanan */}
              <div className="mt-4 space-y-2.5">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Manfaat Layanan:
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                    <span>Perjalanan leluasa untuk agenda bisnis, kunjungan kerja, dan perjalanan keluarga.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                    <span>Sudah termasuk jasa pengemudi profesional dan pengisian daya baterai mobil.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                    <span>Fleksibel memilih paket durasi 3, 5, 8, atau 12 jam dengan armada VinFast modern.</span>
                  </li>
                </ul>
              </div>

              {/* Cara Pemesanan */}
              <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50/70 -mx-6 sm:-mx-7 px-6 sm:px-7 py-3.5">
                <h4 className="text-[11px] font-black uppercase text-brand-primary tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Cara Pemesanan:</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Reservasi minimal H-1 secara online. Tentukan tipe mobil (VF 5 / VF e34), durasi sewa, tanggal penjemputan, serta alamat penjemputan Anda.
                </p>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-6 mt-2">
              <button
                onClick={onOpenRental}
                className="w-full py-3.5 px-5 text-center text-xs sm:text-sm font-black text-white bg-brand-teal hover:bg-brand-teal-hover rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer min-h-[48px] flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-brand-lime" />
                <span>Pesan Rental Mobil (H-1)</span>
              </button>
            </div>
          </div>

          {/* KARTU 2: TAKSI MOBIL LISTRIK */}
          <div className="relative rounded-2xl sm:rounded-3xl bg-white border-2 border-slate-200 hover:border-brand-teal transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-lg overflow-hidden group">
            {/* Top Accent Livery Stripe */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-teal via-brand-lime to-brand-primary" />

            <div>
              {/* Header Card */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-mint text-brand-primary flex items-center justify-center border-2 border-brand-teal/20 group-hover:scale-105 transition-transform">
                  <Navigation className="w-6 h-6 text-brand-teal" />
                </div>
                <span className="text-[11px] font-black text-brand-primary bg-lime-100/80 px-3 py-1 rounded-full border border-lime-300 font-mono">
                  Point-to-Point · Rp7.000 / km
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-brand-primary tracking-tight">
                Taksi Mobil Listrik
              </h3>

              {/* Manfaat Layanan */}
              <div className="mt-4 space-y-2.5">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Manfaat Layanan:
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                    <span>Layanan perjalanan langsung dari titik penjemputan menuju tujuan tanpa sewa per jam.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                    <span>Tarif pasti Rp7.000/km (minimum Rp25.000) transparan berbasis jarak riil tanpa lonjakan harga.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                    <span>Kenyamanan kabin mobil listrik yang bersih, sejuk, senyap, serta bebas bau bensin.</span>
                  </li>
                </ul>
              </div>

              {/* Cara Pemesanan */}
              <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50/70 -mx-6 sm:-mx-7 px-6 sm:px-7 py-3.5">
                <h4 className="text-[11px] font-black uppercase text-brand-primary tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Cara Pemesanan:</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Tentukan alamat penjemputan dan alamat tujuan. Sistem akan menghitung estimasi jarak kilometer serta total ongkos secara otomatis sebelum Anda mengonfirmasi pesanan.
                </p>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-6 mt-2">
              <button
                onClick={onOpenTaxi}
                className="w-full py-3.5 px-5 text-center text-xs sm:text-sm font-black text-brand-primary bg-brand-mint hover:bg-brand-teal-light border-2 border-brand-teal/40 hover:border-brand-teal rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer min-h-[48px] flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-brand-teal fill-brand-teal" />
                <span>Pesan Taksi Listrik (Rp7.000/km)</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Garis Pembatas Section */}
      <div className="pt-10 sm:pt-14">
        <LiveryDividerStripe />
      </div>
    </section>
  );
};
