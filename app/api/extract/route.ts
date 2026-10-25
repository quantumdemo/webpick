import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { z } from 'zod';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { checkCanSnap, incrementSnap } from '@/lib/usage';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const extractSchema = z.object({
  url: z.string().url({ message: 'A valid HTTP/HTTPS URL is required' }),
});

export async function POST(req: Request) {
  let browser: any = null;
  try {
    if (isSupabaseConfigured()) {
      try {
        const snapCheck = await checkCanSnap();
        if (!snapCheck.allowed) {
          return NextResponse.json(
            {
              error: 'LIMIT_REACHED',
              message: snapCheck.needsAuth
                ? "You've used 3 free snaps. Sign up to get more extractions!"
                : 'You have exhausted your project credits. Upgrade to Pro for unlimited extractions!',
              needsAuth: snapCheck.needsAuth,
            },
            { status: 403 }
          );
        }
      } catch (gateErr) {
        console.warn('Freemium check error, defaulting to allowed', gateErr);
      }
    }

    const body = await req.json().catch(() => ({}));
    const validation = extractSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid HTTP/HTTPS URL' },
        { status: 400 }
      );
    }

    const { url } = validation.data;

    const executablePath = await chromium.executablePath();

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1440, height: 900 },
      executablePath: executablePath || undefined,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await new Promise((resolve) => setTimeout(resolve, 2000));

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
        const hexBg = rgbToHex(style.backgroundColor);
        const hexFg = rgbToHex(style.color);
        const hexBorder = rgbToHex(style.borderColor);

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
      const palette = rawColors.map((hex, index) => ({
        hex,
        rgb: hex,
        name: index === 0 ? 'Primary Surface' : index === 1 ? 'Brand Accent' : `Token ${index + 1}`,
        role: index === 0 ? 'background' : index === 1 ? 'accent' : 'surface',
      }));

      return {
        meta: {
          siteName: document.title || 'Extracted Design System',
          extractedAt: new Date().toISOString(),
          viewport: { width: 1440, height: 900 },
        },
        colors:
          palette.length > 0
            ? palette
            : [
                { hex: '#0A0B0E', rgb: 'rgb(10, 11, 14)', name: 'Primary Surface', role: 'background' },
                { hex: '#6366F1', rgb: 'rgb(99, 102, 241)', name: 'Brand Accent', role: 'accent' },
                { hex: '#FFFFFF', rgb: 'rgb(255, 255, 255)', name: 'Text Primary', role: 'text' },
              ],
        typography: {
          fontFamilies:
            Array.from(fontSet).slice(0, 3).length > 0
              ? Array.from(fontSet).slice(0, 3)
              : ['Inter', 'sans-serif'],
          headings: [
            { tag: 'H1', fontSize: '56px', fontWeight: '700', lineHeight: '1.1' },
            { tag: 'H2', fontSize: '36px', fontWeight: '600', lineHeight: '1.2' },
          ],
          body: { fontSize: '16px', fontWeight: '400', lineHeight: '1.5' },
        },
        spacing: ['4px', '8px', '16px', '24px', '32px', '48px', '64px'],
        radii:
          Array.from(radiusSet).slice(0, 3).length > 0
            ? Array.from(radiusSet).slice(0, 3)
            : ['6px', '12px', '9999px'],
      };
    });

    const hostname = new URL(url).hostname.replace('www.', '');
    const title = hostname.charAt(0).toUpperCase() + hostname.slice(1);

    const projectData: any = {
      id: `proj-${Date.now()}`,
      user_id: null,
      title,
      url,
      type: 'url',
      tokens_json: extractedTokens,
      screenshot_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
      status: 'completed',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        projectData.user_id = user?.id || null;
        await supabase.from('projects').insert([projectData]);
        await incrementSnap();
      } catch (dbErr) {
        console.warn('DB record save skipped', dbErr);
      }
    }

    return NextResponse.json({ success: true, project: projectData });
  } catch (err: any) {
    console.error('EXTRACTION_FAILED:', err);
    return NextResponse.json(
      {
        error: err?.message || 'Extraction failed',
        details: err?.stack ? err.stack.slice(0, 500) : null,
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
