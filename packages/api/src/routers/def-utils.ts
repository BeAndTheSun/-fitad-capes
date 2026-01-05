import { z } from 'zod';

export const apiCommonErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  validationErrors: z
    .array(
      z.object({
        fields: z.array(z.string()),
        message: z.string(),
      })
    )
    .optional(),
});

// date schema that works both for the server and the client
export const apiDateSchema = z
  .union([z.date(), z.string().datetime({ offset: true })])
  .transform((value) => (value instanceof Date ? value.toISOString() : value));

// boolean schema that works both for the server and the client
export const booleanQuerySchema = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((value) => (typeof value === 'string' ? value === 'true' : value));

export const apiApportionmentSchema = z.object({
  subtotal: z.number(),
  days: z.number(),
});

export type ApiCommonErrorType = z.infer<typeof apiCommonErrorSchema>;
