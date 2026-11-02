import React from 'react';
import { Calendar, Navigation, Shield, Zap, Sparkles } from 'lucide-react';
import {
  LiveryStripe,
  CornerStrapDecal,
  AeroSpeedGraphic,
  CarLiveryDecalTag
} from './EvLiveryDecals';

interface HeroProps {
  onOpenRental: () => void;
  onOpenTaxi: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenRental, onOpenTaxi }) => {
  return (
    <section className="relative overflow-hidden bg-radial-[at_top_right] from-brand-mint via-white to-white pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-24 border-b border-brand-teal/15">
      
      {/* Ornamen Background: Garis Aerodinamis Livery Mobil Listrik */}
      <div className="absolute top-0 right-0 w-full max-w-2xl pointer-events-none opacity-35 -mr-16 -mt-4">
        <AeroSpeedGraphic />
      </div>
      <div className="absolute bottom-0 left-0 w-full max-w-xl pointer-events-none opacity-20 -ml-12 rotate-180">
        <AeroSpeedGraphic />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 items-center">
          
          {/* Sisi Kiri: Headline, Penjelasan & Tombol Aksi */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            
            {/* Top Badge Operasional dengan Strap Stiker Balap /// */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold text-slate-600">
              <LiveryStripe variant="slanted" />
              <span className="inline-flex items-center gap-1.5 bg-brand-mint border border-brand-teal/20 px-3 py-1 rounded-full text-brand-teal text-xs font-extrabold uppercase tracking-wide shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-brand-lime shrink-0 fill-brand-lime" />
                <span>100% Mobil Listrik Modern</span>
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600 font-semibold">Surabaya · Sidoarjo · Malang</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-brand-primary leading-[1.2] sm:leading-[1.15]">
              BELUM PERNAH MENCOBA MOBIL LISTRIK?{' '}
              <span className="text-brand-teal block sm:inline mt-1 sm:mt-0">SAATNYA BERSAMA SURABAYA EV RENT!</span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Nikmati kenyamanan mobilitas ramah lingkungan bersama <strong>Surabaya EV Rent</strong> (Powered by Smart Journey). Layanan rental harian (H-1) dan taksi listrik di Surabaya, Sidoarjo, dan Malang dengan armada modern VinFast VF 5 &amp; VF e34 serta driver profesional bersertifikasi.
            </p>

            {/* Dua CTA Utama: Full width on mobile, auto on sm+ */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <button
                onClick={onOpenRental}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 text-sm sm:text-base font-bold text-white bg-brand-teal hover:bg-brand-teal-hover rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer min-h-[48px]"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-brand-lime shrink-0" />
                <span>Pesan Rental Mobil</span>
              </button>

              <button
                onClick={onOpenTaxi}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 text-sm sm:text-base font-bold text-brand-primary bg-white hover:bg-brand-mint border border-slate-300 rounded-xl transition-all cursor-pointer min-h-[48px]"
              >
                <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-brand-teal shrink-0" />
                <span>Pesan Taksi (Rp7.000/km)</span>
              </button>
            </div>

            {/* Badges Inklusi Layanan: Tampil Mendatar (Horizontal) di Semua Layar Termasuk HP */}
            <div className="pt-4 sm:pt-6 border-t border-slate-200">
              <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                {/* Badge 1: Termasuk Driver */}
                <div className="relative group flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/95 border border-slate-200 hover:border-brand-teal/50 shadow-2xs transition-all text-center sm:text-left overflow-hidden">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-mint text-brand-teal flex items-center justify-center shrink-0 border border-brand-teal/20">
                    <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-teal" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-extrabold text-brand-primary leading-tight block">
                      Sudah Termasuk Driver
                    </span>
                    <span className="text-[9px] text-slate-500 hidden sm:block leading-none mt-0.5 font-medium">
                      Driver Profesional
                    </span>
                  </div>
                  {/* Mini livery accent stripe on bottom */}
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-teal opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Badge 2: Termasuk Listrik */}
                <div className="relative group flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/95 border border-slate-200 hover:border-brand-teal/50 shadow-2xs transition-all text-center sm:text-left overflow-hidden">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-mint text-brand-lime flex items-center justify-center shrink-0 border border-brand-teal/20">
                    <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-lime fill-brand-lime" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-extrabold text-brand-primary leading-tight block">
                      Sudah Termasuk Listrik
                    </span>
                    <span className="text-[9px] text-slate-500 hidden sm:block leading-none mt-0.5 font-medium">
                      Baterai Siap Pakai
                    </span>
                  </div>
                  {/* Mini livery accent stripe on bottom */}
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-lime opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Badge 3: 3 Penumpang */}
                <div className="relative group flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/95 border border-slate-200 hover:border-brand-teal/50 shadow-2xs transition-all text-center sm:text-left overflow-hidden">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-mint text-brand-teal flex items-center justify-center shrink-0 border border-brand-teal/20">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-teal" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-extrabold text-brand-primary leading-tight block">
                      Maks. 3 Penumpang
                    </span>
                    <span className="text-[9px] text-slate-500 hidden sm:block leading-none mt-0.5 font-medium">
                      Kenyamanan Kabin
                    </span>
                  </div>
                  {/* Mini livery accent stripe on bottom */}
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-teal opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Visual Card Kendaraan VinFast VF Modern dengan Ornamen Decal Stiker Mobil */}
          <div className="lg:col-span-5 w-full">
            <div className="relative rounded-2xl bg-white border border-brand-teal/20 shadow-md p-4 sm:p-6 overflow-hidden">
              
              {/* Ornamen Pojok Kartu: Stiker Livery Sudut */}
              <div className="absolute top-0 right-0 z-10">
                <CornerStrapDecal label="EV LIVERY // JATIM" />
              </div>

              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 pr-28">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-lime" />
                    <span className="text-[10px] sm:text-xs font-bold text-brand-teal uppercase tracking-wide">
                      Armada Resmi
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-brand-primary">
                    VinFast Electric Fleet
                  </h3>
                </div>
              </div>

              {/* Showcase Ilustrasi / Foto Model VinFast dengan Stiker Decal Bodi Mobil */}
              <div className="relative my-3 sm:my-4 aspect-16/10 rounded-xl overflow-hidden bg-brand-dark flex items-center justify-center border border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80"
                  alt="Armada Mobil Listrik VinFast Modern"
                  className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                
                {/* Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent pointer-events-none" />
                
                {/* Stiker Decal Tempelan Mobil di Atas Kiri Gambar */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <CarLiveryDecalTag
                    text="VINFAST VF FLEET"
                    sub="100% SMART EV LIVERY"
                  />
                </div>

                {/* Info Text Bawah Foto */}
                <div className="absolute bottom-2.5 sm:bottom-3 left-3 sm:left-4 right-3 sm:right-4 text-white flex items-end justify-between z-10">
                  <div>
                    <span className="text-[10px] sm:text-xs font-bold text-brand-lime font-mono">
                      VF 5 &amp; VF e34 SERIES
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-white">100% Full Electric SUV</h4>
                  </div>
                  <span className="text-[10px] sm:text-xs bg-brand-dark/90 border border-brand-lime/40 backdrop-blur-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-brand-lime font-semibold font-mono">
                    Zero Emission
                  </span>
                </div>
              </div>

              {/* Informasi Singkat Layanan */}
              <div className="space-y-1.5 sm:space-y-2 pt-1 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Pilihan Layanan</span>
                  <span className="font-bold text-brand-primary text-right">Rental H-1 &amp; Taksi Listrik</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Paket Durasi</span>
                  <span className="font-bold text-brand-primary text-right">3, 5, 8, dan 12 Jam</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Tarif Taksi Jarak</span>
                  <span className="font-extrabold text-brand-teal text-right">Mulai Rp7.000 / km</span>
                </div>
              </div>

              {/* Ornamen Garis Bawah Kartu (Dual Color Racing Stripe) */}
              <div className="mt-3 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 h-1.5 flex">
                <div className="w-1/4 bg-brand-lime" />
                <div className="w-1/2 bg-brand-teal" />
                <div className="w-1/4 bg-brand-primary" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
