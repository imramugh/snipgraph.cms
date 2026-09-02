import {
  OAuthError,
  OAuthErrorCode,
  type AuthInfo,
  type OAuthTokenVerifier,
} from "@modelcontextprotocol/server";
import {
  createLocalJWKSet,
  jwtVerify,
  type JSONWebKeySet,
  type JWTPayload,
} from "jose";
import { auth } from "../auth";
import { MCP_RESOURCE } from "../auth-options";

type AccessClaims = JWTPayload & {
  client_id?: string;
  scope?: string;
};

const ISSUER = `${process.env.PUBLIC_URL ?? "http://localhost:3000"}/api/auth`;
const JWKS_TTL_MS = 5 * 60 * 1000;

let jwksCache:
  | { keys: ReturnType<typeof createLocalJWKSet>; fetchedAt: number }
  | undefined;

async function localJwks(force = false) {
  if (
    !force &&
    jwksCache &&
    Date.now() - jwksCache.fetchedAt < JWKS_TTL_MS
  ) {
    return jwksCache.keys;
  }

  const set = (await auth.api.getJwks()) as JSONWebKeySet;
  jwksCache = {
    keys: createLocalJWKSet(set),
    fetchedAt: Date.now(),
  };
  return jwksCache.keys;
}

async function claimsFor(token: string): Promise<AccessClaims> {
  const options = { issuer: ISSUER, audience: MCP_RESOURCE };
  try {
    return (await jwtVerify(token, await localJwks(), options)).payload as AccessClaims;
  } catch {
    try {
      return (await jwtVerify(token, await localJwks(true), options))
        .payload as AccessClaims;
    } catch {
      throw new OAuthError(OAuthErrorCode.InvalidToken, "The access token is invalid or expired.");
    }
  }
}

export const mcpTokenVerifier: OAuthTokenVerifier = {
  async verifyAccessToken(token): Promise<AuthInfo> {
    if (token.split(".").length !== 3) {
      throw new OAuthError(OAuthErrorCode.InvalidToken, "The access token is not a JWT.");
    }

    const claims = await claimsFor(token);
    const scopes = claims.scope?.split(" ").filter(Boolean) ?? [];
    if (!claims.sub || !claims.exp) {
      throw new OAuthError(OAuthErrorCode.InvalidToken, "Required access-token claims are missing.");
    }

    return {
      token,
      clientId: claims.client_id ?? "oauth-client",
      scopes,
      expiresAt: claims.exp,
      resource: new URL(MCP_RESOURCE),
      extra: { userId: claims.sub },
    };
  },
};
