import type { Actor } from "@snipgraph/content-domain";
import { auth } from "./auth";

export class UnauthorizedError extends Error {
  constructor() {
    super("Authentication required");
    this.name = "UnauthorizedError";
  }
}

export class InvalidOriginError extends Error {
  constructor() {
    super("This mutation must originate from the configured CMS application.");
    this.name = "InvalidOriginError";
  }
}

export async function requireActor(headers: Headers, source: Actor["source"]): Promise<Actor> {
  const session = await auth.api.getSession({ headers });
  if (!session?.user) throw new UnauthorizedError();
  return { id: session.user.id, source };
}

export async function requireMutationActor(
  request: Request,
  source: Actor["source"],
): Promise<Actor> {
  const configuredOrigin = new URL(
    process.env.PUBLIC_URL ?? "http://localhost:3000",
  ).origin;
  if (request.headers.get("origin") !== configuredOrigin) {
    throw new InvalidOriginError();
  }
  return requireActor(request.headers, source);
}
