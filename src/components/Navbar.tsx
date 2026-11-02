import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { LiveryDividerStripe } from './EvLiveryDecals';
import { Menu, X, Car, Search, ShieldCheck, UserCheck } from 'lucide-react';

interface NavbarProps {
  onOpenRental: () => void;
  onOpenTaxi: () => void;
  onOpenTracker: () => void;
  onNavigatePage: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRental,
  onOpenTaxi,
  onOpenTracker,
  onNavigatePage,
  currentPage
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Tutup menu mobile ketika layar di-resize ke desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Kunci scroll body saat menu mobile aktif
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-brand-teal/20'
          : 'bg-white border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24 gap-2">
          
          {/* Logo & Brand Identity (Enlarged, crisp, responsive & comfortable) */}
          <button
            onClick={() => {
              onNavigatePage('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded-lg shrink-0 min-h-[44px] py-1"
            aria-label="Kembali ke Beranda Surabaya EV Rent"
          >
            <Logo className="h-11 xs:h-12 sm:h-14 lg:h-16" showSubtitle={true} />
          </button>

          {/* Desktop & Wide Laptop Nav (1024px+) */}
          <nav className="hidden xl:flex items-center gap-6 2xl:gap-8">
            <button
              onClick={() => onNavigatePage('home')}
              className={`text-sm font-semibold transition-colors hover:text-brand-teal cursor-pointer py-2 ${
                currentPage === 'home' ? 'text-brand-teal border-b-2 border-brand-lime pb-1.5' : 'text-brand-primary'
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => {
                onNavigatePage('home');
                setTimeout(() => {
                  document.getElementById('rental-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              className="text-sm font-semibold text-slate-700 hover:text-brand-teal transition-colors cursor-pointer py-2"
            >
              Rental Mobil Listrik
            </button>
            <button
              onClick={() => {
                onNavigatePage('home');
                setTimeout(() => {
                  document.getElementById('taxi-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              className="text-sm font-semibold text-slate-700 hover:text-brand-teal transition-colors cursor-pointer py-2"
            >
              Taksi Listrik
            </button>
            <button
              onClick={() => {
                onNavigatePage('home');
                setTimeout(() => {
                  document.getElementById('fleet-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              className="text-sm font-semibold text-slate-700 hover:text-brand-teal transition-colors cursor-pointer py-2"
            >
              Pilihan Kendaraan
            </button>
            <button
              onClick={() => {
                onNavigatePage('home');
                setTimeout(() => {
                  document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              className="text-sm font-semibold text-slate-700 hover:text-brand-teal transition-colors cursor-pointer py-2"
            >
              Tentang Kami
            </button>
          </nav>

          {/* Right Action Buttons: Desktop & Laptop (1024px+) */}
          <div className="hidden lg:flex items-center gap-2 2xl:gap-3">
            <button
              onClick={onOpenTracker}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-brand-teal hover:bg-brand-mint rounded-lg transition-colors cursor-pointer min-h-[44px]"
              title="Lacak status booking dan info driver"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Cek Booking</span>
            </button>

            <button
              onClick={() => onNavigatePage('driver')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                currentPage === 'driver'
                  ? 'bg-brand-mint text-brand-teal font-bold'
                  : 'text-slate-700 hover:bg-brand-mint/60 hover:text-brand-teal'
              }`}
              title="Portal Khusus Driver"
            >
              <UserCheck className="w-4 h-4 text-brand-teal" />
              <span>Portal Driver</span>
            </button>

            <button
              onClick={() => onNavigatePage('admin')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                currentPage === 'admin'
                  ? 'bg-brand-primary text-white'
                  : 'text-slate-600 hover:text-brand-primary hover:bg-slate-100'
              }`}
              title="Dashboard Pengelola"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>

            <button
              onClick={onOpenRental}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-brand-teal hover:bg-brand-teal-hover rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer min-h-[44px]"
            >
              <Car className="w-4 h-4 text-brand-lime" />
              <span>Pesan Sekarang</span>
            </button>
          </div>

          {/* Tablet & Mobile Right Bar (<1024px) */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
            {/* Quick Cek Booking on Mobile & Tablet */}
            <button
              onClick={onOpenTracker}
              className="inline-flex items-center justify-center p-2.5 sm:px-3 text-slate-700 hover:text-brand-teal hover:bg-brand-mint rounded-lg text-xs font-semibold min-h-[44px] min-w-[44px] cursor-pointer"
              title="Cek Status Booking"
              aria-label="Cek status booking"
            >
              <Search className="w-5 h-5 text-slate-600" />
              <span className="hidden sm:inline ml-1.5">Cek Booking</span>
            </button>

            {/* Quick Pesan on Tablet */}
            <button
              onClick={onOpenRental}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-brand-teal hover:bg-brand-teal-hover rounded-lg shadow-xs min-h-[44px] cursor-pointer"
            >
              <Car className="w-4 h-4 text-brand-lime" />
              <span>Pesan</span>
            </button>

            {/* Hamburger Button with WCAG 44x44px target */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2.5 text-brand-primary hover:text-brand-teal hover:bg-brand-mint rounded-lg min-h-[44px] min-w-[44px] cursor-pointer"
              aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Ornamen Garis Livery Mobil Listrik di Bawah Header */}
      <LiveryDividerStripe className="opacity-90" />

      {/* Mobile & Tablet Drawer Modal */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-x-0 top-20 sm:top-24 bottom-0 z-50 bg-slate-900/40 backdrop-blur-xs flex flex-col justify-start"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-white border-b border-brand-teal/20 px-4 py-5 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header Identitas di Menu Mobile */}
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <Logo className="h-10 sm:h-12" showSubtitle={true} />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-500 hover:text-brand-teal rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col space-y-1">
              <button
                onClick={() => {
                  onNavigatePage('home');
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-3 text-sm font-semibold rounded-lg min-h-[44px] flex items-center ${
                  currentPage === 'home' ? 'bg-brand-mint text-brand-teal font-bold' : 'text-brand-primary hover:bg-slate-50'
                }`}
              >
                Beranda
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRental();
                }}
                className="text-left px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-brand-mint hover:text-brand-teal rounded-lg min-h-[44px] flex items-center"
              >
                Rental Mobil Listrik (H-1)
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTaxi();
                }}
                className="text-left px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-brand-mint hover:text-brand-teal rounded-lg min-h-[44px] flex items-center"
              >
                Taksi Listrik (Rp7.000/km)
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigatePage('home');
                  setTimeout(() => {
                    document.getElementById('fleet-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }}
                className="text-left px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-brand-mint hover:text-brand-teal rounded-lg min-h-[44px] flex items-center"
              >
                Pilihan Kendaraan (VinFast VF 5 &amp; VF e34)
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigatePage('home');
                  setTimeout(() => {
                    document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }}
                className="text-left px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-brand-mint hover:text-brand-teal rounded-lg min-h-[44px] flex items-center"
              >
                Tentang Surabaya EV Rent
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  onNavigatePage('driver');
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-3 text-sm font-semibold text-brand-teal bg-brand-mint hover:bg-brand-teal-light rounded-lg min-h-[44px] flex items-center justify-between"
              >
                <span>Portal Khusus Driver</span>
                <UserCheck className="w-4 h-4 text-brand-teal" />
              </button>

              <button
                onClick={() => {
                  onNavigatePage('admin');
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg min-h-[44px] flex items-center justify-between"
              >
                <span>Dashboard Pengelola Admin</span>
                <ShieldCheck className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRental();
                }}
                className="w-full py-3 px-4 text-center font-bold text-sm text-white bg-brand-teal hover:bg-brand-teal-hover rounded-xl shadow-xs min-h-[44px] flex items-center justify-center gap-2"
              >
                <Car className="w-4 h-4 text-brand-lime" />
                <span>Pesan Rental Mobil Listrik</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTaxi();
                }}
                className="w-full py-3 px-4 text-center font-bold text-sm text-brand-primary bg-brand-mint hover:bg-brand-teal-light border border-brand-teal/20 rounded-xl min-h-[44px]"
              >
                Pesan Taksi Listrik (Rp7.000/km)
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
