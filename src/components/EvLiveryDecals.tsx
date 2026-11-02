import React from 'react';

/**
 * Ornamen & Decal Otomotif Mobil Listrik (Strap Stiker & Livery Accents)
 * Terinspirasi dari stiker bodi mobil listrik modern (VinFast, Formula E, Taycan livery)
 * Menggunakan palet warna resmi dari Logo:
 * - Lime Green (#94C806)
 * - Brand Teal (#017A83)
 * - Brand Primary / Dark Teal (#093032)
 */

interface LiveryStripeProps {
  className?: string;
  variant?: 'horizontal' | 'slanted' | 'badge';
}

/**
 * 1. Slanted Racing Hashes & Stripes ("Strap Stiker Tiga Garis ///")
 */
export const LiveryStripe: React.FC<LiveryStripeProps> = ({ className = '', variant = 'slanted' }) => {
  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <div className="h-1 sm:h-1.5 w-6 sm:w-8 rounded-full bg-brand-lime" />
        <div className="h-1 sm:h-1.5 w-12 sm:w-16 rounded-full bg-brand-teal" />
        <div className="h-1 sm:h-1.5 w-3 sm:w-4 rounded-full bg-brand-primary" />
      </div>
    );
  }

  // Slanted automotive decal stripes (like /// racing livery)
  return (
    <div className={`inline-flex items-center gap-1 -skew-x-12 select-none ${className}`}>
      <span className="w-1.5 h-4 sm:h-5 rounded-xs bg-brand-lime shadow-2xs" />
      <span className="w-1.5 h-4 sm:h-5 rounded-xs bg-brand-teal shadow-2xs" />
      <span className="w-2.5 h-4 sm:h-5 rounded-xs bg-brand-primary shadow-2xs" />
    </div>
  );
};

/**
 * 2. Corner Strap Decal (Stiker Tempelan Pojok Bodi Mobil / Card Corner)
 */
export const CornerStrapDecal: React.FC<{ label?: string; className?: string }> = ({
  label = 'EV SPEC',
  className = ''
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Dynamic angled vinyl strap */}
      <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-brand-primary via-brand-teal to-brand-primary text-white text-[9px] sm:text-[10px] font-black tracking-widest uppercase border-l-2 border-brand-lime shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-pulse" />
        <span className="tracking-widest font-mono">{label}</span>
        <div className="flex items-center gap-0.5 ml-1 opacity-70">
          <span className="w-0.5 h-2.5 bg-brand-lime -skew-x-12" />
          <span className="w-0.5 h-2.5 bg-white -skew-x-12" />
        </div>
      </div>
    </div>
  );
};

/**
 * 3. Aero Speed Decal Graphic (Strap Garis Kecepatan Aerodinamis Mobil Listrik)
 * Ideal untuk background Hero, section divider, atau kartu armada
 */
export const AeroSpeedGraphic: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 600 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-auto pointer-events-none select-none opacity-40 ${className}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="aeroTealGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94C806" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#017A83" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#093032" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="aeroLimeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94C806" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#94C806" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#94C806" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Main Sweeping Aero Strap */}
      <path
        d="M 0 50 L 180 50 L 240 20 L 550 20 L 520 28 L 245 28 L 185 58 L 0 58 Z"
        fill="url(#aeroTealGrad)"
      />

      {/* Thin Accent Speed Stripe (Lime) */}
      <path
        d="M 20 66 L 190 66 L 250 36 L 580 36 L 560 40 L 253 40 L 193 70 L 20 70 Z"
        fill="url(#aeroLimeGrad)"
      />

      {/* Tech Hashes (/// Stiker Balap) */}
      <g opacity="0.75" transform="translate(420, 48)">
        <polygon points="0,15 15,0 22,0 7,15" fill="#94C806" />
        <polygon points="12,15 27,0 34,0 19,15" fill="#017A83" />
        <polygon points="24,15 39,0 46,0 31,15" fill="#093032" />
      </g>
    </svg>
  );
};

/**
 * 4. Car Body Vinyl Decal Badge ("EV SMART JOURNEY // ZERO EMISSION")
 * Ditempatkan di pojok kartu armada / showcase mobil layaknya stiker livery resmi
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
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-dark/90 backdrop-blur-md border border-brand-teal/40 shadow-xs text-white ${className}`}
    >
      {/* Dual accent livery bars */}
      <div className="flex flex-col gap-0.5 shrink-0">
        <span className="w-3.5 h-1 rounded-xs bg-brand-lime" />
        <span className="w-5 h-1 rounded-xs bg-brand-teal" />
      </div>

      <div className="flex flex-col leading-none">
        <span className="text-[10px] font-black tracking-widest text-white uppercase font-mono">
          {text}
        </span>
        <span className="text-[8px] font-bold text-brand-lime uppercase tracking-wider mt-0.5">
          {sub}
        </span>
      </div>

      {/* Tech diagonal slash */}
      <div className="flex items-center gap-0.5 pl-1 border-l border-white/20">
        <span className="w-0.5 h-3 bg-brand-lime -skew-x-12" />
        <span className="w-0.5 h-3 bg-brand-teal -skew-x-12" />
      </div>
    </div>
  );
};

/**
 * 5. Racing Livery Edge Bar (Garis Stiker Pembatas Cantik & Bersih)
 */
export const LiveryDividerStripe: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full flex items-center h-1 sm:h-1.5 overflow-hidden ${className}`}>
      <div className="w-16 sm:w-24 h-full bg-brand-lime" />
      <div className="w-24 sm:w-36 h-full bg-brand-teal" />
      <div className="flex-1 h-full bg-gradient-to-r from-brand-primary to-transparent opacity-60" />
      <div className="flex items-center gap-1 px-2 shrink-0 opacity-40">
        <span className="w-1 h-2 bg-brand-lime -skew-x-12" />
        <span className="w-1 h-2 bg-brand-teal -skew-x-12" />
        <span className="w-1 h-2 bg-brand-primary -skew-x-12" />
      </div>
    </div>
  );
};
