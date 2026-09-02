import type { CallToolResult } from "@modelcontextprotocol/server";

export function ok(value: unknown): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
    structuredContent: (value ?? {}) as Record<string, unknown>,
  };
}

export function fail(message: string, issues?: unknown): CallToolResult {
  return {
    isError: true,
    content: [
      {
        type: "text",
        text: JSON.stringify({ error: message, issues }, null, 2),
      },
    ],
  };
}

export async function guard(
  run: () => Promise<CallToolResult>,
): Promise<CallToolResult> {
  try {
    return await run();
  } catch (error) {
    const caught = error as { message?: string; issues?: unknown };
    return fail(caught.message ?? "Unexpected error", caught.issues);
  }
}
