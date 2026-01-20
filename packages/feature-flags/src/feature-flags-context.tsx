import { useGetFeatureFlags } from '@meltstudio/client-common';
import type { FC, PropsWithChildren } from 'react';
import React, { createContext, useCallback, useMemo } from 'react';

import type { FeatureFlag } from './feature-flags';
import type { FeatureFlagData } from './schema';
import { FeatureFlagDataSchema } from './schema';

type FeatureFlagsContextType = {
  sessionFlags: Map<FeatureFlag, FeatureFlagData>;
  getFlag: (flag: FeatureFlag) => FeatureFlagData;
  isLoading: boolean;
};

type FeatureFlagsProviderProps = {
  children: React.ReactNode;
  userFeatureFlags: {
    featureFlagId: string;
    released: boolean;
  }[];
  workspaceId: string;
};

export const FeatureFlagsContext =
  createContext<FeatureFlagsContextType | null>(null);

export const FeatureFlagsProvider: FC<
  PropsWithChildren<FeatureFlagsProviderProps>
> = ({ children, userFeatureFlags, workspaceId }) => {
  // TODO: Try to inject this to remove api dependency
  const { data: featureFlags, isLoading: isQueryLoading } = useGetFeatureFlags({
    workspaceId,
  });

  const isLoading = workspaceId?.trim() ? isQueryLoading : false;

  const sessionFlags = useMemo(() => {
    // Create the map with all incoming feature flags
    const featureFlagsMap = new Map<FeatureFlag, FeatureFlagData>();
    featureFlags?.flags.forEach((flag) => {
      const parsedFlag = FeatureFlagDataSchema.safeParse(flag).data;
      if (parsedFlag) featureFlagsMap.set(parsedFlag.flag, parsedFlag);
    });

    // Set the session flags that user might have active
    if (userFeatureFlags.length) {
      userFeatureFlags.forEach((flag) => {
        const mappedFlag = Array.from(featureFlagsMap.values()).find(
          (f) => f.id === flag.featureFlagId
        );

        if (mappedFlag) {
          featureFlagsMap.set(mappedFlag.flag, {
            ...mappedFlag,
            released: flag.released,
          });
        }
      });
    }

    return featureFlagsMap;
  }, [featureFlags?.flags, userFeatureFlags]);

  const getFlag = useCallback(
    (flag: FeatureFlag): FeatureFlagData => {
      const data = sessionFlags.get(flag);

      if (data) return data;

      // We return an empty object if the flag is not found
      return {
        id: '',
        flag: '' as FeatureFlag,
        description: '',
        workspaceId: '',
        released: false,
        createdAt: '',
        globalFeatureFlagId: '',
      };
    },
    [sessionFlags]
  );

  const value = useMemo(
    () => ({ sessionFlags, getFlag, isLoading }),
    [sessionFlags, getFlag, isLoading]
  );

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};
