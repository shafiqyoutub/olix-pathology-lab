import assetsData from './assetsData.json';

/**
 * Default authentic clinical graphics (Stamps, Signatures, Logos)
 */

export const defaultDoctorSignatureSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="240" height="80">
  <path d="M 20,50 Q 40,20 60,45 T 90,35 Q 110,60 130,25 Q 150,15 160,40 T 190,30 Q 210,50 230,35" fill="none" stroke="%231e3a8a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 45,65 Q 110,55 185,58" fill="none" stroke="%231e3a8a" stroke-width="1.8" stroke-linecap="round" />
  <path d="M 50,30 L 50,60" fill="none" stroke="%231e3a8a" stroke-width="2.2" stroke-linecap="round" />
</svg>`;

export const defaultTechnologistSignatureSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="240" height="80">
  <path d="M 20,46 Q 35,18 48,32 Q 58,45 64,28 Q 72,50 84,34 Q 96,20 110,38 T 134,32 Q 150,16 168,34 Q 182,48 200,28 Q 214,40 228,32" fill="none" stroke="%230f4c81" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 30,58 Q 115,48 212,52" fill="none" stroke="%230f4c81" stroke-width="1.8" stroke-linecap="round" />
  <path d="M 36,22 L 36,52" fill="none" stroke="%230f4c81" stroke-width="2.2" stroke-linecap="round" />
  <circle cx="218" cy="51" r="2" fill="%230f4c81" />
</svg>`;

// Authentic Raza Clinical Laboratory Stamp (High-res transparent blue ink seal)
export const defaultLabStampSvg = assetsData.stampBase64;

// Authentic Raza Clinical Laboratory Official Logo (Microscope, DNA helix, laboratory reagents)
export const defaultLabLogoSvg = assetsData.logoBase64;
