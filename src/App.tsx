import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { WhyChooseUs } from './components/WhyChooseUs';
import { VehicleFleet } from './components/VehicleFleet';
import { ServicesAndPackages } from './components/ServicesAndPackages';
import { Footer } from './components/Footer';
import { RentalBookingPage } from './pages/RentalBookingPage';
import { TaxiBookingPage } from './pages/TaxiBookingPage';
import { PaymentModal } from './components/PaymentModal';
import { BookingTrackerModal } from './components/BookingTrackerModal';
import { CitySeoPage } from './components/CitySeoPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { DriverPortal } from './pages/DriverPortal';
import { api } from './lib/api';
import { RentalPricingItem } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pricingList, setPricingList] = useState<RentalPricingItem[]>([]);

  // Fixed Page Rental Prefill
  const [rentalPrefill, setRentalPrefill] = useState<{ model?: string; hours?: number; city?: string } | undefined>();
  
  // Tracker Modal
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
      } else if (path === '/driver' || hash === 'driver') {
        setCurrentPage('driver');
      } else if (path === '/pesan-rental' || path === '/rental' || hash === 'rental') {
        setCurrentPage('rental-booking');
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

  // Navigation handler with browser URL synchronization (benar-benar ke URL halaman, bukan jendela mengambang)
  const handleNavigatePage = (page: string) => {
    setCurrentPage(page);
    let targetPath = '/';
    if (page === 'admin') targetPath = '/admin';
    else if (page === 'driver') targetPath = '/driver';
    else if (page === 'rental-booking' || page === 'rental') targetPath = '/pesan-rental';
    else if (page === 'taxi-booking' || page === 'taxi') targetPath = '/taksi-listrik';
    else if (page === 'seo-surabaya') targetPath = '/rental-mobil-listrik-surabaya';
    else if (page === 'seo-sidoarjo') targetPath = '/rental-mobil-listrik-sidoarjo';
    else if (page === 'seo-taxi') targetPath = '/taksi-listrik';
    try {
      window.history.pushState(null, '', targetPath);
    } catch {
      // fallback if in strict iframe
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler ke Halaman Fix Rental Booking (Bukan Modal/Jendela Mengambang)
  const handleOpenRental = (prefill?: { model?: string; hours?: number; city?: string }) => {
    setRentalPrefill(prefill);
    handleNavigatePage('rental-booking');
  };

  // Handler ke Halaman Fix Taksi Booking (Bukan Modal/Jendela Mengambang)
  const handleOpenTaxi = () => {
    handleNavigatePage('taxi-booking');
  };

  const handleOpenTrackerWithCode = (code: string) => {
    setTrackerCode(code);
    setIsTrackerOpen(true);
  };

  const handlePaymentSuccess = (bookingNumber: string) => {
    // Ketika pembayaran selesai, buka pelacak booking
    setTimeout(() => {
      setTrackerCode(bookingNumber);
      setIsTrackerOpen(true);
    }, 400);
  };

  // Render Admin Dashboard Page (Halaman Penuh, Bukan Jendela Mengambang)
  if (currentPage === 'admin') {
    return <AdminDashboard onBackHome={() => handleNavigatePage('home')} />;
  }

  // Render Driver Portal Page
  if (currentPage === 'driver') {
    return <DriverPortal onBackHome={() => handleNavigatePage('home')} />;
  }

  // Render Dedicated Fixed Rental Booking Page (Bukan Jendela Mengambang)
  if (currentPage === 'rental-booking') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
        <RentalBookingPage
          pricingList={pricingList}
          prefill={rentalPrefill}
          onBackHome={() => handleNavigatePage('home')}
          onOpenPaymentModal={(bNum) => setPaymentBookingNumber(bNum)}
          onOpenTracker={handleOpenTrackerWithCode}
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
      </div>
    );
  }

  // Render Dedicated Fixed Taxi Booking Page (Bukan Jendela Mengambang)
  if (currentPage === 'taxi-booking' || currentPage === 'taxi') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
        <TaxiBookingPage
          onBackHome={() => handleNavigatePage('home')}
          onOpenPaymentModal={(bNum) => setPaymentBookingNumber(bNum)}
          onOpenTracker={handleOpenTrackerWithCode}
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
      </div>
    );
  }

  // Render SEO City Pages
  if (currentPage.startsWith('seo-')) {
    const cityKey = currentPage.replace('seo-', '') as 'surabaya' | 'sidoarjo' | 'taxi';
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar
          currentPage={currentPage}
          onNavigatePage={handleNavigatePage}
          onOpenRental={() => handleOpenRental()}
          onOpenTaxi={handleOpenTaxi}
          onOpenTracker={() => setIsTrackerOpen(true)}
        />
        <main className="flex-1">
          <CitySeoPage
            cityKey={cityKey}
            onBackHome={() => handleNavigatePage('home')}
            onOpenRental={city => handleOpenRental({ city })}
            onOpenTaxi={city => handleOpenTaxi()}
          />
        </main>
        <Footer
          onNavigatePage={handleNavigatePage}
          onOpenRental={() => handleOpenRental()}
          onOpenTaxi={handleOpenTaxi}
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
      </div>
    );
  }

  // Default Home Page View
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-sky-200">
      
      {/* SECTION 1 — HEADER */}
      <Navbar
        currentPage={currentPage}
        onNavigatePage={handleNavigatePage}
        onOpenRental={() => handleOpenRental()}
        onOpenTaxi={handleOpenTaxi}
        onOpenTracker={() => setIsTrackerOpen(true)}
      />

      <main className="flex-1">
        {/* SECTION 2 — HERO */}
        <Hero
          onOpenRental={() => handleOpenRental()}
          onOpenTaxi={handleOpenTaxi}
        />

        {/* SECTION 3 — WHY CHOOSE US */}
        <WhyChooseUs />

        {/* SECTION 4 — PILIHAN KENDARAAN */}
        <VehicleFleet
          onSelectVehicle={model => handleOpenRental({ model })}
        />

        {/* SECTION 5 & 6 — LAYANAN KAMI & PAKET RENTAL */}
        <ServicesAndPackages
          pricingList={pricingList}
          onOpenRental={prefill => handleOpenRental(prefill)}
          onOpenTaxi={handleOpenTaxi}
        />
      </main>

      {/* SECTION 13 — FOOTER DAN IDENTITAS PERUSAHAAN */}
      <Footer
        onNavigatePage={handleNavigatePage}
        onOpenRental={() => handleOpenRental()}
        onOpenTaxi={handleOpenTaxi}
      />

      {/* PAYMENT & TRACKER MODALS */}
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

    </div>
  );
}
