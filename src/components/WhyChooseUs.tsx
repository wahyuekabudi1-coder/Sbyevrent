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
import { LiveryStripe } from './EvLiveryDecals';

interface BadgeItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

export const WhyChooseUs: React.FC = () => {
  const badges: BadgeItem[] = [
    {
      id: 'driver',
      title: 'Pengemudi Rajin',
      subtitle: 'Sopan & Berpengalaman',
      icon: UserCheck,
      accentColor: 'text-brand-teal'
    },
    {
      id: '24jam',
      title: 'Servis 24 Jam',
      subtitle: 'Siaga Setiap Saat',
      icon: Clock,
      accentColor: 'text-brand-teal'
    },
    {
      id: 'protection',
      title: 'Perlindungan',
      subtitle: 'Asuransi & Aman',
      icon: ShieldCheck,
      accentColor: 'text-brand-teal'
    },
    {
      id: 'ev',
      title: 'Mobil Listrik',
      subtitle: '100% Bebas Emisi',
      icon: Zap,
      accentColor: 'text-brand-lime'
    },
    {
      id: 'battery',
      title: 'Baterai Penuh',
      subtitle: 'Siap Langsung Jalan',
      icon: BatteryCharging,
      accentColor: 'text-brand-lime'
    },
    {
      id: 'pricing',
      title: 'Tarif Pasti',
      subtitle: 'Tanpa Biaya Siluman',
      icon: ReceiptText,
      accentColor: 'text-brand-teal'
    }
  ];

  return (
    <section
      id="about-section"
      className="py-6 sm:py-8 lg:py-10 bg-gradient-to-b from-white via-brand-mint/20 to-white border-b border-slate-200"
      aria-label="Mengapa Memilih Kami"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Header Ringkas & Terpadu dengan Strap Stiker Livery */}
        <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <LiveryStripe variant="slanted" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-mint border border-brand-teal/20 text-brand-teal text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-lime" />
              <span>Standar Layanan Resmi</span>
            </div>
            <LiveryStripe variant="slanted" className="rotate-180" />
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-brand-primary">
            MENGAPA MEMILIH KAMI?
          </h2>
          <p className="mt-0.5 text-slate-500 text-[11px] sm:text-xs leading-tight">
            Kombinasi layanan terbaik untuk perjalanan nyaman di Surabaya dan Sidoarjo.
          </p>
        </div>

        {/* 6 Ikon Badges Bersih & Kompak (Tanpa Foto Orang): 3 Kolom x 2 Baris di Mobile, 6 Kolom di Desktop */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
          {badges.map((b) => {
            const Icon = b.icon;

            return (
              <div
                key={b.id}
                className="group relative bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-slate-200/90 hover:border-brand-teal shadow-2xs hover:shadow-sm transition-all flex flex-col items-center text-center cursor-default overflow-hidden"
              >
                {/* Wadah Ikon Grafis Vektor Modern (Bukan Foto Orang) */}
                <div className="relative w-12 h-12 xs:w-13 xs:h-13 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-brand-mint via-white to-brand-mint/50 border-2 border-brand-teal/20 group-hover:border-brand-teal group-hover:bg-brand-teal group-hover:scale-105 transition-all duration-300 flex items-center justify-center shadow-xs shrink-0">
                  <Icon className="w-6 h-6 xs:w-6.5 xs:h-6.5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-brand-teal group-hover:text-white transition-colors duration-300 stroke-[2.2]" />
                  
                  {/* Titik Aksen Ornamen Livery Hijau Neon */}
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-lime border-2 border-white shadow-2xs group-hover:scale-110 transition-transform" />
                </div>

                {/* Judul Badge Keterangan Singkat */}
                <h3 className="mt-2 sm:mt-2.5 text-[11px] xs:text-xs sm:text-sm font-extrabold text-brand-primary leading-tight group-hover:text-brand-teal transition-colors">
                  {b.title}
                </h3>
                <p className="mt-0.5 text-[9px] xs:text-[10px] sm:text-xs font-semibold text-slate-500 leading-tight">
                  {b.subtitle}
                </p>

                {/* Ornamen Strap Stiker Mini di Dasar Kartu */}
                <div className="absolute bottom-0 inset-x-0 h-0.5 flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1/2 bg-brand-lime" />
                  <div className="w-1/2 bg-brand-teal" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
