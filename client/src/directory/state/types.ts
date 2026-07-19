import type { DirectoryQuery, FacetsResponse, UserSummary } from '@presight/shared';

export interface DirectoryState {
  query: DirectoryQuery;
  users: UserSummary[];
  facets: FacetsResponse;
  nextCursor: string | null;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  facetsLoading: boolean;
  error: string | null;
  appendError: string | null;
  facetsError: string | null;
}

export type DirectoryAction =
  | { type: 'queryChanged'; query: DirectoryQuery }
  | { type: 'usersStarted'; append: boolean }
  | { type: 'usersSucceeded'; items: UserSummary[]; hasMore: boolean; nextCursor: string | null; append: boolean }
  | { type: 'usersFailed'; message: string; append: boolean }
  | { type: 'facetsStarted' }
  | { type: 'facetsSucceeded'; facets: FacetsResponse }
  | { type: 'facetsFailed'; message: string };
