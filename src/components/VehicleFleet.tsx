import React, { useRef, useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Zap,
  BatteryCharging,
  Gauge,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  MoveHorizontal
} from 'lucide-react';
import {
  LiveryStripe,
  CornerStrapDecal,
  CarLiveryDecalTag,
  LiveryDividerStripe,
  SectionTechPattern
} from './EvLiveryDecals';

interface VehicleFleetProps {
  onSelectVehicle: (model: string) => void;
}

export const VehicleFleet: React.FC<VehicleFleetProps> = ({ onSelectVehicle }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const vehicles = [
    {
      model: 'VinFast VF e34',
      code: '34',
      tagline: 'Spacious Mid-Size Electric SUV',
      description:
        'SUV listrik berdimensi luas dengan ruang kabin lapang dan suspensi empuk, menawarkan kenyamanan ekstra untuk perjalanan dinas, agenda bisnis, maupun keluarga di Surabaya dan Sidoarjo.',
      image: '/src/assets/images/vinfast_vfe34_1794185371447.jpg',
      specs: [
        { label: 'Kapasitas', value: 'Maks. 3 Penumpang', icon: Users },
        { label: 'Layanan', value: 'Termasuk Driver', icon: UserCheck },
        { label: 'Energi', value: 'Termasuk Baterai', icon: BatteryCharging },
        { label: 'Tipe Bodi', value: 'Mid C-SUV', icon: Gauge },
      ],
      pricingHint: 'Mulai Rp290.000 (Paket 3 Jam)',
      availableCities: ['Surabaya', 'Sidoarjo']
    }
  ];

  // Scroll to targeted vehicle card
  const scrollToIndex = (index: number) => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll<HTMLElement>('.vehicle-card');
    if (cards[index]) {
      const card = cards[index];
      const container = containerRef.current;
      const cardOffset = card.offsetLeft - container.offsetLeft;
      const centeredOffset = cardOffset - (container.clientWidth - card.clientWidth) / 2;
      container.scrollTo({
        left: Math.max(0, centeredOffset),
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const handlePrev = () => {
    const nextIdx = Math.max(0, currentIndex - 1);
    scrollToIndex(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = Math.min(vehicles.length - 1, currentIndex + 1);
    scrollToIndex(nextIdx);
  };

  // Track active slide based on scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: any = null;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const cards = container.querySelectorAll<HTMLElement>('.vehicle-card');
        const scrollCenter = container.scrollLeft + container.clientWidth / 2;

        let closestIdx = 0;
        let minDiff = Infinity;

        cards.forEach((card, idx) => {
          const cardCenter = card.offsetLeft + card.clientWidth / 2;
          const diff = Math.abs(scrollCenter - cardCenter);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = idx;
          }
        });

        setCurrentIndex(closestIdx);
      }, 60);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section id="fleet-section" className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-slate-50 to-slate-100 overflow-hidden">
      {/* Background Texture Decal */}
      <SectionTechPattern />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center gap-2.5 mb-2.5">
            <LiveryStripe variant="slanted" />
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border-2 border-brand-teal/40 text-[11px] sm:text-xs font-black tracking-wider text-brand-teal uppercase shadow-xs">
              <Zap className="w-3.5 h-3.5 text-brand-lime fill-brand-lime" />
              <span>Armada Modern 100% Listrik</span>
            </span>
            <LiveryStripe variant="slanted" className="rotate-180" />
          </div>
          
          <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-brand-primary">
            PILIHAN KENDARAAN LISTRIK RESMI
          </h2>

          <div className="flex justify-center my-3">
            <LiveryStripe variant="horizontal" />
          </div>

          <p className="mt-1 text-slate-600 text-xs sm:text-sm lg:text-base leading-relaxed max-w-2xl mx-auto font-medium">
            Seluruh armada terawat berkala oleh teknisi bersertifikasi, selalu dalam kondisi prima dan dijamin bersih sejuk sebelum penjemputan Anda.
          </p>
        </div>

        {/* CONTROLS BAR: Model Selector Buttons + Navigation Arrows */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-white/90 backdrop-blur-xs p-2.5 sm:p-3 rounded-2xl border-2 border-brand-teal/20 shadow-xs max-w-4xl mx-auto">
          
          {/* Quick Model Selector Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {vehicles.map((v, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToIndex(idx)}
                className={`flex-1 sm:flex-initial px-3.5 sm:px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 border-2 ${
                  currentIndex === idx
                    ? 'bg-brand-teal text-white border-brand-teal shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-brand-teal/40 hover:bg-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${currentIndex === idx ? 'bg-brand-lime animate-pulse' : 'bg-slate-300'}`} />
                <span>{v.model}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                  currentIndex === idx ? 'bg-brand-primary/40 text-brand-lime' : 'bg-slate-200 text-slate-600'
                }`}>
                  Mulai 290rb
                </span>
              </button>
            ))}
          </div>

          {/* Swipe Hint & Navigation Arrow Buttons */}
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-teal bg-brand-mint/60 px-3 py-1.5 rounded-lg border border-brand-teal/20">
              <MoveHorizontal className="w-3.5 h-3.5 animate-pulse text-brand-teal" />
              <span>Geser untuk melihat</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                aria-label="Mobil Sebelumnya"
                className="w-10 h-10 rounded-xl bg-white border-2 border-brand-teal/30 hover:border-brand-teal hover:bg-brand-mint/40 text-brand-primary flex items-center justify-center transition-all cursor-pointer shadow-2xs disabled:opacity-35 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex === vehicles.length - 1}
                aria-label="Mobil Berikutnya"
                className="w-10 h-10 rounded-xl bg-white border-2 border-brand-teal/30 hover:border-brand-teal hover:bg-brand-mint/40 text-brand-primary flex items-center justify-center transition-all cursor-pointer shadow-2xs disabled:opacity-35 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>

        {/* HORIZONTAL SLIDER CONTAINER (SNAP-X CAROUSEL) */}
        <div className="relative">
          
          {/* Floating Left Button (Desktop/Tablet) */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white items-center justify-center shadow-lg transition-all cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
            aria-label="Sebelumnya"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Floating Right Button (Desktop/Tablet) */}
          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex === vehicles.length - 1}
            className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white items-center justify-center shadow-lg transition-all cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
            aria-label="Berikutnya"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            ref={containerRef}
            className={`flex gap-6 sm:gap-8 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 pt-2 px-1 sm:px-4 scrollbar-none ${vehicles.length === 1 ? 'justify-center' : ''}`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {vehicles.map((v, idx) => (
              <div
                key={idx}
                className="vehicle-card shrink-0 w-[88vw] sm:w-[540px] lg:w-[600px] snap-center relative bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-300/90 shadow-md overflow-hidden flex flex-col justify-between hover:border-brand-teal hover:shadow-xl transition-all duration-300"
              >
                {/* Corner Livery Strap Decal Tebal */}
                <div className="absolute top-0 right-0 z-20">
                  <CornerStrapDecal label={`EV LIVERY // 0${idx + 1}`} />
                </div>

                <div>
                  {/* Visual Foto Kendaraan dengan Stiker Decal Livery */}
                  <div className="relative aspect-16/10 bg-brand-dark overflow-hidden border-b-2 border-slate-800">
                    <img
                      src={v.image}
                      alt={v.model}
                      className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

                    {/* Stiker Decal Livery di Atas Foto */}
                    <div className="absolute top-3.5 left-3.5 z-10">
                      <CarLiveryDecalTag
                        text={v.model}
                        sub="TOURING COMFORT LIVERY"
                      />
                    </div>

                    <div className="absolute bottom-3.5 right-3.5 bg-white/95 backdrop-blur-xs text-brand-primary text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-xl shadow-md border-2 border-brand-teal/30 z-10 font-mono">
                      {v.pricingHint}
                    </div>
                  </div>

                  {/* Konten & Spesifikasi */}
                  <div className="p-5 sm:p-7 space-y-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-4 bg-brand-lime -skew-x-14 rounded-xs shadow-xs" />
                        <span className="text-xs font-black text-brand-teal tracking-wide uppercase font-mono">
                          {v.tagline}
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-brand-primary mt-1">
                        {v.model}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {v.description}
                      </p>
                    </div>

                    {/* Spesifikasi Badges Tebal */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      {v.specs.map((s, sIdx) => {
                        const Icon = s.icon;
                        return (
                          <div
                            key={sIdx}
                            className="p-3 rounded-xl bg-brand-mint/60 border-2 border-brand-teal/20 flex flex-col items-start gap-1.5 hover:border-brand-teal transition-colors shadow-2xs"
                          >
                            <div className="w-7 h-7 rounded-lg bg-white shadow-xs border border-brand-teal/20 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-brand-teal stroke-[2.2]" />
                            </div>
                            <div className="leading-tight min-w-0 w-full">
                              <span className="text-[10px] text-slate-500 font-bold block truncate">
                                {s.label}
                              </span>
                              <span className="text-xs font-black text-brand-primary block truncate mt-0.5">
                                {s.value}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="px-5 sm:px-7 pb-6 pt-1">
                  <button
                    onClick={() => onSelectVehicle(v.model)}
                    className="w-full py-3.5 px-5 text-center font-black text-xs sm:text-sm text-white bg-brand-teal hover:bg-brand-teal-hover border-2 border-brand-teal rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer min-h-[50px] flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-brand-lime fill-brand-lime" />
                    <span>Pilih {v.model} &amp; Cek Ketersediaan</span>
                    <ArrowRight className="w-4 h-4 text-brand-lime" />
                  </button>
                </div>

                {/* Ornamen Garis Stiker Bawah Kartu Mobil Tebal 8px */}
                <div className="h-2 sm:h-2.5 w-full flex shadow-xs">
                  <div className="w-1/4 bg-brand-lime" />
                  <div className="w-1/2 bg-brand-teal" />
                  <div className="w-1/4 bg-brand-primary" />
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator di Bawah Slider */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {vehicles.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToIndex(idx)}
                aria-label={`Pilih mobil ${idx + 1}`}
                className={`transition-all rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? 'w-8 h-2.5 bg-brand-teal'
                    : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Catatan Ketentuan Resmi dengan Garis Livery Tebal */}
        <div className="mt-8 sm:mt-10 p-5 sm:p-6 rounded-2xl bg-white border-2 border-brand-teal/30 shadow-md text-xs text-brand-primary leading-relaxed relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-brand-lime via-brand-teal to-brand-primary" />
          <p className="font-black text-brand-teal text-xs sm:text-sm mb-1.5 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-lime shadow-xs" />
            <span>Catatan Ketentuan Operasional Rental:</span>
          </p>
          <p className="text-slate-600 font-medium leading-relaxed">
            Seluruh paket rental sudah mencakup driver dan konsumsi listrik kendaraan. Biaya tol dan parkir selama perjalanan ditanggung oleh penyewa sesuai rute yang dilalui. Kapasitas maksimum adalah 3 penumpang demi menjaga kenyamanan ruang kabin.
          </p>
        </div>
      </div>

      {/* Garis Pembatas Section Tebal */}
      <div className="mt-12 sm:mt-16">
        <LiveryDividerStripe />
      </div>
    </section>
  );
};
