import type { User } from '@meltstudio/client-common';
import {
  formatZodiosError,
  useGetFile,
  useGetOwnUser,
} from '@meltstudio/client-common';
import { useSession } from 'next-auth/react';
import type { FC, PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';

type UserWorkspace = {
  id: string;
  name: string;
  role: string;
};

export type UserContextProfileImageQuery = {
  id: string | null;
  url: string | null;
  isLoading: boolean;
  error: Error | null;
};

export type UserContextType = {
  user: User | null;
  isLoading: boolean;
  profileImage: UserContextProfileImageQuery;
  invalidateUser: () => Promise<void>;
  selectedWorkspace: UserWorkspace | null;
  workspaces: UserWorkspace[];
  isSuperAdmin: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: FC<PropsWithChildren> = ({ children }) => {
  const { data: session, status } = useSession();
  const userQuery = useGetOwnUser(status === 'authenticated');

  const workspaces = useMemo(() => {
    if (userQuery.data?.workspaces.length === 0) {
      return [];
    }
    return (
      userQuery.data?.workspaces.map((w) => {
        return {
          id: w.workspaceId,
          name: w.workspace.name,
          role: w.role,
        };
      }) ?? []
    );
  }, [userQuery.data]);

  const initialWorkspace = useMemo(() => {
    if (workspaces.length > 0) {
      return workspaces[0] ?? null;
    }
    return null;
  }, [workspaces]);

  const profileImageKey = userQuery.data?.profileImage ?? '';
  const profileImageQueryEnabled = !!profileImageKey;
  const profileImageQuery = useGetFile(
    { id: profileImageKey ?? '' },
    { enabled: profileImageQueryEnabled }
  );

  // We need to check if profileImageKey is not empty as loading status is always true when query hasn't fetched data yet
  const isLoading =
    (status === 'authenticated' && userQuery.isLoading) || status === 'loading';

  const imageUrl = profileImageQuery.data?.url || null;

  // User with profile url
  const userWithPhoto = useMemo<User | null>(() => {
    if (!userQuery.data || isLoading) return null;
    return {
      ...userQuery.data,
      profileImage: imageUrl,
    };
  }, [imageUrl, isLoading, userQuery.data]);

  const isSuperAdmin = useMemo(() => {
    return userQuery.data?.isSuperAdmin ?? false;
  }, [userQuery.data]);

  const errorMessage = useMemo(() => {
    if (userQuery.error) {
      return formatZodiosError('getOwnUser', userQuery.error)?.error || null;
    }
    return null;
  }, [userQuery.error]);

  const refetch = useCallback(async (): Promise<void> => {
    await userQuery.refetch();
  }, [userQuery]);

  const invalidateUser = useCallback(async (): Promise<void> => {
    await userQuery.invalidate();
  }, [userQuery]);

  // Wrapped into useMemo to avoid unnecessary re-renders
  const value = useMemo<UserContextType>(
    () => ({
      user: userWithPhoto,
      isLoading,
      profileImage: {
        id: profileImageKey,
        url: imageUrl,
        isLoading: profileImageQueryEnabled && profileImageQuery.isLoading,
        error: profileImageQuery.error,
      },
      selectedWorkspace: session?.user?.selectedWorkspace ?? initialWorkspace,
      workspaces,
      isSuperAdmin,
      error: errorMessage,
      refetch,
      invalidateUser,
    }),
    [
      userWithPhoto,
      isLoading,
      profileImageKey,
      imageUrl,
      profileImageQueryEnabled,
      profileImageQuery.isLoading,
      profileImageQuery.error,
      session?.user?.selectedWorkspace,
      initialWorkspace,
      workspaces,
      isSuperAdmin,
      errorMessage,
      refetch,
      invalidateUser,
    ]
  );
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useSessionUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('UserProvider is not initialized or was not found');
  }
  return context;
};
