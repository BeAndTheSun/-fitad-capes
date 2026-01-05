import { Trans } from 'next-i18next';
import React, { useState } from 'react';

import { Button } from '@/theme/index';

import { InviteMemberDialog } from './dialog';

export type InviteMemberButtonProps = {
  className?: string;
};

export const InviteMemberButton: React.FC<InviteMemberButtonProps> = ({
  className,
}) => {
  const [openInviteMember, setOpenInviteMember] = useState(false);
  const onClickInviteNewMember = (): void => {
    setOpenInviteMember(true);
  };
  return (
    <>
      <Button className={className} onClick={onClickInviteNewMember}>
        <Trans>Invite new member</Trans>
      </Button>
      <InviteMemberDialog
        open={openInviteMember}
        onOpenChange={setOpenInviteMember}
      />
    </>
  );
};
