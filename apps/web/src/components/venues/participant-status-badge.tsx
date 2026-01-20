import type { VenueUserStatus } from '@meltstudio/client-common';
import { Badge } from '@meltstudio/theme';
import type { FC } from 'react';

type ParticipantStatusBadgeProps = {
  status: VenueUserStatus;
};

const STATUS_CONFIG: Record<
  VenueUserStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  joined: {
    label: 'Joined',
    variant: 'secondary',
  },
  checking: {
    label: 'Checked In',
    variant: 'outline',
  },
  completed: {
    label: 'Completed',
    variant: 'default',
  },
  failed: {
    label: 'Failed',
    variant: 'destructive',
  },
};

export const ParticipantStatusBadge: FC<ParticipantStatusBadgeProps> = ({
  status,
}) => {
  const config = STATUS_CONFIG[status];

  if (!config) {
    return <Badge variant="outline">{status}</Badge>;
  }

  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  );
};
