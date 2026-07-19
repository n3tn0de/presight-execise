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

export const EMPTY_FACETS: FacetsResponse = { hobbies: [], nationalities: [] };

export function initialDirectoryState(query: DirectoryQuery): DirectoryState {
  return {
    query, users: [], facets: EMPTY_FACETS, nextCursor: null, hasMore: true,
    loading: true, loadingMore: false, facetsLoading: true, error: null, appendError: null, facetsError: null,
  };
}

export type DirectoryAction =
  | { type: 'queryChanged'; query: DirectoryQuery }
  | { type: 'usersStarted'; append: boolean }
  | { type: 'usersSucceeded'; items: UserSummary[]; hasMore: boolean; nextCursor: string | null; append: boolean }
  | { type: 'usersFailed'; message: string; append: boolean }
  | { type: 'facetsStarted' }
  | { type: 'facetsSucceeded'; facets: FacetsResponse }
  | { type: 'facetsFailed'; message: string };

export function directoryReducer(state: DirectoryState, action: DirectoryAction): DirectoryState {
  switch (action.type) {
    case 'queryChanged': return { ...initialDirectoryState(action.query), facets: state.facets, facetsLoading: false };
    case 'usersStarted': return { ...state, ...(action.append ? { loadingMore: true, appendError: null } : { loading: true, error: null }) };
    case 'usersSucceeded': return { ...state, users: action.append ? [...state.users, ...action.items] : action.items, hasMore: action.hasMore, nextCursor: action.nextCursor, loading: false, loadingMore: false, error: action.append ? state.error : null, appendError: action.append ? null : state.appendError };
    case 'usersFailed': return action.append ? { ...state, loadingMore: false, appendError: action.message } : { ...state, loading: false, error: action.message };
    case 'facetsStarted': return { ...state, facetsLoading: true, facetsError: null };
    case 'facetsSucceeded': return { ...state, facets: action.facets, facetsLoading: false, facetsError: null };
    case 'facetsFailed': return { ...state, facetsLoading: false, facetsError: action.message };
  }
}
