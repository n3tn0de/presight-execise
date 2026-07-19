import type { DirectoryQuery } from "@presight/shared";
import {
  DEFAULT_DIRECTORY_QUERY,
  MAX_DIRECTORY_LIMIT,
  MIN_DIRECTORY_LIMIT,
} from "@presight/shared";
import { CursorError } from "./directory/database/cursor";

class InvalidQueryError extends Error {
  readonly code = "INVALID_QUERY";
  constructor(
    message: string,
    readonly details: unknown,
  ) {
    super(message);
  }
}

function values(value: unknown): string[] {
  const raw = Array.isArray(value) ? value : value === undefined ? [] : [value];
  if (raw.some((item) => typeof item !== "string"))
    throw new InvalidQueryError("Invalid query", { field: "filters" });
  return [
    ...new Set((raw as string[]).map((item) => item.trim()).filter(Boolean)),
  ].sort();
}

function one(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string")
    throw new InvalidQueryError("Invalid query", { field: "query" });
  return value;
}

export function parseApiQuery(input: Record<string, unknown>): DirectoryQuery {
  const sortBy = one(input.sortBy);
  const sortDir = one(input.sortDir);
  const rawLimit = one(input.limit);
  const limit =
    rawLimit === undefined ? DEFAULT_DIRECTORY_QUERY.limit : Number(rawLimit);
  if (
    !Number.isInteger(limit) ||
    limit < MIN_DIRECTORY_LIMIT ||
    limit > MAX_DIRECTORY_LIMIT
  )
    throw new InvalidQueryError("Invalid query", { field: "limit" });
  if (
    sortBy !== undefined &&
    !["first_name", "last_name", "age", "nationality"].includes(sortBy)
  )
    throw new InvalidQueryError("Invalid query", { field: "sortBy" });
  if (sortDir !== undefined && sortDir !== "asc" && sortDir !== "desc")
    throw new InvalidQueryError("Invalid query", { field: "sortDir" });
  const cursor = one(input.cursor);
  if (cursor === "") throw new CursorError();
  return {
    q: one(input.q)?.trim() ?? "",
    nationality: values(input.nationality),
    hobby: values(input.hobby),
    sortBy: (sortBy ??
      DEFAULT_DIRECTORY_QUERY.sortBy) as DirectoryQuery["sortBy"],
    sortDir: (sortDir ??
      DEFAULT_DIRECTORY_QUERY.sortDir) as DirectoryQuery["sortDir"],
    limit,
    ...(cursor === undefined ? {} : { cursor }),
  };
}
