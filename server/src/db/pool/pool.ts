import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { env } from "../../config/env";

export const pool = new Pool({ connectionString: env.DATABASE_URL });

export async function withTransaction<T>(
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  assertDatabaseUrl();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      throw new Error(
        `Transaction failed and rollback failed: ${formatError(error)}; ${formatError(rollbackError)}`,
        { cause: error },
      );
    }
    throw new Error(`Transaction failed: ${formatError(error)}`, {
      cause: error,
    });
  } finally {
    client.release();
  }
}

export async function query<T extends QueryResultRow>(
  text: string,
  values: unknown[] = [],
) {
  assertDatabaseUrl();
  return pool.query<T>(text, values);
}

function assertDatabaseUrl(): void {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to connect to Postgres");
  }
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
