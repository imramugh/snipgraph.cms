import Link from "next/link";
import { SignInButtons } from "./sign-in-buttons";

export const metadata = { title: "Sign in — Snipgraph CMS", robots: { index: false } };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function callbackFrom(params: Record<string, string | string[] | undefined>) {
  if (typeof params.client_id === "string" && typeof params.sig === "string") {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "string") query.set(key, value);
      else value?.forEach((entry) => query.append(key, entry));
    }
    return `/api/auth/oauth2/authorize?${query.toString()}`;
  }
  return "/admin";
}

export default async function SignInPage({ searchParams }: Props) {
  const callbackURL = callbackFrom(await searchParams);
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <Link className="brand" href="/">Snipgraph CMS</Link>
        <p className="eyebrow">Owner access</p>
        <h1>Sign in to manage your site</h1>
        <p className="lede">Draft, preview, publish, and connect trusted MCP clients.</p>
        <SignInButtons
          callbackURL={callbackURL}
          google={Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)}
          linkedin={Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET)}
        />
      </section>
    </main>
  );
}
