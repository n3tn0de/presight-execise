import type { ErrorRequestHandler } from "express";
import { CursorError } from "../directory/database/cursor";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  request,
  response,
  next,
) => {
  void next;
  console.error("API request failed", {
    method: request.method,
    path: request.originalUrl,
    error,
  });

  if (isDatabaseUnavailable(error)) {
    response.status(503).json({
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "Database is unavailable. Check your PostgreSQL connection.",
      },
    });
    return;
  }

  if (error instanceof CursorError) {
    response
      .status(400)
      .json({ error: { code: error.code, message: error.message } });
    return;
  }

  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: unknown }).code === "INVALID_QUERY"
  ) {
    const queryError = error as { message: string; details?: unknown };
    response.status(400).json({
      error: {
        code: "INVALID_QUERY",
        message: queryError.message,
        details: queryError.details,
      },
    });
    return;
  }

  response.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Internal server error" },
  });
};

function isDatabaseUnavailable(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? error.code : undefined;
  return (
    code === "ECONNREFUSED" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "57P01" ||
    code === "08000" ||
    code === "08001" ||
    code === "08003" ||
    code === "08004" ||
    code === "08006" ||
    code === "08007" ||
    code === "08P01" ||
    code === "57P03"
  );
}
