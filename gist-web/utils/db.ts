import * as schema from "@/db/schema";
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.SUPABASE_DATABASE_URL!;

const client = postgres(connectionString, { prepare: false });
export const db = drizzle({ client, relations: schema.relations });
