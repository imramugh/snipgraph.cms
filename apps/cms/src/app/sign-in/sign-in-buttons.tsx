"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export function SignInButtons({
  callbackURL,
  google,
  linkedin,
}: {
  callbackURL: string;
  google: boolean;
  linkedin: boolean;
}) {
  const [pending, setPending] = useState<string | null>(null);

  async function signIn(provider: "google" | "linkedin") {
    setPending(provider);
    await authClient.signIn.social({ provider, callbackURL });
    setPending(null);
  }

  return (
    <div className="mt-8 grid gap-3">
      {google && (
        <button className="button primary" disabled={pending !== null} onClick={() => signIn("google")}>
          {pending === "google" ? "Opening Google…" : "Continue with Google"}
        </button>
      )}
      {linkedin && (
        <button className="button secondary" disabled={pending !== null} onClick={() => signIn("linkedin")}>
          {pending === "linkedin" ? "Opening LinkedIn…" : "Continue with LinkedIn"}
        </button>
      )}
      {!google && !linkedin && (
        <p className="notice">Social authentication is not configured for this environment yet.</p>
      )}
    </div>
  );
}
