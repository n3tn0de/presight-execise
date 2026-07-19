import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FacetsResponse } from "@presight/shared";
import { FacetSidebar } from "./FacetSidebar";

const facets: FacetsResponse = {
  nationalities: Array.from({ length: 21 }, (_, index) => ({
    value: `Nationality ${index + 1}`,
    count: 21 - index,
  })),
  hobbies: Array.from({ length: 21 }, (_, index) => ({
    value: `Hobby ${index + 1}`,
    count: 21 - index,
  })),
};

describe("FacetSidebar", () => {
  it("renders every facet value returned by the API", () => {
    render(
      <FacetSidebar
        facets={facets}
        query={{ nationality: [], hobby: [] }}
        facetsLoading={false}
        facetsError={null}
        onRetry={vi.fn()}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Nationality 21")).toBeInTheDocument();
    expect(screen.getByText("Hobby 21")).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(42);
  });
});
