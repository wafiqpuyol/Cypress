import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env" });
if (!process.env.DATABASE_URL) {
  console.log("🔴 Cannot find database url");
}

export default defineConfig({
  schema: "./src/lib/supabase/schema.ts",
  out: "./migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || "",
  },
  verbose: true,
}) satisfies Config;
