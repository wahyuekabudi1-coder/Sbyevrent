import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { LiveryDividerStripe } from './EvLiveryDecals';
import { Menu, X, Car, Search, Zap, MapPin, ChevronDown } from 'lucide-react';

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
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

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

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    setCityDropdownOpen(false);
    if (currentPage !== 'home') {
      onNavigatePage('home');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCityClick = (cityKey: string) => {
    setMobileMenuOpen(false);
    setCityDropdownOpen(false);
    onNavigatePage(cityKey);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-brand-teal/20'
          : 'bg-white border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24 gap-3">
          
          {/* Logo & Brand Identity */}
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

          {/* Desktop Navigation (Sederhana & Prioritas Rental, Taksi, Tarif, Kota) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7">
            <button
              onClick={() => scrollToSection('services-section')}
              className="text-sm font-bold text-slate-700 hover:text-brand-teal transition-colors cursor-pointer py-2"
            >
              Layanan Utama
            </button>
            <button
              onClick={() => scrollToSection('pricing-section')}
              className="text-sm font-bold text-slate-700 hover:text-brand-teal transition-colors cursor-pointer py-2"
            >
              Paket &amp; Tarif
            </button>

            {/* Dropdown Wilayah Kota SEO */}
            <div className="relative">
              <button
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="text-sm font-bold text-slate-700 hover:text-brand-teal transition-colors cursor-pointer py-2 inline-flex items-center gap-1"
              >
                <span>Kota Layanan</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${cityDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {cityDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50 space-y-1"
                  onMouseLeave={() => setCityDropdownOpen(false)}
                >
                  <button
                    onClick={() => handleCityClick('seo-surabaya')}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-brand-mint hover:text-brand-teal rounded-lg transition-colors cursor-pointer"
                  >
                    Rental EV Surabaya
                  </button>
                  <button
                    onClick={() => handleCityClick('seo-sidoarjo')}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-brand-mint hover:text-brand-teal rounded-lg transition-colors cursor-pointer"
                  >
                    Sewa EV Sidoarjo
                  </button>
                  <button
                    onClick={() => handleCityClick('seo-malang')}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-brand-mint hover:text-brand-teal rounded-lg transition-colors cursor-pointer"
                  >
                    Rental EV Malang &amp; Batu
                  </button>
                  <button
                    onClick={() => handleCityClick('seo-taxi')}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-brand-mint hover:text-brand-teal rounded-lg transition-colors cursor-pointer"
                  >
                    Taksi Listrik (Rp7.000/km)
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => scrollToSection('why-us-section')}
              className="text-sm font-bold text-slate-700 hover:text-brand-teal transition-colors cursor-pointer py-2"
            >
              Keunggulan
            </button>
            <button
              onClick={() => scrollToSection('reviews-section')}
              className="text-sm font-bold text-slate-700 hover:text-brand-teal transition-colors cursor-pointer py-2"
            >
              Ulasan
            </button>
          </nav>

          {/* Right Action Buttons: Desktop & Laptop (1024px+) */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Cek Booking Button */}
            <button
              onClick={onOpenTracker}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-brand-teal hover:bg-brand-mint rounded-xl border border-slate-200 transition-colors cursor-pointer min-h-[44px]"
              title="Lacak status booking dan info supir/kendaraan"
            >
              <Search className="w-4 h-4 text-brand-teal" />
              <span>Cek Booking</span>
            </button>

            {/* Quick Taksi Button */}
            <button
              onClick={onOpenTaxi}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-brand-primary bg-brand-mint hover:bg-brand-teal-light border border-brand-teal/30 rounded-xl transition-all cursor-pointer min-h-[44px]"
            >
              <Zap className="w-4 h-4 text-brand-teal fill-brand-teal" />
              <span>Taksi</span>
            </button>

            {/* Primary Action: Pesan Rental */}
            <button
              onClick={onOpenRental}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-black text-white bg-brand-teal hover:bg-brand-teal-hover rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer min-h-[44px]"
            >
              <Car className="w-4 h-4 text-brand-lime" />
              <span>Pesan Rental</span>
            </button>
          </div>

          {/* Tablet & Mobile Right Bar (<1024px) */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
            {/* Quick Cek Booking on Mobile & Tablet */}
            <button
              onClick={onOpenTracker}
              className="inline-flex items-center justify-center p-2.5 text-slate-700 hover:text-brand-teal hover:bg-brand-mint rounded-lg text-xs font-bold min-h-[44px] min-w-[44px] cursor-pointer"
              title="Cek Status Booking"
              aria-label="Cek status booking"
            >
              <Search className="w-5 h-5 text-brand-teal" />
              <span className="hidden sm:inline ml-1.5">Cek Booking</span>
            </button>

            {/* Quick Pesan Rental on Tablet */}
            <button
              onClick={onOpenRental}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-white bg-brand-teal hover:bg-brand-teal-hover rounded-lg shadow-xs min-h-[44px] cursor-pointer"
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

      {/* Ornamen Garis Livery Mobil Listrik */}
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

            {/* Menu Items yang Disederhanakan */}
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => {
                  onNavigatePage('home');
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2.5 text-sm font-bold rounded-lg min-h-[44px] flex items-center ${
                  currentPage === 'home' ? 'bg-brand-mint text-brand-teal' : 'text-brand-primary hover:bg-slate-50'
                }`}
              >
                Beranda Utama
              </button>

              <button
                onClick={() => scrollToSection('services-section')}
                className="text-left px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-brand-mint hover:text-brand-teal rounded-lg min-h-[44px] flex items-center"
              >
                Dua Layanan Utama
              </button>

              <button
                onClick={() => scrollToSection('pricing-section')}
                className="text-left px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-brand-mint hover:text-brand-teal rounded-lg min-h-[44px] flex items-center"
              >
                Paket dan Tarif
              </button>

              {/* Sub-menu Wilayah Kota */}
              <div className="pt-2 pb-1 border-t border-slate-100">
                <span className="px-3 text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                  Wilayah Layanan:
                </span>
                <button
                  onClick={() => handleCityClick('seo-surabaya')}
                  className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center justify-between ${
                    currentPage === 'seo-surabaya' ? 'bg-brand-mint text-brand-teal' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Rental Mobil Listrik Surabaya</span>
                  <MapPin className="w-3.5 h-3.5 text-brand-teal" />
                </button>
                <button
                  onClick={() => handleCityClick('seo-sidoarjo')}
                  className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center justify-between ${
                    currentPage === 'seo-sidoarjo' ? 'bg-brand-mint text-brand-teal' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Sewa Mobil Listrik Sidoarjo</span>
                  <MapPin className="w-3.5 h-3.5 text-brand-teal" />
                </button>
                <button
                  onClick={() => handleCityClick('seo-malang')}
                  className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center justify-between ${
                    currentPage === 'seo-malang' ? 'bg-brand-mint text-brand-teal' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Rental Mobil Listrik Malang &amp; Batu</span>
                  <MapPin className="w-3.5 h-3.5 text-brand-teal" />
                </button>
                <button
                  onClick={() => handleCityClick('seo-taxi')}
                  className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center justify-between ${
                    currentPage === 'seo-taxi' ? 'bg-brand-mint text-brand-teal' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Taksi Listrik (Rp7.000/km)</span>
                  <Zap className="w-3.5 h-3.5 text-brand-teal" />
                </button>
              </div>

              <button
                onClick={() => scrollToSection('why-us-section')}
                className="text-left px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-brand-mint hover:text-brand-teal rounded-lg min-h-[44px] flex items-center"
              >
                Mengapa Memilih Kami
              </button>

              <button
                onClick={() => scrollToSection('reviews-section')}
                className="text-left px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-brand-mint hover:text-brand-teal rounded-lg min-h-[44px] flex items-center"
              >
                Ulasan Pelanggan
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTracker();
                }}
                className="text-left px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-brand-mint hover:text-brand-teal rounded-lg min-h-[44px] flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-brand-teal" />
                <span>Cek Status Booking</span>
              </button>
            </div>

            {/* Action Buttons Prioritas Mobile */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRental();
                }}
                className="w-full py-3 px-4 text-center font-bold text-sm text-white bg-brand-teal hover:bg-brand-teal-hover rounded-xl shadow-xs min-h-[44px] flex items-center justify-center gap-2"
              >
                <Car className="w-4 h-4 text-brand-lime" />
                <span>Pesan Rental Mobil (H-1)</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTaxi();
                }}
                className="w-full py-3 px-4 text-center font-bold text-sm text-brand-primary bg-brand-mint hover:bg-brand-teal-light border border-brand-teal/20 rounded-xl min-h-[44px] flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-brand-teal fill-brand-teal" />
                <span>Pesan Taksi Listrik (Rp7.000/km)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
