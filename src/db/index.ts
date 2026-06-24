import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Use a placeholder URL at build time so the module loads cleanly.
// At runtime the actual DATABASE_URL must be set — queries will fail if it isn't.
const url =
  process.env.DATABASE_URL ??
  "postgresql://build-placeholder:x@localhost:5432/placeholder";

const sql = neon(url);
export const db = drizzle(sql, { schema });

export * from "./schema";
