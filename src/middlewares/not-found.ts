
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error";

export const notFound = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  next(
    new ApiError(
      404,
      "ROUTE_NOT_FOUND",
      `Route ${req.method} ${req.originalUrl} not found`
    )
  );
};
