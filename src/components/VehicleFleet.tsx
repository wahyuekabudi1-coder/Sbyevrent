import React from 'react';
import { Users, UserCheck, Zap, BatteryCharging, Gauge } from 'lucide-react';
import {
  LiveryStripe,
  CornerStrapDecal,
  CarLiveryDecalTag
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
        { label: 'Layanan', value: 'Termasuk Driver Profesional', icon: UserCheck },
        { label: 'Energi', value: 'Termasuk Listrik Baterai', icon: BatteryCharging },
        { label: 'Tipe Bodi', value: 'Compact Electric SUV', icon: Gauge },
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
        { label: 'Layanan', value: 'Termasuk Driver Profesional', icon: UserCheck },
        { label: 'Energi', value: 'Termasuk Listrik Baterai', icon: BatteryCharging },
        { label: 'Tipe Bodi', value: 'Spacious Electric C-SUV', icon: Gauge },
      ],
      pricingHint: 'Mulai Rp290.000 (Paket 3 Jam)',
      availableCities: ['Surabaya', 'Malang']
    }
  ];

  return (
    <section id="fleet-section" className="py-12 sm:py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-2 mb-2">
            <LiveryStripe variant="slanted" />
            <span className="text-[11px] sm:text-xs font-bold tracking-wider text-brand-teal uppercase">
              Armada Modern 100% Listrik
            </span>
            <LiveryStripe variant="slanted" className="rotate-180" />
          </div>
          <h2 className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-brand-primary">
            PILIHAN KENDARAAN LISTRIK RESMI
          </h2>
          <div className="flex justify-center my-2.5">
            <LiveryStripe variant="horizontal" />
          </div>
          <p className="mt-1 text-slate-600 text-xs sm:text-sm lg:text-base leading-relaxed">
            Seluruh armada terawat secara berkala, selalu dalam kondisi prima dan dijamin higienis sebelum penjemputan Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          {vehicles.map((v, idx) => (
            <div
              key={idx}
              className="relative bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between hover:border-brand-teal hover:shadow-md transition-all duration-300"
            >
              {/* Corner Livery Strap Decal */}
              <div className="absolute top-0 right-0 z-20">
                <CornerStrapDecal label={`EV LIVERY // 0${idx + 1}`} />
              </div>

              <div>
                {/* Visual Foto Kendaraan dengan Stiker Decal Livery */}
                <div className="relative aspect-16/10 bg-brand-dark overflow-hidden">
                  <img
                    src={v.image}
                    alt={v.model}
                    className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Stiker Decal Livery di Atas Foto */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                    <CarLiveryDecalTag
                      text={v.model}
                      sub={idx === 0 ? "SMART URBAN LIVERY" : "TOURING COMFORT LIVERY"}
                    />
                  </div>

                  <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white/95 backdrop-blur-xs text-brand-primary text-[11px] sm:text-xs font-black px-3 py-1.5 rounded-lg shadow-xs border border-brand-teal/20 z-10 font-mono">
                    {v.pricingHint}
                  </div>
                </div>

                {/* Konten & Spesifikasi */}
                <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-brand-lime -skew-x-12" />
                      <span className="text-[10px] sm:text-xs font-bold text-brand-teal tracking-wide uppercase font-mono">
                        {v.tagline}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-brand-primary mt-1">
                      {v.model}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {v.description}
                    </p>
                  </div>

                  {/* Spesifikasi Badges: Mendatar (Horizontal) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-1">
                    {v.specs.map((s, sIdx) => {
                      const Icon = s.icon;
                      return (
                        <div
                          key={sIdx}
                          className="p-2 sm:p-2.5 rounded-xl bg-brand-mint/60 border border-brand-teal/15 flex items-center gap-2 hover:border-brand-teal/40 transition-colors"
                        >
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white shadow-2xs border border-brand-teal/10 flex items-center justify-center shrink-0">
                            <Icon className="w-3.5 h-3.5 text-brand-teal" />
                          </div>
                          <div className="leading-tight min-w-0">
                            <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate">
                              {s.label}
                            </span>
                            <span className="text-[11px] sm:text-xs font-bold text-brand-primary block truncate">
                              {s.value}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Button: Touch friendly min-h-[48px] */}
              <div className="p-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8 pt-0">
                <button
                  onClick={() => onSelectVehicle(v.model)}
                  className="w-full py-3.5 px-4 text-center font-bold text-xs sm:text-sm text-white bg-brand-teal hover:bg-brand-teal-hover rounded-xl shadow-xs transition-colors cursor-pointer min-h-[48px] flex items-center justify-center"
                >
                  Pilih {v.model} &amp; Cek Ketersediaan
                </button>
              </div>

              {/* Ornamen Garis Stiker Bawah Kartu Mobil */}
              <div className="h-1.5 w-full flex">
                <div className="w-1/4 bg-brand-lime" />
                <div className="w-1/2 bg-brand-teal" />
                <div className="w-1/4 bg-brand-primary" />
              </div>
            </div>
          ))}
        </div>

        {/* Catatan Ketentuan Resmi */}
        <div className="mt-8 sm:mt-10 p-4 sm:p-5 rounded-2xl bg-brand-mint/80 border border-brand-teal/20 text-xs text-brand-primary leading-relaxed relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-1 bg-gradient-to-l from-brand-lime to-brand-teal" />
          <p className="font-bold text-brand-teal mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-lime" />
            <span>Catatan Ketentuan Operasional Rental:</span>
          </p>
          <p>
            Seluruh paket rental sudah mencakup driver dan konsumsi listrik kendaraan. Biaya tol dan parkir selama perjalanan ditanggung oleh penyewa sesuai rute yang dilalui. Kapasitas maksimum adalah 3 penumpang demi menjaga kenyamanan ruang kabin.
          </p>
        </div>
      </div>
    </section>
  );
};
