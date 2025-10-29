// server/db.js
import pkg from "pg";
const { Client } = pkg;

// create a single persistent connection
export const db = new Client({
  host: process.env.PGHOST || "localhost",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "shimla1234",
  database: process.env.PGDATABASE || "postgres",
  port: Number(process.env.PGPORT || 5432),
});

// connect once when the app starts
await db
  .connect()
  .then(() => console.log("✅ PostgreSQL connected"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1); // stop app if DB isn't reachable
  });
