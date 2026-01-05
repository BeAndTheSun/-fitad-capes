import { randomBytes } from 'crypto';

export const INVITATION_TOKEN_EXP_DAYS = 2;

const INVITATION_TOKEN_LENGTH = 32;

export const generateInviteToken = (): string => {
  const token = randomBytes(INVITATION_TOKEN_LENGTH).toString('hex');
  return token;
};
