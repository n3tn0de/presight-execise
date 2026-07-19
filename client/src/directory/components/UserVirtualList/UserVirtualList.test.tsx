import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UserVirtualList } from "./UserVirtualList";

vi.mock("react-window", () => ({
  List: (props: any) => (
    <div
      data-testid="virtual-list"
      data-height={props.defaultHeight}
      data-overscan={props.overscanCount}
    >
      {props.rowComponent({
        index: 0,
        style: { top: 12, height: 112, position: "absolute" },
        ...props.rowProps,
      })}
    </div>
  ),
}));

describe("UserVirtualList", () => {
  it("uses the measured container height with overscan and applies row style", () => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(private readonly callback: ResizeObserverCallback) {}
        observe(element: Element) {
          Object.defineProperty(element, "clientHeight", {
            configurable: true,
            value: 480,
          });
          this.callback([], this as unknown as ResizeObserver);
        }
        disconnect() {}
      },
    );
    render(
      <UserVirtualList
        users={[
          {
            id: "one",
            avatar: "",
            firstName: "One",
            lastName: "User",
            age: 30,
            nationality: "Canadian",
            hobbies: [],
          },
        ]}
        hasMore={false}
        loadingMore={false}
        appendError={null}
        onPrefetch={vi.fn()}
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByTestId("virtual-list")).toHaveAttribute(
      "data-height",
      "480",
    );
    expect(screen.getByTestId("virtual-list")).toHaveAttribute(
      "data-overscan",
      "4",
    );
    expect(screen.getByTestId("virtual-row")).toHaveStyle({
      top: "12px",
      position: "absolute",
    });
    vi.unstubAllGlobals();
  });
});
