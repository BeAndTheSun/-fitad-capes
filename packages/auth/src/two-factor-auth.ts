import { TwoFactorProvider } from '@meltstudio/types';
import QRCode from 'qrcode';
import speakeasy from 'speakeasy';

export async function generate2faSecret(type: TwoFactorProvider): Promise<{
  secret: string;
  data: string;
}> {
  let data: string = '';
  const secret = speakeasy.generateSecret({
    name: 'Two-Factor Authentication',
  });
  switch (type) {
    case TwoFactorProvider.AUTHENTICATOR:
      {
        if (!secret.otpauth_url) {
          throw new Error('Failed to generate 2FA secret');
        }
        const QRUrl = await QRCode.toDataURL(secret.otpauth_url);
        data = QRUrl;
      }
      break;
    case TwoFactorProvider.EMAIL:
      data = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
      });
      break;

    default:
      throw new Error('Invalid 2FA type');
  }

  return {
    secret: secret.base32,
    data,
  };
}

export function verify2faToken({
  secret,
  token,
  window = 30,
}: {
  secret: string;
  token: string;
  window?: number;
}): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window,
  });
}

export function generate2faToken(secret: string): string {
  return speakeasy.totp({
    secret,
    encoding: 'base32',
  });
}
