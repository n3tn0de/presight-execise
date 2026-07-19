import type { DirectoryQuery, FacetsResponse, UserSummary } from "@presight/shared";

export type { DirectoryQuery, FacetsResponse, UserSummary };

export interface Queryable {
  query<T = unknown>(
    text: string,
    values?: unknown[],
  ): Promise<{ rows: T[] }>;
}

export interface UserRepository {
  list(query: DirectoryQuery, cursor?: DirectoryCursor): Promise<UserSummary[]>;
}

export interface FacetsRepository {
  get(query: DirectoryQuery): Promise<FacetsResponse>;
  hobbies?(query: DirectoryQuery): Promise<FacetsResponse["hobbies"]>;
  nationalities?(query: DirectoryQuery): Promise<FacetsResponse["nationalities"]>;
}

export interface DirectoryCursor {
  sortValue: string | number;
  id: string;
}
