import React, { useState, useRef } from 'react';
import { Users, UserCheck, Zap, BatteryCharging, Gauge, ChevronLeft, ChevronRight, MapPin, ShieldCheck, Clock } from 'lucide-react';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const vehicles = [
    {
      model: 'VinFast VF 5',
      shortCode: 'VF 05',
      category: 'Smart Compact Electric Crossover',
      tagline: 'Lincah & Nyaman di Perkotaan',
      description:
        'Crossover listrik kompak dengan manuver gesit dan kabin senyap. Sangat ideal untuk perjalanan dinas, mobilitas harian dalam kota Surabaya, Sidoarjo, dan rute penghubung Jawa Timur.',
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80',
      pricingHint: 'Mulai Rp240.000 / 3 Jam',
      specs: [
        { label: 'Kapasitas', value: 'Maks. 3 Penumpang', icon: Users },
        { label: 'Layanan', value: 'Termasuk Driver', icon: UserCheck },
        { label: 'Daya', value: 'Termasuk Baterai', icon: BatteryCharging },
        { label: 'Tipe Bodi', value: 'Compact SUV', icon: Gauge },
        { label: 'Operasi', value: 'Surabaya · Sidoarjo', icon: MapPin },
        { label: 'Standar', value: 'Reservasi H-1', icon: Clock }
      ]
    },
    {
      model: 'VinFast VF e34',
      shortCode: 'VF e34',
      category: 'Spacious Mid-Size Electric SUV',
      tagline: 'Kabin Luas & Suspensi Lembut',
      description:
        'SUV listrik mid-size berdimensi lega dengan bagasi fleksibel dan suspensi empuk. Memberikan kenyamanan kelas atas untuk agenda keluarga, eksekutif, dan perjalanan wisata Malang - Batu.',
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1000&q=80',
      pricingHint: 'Mulai Rp290.000 / 3 Jam',
      specs: [
        { label: 'Kapasitas', value: 'Maks. 3 Penumpang', icon: Users },
        { label: 'Layanan', value: 'Termasuk Driver', icon: UserCheck },
        { label: 'Daya', value: 'Termasuk Baterai', icon: BatteryCharging },
        { label: 'Tipe Bodi', value: 'Mid C-SUV', icon: Gauge },
        { label: 'Operasi', value: 'Surabaya · Malang', icon: MapPin },
        { label: 'Standar', value: 'Reservasi H-1', icon: Clock }
      ]
    }
  ];

  const currentVehicle = vehicles[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? vehicles.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === vehicles.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  return (
    <section id="fleet-section" className="relative py-10 sm:py-14 lg:py-18 bg-gradient-to-b from-white via-slate-50 to-slate-100 overflow-hidden">
      {/* Background Texture Decal */}
      <SectionTechPattern />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <LiveryStripe variant="slanted" />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-brand-teal/30 text-[10px] sm:text-xs font-black tracking-wider text-brand-teal uppercase shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-brand-lime fill-brand-lime" />
              <span>Armada 100% Mobil Listrik</span>
            </span>
            <LiveryStripe variant="slanted" className="rotate-180" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-primary">
            PILIHAN KENDARAAN KAMI
          </h2>

          <div className="flex justify-center my-2.5">
            <LiveryStripe variant="horizontal" />
          </div>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
            Geser ke samping untuk melihat pilihan armada VinFast VF 5 dan VF e34 resmi PT Sawah Jaya Trans.
          </p>
        </div>

        {/* Tab Switcher & Panah Cepat */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-5">
          <button
            onClick={() => setCurrentIndex(0)}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer border ${
              currentIndex === 0
                ? 'bg-brand-teal text-white border-brand-teal shadow-md'
                : 'bg-white text-slate-700 border-slate-300 hover:border-brand-teal'
            }`}
          >
            VinFast VF 5
          </button>
          <button
            onClick={() => setCurrentIndex(1)}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer border ${
              currentIndex === 1
                ? 'bg-brand-teal text-white border-brand-teal shadow-md'
                : 'bg-white text-slate-700 border-slate-300 hover:border-brand-teal'
            }`}
          >
            VinFast VF e34
          </button>
        </div>

        {/* Card Kendaraan Utama: Single View Geser Samping dengan Panah Kiri-Kanan */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden transition-all duration-300"
        >
          {/* Corner Livery Strap */}
          <div className="absolute top-0 right-0 z-20 pointer-events-none">
            <CornerStrapDecal label={`EV // 0${currentIndex + 1}`} />
          </div>

          {/* Area Foto Kendaraan dengan Tombol Geser Panah Kanan & Kiri */}
          <div className="relative aspect-16/9 sm:aspect-21/9 bg-brand-dark overflow-hidden border-b-2 border-slate-800">
            <img
              src={currentVehicle.image}
              alt={currentVehicle.model}
              key={currentVehicle.model}
              className="w-full h-full object-cover opacity-90 transition-opacity duration-300"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

            {/* Tag Livery di Atas Foto */}
            <div className="absolute top-3 left-3 z-10">
              <CarLiveryDecalTag
                text={currentVehicle.model}
                sub={currentIndex === 0 ? "SMART URBAN LIVERY" : "TOURING COMFORT LIVERY"}
              />
            </div>

            {/* Hint Harga di Pojok Kanan Bawah Foto */}
            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs text-brand-primary text-xs sm:text-sm font-black px-3 py-1 rounded-lg shadow-md border border-brand-teal/30 z-10 font-mono">
              {currentVehicle.pricingHint}
            </div>

            {/* Tombol Panah Geser Kiri */}
            <button
              onClick={handlePrev}
              aria-label="Kendaraan Sebelumnya"
              className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-brand-teal text-white border-2 border-white/80 shadow-lg flex items-center justify-center transition-all cursor-pointer z-20 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>

            {/* Tombol Panah Geser Kanan */}
            <button
              onClick={handleNext}
              aria-label="Kendaraan Berikutnya"
              className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-brand-teal text-white border-2 border-white/80 shadow-lg flex items-center justify-center transition-all cursor-pointer z-20 active:scale-95"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Konten Kendaraan di Bawah Gambar */}
          <div className="p-4 sm:p-6 space-y-4">
            
            {/* Judul & Deskripsi Ringkas */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-black text-brand-teal tracking-wide uppercase font-mono">
                  {currentVehicle.category}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  Unit {currentIndex + 1} dari {vehicles.length}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-brand-primary mt-0.5">
                {currentVehicle.model}
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {currentVehicle.description}
              </p>
            </div>

            {/* Badges Spesifikasi Kecil-Kecil (Kompak, tidak besar & tidak makan tempat) */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 pt-1">
              {currentVehicle.specs.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div
                    key={idx}
                    className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-1.5 shadow-2xs hover:bg-brand-mint/50 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-brand-teal shrink-0 stroke-[2.2]" />
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 truncate">
                      {s.value}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Tombol Aksi Tunggal & Ringkas: Cek Ketersediaan */}
            <div className="pt-2">
              <button
                onClick={() => onSelectVehicle(currentVehicle.model)}
                className="w-full py-3.5 px-5 text-center font-black text-xs sm:text-sm text-white bg-brand-teal hover:bg-brand-teal-hover border border-brand-teal rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer min-h-[48px] flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Zap className="w-4 h-4 text-brand-lime fill-brand-lime shrink-0" />
                <span>Cek Ketersediaan</span>
              </button>
            </div>

          </div>

          {/* Garis Aksen Bawah Kartu Mobil */}
          <div className="h-2 w-full flex">
            <div className="w-1/3 bg-brand-lime" />
            <div className="w-1/3 bg-brand-teal" />
            <div className="w-1/3 bg-brand-primary" />
          </div>
        </div>

        {/* Catatan Ketentuan Operasional Rental */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs leading-relaxed">
          <p className="font-black text-brand-teal text-xs sm:text-sm mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-teal shrink-0" />
            <span>Catatan Ketentuan Operasional Rental:</span>
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 font-medium">
            <li className="flex items-start gap-1.5">
              <span className="text-brand-teal font-black">✓</span>
              <span>Pemesanan wajib minimal <strong>H-1</strong> sebelum tanggal sewa.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-brand-teal font-black">✓</span>
              <span>Tarif <strong>sudah termasuk driver profesional</strong> & konsumsi daya baterai.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-brand-teal font-black">✓</span>
              <span>Biaya tol, parkir, dan tiket lokasi ditanggung oleh penyewa sesuai rute.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-brand-teal font-black">✓</span>
              <span>Kapasitas maksimal <strong>3 penumpang</strong> demi kenyamanan kabin.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-brand-teal font-black">✓</span>
              <span>1 unit kendaraan hanya melayani 1 penyewa per hari (bersih & siap pakai).</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-brand-teal font-black">✓</span>
              <span>Kelebihan jam (overtime) atau kilometer dihitung sesuai tarif resmi.</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Garis Pembatas Section */}
      <div className="mt-10 sm:mt-14">
        <LiveryDividerStripe />
      </div>
    </section>
  );
};
