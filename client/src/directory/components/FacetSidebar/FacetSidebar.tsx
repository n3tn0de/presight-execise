import type { FacetsResponse } from "@presight/shared";
import { FacetGroup } from "../FacetGroup/FacetGroup";

export function FacetSidebar({
  facets,
  query,
  facetsLoading,
  facetsError,
  onRetry,
  onChange,
}: {
  facets: FacetsResponse;
  query: { nationality: string[]; hobby: string[] };
  facetsLoading: boolean;
  facetsError: string | null;
  onRetry: () => void;
  onChange: (
    kind: "nationality" | "hobby",
    value: string,
    checked: boolean,
  ) => void;
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar__heading">
        <span className="eyebrow">Refine results</span>
        <h2>Filters</h2>
      </div>
      {facetsLoading && (
        <div className="state-panel" role="status" aria-live="polite">
          Loading filters...
        </div>
      )}
      {facetsError && (
        <div className="state-panel" role="alert" aria-live="assertive">
          <strong>Could not load filters.</strong>
          <button type="button" onClick={onRetry}>
            Retry
          </button>
        </div>
      )}

      {!facetsError && (
        <>
          <FacetGroup
            title="Nationality"
            values={facets.nationalities}
            selected={query.nationality}
            onChange={(value, checked) =>
              onChange("nationality", value, checked)
            }
          />
          <FacetGroup
            title="Hobbies"
            values={facets.hobbies}
            selected={query.hobby}
            onChange={(value, checked) => onChange("hobby", value, checked)}
          />
        </>
      )}
    </aside>
  );
}
