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
  const displayName = trainer?.trainerName || trainer?.name;
  const displayEmail = trainer?.trainerEmail || trainer?.email;

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
          <p className="text-lg font-semibold">{displayName || '-'}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-muted-foreground">
            <Trans>Email</Trans>
          </span>
          <p className="text-lg">{displayEmail}</p>
        </div>
        {trainer.trainerPhone ? (
          <div>
            <span className="text-sm font-medium text-muted-foreground">
              <Trans>Phone number</Trans>
            </span>
            <p className="text-lg">{trainer.trainerPhone}</p>
          </div>
        ) : null}
        {trainer.trainerAddress ? (
          <div>
            <span className="text-sm font-medium text-muted-foreground">
              <Trans>Address</Trans>
            </span>
            <p className="text-lg">{trainer.trainerAddress}</p>
          </div>
        ) : null}
        {trainer.trainerSocialUrl ? (
          <div>
            <span className="text-sm font-medium text-muted-foreground">
              <Trans>Social media page</Trans>
            </span>
            <a
              className="text-lg text-primary underline"
              href={trainer.trainerSocialUrl}
              rel="noreferrer"
              target="_blank"
            >
              {trainer.trainerSocialUrl}
            </a>
          </div>
        ) : null}
        {trainer.trainerBio ? (
          <div>
            <span className="text-sm font-medium text-muted-foreground">
              <Trans>Professional bio</Trans>
            </span>
            <p className="text-lg leading-relaxed">{trainer.trainerBio}</p>
          </div>
        ) : null}
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
