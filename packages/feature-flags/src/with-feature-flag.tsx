import type { ComponentType, FC } from 'react';
import React from 'react';

import type { FeatureFlag } from './feature-flags';
import { useFeatureFlag } from './use-feature-flag';

export const withFeatureFlag = <Props extends object>(
  feature: FeatureFlag,
  WrappedComponent: ComponentType<Props>,
  FallbackComponent: ComponentType = React.Fragment
): FC<Props> => {
  const Component: FC<Props> = (props) => {
    const { released } = useFeatureFlag(feature);
    return released ? <WrappedComponent {...props} /> : <FallbackComponent />;
  };

  return Component;
};
