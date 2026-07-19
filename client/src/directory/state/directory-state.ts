import type { DirectoryQuery, FacetsResponse } from "@presight/shared";
import type { DirectoryAction, DirectoryState } from "./types";

export const EMPTY_FACETS: FacetsResponse = { hobbies: [], nationalities: [] };

export function initialDirectoryState(query: DirectoryQuery): DirectoryState {
  return {
    query,
    users: [],
    facets: EMPTY_FACETS,
    nextCursor: null,
    hasMore: true,
    loading: true,
    loadingMore: false,
    facetsLoading: true,
    error: null,
    appendError: null,
    facetsError: null,
  };
}

export function directoryReducer(
  state: DirectoryState,
  action: DirectoryAction,
): DirectoryState {
  switch (action.type) {
    case "queryChanged":
      return {
        ...initialDirectoryState(action.query),
        facets: state.facets,
        facetsLoading: false,
      };
    case "usersStarted":
      return {
        ...state,
        ...(action.append
          ? { loadingMore: true, appendError: null }
          : { loading: true, error: null }),
      };
    case "usersSucceeded":
      return {
        ...state,
        users: action.append ? [...state.users, ...action.items] : action.items,
        hasMore: action.hasMore,
        nextCursor: action.nextCursor,
        loading: false,
        loadingMore: false,
        error: action.append ? state.error : null,
        appendError: action.append ? null : state.appendError,
      };
    case "usersFailed":
      return action.append
        ? { ...state, loadingMore: false, appendError: action.message }
        : { ...state, loading: false, error: action.message };
    case "facetsStarted":
      return { ...state, facetsLoading: true, facetsError: null };
    case "facetsSucceeded":
      return {
        ...state,
        facets: action.facets,
        facetsLoading: false,
        facetsError: null,
      };
    case "facetsFailed":
      return { ...state, facetsLoading: false, facetsError: action.message };
  }
}
