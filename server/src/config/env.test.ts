import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

describe("parseEnv", () => {
  const validValues = {
    DB_USER: "postgres",
    DB_PASSWORD: "postgres",
    DATABASE_URL: "postgres://postgres:postgres@localhost:5432/presight",
    SERVER_HOST: "127.0.0.1",
    SERVER_PORT: "3000",
  };

  it("returns typed server configuration", () => {
    expect(parseEnv(validValues)).toMatchObject({
      ...validValues,
      SERVER_PORT: 3000,
    });
  });

  it("rejects missing required variables", () => {
    const values: Record<string, string> = { ...validValues };
    delete values.DATABASE_URL;

    expect(() => parseEnv(values)).toThrow("DATABASE_URL is required");
  });

  it("uses a safe default for the seed count", () => {
    expect(parseEnv(validValues).SEED_COUNT).toBe(10_000);
    expect(parseEnv({ ...validValues, SEED_COUNT: "25" }).SEED_COUNT).toBe(25);
  });
});
