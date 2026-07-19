import { fileURLToPath } from "node:url";
import { migrate } from "../migrate/migrate";
import { pool, withTransaction } from "../pool/pool";
import { generateSeedData } from "../seed-data/seed-data";
import { env } from "../../config/env";

const batchSize = 500;

export async function seed(count = seedCountFromEnvironment()): Promise<void> {
  assertSeedCount(count);
  await migrate();
  const data = generateSeedData(count);

  await withTransaction(async (client) => {
    await client.query(
      "TRUNCATE user_hobbies, users, hobbies RESTART IDENTITY CASCADE",
    );
    for (const hobby of data.hobbies) {
      await client.query("INSERT INTO hobbies (value) VALUES ($1)", [hobby]);
    }

    for (let start = 0; start < data.users.length; start += batchSize) {
      const users = data.users.slice(start, start + batchSize);
      const values: unknown[] = [];
      const placeholders = users.map((user, index) => {
        const offset = index * 5;
        values.push(
          user.avatar,
          user.firstName,
          user.lastName,
          user.age,
          user.nationality,
        );
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
      });
      await client.query(
        `INSERT INTO users (avatar, first_name, last_name, age, nationality) VALUES ${placeholders.join(", ")} RETURNING id`,
        values,
      );
    }

    const userIds = await client.query<{ id: string }>(
      "SELECT id FROM users ORDER BY id",
    );
    const joinRows = data.users.flatMap((user, index) =>
      user.hobbies.map((hobby) => [userIds.rows[index].id, hobby]),
    );
    for (let start = 0; start < joinRows.length; start += batchSize) {
      const rows = joinRows.slice(start, start + batchSize);
      const values: unknown[] = [];
      const placeholders = rows.map((row, index) => {
        const offset = index * 2;
        values.push(...row);
        return `($${offset + 1}, $${offset + 2})`;
      });
      if (placeholders.length > 0) {
        await client.query(
          `INSERT INTO user_hobbies (user_id, hobby_value) VALUES ${placeholders.join(", ")}`,
          values,
        );
      }
    }
  });
}

function seedCountFromEnvironment(): number {
  return env.SEED_COUNT;
}

function assertSeedCount(count: number): void {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new Error("Seed count must be a non-negative integer");
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed()
    .then(() => pool.end())
    .catch(async (error) => {
      console.error(error);
      await pool.end();
      process.exitCode = 1;
    });
}
