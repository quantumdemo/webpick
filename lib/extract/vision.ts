export interface VisionDetection {
  needVision: boolean;
  reason?: string;
}

export function detectNeedVision(tokens: any, hasCanvas = false): VisionDetection {
  const surfaceCount = tokens?.colors?.surfaces?.length || 0;
  const textCount = tokens?.colors?.text?.length || 0;
  const totalColors = surfaceCount + textCount;

  if (hasCanvas) {
    return {
      needVision: true,
      reason: 'Page contains interactive <canvas> or WebGL elements. Hybrid Vision AI processing recommended.',
    };
  }

  if (totalColors < 3) {
    return {
      needVision: true,
      reason: 'Low DOM style density detected (< 3 color roles). Vision AI screenshot analysis suggested.',
    };
  }

  return {
    needVision: false,
    reason: 'DOM computed style density is optimal.',
  };
}
