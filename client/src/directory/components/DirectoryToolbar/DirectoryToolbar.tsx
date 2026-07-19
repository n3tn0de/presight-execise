import type { DirectoryQuery, SortField } from "@presight/shared";

export function DirectoryToolbar({
  query,
  total,
  onQueryChange,
}: {
  query: DirectoryQuery;
  total: number;
  onQueryChange: (patch: Partial<DirectoryQuery>) => void;
}) {
  return (
    <div className="toolbar">
      <label className="search">
        <span className="sr-only">Search people</span>
        <input
          value={query.q}
          onChange={(event) => onQueryChange({ q: event.target.value })}
          placeholder="Search by first or last name"
        />
      </label>
      <div className="sort-controls">
        <label>
          Sort{" "}
          <select
            value={query.sortBy}
            onChange={(event) =>
              onQueryChange({ sortBy: event.target.value as SortField })
            }
          >
            <option value="first_name">First name</option>
            <option value="last_name">Last name</option>
            <option value="age">Age</option>
            <option value="nationality">Nationality</option>
          </select>
        </label>
        <button
          type="button"
          className="sort-direction"
          onClick={() =>
            onQueryChange({ sortDir: query.sortDir === "asc" ? "desc" : "asc" })
          }
          aria-label={`Sort ${query.sortDir === "asc" ? "descending" : "ascending"}`}
        >
          {query.sortDir === "asc" ? "↑" : "↓"}
        </button>
        <span className="result-count">{total} people</span>
      </div>
    </div>
  );
}
