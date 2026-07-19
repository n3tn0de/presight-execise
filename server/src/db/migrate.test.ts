import { describe, expect, it } from "vitest";
import { migrationFiles, migrationSql } from "./migrate.js";

describe("database migrations", () => {
  it("exposes the initial migration and required schema definitions", () => {
    expect(migrationFiles()).toEqual(["001_initial.sql"]);
    const sql = migrationSql("001_initial.sql");

    expect(sql).toContain("CREATE EXTENSION IF NOT EXISTS pg_trgm");
    expect(sql).toContain("age INTEGER NOT NULL CHECK (age BETWEEN 18 AND 100)");
    expect(sql).toContain("PRIMARY KEY (user_id, hobby_value)");
    expect(sql).toContain("ON DELETE CASCADE");
    expect(sql).toContain("gin_trgm_ops");
    expect(sql).toContain("idx_users_first_name ON users (first_name)");
    expect(sql).toContain("idx_users_last_name ON users (last_name)");
    expect(sql).toContain("idx_users_age ON users (age)");
    expect(sql).toContain("idx_users_nationality");
  });

  it("rejects migration paths outside the internal filename pattern", () => {
    expect(() => migrationSql("../users.sql")).toThrow("Invalid migration filename");
    expect(() => migrationSql("notes.sql")).toThrow("Invalid migration filename");
  });
});
