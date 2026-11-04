import React from 'react';
import { Calendar, Navigation, Shield, Zap, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import {
  LiveryStripe,
  CornerStrapDecal,
  AeroSpeedGraphic,
  CarLiveryDecalTag,
  LiveryDividerStripe,
  SectionTechPattern
} from './EvLiveryDecals';

interface HeroProps {
  onOpenRental: () => void;
  onOpenTaxi: () => void;
  onNavigateCity?: (cityKey: 'surabaya' | 'sidoarjo' | 'malang' | 'taxi') => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenRental, onOpenTaxi, onNavigateCity }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-mint/40 via-white to-slate-50 pt-8 pb-10 sm:pt-12 sm:pb-14 lg:pt-16 lg:pb-18">
      {/* Background Tech Texture Decal */}
      <SectionTechPattern />

      {/* Ornamen Background: Garis Livery Aerodinamis */}
      <div className="absolute top-0 right-0 w-full max-w-2xl pointer-events-none opacity-40 -mr-12 -mt-2">
        <AeroSpeedGraphic />
      </div>
      <div className="absolute bottom-0 left-0 w-full max-w-xl pointer-events-none opacity-25 -ml-12 rotate-180">
        <AeroSpeedGraphic />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Sisi Kiri: Headline, Wilayah, & Tombol Aksi */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            
            {/* Wilayah Layanan & Status Operasional */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold text-slate-700">
              <LiveryStripe variant="slanted" />
              <div className="inline-flex items-center gap-1.5 bg-white border border-brand-teal/30 px-3 py-1 rounded-full text-brand-teal text-xs font-black uppercase tracking-wide shadow-2xs font-mono">
                <MapPin className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                <span>Surabaya · Sidoarjo · Malang</span>
              </div>
              <span className="text-slate-300 font-bold" aria-hidden="true">·</span>
              <span className="text-slate-600 font-bold text-[11px] sm:text-xs">Armada VinFast Modern</span>
            </div>

            {/* Main H1 Headline dengan Keyword Utama yang Alami */}
            <header className="space-y-2">
              <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-brand-primary leading-[1.2] sm:leading-[1.15]">
                Belum Pernah Mencoba Mobil Listrik?{' '}
                <span className="text-brand-teal block sm:inline mt-1 sm:mt-0">
                  Saatnya Rasakan Sendiri!
                </span>
              </h1>
              {/* Horizontal Livery Accent Bar */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="h-1.5 w-16 sm:w-24 rounded-full bg-brand-lime" />
                <span className="h-1.5 w-32 sm:w-44 rounded-full bg-brand-teal" />
                <span className="h-1.5 w-10 sm:w-16 rounded-full bg-brand-primary" />
              </div>
            </header>

            {/* Paragraf Singkat & Padat dengan Target Keyword SEO */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-normal">
              Nikmati kenyamanan <strong>sewa mobil listrik dengan driver</strong> dan <strong>taksi mobil listrik</strong> bersama <strong>Surabaya EV Rent</strong> (Powered by Smart Journey). Perjalanan senyap, sejuk, dan ramah lingkungan dengan armada modern VinFast VF 5 dan VF e34.
            </p>

            {/* Dua CTA Utama */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button
                onClick={onOpenRental}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm sm:text-base font-extrabold text-white bg-brand-teal hover:bg-brand-teal-hover border-2 border-brand-teal rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer min-h-[48px]"
              >
                <Calendar className="w-4 h-4 text-brand-lime shrink-0" />
                <span>Pesan Rental Mobil</span>
              </button>

              <button
                onClick={onOpenTaxi}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm sm:text-base font-extrabold text-brand-primary bg-white hover:bg-brand-mint border-2 border-slate-300 hover:border-brand-teal/50 rounded-xl transition-all cursor-pointer min-h-[48px] shadow-xs"
              >
                <Navigation className="w-4 h-4 text-brand-teal shrink-0" />
                <span>Pesan Taksi (Rp7.000/km)</span>
              </button>
            </div>

            {/* Internal Links Pintasan Wilayah untuk Google Indexing */}
            {onNavigateCity && (
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 font-semibold">Pilihan Wilayah:</span>
                <button
                  onClick={() => onNavigateCity('surabaya')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-brand-teal hover:border-brand-teal font-bold transition-colors cursor-pointer"
                >
                  Surabaya
                </button>
                <button
                  onClick={() => onNavigateCity('sidoarjo')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-brand-teal hover:border-brand-teal font-bold transition-colors cursor-pointer"
                >
                  Sidoarjo
                </button>
                <button
                  onClick={() => onNavigateCity('malang')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-brand-teal hover:border-brand-teal font-bold transition-colors cursor-pointer"
                >
                  Malang &amp; Batu
                </button>
              </div>
            )}

            {/* Ringkasan Fasilitas Singkat */}
            <div className="pt-4 border-t border-slate-200">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center sm:text-left">
                <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[11px] sm:text-xs font-black text-brand-primary block">
                    Termasuk Driver
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Pengemudi Profesional</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[11px] sm:text-xs font-black text-brand-primary block">
                    Termasuk Baterai
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Daya Penuh Siap Jalan</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[11px] sm:text-xs font-black text-brand-primary block">
                    Maks. 3 Penumpang
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Kabin Bersih &amp; Senyap</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Foto Kendaraan Armada dengan Alt Text Deskriptif */}
          <div className="lg:col-span-5 w-full">
            <div className="relative rounded-2xl sm:rounded-3xl bg-white border-2 border-brand-teal/30 shadow-lg p-4 sm:p-6 overflow-hidden">
              
              {/* Livery Badge */}
              <div className="absolute top-0 right-0 z-10">
                <CornerStrapDecal label="100% EV FLEET" />
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100 pr-28">
                <div>
                  <span className="text-[11px] font-black text-brand-teal uppercase tracking-wider font-mono">
                    Armada Resmi
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-brand-primary">
                    VinFast Electric Fleet
                  </h2>
                </div>
              </div>

              {/* Foto Kendaraan dengan Width/Height dan Alt Text SEO */}
              <div className="relative my-3 aspect-16/10 rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80"
                  alt="Armada rental mobil listrik VinFast VF 5 dan VF e34 Surabaya EV Rent di Jawa Timur"
                  width="1200"
                  height="750"
                  className="w-full h-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                  referrerPolicy="no-referrer"
                />
                
                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                
                {/* Livery Tag */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <CarLiveryDecalTag
                    text="VINFAST VF SERIES"
                    sub="SMART JOURNEY"
                  />
                </div>

                {/* Subtitle Foto */}
                <div className="absolute bottom-2.5 left-3 right-3 text-white flex items-end justify-between z-10">
                  <div>
                    <span className="text-[10px] sm:text-xs font-black text-brand-lime font-mono">
                      VF 5 &amp; VF e34
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white">Full Electric SUV</h3>
                  </div>
                  <span className="text-[10px] bg-slate-900/90 border border-brand-lime/40 px-2 py-0.5 rounded text-brand-lime font-mono font-bold">
                    Zero Emission
                  </span>
                </div>
              </div>

              {/* Rangkuman Cepat Layanan */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-slate-700">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Rental dengan Driver (H-1)</span>
                  <span className="font-bold text-brand-primary">3, 5, 8, &amp; 12 Jam</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Taksi Point-to-Point</span>
                  <span className="font-bold text-brand-teal">Rp7.000 / km</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Garis Pembatas Section */}
      <div className="mt-8 sm:mt-12">
        <LiveryDividerStripe />
      </div>
    </section>
  );
};
