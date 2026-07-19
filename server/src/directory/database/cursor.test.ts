import { describe, expect, it } from "vitest";
import { CursorError, decodeCursor, encodeCursor } from "./cursor";

describe("directory cursor", () => {
  it("round trips opaque state and rejects a different query signature", () => {
    const cursor = encodeCursor({
      query: { q: "Ada", nationality: [], hobby: [], sortBy: "age", sortDir: "asc", limit: 20 },
      sortValue: 42,
      id: "7",
    });
    expect(cursor).not.toContain("Ada");
    expect(decodeCursor(cursor, { q: "Ada", nationality: [], hobby: [], sortBy: "age", sortDir: "asc", limit: 20 })).toEqual({ sortValue: 42, id: "7" });
    expect(() => decodeCursor(cursor, { q: "Grace", nationality: [], hobby: [], sortBy: "age", sortDir: "asc", limit: 20 })).toThrow("cursor does not match query");
  });

  it.each([
    [null, "null payload"],
    [{ signature: "x", sortBy: "age", sortDir: "asc", sortValue: null, id: "7" }, "null sort value"],
    [{ signature: "x", sortBy: "age", sortDir: "asc", sortValue: "42", id: "7" }, "wrong sort value type"],
    [{ signature: "x", sortBy: "last_name", sortDir: "asc", sortValue: 42, id: "7" }, "wrong sort field"],
    [{ signature: "x", sortBy: "age", sortDir: "sideways", sortValue: 42, id: "7" }, "wrong sort direction"],
  ])("rejects %s as a controlled cursor error", (payload: unknown, _description: string) => {
    const cursor = Buffer.from(JSON.stringify(payload)).toString("base64url");
    expect(() => decodeCursor(cursor, { q: "Ada", nationality: [], hobby: [], sortBy: "age", sortDir: "asc", limit: 20 })).toThrow(CursorError);
  });

  it("rejects malformed JSON as a controlled cursor error", () => {
    const cursor = Buffer.from("{").toString("base64url");
    expect(() => decodeCursor(cursor, { q: "Ada", nationality: [], hobby: [], sortBy: "age", sortDir: "asc", limit: 20 })).toThrow(CursorError);
  });

  it("rejects payloads with unexpected fields", () => {
    const encoded = encodeCursor({
      query: { q: "Ada", nationality: [], hobby: [], sortBy: "age", sortDir: "asc", limit: 20 },
      sortValue: 42,
      id: "7",
    });
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    payload.extra = true;
    const cursor = Buffer.from(JSON.stringify(payload)).toString("base64url");
    expect(() => decodeCursor(cursor, { q: "Ada", nationality: [], hobby: [], sortBy: "age", sortDir: "asc", limit: 20 })).toThrow(CursorError);
  });
});
