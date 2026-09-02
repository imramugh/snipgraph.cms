import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { authOptions } from "./auth-options";
import { db } from "./db/client";
import * as authSchema from "./db/auth-schema";
import * as schema from "./db/schema";

export const auth = betterAuth({
  ...authOptions,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { ...schema, ...authSchema },
  }),
});

export type Session = typeof auth.$Infer.Session;
