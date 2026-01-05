import { logger } from '@meltstudio/logger';
import { render } from '@react-email/components';
import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

import ForgotPassword from '@/mailing/emails/forgot-password';
import Welcome from '@/mailing/emails/welcome';

import { config } from './config';
import DatabaseExport from './emails/database-export';
import MemberInvitation from './emails/member-invitation';
import TwoFactorAuth from './emails/two-factor-auth';

type Template = {
  [id in keyof typeof TEMPLATES]: {
    id: id;
    props: React.ComponentPropsWithoutRef<(typeof TEMPLATES)[id]>;
  };
}[keyof typeof TEMPLATES];
type Options = Pick<Mail.Options, 'from' | 'to' | 'cc' | 'bcc' | 'subject'>;

type SendEmailTemplate = {
  template: Template;
  options: Options;
};

// this is using resend for demo purposes but it can be switched to any smtp
// provider supported by nodemailer
const transport = nodemailer.createTransport({
  host: 'smtp.resend.com',
  secure: true,
  port: 465,
  auth: {
    user: config.mailing.user,
    pass: config.mailing.password,
  },
});

const TEMPLATES = {
  welcome: Welcome,
  'forgot-password': ForgotPassword,
  'two-factor-auth': TwoFactorAuth,
  'member-invitation': MemberInvitation,
  'database-export': DatabaseExport,
} as const;

export async function sendEmailTemplate({
  template,
  options,
}: SendEmailTemplate): Promise<void> {
  const Component = TEMPLATES[template.id];
  // @ts-expect-error ts is not able to infer the right types for Component
  // and props, but the Template type will catch any errors when this function
  // is called
  const element = <Component {...template.props} />;

  const emailHtml = render(element, {
    pretty: true,
  });

  if (config.node.env === 'production') {
    await transport.sendMail({
      ...options,
      from: options.from ?? config.mailing.defaultFrom,
      subject: options.subject ?? Component.subject,
      html: emailHtml,
    });
  } else {
    logger.info(
      {
        subject: options.subject ?? Component.subject,
        html: emailHtml,
        ...options,
      },
      'Email sent'
    );
  }
}
