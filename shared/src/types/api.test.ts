import { describe, expect, it } from "vitest";
import type {
  ApiErrorResponse,
  DirectoryQuery,
  FacetsResponse,
  UsersResponse,
} from "./api";

describe("API contracts", () => {
  it("supports paginated users, facets, and structured errors", () => {
    const query: DirectoryQuery = {
      q: "Ada",
      nationality: [],
      hobby: [],
      sortBy: "first_name",
      sortDir: "asc",
      limit: 20,
      cursor: "next-page",
    };
    const users: UsersResponse = {
      items: [],
      hasMore: false,
      nextCursor: null,
    };
    const facets: FacetsResponse = {
      hobbies: [{ value: "Chess", count: 2 }],
      nationalities: [{ value: "Canadian", count: 3 }],
    };
    const error: ApiErrorResponse = {
      error: {
        code: "INVALID_QUERY",
        message: "Invalid query",
        details: { field: "limit" },
      },
    };

    expect(query.cursor).toBe("next-page");
    expect(users.hasMore).toBe(false);
    expect(facets.hobbies[0]).toEqual({ value: "Chess", count: 2 });
    expect(error.error.code).toBe("INVALID_QUERY");
  });
});
