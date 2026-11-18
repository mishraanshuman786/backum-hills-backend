
import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";

import { z } from "zod";

interface ValidationSchemas {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
}

export const validate = (
  schemas: ValidationSchemas
): RequestHandler => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validated: {
        body?: unknown;
        params?: unknown;
        query?: unknown;
      } = {};

      if (schemas.body) {
        validated.body = schemas.body.parse(req.body);
        req.body = validated.body;
      }

      if (schemas.params) {
        validated.params = schemas.params.parse(req.params);
      }

      if (schemas.query) {
        validated.query = schemas.query.parse(req.query);
      }

      res.locals.validated = validated;

      next();
    } catch (error) {
      next(error);
    }
  };
};
