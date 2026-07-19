import { afterAll, describe, expect, it } from "vitest";
import { migrate } from "./migrate.js";
import { pool, query, withTransaction } from "./pool.js";
import { seed } from "./seed.js";

const integration = process.env.DATABASE_URL ? describe : describe.skip;

integration("PostgreSQL database integration", () => {
  afterAll(async () => {
    await pool.end();
  });

  it("applies migrations idempotently", async () => {
    await migrate();
    await migrate();

    const result = await query<{ count: string }>("SELECT count(*)::text AS count FROM schema_migrations");
    expect(result.rows[0].count).toBe("1");
  });

  it("rolls back a failed transaction", async () => {
    await expect(
      withTransaction(async (client) => {
        await client.query("CREATE TABLE migration_transaction_test (id integer)");
        throw new Error("intentional rollback");
      }),
    ).rejects.toThrow("Transaction failed: intentional rollback");

    const result = await query("SELECT to_regclass('migration_transaction_test') AS name");
    expect(result.rows[0].name).toBeNull();
  });

  it("seeds the requested number of rows after migrating", async () => {
    await seed(3);

    const result = await query<{ count: string }>("SELECT count(*)::text AS count FROM users");
    expect(result.rows[0].count).toBe("3");
  });
});
