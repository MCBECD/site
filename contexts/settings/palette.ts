/**
 * Color palette engine — Derives a complete CSS variable set from a primary color
 *
 * Pure functions, no side effects, independently testable.
 * Supports automatic light/dark palette switching.
 */

export function hexToHSL(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  if ([r, g, b].some(isNaN)) {
    console.warn(`[palette] Invalid hex color: ${hex}, falling back to #3b82f6`);
    return hexToHSL("#3b82f6");
  }
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hsl(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function hsla(h: number, s: number, l: number, a: number): string {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

const CUSTOM_VARS = [
  "--color-bg-primary", "--color-bg-secondary", "--color-bg-tertiary",
  "--color-text-primary", "--color-text-secondary", "--color-text-tertiary",
  "--color-border", "--color-accent", "--color-accent-hover", "--color-accent-muted",
  "--color-code-bg", "--color-card-bg",
  "--color-card-shadow", "--color-card-hover-shadow",
  "--color-navbar-bg",
  "--color-kbd-bg", "--color-kbd-border", "--color-kbd-text",
  "--color-toast-bg",
] as const;

/** Clear all custom palette CSS variables */
export function clearCustomPalette(el: HTMLElement): void {
  for (const v of CUSTOM_VARS) {
    el.style.removeProperty(v);
  }
}

export interface Palette {
  light: Record<string, string>;
  dark: Record<string, string>;
}

/** Derive a complete light/dark palette from the primary color (pure computation, no DOM manipulation) */
export function generatePalette(hex: string): Palette {
  const [h, s] = hexToHSL(hex);
  const sc = s * 0.4;
  const tc = s * 0.15;

  return {
    light: {
      "--color-bg-primary":      hsl(h, sc * 0.2, 100),
      "--color-bg-secondary":    hsl(h, sc, 97),
      "--color-bg-tertiary":     hsl(h, sc * 1.2, 93),
      "--color-text-primary":    hsl(h, tc * 1.3, 10),
      "--color-text-secondary":  hsl(h, tc, 40),
      "--color-text-tertiary":   hsl(h, tc * 0.6, 60),
      "--color-border":          hsl(h, sc, 88),
      "--color-accent":          hex,
      "--color-accent-hover":    hsl(h, Math.min(s + 5, 100), Math.max(s > 50 ? 38 : 35, 20)),
      "--color-accent-muted":    hsla(h, s, 50, 0.08),
      "--color-code-bg":         hsl(h, sc * 0.8, 98),
      "--color-card-bg":         "#ffffff",
      "--color-card-shadow":     `0 1px 2px ${hsla(h, s, 20, 0.04)}`,
      "--color-card-hover-shadow": `0 4px 12px ${hsla(h, s, 20, 0.08)}, 0 1px 3px ${hsla(h, s, 20, 0.06)}`,
      "--color-navbar-bg":       hsla(h, sc * 0.5, 100, 0.82),
      "--color-kbd-bg":          hsl(h, sc * 1.2, 93),
      "--color-kbd-border":      hsl(h, sc, 88),
      "--color-kbd-text":        hsl(h, tc * 0.6, 60),
      "--color-toast-bg":        hsl(h, tc * 1.3, 10),
    },
    dark: {
      "--color-bg-primary":      hsl(h, sc * 0.8, 7),
      "--color-bg-secondary":    hsl(h, sc * 0.8, 11),
      "--color-bg-tertiary":     hsl(h, sc * 0.7, 16),
      "--color-text-primary":    hsl(h, tc * 0.8, 92),
      "--color-text-secondary":  hsl(h, tc * 0.7, 65),
      "--color-text-tertiary":   hsl(h, tc * 0.5, 42),
      "--color-border":          hsl(h, sc * 0.8, 22),
      "--color-accent":          hsl(h, Math.min(s + 10, 100), 68),
      "--color-accent-hover":    hsl(h, Math.min(s + 10, 100), 78),
      "--color-accent-muted":    hsla(h, s, 50, 0.08),
      "--color-code-bg":         hsl(h, sc * 0.8, 11),
      "--color-card-bg":         hsl(h, sc * 0.8, 11),
      "--color-card-shadow":     "0 1px 2px rgba(0,0,0,0.2)",
      "--color-card-hover-shadow": `0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px ${hsla(h, s, 50, 0.06)}`,
      "--color-navbar-bg":       hsla(h, sc * 0.6, 7, 0.82),
      "--color-kbd-bg":          hsl(h, sc * 0.7, 16),
      "--color-kbd-border":      hsl(h, sc * 0.8, 22),
      "--color-kbd-text":        hsl(h, tc * 0.5, 42),
      "--color-toast-bg":        hsl(h, sc * 0.6, 22),
    },
  };
}

/** Apply the palette to a DOM element */
export function applyPalette(el: HTMLElement, palette: Record<string, string>): void {
  for (const [key, value] of Object.entries(palette)) {
    el.style.setProperty(key, value);
  }
}