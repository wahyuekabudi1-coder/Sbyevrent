import React from 'react';
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
              <li>
                <button
                  onClick={() => onNavigatePage('driver')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-1 block text-brand-lime font-semibold"
                >
                  Portal Khusus Driver
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('admin')}
                  className="hover:text-slate-300 transition-colors cursor-pointer text-left py-1 block text-slate-400"
                >
                  Portal Manajemen Admin
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
                <span>Surabaya · Sidoarjo</span>
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
          <p>
            &copy; {new Date().getFullYear()} Surabaya EV Rent. Hak cipta dilindungi.
          </p>
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
