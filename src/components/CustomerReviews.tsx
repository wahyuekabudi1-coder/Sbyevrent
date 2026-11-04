import React from 'react';
import { MessageSquare, ExternalLink, ShieldCheck, Quote } from 'lucide-react';
import { LiveryStripe, SectionTechPattern } from './EvLiveryDecals';

interface CustomerFeedback {
  id: number;
  authorTitle: string;
  category: string;
  location: string;
  story: string;
  initials: string;
}

export const CustomerReviews: React.FC = () => {
  // Maksimal 3 ulasan terkurasi dari pengalaman nyata pengguna layanan
  const testimonials: CustomerFeedback[] = [
    {
      id: 1,
      authorTitle: 'Pengguna Sewa Harian',
      category: 'Rental Mobil Listrik',
      location: 'Surabaya',
      initials: 'HW',
      story: 'Pemesanan untuk agenda dinas kantor di Surabaya berjalan lancar. Driver hadir lebih awal, armada bersih dan wangi, serta kabin senyap tanpa getaran mesin bensin.'
    },
    {
      id: 2,
      authorTitle: 'Pengguna Kunjungan Keluarga',
      category: 'Rental Mobil Listrik',
      location: 'Sidoarjo',
      initials: 'SR',
      story: 'Armada VinFast sangat nyaman untuk perjalanan silaturahmi bersama keluarga di area Sidoarjo dan Surabaya. Driver ramah, mengemudi dengan sangat hati-hati dan tenang.'
    },
    {
      id: 3,
      authorTitle: 'Pengguna Perjalanan Bandara & Bisnis',
      category: 'Taksi Mobil Listrik',
      location: 'Surabaya - Sidoarjo',
      initials: 'KP',
      story: 'Tarif pasti berbasis kilometer nyata tanpa biaya tak terduga. Proses reservasi online cepat dan kepastian penjemputan sangat membantu agenda mobilitas bisnis saya.'
    }
  ];

  return (
    <section id="reviews-section" className="relative py-10 sm:py-14 bg-slate-50 border-t border-slate-200 overflow-hidden">
      {/* Background Tech Pattern */}
      <SectionTechPattern />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <LiveryStripe variant="compact" />
            <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-700 text-[11px] font-bold shadow-2xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" />
              <span>Pengalaman Nyata Pelanggan</span>
            </div>
            <LiveryStripe variant="compact" className="rotate-180" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-primary">
            ULASAN PELANGGAN
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">
            Tanggapan dan pengalaman pengguna setelah menggunakan layanan rental dan taksi mobil listrik kami.
          </p>
        </div>

        {/* 3 Ulasan: Maksimal 3 di Desktop, 1-2 di Mobile/Tablet */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-brand-teal hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Ulasan */}
                <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-mint text-brand-teal font-black text-xs flex items-center justify-center border border-brand-teal/20">
                      {item.initials}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                        {item.authorTitle}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Area {item.location}
                      </span>
                    </div>
                  </div>
                  <Quote className="w-4 h-4 text-slate-300 shrink-0" />
                </div>

                {/* Isi Testimoni */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  "{item.story}"
                </p>
              </div>

              {/* Tag Layanan */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-brand-teal bg-brand-mint/60 px-2 py-0.5 rounded border border-brand-teal/15">
                  {item.category}
                </span>
                <span className="text-slate-400 font-medium">
                  Pengalaman Terverifikasi
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Info Google Reviews Transparan */}
        <div className="mt-8 text-center">
          <a
            href="https://maps.google.com/?q=PT+Sawah+Jaya+Trans+Surabaya"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 hover:text-brand-teal bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-brand-teal" />
            <span>Lihat Ulasan &amp; Lokasi di Google Maps</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>

      </div>
    </section>
  );
};
