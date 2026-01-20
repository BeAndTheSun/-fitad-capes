import { TwoFactorProvider } from '@meltstudio/types';
import { makeApi } from '@zodios/core';
import { z } from 'zod';

import { apiCommonErrorSchema } from '@/api/routers/def-utils';
import { CreateUserParamsSchema } from '@/api/types/users';

export const sessionApiDef = makeApi([
  {
    alias: 'signUp',
    description: 'Register user',
    method: 'post',
    path: '/signup',
    parameters: [
      {
        type: 'Body',
        description: 'register user',
        name: 'body',
        schema: CreateUserParamsSchema.omit({ workspaceId: true, role: true }),
      },
    ],
    response: z.object({
      status: z.boolean(),
      user: z.object({ id: z.string().uuid() }),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Not Found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'sendPasswordRecoveryEmail',
    description: 'Send password recovery email',
    method: 'post',
    path: '/send-password-recovery-email',
    parameters: [
      {
        type: 'Body',
        description: 'send password recover email',
        name: 'body',
        schema: z.object({
          email: z.string().email(),
        }),
      },
    ],
    response: z.object({
      status: z.boolean(),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Not Found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'recoverPassword',
    description: 'Recover password',
    method: 'post',
    path: '/recover-password',
    parameters: [
      {
        type: 'Body',
        description: 'recover password',
        name: 'body',
        schema: z.object({
          token: z.string(),
          password: z.string(),
        }),
      },
    ],
    response: z.object({
      status: z.boolean(),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Not Found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'changePassword',
    description: 'Change password using old and new password',
    method: 'post',
    path: '/change-password',
    parameters: [
      {
        type: 'Body',
        description: 'recover password',
        name: 'body',
        schema: z.object({
          oldPassword: z.string().min(1),
          newPassword: z.string().min(8),
        }),
      },
    ],
    response: z.object({
      success: z.boolean(),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Not Found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'setup2fa',
    description: 'Setup 2FA',
    method: 'post',
    path: '/setup-2fa',
    parameters: [
      {
        type: 'Body',
        description: 'setup 2fa',
        name: 'body',
        schema: z.object({
          password: z.string(),
          provider: z.nativeEnum(TwoFactorProvider),
        }),
      },
    ],
    response: z.object({
      secret: z.string(),
      data: z.string(),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Not Found',
        schema: apiCommonErrorSchema,
      },
      {
        status: 400,
        description: "Can't proceed with two factor setup",
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'verify2fa',
    description: 'Verify 2FA',
    method: 'post',
    path: '/verify-2fa',
    parameters: [
      {
        type: 'Body',
        description: 'verify 2fa',
        name: 'body',
        schema: z.object({
          token: z.string(),
        }),
      },
    ],
    response: z.object({
      status: z.boolean(),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Not Found',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'enable2fa',
    description: 'Enable 2FA',
    method: 'post',
    path: '/enable-2fa',
    parameters: [
      {
        type: 'Body',
        description: 'enable 2fa',
        name: 'body',
        schema: z.object({
          totpCode: z.string(),
        }),
      },
    ],
    response: z.object({
      message: z.string(),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Not Found',
        schema: apiCommonErrorSchema,
      },
      {
        status: 400,
        description: 'Two factor code error',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'disable2fa',
    description: 'Disable 2FA',
    method: 'post',
    path: '/disable-2fa',
    parameters: [
      {
        type: 'Body',
        description: 'disable 2fa',
        name: 'body',
        schema: z.object({
          password: z.string(),
          totpCode: z.string(),
        }),
      },
    ],
    response: z.object({
      message: z.string(),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Not Found',
        schema: apiCommonErrorSchema,
      },
      {
        status: 400,
        description: 'Two factor code error',
        schema: apiCommonErrorSchema,
      },
    ],
  },
  {
    alias: 'senTwoFactorAuthEmail',
    description: 'Send two factor email',
    method: 'post',
    path: '/send-two-factor-auth-email',
    response: z.object({
      status: z.boolean(),
    }),
    errors: [
      {
        status: 401,
        description: 'Unauthorized',
        schema: apiCommonErrorSchema,
      },
      {
        status: 404,
        description: 'Not Found',
        schema: apiCommonErrorSchema,
      },
      {
        status: 400,
        description: 'Two factor code error',
        schema: apiCommonErrorSchema,
      },
    ],
  },
]);
