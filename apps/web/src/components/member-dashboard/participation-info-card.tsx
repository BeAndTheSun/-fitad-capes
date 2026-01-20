import type { MemberParticipationResponse } from '@meltstudio/client-common';
import { Card, CardContent, CardHeader, CardTitle } from '@meltstudio/theme';
import { UserRoleEnum } from '@meltstudio/types';
import { Trans, useTranslation } from 'next-i18next';
import type { FC } from 'react';

type ParticipationInfoCardProps = {
  participation: MemberParticipationResponse | undefined;
};

export const ParticipationInfoCard: FC<ParticipationInfoCardProps> = ({
  participation,
}) => {
  const { t } = useTranslation();

  const renderContent = (): JSX.Element => {
    if (!participation) {
      return (
        <p className="text-muted-foreground">
          <Trans>Unable to load participation information</Trans>
        </p>
      );
    }

    // Cast to UserRoleEnum to ensure safe comparison or simple string comparison
    const isMember =
      (participation.role as UserRoleEnum) === UserRoleEnum.MEMBER;

    return (
      <div className="flex flex-col gap-4">
        <div>
          <span className="text-sm font-medium text-muted-foreground">
            <Trans>Workspace</Trans>
          </span>
          <p className="text-lg">{participation.workspaceName}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-muted-foreground">
            <Trans>Your Role</Trans>
          </span>
          <p className="text-lg">
            {isMember ? t('Super Participant') : participation.role}
          </p>
        </div>
        <div>
          <span className="text-sm font-medium text-muted-foreground">
            <Trans>Email</Trans>
          </span>
          <p className="text-lg">{participation.email}</p>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Trans>Personal Participation Information</Trans>
        </CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};
