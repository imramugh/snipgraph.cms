const TOOL_SCOPES: Record<string, string> = {
  list_pages: "cms:content:read",
  read_page: "cms:content:read",
  read_page_history: "cms:content:read",
  create_page_draft: "cms:content:write",
  update_page_draft: "cms:content:write",
  publish_page: "cms:publish",
  read_site_settings: "cms:content:read",
  update_site_settings_draft: "cms:content:write",
  publish_site_settings: "cms:publish",
  list_media: "cms:content:read",
  upload_media: "cms:content:write",
  update_media_metadata: "cms:content:write",
};

export async function requiredScopesForRequest(request: Request): Promise<string[]> {
  const method = request.headers.get("mcp-method");
  const name = request.headers.get("mcp-name");
  if (method === "tools/call" && name && TOOL_SCOPES[name]) return [TOOL_SCOPES[name]];
  if (request.method !== "POST") return ["cms:content:read"];

  try {
    const payload: unknown = await request.clone().json();
    const messages = Array.isArray(payload) ? payload : [payload];
    const scopes = messages.flatMap((message) => {
      if (typeof message !== "object" || message === null) return [];
      if (!("method" in message) || message.method !== "tools/call") return [];
      if (!("params" in message) || typeof message.params !== "object" || !message.params) {
        return [];
      }
      const toolName = "name" in message.params && typeof message.params.name === "string"
        ? message.params.name
        : undefined;
      return toolName && TOOL_SCOPES[toolName] ? [TOOL_SCOPES[toolName]] : [];
    });
    return scopes.length > 0 ? [...new Set(scopes)] : ["cms:content:read"];
  } catch {
    return ["cms:content:read"];
  }
}
