import { MCP_RESOURCE, MCP_SCOPES } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

export function GET() {
  const publicUrl = process.env.PUBLIC_URL ?? "http://localhost:3000";
  return Response.json({
    resource: MCP_RESOURCE,
    authorization_servers: [`${publicUrl}/api/auth`],
    scopes_supported: MCP_SCOPES,
    bearer_methods_supported: ["header"],
    resource_name: "Snipgraph CMS",
    resource_documentation: `${publicUrl}/reference`,
  });
}
