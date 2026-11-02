import React from 'react';
import { Calendar, Navigation, Shield, Zap, Sparkles } from 'lucide-react';
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
}

export const Hero: React.FC<HeroProps> = ({ onOpenRental, onOpenTaxi }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-mint/40 via-white to-slate-50 pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20">
      {/* Background Tech Texture Decal: Mencegah section terasa polos */}
      <SectionTechPattern />

      {/* Ornamen Background: Garis Aerodinamis Livery Mobil Listrik Tebal */}
      <div className="absolute top-0 right-0 w-full max-w-2xl pointer-events-none opacity-45 -mr-12 -mt-2">
        <AeroSpeedGraphic />
      </div>
      <div className="absolute bottom-0 left-0 w-full max-w-xl pointer-events-none opacity-30 -ml-12 rotate-180">
        <AeroSpeedGraphic />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-10 items-center">
          
          {/* Sisi Kiri: Headline, Penjelasan & Tombol Aksi */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            
            {/* Top Badge Operasional dengan Strap Stiker Balap Tebal /// */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-700">
              <LiveryStripe variant="slanted" />
              <span className="inline-flex items-center gap-2 bg-white border-2 border-brand-teal/40 px-3.5 py-1.5 rounded-full text-brand-teal text-xs font-black uppercase tracking-wide shadow-sm">
                <Zap className="w-4 h-4 text-brand-lime shrink-0 fill-brand-lime" />
                <span>100% Mobil Listrik Modern</span>
              </span>
              <span className="text-slate-300 font-bold">·</span>
              <span className="text-slate-700 font-bold">Surabaya · Sidoarjo · Malang</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-brand-primary leading-[1.2] sm:leading-[1.15]">
                BELUM PERNAH MENCOBA MOBIL LISTRIK?{' '}
                <span className="text-brand-teal block sm:inline mt-1 sm:mt-0 drop-shadow-2xs">
                  SAATNYA BERSAMA SURABAYA EV RENT!
                </span>
              </h1>
              {/* Bold Horizontal Livery Accent Bar */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="h-2 w-16 sm:w-24 rounded-full bg-brand-lime shadow-xs" />
                <span className="h-2 w-32 sm:w-44 rounded-full bg-brand-teal shadow-xs" />
                <span className="h-2 w-10 sm:w-16 rounded-full bg-brand-primary shadow-xs" />
              </div>
            </div>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
              Nikmati kenyamanan mobilitas ramah lingkungan bersama <strong>Surabaya EV Rent</strong> (Powered by PT Sawah Jaya Trans). Layanan rental harian (H-1) dan taksi listrik di Surabaya, Sidoarjo, dan Malang dengan armada modern VinFast VF 5 &amp; VF e34 serta driver profesional bersertifikasi.
            </p>

            {/* Dua CTA Utama */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onOpenRental}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm sm:text-base font-extrabold text-white bg-brand-teal hover:bg-brand-teal-hover border-2 border-brand-teal rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer min-h-[50px]"
              >
                <Calendar className="w-5 h-5 text-brand-lime shrink-0" />
                <span>Pesan Rental Mobil</span>
              </button>

              <button
                onClick={onOpenTaxi}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm sm:text-base font-extrabold text-brand-primary bg-white hover:bg-brand-mint border-2 border-slate-300 hover:border-brand-teal/50 rounded-xl transition-all cursor-pointer min-h-[50px] shadow-xs"
              >
                <Navigation className="w-5 h-5 text-brand-teal shrink-0" />
                <span>Pesan Taksi (Rp7.000/km)</span>
              </button>
            </div>

            {/* Badges Inklusi Layanan: Tebal, Berkontras Tinggi & Tiga Garis Balap */}
            <div className="pt-5 sm:pt-6 border-t-2 border-slate-200/80">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {/* Badge 1: Termasuk Driver */}
                <div className="relative group flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-white border-2 border-slate-200 hover:border-brand-teal shadow-xs transition-all text-center sm:text-left overflow-hidden">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-mint text-brand-teal flex items-center justify-center shrink-0 border-2 border-brand-teal/30">
                    <Shield className="w-4 h-4 text-brand-teal stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-black text-brand-primary leading-tight block">
                      Sudah Termasuk Driver
                    </span>
                    <span className="text-[9px] text-slate-500 hidden sm:block leading-none mt-0.5 font-semibold">
                      Driver Profesional
                    </span>
                  </div>
                  {/* Tebal Livery Bottom Accent */}
                  <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-lime to-brand-teal" />
                </div>

                {/* Badge 2: Termasuk Listrik */}
                <div className="relative group flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-white border-2 border-slate-200 hover:border-brand-teal shadow-xs transition-all text-center sm:text-left overflow-hidden">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-mint text-brand-lime flex items-center justify-center shrink-0 border-2 border-brand-teal/30">
                    <Zap className="w-4 h-4 text-brand-lime fill-brand-lime stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-black text-brand-primary leading-tight block">
                      Sudah Termasuk Listrik
                    </span>
                    <span className="text-[9px] text-slate-500 hidden sm:block leading-none mt-0.5 font-semibold">
                      Baterai Siap Pakai
                    </span>
                  </div>
                  {/* Tebal Livery Bottom Accent */}
                  <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-teal to-brand-lime" />
                </div>

                {/* Badge 3: 3 Penumpang */}
                <div className="relative group flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-white border-2 border-slate-200 hover:border-brand-teal shadow-xs transition-all text-center sm:text-left overflow-hidden">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-mint text-brand-teal flex items-center justify-center shrink-0 border-2 border-brand-teal/30">
                    <Sparkles className="w-4 h-4 text-brand-teal stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-black text-brand-primary leading-tight block">
                      Maks. 3 Penumpang
                    </span>
                    <span className="text-[9px] text-slate-500 hidden sm:block leading-none mt-0.5 font-semibold">
                      Kenyamanan Kabin
                    </span>
                  </div>
                  {/* Tebal Livery Bottom Accent */}
                  <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-primary to-brand-teal" />
                </div>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Visual Card Kendaraan VinFast VF Modern dengan Ornamen Decal Stiker Mobil Tebal */}
          <div className="lg:col-span-5 w-full">
            <div className="relative rounded-2xl sm:rounded-3xl bg-white border-2 border-brand-teal/30 shadow-xl p-5 sm:p-7 overflow-hidden">
              
              {/* Ornamen Pojok Kartu: Stiker Livery Sudut Tebal */}
              <div className="absolute top-0 right-0 z-10">
                <CornerStrapDecal label="EV LIVERY // JATIM" />
              </div>

              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b-2 border-slate-100 pr-32">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-lime shadow-xs animate-ping" />
                    <span className="text-[11px] sm:text-xs font-black text-brand-teal uppercase tracking-wider">
                      Armada Resmi Jatim
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-brand-primary mt-0.5">
                    VinFast Electric Fleet
                  </h3>
                </div>
              </div>

              {/* Showcase Ilustrasi / Foto Model VinFast dengan Stiker Decal Bodi Mobil */}
              <div className="relative my-4 aspect-16/10 rounded-2xl overflow-hidden bg-brand-dark flex items-center justify-center border-2 border-slate-800 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80"
                  alt="Armada Mobil Listrik VinFast Modern"
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                
                {/* Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent pointer-events-none" />
                
                {/* Stiker Decal Tempelan Mobil di Atas Kiri Gambar */}
                <div className="absolute top-3 left-3 z-10">
                  <CarLiveryDecalTag
                    text="VINFAST VF FLEET"
                    sub="100% SMART EV LIVERY"
                  />
                </div>

                {/* Info Text Bawah Foto */}
                <div className="absolute bottom-3 left-3.5 right-3.5 text-white flex items-end justify-between z-10">
                  <div>
                    <span className="text-[10px] sm:text-xs font-black text-brand-lime font-mono tracking-wider">
                      VF 5 &amp; VF e34 SERIES
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-white">100% Full Electric SUV</h4>
                  </div>
                  <span className="text-[10px] sm:text-xs bg-brand-dark/95 border-2 border-brand-lime/60 backdrop-blur-xs px-2.5 py-1 rounded-lg text-brand-lime font-black font-mono shadow-sm">
                    Zero Emission
                  </span>
                </div>
              </div>

              {/* Informasi Singkat Layanan */}
              <div className="space-y-2 pt-1 text-xs text-slate-700">
                <div className="flex justify-between py-1.5 border-b border-slate-100 font-semibold">
                  <span className="text-slate-500">Pilihan Layanan</span>
                  <span className="font-extrabold text-brand-primary text-right">Rental H-1 &amp; Taksi Listrik</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 font-semibold">
                  <span className="text-slate-500">Paket Durasi Rental</span>
                  <span className="font-extrabold text-brand-primary text-right">3, 5, 8, dan 12 Jam</span>
                </div>
                <div className="flex justify-between py-1.5 font-semibold">
                  <span className="text-slate-500">Tarif Taksi Jarak</span>
                  <span className="font-black text-brand-teal text-right text-sm">Mulai Rp7.000 / km</span>
                </div>
              </div>

              {/* Ornamen Garis Bawah Kartu Tebal 6px */}
              <div className="mt-4 -mx-5 -mb-5 sm:-mx-7 sm:-mb-7 h-2.5 flex shadow-sm">
                <div className="w-1/4 bg-brand-lime" />
                <div className="w-1/2 bg-brand-teal" />
                <div className="w-1/4 bg-brand-primary" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Garis Pembatas Section Tebal */}
      <div className="mt-8 sm:mt-12">
        <LiveryDividerStripe />
      </div>
    </section>
  );
};
