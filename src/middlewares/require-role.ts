
import type { RequestHandler } from "express";

import { ApiError } from "../utils/api-error";
import type { AuthUserRole } from "../utils/jwt";

export const requireRole = (
  ...allowedRoles: AuthUserRole[]
): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      next(
        new ApiError(
          401,
          "UNAUTHORIZED",
          "Authentication is required",
        ),
      );
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new ApiError(
          403,
          "FORBIDDEN",
          "You do not have permission to perform this action",
        ),
      );
      return;
    }

    next();
  };
};
