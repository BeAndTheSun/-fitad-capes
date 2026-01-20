import type { TrainerResponse } from '@meltstudio/client-common';
import { Card, CardContent, CardHeader, CardTitle } from '@meltstudio/theme';
import { Trans } from 'next-i18next';
import type { FC } from 'react';

type TrainerInfoCardProps = {
  trainer: TrainerResponse | null | undefined;
  error: Error | null;
};

export const TrainerInfoCard: FC<TrainerInfoCardProps> = ({
  trainer,
  error,
}) => {
  const renderContent = (): JSX.Element => {
    if (error) {
      return (
        <p className="text-muted-foreground">
          <Trans>Error loading trainer information</Trans>
        </p>
      );
    }

    if (!trainer) {
      return (
        <p className="text-muted-foreground">
          <Trans>No trainer assigned to this workspace</Trans>
        </p>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <div>
          <span className="text-sm font-medium text-muted-foreground">
            <Trans>Name</Trans>
          </span>
          <p className="text-lg font-semibold">{trainer.name || '-'}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-muted-foreground">
            <Trans>Email</Trans>
          </span>
          <p className="text-lg">{trainer.email}</p>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Trans>Trainer Information</Trans>
        </CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};
