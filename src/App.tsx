import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MainServices } from './components/MainServices';
import { ServicesAndPackages } from './components/ServicesAndPackages';
import { WhyChooseUs } from './components/WhyChooseUs';
import { CustomerReviews } from './components/CustomerReviews';
import { Footer } from './components/Footer';
import { RentalBookingModal } from './components/RentalBookingModal';
import { TaxiBookingModal } from './components/TaxiBookingModal';
import { PaymentModal } from './components/PaymentModal';
import { BookingTrackerModal } from './components/BookingTrackerModal';
import { CitySeoPage } from './components/CitySeoPage';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { AdminDashboard } from './pages/AdminDashboard';
import { SeoHead } from './components/SeoHead';
import { api } from './lib/api';
import { RentalPricingItem } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pricingList, setPricingList] = useState<RentalPricingItem[]>([]);

  // Modals
  const [isRentalOpen, setIsRentalOpen] = useState(false);
  const [rentalPrefill, setRentalPrefill] = useState<{ model?: string; hours?: number; city?: string } | undefined>();
  const [isTaxiOpen, setIsTaxiOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [trackerCode, setTrackerCode] = useState('');
  
  // Payment Gateway Modal
  const [paymentBookingNumber, setPaymentBookingNumber] = useState<string | null>(null);

  // Sync route from URL path or hash
  useEffect(() => {
    const checkPath = () => {
      const path = window.location.pathname;
      const hash = window.location.hash.replace('#', '');

      if (path === '/admin' || hash === 'admin') {
        setCurrentPage('admin');
      } else if (path === '/rental-mobil-listrik-surabaya') {
        setCurrentPage('seo-surabaya');
      } else if (path === '/rental-mobil-listrik-sidoarjo') {
        setCurrentPage('seo-sidoarjo');
      } else if (path === '/rental-mobil-listrik-malang') {
        setCurrentPage('seo-malang');
      } else if (path === '/taksi-listrik') {
        setCurrentPage('seo-taxi');
      } else if (path.startsWith('/payment/')) {
        const bNum = path.replace('/payment/', '');
        if (bNum) setPaymentBookingNumber(bNum);
      } else {
        setCurrentPage('home');
      }
    };

    checkPath();
    window.addEventListener('popstate', checkPath);
    return () => window.removeEventListener('popstate', checkPath);
  }, []);

  // Safe SPA Navigation with pushState
  const navigateTo = (page: string) => {
    let targetPath = '/';
    if (page === 'admin') targetPath = '/admin';
    else if (page === 'seo-surabaya') targetPath = '/rental-mobil-listrik-surabaya';
    else if (page === 'seo-sidoarjo') targetPath = '/rental-mobil-listrik-sidoarjo';
    else if (page === 'seo-malang') targetPath = '/rental-mobil-listrik-malang';
    else if (page === 'seo-taxi') targetPath = '/taksi-listrik';

    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch Pricing Data
  useEffect(() => {
    api.getPricing()
      .then(data => setPricingList(data))
      .catch(err => console.error('Gagal memuat tarif awal:', err));
  }, []);

  const handleOpenRental = (prefill?: { model?: string; hours?: number; city?: string }) => {
    setRentalPrefill(prefill);
    setIsRentalOpen(true);
  };

  const handleOpenTaxi = () => {
    setIsTaxiOpen(true);
  };

  const handleOpenTrackerWithCode = (code: string) => {
    setTrackerCode(code);
    setIsTrackerOpen(true);
  };

  const handleBookingSuccess = (bookingNumber: string) => {
    setPaymentBookingNumber(bookingNumber);
  };

  const handlePaymentSuccess = (bookingNumber: string) => {
    // Ketika pembayaran selesai, buka pelacak booking
    setTimeout(() => {
      setTrackerCode(bookingNumber);
      setIsTrackerOpen(true);
    }, 400);
  };

  // Render Admin Dashboard Page
  if (currentPage === 'admin') {
    return <AdminDashboard onBackHome={() => navigateTo('home')} />;
  }

  // Render SEO City Pages (Surabaya, Sidoarjo, Malang, Taksi)
  if (currentPage.startsWith('seo-')) {
    const cityKey = currentPage.replace('seo-', '') as 'surabaya' | 'sidoarjo' | 'malang' | 'taxi';
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-sky-200">
        <Navbar
          currentPage={currentPage}
          onNavigatePage={navigateTo}
          onOpenRental={() => handleOpenRental({ city: cityKey !== 'taxi' ? (cityKey.charAt(0).toUpperCase() + cityKey.slice(1)) : 'Surabaya' })}
          onOpenTaxi={handleOpenTaxi}
          onOpenTracker={() => setIsTrackerOpen(true)}
        />
        <main className="flex-1">
          <CitySeoPage
            cityKey={cityKey}
            onBackHome={() => navigateTo('home')}
            onOpenRental={(city) => handleOpenRental({ city: city || 'Surabaya' })}
            onOpenTaxi={(city) => handleOpenTaxi()}
            onNavigateCity={(targetCity) => navigateTo(`seo-${targetCity}`)}
          />
          <CustomerReviews />
        </main>
        <Footer
          onNavigatePage={navigateTo}
          onOpenRental={() => handleOpenRental()}
          onOpenTaxi={handleOpenTaxi}
        />
        <RentalBookingModal
          isOpen={isRentalOpen}
          onClose={() => setIsRentalOpen(false)}
          pricingList={pricingList}
          prefill={rentalPrefill}
          onSuccessBooking={handleBookingSuccess}
        />
        <TaxiBookingModal
          isOpen={isTaxiOpen}
          onClose={() => setIsTaxiOpen(false)}
          onSuccessBooking={handleBookingSuccess}
        />
        <PaymentModal
          isOpen={Boolean(paymentBookingNumber)}
          bookingNumber={paymentBookingNumber}
          onClose={() => setPaymentBookingNumber(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
        <BookingTrackerModal
          isOpen={isTrackerOpen}
          initialCode={trackerCode}
          onClose={() => setIsTrackerOpen(false)}
        />
        <FloatingWhatsApp />
      </div>
    );
  }

  // Final Restructured Home Page View with Comprehensive SEO
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-sky-200">
      
      {/* Dynamic SEO Metadata for Homepage */}
      <SeoHead
        title="Rental Mobil Listrik & Taksi Listrik Surabaya | Surabaya EV Rent"
        description="Nikmati perjalanan nyaman dengan rental mobil listrik VinFast VF 5 dan VF e34 bersama driver profesional. Tersedia layanan rental dan taksi listrik di Surabaya, Sidoarjo, dan Malang. Pesan perjalanan secara online."
        canonicalPath="/"
        keywords="rental mobil listrik, sewa mobil listrik, rental mobil listrik Surabaya, taksi mobil listrik, rental mobil listrik dengan driver, rental VinFast VF 5, rental VinFast VF e34"
        breadcrumbs={[{ name: 'Beranda', path: '/' }]}
        serviceType="general"
      />

      {/* 1. HEADER / NAVBAR */}
      <Navbar
        currentPage={currentPage}
        onNavigatePage={navigateTo}
        onOpenRental={() => handleOpenRental()}
        onOpenTaxi={handleOpenTaxi}
        onOpenTracker={() => setIsTrackerOpen(true)}
      />

      <main className="flex-1">
        {/* 2. HERO / BANNER UTAMA */}
        <Hero
          onOpenRental={() => handleOpenRental()}
          onOpenTaxi={handleOpenTaxi}
          onNavigateCity={(cityKey) => navigateTo(`seo-${cityKey}`)}
        />

        {/* 3. DUA LAYANAN UTAMA */}
        <MainServices
          onOpenRental={() => handleOpenRental()}
          onOpenTaxi={handleOpenTaxi}
        />

        {/* 4. PAKET DAN TARIF */}
        <ServicesAndPackages
          pricingList={pricingList}
          onOpenRental={prefill => handleOpenRental(prefill)}
          onOpenTaxi={handleOpenTaxi}
        />

        {/* 5. MENGAPA MEMILIH KAMI */}
        <WhyChooseUs />

        {/* 6. ULASAN PELANGGAN */}
        <CustomerReviews />
      </main>

      {/* 7. FOOTER */}
      <Footer
        onNavigatePage={navigateTo}
        onOpenRental={() => handleOpenRental()}
        onOpenTaxi={handleOpenTaxi}
      />

      {/* MODALS PERSISTED (Rental, Taksi, Payment, Tracker) */}
      <RentalBookingModal
        isOpen={isRentalOpen}
        onClose={() => setIsRentalOpen(false)}
        pricingList={pricingList}
        prefill={rentalPrefill}
        onSuccessBooking={handleBookingSuccess}
      />

      <TaxiBookingModal
        isOpen={isTaxiOpen}
        onClose={() => setIsTaxiOpen(false)}
        onSuccessBooking={handleBookingSuccess}
      />

      <PaymentModal
        isOpen={Boolean(paymentBookingNumber)}
        bookingNumber={paymentBookingNumber}
        onClose={() => setPaymentBookingNumber(null)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <BookingTrackerModal
        isOpen={isTrackerOpen}
        initialCode={trackerCode}
        onClose={() => setIsTrackerOpen(false)}
      />

      {/* Floating WhatsApp CTA */}
      <FloatingWhatsApp />

    </div>
  );
}
