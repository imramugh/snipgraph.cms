export type GoogleFontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export interface GoogleFontFamily {
  family: string;
  category: string;
  weights: GoogleFontWeight[];
  popularity: number;
}

const GOOGLE_FONTS_METADATA_URL = "https://fonts.google.com/metadata/fonts";
const allowedWeights = new Set<number>([100, 200, 300, 400, 500, 600, 700, 800, 900]);

export const fallbackGoogleFonts: GoogleFontFamily[] = [
  { family: "Inter", category: "Sans Serif", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], popularity: 1 },
  { family: "Roboto", category: "Sans Serif", weights: [100, 300, 400, 500, 700, 900], popularity: 2 },
  { family: "Open Sans", category: "Sans Serif", weights: [300, 400, 500, 600, 700, 800], popularity: 3 },
  { family: "Lato", category: "Sans Serif", weights: [100, 300, 400, 700, 900], popularity: 4 },
  { family: "Montserrat", category: "Sans Serif", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], popularity: 5 },
  { family: "Playfair Display", category: "Serif", weights: [400, 500, 600, 700, 800, 900], popularity: 6 },
  { family: "Merriweather", category: "Serif", weights: [300, 400, 700, 900], popularity: 7 },
  { family: "Source Serif 4", category: "Serif", weights: [200, 300, 400, 500, 600, 700, 800, 900], popularity: 8 },
  { family: "Roboto Mono", category: "Monospace", weights: [100, 200, 300, 400, 500, 600, 700], popularity: 9 },
  { family: "IBM Plex Mono", category: "Monospace", weights: [100, 200, 300, 400, 500, 600, 700], popularity: 10 },
];

export function parseGoogleFontsMetadata(input: unknown): GoogleFontFamily[] {
  if (!input || typeof input !== "object" || !("familyMetadataList" in input)) return [];
  const list = (input as { familyMetadataList?: unknown }).familyMetadataList;
  if (!Array.isArray(list)) return [];

  return list.flatMap((candidate): GoogleFontFamily[] => {
    if (!candidate || typeof candidate !== "object") return [];
    const row = candidate as Record<string, unknown>;
    if (typeof row.family !== "string" || typeof row.category !== "string" || !row.fonts || typeof row.fonts !== "object") return [];
    const weights = [...new Set(Object.keys(row.fonts)
      .filter((key) => /^\d+$/.test(key))
      .map(Number)
      .filter((weight): weight is GoogleFontWeight => allowedWeights.has(weight)))]
      .sort((left, right) => left - right);
    if (weights.length === 0) return [];
    return [{
      family: row.family,
      category: row.category,
      weights,
      popularity: typeof row.popularity === "number" ? row.popularity : Number.MAX_SAFE_INTEGER,
    }];
  }).sort((left, right) => left.popularity - right.popularity || left.family.localeCompare(right.family));
}

export async function listGoogleFonts(): Promise<GoogleFontFamily[]> {
  try {
    const response = await fetch(GOOGLE_FONTS_METADATA_URL, { next: { revalidate: 86_400 } });
    if (!response.ok) return fallbackGoogleFonts;
    const parsed = parseGoogleFontsMetadata(await response.json());
    return parsed.length > 0 ? parsed : fallbackGoogleFonts;
  } catch {
    return fallbackGoogleFonts;
  }
}

export function reconcileFontWeights(current: number[], available: GoogleFontWeight[]): GoogleFontWeight[] {
  const retained = current.filter((weight): weight is GoogleFontWeight => available.includes(weight as GoogleFontWeight));
  if (retained.length > 0) return [...new Set(retained)].sort((left, right) => left - right);
  return [available.includes(400) ? 400 : available[0]];
}
