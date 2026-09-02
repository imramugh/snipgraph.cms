import { describe, expect, it } from "vitest";
import { parseFeatureSpec } from "./index.js";

describe("feature specifications", () => {
  it("rejects a feature without verifiable acceptance criteria", () => {
    expect(() => parseFeatureSpec({ id: "CMS-001" })).toThrow();
  });
});

