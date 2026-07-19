import { describe, expect, it, vi } from "vitest";
import {
  STRICT_MODE_FETCH_WARNING,
  warnAboutStrictModeFetches,
} from "./dev-warning";

describe("development StrictMode warning", () => {
  it("warns in development", () => {
    const warn = vi.fn();
    warnAboutStrictModeFetches(true, warn);
    expect(warn).toHaveBeenCalledWith(STRICT_MODE_FETCH_WARNING);
    expect(STRICT_MODE_FETCH_WARNING).toContain(
      "https://react.dev/reference/react/StrictMode",
    );
  });

  it("does not warn in production", () => {
    const warn = vi.fn();
    warnAboutStrictModeFetches(false, warn);
    expect(warn).not.toHaveBeenCalled();
  });
});
