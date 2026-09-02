import { auth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const publicUrl = process.env.PUBLIC_URL ?? new URL(request.url).origin;
  return auth.handler(
    new Request(`${publicUrl}/api/auth/.well-known/oauth-authorization-server`, {
      headers: request.headers,
    }),
  );
}
