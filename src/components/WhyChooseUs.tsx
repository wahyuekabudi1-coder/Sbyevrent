import React from 'react';
import {
  UserCheck,
  Clock,
  ShieldCheck,
  Zap,
  BatteryCharging,
  ReceiptText,
  Sparkles
} from 'lucide-react';
import { LiveryStripe, LiveryDividerStripe, SectionTechPattern } from './EvLiveryDecals';

interface BadgeItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  borderAccent: string;
}

export const WhyChooseUs: React.FC = () => {
  const badges: BadgeItem[] = [
    {
      id: 'driver',
      title: 'Pengemudi Rajin',
      subtitle: 'Sopan & Berpengalaman',
      icon: UserCheck,
      accentColor: 'text-brand-teal',
      badgeBg: 'bg-gradient-to-br from-brand-mint via-teal-50 to-emerald-50',
      borderAccent: 'border-brand-teal/30 group-hover:border-brand-teal'
    },
    {
      id: '24jam',
      title: 'Servis 24 Jam',
      subtitle: 'Siaga Setiap Saat',
      icon: Clock,
      accentColor: 'text-emerald-700',
      badgeBg: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-brand-mint',
      borderAccent: 'border-emerald-200 group-hover:border-emerald-600'
    },
    {
      id: 'protection',
      title: 'Perlindungan',
      subtitle: 'Asuransi & Aman',
      icon: ShieldCheck,
      accentColor: 'text-sky-700',
      badgeBg: 'bg-gradient-to-br from-sky-50 via-teal-50 to-slate-50',
      borderAccent: 'border-sky-200 group-hover:border-sky-600'
    },
    {
      id: 'ev',
      title: 'Mobil Listrik',
      subtitle: '100% Bebas Emisi',
      icon: Zap,
      accentColor: 'text-brand-teal',
      badgeBg: 'bg-gradient-to-br from-brand-mint via-lime-50 to-teal-50',
      borderAccent: 'border-lime-300 group-hover:border-brand-teal'
    },
    {
      id: 'battery',
      title: 'Baterai Penuh',
      subtitle: 'Siap Langsung Jalan',
      icon: BatteryCharging,
      accentColor: 'text-emerald-600',
      badgeBg: 'bg-gradient-to-br from-teal-50 via-emerald-50 to-lime-50',
      borderAccent: 'border-teal-200 group-hover:border-emerald-600'
    },
    {
      id: 'pricing',
      title: 'Tarif Pasti',
      subtitle: 'Tanpa Biaya Siluman',
      icon: ReceiptText,
      accentColor: 'text-brand-primary',
      badgeBg: 'bg-gradient-to-br from-slate-50 via-brand-mint to-teal-50',
      borderAccent: 'border-slate-300 group-hover:border-brand-primary'
    }
  ];

  return (
    <section
      id="about-section"
      className="relative py-6 sm:py-8 lg:py-10 bg-gradient-to-b from-slate-50 via-brand-mint/20 to-white overflow-hidden"
      aria-label="Mengapa Memilih Kami"
    >
      {/* Background Texture Decal */}
      <SectionTechPattern />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header dengan Ornamen Livery Tebal yang Ringkas */}
        <div className="text-center max-w-xl mx-auto mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 mb-1.5">
            <LiveryStripe variant="compact" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border-2 border-brand-teal/40 text-brand-teal text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-lime" />
              <span>Standar Layanan Resmi</span>
            </div>
            <LiveryStripe variant="compact" className="rotate-180" />
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-brand-primary">
            MENGAPA MEMILIH KAMI?
          </h2>

          {/* Underline Ornamen Balap */}
          <div className="flex justify-center my-2">
            <LiveryStripe variant="horizontal" />
          </div>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto font-medium">
            Kombinasi layanan terbaik dan armada terawat untuk perjalanan nyaman di Surabaya dan Sidoarjo.
          </p>
        </div>

        {/* 6 Badges: 3 di atas, 3 di bawah, ukuran ringkas & hemat tempat */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 max-w-4xl mx-auto">
          {badges.map((b) => {
            const Icon = b.icon;

            return (
              <div
                key={b.id}
                className={`group relative bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border-2 ${b.borderAccent} hover:shadow-md hover:border-brand-teal transition-all duration-200 flex flex-col sm:flex-row items-center sm:text-left text-center gap-2 sm:gap-3 cursor-default overflow-hidden`}
              >
                {/* Top Corner Mini Stripe Accent */}
                <div className="absolute top-0 right-0 w-6 h-6 pointer-events-none overflow-hidden">
                  <div className="absolute transform rotate-45 bg-gradient-to-r from-brand-lime to-brand-teal w-8 h-1.5 top-1 -right-2 opacity-80" />
                </div>

                {/* Icon Container Ringkas & Elegan */}
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl ${b.badgeBg} border-2 border-brand-teal/20 group-hover:border-brand-teal group-hover:scale-105 transition-all duration-200 shadow-2xs flex items-center justify-center shrink-0`}
                >
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${b.accentColor} stroke-[2.3]`} />
                </div>

                {/* Keterangan Teks Padat */}
                <div className="min-w-0">
                  <h3 className="text-[11px] sm:text-xs md:text-sm font-black text-brand-primary leading-tight group-hover:text-brand-teal transition-colors truncate">
                    {b.title}
                  </h3>
                  <p className="mt-0.5 text-[9px] sm:text-[11px] font-bold text-slate-500 leading-tight truncate">
                    {b.subtitle}
                  </p>
                </div>

                {/* Ornamen Garis Balap Mini di Dasar Kartu */}
                <div className="absolute bottom-0 inset-x-0 h-1 flex opacity-60 group-hover:opacity-100 transition-opacity">
                  <div className="w-1/2 bg-brand-lime" />
                  <div className="w-1/2 bg-brand-teal" />
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Garis Pembatas Section Tebal */}
      <div className="mt-6 sm:mt-8">
        <LiveryDividerStripe />
      </div>
    </section>
  );
};
