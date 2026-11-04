import React from 'react';

export const FloatingWhatsApp: React.FC = () => {
  const waUrl = 'https://wa.me/6282233697979?text=Halo%20kak%2C%20mau%20sewa%20mobil%20listriknya';

  return (
    <aside aria-label="Kontak WhatsApp" className="fixed bottom-5 right-5 z-40">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp Surabaya EV Rent"
        title="Chat WhatsApp Surabaya EV Rent"
        className="flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-300"
      >
        {/* Crisp WhatsApp Icon */}
        <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-white" viewBox="0 0 24 24">
          <path d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.97.57 3.81 1.558 5.372L2.094 22l4.774-1.428A10.02 10.02 0 0012.031 22C17.567 22 22 17.505 22 12.031 22 6.495 17.567 2 12.031 2zm5.836 14.184c-.244.686-1.422 1.309-1.956 1.393-.505.08-1.161.116-3.738-.948-2.618-1.082-4.298-3.736-4.428-3.909-.13-.173-1.058-1.408-1.058-2.686 0-1.277.671-1.905.91-2.164.24-.26.523-.325.698-.325.174 0 .348.002.5.01.163.008.382-.062.597.454.223.535.759 1.854.825 1.99.066.136.109.297.02.47-.087.174-.13.283-.26.434-.13.152-.274.339-.391.455-.13.13-.266.272-.115.532.152.26.674 1.112 1.446 1.799.994.885 1.83 1.16 2.09 1.29.26.13.413.109.565-.065.152-.174.652-.76 8.26-.963.174-.202.348-.174.587-.087.24.087 1.52.717 1.78.847.26.13.434.195.499.304.065.109.065.63-.179 1.316z"/>
        </svg>
      </a>
    </aside>
  );
};
