import { mcp } from "@better-auth/mcp";
import type { BetterAuthOptions } from "better-auth";
import { jwt } from "better-auth/plugins";

const publicUrl = process.env.PUBLIC_URL ?? "http://localhost:3000";
const allowedEmails = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
);

const google =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          prompt: "select_account" as const,
        },
      }
    : {};

const linkedin =
  process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET
    ? {
        linkedin: {
          clientId: process.env.LINKEDIN_CLIENT_ID,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        },
      }
    : {};

export const MCP_RESOURCE = `${publicUrl}/mcp`;
export const MCP_SCOPES = [
  "openid",
  "profile",
  "email",
  "offline_access",
  "cms:content:read",
  "cms:content:write",
  "cms:publish",
];

const plugins = process.env.AUTH_BUILD_MODE === "true"
  ? [jwt()]
  : [
      jwt(),
      mcp({
        loginPage: "/sign-in",
        consentPage: "/consent",
        resource: MCP_RESOURCE,
        scopes: MCP_SCOPES,
        allowDynamicClientRegistration: true,
        allowUnauthenticatedClientRegistration: true,
      }),
    ];

export const authOptions = {
  appName: "Snipgraph CMS",
  baseURL: publicUrl,
  secret:
    process.env.BETTER_AUTH_SECRET ??
    (process.env.AUTH_BUILD_MODE === "true"
      ? "snipgraph-build-only-secret-never-used-at-runtime"
      : undefined),
  trustedOrigins: [publicUrl],
  socialProviders: { ...google, ...linkedin },
  user: {
    validateUserInfo: async ({ user }) => {
      const email = user.email?.trim().toLowerCase();
      if (email && allowedEmails.has(email)) return;
      return {
        error: "email_not_allowed",
        errorDescription: "This CMS is currently limited to its site owner.",
      };
    },
  },
  plugins,
} satisfies BetterAuthOptions;
