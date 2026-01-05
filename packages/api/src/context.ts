import { zodiosContext } from '@zodios/express';
import z from 'zod';

const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
});

export const ctx = zodiosContext(
  z.object({
    auth: z
      .object({
        user: userSchema,
      })
      .optional(),
  })
);
