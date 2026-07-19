import type { DirectoryQuery, UserSummary } from "@presight/shared";
import { buildUsersQuery } from "../database/sql-builder";
import type { Queryable, UserRepository } from "../types";

export function createUsersRepository(db: Queryable): UserRepository {
  return {
    async list(query, cursor) {
      const built = buildUsersQuery(query, cursor);
      const result = await db.query<{
        id: string;
        avatar: string;
        first_name: string;
        last_name: string;
        age: number;
        nationality: string;
        hobbies: string[];
      }>(built.text, built.values);
      return result.rows.map((row): UserSummary => ({
        id: String(row.id),
        avatar: row.avatar,
        firstName: row.first_name,
        lastName: row.last_name,
        age: Number(row.age),
        nationality: row.nationality,
        hobbies: [...(row.hobbies ?? [])].sort(),
      }));
    },
  };
}
