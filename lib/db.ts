import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL não encontrada nas variáveis de ambiente");
}

const sql = neon(process.env.POSTGRES_URL);
export const db = drizzle(sql);
