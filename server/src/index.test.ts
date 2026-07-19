import { Server } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("server entrypoint", () => {
  it("does not listen when imported", async () => {
    const listen = vi.spyOn(Server.prototype, "listen");

    await import("./index.js");

    expect(listen).not.toHaveBeenCalled();
  });
});
