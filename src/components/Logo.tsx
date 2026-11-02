import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
  lightMode?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Komponen Logo Resmi Surabaya EV Rent
 * - Format PNG transparan asli (tanpa background hitam buatan)
 * - Dipertahankan 100% sesuai file desain asli pengguna
 * - Dilengkapi multi-path fallback dan inline SVG fallback agar logo tidak pernah hilang
 * - Judul website persis sesuai logo: Surabaya (Teal/Dark) EV (Lime) Rent (Teal)
 */
export const Logo: React.FC<LogoProps> = ({
  className = 'h-12 sm:h-14 lg:h-16',
  showSubtitle = true,
  lightMode = false,
  size = 'md'
}) => {
  const [imgSrcIndex, setImgSrcIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Daftar path logo resmi untuk redundansi aset
  const imageSources = [
    '/assets/logo-official.png',
    '/logo-official.png',
    '/logo.png',
    '/assets/logo.png',
    '/assets/aistudio/09e2ac5f-9628-4d23-ba30-a481753dda76_c2a0315c.jpeg'
  ];

  const handleImageError = () => {
    if (imgSrcIndex < imageSources.length - 1) {
      setImgSrcIndex((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  return (
    <div className="flex items-center gap-2.5 sm:gap-3.5 select-none shrink-0 max-w-full">
      {/* Container logo transparan murni tanpa background hitam buatan */}
      <div className={`relative flex items-center justify-center shrink-0 aspect-[449/326] ${className}`}>
        {!hasError ? (
          <img
            src={imageSources[imgSrcIndex]}
            alt="Surabaya EV Rent - Logo Resmi"
            className="w-full h-full object-contain filter drop-shadow-xs"
            loading="eager"
            fetchPriority="high"
            onError={handleImageError}
          />
        ) : (
          /* High-fidelity SVG Fallback jika file gambar eksternal gagal dimuat */
          <svg
            viewBox="0 0 449 326"
            className="w-full h-full object-contain"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Surabaya EV Rent Logo"
          >
            <defs>
              <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#94C806" />
                <stop offset="100%" stopColor="#028143" />
              </linearGradient>
              <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#028143" />
                <stop offset="60%" stopColor="#017A83" />
                <stop offset="100%" stopColor="#093032" />
              </linearGradient>
            </defs>
            {/* Daun Hijau Atas (Bentuk S atas) */}
            <path
              d="M 145 150 C 160 70, 250 20, 365 35 C 330 90, 260 145, 145 150 Z"
              fill="url(#leafGrad)"
            />
            {/* Tugu Pahlawan Tengah */}
            <path
              d="M 215 150 L 210 100 L 205 90 L 215 65 L 220 90 L 217 100 L 222 150 Z"
              fill="#017A83"
            />
            {/* Kelopak Bawah & Kilat Listrik (Bentuk S bawah) */}
            <path
              d="M 60 215 C 130 180, 200 170, 220 170 L 180 205 L 235 205 L 200 245 C 270 245, 305 210, 310 180 C 310 240, 240 270, 160 260 C 110 250, 75 230, 60 215 Z"
              fill="url(#boltGrad)"
            />
            {/* Teks Identitas Logo */}
            <text x="224" y="305" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontStyle="italic" fontSize="32">
              <tspan fill="#017A83">Surabaya </tspan>
              <tspan fill="#94C806">EV </tspan>
              <tspan fill="#017A83">Rent</tspan>
            </text>
          </svg>
        )}
      </div>

      {showSubtitle && (
        <div
          className={`flex flex-col justify-center border-l-2 pl-3 sm:pl-3.5 lg:pl-4 leading-tight shrink-0 ${
            lightMode ? 'border-brand-teal/40' : 'border-slate-300'
          }`}
        >
          {/* Judul Website diperbesar agar proporsional dan seimbang dengan ukuran logo */}
          <div className="flex items-center gap-1 sm:gap-1.5 font-black text-base xs:text-lg sm:text-xl lg:text-2xl xl:text-[26px] tracking-tight leading-none mb-1 whitespace-nowrap">
            <span className={lightMode ? 'text-white' : 'text-brand-primary'}>Surabaya</span>
            <span className="text-brand-lime font-black">EV</span>
            <span className={lightMode ? 'text-brand-mint' : 'text-brand-teal'}>Rent</span>
          </div>

          <span
            className={`text-[9px] xs:text-[10px] sm:text-xs lg:text-[12px] font-bold tracking-tight whitespace-nowrap ${
              lightMode ? 'text-brand-lime' : 'text-brand-teal'
            }`}
          >
            Powered by PT Sawah Jaya Trans
          </span>
        </div>
      )}
    </div>
  );
};
