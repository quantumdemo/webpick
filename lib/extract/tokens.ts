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

export function calculateLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return 0.5;
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

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

export function groupColors(rawColors: { hex: string; count: number; roleSuggestion?: string }[], bgHex = '#000000'): ColorGroup {
  const groups: ColorGroup = {
    surfaces: [],
    text: [],
    accents: [],
    borders: [],
    status: [],
  };

  rawColors.forEach((col, idx) => {
    const contrast = calculateContrastRatio(col.hex, bgHex);
    const item: ExtractedColor = {
      hex: col.hex,
      rgb: col.hex,
      count: col.count,
      role: 'surface',
      name: `Token-${idx + 1}`,
      contrastOnBg: contrast,
    };

    const clean = col.hex.toUpperCase();
    if (clean.startsWith('#0') || clean.startsWith('#1') || clean.startsWith('#2') || clean === '#FFFFFF' && idx === 0) {
      item.role = 'surface';
      item.name = idx === 0 ? 'Background Primary' : 'Surface Container';
      groups.surfaces.push(item);
    } else if (contrast >= 4.5 || clean === '#FFFFFF' || clean === '#F7F8F8' || clean === '#E5E5E6') {
      item.role = 'text';
      item.name = contrast >= 7 ? 'Text Primary' : 'Text Secondary';
      groups.text.push(item);
    } else if (clean.includes('E4F2') || clean.includes('6366') || clean.includes('3B82') || clean.includes('10B9')) {
      item.role = 'accent';
      item.name = 'Brand Accent';
      groups.accents.push(item);
    } else if (clean.includes('2E2E') || clean.includes('3741') || clean.includes('E5E7')) {
      item.role = 'border';
      item.name = 'Border Line';
      groups.borders.push(item);
    } else if (clean.includes('EF44') || clean.includes('22C5') || clean.includes('F59E')) {
      item.role = 'status';
      item.name = 'Status Badge';
      groups.status.push(item);
    } else {
      item.role = 'surface';
      groups.surfaces.push(item);
    }
  });

  return groups;
}
