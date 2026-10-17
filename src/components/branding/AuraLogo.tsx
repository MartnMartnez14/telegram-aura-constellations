import React, { useId } from 'react';

export interface AuraLogoProps {
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
  title?: string;
}

const SIZE_MAP: Record<'sm' | 'md' | 'lg' | 'xl', number> = {
  sm: 28,
  md: 40,
  lg: 64,
  xl: 96,
};

export const AuraLogo: React.FC<AuraLogoProps> = ({
  size = 'md',
  animated = false,
  className = '',
  title = 'Telegram AURA — Constellations',
}) => {
  const uid = useId().replace(/:/g, '');
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] ?? 40;

  const bgGlowId = `aura-bg-glow-${uid}`;
  const geoAId = `aura-geo-a-${uid}`;
  const geoBId = `aura-geo-b-${uid}`;
  const geoCId = `aura-geo-c-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={pixelSize}
      height={pixelSize}
      fill="none"
      role="img"
      aria-label={title}
      className={`aura-logo ${animated ? 'aura-logo-animated' : ''} ${className}`.trim()}
    >
      <title>{title}</title>
      <defs>
        <radialGradient id={bgGlowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A997DF" stopOpacity="0.24" />
          <stop offset="65%" stopColor="#D9BC80" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#10121D" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={geoAId} x1="28" y1="74" x2="54" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94BFB2" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#A997DF" stopOpacity="0.96" />
        </linearGradient>

        <linearGradient id={geoBId} x1="54" y1="26" x2="90" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A997DF" stopOpacity="0.96" />
          <stop offset="100%" stopColor="#D9BC80" stopOpacity="0.96" />
        </linearGradient>

        <linearGradient id={geoCId} x1="90" y1="66" x2="28" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D9BC80" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#94BFB2" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Atmospheric background halo */}
      <circle cx="60" cy="60" r="52" fill={`url(#${bgGlowId})`} />

      {/* Subtle elliptical orbital ring */}
      <ellipse
        cx="60"
        cy="58"
        rx="44"
        ry="27"
        transform="rotate(-21 60 58)"
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="1.2"
        strokeDasharray="3 4"
      />

      {/* Outer celestial meridian */}
      <circle
        cx="60"
        cy="60"
        r="48"
        stroke="#A997DF"
        strokeOpacity="0.2"
        strokeWidth="1"
      />

      {/* Geodesic constellation strokes connecting the three celestial bodies */}
      <path
        className="aura-geodesic-path"
        d="M 28 74 Q 36 45 54 26"
        stroke={`url(#${geoAId})`}
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      <path
        className="aura-geodesic-path"
        d="M 54 26 Q 77 39 90 66"
        stroke={`url(#${geoBId})`}
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      <path
        className="aura-geodesic-path"
        d="M 90 66 Q 59 81 28 74"
        stroke={`url(#${geoCId})`}
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      {/* Internal centroid lines */}
      <line x1="54" y1="26" x2="57" y2="57" stroke="#A997DF" strokeOpacity="0.28" strokeWidth="1" />
      <line x1="90" y1="66" x2="57" y2="57" stroke="#D9BC80" strokeOpacity="0.28" strokeWidth="1" />
      <line x1="28" y1="74" x2="57" y2="57" stroke="#94BFB2" strokeOpacity="0.28" strokeWidth="1" />
      <circle cx="57" cy="57" r="2.1" fill="#F4F0F8" fillOpacity="0.75" />

      {/* Body 1: Amethyst (#A997DF) */}
      <g className="aura-celestial-node">
        <circle cx="54" cy="26" r="11" fill="#A997DF" fillOpacity="0.2" />
        <circle cx="54" cy="26" r="6.4" fill="#A997DF" />
        <circle cx="52.2" cy="24.2" r="2" fill="#F4F0F8" fillOpacity="0.88" />
      </g>

      {/* Body 2: Champagne Gold (#D9BC80) */}
      <g className="aura-celestial-node">
        <circle cx="90" cy="66" r="9.5" fill="#D9BC80" fillOpacity="0.2" />
        <circle cx="90" cy="66" r="5.4" fill="#D9BC80" />
        <circle cx="88.5" cy="64.5" r="1.7" fill="#F4F0F8" fillOpacity="0.88" />
      </g>

      {/* Body 3: Sage (#94BFB2) */}
      <g className="aura-celestial-node">
        <circle cx="28" cy="74" r="8.5" fill="#94BFB2" fillOpacity="0.2" />
        <circle cx="28" cy="74" r="4.8" fill="#94BFB2" />
        <circle cx="26.7" cy="72.7" r="1.5" fill="#F4F0F8" fillOpacity="0.88" />
      </g>
    </svg>
  );
};

export default AuraLogo;
