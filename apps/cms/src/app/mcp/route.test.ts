import { describe, expect, it } from "vitest";
import { requiredScopesForRequest } from "../../lib/mcp/scopes";

function toolRequest(name: string) {
  return new Request("https://cms.example/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name, arguments: {} },
    }),
  });
}

describe("MCP progressive authorization", () => {
  it.each([
    ["list_pages", "cms:content:read"],
    ["read_page", "cms:content:read"],
    ["read_page_history", "cms:content:read"],
    ["create_page_draft", "cms:content:write"],
    ["update_page_draft", "cms:content:write"],
    ["publish_page", "cms:publish"],
    ["read_site_settings", "cms:content:read"],
    ["update_site_settings_draft", "cms:content:write"],
    ["publish_site_settings", "cms:publish"],
    ["list_media", "cms:content:read"],
    ["upload_media", "cms:content:write"],
    ["update_media_metadata", "cms:content:write"],
  ])("requires the matching scope for %s", async (tool, scope) => {
    await expect(requiredScopesForRequest(toolRequest(tool))).resolves.toEqual([scope]);
  });

  it("uses modern MCP routing headers without consuming the request body", async () => {
    const request = new Request("https://cms.example/mcp", {
      method: "POST",
      headers: { "mcp-method": "tools/call", "mcp-name": "publish_page" },
      body: "not-json",
    });
    await expect(requiredScopesForRequest(request)).resolves.toEqual(["cms:publish"]);
  });

  it("defaults protocol and unknown calls to read scope", async () => {
    const request = new Request("https://cms.example/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
    });
    await expect(requiredScopesForRequest(request)).resolves.toEqual([
      "cms:content:read",
    ]);
  });
});
