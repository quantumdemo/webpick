import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { z } from 'zod';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { checkCanSnap, incrementSnap } from '@/lib/usage';

// Import our modular extraction engine
import { groupColors } from '@/lib/extract/tokens';
import { captureElementStates } from '@/lib/extract/states';
import { snapSpacingToGrid, harmonizeContrast } from '@/lib/extract/harmonizer';
import { compileReactComponents, compileDesignMd } from '@/lib/extract/compiler';
import { generatePromptSuite } from '@/lib/extract/prompts';
import { extractPageAssets, detectTechStack } from '@/lib/extract/assets';
import { checkSlop } from '@/lib/extract/slop';
import { detectNeedVision } from '@/lib/extract/vision';

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
    const chromiumInstance: any = (chromium as any).default || chromium;

    let executablePath: string | undefined;

    if (process.env.CHROME_EXECUTABLE_PATH) {
      executablePath = process.env.CHROME_EXECUTABLE_PATH;
    } else if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION) {
      try {
        const packUrl = process.env.CHROMIUM_PACK_URL || 'https://github.com/Sparticuz/chromium/releases/download/v123.0.0/chromium-v123.0.0-pack.tar';
        executablePath = await chromiumInstance.executablePath(packUrl);
      } catch {
        executablePath = await chromiumInstance.executablePath();
      }
    } else {
      const fs = await import('fs');
      const localPaths = [
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      ];
      executablePath = localPaths.find((p) => fs.existsSync(p));
      if (!executablePath) {
        try {
          executablePath = await chromiumInstance.executablePath();
        } catch {
          executablePath = undefined;
        }
      }
    }

    browser = await puppeteer.launch({
      args: chromiumInstance.args || chromium.args || [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      defaultViewport: { width: 1440, height: 900 },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check for canvas elements
    const hasCanvas = await page.evaluate(() => document.querySelectorAll('canvas').length > 0);

    // 1. Core Token Extraction
    const extractedTokens = await page.evaluate(() => {
      const rgbToHex = (rgb: string) => {
        if (!rgb || rgb === 'transparent' || rgb.includes('rgba(0, 0, 0, 0)')) return null;
        const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return null;
        const hex = (x: string) => ('0' + parseInt(x, 10).toString(16)).slice(-2);
        return '#' + hex(match[1]) + hex(match[2]) + hex(match[3]);
      };

      const elements = Array.from(document.querySelectorAll('*'));
      const colorCounts = new Map<string, number>();
      const fontSet = new Set<string>();
      const radiusSet = new Set<string>();
      const spacingSet = new Set<string>();

      elements.slice(0, 400).forEach((el) => {
        const style = window.getComputedStyle(el);
        const hexBg = rgbToHex(style.backgroundColor);
        const hexFg = rgbToHex(style.color);
        const hexBorder = rgbToHex(style.borderColor);

        [hexBg, hexFg, hexBorder].forEach((c) => {
          if (c) {
            const upper = c.toUpperCase();
            colorCounts.set(upper, (colorCounts.get(upper) || 0) + 1);
          }
        });

        if (style.fontFamily) {
          const family = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
          if (family) fontSet.add(family);
        }

        if (style.borderRadius && style.borderRadius !== '0px') radiusSet.add(style.borderRadius);
        if (style.padding && style.padding !== '0px') spacingSet.add(style.padding.split(' ')[0]);
      });

      const rawColors = Array.from(colorCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 16)
        .map(([hex, count]) => ({ hex, count }));

      return {
        meta: {
          siteName: document.title || 'Extracted Design System',
          extractedAt: new Date().toISOString(),
          viewport: { width: 1440, height: 900 },
        },
        rawColors,
        typography: {
          fontFamilies: Array.from(fontSet).slice(0, 4),
          headings: [
            { tag: 'H1', fontSize: '56px', fontWeight: '700', lineHeight: '1.1' },
            { tag: 'H2', fontSize: '36px', fontWeight: '600', lineHeight: '1.2' },
          ],
          body: { fontSize: '16px', fontWeight: '400', lineHeight: '1.5' },
        },
        spacing: Array.from(spacingSet).slice(0, 8),
        radii: Array.from(radiusSet).slice(0, 4),
      };
    });

    // 2. Interactive State Simulation (Gap #2)
    const buttonStates = await captureElementStates(page, 'button, a.btn, [role="button"]', 'Button');

    // 3. Asset & Tech Stack Detection
    const assets = await extractPageAssets(page);
    const techStack = await detectTechStack(page);

    // 4. Color Grouping & Harmonization (Gap #4)
    const colorGroups = groupColors(extractedTokens.rawColors || []);
    const primaryBg = colorGroups.surfaces[0]?.hex || '#08090A';
    const primaryFg = colorGroups.text[0]?.hex || '#F7F8F8';
    const wcagReport = harmonizeContrast(primaryFg, primaryBg);

    // 5. Harmonize Spacing Scale (Gap #4)
    const harmonizedSpacing = (extractedTokens.spacing || ['4px', '8px', '16px', '24px']).map(snapSpacingToGrid);

    const tokens = {
      meta: extractedTokens.meta,
      colors: colorGroups,
      typography: extractedTokens.typography,
      spacing: harmonizedSpacing,
      radii: extractedTokens.radii,
      interactiveStates: buttonStates ? [buttonStates] : [],
    };

    const hostname = new URL(url).hostname.replace('www.', '');
    const title = hostname.charAt(0).toUpperCase() + hostname.slice(1);

    // 6. Code & Prompt Compilation (Gap #1 & Gap #5)
    const components = compileReactComponents(tokens);
    const designMd = compileDesignMd(title, url, tokens);
    const promptSuite = generatePromptSuite(title, designMd);

    // 7. Slop Checker & Vision Detector
    const slopReport = checkSlop(tokens);
    const needVision = detectNeedVision(tokens, hasCanvas);

    const projectData: any = {
      id: `proj-${Date.now()}`,
      user_id: null,
      title,
      url,
      type: 'url',
      tokens_json: tokens,
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

    return NextResponse.json({
      success: true,
      project: projectData,
      designMd,
      tokens,
      components,
      prompts: promptSuite,
      assets,
      wcagReport,
      techStack,
      slopReport,
      needVision,
    });
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
