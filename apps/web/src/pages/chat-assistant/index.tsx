import { AssistantChatLayout } from '@meltstudio/ui';

import { useSessionUser } from '@/components/user/user-context';
import { FeatureFlag, FeatureFlagWrapper } from '@/feature-flags/index';
import { useToast } from '@/theme/index';
import type { NextPageWithLayout } from '@/types/next';

const AssistantChatsPage: NextPageWithLayout = () => {
  const { selectedWorkspace, user } = useSessionUser();
  const { toast } = useToast();

  const handleError = (error: Error): void => {
    toast({
      title: 'Error',
      description: error.message || 'An error occurred',
    });
  };

  if (!user || !selectedWorkspace) {
    return null;
  }

  return (
    <FeatureFlagWrapper flag={FeatureFlag.CHATS_MODULE}>
      <AssistantChatLayout
        workspaceId={selectedWorkspace.id}
        userId={user.id || 'unknown'}
        user={{
          name: user.name || 'Unknown User',
          avatar: '👤',
        }}
        onError={handleError}
      />
    </FeatureFlagWrapper>
  );
};

export default AssistantChatsPage;
