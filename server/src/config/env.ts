import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ServerEnv } from "./types";

export const environmentFilePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../.env",
);

dotenv.config({ path: environmentFilePath });

export function parseEnv(values: NodeJS.ProcessEnv): ServerEnv {
  const required = [
    "DB_USER",
    "DB_PASSWORD",
    "DATABASE_URL",
    "SERVER_HOST",
    "SERVER_PORT",
  ] as const;

  for (const name of required) {
    if (!values[name]) throw new Error(`${name} is required`);
  }

  const port = Number(values.SERVER_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SERVER_PORT must be a valid port");
  }

  const seedCount =
    values.SEED_COUNT === undefined || values.SEED_COUNT === ""
      ? 10_000
      : Number(values.SEED_COUNT);
  if (!Number.isSafeInteger(seedCount) || seedCount < 0) {
    throw new Error("SEED_COUNT must be a non-negative integer");
  }

  return {
    DB_USER: values.DB_USER!,
    DB_PASSWORD: values.DB_PASSWORD!,
    ...(values.DB_NAME ? { DB_NAME: values.DB_NAME } : {}),
    DATABASE_URL: values.DATABASE_URL!,
    SERVER_HOST: values.SERVER_HOST!,
    SERVER_PORT: port,
    SEED_COUNT: seedCount,
  };
}

export const env = parseEnv(process.env);
