import type { SiteSettingsValue } from "@snipgraph/content-domain";
import type { CSSProperties } from "react";

export function googleFontsUrl(theme: SiteSettingsValue["theme"]) {
  const families = new Map<string, Set<number>>();
  for (const role of Object.values(theme.fonts)) {
    const weights = families.get(role.family) ?? new Set<number>();
    role.weights.forEach((weight) => weights.add(weight));
    families.set(role.family, weights);
  }
  const query = [...families.entries()]
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([family, weights]) => `family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@${[...weights].sort().join(";")}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

export function publicThemeStyle(theme: SiteSettingsValue["theme"]): CSSProperties {
  const { palette, fonts } = theme;
  return {
    "--site-font-display": `'${fonts.display.family}', ui-serif, Georgia, serif`,
    "--site-font-body": `'${fonts.body.family}', ui-sans-serif, system-ui, sans-serif`,
    "--site-font-mono": `'${fonts.mono.family}', ui-monospace, monospace`,
    "--site-canvas": palette.canvas,
    "--site-surface": palette.surface,
    "--site-muted-surface": palette.mutedSurface,
    "--site-text": palette.text,
    "--site-muted-text": palette.mutedText,
    "--site-brand": palette.brand,
    "--site-brand-contrast": palette.brandContrast,
    "--site-accent": palette.accent,
    "--site-accent-text": palette.accentText,
    "--site-accent-contrast": palette.accentContrast,
    "--site-dark": palette.dark,
    "--site-dark-contrast": palette.darkContrast,
    "--site-border": palette.border,
    "--site-focus": palette.focus,
  } as CSSProperties;
}
