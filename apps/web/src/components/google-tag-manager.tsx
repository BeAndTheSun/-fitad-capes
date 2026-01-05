import { GoogleTagManager } from '@next/third-parties/google';

import { useSessionUser } from './user/user-context';

export const GoogleTagManagerComponent: React.FC = () => {
  const { user } = useSessionUser();
  if (user?.gtmId) {
    return <GoogleTagManager gtmId={user.gtmId} />;
  }
  return null;
};
