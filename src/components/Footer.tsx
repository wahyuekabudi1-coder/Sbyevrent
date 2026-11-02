import React, { useState } from 'react';
import { Logo } from './Logo';
import { LiveryDividerStripe, LiveryStripe } from './EvLiveryDecals';
import { ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';

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
      // Jika ngeklik 14 kali, kembali semula (reset ke 0)
      if (next >= 14) {
        return 0;
      }
      return next;
    });
  };
  return (
    <footer className="bg-brand-dark text-slate-300 border-t border-brand-teal/20 relative">
      {/* Ornamen Garis Livery Mobil Listrik di Atas Footer */}
      <LiveryDividerStripe className="opacity-75" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          
          {/* Kolom 1 & 2: Identitas Perusahaan & Logo Resmi Yang Diperbesar */}
          <div className="sm:col-span-2 space-y-4">
            <Logo className="h-16 sm:h-20 md:h-24" showSubtitle={true} lightMode={true} />
            
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                SURABAYA EV RENT
              </h4>
              <p className="text-xs text-brand-lime font-semibold">
                Layanan Rental &amp; Taksi Mobil Listrik
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Powered by Smart Journey
              </p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm pt-1">
              Menghadirkan kenyamanan mobilitas ramah lingkungan di Jawa Timur dengan armada 100% mobil listrik VinFast VF 5 dan VF e34 bersama driver profesional bersertifikasi.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-brand-lime shrink-0" />
              <span>Sistem Pemesanan &amp; Pembayaran Digital Resmi</span>
            </div>
          </div>

          {/* Kolom 3: Layanan Kami */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              Layanan Utama
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenRental}
                  className="hover:text-brand-lime transition-colors cursor-pointer text-left py-1 block"
                >
                  Rental Mobil Listrik (H-1)
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTaxi}
                  className="hover:text-brand-lime transition-colors cursor-pointer text-left py-1 block"
                >
                  Taksi Mobil Listrik (Rp7.000/km)
                </button>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Halaman Kota & SEO */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              Wilayah Operasional
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigatePage('seo-surabaya')}
                  className="hover:text-brand-lime transition-colors cursor-pointer text-left py-1 block"
                >
                  Rental Listrik Surabaya
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('seo-sidoarjo')}
                  className="hover:text-brand-lime transition-colors cursor-pointer text-left py-1 block"
                >
                  Rental Listrik Sidoarjo
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('seo-malang')}
                  className="hover:text-brand-lime transition-colors cursor-pointer text-left py-1 block"
                >
                  Rental Listrik Malang
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('seo-taxi')}
                  className="hover:text-brand-lime transition-colors cursor-pointer text-left py-1 block"
                >
                  Layanan Taksi Listrik Jatim
                </button>
              </li>
            </ul>
          </div>

          {/* Kolom 5: Kontak & Ketentuan */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              Informasi &amp; Kontak
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                <span>Surabaya · Sidoarjo · Malang</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                <span>Customer Care WhatsApp</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                <span className="truncate">sjtrans.finance@gmail.com</span>
              </li>
            </ul>
            <div className="pt-1 text-[11px] text-slate-500">
              Jam Operasional: 24 Jam Online
            </div>
          </div>

        </div>

        {/* Garis Bawah & Hak Cipta */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-brand-teal/20 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span
              onClick={handleCopyrightClick}
              className="select-none cursor-pointer hover:text-slate-400 transition-colors"
              title=""
            >
              &copy; {new Date().getFullYear()} Surabaya EV Rent. Hak cipta dilindungi.
            </span>

            {/* Tombol Tersembunyi: Hanya muncul saat copyright diklik 10 sampai 13 kali. Pada klik ke-14 kembali semula (sembunyi) */}
            {adminClicks >= 10 && adminClicks <= 13 && (
              <button
                onClick={() => onNavigatePage('admin')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-primary text-brand-lime border border-brand-lime/40 text-[10px] font-bold shadow-md hover:bg-slate-800 transition-all cursor-pointer animate-pulse"
                title="Akses Rahasia Pengelola Admin"
              >
                <ShieldCheck className="w-3 h-3 text-brand-lime" />
                <span>Dashboard Admin</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <span>Kebijakan Privasi</span>
            <span aria-hidden="true">·</span>
            <span>Syarat &amp; Ketentuan</span>
            <span aria-hidden="true">·</span>
            <span className="text-brand-lime font-bold">Powered by Smart Journey</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
