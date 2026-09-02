import {
  createMcpHandler,
  getOAuthProtectedResourceMetadataUrl,
  requireBearerAuth,
} from "@modelcontextprotocol/server";
import { MCP_RESOURCE } from "@/lib/auth-options";
import { mcpTokenVerifier } from "@/lib/mcp/auth";
import { requiredScopesForRequest } from "@/lib/mcp/scopes";
import { createCmsMcpServer } from "@/lib/mcp/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createMcpHandler(({ authInfo }) => {
  if (!authInfo) throw new Error("Authenticated MCP context is required.");
  return createCmsMcpServer(authInfo);
});

async function serve(request: Request) {
  const authenticate = requireBearerAuth({
    verifier: mcpTokenVerifier,
    requiredScopes: await requiredScopesForRequest(request),
    resourceMetadataUrl: getOAuthProtectedResourceMetadataUrl(new URL(MCP_RESOURCE)),
  });
  const authInfo = await authenticate(request);
  if (authInfo instanceof Response) return authInfo;
  return handler.fetch(request, { authInfo });
}

export const GET = serve;
export const POST = serve;
export const DELETE = serve;

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Authorization, Content-Type, MCP-Protocol-Version, MCP-Session-Id",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    },
  });
}
