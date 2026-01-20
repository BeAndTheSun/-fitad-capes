import {
  generate2faSecret,
  generate2faToken,
  symmetricDecrypt,
  symmetricEncrypt,
  verify2faToken,
} from '@meltstudio/auth';
import { logger } from '@meltstudio/logger';
import { sendEmailTemplate } from '@meltstudio/mailing';
import {
  comparePassword,
  generateRecoveryToken,
  hashPassword,
  RECOVERY_TOKEN_EXP_MINS,
} from '@meltstudio/server-common';
import { AuthErrorCode, TwoFactorProvider } from '@meltstudio/types';
import { addMinutes } from 'date-fns';

import { ctx } from '@/api/context';
import { db } from '@/api/db';
import type { CreateUserParams } from '@/api/types/users';
import { createNewUser } from '@/api/utils/session';

import { sessionApiDef } from './def';

export const sessionRouter = ctx.router(sessionApiDef);

sessionRouter.post('/signup', async (req, res) => {
  const exists = await db.user.findUniqueByEmail(req.body.email);

  if (exists != null) {
    return res.status(401).json({ error: 'E-mail is already registered' });
  }

  const userPayload: CreateUserParams = req.body;
  const user = await createNewUser(userPayload, false);

  return res.status(201).json({ status: true, user: { id: user.id } });
});

sessionRouter.post('/send-password-recovery-email', async (req, res) => {
  const user = await db.user.findUniqueByEmail(req.body.email);
  // if the user is not found just return without error to avoid exposing
  // e-mails with accounts
  if (user == null) {
    return res.status(201).json({ status: true });
  }

  const token = generateRecoveryToken();
  await db.passwordRecoveryToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: addMinutes(new Date(), RECOVERY_TOKEN_EXP_MINS),
    },
  });

  await sendEmailTemplate({
    template: { id: 'forgot-password', props: { token } },
    options: { to: user.email },
  });

  return res.status(201).json({ status: true });
});

sessionRouter.post('/recover-password', async (req, res) => {
  const passwordRecoveryToken =
    await db.passwordRecoveryToken.findUniqueByToken(req.body.token);
  if (passwordRecoveryToken == null) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (
    passwordRecoveryToken.used ||
    passwordRecoveryToken.expiresAt < new Date()
  ) {
    return res.status(401).json({ error: 'Token already expired' });
  }

  await db.passwordRecoveryToken.update({
    pk: passwordRecoveryToken.id,
    data: { used: true },
  });
  const hashedPassword = await hashPassword(req.body.password);
  await db.user.update({
    pk: passwordRecoveryToken.userId,
    data: { password: hashedPassword },
  });

  return res.status(201).json({ status: true });
});

sessionRouter.post('/change-password', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const dbUser = await db.user.findUniqueByEmailWithPassword(
    req.auth?.user.email
  );
  if (dbUser == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const match = await comparePassword(req.body.oldPassword, dbUser.password);
  if (!match) {
    return res.status(200).send({ success: false });
  }

  const hashedNewPassword = await hashPassword(req.body.newPassword);
  await db.user.update({
    pk: dbUser.id,
    data: { password: hashedNewPassword },
  });

  return res.status(200).json({ success: true });
});

sessionRouter.post('/setup-2fa', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const user = await db.user.findUniqueByEmailWithPassword(req.auth.user.email);

  if (user == null) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!user.password) {
    return res.status(401).json({ error: AuthErrorCode.UserMissingPassword });
  }

  if (user.is2faEnabled) {
    return res
      .status(400)
      .json({ error: AuthErrorCode.TwoFactorAlreadyEnabled });
  }

  if (!process.env.ENCRYPTION_KEY) {
    logger.error(
      'Missing encryption key; cannot proceed with two factor setup.'
    );
    return res.status(500).json();
  }

  const isCorrectPassword = await comparePassword(
    req.body.password,
    user.password
  );

  if (!isCorrectPassword) {
    return res.status(400).json({ error: AuthErrorCode.IncorrectPassword });
  }

  const { provider } = req.body;

  const { data, secret } = await generate2faSecret(provider);

  await db.user.update({
    pk: user.id,
    data: {
      secret2fa: symmetricEncrypt(secret, process.env.ENCRYPTION_KEY),
    },
  });

  if (provider === TwoFactorProvider.EMAIL) {
    await sendEmailTemplate({
      template: {
        id: 'two-factor-auth',
        props: { code: data, userName: user.name },
      },
      options: {
        to: user.email,
        subject: 'Two Factor Authentication Code',
      },
    });
  }

  return res.json({ secret, data });
});

sessionRouter.post('/enable-2fa', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const user = await db.user.findUniqueByEmailWithPassword(req.auth.user.email);

  if (user == null) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.is2faEnabled) {
    return res
      .status(400)
      .json({ error: AuthErrorCode.TwoFactorAlreadyEnabled });
  }

  if (!user.secret2fa) {
    return res
      .status(400)
      .json({ error: AuthErrorCode.TwoFactorSetupRequired });
  }

  if (!process.env.ENCRYPTION_KEY) {
    logger.error(
      'Missing encryption key; cannot proceed with two factor setup.'
    );
    return res.status(500).json();
  }

  const secret = symmetricDecrypt(user.secret2fa, process.env.ENCRYPTION_KEY);

  const isValidToken = verify2faToken({
    secret,
    token: req.body.totpCode,
  });

  if (!isValidToken) {
    return res
      .status(400)
      .json({ error: AuthErrorCode.IncorrectTwoFactorCode });
  }

  await db.user.update({
    pk: user.id,
    data: { is2faEnabled: true },
  });

  return res.json({ message: 'Two-factor enabled' });
});

sessionRouter.post('/disable-2fa', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const user = await db.user.findUniqueByEmailWithPassword(req.auth.user.email);

  if (user == null) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!user.password) {
    return res.status(400).json({ error: AuthErrorCode.UserMissingPassword });
  }

  if (!user.is2faEnabled) {
    return res.json({ message: 'Two factor disabled' });
  }

  // if user has 2fa

  if (!req.body.totpCode) {
    return res.status(400).json({ error: AuthErrorCode.SecondFactorRequired });
  }

  if (!user.secret2fa) {
    logger.error(
      `Two factor is enabled for user ${user.email} but they have no secret`
    );
    throw new Error(AuthErrorCode.InternalServerError);
  }

  if (!process.env.ENCRYPTION_KEY) {
    logger.error(
      'Missing encryption key; cannot proceed with two factor login.'
    );
    throw new Error(AuthErrorCode.InternalServerError);
  }

  const secret = symmetricDecrypt(user.secret2fa, process.env.ENCRYPTION_KEY);
  // If user has 2fa enabled, check if body.totpCode is correct
  const isValidToken = verify2faToken({
    secret,
    token: req.body.totpCode,
  });
  if (!isValidToken) {
    return res
      .status(400)
      .json({ error: AuthErrorCode.IncorrectTwoFactorCode });
  }

  // If it is, disable users 2fa
  await db.user.update({
    pk: user.id,
    data: {
      is2faEnabled: false,
      secret2fa: null,
    },
  });

  return res.json({ message: 'Two factor disabled' });
});

sessionRouter.post('/send-two-factor-auth-email', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const user = await db.user.findUniqueByEmailWithPassword(req.auth.user.email);

  if (user == null) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!user.is2faEnabled) {
    return res.status(400).json({ error: AuthErrorCode.TwoFactorDisabled });
  }

  if (!user.secret2fa) {
    logger.error(
      `Two factor is enabled for user ${user.email} but they have no secret`
    );
    throw new Error(AuthErrorCode.InternalServerError);
  }

  if (!process.env.ENCRYPTION_KEY) {
    logger.error(
      'Missing encryption key; cannot proceed with two factor login.'
    );
    throw new Error(AuthErrorCode.InternalServerError);
  }

  const secret = symmetricDecrypt(user.secret2fa, process.env.ENCRYPTION_KEY);
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

  return res.json({ status: true });
});
