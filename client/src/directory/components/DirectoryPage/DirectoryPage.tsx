import { useEffect, useState } from "react";
import {
  DEFAULT_DIRECTORY_QUERY,
  parseDirectoryQuery,
  serializeDirectoryQuery,
} from "@presight/shared";
import type { DirectoryQuery } from "@presight/shared";
import { FacetSidebar } from "../FacetSidebar/FacetSidebar";
import { DirectoryToolbar } from "../DirectoryToolbar/DirectoryToolbar";
import { UserVirtualList } from "../UserVirtualList/UserVirtualList";
import { useDirectoryQuery } from "../../hooks/use-directory-query";

export function DirectoryPage() {
  const [query, setQuery] = useState<DirectoryQuery>(() =>
    parseDirectoryQuery(window.location.search),
  );
  const state = useDirectoryQuery(query);
  useEffect(() => {
    const restoreQuery = () => {
      setQuery(parseDirectoryQuery(window.location.search));
    };
    window.addEventListener("popstate", restoreQuery);
    return () => window.removeEventListener("popstate", restoreQuery);
  }, []);
  const update = (patch: Partial<DirectoryQuery>) => {
    const nextQuery = { ...query, ...patch };
    const next = serializeDirectoryQuery(nextQuery);
    const current = serializeDirectoryQuery(query);
    if (next !== current)
      window.history.pushState(
        null,
        "",
        next ? `?${next}` : window.location.pathname,
      );
    setQuery(nextQuery);
  };
  const retry = state.retry;
  return (
    <div className="app-shell">
      <header className="site-header">
        <div>
          <span className="eyebrow">People directory</span>
          <h1>Find your people.</h1>
        </div>
      </header>
      <main className="directory-layout">
        <FacetSidebar
          facets={state.facets}
          facetsLoading={state.facetsLoading}
          facetsError={state.facetsError}
          onRetry={retry}
          query={query}
          onChange={(kind, value, checked) =>
            update({
              [kind]: checked
                ? [...query[kind], value]
                : query[kind].filter((item) => item !== value),
            })
          }
        />
        <section className="results">
          <DirectoryToolbar
            query={query}
            total={state.users.length}
            onQueryChange={update}
          />
          {state.loading ? (
            <div className="state-panel" role="status" aria-live="polite">
              Loading the directory...
            </div>
          ) : state.error ? (
            <div className="state-panel" role="alert" aria-live="assertive">
              <strong>Could not load people.</strong>
              <button type="button" onClick={retry}>
                Retry
              </button>
            </div>
          ) : state.users.length === 0 ? (
            <div className="state-panel">
              <strong>No people found.</strong>
              <span>Try changing your search or filters.</span>
            </div>
          ) : (
            <UserVirtualList
              users={state.users}
              hasMore={state.hasMore}
              loadingMore={state.loadingMore}
              appendError={state.appendError}
              onPrefetch={state.loadMore}
              onRetry={state.retryAppend}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export { DEFAULT_DIRECTORY_QUERY };
