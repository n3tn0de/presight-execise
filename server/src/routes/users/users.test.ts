import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CursorError } from "../../directory/database/cursor";
import { createApp } from "../../app/app";

const servers: Server[] = [];

afterEach(async () => {
  await Promise.all(
    servers
      .splice(0)
      .map(
        (server) =>
          new Promise<void>((resolve) => server.close(() => resolve())),
      ),
  );
});

async function request(app: ReturnType<typeof createApp>, path: string) {
  const server = createServer(app);
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("server did not bind");
  return fetch(`http://127.0.0.1:${address.port}${path}`);
}

describe("API routes", () => {
  it("parses repeated filters and returns the shared users response", async () => {
    const list = vi
      .fn()
      .mockResolvedValue({ items: [], nextCursor: null, hasMore: false });
    const response = await request(
      createApp({ service: { list, facets: vi.fn() }, healthCheck: vi.fn() }),
      "/api/users?q=Ada&nationality=French&nationality=Canadian&hobby=Chess&sortBy=age&sortDir=desc&limit=5&cursor=opaque",
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      items: [],
      nextCursor: null,
      hasMore: false,
    });
    expect(list).toHaveBeenCalledWith({
      q: "Ada",
      nationality: ["Canadian", "French"],
      hobby: ["Chess"],
      sortBy: "age",
      sortDir: "desc",
      limit: 5,
      cursor: "opaque",
    });
  });

  it("returns facets", async () => {
    const facets = vi.fn().mockResolvedValue({
      hobbies: [{ value: "Chess", count: 2 }],
      nationalities: [],
    });
    const response = await request(
      createApp({ service: { list: vi.fn(), facets }, healthCheck: vi.fn() }),
      "/api/facets?hobby=Chess",
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      hobbies: [{ value: "Chess", count: 2 }],
      nationalities: [],
    });
  });

  it("returns health status", async () => {
    const response = await request(
      createApp({
        service: { list: vi.fn(), facets: vi.fn() },
        healthCheck: vi.fn().mockResolvedValue(undefined),
      }),
      "/api/health",
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("returns a structured 500 response when health checks fail", async () => {
    const response = await request(
      createApp({
        service: { list: vi.fn(), facets: vi.fn() },
        healthCheck: vi
          .fn()
          .mockRejectedValue(new Error("database unavailable")),
      }),
      "/api/health",
    );
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: { code: "INTERNAL_ERROR", message: "Internal server error" },
    });
  });

  it("rejects invalid query values", async () => {
    const response = await request(
      createApp({
        service: { list: vi.fn(), facets: vi.fn() },
        healthCheck: vi.fn(),
      }),
      "/api/users?limit=abc&sortDir=sideways",
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: {
        code: "INVALID_QUERY",
        message: "Invalid query",
        details: expect.anything(),
      },
    });
  });

  it("maps cursor errors to a 400 response", async () => {
    const list = vi
      .fn()
      .mockRejectedValue(new CursorError("cursor does not match query"));
    const response = await request(
      createApp({ service: { list, facets: vi.fn() }, healthCheck: vi.fn() }),
      "/api/users?cursor=bad",
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: { code: "INVALID_CURSOR", message: "cursor does not match query" },
    });
  });

  it("rejects an explicitly empty cursor as invalid", async () => {
    const list = vi.fn();
    const response = await request(
      createApp({ service: { list, facets: vi.fn() }, healthCheck: vi.fn() }),
      "/api/users?cursor=",
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: { code: "INVALID_CURSOR", message: "invalid cursor" },
    });
    expect(list).not.toHaveBeenCalled();
  });

  it("returns a database unavailable response and logs connection errors", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const databaseError = Object.assign(new Error("connect ECONNREFUSED"), {
      code: "ECONNREFUSED",
    });
    const list = vi.fn().mockRejectedValue(databaseError);
    const response = await request(
      createApp({ service: { list, facets: vi.fn() }, healthCheck: vi.fn() }),
      "/api/users",
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "Database is unavailable. Check your PostgreSQL connection.",
      },
    });
    expect(log).toHaveBeenCalledWith(
      "API request failed",
      expect.objectContaining({
        method: "GET",
        path: "/api/users",
        error: databaseError,
      }),
    );
    log.mockRestore();
  });

  it("keeps unrelated errors as generic 500 responses", async () => {
    const list = vi.fn().mockRejectedValue(new Error("secret internal detail"));
    const response = await request(
      createApp({ service: { list, facets: vi.fn() }, healthCheck: vi.fn() }),
      "/api/users",
    );
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: { code: "INTERNAL_ERROR", message: "Internal server error" },
    });
  });
});
