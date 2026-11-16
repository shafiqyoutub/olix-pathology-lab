/**
 * Default authentic clinical graphics (Stamps, Signatures, Logos)
 */

export const defaultDoctorSignatureSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="240" height="80">
  <path d="M 20,50 Q 40,20 60,45 T 90,35 Q 110,60 130,25 Q 150,15 160,40 T 190,30 Q 210,50 230,35" fill="none" stroke="%231e3a8a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 45,65 Q 110,55 185,58" fill="none" stroke="%231e3a8a" stroke-width="1.8" stroke-linecap="round" />
  <path d="M 50,30 L 50,60" fill="none" stroke="%231e3a8a" stroke-width="2.2" stroke-linecap="round" />
  <text x="140" y="72" font-family="sans-serif" font-size="9" fill="%23475569" font-weight="600">M.Phil (Path)</text>
</svg>`;

export const defaultLabStampSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <circle cx="80" cy="80" r="74" fill="none" stroke="%230284c7" stroke-width="3" stroke-dasharray="6,3" opacity="0.85" />
  <circle cx="80" cy="80" r="66" fill="none" stroke="%230284c7" stroke-width="1.5" opacity="0.85" />
  <circle cx="80" cy="80" r="42" fill="none" stroke="%230284c7" stroke-width="1.5" opacity="0.85" />
  
  <path id="curveTop" d="M 22,80 A 58,58 0 0,1 138,80" fill="none" />
  <path id="curveBottom" d="M 138,80 A 58,58 0 0,1 22,80" fill="none" />
  
  <text font-size="9" font-weight="bold" fill="%230284c7" letter-spacing="1.2" opacity="0.9">
    <textPath href="%23curveTop" startOffset="50%" text-anchor="middle">
      RAZA CLINICAL LABORATORY
    </textPath>
  </text>
  
  <text font-size="8.5" font-weight="600" fill="%230284c7" letter-spacing="1" opacity="0.9">
    <textPath href="%23curveBottom" startOffset="50%" text-anchor="middle">
      ★ VERIFIED DIAGNOSTIC ★
    </textPath>
  </text>

  <g transform="translate(80, 80)">
    <!-- Caduceus / medical cross icon -->
    <path d="M -12,0 L 12,0 M 0,-12 L 0,12" stroke="%230284c7" stroke-width="3" stroke-linecap="round" opacity="0.85" />
    <text x="0" y="24" text-anchor="middle" font-size="7.5" font-weight="bold" fill="%230284c7">DERA BAKHA</text>
  </g>
</svg>`;

export const defaultLabLogoSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%230d9488" />
      <stop offset="100%" stop-color="%230284c7" />
    </linearGradient>
  </defs>
  <rect x="5" y="5" width="90" height="90" rx="22" fill="url(%23grad1)" />
  <circle cx="50" cy="50" r="32" fill="%23ffffff" opacity="0.15" />
  <!-- Flask / Microscope / Cross composite -->
  <path d="M 38,28 L 62,28 M 46,28 L 46,42 L 32,68 C 30,72 34,76 39,76 L 61,76 C 66,76 70,72 68,68 L 54,42 L 54,28" 
        fill="none" stroke="%23ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="48" cy="62" r="3" fill="%23ffffff" />
  <circle cx="56" cy="66" r="2" fill="%23ffffff" />
  <circle cx="44" cy="55" r="2.2" fill="%23ffffff" />
</svg>`;
