export interface SlopReport {
  score: number;
  rating: 'Clean & Unique' | 'Mild AI Patterns' | 'High AI Slop';
  issues: string[];
}

export function checkSlop(tokens: any): SlopReport {
  let slopPoints = 0;
  const issues: string[] = [];

  const colors = tokens?.colors || {};
  const allHexes = [
    ...(colors.surfaces || []).map((c: any) => c.hex),
    ...(colors.text || []).map((c: any) => c.hex),
    ...(colors.accents || []).map((c: any) => c.hex),
  ];

  // 1. Indigo / Purple Blur Blobs
  const hasIndigoPurple = allHexes.some(
    (h) => h?.toUpperCase().includes('6366F1') || h?.toUpperCase().includes('A855F7') || h?.toUpperCase().includes('8B5CF6')
  );
  if (hasIndigoPurple) {
    slopPoints += 25;
    issues.push('Indigo/Purple background blur blob detected (generic AI template style)');
  }

  // 2. Overused Pill Buttons (9999px radius)
  const radii = tokens?.radii || [];
  if (radii.includes('9999px') || radii.includes('50%')) {
    slopPoints += 15;
    issues.push('Heavy reliance on full pill (9999px) border radii');
  }

  // 3. Generic Inter Font Everywhere
  const fonts = tokens?.typography?.fontFamilies || [];
  if (fonts.length === 1 && fonts[0].toLowerCase() === 'inter') {
    slopPoints += 20;
    issues.push('Single default Inter font family stack without custom typography brand identity');
  }

  // 4. Low Color Variety
  if (allHexes.length < 4) {
    slopPoints += 15;
    issues.push('Monotonous palette with fewer than 4 distinct computed color roles');
  }

  // 5. Default Dark Pure Black
  if (allHexes.includes('#000000')) {
    slopPoints += 15;
    issues.push('Pure `#000000` dark background instead of rich subtle tonal surfaces');
  }

  const score = Math.min(100, slopPoints);
  let rating: SlopReport['rating'] = 'Clean & Unique';
  if (score > 50) rating = 'High AI Slop';
  else if (score > 20) rating = 'Mild AI Patterns';

  return { score, rating, issues };
}
