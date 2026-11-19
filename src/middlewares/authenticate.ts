
import type { RequestHandler } from "express";

import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/api-error";

export const authenticate: RequestHandler = (
  req,
  _res,
  next,
) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new ApiError(
        401,
        "UNAUTHORIZED",
        "Authentication token is required",
      );
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      throw new ApiError(
        401,
        "UNAUTHORIZED",
        "Authentication token is required",
      );
    }

    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    next(
      new ApiError(
        401,
        "INVALID_ACCESS_TOKEN",
        "Your authentication token is invalid or expired",
      ),
    );
  }
};
