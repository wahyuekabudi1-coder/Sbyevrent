import React, { useState } from 'react';
import { Logo } from './Logo';
import { LiveryDividerStripe } from './EvLiveryDecals';
import { ShieldCheck, Phone, Mail, MapPin, Clock } from 'lucide-react';

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
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 relative">
      {/* Ornamen Garis Livery Mobil Listrik di Atas Footer */}
      <LiveryDividerStripe className="opacity-90" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14">
        
        {/* Baris Atas: Brand Identity & Navigasi 2 Kolom (Layanan Utama & Wilayah Operasi) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-8 border-b border-slate-800">
          
          {/* Sisi Kiri: Logo & Deskripsi Resmi Perusahaan */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-2 -ml-2 rounded-xl inline-block bg-white/5 backdrop-blur-xs border border-white/10">
              <Logo className="h-14 sm:h-16 md:h-18" showSubtitle={true} lightMode={true} />
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md font-normal">
              Platform resmi rental dan taksi mobil listrik di Surabaya, Sidoarjo, dan Malang bersama armada modern VinFast VF 5 dan VF e34 serta driver profesional bersertifikasi.
            </p>

            <div className="flex items-center gap-2 text-xs text-brand-lime font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Sistem Pemesanan &amp; Pembayaran Digital Resmi PT Sawah Jaya Trans</span>
            </div>
          </div>

          {/* Sisi Kanan: Dua Kolom Berdampingan (Layanan Utama & Wilayah Operasi) */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 sm:gap-8">
            
            {/* Kolom 1: Layanan Utama */}
            <div className="space-y-3">
              <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-brand-lime rounded-xs" />
                <span>Layanan Utama</span>
              </h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={onOpenRental}
                    className="hover:text-brand-lime text-slate-300 transition-colors cursor-pointer text-left py-1 block"
                  >
                    Rental Mobil Listrik (H-1)
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenTaxi}
                    className="hover:text-brand-lime text-slate-300 transition-colors cursor-pointer text-left py-1 block"
                  >
                    Taksi Mobil Listrik (Rp7.000/km)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      document.getElementById('fleet-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-brand-lime text-slate-300 transition-colors cursor-pointer text-left py-1 block"
                  >
                    Pilihan Armada VinFast
                  </button>
                </li>
              </ul>
            </div>

            {/* Kolom 2: Wilayah Operasi */}
            <div className="space-y-3">
              <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-brand-teal rounded-xs" />
                <span>Wilayah Operasi</span>
              </h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => onNavigatePage('seo-surabaya')}
                    className="hover:text-brand-lime text-slate-300 transition-colors cursor-pointer text-left py-1 block"
                  >
                    Surabaya &amp; Bandara Juanda
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigatePage('seo-sidoarjo')}
                    className="hover:text-brand-lime text-slate-300 transition-colors cursor-pointer text-left py-1 block"
                  >
                    Sidoarjo &amp; Kawasan Industri
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigatePage('seo-malang')}
                    className="hover:text-brand-lime text-slate-300 transition-colors cursor-pointer text-left py-1 block"
                  >
                    Malang Raya &amp; Wisata Batu
                  </button>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Baris Tengah: Informasi Kontak Mandiri */}
        <div className="py-6 sm:py-8 border-b border-slate-800">
          <h5 className="text-xs font-black text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-brand-primary rounded-xs" />
            <span>Informasi &amp; Kontak Resmi</span>
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400">
            <div className="flex items-start gap-2.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <MapPin className="w-4 h-4 text-brand-lime shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">Kantor Operasional</span>
                <span>Surabaya · Sidoarjo · Malang, Jawa Timur</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <Phone className="w-4 h-4 text-brand-lime shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">WhatsApp Customer Care</span>
                <span>0812-3456-7890 (Respon Cepat)</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <Clock className="w-4 h-4 text-brand-lime shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">Jam Layanan</span>
                <span>24 Jam Pemesanan Online &amp; Bantuan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Baris Bawah: Hak Cipta & Powered by PT Sawah Jaya Trans */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span
              onClick={handleCopyrightClick}
              className="select-none cursor-pointer hover:text-slate-400 transition-colors"
              title=""
            >
              &copy; {new Date().getFullYear()} PT Sawah Jaya Trans. Hak cipta dilindungi.
            </span>

            {/* Tombol Tersembunyi: Hanya muncul saat copyright diklik 10 sampai 13 kali. Pada klik ke-14 kembali semula */}
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
            <span className="text-brand-lime font-bold">Powered by PT Sawah Jaya Trans</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
