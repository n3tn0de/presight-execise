import { useRef } from "react";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import type {
  DirectoryQuery,
  FacetsResponse,
  UsersResponse,
} from "@presight/shared";
import { directoryApi } from "../api/api-client";

const EMPTY_FACETS: FacetsResponse = { hobbies: [], nationalities: [] };

function userState(query: DirectoryQuery) {
  return {
    q: query.q,
    nationality: [...query.nationality].sort(),
    hobby: [...query.hobby].sort(),
    sortBy: query.sortBy,
    sortDir: query.sortDir,
    limit: query.limit,
  };
}

function facetState(query: DirectoryQuery) {
  return {
    q: query.q,
    nationality: [...query.nationality].sort(),
    hobby: [...query.hobby].sort(),
  };
}

function errorMessage(reason: unknown, fallback: string): string {
  return reason instanceof Error ? reason.message : fallback;
}

function initialQuery(query: DirectoryQuery): DirectoryQuery {
  const withoutCursor = { ...query };
  delete withoutCursor.cursor;
  return withoutCursor;
}

export function useDirectoryQuery(query: DirectoryQuery) {
  const usersQuery = useInfiniteQuery({
    queryKey: ["directory", "users", userState(query)],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      directoryApi.users(
        pageParam === undefined
          ? initialQuery(query)
          : { ...query, cursor: pageParam },
        signal,
      ),
    getNextPageParam: (lastPage: UsersResponse) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
  });
  const facetsQuery = useQuery({
    queryKey: ["directory", "facets", facetState(query)],
    queryFn: ({ signal }) => directoryApi.facets(query, signal),
    placeholderData: keepPreviousData,
  });
  const appendInFlight = useRef(false);

  const pages = usersQuery.data?.pages ?? [];
  const users = pages.flatMap((page) => page.items);
  const lastPage = pages.at(-1);
  const usersError = errorMessage(usersQuery.error, "Unable to load users");
  const facetsError = errorMessage(facetsQuery.error, "Unable to load filters");
  const appendError = usersQuery.isFetchNextPageError ? usersError : null;

  return {
    users,
    facets: facetsQuery.data ?? EMPTY_FACETS,
    facetsLoaded: facetsQuery.data !== undefined,
    loading: usersQuery.isPending || usersQuery.isRefetching,
    loadingMore: usersQuery.isFetchingNextPage,
    facetsLoading: facetsQuery.isPending || facetsQuery.isRefetching,
    error:
      usersQuery.error && !usersQuery.isFetchNextPageError ? usersError : null,
    appendError,
    facetsError: facetsQuery.error ? facetsError : null,
    hasMore: usersQuery.hasNextPage ?? lastPage?.hasMore ?? false,
    nextCursor: lastPage?.nextCursor ?? null,
    loadMore: () => {
      if (
        !appendInFlight.current &&
        !usersQuery.isFetchingNextPage &&
        usersQuery.hasNextPage
      ) {
        appendInFlight.current = true;
        void usersQuery.fetchNextPage().finally(() => {
          appendInFlight.current = false;
        });
      }
    },
    retryAppend: () => {
      if (
        !appendInFlight.current &&
        !usersQuery.isFetchingNextPage &&
        usersQuery.hasNextPage
      ) {
        appendInFlight.current = true;
        void usersQuery.fetchNextPage().finally(() => {
          appendInFlight.current = false;
        });
      }
    },
    retry: () => {
      void usersQuery.refetch();
      void facetsQuery.refetch();
    },
    query,
  };
}
