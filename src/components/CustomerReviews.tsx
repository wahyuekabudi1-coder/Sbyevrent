import React, { useState, useEffect, useRef } from 'react';
import { Star, ShieldCheck, CheckCircle, MessageSquare } from 'lucide-react';
import { LiveryStripe, SectionTechPattern } from './EvLiveryDecals';

interface ReviewItem {
  id: number;
  name: string;
  avatar: string;
  location: string;
  service: string;
  date: string;
  rating: number;
  content: string;
}

export const CustomerReviews: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const reviews: ReviewItem[] = [
    {
      id: 1,
      name: 'Hendra Wijaya',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      location: 'Surabaya',
      service: 'Rental VinFast VF 5',
      date: '2 hari lalu',
      rating: 5,
      content:
        'Sewa VF 5 buat perjalanan dinas dari Bandara Juanda ke beberapa kantor klien di Surabaya. Driver tepat waktu, berseragam rapi, mobil wangi dan AC dingin banget. Rekomendasi utama untuk mobilitas eksekutif!'
    },
    {
      id: 2,
      name: 'Siti Rahmawati',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      location: 'Malang',
      service: 'Rental VinFast VF e34',
      date: '4 hari lalu',
      rating: 5,
      content:
        'Liburan keluarga ke Batu pakai VinFast VF e34. Kabinnya sangat lega, suspensi empuk, anak-anak nyaman sepanjang perjalanan. Driver Pak Dwi sangat sopan dan paham rute wisata bebas macet.'
    },
    {
      id: 3,
      name: 'Kevin Pratama',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      location: 'Sidoarjo',
      service: 'Rental Paket 8 Jam',
      date: '1 minggu lalu',
      rating: 5,
      content:
        'Paket 8 jam sangat praktis untuk urusan bisnis Sidoarjo-Surabaya. Tarif all-in sudah termasuk driver & listrik, tanpa argo siluman. Proses booking digitalnya sangat cepat dan transparan.'
    },
    {
      id: 4,
      name: 'dr. Andy Wicaksono',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80',
      location: 'Surabaya',
      service: 'Rental VinFast VF 5',
      date: '1 minggu lalu',
      rating: 5,
      content:
        'Pertama kali mencoba mobil listrik bersama Surabaya EV Rent. Mobil senyap tanpa getaran mesin, sangat bersih dan higienis. Pelayanan driver tersertifikasi sangat memuaskan.'
    },
    {
      id: 5,
      name: 'Maya Anggraini',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      location: 'Surabaya',
      service: 'Taksi Mobil Listrik',
      date: '2 minggu lalu',
      rating: 5,
      content:
        'Pesan taksi listrik dari Bandara Juanda ke Stasiun Gubeng. Tarifnya flat Rp7.000/km tanpa lonjakan jam sibuk. Driver sangat ramah dan sigap membantu koper bawaan saya.'
    },
    {
      id: 6,
      name: 'Bambang Soedjarwo',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      location: 'Malang',
      service: 'Rental Paket 12 Jam',
      date: '3 minggu lalu',
      rating: 5,
      content:
        'Sewa 12 jam untuk acara reuni keluarga di Malang. Kondisi armada prima 100%, baterai siap jarak jauh. Terima kasih PT Sawah Jaya Trans atas layanannya yang luar biasa profesional!'
    }
  ];

  // Auto-slide otomatis geser ke kanan setiap 3 detik (3000ms)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const maxScroll = container.scrollWidth - container.clientWidth;
        const cardWidth = container.firstElementChild
          ? (container.firstElementChild as HTMLElement).clientWidth + 16
          : 320;

        if (container.scrollLeft >= maxScroll - 10) {
          // Putar balik ke awal jika sudah mencapai ujung kanan
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Geser ke kanan
          container.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="relative py-12 sm:py-16 bg-slate-50 border-t border-slate-200 overflow-hidden">
      {/* Background Tech Pattern */}
      <SectionTechPattern />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section dengan Badge Google Review */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center gap-2 mb-2.5">
            <LiveryStripe variant="slanted" />
            
            {/* Google Rating Badge */}
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="text-xs font-black text-slate-800">4.9 / 5.0</span>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                ))}
              </div>
              <span className="text-[11px] text-slate-500 font-semibold">120+ Ulasan</span>
            </div>

            <LiveryStripe variant="slanted" className="rotate-180" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-primary">
            ULASAN PELANGGAN DI GOOGLE
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-medium">
            Testimoni otentik dari pengguna layanan rental dan taksi mobil listrik PT Sawah Jaya Trans.
          </p>
        </div>

        {/* Carousel Container: Geser Otomatis ke Kanan Setiap 3 Detik (Tanpa Tombol, Pause on Hover, Swipeable) */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 cursor-grab active:cursor-grabbing select-none"
        >
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="w-[280px] sm:w-[340px] shrink-0 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header Review: Profil & Google Verified */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-brand-teal/20"
                      loading="lazy"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {rev.name}
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        {rev.location} · {rev.date}
                      </span>
                    </div>
                  </div>

                  {/* Google Verified Icon */}
                  <div className="flex items-center gap-1 text-[10px] text-brand-teal font-bold bg-brand-mint px-2 py-0.5 rounded-full border border-brand-teal/20">
                    <CheckCircle className="w-3 h-3 text-brand-teal" />
                    <span>Google</span>
                  </div>
                </div>

                {/* Stars Rating */}
                <div className="flex items-center gap-1 mb-2.5">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  ))}
                </div>

                {/* Review Body */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal italic">
                  "{rev.content}"
                </p>
              </div>

              {/* Service Tag */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-brand-teal bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                  {rev.service}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Ulasan Asli
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Petunjuk Penggunaan Halus */}
        <div className="mt-4 text-center">
          <span className="text-[11px] text-slate-400 font-medium">
            Otomatis bergeser setiap 3 detik · Arahkan kursor atau sentuh untuk membaca
          </span>
        </div>

      </div>
    </section>
  );
};
