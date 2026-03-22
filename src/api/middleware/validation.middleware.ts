import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../../utils/errors';

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map(
        (i) => `${i.path.join('.')}: ${i.message}`,
      );
      throw new ValidationError('Request body validation failed', details);
    }

    req.body = result.data;
    next();
  };
}
