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
import { api } from './lib/api';
import { RentalPricingItem } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pricingList, setPricingList] = useState<RentalPricingItem[]>([]);

  // Modals
  const [isRentalOpen, setIsRentalOpen] = useState(false);
  const [rentalPrefill, setRentalPrefill] = useState<{ model?: string; hours?: number } | undefined>();
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
      } else if (path === '/taksi-listrik') {
        setCurrentPage('seo-taxi');
      } else if (path.startsWith('/payment/')) {
        const bNum = path.replace('/payment/', '');
        if (bNum) setPaymentBookingNumber(bNum);
      }
    };

    checkPath();
    window.addEventListener('popstate', checkPath);
    return () => window.removeEventListener('popstate', checkPath);
  }, []);

  // Fetch Pricing Data
  useEffect(() => {
    api.getPricing()
      .then(data => setPricingList(data))
      .catch(err => console.error('Gagal memuat tarif awal:', err));
  }, []);

  const handleOpenRental = (prefill?: { model?: string; hours?: number }) => {
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
    return <AdminDashboard onBackHome={() => setCurrentPage('home')} />;
  }

  // Render SEO City Pages
  if (currentPage.startsWith('seo-')) {
    const cityKey = currentPage.replace('seo-', '') as 'surabaya' | 'sidoarjo' | 'taxi';
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar
          currentPage={currentPage}
          onNavigatePage={setCurrentPage}
          onOpenRental={() => handleOpenRental()}
          onOpenTaxi={handleOpenTaxi}
          onOpenTracker={() => setIsTrackerOpen(true)}
        />
        <main className="flex-1">
          <CitySeoPage
            cityKey={cityKey}
            onBackHome={() => setCurrentPage('home')}
            onOpenRental={city => handleOpenRental()}
            onOpenTaxi={city => handleOpenTaxi()}
          />
          <CustomerReviews />
        </main>
        <Footer
          onNavigatePage={setCurrentPage}
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
        {/* Floating WhatsApp CTA */}
        <FloatingWhatsApp />
      </div>
    );
  }

  // Final Restructured Home Page View
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-sky-200">
      
      {/* 1. HEADER / NAVBAR */}
      <Navbar
        currentPage={currentPage}
        onNavigatePage={setCurrentPage}
        onOpenRental={() => handleOpenRental()}
        onOpenTaxi={handleOpenTaxi}
        onOpenTracker={() => setIsTrackerOpen(true)}
      />

      <main className="flex-1">
        {/* 2. HERO / BANNER UTAMA */}
        <Hero
          onOpenRental={() => handleOpenRental()}
          onOpenTaxi={handleOpenTaxi}
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
        onNavigatePage={setCurrentPage}
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
