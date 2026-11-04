import React, { useState } from 'react';
import {
  Calendar,
  Navigation,
  Zap,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Car,
  HelpCircle
} from 'lucide-react';
import { LiveryStripe, LiveryDividerStripe, SectionTechPattern } from './EvLiveryDecals';
import { SeoHead } from './SeoHead';

interface CitySeoPageProps {
  cityKey: 'surabaya' | 'sidoarjo' | 'malang' | 'taxi';
  onBackHome: () => void;
  onOpenRental: (city?: string) => void;
  onOpenTaxi: (city?: string) => void;
  onNavigateCity: (cityKey: 'surabaya' | 'sidoarjo' | 'malang' | 'taxi') => void;
}

interface SeoPageConfig {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalPath: string;
  serviceType: 'rental' | 'taxi';
  cityName: string;
  h1: string;
  badge: string;
  intro: string;
  highlights: { title: string; desc: string }[];
  vehicleFleet: {
    model: string;
    bodyType: string;
    specs: string;
    bestFor: string;
  }[];
  packageRates: { duration: string; kmLimit: string; priceHint: string }[];
  rentalTerms: string[];
  faqList: { question: string; answer: string }[];
}

const SEO_PAGES_DATA: Record<string, SeoPageConfig> = {
  surabaya: {
    metaTitle: 'Rental Mobil Listrik Surabaya dengan Driver | Surabaya EV Rent',
    metaDescription:
      'Cari rental mobil listrik Surabaya dengan driver? Nikmati perjalanan nyaman menggunakan VinFast VF 5 dan VF e34. Tersedia paket rental fleksibel untuk perjalanan bisnis, keluarga, dan wisata.',
    keywords: 'rental mobil listrik Surabaya, sewa mobil listrik Surabaya, rental mobil dengan driver Surabaya',
    canonicalPath: '/rental-mobil-listrik-surabaya',
    serviceType: 'rental',
    cityName: 'Surabaya',
    h1: 'Rental Mobil Listrik Surabaya dengan Driver',
    badge: 'Pusat Bisnis & Metropolitan Surabaya',
    intro:
      'Surabaya EV Rent menghadirkan solusi sewa mobil listrik modern VinFast VF 5 dan VF e34 lengkap bersama pengemudi profesional untuk mobilitas eksekutif, perjalanan dinas korporasi, kunjungan keluarga, dan wisata perkotaan di Surabaya.',
    highlights: [
      {
        title: 'Penjemputan Pusat Bisnis & CBD Surabaya',
        desc: 'Layanan penjemputan tepat waktu ke koridor segitiga emas Surabaya (Basuki Rachmat, HR Muhammad, Mayjen Sungkono, Embong Malang) serta stasiun Gubeng dan Pasar Turi.'
      },
      {
        title: 'Kabin Senyap Bebas Getaran Mesin',
        desc: 'Mobil listrik 100% full electric memberikan kesenyapan kabin optimal di tengah kepadatan lalu lintas kota, membuat perjalanan kerja atau santai Anda tetap tenang.'
      },
      {
        title: 'Driver Tersertifikasi & Paham Rute',
        desc: 'Pengemudi berseragam resmi, ramah, dan berpengalaman mengemudikan kendaraan listrik serta hafal rute alternatif bebas hambatan di area Surabaya.'
      }
    ],
    vehicleFleet: [
      {
        model: 'VinFast VF 5',
        bodyType: 'Compact Electric SUV',
        specs: 'Baterai 37.2 kWh · Torsi 135 Nm · AC Dingin Digital',
        bestFor: 'Mobilitas dinas perkotaan, meeting antar-kantor, dan pasangan / eksekutif (maks. 3 penumpang).'
      },
      {
        model: 'VinFast VF e34',
        bodyType: 'Mid-Size Electric SUV',
        specs: 'Baterai 42 kWh · Suspensi Empuk · Bagasi Luas',
        bestFor: 'Perjalanan delegasi tamu, rombongan keluarga, dan mobilitas bisnis dengan koper (maks. 3 penumpang).'
      }
    ],
    packageRates: [
      { duration: 'Paket 3 Jam', kmLimit: 'Maks. 45 km', priceHint: 'Mulai Rp240.000' },
      { duration: 'Paket 5 Jam', kmLimit: 'Maks. 75 km', priceHint: 'Mulai Rp390.000' },
      { duration: 'Paket 8 Jam', kmLimit: 'Maks. 120 km', priceHint: 'Mulai Rp620.000' },
      { duration: 'Paket 12 Jam', kmLimit: 'Maks. 180 km', priceHint: 'Mulai Rp930.000' }
    ],
    rentalTerms: [
      'Pemesanan rental wajib melakukan reservasi minimal H-1 sebelum keberangkatan.',
      'Seluruh paket rental sudah mencakup unit mobil listrik, jasa supir, dan pengisian daya baterai.',
      'Biaya tol, karcis parkir, serta tiket masuk tempat wisata ditanggung oleh pihak penyewa.',
      'Area penjemputan mencakup seluruh kecamatan di Surabaya Pusat, Timur, Barat, Selatan, dan Utara.'
    ],
    faqList: [
      {
        question: 'Apakah rental mobil listrik di Surabaya bisa lepas kunci (tanpa supir)?',
        answer:
          'Layanan Surabaya EV Rent saat ini khusus beroperasi dengan driver profesional untuk memastikan keamanan armada, kenyamanan penumpang, dan pengelolaan pengisian baterai yang terjamin.'
      },
      {
        question: 'Bagaimana jika waktu sewa melebihi durasi paket yang dipilih?',
        answer:
          'Kelebihan waktu (overtime) dihitung dengan tarif transparan Rp50.000 per jam, dan kelebihan jarak tempuh dikenakan Rp2.500 per kilometer sesuai ketentuan resmi.'
      },
      {
        question: 'Bagaimana cara memesan rental mobil listrik di Surabaya?',
        answer:
          'Pemesanan dapat dilakukan langsung secara online melalui tombol Pesan Rental pada website ini atau melalui kontak WhatsApp Customer Care kami.'
      }
    ]
  },

  sidoarjo: {
    metaTitle: 'Sewa Mobil Listrik Sidoarjo dengan Driver | Surabaya EV Rent',
    metaDescription:
      'Butuh sewa mobil listrik di Sidoarjo? Tersedia layanan rental mobil listrik dengan driver untuk perjalanan bisnis, bandara, keluarga, dan kebutuhan harian.',
    keywords: 'sewa mobil listrik Sidoarjo, rental mobil listrik Sidoarjo, rental mobil dengan driver Sidoarjo',
    canonicalPath: '/rental-mobil-listrik-sidoarjo',
    serviceType: 'rental',
    cityName: 'Sidoarjo',
    h1: 'Sewa Mobil Listrik Sidoarjo dengan Driver',
    badge: 'Kawasan Industri & Penyangga Sidoarjo',
    intro:
      'Layanan sewa dan rental mobil listrik ramah lingkungan di Sidoarjo bersama Surabaya EV Rent. Siap melayani agenda kunjungan kerja di kawasan industri, antar-jemput koridor logistik, dan mobilitas keluarga dengan armada VinFast terawat.',
    highlights: [
      {
        title: 'Akses Kawasan Industri & Pergudangan Sidoarjo',
        desc: 'Layanan cepat dan fleksibel untuk agenda inspeksi pabrik, audit, dan meeting bisnis di kawasan industri Berbek, Waru, Gedangan, Buduran, hingga Jabon.'
      },
      {
        title: 'Penjemputan Tepat Waktu Koridor Sidoarjo',
        desc: 'Armada siaga menjemput Anda di hotel, area perumahan, maupun sentra bisnis di Sidoarjo tanpa rasa cemas terhadap keterlambatan.'
      },
      {
        title: 'Perjalanan Wisata & Kuliner Nyaman',
        desc: 'Kunjungi sentra kerajinan tas kulit Tanggulangin dan kuliner khas Sidoarjo dengan kabin mobil listrik yang bersih, wangi, dan bebas bau bensin.'
      }
    ],
    vehicleFleet: [
      {
        model: 'VinFast VF 5',
        bodyType: 'Compact Electric SUV',
        specs: 'Baterai 37.2 kWh · Radius Putar Lincah · Kabin Ergonomis',
        bestFor: 'Kunjungan kerja pabrik dan mobilitas harian Sidoarjo - Surabaya.'
      },
      {
        model: 'VinFast VF e34',
        bodyType: 'Mid-Size Electric SUV',
        specs: 'Baterai 42 kWh · Suspensi Lembut · Bagasi Luas',
        bestFor: 'Perjalanan dinas manajemen perusahaan dan agenda keluarga.'
      }
    ],
    packageRates: [
      { duration: 'Paket 3 Jam', kmLimit: 'Maks. 45 km', priceHint: 'Mulai Rp240.000' },
      { duration: 'Paket 5 Jam', kmLimit: 'Maks. 75 km', priceHint: 'Mulai Rp390.000' },
      { duration: 'Paket 8 Jam', kmLimit: 'Maks. 120 km', priceHint: 'Mulai Rp620.000' },
      { duration: 'Paket 12 Jam', kmLimit: 'Maks. 180 km', priceHint: 'Mulai Rp930.000' }
    ],
    rentalTerms: [
      'Pemesanan sewa mobil listrik di Sidoarjo memerlukan reservasi minimal H-1.',
      'Harga paket sudah mencakup mobil listrik, supir berseragam, dan energi baterai.',
      'Biaya operasional tol dan tiket parkir ditanggung oleh pihak penyewa.',
      'Melayani rute dalam wilayah Sidoarjo serta rute penghubung Sidoarjo - Surabaya.'
    ],
    faqList: [
      {
        question: 'Apakah melayani penjemputan di seluruh kecamatan di Sidoarjo?',
        answer:
          'Ya, kami melayani penjemputan di wilayah Waru, Sedati, Gedangan, Candi, Buduran, Sidoarjo Kota, Sukodono, Taman, Krian, dan sekitarnya.'
      },
      {
        question: 'Apakah paket sewa sudah termasuk bahan bakar atau pengisian listrik?',
        answer:
          'Seluruh unit kami diserahkan dalam kondisi baterai terisi penuh dan biaya listrik sudah termasuk di dalam paket sewa.'
      }
    ]
  },

  malang: {
    metaTitle: 'Rental Mobil Listrik Malang & Batu | Surabaya EV Rent',
    metaDescription:
      'Jelajahi Malang dan Batu dengan rental mobil listrik VinFast bersama driver. Pilihan perjalanan nyaman untuk wisata, keluarga, dan perjalanan bisnis.',
    keywords: 'rental mobil listrik Malang, sewa mobil listrik Malang, rental mobil listrik Batu',
    canonicalPath: '/rental-mobil-listrik-malang',
    serviceType: 'rental',
    cityName: 'Malang & Batu',
    h1: 'Rental Mobil Listrik Malang & Batu dengan Driver',
    badge: 'Destinasi Wisata Pegunungan Malang Raya',
    intro:
      'Nikmati liburan sejuk, perjalanan dinas, dan wisata keluarga di Malang dan Kota Batu bersama Surabaya EV Rent. Rasakan ketangguhan torsi instan mobil listrik VinFast yang senyap dan bertenaga melibas tanjakan pegunungan tanpa polusi udara.',
    highlights: [
      {
        title: 'Torsi Elektrik Bertenaga di Jalur Menanjak',
        desc: 'Mobil listrik VinFast menyalurkan torsi instan seketika, memberikan akselerasi halus dan bertenaga saat melintasi jalur perbukitan Kota Batu dan Malang Raya.'
      },
      {
        title: 'Menikmati Udara Pegunungan Tanpa Polusi Asap',
        desc: 'Berkeliling destinasi wisata favorit di Batu dan Malang dengan kendaraan 100% bebas emisi, menjaga kesejukan dan kelestarian alam pegunungan.'
      },
      {
        title: 'Penjemputan Stasiun Malang & Hotel',
        desc: 'Driver kami siap menyambut kedatangan Anda langsung di Stasiun Malang Kota Baru maupun lobi hotel tempat Anda menginap.'
      }
    ],
    vehicleFleet: [
      {
        model: 'VinFast VF e34',
        bodyType: 'Spacious Electric SUV',
        specs: 'Baterai 42 kWh · Torsi 242 Nm · Suspensi Multi-Link',
        bestFor: 'Wisata keluarga ke Kota Batu, tur kuliner Malang, dan perjalanan bisnis eksekutif.'
      },
      {
        model: 'VinFast VF 5',
        bodyType: 'Compact Electric SUV',
        specs: 'Baterai 37.2 kWh · Lincah & Nyaman · Kabin Modern',
        bestFor: 'Mobilitas perkotaan Malang dan agenda kunjungan kampus/perkantoran.'
      }
    ],
    packageRates: [
      { duration: 'Paket 3 Jam', kmLimit: 'Maks. 45 km', priceHint: 'Mulai Rp290.000' },
      { duration: 'Paket 5 Jam', kmLimit: 'Maks. 75 km', priceHint: 'Mulai Rp460.000' },
      { duration: 'Paket 8 Jam', kmLimit: 'Maks. 120 km', priceHint: 'Mulai Rp740.000' },
      { duration: 'Paket 12 Jam', kmLimit: 'Maks. 180 km', priceHint: 'Mulai Rp1.100.000' }
    ],
    rentalTerms: [
      'Pemesanan rental mobil listrik di Malang & Batu wajib reservasi H-1.',
      'Sudah mencakup mobil listrik berdaya baterai siap jalan dan supir profesional.',
      'Biaya karcis tol, parkir, dan tiket destinasi wisata ditanggung oleh penyewa.',
      'Melayani area Kota Malang, Kota Batu, dan sekitarnya.'
    ],
    faqList: [
      {
        question: 'Apakah mobil listrik kuat menanjak di kawasan wisata Batu?',
        answer:
          'Sangat kuat. Mobil listrik VinFast memiliki keunggulan torsi instan maksimum sejak putaran pertama tanpa jeda perpindahan gigi, sehingga sangat tangguh dan stabil di medan pegunungan Batu.'
      },
      {
        question: 'Apakah bisa dijemput dari Surabaya untuk perjalanan ke Malang?',
        answer:
          'Bisa. Kami melayani perjalanan antar-kota Surabaya - Malang sesuai paket durasi yang dipesan.'
      }
    ]
  },

  taxi: {
    metaTitle: 'Taksi Mobil Listrik Surabaya | Tarif Rp7.000/km',
    metaDescription:
      'Pesan taksi mobil listrik untuk perjalanan point-to-point. Nikmati perjalanan nyaman dengan driver profesional dan pemesanan online di Surabaya dan wilayah operasional yang tersedia.',
    keywords: 'taksi mobil listrik Surabaya, taksi listrik, taksi online mobil listrik',
    canonicalPath: '/taksi-listrik',
    serviceType: 'taxi',
    cityName: 'Surabaya',
    h1: 'Taksi Mobil Listrik Surabaya — Tarif Rp7.000 / km',
    badge: 'Layanan Transportasi Listrik Point-to-Point',
    intro:
      'Surabaya EV Rent menyediakan layanan taksi mobil listrik untuk perjalanan point-to-point cepat di Surabaya dan sekitarnya. Nikmati kabin bersih, AC dingin, kesenyapan berkendara, dan transparansi tarif Rp7.000 per kilometer tanpa biaya lonjakan tersembunyi.',
    highlights: [
      {
        title: 'Tarif Pasti Berbasis Jarak Riil Rp7.000 / km',
        desc: 'Ongkos taksi dihitung otomatis secara akurat berdasarkan rute kilometer riil dengan batas minimum pemesanan hanya Rp25.000.'
      },
      {
        title: 'Bebas Bau Bensin & Polusi Udara',
        desc: 'Armada mobil listrik murni menghadirkan udara kabin higienis, bersih, dan senyap tanpa getaran mesin knalpot konvensional.'
      },
      {
        title: 'Driver Berseragam & Ramah Tamah',
        desc: 'Pengemudi berdedikasi tinggi siap menjemput Anda dengan standar etika pelayanan profesional dan mengemudi secara aman.'
      }
    ],
    vehicleFleet: [
      {
        model: 'VinFast VF 5 & VF e34',
        bodyType: 'Modern Electric SUV Fleet',
        specs: '100% Full Electric · AC Sejuk Higienis · Kapasitas Maks. 3 Penumpang',
        bestFor: 'Perjalanan point-to-point dalam kota, mobilitas kerja cepat, dan perjalanan instan tanpa sewa per jam.'
      }
    ],
    packageRates: [
      { duration: 'Tarif Dasar / km', kmLimit: 'Berdasarkan Rute', priceHint: 'Rp7.000 / km' },
      { duration: 'Tarif Minimum', kmLimit: 'Jarak Awal', priceHint: 'Rp25.000' }
    ],
    rentalTerms: [
      'Pemesanan taksi listrik dilakukan secara instan point-to-point sesuai alamat penjemputan dan tujuan.',
      'Sistem akan menampilkan rincian jarak kilometer dan total tarif sebelum Anda menyetujui pesanan.',
      'Pembayaran mendukung QRIS instan, Virtual Account, serta metode digital resmi ArtoPay.',
      'Biaya tol tambahan (bila melewati jalan tol atas permintaan penumpang) dibayar terpisah.'
    ],
    faqList: [
      {
        question: 'Berapa tarif minimum pemesanan taksi mobil listrik?',
        answer:
          'Tarif minimum adalah Rp25.000 untuk perjalanan jarak dekat awal, dan selanjutnya berlaku tarif Rp7.000 per kilometer.'
      },
      {
        question: 'Bagaimana metode pembayaran taksi listrik?',
        answer:
          'Pembayaran dapat dilakukan dengan mudah secara digital melalui QRIS, Virtual Account, atau tunai kepada pengemudi.'
      }
    ]
  }
};

export const CitySeoPage: React.FC<CitySeoPageProps> = ({
  cityKey,
  onBackHome,
  onOpenRental,
  onOpenTaxi,
  onNavigateCity
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const data = SEO_PAGES_DATA[cityKey] || SEO_PAGES_DATA.surabaya;

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const breadcrumbs = [
    { name: 'Beranda', path: '/' },
    { name: data.cityName, path: data.canonicalPath }
  ];

  return (
    <div className="relative py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-slate-50 via-white to-slate-50 min-h-screen overflow-hidden">
      {/* Dynamic SEO Head Management */}
      <SeoHead
        title={data.metaTitle}
        description={data.metaDescription}
        canonicalPath={data.canonicalPath}
        keywords={data.keywords}
        breadcrumbs={breadcrumbs}
        serviceType={data.serviceType}
        city={data.cityName}
      />

      <SectionTechPattern />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 relative z-10">
        
        {/* Breadcrumb Navigation Bar */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <button
            onClick={onBackHome}
            className="hover:text-brand-teal transition-colors cursor-pointer"
          >
            Beranda
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Wilayah Layanan</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-brand-teal font-bold">{data.cityName}</span>
        </nav>

        {/* Back Button */}
        <div>
          <button
            onClick={onBackHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-slate-700 hover:text-brand-teal transition-colors cursor-pointer py-1.5 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 text-brand-teal stroke-[2.5]" />
            <span>Kembali ke Beranda Utama</span>
          </button>
        </div>

        {/* 1. HERO SECTION DENGAN H1 UTAMA */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2">
            <LiveryStripe variant="compact" />
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-brand-teal bg-white border-2 border-brand-teal/40 px-3 py-1.5 rounded-full shadow-2xs inline-block font-mono">
              {data.badge}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-primary tracking-tight leading-tight">
            {data.h1}
          </h1>

          {/* Livery Line Accent */}
          <div className="flex items-center gap-1.5 py-1">
            <span className="h-1.5 w-14 rounded-full bg-brand-lime shadow-2xs" />
            <span className="h-1.5 w-28 rounded-full bg-brand-teal shadow-2xs" />
            <span className="h-1.5 w-8 rounded-full bg-brand-primary shadow-2xs" />
          </div>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl font-normal">
            {data.intro}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              onClick={() => onOpenRental(data.cityName)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-bold text-white bg-brand-teal hover:bg-brand-teal-hover rounded-xl shadow-xs transition-colors cursor-pointer min-h-[48px]"
            >
              <Calendar className="w-4 h-4 text-brand-lime shrink-0" />
              <span>Pesan Rental Mobil {data.cityName}</span>
            </button>
            <button
              onClick={() => onOpenTaxi(data.cityName)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-bold text-brand-primary bg-white hover:bg-brand-mint border border-slate-300 rounded-xl transition-colors cursor-pointer min-h-[48px]"
            >
              <Navigation className="w-4 h-4 text-brand-teal shrink-0" />
              <span>Pesan Taksi Listrik (Rp7.000/km)</span>
            </button>
          </div>
        </header>

        {/* 2. KEUNGGULAN SPESIFIK WILAYAH */}
        <section aria-labelledby="highlights-heading" className="border-t border-slate-200 pt-8 sm:pt-10">
          <div className="flex items-center gap-2 mb-6">
            <LiveryStripe variant="compact" />
            <h2 id="highlights-heading" className="text-lg sm:text-xl font-black text-brand-primary uppercase tracking-tight">
              Keunggulan Layanan di {data.cityName}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {data.highlights.map((h, i) => (
              <div
                key={i}
                className="relative overflow-hidden p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2 hover:border-brand-teal transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-brand-mint text-brand-teal border border-brand-teal/30 flex items-center justify-center font-black text-xs font-mono">
                      0{i + 1}
                    </div>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-brand-primary pt-1 group-hover:text-brand-teal transition-colors">
                    {h.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal mt-1.5">
                    {h.desc}
                  </p>
                </div>
                <div className="mt-4 pt-2 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 h-1 bg-gradient-to-r from-brand-lime to-brand-teal opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </section>

        {/* 3. MODEL KENDARAAN LISTRIK YANG BEROPERASI */}
        <section aria-labelledby="fleet-heading" className="border-t border-slate-200 pt-8 sm:pt-10">
          <div className="flex items-center gap-2 mb-6">
            <LiveryStripe variant="compact" />
            <h2 id="fleet-heading" className="text-lg sm:text-xl font-black text-brand-primary uppercase tracking-tight">
              Pilihan Model Kendaraan Listrik VinFast
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.vehicleFleet.map((v, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-brand-teal transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-brand-teal bg-brand-mint px-2.5 py-0.5 rounded-full border border-brand-teal/20">
                    {v.bodyType}
                  </span>
                  <Car className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="text-lg font-black text-brand-primary">
                  {v.model}
                </h3>
                <div className="text-xs text-slate-600 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {v.specs}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  <strong className="text-slate-800 font-bold">Ideal Untuk:</strong> {v.bestFor}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. PAKET TARIF & KETENTUAN SEWA */}
        <section aria-labelledby="pricing-heading" className="border-t border-slate-200 pt-8 sm:pt-10">
          <div className="flex items-center gap-2 mb-6">
            <LiveryStripe variant="compact" />
            <h2 id="pricing-heading" className="text-lg sm:text-xl font-black text-brand-primary uppercase tracking-tight">
              Pilihan Paket Durasi &amp; Tarif
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {data.packageRates.map((pkg, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-white border border-slate-200 text-center space-y-1 shadow-2xs"
              >
                <span className="text-[11px] font-bold text-slate-500 block">{pkg.duration}</span>
                <span className="text-xs font-semibold text-brand-teal block">{pkg.kmLimit}</span>
                <span className="text-sm sm:text-base font-black text-brand-primary block font-mono">
                  {pkg.priceHint}
                </span>
              </div>
            ))}
          </div>

          {/* Ketentuan Sewa */}
          <div className="p-5 rounded-2xl bg-brand-mint/40 border border-brand-teal/30 space-y-2.5">
            <h3 className="text-xs font-black text-brand-primary uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-teal" />
              <span>Ketentuan Rental dengan Driver:</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {data.rentalTerms.map((term, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal shrink-0 mt-0.5" />
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 5. PERTANYAAN UMUM (FAQ) */}
        <section aria-labelledby="faq-heading" className="border-t border-slate-200 pt-8 sm:pt-10">
          <div className="flex items-center gap-2 mb-6">
            <LiveryStripe variant="compact" />
            <h2 id="faq-heading" className="text-lg sm:text-xl font-black text-brand-primary uppercase tracking-tight">
              Pertanyaan Umum Seputar Layanan di {data.cityName}
            </h2>
          </div>

          <div className="space-y-3">
            {data.faqList.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 font-bold text-xs sm:text-sm text-slate-900 hover:text-brand-teal transition-colors cursor-pointer"
                  aria-expanded={openFaqIndex === i}
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-brand-teal shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openFaqIndex === i ? 'rotate-180 text-brand-teal' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === i && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 6. INTERNAL LINKING KORIDOR KOTA LAINNYA */}
        <section aria-labelledby="other-cities-heading" className="border-t border-slate-200 pt-8 sm:pt-10">
          <h3 id="other-cities-heading" className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
            Jelajahi Wilayah Layanan Lainnya:
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => onNavigateCity('surabaya')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                cityKey === 'surabaya'
                  ? 'bg-brand-mint border-brand-teal text-brand-teal font-black shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-brand-teal text-slate-700 text-xs font-bold'
              }`}
            >
              <span className="block text-[11px] text-slate-400">Kota Surabaya</span>
              <span>Rental EV Surabaya</span>
            </button>

            <button
              onClick={() => onNavigateCity('sidoarjo')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                cityKey === 'sidoarjo'
                  ? 'bg-brand-mint border-brand-teal text-brand-teal font-black shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-brand-teal text-slate-700 text-xs font-bold'
              }`}
            >
              <span className="block text-[11px] text-slate-400">Kab. Sidoarjo</span>
              <span>Sewa EV Sidoarjo</span>
            </button>

            <button
              onClick={() => onNavigateCity('malang')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                cityKey === 'malang'
                  ? 'bg-brand-mint border-brand-teal text-brand-teal font-black shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-brand-teal text-slate-700 text-xs font-bold'
              }`}
            >
              <span className="block text-[11px] text-slate-400">Malang &amp; Batu</span>
              <span>Rental EV Malang</span>
            </button>

            <button
              onClick={() => onNavigateCity('taxi')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                cityKey === 'taxi'
                  ? 'bg-brand-mint border-brand-teal text-brand-teal font-black shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-brand-teal text-slate-700 text-xs font-bold'
              }`}
            >
              <span className="block text-[11px] text-slate-400">Point-to-Point</span>
              <span>Taksi Listrik (km)</span>
            </button>
          </div>
        </section>

      </div>

      <div className="mt-12">
        <LiveryDividerStripe />
      </div>
    </div>
  );
};
