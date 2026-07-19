import { describe, expect, it } from "vitest";
import { parseDirectoryQuery } from "./filter-parser";

describe("parseDirectoryQuery", () => {
  it("normalizes query values and rejects unsupported sort values", () => {
    expect(
      parseDirectoryQuery({
        q: "  Ada ",
        nationality: ["Canadian", "Canadian", ""],
        hobby: [" Chess ", "Reading"],
        sortBy: "drop table users" as never,
        sortDir: "sideways" as never,
        limit: 500,
      }),
    ).toEqual({
      q: "Ada",
      nationality: ["Canadian"],
      hobby: ["Chess", "Reading"],
      sortBy: "first_name",
      sortDir: "asc",
      limit: 100,
    });
  });
});
