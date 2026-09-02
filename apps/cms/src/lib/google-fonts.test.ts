import { describe, expect, it } from "vitest";
import { parseGoogleFontsMetadata, reconcileFontWeights } from "./google-fonts";

describe("Google Fonts catalog", () => {
  it("derives the supported upright weights and popularity order", () => {
    const fonts = parseGoogleFontsMetadata({ familyMetadataList: [
      { family: "Rare Serif", category: "Serif", popularity: 20, fonts: { "400": {}, "400i": {}, "700": {} } },
      { family: "Popular Sans", category: "Sans Serif", popularity: 2, fonts: { "300": {}, "400": {}, "900": {}, "1000": {} } },
    ] });
    expect(fonts.map((font) => font.family)).toEqual(["Popular Sans", "Rare Serif"]);
    expect(fonts[0].weights).toEqual([300, 400, 900]);
    expect(fonts[1].weights).toEqual([400, 700]);
  });

  it("keeps valid selections and always falls back to an available weight", () => {
    expect(reconcileFontWeights([400, 600, 900], [300, 600, 700])).toEqual([600]);
    expect(reconcileFontWeights([900], [300, 400, 600])).toEqual([400]);
    expect(reconcileFontWeights([], [300, 600])).toEqual([300]);
  });
});
