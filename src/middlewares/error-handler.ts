
import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";

import { ZodError } from "zod";
import { ApiError } from "../utils/api-error";
import { env } from "../config/env";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let code = "INTERNAL_SERVER_ERROR";
  let message = "Something went wrong";
  let details: unknown;

  // Custom application errors
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  }

  // Zod validation errors
  else if (error instanceof ZodError) {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "Invalid request data";

    details = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  }

  // PostgreSQL errors
  else if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    const pgError = error as {
      code: string;
      constraint?: string;
    };

    switch (pgError.code) {
      case "23505":
        statusCode = 409;
        code = "DUPLICATE_RESOURCE";
        message = "Resource already exists";
        break;

      case "23503":
        statusCode = 409;
        code = "FOREIGN_KEY_VIOLATION";
        message = "Related resource does not exist or cannot be deleted";
        break;

      case "23514":
        statusCode = 400;
        code = "DATABASE_CONSTRAINT_ERROR";
        message = "Database constraint validation failed";
        break;
    }
  }

  // Log unexpected errors
  if (statusCode === 500) {
    console.error("[ERROR]", error);
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
      ...(env.NODE_ENV === "development" &&
        error instanceof Error && {
          stack: error.stack,
        }),
    },
  });
};
