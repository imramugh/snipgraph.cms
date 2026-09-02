import { describe, expect, it } from "vitest";
import { fail, guard, ok } from "./result";

describe("MCP results", () => {
  it("provides both text and structured success content", () => {
    expect(ok({ state: "draft" })).toEqual({
      content: [
        {
          type: "text",
          text: JSON.stringify({ state: "draft" }, null, 2),
        },
      ],
      structuredContent: { state: "draft" },
    });
  });

  it("turns domain failures into MCP tool errors", async () => {
    const result = await guard(async () => {
      throw new Error("revision conflict");
    });
    expect(result.isError).toBe(true);
    expect(result.content[0]).toMatchObject({
      type: "text",
      text: expect.stringContaining("revision conflict"),
    });
  });

  it("marks explicit failures as tool errors", () => {
    expect(fail("denied").isError).toBe(true);
  });
});
