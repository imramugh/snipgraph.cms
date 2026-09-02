import { memoryAdapter } from "@better-auth/memory-adapter";
import { betterAuth } from "better-auth";
import { authOptions } from "./src/lib/auth-options";

const store = new Proxy({} as Record<string, unknown[]>, {
  get: (target, key) => (typeof key === "string" ? (target[key] ??= []) : undefined),
});
const memory = memoryAdapter(store);
const database = (options: Parameters<typeof memory>[0]) =>
  Object.assign(memory(options), { id: "drizzle", options: { provider: "pg" } });

export const auth = betterAuth({ ...authOptions, database });

