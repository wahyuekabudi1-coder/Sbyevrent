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
  image: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const WhyChooseUs: React.FC = () => {
  const badges: BadgeItem[] = [
    {
      id: 'driver',
      title: 'Pengemudi Rajin',
      subtitle: 'Sopan & Berpengalaman',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
      icon: UserCheck
    },
    {
      id: '24jam',
      title: 'Servis 24 Jam',
      subtitle: 'Siaga Setiap Saat',
      image: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=400&q=80',
      icon: Clock
    },
    {
      id: 'protection',
      title: 'Perlindungan',
      subtitle: 'Asuransi & Aman',
      image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80',
      icon: ShieldCheck
    },
    {
      id: 'ev',
      title: 'Mobil Listrik',
      subtitle: '100% Bebas Emisi',
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=400&q=80',
      icon: Zap
    },
    {
      id: 'battery',
      title: 'Baterai Penuh',
      subtitle: 'Siap Langsung Jalan',
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=400&q=80',
      icon: BatteryCharging
    },
    {
      id: 'pricing',
      title: 'Tarif Pasti',
      subtitle: 'Tanpa Biaya Siluman',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
      icon: ReceiptText
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
            Kombinasi layanan terbaik untuk perjalanan nyaman di Surabaya, Sidoarjo, dan Malang.
          </p>
        </div>

        {/* 6 Badges Kompak: Muat dalam 1 Tampilan Layar HP (3 Kolom x 2 Baris di Mobile, 6 Kolom di Desktop) */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
          {badges.map((b) => {
            const Icon = b.icon;

            return (
              <div
                key={b.id}
                className="group relative bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-slate-200 hover:border-brand-teal shadow-2xs hover:shadow-xs transition-all flex flex-col items-center text-center cursor-default overflow-hidden"
              >
                {/* Gambar / Foto Nyata dengan Icon Badge */}
                <div className="relative w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-brand-teal/20 group-hover:border-brand-teal group-hover:scale-105 transition-all shadow-xs shrink-0 bg-slate-900">
                  <img
                    src={b.image}
                    alt={b.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Icon badge kecil di sudut gambar */}
                  <div className="absolute bottom-1 right-1 w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 rounded-md bg-brand-primary/95 text-brand-lime flex items-center justify-center shadow-xs border border-brand-lime/30">
                    <Icon className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 stroke-[2.2]" />
                  </div>
                </div>

                {/* Judul Badge Keterangan Singkat (Bukan teks detail panjang) */}
                <h3 className="mt-2 text-[11px] xs:text-xs sm:text-sm font-extrabold text-brand-primary leading-tight group-hover:text-brand-teal transition-colors">
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
