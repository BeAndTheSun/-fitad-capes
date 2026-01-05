import { selectFeatureFlagsSchema } from '@meltstudio/zod-schemas';
import { z } from 'zod';

import { FeatureFlag } from './feature-flags';

export const FeatureFlagDataSchema = selectFeatureFlagsSchema.merge(
  z.object({
    flag: z.nativeEnum(FeatureFlag),
  })
);

export const UserWithFeatureFlagsSchema = z.object({
  id: z.string(),
  featureFlags: z.array(FeatureFlagDataSchema),
});

export type FeatureFlagData = z.infer<typeof FeatureFlagDataSchema>;

export type UserWithFeatureFlags = z.infer<typeof UserWithFeatureFlagsSchema>;
