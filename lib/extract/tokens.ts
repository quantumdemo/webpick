export interface ExtractedColor {
  hex: string;
  rgb: string;
  count: number;
  role: 'surface' | 'text' | 'accent' | 'border' | 'status';
  name: string;
  contrastOnBg?: number;
}

export interface ExtractedFont {
  family: string;
  weights: string[];
  sizes: string[];
  lineHeights: string[];
  letterSpacings: string[];
  isGoogleFont?: boolean;
}

export interface ColorGroup {
  surfaces: ExtractedColor[];
  text: ExtractedColor[];
  accents: ExtractedColor[];
  borders: ExtractedColor[];
  status: ExtractedColor[];
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return { r: 128, g: 128, b: 128 };
  return {
    r: parseInt(cleanHex.substring(0, 2), 16),
    g: parseInt(cleanHex.substring(2, 4), 16),
    b: parseInt(cleanHex.substring(4, 6), 16),
  };
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r: r255, g: g255, b: b255 } = hexToRgb(hex);
  const r = r255 / 255;
  const g = g255 / 255;
  const b = b255 / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function getDescriptiveColorName(hex: string): string {
  const clean = hex.toUpperCase();
  if (clean === '#000000') return 'Pure Black';
  if (clean === '#FFFFFF') return 'Snow White';
  if (clean === '#08090A') return 'Near Black';
  if (clean === '#061B31') return 'Deep Navy';
  if (clean === '#533AFD') return 'Stripe Violet';
  if (clean === '#6366F1') return 'Indigo Accent';
  if (clean === '#10B981') return 'Emerald Green';
  if (clean === '#EF4444') return 'Vivid Red';
  if (clean === '#F59E0B') return 'Amber Warning';

  const { h, s, l } = hexToHsl(hex);

  if (s < 12) {
    if (l < 15) return 'Dark Charcoal';
    if (l < 35) return 'Cool Slate';
    if (l < 65) return 'Medium Gray';
    if (l < 88) return 'Cool Silver';
    return 'Off White';
  }

  let hueName = 'Color';
  if (h >= 345 || h < 15) hueName = 'Red';
  else if (h >= 15 && h < 45) hueName = 'Orange / Amber';
  else if (h >= 45 && h < 70) hueName = 'Yellow';
  else if (h >= 70 && h < 165) hueName = 'Green';
  else if (h >= 165 && h < 195) hueName = 'Cyan / Teal';
  else if (h >= 195 && h < 255) hueName = 'Blue';
  else if (h >= 255 && h < 290) hueName = 'Purple / Violet';
  else if (h >= 290 && h < 345) hueName = 'Pink / Magenta';

  if (l < 25) return `Dark ${hueName}`;
  if (l > 75) return `Soft ${hueName}`;
  return `Vivid ${hueName}`;
}

export function calculateLuminance(hex: string): number {
  const { r: r255, g: g255, b: b255 } = hexToRgb(hex);
  const r = r255 / 255;
  const g = g255 / 255;
  const b = b255 / 255;

  const a = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function calculateContrastRatio(hex1: string, hex2: string): number {
  const lum1 = calculateLuminance(hex1);
  const lum2 = calculateLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const ratio = (brightest + 0.05) / (darkest + 0.05);
  return Math.round(ratio * 10) / 10;
}

export function groupColors(rawColors: { hex: string; count: number }[], bgHex = '#000000'): ColorGroup {
  const groups: ColorGroup = {
    surfaces: [],
    text: [],
    accents: [],
    borders: [],
    status: [],
  };

  const primaryBg = rawColors[0]?.hex || bgHex;

  rawColors.forEach((col, idx) => {
    const contrast = calculateContrastRatio(col.hex, primaryBg);
    const { s, l } = hexToHsl(col.hex);
    const name = getDescriptiveColorName(col.hex);

    const item: ExtractedColor = {
      hex: col.hex,
      rgb: col.hex,
      count: col.count,
      role: 'surface',
      name,
      contrastOnBg: contrast,
    };

    if (idx === 0 || (s < 20 && (l < 20 || l > 92))) {
      if (contrast < 3.0) {
        item.role = 'surface';
        groups.surfaces.push(item);
      } else {
        item.role = 'text';
        groups.text.push(item);
      }
    } else if (s > 40 && l > 20 && l < 80) {
      item.role = 'accent';
      groups.accents.push(item);
    } else if (s < 30 && l >= 20 && l <= 70) {
      item.role = 'border';
      groups.borders.push(item);
    } else if (contrast >= 4.5) {
      item.role = 'text';
      groups.text.push(item);
    } else {
      item.role = 'surface';
      groups.surfaces.push(item);
    }
  });

  return groups;
}
