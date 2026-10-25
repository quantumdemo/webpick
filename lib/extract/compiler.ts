export interface GeneratedComponents {
  button: string;
  card: string;
  input: string;
}

export function compileReactComponents(tokens: any): GeneratedComponents {
  const bg = tokens?.colors?.surfaces?.[0]?.hex || '#08090A';
  const text = tokens?.colors?.text?.[0]?.hex || '#F7F8F8';
  const font = tokens?.typography?.fontFamilies?.[0] || 'Inter';

  const button = [
    "'use client';",
    "",
    "import React from 'react';",
    "",
    "export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {",
    "  variant?: 'primary' | 'outline' | 'ghost';",
    "  children: React.ReactNode;",
    "}",
    "",
    "export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(",
    "  ({ variant = 'primary', className = '', children, ...props }, ref) => {",
    "    const base = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 h-10 px-5 rounded-full text-sm';",
    "    ",
    "    const variants = {",
    `      primary: 'bg-[${bg}] text-[${text}] hover:opacity-90 active:scale-[0.98]',`,
    `      outline: 'border border-white/10 bg-transparent text-[${text}] hover:bg-white/5',`,
    "      ghost: 'bg-transparent text-white/70 hover:text-white hover:bg-white/5',",
    "    };",
    "",
    "    return (",
    "      <button",
    "        ref={ref}",
    "        className={`${base} ${variants[variant]} ${className}`}",
    `        style={{ fontFamily: '${font}, sans-serif' }}`,
    "        {...props}",
    "      >",
    "        {children}",
    "      </button>",
    "    );",
    "  }",
    ");",
    "",
    "Button.displayName = 'Button';",
  ].join('\n');

  const card = [
    "'use client';",
    "",
    "import React from 'react';",
    "",
    "export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {",
    "  title?: string;",
    "  children: React.ReactNode;",
    "}",
    "",
    "export const Card: React.FC<CardProps> = ({ title, children, className = '', ...props }) => {",
    "  return (",
    "    <div",
    `      className={\`rounded-xl border border-white/10 bg-[${bg}]/80 p-6 backdrop-blur-md shadow-lg transition-all hover:border-white/20 \${className}\`}`,
    "      {...props}",
    "    >",
    `      {title && <h3 className="mb-2 text-lg font-semibold text-[${text}]">{title}</h3>}`,
    '      <div className="text-sm text-white/70">{children}</div>',
    "    </div>",
    "  );",
    "};",
  ].join('\n');

  const input = [
    "'use client';",
    "",
    "import React from 'react';",
    "",
    "export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(",
    "  ({ className = '', ...props }, ref) => {",
    "    return (",
    "      <input",
    "        ref={ref}",
    `        className={\`flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-[${text}] placeholder:text-white/40 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 \${className}\`}`,
    "        {...props}",
    "      />",
    "    );",
    "  }",
    ");",
    "",
    "Input.displayName = 'Input';",
  ].join('\n');

  return { button, card, input };
}

export function compileDesignMd(siteName: string, url: string, tokens: any): string {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const colors = tokens?.colors || {};
  const surfaces = colors.surfaces || [];
  const textColors = colors.text || [];
  const accents = colors.accents || [];
  const borders = colors.borders || [];

  const bgHex = surfaces[0]?.hex || '#08090A';
  const textHex = textColors[0]?.hex || '#F7F8F8';
  const primaryFont = tokens?.typography?.fontFamilies?.[0] || 'Inter';
  const secondaryFont = tokens?.typography?.fontFamilies?.[1] || 'Monaco, monospace';

  const formatColorList = (colorList: any[]) => {
    if (!colorList || colorList.length === 0) return '- None detected';
    return colorList
      .map(
        (c) =>
          `- **${c.name} (\`${c.hex}\`):** Seen ${c.count || 1} times. Contrast ratio vs bg: \`${c.contrastOnBg || '4.5'}:1\`.`
      )
      .join('\n');
  };

  return `---
version: 1.0.0
name: ${siteName}
url: "${url}"
extractedAt: "${dateStr}"
colors:
  background: "${bgHex}"
  surface: "${surfaces[1]?.hex || bgHex}"
  on-surface: "${textHex}"
  on-background: "${textHex}"
  primary: "${accents[0]?.hex || textHex}"
  border: "${borders[0]?.hex || '#27272A'}"
typography:
  headline-display:
    fontFamily: ${primaryFont}
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: ${primaryFont}
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.2
  body-md:
    fontFamily: ${primaryFont}
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  code:
    fontFamily: ${secondaryFont}
    fontSize: 13px
rounded:
  sm: 4px
  md: 8px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 24px
  xl: 36px
  section: 128px
---

# ${siteName} Design Specification

Measured from [${url}](${url}) on ${dateStr}. Extracted and compiled by WebPicks Design DNA Engine.

## Overview

The interface for **${siteName}** relies on a clean, modern color hierarchy built on **${bgHex}** as the core surface background paired with **${textHex}** text. Typography is set primarily in **${primaryFont}**.

Depth is created using subtle hairline borders and tonal surfaces rather than heavy drop shadows.

## Colors

### Surfaces
${formatColorList(surfaces)}

### Typography & Text Colors
${formatColorList(textColors)}

### Accents & Brand Highlights
${formatColorList(accents)}

### Borders & Dividers
${formatColorList(borders)}

## Typography

The typography system uses **${primaryFont}** for headings and body content.

- **headline-display:** ${primaryFont} 56px, weight 700, line-height 1.1, tracking -0.02em.
- **headline-lg:** ${primaryFont} 36px, weight 600, line-height 1.2.
- **body-md:** ${primaryFont} 16px, weight 400, line-height 1.5.
- **code:** ${secondaryFont} 13px, line-height 1.4.

## Layout & Spacing Scale

Spacing matches a standardized 4px/8px modular grid:

- **xs:** 4px
- **sm:** 8px
- **md:** 12px
- **lg:** 24px
- **xl:** 36px
- **section:** 128px

## Shapes & Radii

Controls and cards use clean, predictable corner radii:

- **sm:** 4px (Buttons, badges)
- **md:** 8px (Cards, input fields)
- **full:** 9999px (Pill buttons, avatars)

## Component Tokens

- **button-primary:** background \`${accents[0]?.hex || textHex}\`, text \`${bgHex}\`, radius \`9999px\`, height \`40px\`.
- **card:** background \`${surfaces[1]?.hex || bgHex}\`, border \`1px solid ${borders[0]?.hex || '#27272A'}\`, radius \`8px\`, padding \`24px\`.
- **input:** background \`${surfaces[0]?.hex || bgHex}\`, border \`1px solid ${borders[0]?.hex || '#27272A'}\`, text \`${textHex}\`, radius \`8px\`.

## Do's and Don'ts

- **Do** maintain strict WCAG AA contrast (minimum 4.5:1) for body copy against surface backgrounds.
- **Do** use pill radius (9999px) for primary actions and badges.
- **Don't** introduce random un-harmonized spacing values outside the 4px/8px grid.
- **Don't** mix more than 2 distinct font families.

Generated by WebPicks Design DNA Engine.
`;
}
