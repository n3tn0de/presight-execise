import { describe, expect, it, vi } from "vitest";
import { createDirectoryService } from "./directory-service";

describe("directory service", () => {
  it("uses limit plus one and creates a next cursor", async () => {
    const users = { list: vi.fn().mockResolvedValue([
      { id: "1", avatar: "a", firstName: "A", lastName: "A", age: 20, nationality: "X", hobbies: [] },
      { id: "2", avatar: "b", firstName: "B", lastName: "B", age: 21, nationality: "Y", hobbies: [] },
      { id: "3", avatar: "c", firstName: "C", lastName: "C", age: 22, nationality: "Z", hobbies: [] },
    ]) };
    const facets = { get: vi.fn().mockResolvedValue({ hobbies: [], nationalities: [] }) };
    const service = createDirectoryService(users, facets);
    const result = await service.list({ q: "", nationality: [], hobby: [], sortBy: "first_name", sortDir: "asc", limit: 2 });
    expect(users.list).toHaveBeenCalledWith(expect.objectContaining({ limit: 2 }));
    expect(result.items).toHaveLength(2);
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toEqual(expect.any(String));
  });
});
