import { UserRoleEnum } from '@meltstudio/types';
import { z } from 'zod';

export const UserListArgsSchema = z
  .object({
    pagination: z
      .object({
        pageIndex: z.union([z.string(), z.number().nonnegative()]).optional(),
        pageSize: z.union([z.string(), z.number().nonnegative()]).optional(),
      })
      .optional(),
    filters: z
      .object({
        search: z.string().optional(),
        id: z.string().optional(),
        name: z.string().optional(),
        email: z.string().optional(),
        role: z.nativeEnum(UserRoleEnum).optional(),
        active: z.string().optional(),
      })
      .optional(),
    sorting: z
      .array(
        z.object({
          column: z.enum(['name', 'email', 'createdAt']),
          order: z.enum(['asc', 'desc']),
        })
      )
      .optional(),
  })
  .nullish();

export type UserListArgs = z.infer<typeof UserListArgsSchema>;

export const CreateUserParamsSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.nativeEnum(UserRoleEnum).default(UserRoleEnum.MEMBER),
  workspaceId: z.string(),
});

export type CreateUserParams = z.infer<typeof CreateUserParamsSchema>;
