import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({
  path: ".env.local",
});

console.log(process.env.SUPABASE_DATABASE_URL!);

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",

  dbCredentials: {
    // user: process.env.DATABASE_USER!,
    // password: process.env.DATABASE_PASSWORD!,
    // host: process.env.DATABASE_HOST!,
    // port: parseInt(process.env.DATABASE_PORT!),
    // database: process.env.DATABASE_DATABASE!,
    // ssl: false,
    url: process.env.SUPABASE_DATABASE_URL!,
  },
});
