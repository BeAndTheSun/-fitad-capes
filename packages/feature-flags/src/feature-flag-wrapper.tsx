import type { FC, PropsWithChildren } from 'react';

import type { FeatureFlag } from './feature-flags';
import { useFeatureFlag } from './use-feature-flag';

type Props = {
  flag: FeatureFlag;
};

export const FeatureFlagWrapper: FC<PropsWithChildren<Props>> = ({
  children,
  flag,
}) => {
  const { released } = useFeatureFlag(flag);

  if (!released) return null;

  return children;
};
