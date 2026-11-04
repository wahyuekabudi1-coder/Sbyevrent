import React, { useState } from 'react';
import { Logo } from './Logo';
import { LiveryDividerStripe, SectionTechPattern } from './EvLiveryDecals';
import { ShieldCheck, Phone, MapPin, Clock } from 'lucide-react';

interface FooterProps {
  onNavigatePage: (page: string) => void;
  onOpenRental: () => void;
  onOpenTaxi: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigatePage,
  onOpenRental,
  onOpenTaxi
}) => {
  const [adminClicks, setAdminClicks] = useState(0);

  const handleCopyrightClick = () => {
    setAdminClicks((prev) => {
      const next = prev + 1;
      // Jika diklik 14 kali, kembali semula (reset ke 0)
      if (next >= 14) {
        return 0;
      }
      return next;
    });
  };

  return (
    <footer className="relative bg-gradient-to-b from-brand-mint/30 via-slate-50 to-brand-mint-subtle text-slate-700 border-t-2 border-brand-teal/20 overflow-hidden">
      {/* Texture Pola Elektrik */}
      <SectionTechPattern />

      {/* Ornamen Garis Livery Mobil Listrik di Atas Footer */}
      <LiveryDividerStripe className="opacity-90" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 relative z-10">
        
        {/* LOGO DI BAGIAN TENGAH-TENGAH (CENTERED) */}
        <div className="flex flex-col items-center text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center justify-center bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-brand-teal/25">
            <Logo className="h-10 sm:h-12" showSubtitle={true} lightMode={false} />
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium mt-3 max-w-md">
            Layanan sewa mobil listrik dengan driver dan taksi listrik di Jawa Timur bersama PT Sawah Jaya Trans.
          </p>

          <div className="flex items-center gap-2 text-xs text-brand-teal font-bold mt-2 bg-white/80 px-3 py-1 rounded-full border border-brand-teal/20">
            <ShieldCheck className="w-4 h-4 shrink-0 text-brand-teal" />
            <span>Pemesanan &amp; Pembayaran Digital Resmi</span>
          </div>
        </div>

        {/* Baris Navigasi & Informasi Kontak */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 pb-6 border-b border-brand-teal/15">
          
          {/* Kolom 1: Layanan Utama */}
          <div className="md:col-span-4 space-y-2.5">
            <h5 className="text-xs font-black text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-brand-lime rounded-xs" />
              <span>Layanan Kami</span>
            </h5>
            <ul className="space-y-1.5 text-xs font-medium">
              <li>
                <button
                  onClick={onOpenRental}
                  className="hover:text-brand-teal text-slate-700 transition-colors cursor-pointer text-left py-0.5 block"
                >
                  Rental Mobil Listrik (H-1)
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTaxi}
                  className="hover:text-brand-teal text-slate-700 transition-colors cursor-pointer text-left py-0.5 block"
                >
                  Taksi Mobil Listrik (Rp7.000/km)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-brand-teal text-slate-700 transition-colors cursor-pointer text-left py-0.5 block"
                >
                  Paket Durasi 3, 5, 8, dan 12 Jam
                </button>
              </li>
            </ul>
          </div>

          {/* Kolom 2: Wilayah Operasi */}
          <div className="md:col-span-4 space-y-2.5">
            <h5 className="text-xs font-black text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-brand-teal rounded-xs" />
              <span>Wilayah Operasi</span>
            </h5>
            <ul className="space-y-1.5 text-xs font-medium">
              <li>
                <button
                  onClick={() => onNavigatePage('seo-surabaya')}
                  className="hover:text-brand-teal text-slate-700 transition-colors cursor-pointer text-left py-0.5 block"
                >
                  Surabaya &amp; Sekitarnya
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('seo-sidoarjo')}
                  className="hover:text-brand-teal text-slate-700 transition-colors cursor-pointer text-left py-0.5 block"
                >
                  Sidoarjo &amp; Koridor Bisnis
                </button>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kontak Cepat */}
          <div className="md:col-span-4 space-y-2.5">
            <h5 className="text-xs font-black text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-brand-lime rounded-xs" />
              <span>Customer Care</span>
            </h5>
            <a
              href="https://wa.me/6282233697979?text=Halo%20kak%2C%20mau%20sewa%20mobil%20listriknya"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 bg-white hover:bg-emerald-50/50 p-2.5 rounded-xl border border-brand-teal/20 transition-all shadow-2xs group"
            >
              <div className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                <Phone className="w-3.5 h-3.5 fill-white" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-900 block group-hover:text-emerald-700 transition-colors">WhatsApp Customer Care</span>
                <span className="text-slate-600 font-semibold text-[11px]">0822-3369-7979</span>
              </div>
            </a>
          </div>

        </div>

        {/* Baris Info Operasional Singkat */}
        <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 border-b border-brand-teal/15">
          <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-brand-teal/15">
            <MapPin className="w-3.5 h-3.5 text-brand-teal shrink-0" />
            <span>Wilayah Operasional: <strong>Surabaya &amp; Sidoarjo</strong></span>
          </div>

          <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-brand-teal/15">
            <Clock className="w-3.5 h-3.5 text-brand-teal shrink-0" />
            <span>Pemesanan Online: <strong>24 Jam via Website &amp; WhatsApp</strong></span>
          </div>
        </div>

        {/* Baris Bawah: Copyright PT. Sawah Jaya Trans & Powered by Smart Journey */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span
              onClick={handleCopyrightClick}
              className="select-none cursor-pointer hover:text-brand-primary transition-colors font-medium"
              title=""
            >
              &copy; {new Date().getFullYear()} PT. Sawah Jaya Trans
            </span>

            {/* Tombol Tersembunyi: Hanya muncul saat copyright diklik 10 sampai 13 kali. Pada klik ke-14 kembali semula */}
            {adminClicks >= 10 && adminClicks <= 13 && (
              <button
                onClick={() => onNavigatePage('admin')}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-brand-primary text-brand-lime border border-brand-lime/40 text-[10px] font-bold shadow-md hover:bg-slate-800 transition-all cursor-pointer animate-pulse"
                title="Akses Rahasia Pengelola Admin"
              >
                <ShieldCheck className="w-3 h-3 text-brand-lime" />
                <span>Dashboard Admin</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
            <span>Surabaya EV Rent</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-brand-teal font-black">Powered by Smart Journey</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
