import React, { useState } from 'react';
import { Calendar, ChevronDown, CheckCircle2, Info, Zap, Clock, MapPin, Gauge } from 'lucide-react';
import {
  LiveryStripe,
  LiveryDividerStripe,
  SectionTechPattern
} from './EvLiveryDecals';
import { RentalPricingItem } from '../types';

interface ServicesAndPackagesProps {
  pricingList: RentalPricingItem[];
  onOpenRental: (prefill?: { model?: string; hours?: number }) => void;
  onOpenTaxi: () => void;
}

export const ServicesAndPackages: React.FC<ServicesAndPackagesProps> = ({
  pricingList,
  onOpenRental,
  onOpenTaxi
}) => {
  const [selectedModel, setSelectedModel] = useState<'VinFast VF 5' | 'VinFast VF e34'>('VinFast VF 5');
  const [selectedCity, setSelectedCity] = useState<'Surabaya' | 'Sidoarjo'>('Surabaya');
  const [selectedDuration, setSelectedDuration] = useState<number | 'all'>('all');

  // Fallback data jika belum ter-load dari API
  const defaultPricing: Record<string, { duration_hours: number; km_limit: number; price: number }[]> = {
    'VinFast VF 5': [
      { duration_hours: 3, km_limit: 45, price: 240000 },
      { duration_hours: 5, km_limit: 75, price: 390000 },
      { duration_hours: 8, km_limit: 120, price: 620000 },
      { duration_hours: 12, km_limit: 180, price: 930000 },
    ],
    'VinFast VF e34': [
      { duration_hours: 3, km_limit: 45, price: 290000 },
      { duration_hours: 5, km_limit: 75, price: 460000 },
      { duration_hours: 8, km_limit: 120, price: 740000 },
      { duration_hours: 12, km_limit: 180, price: 1100000 },
    ]
  };

  // Filter paket berdasarkan model dan kota yang dipilih dari backend
  const filteredFromApi = pricingList.filter(
    p => p.vehicle_model === selectedModel && p.city === selectedCity
  );

  const basePackages = filteredFromApi.length > 0
    ? filteredFromApi
    : defaultPricing[selectedModel] || defaultPricing['VinFast VF 5'];

  const displayPackages = selectedDuration === 'all'
    ? basePackages
    : basePackages.filter(p => p.duration_hours === selectedDuration);

  return (
    <section id="pricing-section" className="relative py-10 sm:py-14 lg:py-16 bg-white overflow-hidden">
      {/* Anchor pendukung rental-section */}
      <span id="rental-section" className="sr-only" aria-hidden="true" />

      {/* Background Tech Pattern */}
      <SectionTechPattern />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <LiveryStripe variant="compact" />
            <span className="text-[11px] sm:text-xs font-black tracking-wider text-brand-teal uppercase font-mono">
              Transparan Tanpa Biaya Tersembunyi
            </span>
            <LiveryStripe variant="compact" className="rotate-180" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-primary">
            PAKET DAN TARIF
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">
            Tarif resmi sewa mobil listrik dengan driver untuk area Surabaya dan Sidoarjo.
          </p>
        </div>

        {/* Kontrol Filter Dropdown Interaktif */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 mb-8 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            
            {/* Dropdown 1: Pilihan Model Mobil */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-brand-teal" />
                <span>Model Mobil:</span>
              </label>
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as 'VinFast VF 5' | 'VinFast VF e34')}
                  className="w-full appearance-none bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal pr-10 cursor-pointer"
                >
                  <option value="VinFast VF 5">VinFast VF 5 (Compact SUV)</option>
                  <option value="VinFast VF e34">VinFast VF e34 (Medium SUV)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Dropdown 2: Pilihan Wilayah Kota */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-teal" />
                <span>Wilayah Operasi:</span>
              </label>
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value as 'Surabaya' | 'Sidoarjo')}
                  className="w-full appearance-none bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal pr-10 cursor-pointer"
                >
                  <option value="Surabaya">Surabaya</option>
                  <option value="Sidoarjo">Sidoarjo</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Dropdown 3: Pilihan Durasi Waktu */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-teal" />
                <span>Pilihan Durasi:</span>
              </label>
              <div className="relative">
                <select
                  value={selectedDuration}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedDuration(val === 'all' ? 'all' : Number(val));
                  }}
                  className="w-full appearance-none bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal pr-10 cursor-pointer"
                >
                  <option value="all">Semua Durasi (3, 5, 8, 12 Jam)</option>
                  <option value="3">Paket 3 Jam (Batas 45 km)</option>
                  <option value="5">Paket 5 Jam (Batas 75 km)</option>
                  <option value="8">Paket 8 Jam (Batas 120 km)</option>
                  <option value="12">Paket 12 Jam (Batas 180 km)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

          </div>
        </div>

        {/* Grid Kartu Paket Durasi (3, 5, 8, 12 Jam) */}
        <div className={`grid gap-4 sm:gap-6 ${displayPackages.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
          {displayPackages.map((pkg, idx) => (
            <div
              key={idx}
              className="relative rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover:border-brand-teal hover:shadow-lg transition-all shadow-xs overflow-hidden"
            >
              {/* Top Accent Stripe */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-lime via-brand-teal to-brand-primary" />

              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-bold text-slate-600">Durasi Paket</span>
                  <span className="font-black text-brand-teal bg-brand-mint px-2 py-0.5 rounded text-[10px] border border-brand-teal/20">
                    Driver + Listrik
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-brand-primary">
                  Paket {pkg.duration_hours} Jam
                </h3>

                <div className="mt-1 text-xs text-slate-600 font-semibold">
                  Batas Jarak: <strong className="text-brand-primary font-black">{pkg.km_limit} km</strong>
                </div>

                <div className="my-4 py-3 border-y border-slate-100 bg-slate-50/80 -mx-5 px-5">
                  <div className="text-2xl font-black text-brand-primary font-mono">
                    Rp{pkg.price.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5 font-semibold">
                    {selectedModel} · {selectedCity}
                  </span>
                </div>

                {/* Fasilitas Singkat */}
                <ul className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                    <span>Termasuk Driver Profesional</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                    <span>Termasuk Pengisian Daya Baterai</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                    <span>Kapasitas Maks. 3 Penumpang</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onOpenRental({ model: selectedModel, hours: pkg.duration_hours })}
                  className="w-full py-2.5 px-4 text-center text-xs font-black text-white bg-brand-teal hover:bg-brand-teal-hover rounded-xl transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-brand-lime" />
                  <span>Pilih Paket {pkg.duration_hours} Jam</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Ringkasan Taksi Listrik (Rp7.000 / km) */}
        <div id="taxi-section" className="mt-8 p-4 sm:p-5 rounded-2xl bg-brand-mint/60 border border-brand-teal/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black text-brand-teal uppercase tracking-wider font-mono">
              Opsi Perjalanan Cepat (Point-to-Point)
            </span>
            <h4 className="text-base sm:text-lg font-black text-brand-primary mt-0.5">
              Taksi Mobil Listrik — Tarif Dasar Rp7.000 / km
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Tarif minimum Rp25.000, dihitung berdasarkan jarak kilometer riil tanpa paket durasi jam.
            </p>
          </div>
          <button
            onClick={onOpenTaxi}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-teal text-white font-black text-xs transition-colors cursor-pointer shrink-0 shadow-xs flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            <Zap className="w-3.5 h-3.5 text-brand-lime fill-brand-lime" />
            <span>Pesan Taksi Listrik</span>
          </button>
        </div>

        {/* Ketentuan Ringkas */}
        <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Pemesanan rental mobil listrik wajib reservasi <strong>H-1</strong>. Biaya tol, parkir, dan tiket wisata/destinasi ditanggung oleh penyewa.
          </p>
        </div>

      </div>

      {/* Garis Pembatas Section */}
      <div className="pt-10">
        <LiveryDividerStripe />
      </div>
    </section>
  );
};
