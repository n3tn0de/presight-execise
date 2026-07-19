import type { ErrorRequestHandler } from "express";
import { CursorError } from "../directory/cursor.js";

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof CursorError) {
    response.status(400).json({ error: { code: error.code, message: error.message } });
    return;
  }

  if (error && typeof error === "object" && "code" in error && (error as { code?: unknown }).code === "INVALID_QUERY") {
    const queryError = error as { message: string; details?: unknown };
    response.status(400).json({ error: { code: "INVALID_QUERY", message: queryError.message, details: queryError.details } });
    return;
  }

  response.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
};
