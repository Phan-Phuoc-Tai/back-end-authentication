import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

const validateMiddleware =
  (schema: ZodType) =>
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      request.body = await schema.parseAsync(request.body);
      next();
    } catch (error) {
      next(error);
    }
  };

export { validateMiddleware };
