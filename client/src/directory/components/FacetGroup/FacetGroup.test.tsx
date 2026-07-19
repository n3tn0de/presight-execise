import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FacetGroup } from "./FacetGroup";

describe("FacetGroup", () => {
  it("renders filters alphabetically by value", () => {
    render(
      <FacetGroup
        title="Nationality"
        values={[
          { value: "Zulu", count: 1 },
          { value: "Canadian", count: 2 },
          { value: "Australian", count: 3 },
        ]}
        selected={[]}
        onChange={vi.fn()}
      />,
    );

    const labels = screen
      .getAllByRole("checkbox")
      .map((checkbox) => checkbox.closest("label")?.textContent?.trim());
    expect(labels).toEqual(["Australian3", "Canadian2", "Zulu1"]);
  });
});
