import { z } from 'zod';

export type TypeToZod<T> = {
  [K in keyof T]: T[K] extends string | number | boolean | null | undefined
    ? undefined extends T[K]
      ? z.ZodOptional<z.ZodType<Exclude<T[K], undefined>>>
      : z.ZodType<T[K]>
    : z.ZodObject<TypeToZod<T[K]>>;
};

export const userSchema = z.object({
  id: z.string().max(64),
  email: z.string().email(),
  name: z.string().max(256),
  active: z.boolean(),
  password: z.string().max(256),
  is2faEnabled: z.boolean(),
  role: z.string(),
  secret2fa: z.string().max(256).optional(),
  createdAt: z.coerce.date(),
});

export type UserType = z.infer<typeof userSchema>;

export const userFeatureFlagsSchema = z.object({
  user_id: z.string().uuid(), // Assumes UUID format
  feature_flag_id: z.string().max(64),
  released: z.boolean(),
});

export type UserFeatureFlagsType = z.infer<typeof userFeatureFlagsSchema>;

export const passwordRecoveryTokensSchema = z.object({
  userId: z.string().uuid(), // Assumes UUID format
  expiresAt: z.date(), // Assumes timestamp is handled as a JavaScript Date object
  token: z.string().max(256),
  used: z.boolean().default(false),
});

export type PasswordRecoveryTokenType = z.infer<
  typeof passwordRecoveryTokensSchema
>;

export const featureFlagSchema = z.object({
  id: z.string().max(64),
  description: z.string().default(''),
  released: z.boolean().default(false),
});

export type FeatureFlagType = z.infer<typeof featureFlagSchema>;

// Define a union schema using a tuple
export const anyModelSchema = z.union([
  userSchema,
  passwordRecoveryTokensSchema,
  featureFlagSchema,
  userFeatureFlagsSchema,
]);

type UnionKeys<T> = T extends T ? keyof T : never;

export type AnyModelType = z.infer<typeof anyModelSchema>;

export type AnyModelKey = UnionKeys<AnyModelType>;

export const modelSchemas = {
  users: userSchema,
  userFeatureFlags: userFeatureFlagsSchema,
  passwordRecoveryTokens: passwordRecoveryTokensSchema,
  featureFlag: featureFlagSchema,
} as const;

export type ModelName = keyof typeof modelSchemas;

export type ModelSchemas = typeof modelSchemas;

// Function to get schema based on model name
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getModelSchema = (modelName: string) => {
  if (modelName in modelSchemas) {
    return modelSchemas[modelName as keyof typeof modelSchemas];
  }
  // Return a default schema or throw an error if model not found
  return z.unknown();
};

export { getModelSchema };
