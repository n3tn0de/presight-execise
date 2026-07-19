import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_DIRECTORY_QUERY } from "@presight/shared";
import { DirectoryToolbar } from "./DirectoryToolbar";

describe("DirectoryToolbar", () => {
  it("emits basic search, sort, and direction changes", () => {
    const onChange = vi.fn();
    render(
      <DirectoryToolbar
        query={DEFAULT_DIRECTORY_QUERY}
        total={4}
        onQueryChange={onChange}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByDisplayValue("First name"), {
      target: { value: "age" },
    });
    fireEvent.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenNthCalledWith(1, { q: "Ada" });
    expect(onChange).toHaveBeenNthCalledWith(2, { sortBy: "age" });
    expect(onChange).toHaveBeenNthCalledWith(3, { sortDir: "desc" });
  });
});
