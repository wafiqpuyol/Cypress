import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as dotenv from "dotenv";
import * as schema from "../../../migrations/schema";

dotenv.config({ path: ".env" });
if (!process.env.DATABASE_URL) {
  console.log("Cannot find the database url");
}

const migrationClient = postgres(process.env.DATABASE_URL as string);
const db = drizzle(migrationClient, { schema });
const migrateDb = async () => {
  try {
    console.log("🟡 Migrating Client");
    await migrate(db, { migrationsFolder: "migrations" });
    console.log("🟢 Successfully Migrated");
  } catch (error) {
    console.log(error);
    console.log("🔴 Error while migrating client");
  }
};
migrateDb();
export default db;
