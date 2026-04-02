import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Express middleware factory that validates request data against a Zod schema.
 * Validates req.body, req.query, and req.params in one pass.
 *
 * @param schema - Zod object schema with optional body/query/params keys
 * @returns Express middleware that sends 400 on validation failure
 */
export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.issues.map((issue) => ({
            field: issue.path.slice(1).join('.'),
            message: issue.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
}
