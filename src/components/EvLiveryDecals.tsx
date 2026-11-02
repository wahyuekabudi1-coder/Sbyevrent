import React from 'react';

/**
 * Ornamen & Decal Otomotif Mobil Listrik (Strap Stiker & Livery Accents Tebal & Profesional)
 * Terinspirasi dari livery balap & bodi mobil listrik modern (VinFast, Formula E, Taycan)
 * Palet warna resmi:
 * - Lime Green (#94C806)
 * - Brand Teal (#017A83)
 * - Brand Dark / Primary (#062426 / #093032)
 */

interface LiveryStripeProps {
  className?: string;
  variant?: 'horizontal' | 'slanted' | 'thick-bar' | 'compact';
}

/**
 * 1. Slanted Racing Hashes & Stripes ("Strap Stiker Tiga Garis ///") - Dipertebal & Lebih Tegas
 */
export const LiveryStripe: React.FC<LiveryStripeProps> = ({ className = '', variant = 'slanted' }) => {
  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="h-2 sm:h-2.5 w-8 sm:w-12 rounded-full bg-brand-lime shadow-xs" />
        <div className="h-2 sm:h-2.5 w-16 sm:w-24 rounded-full bg-brand-teal shadow-xs" />
        <div className="h-2 sm:h-2.5 w-5 sm:w-8 rounded-full bg-brand-primary shadow-xs" />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1.5 -skew-x-14 select-none ${className}`}>
        <span className="w-2 h-4 sm:h-5 rounded-xs bg-brand-lime shadow-xs" />
        <span className="w-2 h-4 sm:h-5 rounded-xs bg-brand-teal shadow-xs" />
        <span className="w-3 h-4 sm:h-5 rounded-xs bg-brand-primary shadow-xs" />
      </div>
    );
  }

  // Slanted racing decal stripes - Tebal, solid, berdimensi
  return (
    <div className={`inline-flex items-center gap-1.5 -skew-x-14 select-none ${className}`}>
      <span className="w-2 sm:w-2.5 h-6 sm:h-7 rounded-xs bg-brand-lime shadow-xs" />
      <span className="w-2 sm:w-2.5 h-6 sm:h-7 rounded-xs bg-brand-teal shadow-xs" />
      <span className="w-3.5 sm:w-4 h-6 sm:h-7 rounded-xs bg-brand-primary shadow-xs" />
    </div>
  );
};

/**
 * 2. Corner Strap Decal (Stiker Tempelan Pojok Bodi Mobil / Card Corner) - Tebal & Tegas
 */
export const CornerStrapDecal: React.FC<{ label?: string; className?: string }> = ({
  label = 'EV SPEC',
  className = ''
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-brand-dark via-brand-primary to-brand-teal text-white text-[10px] sm:text-xs font-black tracking-widest uppercase border-l-4 border-brand-lime shadow-md">
        <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse shadow-xs" />
        <span className="tracking-widest font-mono text-brand-lime">{label}</span>
        <div className="flex items-center gap-1 ml-1.5">
          <span className="w-1 h-3.5 bg-brand-lime -skew-x-14 rounded-xs" />
          <span className="w-1 h-3.5 bg-white -skew-x-14 rounded-xs" />
          <span className="w-1.5 h-3.5 bg-brand-teal -skew-x-14 rounded-xs" />
        </div>
      </div>
    </div>
  );
};

/**
 * 3. Aero Speed Decal Graphic (Strap Garis Kecepatan Aerodinamis Mobil Listrik Tebal)
 */
export const AeroSpeedGraphic: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 600 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-auto pointer-events-none select-none ${className}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="aeroTealGradThick" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94C806" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#017A83" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#062426" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="aeroLimeGradThick" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94C806" stopOpacity="1" />
          <stop offset="60%" stopColor="#94C806" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#94C806" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Main Sweeping Aero Strap - Tebal */}
      <path
        d="M 0 60 L 190 60 L 260 22 L 560 22 L 525 34 L 265 34 L 195 72 L 0 72 Z"
        fill="url(#aeroTealGradThick)"
      />

      {/* Second Bold Accent Stripe (Lime) */}
      <path
        d="M 20 80 L 200 80 L 270 42 L 590 42 L 565 48 L 273 48 L 203 86 L 20 86 Z"
        fill="url(#aeroLimeGradThick)"
      />

      {/* Tech Hashes (/// Stiker Balap Tebal) */}
      <g transform="translate(420, 52)">
        <polygon points="0,20 20,0 29,0 9,20" fill="#94C806" />
        <polygon points="15,20 35,0 44,0 24,20" fill="#017A83" />
        <polygon points="30,20 50,0 59,0 39,20" fill="#062426" />
      </g>
    </svg>
  );
};

/**
 * 4. Car Body Vinyl Decal Badge ("EV SMART JOURNEY // ZERO EMISSION") - Bold Edition
 */
export const CarLiveryDecalTag: React.FC<{
  text?: string;
  sub?: string;
  className?: string;
}> = ({
  text = 'VINFAST EV FLEET',
  sub = 'SMART JOURNEY LIVERY',
  className = ''
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-brand-dark/95 backdrop-blur-md border-2 border-brand-lime/60 shadow-lg text-white ${className}`}
    >
      {/* Dual thick accent livery bars */}
      <div className="flex flex-col gap-1 shrink-0">
        <span className="w-4 h-1.5 rounded-xs bg-brand-lime shadow-xs" />
        <span className="w-6 h-1.5 rounded-xs bg-brand-teal shadow-xs" />
      </div>

      <div className="flex flex-col leading-none">
        <span className="text-[11px] font-black tracking-widest text-white uppercase font-mono">
          {text}
        </span>
        <span className="text-[9px] font-extrabold text-brand-lime uppercase tracking-wider mt-0.5">
          {sub}
        </span>
      </div>

      {/* Tech diagonal slash */}
      <div className="flex items-center gap-1 pl-1.5 border-l-2 border-white/20">
        <span className="w-1 h-3.5 bg-brand-lime -skew-x-14 rounded-xs" />
        <span className="w-1 h-3.5 bg-brand-teal -skew-x-14 rounded-xs" />
      </div>
    </div>
  );
};

/**
 * 5. Racing Livery Edge Bar (Garis Stiker Pembatas Tebal 4px - 6px)
 */
export const LiveryDividerStripe: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full flex items-center h-2 sm:h-2.5 overflow-hidden shadow-xs ${className}`}>
      <div className="w-20 sm:w-32 h-full bg-brand-lime" />
      <div className="w-32 sm:w-48 h-full bg-brand-teal" />
      <div className="flex-1 h-full bg-gradient-to-r from-brand-primary via-brand-teal to-transparent opacity-80" />
      <div className="flex items-center gap-1 px-3 shrink-0">
        <span className="w-1.5 h-3 bg-brand-lime -skew-x-14 rounded-xs" />
        <span className="w-1.5 h-3 bg-brand-teal -skew-x-14 rounded-xs" />
        <span className="w-2 h-3 bg-brand-primary -skew-x-14 rounded-xs" />
      </div>
    </div>
  );
};

/**
 * 6. Thick Livery Banner Stripe (Aksen Garis Balap Multi-Tone Tebal 6px)
 */
export const ThickLiveryBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`h-2 sm:h-2.5 w-full flex items-center overflow-hidden rounded-full shadow-xs ${className}`}>
      <div className="w-1/4 h-full bg-brand-lime" />
      <div className="w-2/4 h-full bg-brand-teal" />
      <div className="w-1/4 h-full bg-brand-primary" />
    </div>
  );
};

/**
 * 7. Background Tech Decal Pattern (Motif Geometris Modern untuk Mencegah Section Polos)
 */
export const SectionTechPattern: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none opacity-[0.04] bg-[radial-gradient(#017A83_1.5px,transparent_1.5px)] [background-size:24px_24px] ${className}`}
      aria-hidden="true"
    />
  );
};
