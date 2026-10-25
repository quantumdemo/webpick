import { calculateContrastRatio } from './tokens';

export const STANDARD_SPACING_GRID = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192];

export function snapSpacingToGrid(valuePx: string | number): string {
  const num = typeof valuePx === 'number' ? valuePx : parseFloat(valuePx);
  if (isNaN(num) || num <= 0) return '0px';

  let closest = STANDARD_SPACING_GRID[0];
  let minDiff = Math.abs(num - closest);

  for (let i = 1; i < STANDARD_SPACING_GRID.length; i++) {
    const diff = Math.abs(num - STANDARD_SPACING_GRID[i]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = STANDARD_SPACING_GRID[i];
    }
  }

  return `${closest}px`;
}

export interface WCAGReport {
  originalFg: string;
  originalBg: string;
  originalRatio: number;
  isCompliantAA: boolean;
  isCompliantAAA: boolean;
  suggestedFg?: string;
  note?: string;
}

export function harmonizeContrast(fgHex: string, bgHex: string): WCAGReport {
  const ratio = calculateContrastRatio(fgHex, bgHex);
  const isAA = ratio >= 4.5;
  const isAAA = ratio >= 7.0;

  let suggestedFg = fgHex;
  let note = 'Meets WCAG 2.1 AA contrast requirements.';

  if (!isAA) {
    suggestedFg = bgHex.toUpperCase().startsWith('#0') || bgHex.toUpperCase().startsWith('#1') ? '#FFFFFF' : '#0F1011';
    note = `Contrast ratio ${ratio}:1 is below WCAG AA (4.5:1). Adjusted to ${suggestedFg} for accessibility.`;
  }

  return {
    originalFg: fgHex,
    originalBg: bgHex,
    originalRatio: ratio,
    isCompliantAA: isAA,
    isCompliantAAA: isAAA,
    suggestedFg,
    note,
  };
}
