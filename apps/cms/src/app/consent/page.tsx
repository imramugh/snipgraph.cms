import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { decideConsent } from "./actions";

export const metadata = {
  title: "Authorize — Snipgraph CMS",
  robots: { index: false },
};

const scopeLabels: Record<string, string> = {
  openid: "Confirm your identity",
  profile: "Read your name",
  email: "Read your email address",
  offline_access: "Stay connected without signing in again",
  "cms:content:read": "Read pages and their publication state",
  "cms:content:write": "Create and update drafts",
  "cms:publish": "Publish a selected draft revision",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ConsentPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
    else value?.forEach((entry) => query.append(key, entry));
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect(`/sign-in?${query.toString()}`);

  const clientId = query.get("client_id");
  if (!clientId) redirect("/admin");
  const scopes = (query.get("scope") ?? "").split(" ").filter(Boolean);

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <Link className="brand" href="/">Snipgraph CMS</Link>
        <p className="eyebrow">MCP authorization</p>
        <h1>Authorize this application</h1>
        <p className="lede">
          Client <code>{clientId}</code> is asking to manage your site through MCP.
        </p>
        <h2>It will be able to</h2>
        <ul>
          {scopes.map((scope) => (
            <li key={scope}>{scopeLabels[scope] ?? scope}</li>
          ))}
        </ul>
        <form action={decideConsent} className="mt-8 flex gap-3">
          <input type="hidden" name="oauth_query" value={query.toString()} />
          <button className="button primary" name="intent" value="allow">
            Allow
          </button>
          <button className="button secondary" name="intent" value="deny">
            Deny
          </button>
        </form>
      </section>
    </main>
  );
}
