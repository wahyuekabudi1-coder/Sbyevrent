import React from 'react';
import { Users, UserCheck, Zap, BatteryCharging, Gauge } from 'lucide-react';
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
  const vehicles = [
    {
      model: 'VinFast VF 5',
      tagline: 'Smart Compact Electric Crossover',
      description:
        'Crossover listrik kompak yang gesit dan lincah, ideal untuk perjalanan dinas, mobilitas harian dalam kota Surabaya, Sidoarjo, maupun antar-kota di Jawa Timur.',
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80',
      specs: [
        { label: 'Kapasitas', value: 'Maks. 3 Penumpang', icon: Users },
        { label: 'Layanan', value: 'Termasuk Driver', icon: UserCheck },
        { label: 'Energi', value: 'Termasuk Baterai', icon: BatteryCharging },
        { label: 'Tipe Bodi', value: 'Compact SUV', icon: Gauge },
      ],
      pricingHint: 'Mulai Rp240.000 (Paket 3 Jam)',
      availableCities: ['Surabaya', 'Sidoarjo']
    },
    {
      model: 'VinFast VF e34',
      tagline: 'Spacious Mid-Size Electric SUV',
      description:
        'SUV listrik berdimensi lebih luas dengan ruang kabin lapang dan suspensi empuk, menawarkan kenyamanan ekstra untuk perjalanan keluarga dan rute wisata Malang.',
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1000&q=80',
      specs: [
        { label: 'Kapasitas', value: 'Maks. 3 Penumpang', icon: Users },
        { label: 'Layanan', value: 'Termasuk Driver', icon: UserCheck },
        { label: 'Energi', value: 'Termasuk Baterai', icon: BatteryCharging },
        { label: 'Tipe Bodi', value: 'Mid C-SUV', icon: Gauge },
      ],
      pricingHint: 'Mulai Rp290.000 (Paket 3 Jam)',
      availableCities: ['Surabaya', 'Malang']
    }
  ];

  return (
    <section id="fleet-section" className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-slate-50 to-slate-100 overflow-hidden">
      {/* Background Texture Decal */}
      <SectionTechPattern />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
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
            Seluruh armada terawat secara berkala oleh teknisi bersertifikasi, selalu dalam kondisi prima dan dijamin bersih sejuk sebelum penjemputan Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
          {vehicles.map((v, idx) => (
            <div
              key={idx}
              className="relative bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-300/90 shadow-md overflow-hidden flex flex-col justify-between hover:border-brand-teal hover:shadow-2xl transition-all duration-300"
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
                      sub={idx === 0 ? "SMART URBAN LIVERY" : "TOURING COMFORT LIVERY"}
                    />
                  </div>

                  <div className="absolute bottom-3.5 right-3.5 bg-white/95 backdrop-blur-xs text-brand-primary text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-xl shadow-md border-2 border-brand-teal/30 z-10 font-mono">
                    {v.pricingHint}
                  </div>
                </div>

                {/* Konten & Spesifikasi */}
                <div className="p-5 sm:p-7 space-y-5">
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

        {/* Catatan Ketentuan Resmi dengan Garis Livery Tebal */}
        <div className="mt-10 sm:mt-12 p-5 sm:p-6 rounded-2xl bg-white border-2 border-brand-teal/30 shadow-md text-xs text-brand-primary leading-relaxed relative overflow-hidden">
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
