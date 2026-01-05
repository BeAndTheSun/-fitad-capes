import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  return hashed;
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const match = await bcrypt.compare(password, hashedPassword);

  return match;
}

export const RECOVERY_TOKEN_EXP_MINS = 60;

const RECOVERY_TOKEN_LENGTH = 32;
const RECOVERY_TOKEN_CHARS =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
export function generateRecoveryToken(): string {
  let result = '';
  for (let i = RECOVERY_TOKEN_LENGTH; i > 0; i -= 1) {
    result +=
      RECOVERY_TOKEN_CHARS[
        Math.floor(Math.random() * RECOVERY_TOKEN_CHARS.length)
      ];
  }

  return result;
}
