import type { ZodObject } from 'zod';
import { z } from 'zod';

export const BasePaginationResponseSchema = z.object({
  items: z.array(z.object({})),
  total: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
  offset: z.number().int().nonnegative(),
  pageCount: z.number().int().nonnegative(),
});

// Generic function to create a pagination response schema
export function createPaginationResponseSchema<T extends z.ZodTypeAny>(
  itemSchema: T
): ZodObject<{
  items: z.ZodArray<T>;
  total: z.ZodNumber;
  limit: z.ZodNumber;
  offset: z.ZodNumber;
  pageCount: z.ZodNumber;
}> {
  return BasePaginationResponseSchema.extend({
    items: z.array(itemSchema),
  });
}
