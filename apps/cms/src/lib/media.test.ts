import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { inspectImage, MediaValidationError } from "./media";

describe("media validation", () => {
  it("derives trusted image metadata from uploaded bytes", async () => {
    const bytes = await sharp({
      create: { width: 12, height: 8, channels: 4, background: "#176b55" },
    }).png().toBuffer();
    await expect(inspectImage(bytes)).resolves.toMatchObject({
      mimeType: "image/png",
      width: 12,
      height: 8,
      byteSize: bytes.byteLength,
    });
  });

  it("rejects malformed image bytes", async () => {
    await expect(inspectImage(new TextEncoder().encode("not an image"))).rejects.toBeInstanceOf(MediaValidationError);
  });
});
