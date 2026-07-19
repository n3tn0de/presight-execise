export type SortField = "first_name" | "last_name" | "age" | "nationality";
export type SortDirection = "asc" | "desc";

export interface DirectoryQuery {
  q: string;
  nationality: string[];
  hobby: string[];
  sortBy: SortField;
  sortDir: SortDirection;
  limit: number;
  /** Used only when requesting a subsequent API page, never URL state. */
  cursor?: string;
}

export interface UserSummary {
  id: string;
  avatar: string;
  firstName: string;
  lastName: string;
  age: number;
  nationality: string;
  hobbies: string[];
}

export interface UsersResponse {
  items: UserSummary[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface FacetValue {
  value: string;
  count: number;
}

export interface FacetsResponse {
  hobbies: FacetValue[];
  nationalities: FacetValue[];
}

export type { ApiError, ApiErrorResponse } from "./errors";
