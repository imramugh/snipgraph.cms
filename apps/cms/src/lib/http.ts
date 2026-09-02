import { DuplicateSlugError, RevisionConflictError } from "@snipgraph/content-domain";
import { ZodError } from "zod";
import { InvalidOriginError, UnauthorizedError } from "./actor";
import { MediaValidationError } from "./media";

export function problem(error: unknown): Response {
  if (error instanceof UnauthorizedError) {
    return Response.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof InvalidOriginError) {
    return Response.json({ error: error.message }, { status: 403 });
  }
  if (error instanceof MediaValidationError) {
    return Response.json({ error: error.message }, { status: 422 });
  }
  if (error instanceof RevisionConflictError) {
    return Response.json(
      { error: error.message, currentSequence: error.currentSequence },
      { status: 409 },
    );
  }
  if (error instanceof DuplicateSlugError) {
    return Response.json({ error: error.message, slug: error.slug }, { status: 409 });
  }
  if (error instanceof ZodError) {
    return Response.json(
      { error: "Content validation failed", issues: error.issues },
      { status: 422 },
    );
  }
  console.error(error);
  return Response.json({ error: "Unexpected server error" }, { status: 500 });
}
