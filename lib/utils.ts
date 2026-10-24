import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCssVariables(tokens: any) {
  if (!tokens || !tokens.colors) return '';

  const cssVars = tokens.colors
    .map((c: any, index: number) => {
      const varName = `--color-${c.role || index}`;
      return `${varName}: ${c.hex};`;
    })
    .join('\n  ');

  return `:root {\n  ${cssVars}\n}`;
}

export function generateTailwindConfig(tokens: any) {
  const colorsObj: Record<string, string> = {};
  if (tokens?.colors && Array.isArray(tokens.colors)) {
    tokens.colors.forEach((c: any, i: number) => {
      const key = c.role || `color-${i + 1}`;
      colorsObj[key] = c.hex;
    });
  }

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: ${JSON.stringify(colorsObj, null, 8)},
      fontFamily: {
        sans: ${JSON.stringify(tokens?.typography?.fontFamilies || ['Inter', 'sans-serif'])},
      },
      borderRadius: {
        custom: '${tokens?.radii?.[0] || '8px'}',
      }
    },
  },
  plugins: [],
};`;
}

export function calculateWcagContrast(hex1: string, hex2: string = '#0A0B0E') {
  function getLuminance(hex: string) {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    if (isNaN(num)) return 0;

    const r = ((num >> 16) & 255) / 255;
    const g = ((num >> 8) & 255) / 255;
    const b = (num & 255) / 255;

    const sR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const sG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const sB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
  }

  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);

  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  const formattedRatio = (Math.round(ratio * 10) / 10).toFixed(1);

  if (ratio >= 7) return { label: `AAA (${formattedRatio}:1)`, pass: true, badge: 'AAA' };
  if (ratio >= 4.5) return { label: `AA (${formattedRatio}:1)`, pass: true, badge: 'AA' };
  return { label: `FAIL (${formattedRatio}:1)`, pass: false, badge: 'FAIL' };
}

export function generateDesignMd(tokens: any) {
  const name = tokens?.meta?.siteName || 'Design System';
  const colorsText = (tokens?.colors || [])
    .map((c: any) => `- **${c.name}** (\`${c.role}\`): \`${c.hex}\``)
    .join('\n');

  return `# ${name} - Design DNA & System Architecture

## 1. Color Palette Tokens
${colorsText}

## 2. Typography Rules
- **Primary Font Family**: ${tokens?.typography?.fontFamilies?.[0] || 'Inter'}
- **Heading 1**: ${tokens?.typography?.headings?.[0]?.fontSize || '56px'} / Weight: ${tokens?.typography?.headings?.[0]?.fontWeight || '700'}
- **Heading 2**: ${tokens?.typography?.headings?.[1]?.fontSize || '36px'} / Weight: ${tokens?.typography?.headings?.[1]?.fontWeight || '600'}
- **Body Text**: ${tokens?.typography?.body?.fontSize || '16px'} / Line Height: ${tokens?.typography?.body?.lineHeight || '1.5'}

## 3. Spacing & Radius System
- **Radii**: ${tokens?.radii?.join(', ') || '6px, 12px'}
- **Spacing Scale**: ${tokens?.spacing?.join(', ') || '8px, 16px, 24px, 32px'}

## 4. Rebuild Rules
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Design Intent**: Remake clean, accessible, modern UI with zero junk HTML/CSS.
`;
}

export function generateAiPrompt(tokens: any) {
  const name = tokens?.meta?.siteName || 'Design System';
  return `You are a Principal Frontend Architect. Rebuild the hero and key components of ${name} using Next.js 15 App Router, TypeScript, and Tailwind CSS.

Follow these strict design tokens extracted directly from the reference site:

PRIMARY COLORS:
${tokens?.colors?.map((c: any) => `- ${c.name} (${c.role}): ${c.hex}`).join('\n')}

TYPOGRAPHY:
- Font Family: ${tokens?.typography?.fontFamilies?.join(', ')}
- H1: ${tokens?.typography?.headings?.[0]?.fontSize}, H2: ${tokens?.typography?.headings?.[1]?.fontSize}

REQUIREMENTS:
1. Do NOT scrape or copy raw legacy HTML.
2. Build semantic, fully responsive React components in Tailwind CSS.
3. Use dark mode background (${tokens?.colors?.[0]?.hex || '#0F1015'}) and crisp typography.
4. Ensure full WCAG accessibility compliance.`;
}
