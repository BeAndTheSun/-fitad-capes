import { generateInviteToken, getServerSession } from '@meltstudio/auth';
import type { MockedDb } from '@meltstudio/db/tests';
import { sendEmailTemplate } from '@meltstudio/mailing';

import { config } from '@/api/config';
import { db } from '@/api/db';
import { StorageProvider } from '@/api/enums';

/**
 * Validates env variables to set Vercel Blob as storage provider
 * If this test fails, modify the respective env variable at top of the test file
 */
export function expectToUseVercel(): void {
  // expect(config.storage.provider).toBe('');
  expect(config.storage.provider).toBe(StorageProvider.VERCEL);
}

/**
 * Validates env variables to set Vercel Blob as storage provider
 * If this test fails, modify the respective env variable at top of the test file
 */
export function expectToUseAws(): void {
  // expect(config.storage.provider).toBe('');
  expect(config.storage.provider).toBe(StorageProvider.AWS);
}

// Mock dependencies
jest.mock('@meltstudio/auth', () => ({
  generateInviteToken: jest.fn(),
  INVITATION_TOKEN_EXP_DAYS: 7,
  getServerSession: jest.fn(),
}));
jest.mock('@meltstudio/mailing', () => ({
  sendEmailTemplate: jest.fn(),
}));

export const mockedDb = db as unknown as MockedDb;

export const mockedGenerateInviteToken = generateInviteToken as jest.Mock;

export const mockedServerSession = getServerSession as jest.Mock;
export const mockedSendEmailTemplate = sendEmailTemplate as jest.Mock;
