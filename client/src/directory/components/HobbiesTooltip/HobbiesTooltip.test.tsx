import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HobbiesTooltip } from "./HobbiesTooltip";

afterEach(cleanup);

describe("HobbiesTooltip", () => {
  it("keeps the native title and renders remaining hobbies as pills locally", () => {
    render(<HobbiesTooltip hobbies={["Cycling", "Hiking"]} id="hobbies-1" />);

    const button = screen.getByRole("button", { name: "Show 2 more hobbies" });
    expect(button).toHaveAttribute("title", "Cycling, Hiking");
    fireEvent.click(button);

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.parentElement).not.toBe(document.body);
    expect(tooltip).toHaveTextContent("Cycling");
    expect(tooltip).toHaveTextContent("Hiking");
    expect(tooltip.querySelectorAll(".tag")).toHaveLength(2);
  });

  it("closes on outside click and Escape", () => {
    render(<HobbiesTooltip hobbies={["Cycling"]} id="hobbies-2" />);
    const button = screen.getByRole("button", { name: "Show 1 more hobbies" });

    fireEvent.click(button);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    fireEvent.click(button);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });
});
