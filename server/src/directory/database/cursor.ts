import { createHash } from "node:crypto";
import type { DirectoryQuery } from "@presight/shared";
import type { CursorPayload, DirectoryCursor } from "./types";
const payloadKeys = ["id", "signature", "sortBy", "sortDir", "sortValue"];
const sortFields = ["first_name", "last_name", "age", "nationality"];
const sortDirections = ["asc", "desc"];
function signature(query: DirectoryQuery): string { return createHash("sha256").update(JSON.stringify({ q: query.q, nationality: query.nationality, hobby: query.hobby, sortBy: query.sortBy, sortDir: query.sortDir })).digest("hex"); }
function encode(value: string): string { return Buffer.from(value).toString("base64url"); }
function decode(value: string): string { return Buffer.from(value, "base64url").toString("utf8"); }

export class CursorError extends Error {
  readonly code = "INVALID_CURSOR";

  constructor(message = "invalid cursor") {
    super(message);
    this.name = "CursorError";
  }
}

export function encodeCursor(input: DirectoryCursor & { query: DirectoryQuery }): string {
  return encode(JSON.stringify({ signature: signature(input.query), sortBy: input.query.sortBy, sortDir: input.query.sortDir, sortValue: input.sortValue, id: input.id }));
}

export function decodeCursor(cursor: string, query: DirectoryQuery): DirectoryCursor {
  let payload: unknown;
  try { payload = JSON.parse(decode(cursor)); } catch { throw new CursorError(); }
  if (!payload || typeof payload !== "object") throw new CursorError();
  const candidate = payload as Partial<CursorPayload>;
  const keys = Object.keys(candidate).sort();
  if (keys.length !== payloadKeys.length || keys.some((key, index) => key !== payloadKeys.slice().sort()[index])) throw new CursorError();
  const sortValueValid = query.sortBy === "age"
    ? typeof candidate.sortValue === "number" && Number.isFinite(candidate.sortValue)
    : typeof candidate.sortValue === "string";
  if (typeof candidate.signature !== "string" || !sortFields.includes(candidate.sortBy as string) || !sortDirections.includes(candidate.sortDir as string) || candidate.signature !== signature(query) || candidate.sortBy !== query.sortBy || candidate.sortDir !== query.sortDir || typeof candidate.id !== "string" || !candidate.id || !sortValueValid) {
    throw new CursorError("cursor does not match query");
  }
  return { sortValue: candidate.sortValue as DirectoryCursor["sortValue"], id: candidate.id };
}
