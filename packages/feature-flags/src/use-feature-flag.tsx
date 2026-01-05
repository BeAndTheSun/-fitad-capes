import { useContext } from 'react';

import type { FeatureFlag } from './feature-flags';
import { FeatureFlagsContext } from './feature-flags-context';
import type { FeatureFlagData } from './schema';

export const useFeatureFlag = (
  featureFlag: FeatureFlag
): FeatureFlagData & { isLoading: boolean } => {
  const context = useContext(FeatureFlagsContext);
  if (!context) throw Error('No context loaded for feature flags!');
  return {
    ...context.getFlag(featureFlag),
    isLoading: context.isLoading,
  };
};
