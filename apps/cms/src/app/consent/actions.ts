"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function decideConsent(formData: FormData) {
  const requestHeaders = await headers();
  const base = process.env.PUBLIC_URL ?? "http://localhost:3000";
  const response = await auth.handler(
    new Request(`${base}/api/auth/oauth2/consent`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: requestHeaders.get("cookie") ?? "",
        origin: base,
      },
      body: JSON.stringify({
        accept: formData.get("intent") === "allow",
        oauth_query: String(formData.get("oauth_query") ?? ""),
      }),
    }),
  );

  const body = (await response.json().catch(() => null)) as {
    url?: string;
    redirect_uri?: string;
    error_description?: string;
    message?: string;
  } | null;
  const target = body?.url ?? body?.redirect_uri;
  if (target) redirect(target);
  throw new Error(
    body?.error_description ?? body?.message ?? `Consent failed (${response.status})`,
  );
}
