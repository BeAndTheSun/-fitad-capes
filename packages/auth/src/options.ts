import { Db } from '@meltstudio/db';
import { logger } from '@meltstudio/logger';
import { sendEmailTemplate } from '@meltstudio/mailing';
import { comparePassword } from '@meltstudio/server-common';
import { AuthErrorCode, TwoFactorProvider } from '@meltstudio/types';
import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import speakeasy from 'speakeasy';

import { symmetricDecrypt } from './crypto';
import { generate2faToken } from './two-factor-auth';

const db = new Db();

export const authOptions = {
  pages: {
    signIn: '/en/auth/sign-in',
    error: '/en/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          selectedWorkspace: token.selectedWorkspace,
        },
      };
    },
    signIn: async (params): Promise<boolean> => {
      if (params.user.email == null) {
        return false;
      }
      const userEmail = params.user.email.trim().toLowerCase();
      const user = await db.user.findUniqueByEmail(userEmail);
      if (user == null) {
        return false;
      }

      return user.active;
    },
    jwt: async ({ token, trigger, session }): Promise<JWT> => {
      if (trigger === 'update' && session) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return { ...token, selectedWorkspace: session.user.selectedWorkspace };
      }
      if (token.sub) {
        const user = await db.user.findUniqueByID(token.sub);
        if (trigger === 'update' && session) {
          // update token with email from db
          if (user) {
            return {
              ...token,
              email: user.email,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              role: session.user.selectedWorkspace.role,
            };
          }
        }
        if (trigger === 'signIn') {
          // add the first workspace to the token
          const workspaces = user?.workspaces || [];
          if (workspaces.length > 0) {
            const selectedWorkspace = workspaces[0]?.workspace;
            if (selectedWorkspace) {
              return {
                ...token,
                selectedWorkspace: {
                  id: selectedWorkspace.id,
                  name: selectedWorkspace.name,
                  role: workspaces[0]?.role,
                },
              };
            }
          }
        }
        if (user) {
          return { ...token, role: user.workspaces[0]?.role };
        }
      }
      return token;
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {},
        password: {},
        totpCode: {},
      },
      async authorize(credentials) {
        if (credentials == null) {
          return null;
        }

        const user = await db.user.findUniqueByEmailWithPassword(
          credentials.email
        );
        if (user == null) {
          return null;
        }

        const match = await comparePassword(
          credentials.password,
          user.password
        );
        if (!match) {
          return null;
        }

        if (user.is2faEnabled) {
          if (!process.env.ENCRYPTION_KEY) {
            logger.error(
              'Missing encryption key; cannot proceed with two factor login.'
            );
            throw new Error(AuthErrorCode.InternalServerError);
          }

          if (!credentials.totpCode) {
            if (!user.secret2fa) {
              logger.error(
                `Two factor is enabled for user ${user.email} but they have no secret`
              );
              throw new Error(AuthErrorCode.InternalServerError);
            }
            if (
              process.env.NEXT_PUBLIC_TWO_FACTOR_AUTH_PROVIDER ===
              TwoFactorProvider.EMAIL
            ) {
              // Send 2FA code
              const secret = symmetricDecrypt(
                user.secret2fa,
                process.env.ENCRYPTION_KEY
              );
              const code = generate2faToken(secret);
              await sendEmailTemplate({
                template: {
                  id: 'two-factor-auth',
                  props: { code, userName: user.name },
                },
                options: {
                  to: user.email,
                  subject: 'Two Factor Authentication Code',
                },
              });
            }
            throw new Error(AuthErrorCode.SecondFactorRequired);
          }

          if (!user.secret2fa) {
            logger.error(
              `Two factor is enabled for user ${user.email} but they have no secret`
            );
            throw new Error(AuthErrorCode.InternalServerError);
          }

          const secret = symmetricDecrypt(
            user.secret2fa,
            process.env.ENCRYPTION_KEY
          );
          const verified = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token: credentials.totpCode,
            window: 30,
          });

          if (!verified) {
            throw new Error(AuthErrorCode.IncorrectTwoFactorCode);
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
} satisfies NextAuthOptions;
