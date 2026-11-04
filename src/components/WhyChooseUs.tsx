import React from 'react';
import { UserCheck, Zap, BatteryCharging, CheckCircle2 } from 'lucide-react';
import { LiveryStripe, LiveryDividerStripe, SectionTechPattern } from './EvLiveryDecals';

interface AdvantageItem {
  id: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const WhyChooseUs: React.FC = () => {
  const advantages: AdvantageItem[] = [
    {
      id: 'driver',
      title: 'Driver Profesional',
      desc: 'Pengemudi berseragam, sopan, dan berpengalaman mengemudikan armada mobil listrik.',
      icon: UserCheck
    },
    {
      id: 'ev',
      title: '100% Mobil Listrik',
      desc: 'Armada VinFast modern yang senyap, sejuk, bersih, dan bebas emisi gas buang.',
      icon: Zap
    },
    {
      id: 'battery',
      title: 'Baterai & Unit Siap Tempuh',
      desc: 'Kendaraan selalu diperiksa rutin dengan kapasitas baterai prima sebelum penjemputan.',
      icon: BatteryCharging
    },
    {
      id: 'booking',
      title: 'Pemesanan Praktis',
      desc: 'Reservasi digital mudah dengan konfirmasi instan serta pelacakan status booking online.',
      icon: CheckCircle2
    }
  ];

  return (
    <section
      id="why-us-section"
      className="relative py-10 sm:py-14 bg-gradient-to-b from-slate-50 via-brand-mint/15 to-white overflow-hidden"
      aria-label="Mengapa Memilih Kami"
    >
      {/* Background Texture Decal */}
      <SectionTechPattern />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 mb-1.5">
            <LiveryStripe variant="compact" />
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-brand-teal font-mono">
              Keunggulan Layanan
            </span>
            <LiveryStripe variant="compact" className="rotate-180" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-primary">
            MENGAPA MEMILIH KAMI?
          </h2>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto mt-2 font-medium">
            Kenyamanan perjalanan terbaik bersama layanan transportasi listrik berstandar tinggi.
          </p>
        </div>

        {/* 4 Keunggulan: 4 Kolom di Desktop, 2 Kolom di Tablet, 1-2 di Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {advantages.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className="group relative bg-white rounded-2xl p-5 border-2 border-slate-200 hover:border-brand-teal hover:shadow-md transition-all duration-200 flex flex-col justify-between shadow-xs overflow-hidden"
              >
                {/* Top Corner Mini Accent */}
                <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden">
                  <div className="absolute transform rotate-45 bg-gradient-to-r from-brand-lime to-brand-teal w-12 h-1 top-2 -right-3 opacity-80" />
                </div>

                <div>
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-brand-mint text-brand-teal border border-brand-teal/20 group-hover:border-brand-teal group-hover:scale-105 transition-all duration-200 flex items-center justify-center mb-3.5 shadow-2xs">
                    <Icon className="w-5 h-5 text-brand-teal stroke-[2.2]" />
                  </div>

                  {/* Title & Description (Maksimal satu kalimat) */}
                  <h3 className="text-sm font-black text-brand-primary leading-tight group-hover:text-brand-teal transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom Livery Line */}
                <div className="mt-4 -mx-5 -mb-5 h-1 bg-gradient-to-r from-brand-lime to-brand-teal opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>

      </div>

      {/* Garis Pembatas Section */}
      <div className="mt-8 sm:mt-12">
        <LiveryDividerStripe />
      </div>
    </section>
  );
};
