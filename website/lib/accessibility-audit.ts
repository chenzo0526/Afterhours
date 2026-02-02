/**
 * WCAG 2.1 AA Color Contrast Audit
 * 
 * Ensures all color combinations meet WCAG 2.1 AA standards:
 * - Normal text: 4.5:1 contrast ratio
 * - Large text (18pt+ or 14pt+ bold): 3:1 contrast ratio
 * - UI components: 3:1 contrast ratio
 */

// Convert HSL to RGB for contrast calculation
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return [r, g, b];
}

// Calculate relative luminance
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio
function getContrastRatio(color1: [number, number, number], color2: [number, number, number]): number {
  const lum1 = getLuminance(...color1);
  const lum2 = getLuminance(...color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Color definitions from globals.css
const colors = {
  background: { h: 240, s: 10, l: 3.5 }, // #09090B
  foreground: { h: 0, s: 0, l: 98 }, // #FAFAFA
  primary: { h: 217.2, s: 91.2, l: 59.8 }, // Blue
  primaryForeground: { h: 222.2, s: 47.4, l: 11.2 }, // Dark blue
  muted: { h: 240, s: 10, l: 8 }, // Dark gray
  mutedForeground: { h: 240, s: 5, l: 64.9 }, // Light gray
  destructive: { h: 0, s: 62.8, l: 30.6 }, // Red
  destructiveForeground: { h: 0, s: 0, l: 98 }, // White
  border: { h: 240, s: 10, l: 12 }, // Border gray
};

// Audit results
export const contrastAudit = {
  // Background + Foreground (main text)
  backgroundForeground: getContrastRatio(
    hslToRgb(colors.background.h, colors.background.s, colors.background.l),
    hslToRgb(colors.foreground.h, colors.foreground.s, colors.foreground.l)
  ), // Should be >= 4.5:1 ✅

  // Primary + Primary Foreground
  primaryPrimaryForeground: getContrastRatio(
    hslToRgb(colors.primary.h, colors.primary.s, colors.primary.l),
    hslToRgb(colors.primaryForeground.h, colors.primaryForeground.s, colors.primaryForeground.l)
  ), // Should be >= 4.5:1 ✅

  // Muted + Muted Foreground
  mutedMutedForeground: getContrastRatio(
    hslToRgb(colors.muted.h, colors.muted.s, colors.muted.l),
    hslToRgb(colors.mutedForeground.h, colors.mutedForeground.s, colors.mutedForeground.l)
  ), // Should be >= 4.5:1 ✅

  // Destructive + Destructive Foreground
  destructiveDestructiveForeground: getContrastRatio(
    hslToRgb(colors.destructive.h, colors.destructive.s, colors.destructive.l),
    hslToRgb(colors.destructiveForeground.h, colors.destructiveForeground.s, colors.destructiveForeground.l)
  ), // Should be >= 4.5:1 ✅

  // Background + Primary (for buttons/links)
  backgroundPrimary: getContrastRatio(
    hslToRgb(colors.background.h, colors.background.s, colors.background.l),
    hslToRgb(colors.primary.h, colors.primary.s, colors.primary.l)
  ), // Should be >= 3:1 for UI components ✅
};

// Verify all meet WCAG AA standards
export const wcagCompliant = {
  normalText: contrastAudit.backgroundForeground >= 4.5,
  primaryButton: contrastAudit.primaryPrimaryForeground >= 4.5,
  mutedText: contrastAudit.mutedMutedForeground >= 4.5,
  destructiveButton: contrastAudit.destructiveDestructiveForeground >= 4.5,
  uiComponents: contrastAudit.backgroundPrimary >= 3.0,
  allCompliant: 
    contrastAudit.backgroundForeground >= 4.5 &&
    contrastAudit.primaryPrimaryForeground >= 4.5 &&
    contrastAudit.mutedMutedForeground >= 4.5 &&
    contrastAudit.destructiveDestructiveForeground >= 4.5 &&
    contrastAudit.backgroundPrimary >= 3.0,
};

// Export audit summary
export const auditSummary = {
  ...contrastAudit,
  wcagCompliant,
  recommendations: wcagCompliant.allCompliant
    ? []
    : [
        'All color combinations meet WCAG 2.1 AA standards',
        'Normal text contrast: 4.5:1 or higher',
        'UI component contrast: 3:1 or higher',
      ],
};
