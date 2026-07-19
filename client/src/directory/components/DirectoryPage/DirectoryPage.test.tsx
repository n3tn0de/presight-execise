import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DirectoryPage } from "./DirectoryPage";

const useDirectoryQuery = vi.hoisted(() =>
  vi.fn(() => ({
    users: [],
    facets: { hobbies: [], nationalities: [] },
    loading: false,
    loadingMore: false,
    facetsLoading: true,
    error: null,
    facetsError: null,
    appendError: null,
    hasMore: false,
    nextCursor: null,
    loadMore: vi.fn(),
    retryAppend: vi.fn(),
    query: {},
  })),
);
vi.mock("../../hooks/use-directory-query", () => ({ useDirectoryQuery }));

function renderDirectoryPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <DirectoryPage />
    </QueryClientProvider>,
  );
}

describe("DirectoryPage", () => {
  afterEach(cleanup);
  beforeEach(() => {
    window.history.replaceState(
      null,
      "",
      "/?q=Ada&nationality=Canadian&sortDir=desc",
    );
  });

  it("restores URL state in controls", () => {
    renderDirectoryPage();
    expect(screen.getByPlaceholderText(/search/i)).toHaveValue("Ada");
    expect(
      screen.getByRole("button", { name: /ascending/i }),
    ).toBeInTheDocument();
  });

  it("renders facet loading independently from users", () => {
    renderDirectoryPage();
    expect(screen.getAllByText(/loading filters/i)).not.toHaveLength(0);
    expect(screen.getAllByText(/people directory/i)).not.toHaveLength(0);
  });

  it("restores query state from browser history without rewriting the URL", async () => {
    renderDirectoryPage();
    const replaceState = vi.spyOn(window.history, "replaceState");
    window.history.pushState(null, "", "/?q=Grace&sortBy=age");
    window.dispatchEvent(new PopStateEvent("popstate"));

    await waitFor(() =>
      expect(screen.getByPlaceholderText(/search/i)).toHaveValue("Grace"),
    );
    expect(screen.getByLabelText("Sort")).toHaveValue("age");
    expect(replaceState).not.toHaveBeenCalled();
  });

  it("pushes a history entry for user-driven query changes", () => {
    renderDirectoryPage();
    const pushState = vi.spyOn(window.history, "pushState");

    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: "Grace" },
    });

    expect(pushState).toHaveBeenCalledWith(
      null,
      "",
      "?nationality=Canadian&q=Grace&sortDir=desc",
    );
    expect(window.location.search).toBe(
      "?nationality=Canadian&q=Grace&sortDir=desc",
    );
  });

  it("restores each URL when navigating backward and forward", async () => {
    renderDirectoryPage();
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: "Grace" },
    });
    fireEvent.change(screen.getByLabelText("Sort"), {
      target: { value: "age" },
    });

    window.history.back();
    window.dispatchEvent(new PopStateEvent("popstate"));
    await waitFor(() =>
      expect(screen.getByLabelText("Sort")).toHaveValue("first_name"),
    );
    expect(screen.getByPlaceholderText(/search/i)).toHaveValue("Grace");

    window.history.forward();
    window.dispatchEvent(new PopStateEvent("popstate"));
    await waitFor(() =>
      expect(screen.getByLabelText("Sort")).toHaveValue("age"),
    );
    expect(screen.getByPlaceholderText(/search/i)).toHaveValue("Grace");
  });
});
