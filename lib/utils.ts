import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUrl(url: string): string {
  if (!url) return "";
  let formatted = url.trim();
  if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
    formatted = "https://" + formatted;
  }
  return formatted;
}

// Calculate WCAG Contrast Ratio and Rating (AA / AAA)
export function getContrastRatio(hex1: string, hex2: string = "#FFFFFF"): { ratio: number; rating: "AAA" | "AA" | "FAIL" } {
  function getLuminance(hex: string): number {
    let cleanHex = hex.replace("#", "");
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split("").map((c) => c + c).join("");
    }
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  try {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);

    const brighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    const ratio = (brighter + 0.05) / (darker + 0.05);

    let rating: "AAA" | "AA" | "FAIL" = "FAIL";
    if (ratio >= 7) rating = "AAA";
    else if (ratio >= 4.5) rating = "AA";

    return { ratio: Number(ratio.toFixed(1)), rating };
  } catch (e) {
    return { ratio: 1, rating: "FAIL" };
  }
}
