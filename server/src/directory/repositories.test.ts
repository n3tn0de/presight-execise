import { describe, expect, it, vi } from "vitest";
import { createFacetsRepository } from "./facets-repository.js";
import { createUsersRepository } from "./users-repository.js";

function fakeQueryable(rows: unknown[]) {
  return { query: vi.fn().mockResolvedValue({ rows }) };
}

const query = { q: "", nationality: [], hobby: [], sortBy: "first_name" as const, sortDir: "asc" as const, limit: 2 };

describe("directory repositories", () => {
  it("maps users and aggregates hobbies in stable order", async () => {
    const db = fakeQueryable([{ id: "1", avatar: "a", first_name: "Ada", last_name: "Smith", age: 30, nationality: "Canadian", hobbies: ["Zed", "Art"] }]);
    const result = await createUsersRepository(db).list(query);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining("LIMIT $1"), [3]);
    expect(result).toEqual([{ id: "1", avatar: "a", firstName: "Ada", lastName: "Smith", age: 30, nationality: "Canadian", hobbies: ["Art", "Zed"] }]);
  });

  it("returns facet rows mapped to shared values", async () => {
    const db = fakeQueryable([{ value: "Chess", count: "3" }]);
    const facets = createFacetsRepository(db);
    expect(await facets.hobbies!(query)).toEqual([{ value: "Chess", count: 3 }]);
  });
});
