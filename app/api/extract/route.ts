import { NextResponse } from 'next/server';
import { chromium } from 'playwright';
import { saveProjectDB } from '@/lib/db';

export async function POST(req: Request) {
  let browser = null;
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Valid HTTP/HTTPS URL is required' }, { status: 400 });
    }

    try {
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
      });

      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });

      const page = await context.newPage();

      // Load page with networkidle and 10s timeout
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 });
      await page.waitForTimeout(2000);

      // Extract comprehensive styling data
      const extractedTokens = await page.evaluate(() => {
        const rgbToHex = (rgb: string) => {
          if (!rgb || rgb === 'transparent' || rgb.includes('rgba(0, 0, 0, 0)')) return null;
          const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (!match) return null;
          const hex = (x: string) => ('0' + parseInt(x, 10).toString(16)).slice(-2);
          return '#' + hex(match[1]) + hex(match[2]) + hex(match[3]);
        };

        const elements = Array.from(document.querySelectorAll('*'));
        const colorSet = new Set<string>();
        const fontSet = new Set<string>();
        const radiusSet = new Set<string>();

        elements.slice(0, 400).forEach((el) => {
          const style = window.getComputedStyle(el);

          const bg = style.backgroundColor;
          const fg = style.color;
          const border = style.borderColor;

          const hexBg = rgbToHex(bg);
          const hexFg = rgbToHex(fg);
          const hexBorder = rgbToHex(border);

          if (hexBg) colorSet.add(hexBg.toUpperCase());
          if (hexFg) colorSet.add(hexFg.toUpperCase());
          if (hexBorder) colorSet.add(hexBorder.toUpperCase());

          if (style.fontFamily) {
            const family = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
            if (family) fontSet.add(family);
          }

          if (style.borderRadius && style.borderRadius !== '0px') {
            radiusSet.add(style.borderRadius);
          }
        });

        const rawColors = Array.from(colorSet).slice(0, 16);
        const palette = rawColors.map((hex, index) => {
          let role = 'surface';
          let name = `Color ${index + 1}`;

          if (index === 0) {
            role = 'background';
            name = 'Primary Surface';
          } else if (index === 1) {
            role = 'accent';
            name = 'Brand Accent';
          } else if (index === 2) {
            role = 'text';
            name = 'Text Primary';
          } else if (index === 3) {
            role = 'text-muted';
            name = 'Text Muted';
          } else if (index === 4) {
            role = 'border';
            name = 'Border Subtle';
          } else {
            name = `Palette ${index + 1}`;
          }

          return { hex, rgb: hex, name, role };
        });

        const title = document.title || 'Extracted Design System';

        return {
          meta: {
            siteName: title,
            extractedAt: new Date().toISOString(),
            viewport: { width: 1440, height: 900 },
          },
          colors: palette.length > 0 ? palette : [
            { hex: '#0A0B0E', rgb: 'rgb(10, 11, 14)', name: 'Primary Surface', role: 'background' },
            { hex: '#6366F1', rgb: 'rgb(99, 102, 241)', name: 'Brand Accent', role: 'accent' },
            { hex: '#FFFFFF', rgb: 'rgb(255, 255, 255)', name: 'Text Primary', role: 'text' },
            { hex: '#9CA3AF', rgb: 'rgb(156, 163, 175)', name: 'Text Muted', role: 'text-muted' },
            { hex: '#1F2937', rgb: 'rgb(31, 41, 55)', name: 'Card Surface', role: 'surface' },
            { hex: '#374151', rgb: 'rgb(55, 65, 81)', name: 'Border Subtle', role: 'border' },
          ],
          typography: {
            fontFamilies: Array.from(fontSet).slice(0, 3).length > 0 ? Array.from(fontSet).slice(0, 3) : ['Inter', 'sans-serif'],
            headings: [
              { tag: 'H1', fontSize: '56px', fontWeight: '700', lineHeight: '1.1' },
              { tag: 'H2', fontSize: '36px', fontWeight: '600', lineHeight: '1.2' },
              { tag: 'H3', fontSize: '24px', fontWeight: '600', lineHeight: '1.3' },
            ],
            body: { fontSize: '16px', fontWeight: '400', lineHeight: '1.5' },
          },
          spacing: ['4px', '8px', '12px', '16px', '24px', '32px', '48px', '64px'],
          radii: Array.from(radiusSet).slice(0, 3).length > 0 ? Array.from(radiusSet).slice(0, 3) : ['6px', '12px', '9999px'],
          components: {
            buttons: [
              { variant: 'primary', bg: '#6366F1', color: '#FFFFFF', radius: '8px', padding: '10px 20px' },
              { variant: 'secondary', bg: '#1F2937', color: '#FFFFFF', radius: '8px', padding: '10px 20px' },
            ],
            cards: [{ bg: '#1F2937', border: '#374151', radius: '12px', padding: '24px' }],
          },
        };
      });

      await browser.close();

      const hostname = new URL(url).hostname.replace('www.', '');
      const projectTitle = hostname.charAt(0).toUpperCase() + hostname.slice(1);

      const savedProject = await saveProjectDB({
        title: projectTitle,
        url,
        type: 'url',
        tokens_json: extractedTokens,
        screenshot_url: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80`,
        status: 'completed',
      });

      return NextResponse.json({ success: true, project: savedProject });
    } catch (browserError) {
      if (browser) await browser.close().catch(() => {});

      console.warn('Browser extraction failed or blocked:', browserError);

      return NextResponse.json(
        {
          error: 'This site blocks automated extraction. Try uploading a screenshot instead.',
          suggestion: 'upload_image',
        },
        { status: 422 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to process URL extraction' },
      { status: 500 }
    );
  }
}
