import { Pool } from "pg";
import { env } from "./env";

const pgPool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.nodeEnv === "production" ? { rejectUnauthorized: false } : false,
});
console.log(pgPool, "pgPool");
export default pgPool;
