import { Trans, useTranslation } from 'next-i18next';
import type { FC } from 'react';

import { UserRoleEnum } from '@/common-types/auth';
import { useWorkspaces } from '@/hooks/use-workspaces';
import { Button } from '@/theme/index';

type FinalComponentProps = {
  name: string;
  description: string;
  members: string[];
  workspaceID: string;
  workspaceName: string;
};

const FinalComponent: FC<FinalComponentProps> = ({
  name,
  description,
  members,
  workspaceID,
  workspaceName,
}) => {
  const { t } = useTranslation();

  const { changeToNewWorkspace } = useWorkspaces();

  const onGoToWorkspace = async (): Promise<void> => {
    await changeToNewWorkspace({
      id: workspaceID,
      name: workspaceName,
      role: UserRoleEnum.ADMIN,
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">
        <Trans>Workspace Created!</Trans>
      </h2>
      <p className="mt-4">
        <Trans>
          Congratulations! Your workspace profile has been created successfully.
        </Trans>
      </p>
      <p className="mt-2">
        <strong>
          <Trans>Workspace Profile Name</Trans>:
        </strong>{' '}
        {name}
      </p>
      <p className="mt-2">
        <strong>
          <Trans>Description</Trans>:
        </strong>{' '}
        {description}
      </p>
      <p className="mt-2">
        <strong>
          <Trans>Members</Trans>:
        </strong>{' '}
        {members.length ? members.join(', ') : t('No members added')}
      </p>
      <Button className="mt-2" onClick={onGoToWorkspace}>
        <Trans>Go to workspace</Trans>
      </Button>
    </div>
  );
};

export { FinalComponent };
