import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { AppError } from "../utils/app-error";

type ValidationTarget = "body" | "query" | "params";
type ValidationSchemaMap = Partial<Record<ValidationTarget, z.ZodType<unknown>>>;

const formatZodIssues = (error: z.ZodError) => {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));
};

export const validate =
  (schemas: ValidationSchemaMap) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const requestParts = req as unknown as Record<ValidationTarget, unknown>;

    for (const [target, schema] of Object.entries(schemas) as [
      ValidationTarget,
      z.ZodType<unknown>,
    ][]) {
      const result = schema.safeParse(requestParts[target]);

      if (!result.success) {
        next(
          new AppError(
            "Validation failed",
            422,
            "VALIDATION_ERROR",
            formatZodIssues(result.error),
          ),
        );
        return;
      }

      res.locals.validated = {
        ...(res.locals.validated ?? {}),
        [target]: result.data,
      };

      if (target !== "query") {
        requestParts[target] = result.data;
      }
    }

    next();
  };
