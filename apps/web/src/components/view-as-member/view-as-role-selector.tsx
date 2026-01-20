import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@meltstudio/theme';
import { UserRoleEnum } from '@meltstudio/types';
import { Trans, useTranslation } from 'next-i18next';
import type { FC } from 'react';

import { useViewAsMember } from './view-as-member-context';

/**
 * Component for super admins to select a role when viewing as another role
 */
export const ViewAsRoleSelector: FC = () => {
  const { t } = useTranslation();
  const { viewAsRole, setViewAsRole, isViewingAsRole } = useViewAsMember();

  if (!isViewingAsRole) {
    return null;
  }

  const availableRoles = [
    { value: UserRoleEnum.ADMIN, label: t('Trainer') },
    { value: UserRoleEnum.MEMBER, label: t('Super Participant') },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">
        <Trans>Viewing as:</Trans>
      </span>
      <Select
        value={viewAsRole ?? ''}
        onValueChange={(value) =>
          setViewAsRole(value as UserRoleEnum.ADMIN | UserRoleEnum.MEMBER)
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t('Select role')} />
        </SelectTrigger>
        <SelectContent>
          {availableRoles.map((role) => (
            <SelectItem key={role.value} value={role.value}>
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
