import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_DIRECTORY_QUERY } from "@presight/shared";
import type { DirectoryQuery, UsersResponse } from "@presight/shared";
import { directoryApi } from "../api/api-client";
import { useDirectoryQuery } from "./use-directory-query";

vi.mock("../api/api-client", () => ({
  directoryApi: { users: vi.fn(), facets: vi.fn() },
}));

const user = (id: string) => ({
  id,
  avatar: "",
  firstName: id,
  lastName: "User",
  age: 30,
  nationality: "Canadian",
  hobbies: [],
});

function wrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function setup(
  users: (
    query: DirectoryQuery,
    signal?: AbortSignal,
  ) => Promise<UsersResponse>,
) {
  vi.mocked(directoryApi.users).mockImplementation(users);
  vi.mocked(directoryApi.facets).mockResolvedValue({
    hobbies: [],
    nationalities: [],
  });
}

describe("useDirectoryQuery", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("uses canonical user state as the key and keeps facets independent of sorting", async () => {
    setup(async () => ({ items: [], hasMore: false, nextCursor: null }));
    const { rerender } = renderHook(({ query }) => useDirectoryQuery(query), {
      initialProps: { query: DEFAULT_DIRECTORY_QUERY },
      wrapper: wrapper(),
    });
    await waitFor(() => expect(directoryApi.users).toHaveBeenCalled());
    await waitFor(() => expect(directoryApi.facets).toHaveBeenCalled());

    rerender({
      query: { ...DEFAULT_DIRECTORY_QUERY, sortBy: "age" },
    });
    await waitFor(() =>
      expect(vi.mocked(directoryApi.users).mock.calls.length).toBeGreaterThan(
        1,
      ),
    );
    expect(vi.mocked(directoryApi.facets).mock.calls.length).toBe(1);

    rerender({
      query: { ...DEFAULT_DIRECTORY_QUERY, q: "Ada", sortBy: "age" },
    });
    await waitFor(() =>
      expect(vi.mocked(directoryApi.users).mock.calls.length).toBeGreaterThan(
        2,
      ),
    );
    await waitFor(() =>
      expect(vi.mocked(directoryApi.facets).mock.calls.length).toBe(2),
    );
  });

  it("passes cursor only to subsequent pages and flattens infinite pages", async () => {
    setup(async (query) =>
      query.cursor
        ? { items: [user("two")], hasMore: false, nextCursor: null }
        : { items: [user("one")], hasMore: true, nextCursor: "next" },
    );
    const { result } = renderHook(
      () => useDirectoryQuery(DEFAULT_DIRECTORY_QUERY),
      {
        wrapper: wrapper(),
      },
    );
    await waitFor(() => expect(result.current.users).toHaveLength(1));
    expect(vi.mocked(directoryApi.users).mock.calls[0][0]).not.toHaveProperty(
      "cursor",
    );

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.users).toHaveLength(2));
    expect(vi.mocked(directoryApi.users).mock.calls[1][0]).toMatchObject({
      cursor: "next",
    });
    expect(result.current.hasMore).toBe(false);
    expect(result.current.nextCursor).toBeNull();
  });

  it("uses the query signal and omits a cursor from the initial request", async () => {
    const signals: AbortSignal[] = [];
    setup(async (query, signal) => {
      signals.push(signal!);
      return { items: [], hasMore: false, nextCursor: null };
    });
    renderHook(
      () =>
        useDirectoryQuery({
          ...DEFAULT_DIRECTORY_QUERY,
          cursor: "stale-cursor",
        }),
      { wrapper: wrapper() },
    );
    await waitFor(() => expect(directoryApi.users).toHaveBeenCalled());
    expect(directoryApi.users).toHaveBeenCalledWith(
      expect.not.objectContaining({ cursor: expect.anything() }),
      expect.any(AbortSignal),
    );
    expect(signals[0]).toBeInstanceOf(AbortSignal);
  });

  it("does not duplicate an in-flight page load", async () => {
    let resolveAppend!: (response: UsersResponse) => void;
    setup(async (query) =>
      query.cursor
        ? new Promise((resolve) => {
            resolveAppend = resolve;
          })
        : { items: [user("one")], hasMore: true, nextCursor: "next" },
    );
    const { result } = renderHook(
      () => useDirectoryQuery(DEFAULT_DIRECTORY_QUERY),
      {
        wrapper: wrapper(),
      },
    );
    await waitFor(() => expect(result.current.hasMore).toBe(true));
    act(() => {
      result.current.loadMore();
      result.current.loadMore();
    });
    expect(
      vi
        .mocked(directoryApi.users)
        .mock.calls.filter(([query]) => query.cursor),
    ).toHaveLength(1);
    resolveAppend({ items: [user("two")], hasMore: false, nextCursor: null });
  });

  it("maps initial and append failures and retries the failed append", async () => {
    const appendError = new Error("append failed");
    setup(async (query) => {
      if (query.cursor) throw appendError;
      return { items: [user("one")], hasMore: true, nextCursor: "next" };
    });
    const { result } = renderHook(
      () => useDirectoryQuery(DEFAULT_DIRECTORY_QUERY),
      {
        wrapper: wrapper(),
      },
    );
    await waitFor(() => expect(result.current.hasMore).toBe(true));
    act(() => result.current.loadMore());
    await waitFor(() =>
      expect(result.current.appendError).toBe("append failed"),
    );
    expect(result.current.users).toHaveLength(1);
    act(() => result.current.retryAppend());
    await waitFor(() => expect(directoryApi.users).toHaveBeenCalledTimes(3));
    expect(result.current.error).toBeNull();
  });

  it("retries both users and facets after an initial failure", async () => {
    setup(async () => {
      throw new Error("initial failed");
    });
    const { result } = renderHook(
      () => useDirectoryQuery(DEFAULT_DIRECTORY_QUERY),
      { wrapper: wrapper() },
    );
    await waitFor(() => expect(result.current.error).toBe("initial failed"));

    vi.mocked(directoryApi.users).mockResolvedValue({
      items: [],
      hasMore: false,
      nextCursor: null,
    });
    act(() => result.current.retry());

    await waitFor(() => expect(directoryApi.users).toHaveBeenCalledTimes(2));
    expect(directoryApi.facets).toHaveBeenCalledTimes(2);
  });
});
