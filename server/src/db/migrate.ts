import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pool, withTransaction } from "./pool.js";

const migrationsDirectories = [
  join(dirname(fileURLToPath(import.meta.url)), "migrations"),
  join(dirname(fileURLToPath(import.meta.url)), "../../src/db/migrations"),
  join(process.cwd(), "src/db/migrations"),
];
const migrationNamePattern = /^\d{3}_[a-z0-9_]+\.sql$/;
const migrationLockKey = 7_418_362_901n;

export function migrationFiles(): string[] {
  const directory = migrationsDirectories.find((candidate) => existsSync(candidate));
  if (!directory) throw new Error("Migration assets directory not found");
  return readdirSync(directory).filter((file) => migrationNamePattern.test(file)).sort();
}

export function migrationSql(file: string): string {
  if (!migrationNamePattern.test(file)) {
    throw new Error(`Invalid migration filename: ${file}`);
  }
  const directory = migrationsDirectories.find((candidate) => existsSync(candidate));
  if (!directory) throw new Error("Migration assets directory not found");
  return readFileSync(join(directory, file), "utf8");
}

export async function migrate(): Promise<void> {
  await withTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock($1)", [migrationLockKey]);
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
    for (const file of migrationFiles()) {
      const applied = await client.query("SELECT 1 FROM schema_migrations WHERE name = $1", [file]);
      if (applied.rowCount === 0) {
        await client.query(migrationSql(file));
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
      }
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate().then(() => pool.end()).catch(async (error) => {
    console.error(error);
    await pool.end();
    process.exitCode = 1;
  });
}
