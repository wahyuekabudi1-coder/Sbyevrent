import React from 'react';
import { Calendar, Navigation, Zap, ArrowLeft } from 'lucide-react';

interface CitySeoPageProps {
  cityKey: 'surabaya' | 'sidoarjo' | 'taxi';
  onBackHome: () => void;
  onOpenRental: (city?: string) => void;
  onOpenTaxi: (city?: string) => void;
}

const CITY_SEO_DATA = {
  surabaya: {
    title: 'Rental Mobil Listrik Surabaya dengan Driver Profesional',
    metaTitle: 'Surabaya EV Rent - Rental Mobil Listrik Surabaya | VinFast EV',
    description:
      'Layanan sewa dan rental mobil listrik VinFast VF 5 dan VF e34 di Surabaya oleh Surabaya EV Rent. Sudah termasuk driver ramah & pengisian baterai. Solusi mobilitas bisnis, delegasi, dan wisata perkotaan.',
    badge: 'Kota Metropolitan & Bisnis Jawa Timur',
    highlights: [
      {
        title: 'Antar Jemput Bandara Juanda & CBD',
        desc: 'Layanan tepat waktu untuk penjemputan eksekutif di Bandara Internasional Juanda menuju kawasan segitiga emas Surabaya (Basuki Rachmat, Mayjen Sungkono, HR Muhammad).'
      },
      {
        title: 'Bebas Khawatir Efisiensi Perkotaan',
        desc: 'Mobil listrik memberikan kenyamanan kabin ekstra senyap di tengah padatnya lalu lintas Surabaya tanpa getaran mesin bensin.'
      },
      {
        title: 'Jaringan Pengisian Daya Lengkap',
        desc: 'Didukung ketersediaan SPKLU di pusat perbelanjaan ternama Surabaya (Tunjungan Plaza, Pakuwon Mall, Galaxy Mall) yang dikelola penuh oleh driver kami.'
      }
    ],
    pricingSummary: 'Paket rental mulai Rp240.000 (3 Jam / 45 km) hingga Rp930.000 (12 Jam / 180 km).',
    vehicleList: ['VinFast VF 5 (Compact EV Crossover)', 'VinFast VF e34 (Spacious SUV)']
  },
  sidoarjo: {
    title: 'Rental Mobil Listrik Sidoarjo — Mobilitas Industri & Bandara',
    metaTitle: 'Surabaya EV Rent - Rental Mobil Listrik Sidoarjo',
    description:
      'Sewa mobil listrik di Sidoarjo untuk kunjungan kawasan industri Berbek, Rungkut Industri, Jabon, serta drop-off cepat ke Terminal Purabaya dan Bandara Juanda bersama Surabaya EV Rent.',
    badge: 'Kawasan Penyangga & Koridor Logistik',
    highlights: [
      {
        title: 'Akses Kilat Kawasan Industri Sidoarjo',
        desc: 'Sangat cocok untuk kunjungan kerja, audit pabrik, dan inspeksi kawasan pergudangan di Waru, Gedangan, Buduran, hingga Porong.'
      },
      {
        title: 'Lokasi Strategis Gerbang Bandara Juanda',
        desc: 'Jarak dekat dengan T1 dan T2 Juanda memastikan armada kami selalu siaga menjemput tamu perusahaan Anda tanpa jeda keterlambatan.'
      },
      {
        title: 'Perjalanan Wisata & Kuliner Delta',
        desc: 'Jelajahi sentra kerajinan Tanggulangin dan kuliner khas Sidoarjo dengan armada bersih dan sejuk bersama driver lokal berpengalaman.'
      }
    ],
    pricingSummary: 'Pilihan fleksibel 3 jam, 5 jam, 8 jam, dan 12 jam dengan garansi mobil terawat dan wangi.',
    vehicleList: ['VinFast VF 5 (Agile Urban EV)']
  },
  taxi: {
    title: 'Taksi Mobil Listrik Jawa Timur — Tarif Pasti Rp7.000 / km',
    metaTitle: 'Surabaya EV Rent - Taksi Mobil Listrik Jatim | Rp7.000/km',
    description:
      'Layanan taksi listrik modern Surabaya EV Rent (Powered by Smart Journey). Perjalanan point-to-point dengan tarif flat Rp7.000 per kilometer. Nyaman, dingin, dan bebas bau asap.',
    badge: 'Layanan Taksi Listrik Masa Depan',
    highlights: [
      {
        title: 'Tarif Transparan Berbasis Jarak Nyata',
        desc: 'Biaya dihitung tepat berdasarkan jarak kilometer via rute OpenStreetMap tanpa biaya lonjakan tersembunyi.'
      },
      {
        title: 'Driver Beretika & Berseragam Resmi',
        desc: 'Standar hospitality tinggi menjamin ketenangan dan kenyamanan perjalanan Anda mulai dari penjemputan hingga titik tujuan.'
      },
      {
        title: 'Pembayaran Digital Instan QRIS & VA',
        desc: 'Bayar ongkos taksi dengan mudah melalui gateway ArtoPay tanpa perlu menyiapkan uang tunai pas.'
      }
    ],
    pricingSummary: 'Tarif dasar Rp7.000/km dengan ketentuan tarif minimum hanya Rp25.000.',
    vehicleList: ['VinFast VF 5', 'VinFast VF e34']
  }
};

export const CitySeoPage: React.FC<CitySeoPageProps> = ({
  cityKey,
  onBackHome,
  onOpenRental,
  onOpenTaxi
}) => {
  const content = CITY_SEO_DATA[cityKey];

  return (
    <div className="py-8 sm:py-12 lg:py-16 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        {/* Tombol Kembali (min 44px touch target) */}
        <button
          onClick={onBackHome}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-brand-teal transition-colors cursor-pointer py-2 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 text-brand-teal" />
          <span>Kembali ke Beranda Utama</span>
        </button>

        {/* Hero Section Halaman SEO */}
        <div className="space-y-3 sm:space-y-4">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-teal bg-brand-mint border border-brand-teal/20 px-2.5 sm:px-3 py-1 rounded-md inline-block">
            {content.badge}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-primary tracking-tight leading-tight">
            {content.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            {content.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
            <button
              onClick={() => onOpenRental(cityKey !== 'taxi' ? (cityKey.charAt(0).toUpperCase() + cityKey.slice(1)) : 'Surabaya')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-bold text-white bg-brand-teal hover:bg-brand-teal-hover rounded-xl shadow-xs transition-colors cursor-pointer min-h-[48px]"
            >
              <Calendar className="w-4 h-4 text-brand-lime shrink-0" />
              <span>Pesan Rental Mobil ({cityKey.toUpperCase()})</span>
            </button>
            <button
              onClick={() => onOpenTaxi(cityKey !== 'taxi' ? (cityKey.charAt(0).toUpperCase() + cityKey.slice(1)) : 'Surabaya')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-bold text-brand-primary bg-white hover:bg-brand-mint border border-slate-300 rounded-xl transition-colors cursor-pointer min-h-[48px]"
            >
              <Navigation className="w-4 h-4 text-brand-teal shrink-0" />
              <span>Pesan Taksi Listrik</span>
            </button>
          </div>
        </div>

        {/* 3 Keunggulan Khusus Kota Ini */}
        <div className="border-t border-slate-200 pt-8 sm:pt-10">
          <h2 className="text-lg sm:text-xl font-extrabold text-brand-primary mb-4 sm:mb-6">
            Keunggulan Layanan di Wilayah Ini
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {content.highlights.map((h, i) => (
              <div key={i} className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-brand-mint/20 space-y-2 hover:border-brand-teal transition-colors">
                <div className="w-8 h-8 rounded-lg bg-brand-mint text-brand-teal border border-brand-teal/20 flex items-center justify-center font-extrabold text-xs">
                  0{i + 1}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-brand-primary pt-1">
                  {h.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {h.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Info Armada & Tarif */}
        <div className="p-5 sm:p-6 rounded-2xl bg-brand-mint/80 border border-brand-teal/20 space-y-3">
          <div className="flex items-center gap-2 text-brand-primary font-bold text-sm sm:text-base">
            <Zap className="w-5 h-5 text-brand-lime fill-brand-lime shrink-0" />
            <span>Informasi Operasional &amp; Tarif Resmi</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {content.pricingSummary}
          </p>
          <div className="text-xs text-slate-600 pt-1 border-t border-brand-teal/15">
            <strong className="text-brand-primary">Model Kendaraan Beroperasi:</strong>{' '}
            {content.vehicleList.join(' · ')}
          </div>
        </div>

      </div>
    </div>
  );
};
