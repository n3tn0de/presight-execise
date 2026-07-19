import type { DirectoryQuery, UsersResponse } from "@presight/shared";
import { decodeCursor, encodeCursor } from "./cursor.js";
import type { FacetsRepository, UserRepository } from "./query-types.js";

export function createDirectoryService(users: UserRepository, facets: FacetsRepository) {
  return { async list(input: DirectoryQuery): Promise<UsersResponse> {
    const cursor = input.cursor ? decodeCursor(input.cursor, input) : undefined;
    const rows = cursor ? await users.list(input, cursor) : await users.list(input);
    const hasMore = rows.length > input.limit;
    const page = hasMore ? rows.slice(0, input.limit) : rows;
    const last = page.at(-1);
    return { items: page, hasMore, nextCursor: hasMore && last ? encodeCursor({ query: input, sortValue: last[input.sortBy === "age" ? "age" : input.sortBy === "first_name" ? "firstName" : input.sortBy === "last_name" ? "lastName" : "nationality"], id: last.id }) : null };
  }, async facets(query: DirectoryQuery) { return facets.get(query); } };
}
