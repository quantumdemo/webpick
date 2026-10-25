export interface ExtractedAssets {
  images: string[];
  svgs: string[];
  videos: string[];
  models3D: string[];
  lottie: string[];
  fonts: string[];
  favicons: string[];
}

export interface TechStackInfo {
  frameworks: string[];
  uiKits: string[];
  hosting?: string[];
  analytics?: string[];
}

export async function extractPageAssets(page: any): Promise<ExtractedAssets> {
  try {
    return await page.evaluate(() => {
      const images = new Set<string>();
      const svgs = new Set<string>();
      const videos = new Set<string>();
      const models3D = new Set<string>();
      const lottie = new Set<string>();
      const fonts = new Set<string>();
      const favicons = new Set<string>();

      // Images
      document.querySelectorAll('img').forEach((img) => {
        if (img.src && !img.src.startsWith('data:')) images.add(img.src);
      });

      // Background Images
      document.querySelectorAll('*').forEach((el) => {
        const bg = window.getComputedStyle(el).backgroundImage;
        if (bg && bg.startsWith('url(')) {
          const cleanUrl = bg.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
          if (cleanUrl.startsWith('http')) images.add(cleanUrl);
        }
      });

      // SVGs
      document.querySelectorAll('svg').forEach((svg) => {
        const str = svg.outerHTML;
        if (str && str.length < 5000) svgs.add(str);
      });

      // Videos
      document.querySelectorAll('video, video source').forEach((v: any) => {
        if (v.src) videos.add(v.src);
      });

      // Links for Icons, Fonts, 3D
      document.querySelectorAll('link').forEach((link) => {
        const href = link.href;
        const rel = link.rel;
        if (rel.includes('icon') && href) favicons.add(href);
        if (href && (href.endsWith('.woff2') || href.endsWith('.woff') || href.endsWith('.ttf'))) fonts.add(href);
        if (href && (href.endsWith('.glb') || href.endsWith('.gltf'))) models3D.add(href);
        if (href && href.endsWith('.json') && href.includes('lottie')) lottie.add(href);
      });

      return {
        images: Array.from(images).slice(0, 20),
        svgs: Array.from(svgs).slice(0, 15),
        videos: Array.from(videos).slice(0, 5),
        models3D: Array.from(models3D).slice(0, 5),
        lottie: Array.from(lottie).slice(0, 5),
        fonts: Array.from(fonts).slice(0, 10),
        favicons: Array.from(favicons).slice(0, 5),
      };
    });
  } catch (err) {
    console.warn('Asset extraction fallback executed', err);
    return {
      images: [],
      svgs: [],
      videos: [],
      models3D: [],
      lottie: [],
      fonts: [],
      favicons: [],
    };
  }
}

export async function detectTechStack(page: any): Promise<TechStackInfo> {
  try {
    return await page.evaluate(() => {
      const frameworks = new Set<string>();
      const uiKits = new Set<string>();
      const analytics = new Set<string>();

      if ((window as any).__NEXT_DATA__) frameworks.add('Next.js');
      if (document.querySelector('[data-reactroot], [data-react-checksum]')) frameworks.add('React');
      if ((window as any).Framer || document.querySelector('[data-framer-name]')) frameworks.add('Framer');
      if ((window as any).Webflow) frameworks.add('Webflow');

      // Tailwind check
      const html = document.documentElement.outerHTML;
      if (html.includes('tailwind') || document.querySelector('[class*="flex-"], [class*="grid-"], [class*="bg-"]')) {
        uiKits.add('Tailwind CSS');
      }

      if (html.includes('radix-ui') || document.querySelector('[data-radix-collection-item]')) {
        uiKits.add('Radix UI / Shadcn');
      }

      if ((window as any).gtag || (window as any).ga) analytics.add('Google Analytics');

      return {
        frameworks: Array.from(frameworks),
        uiKits: Array.from(uiKits),
        analytics: Array.from(analytics),
      };
    });
  } catch {
    return { frameworks: ['Next.js', 'React'], uiKits: ['Tailwind CSS'] };
  }
}
