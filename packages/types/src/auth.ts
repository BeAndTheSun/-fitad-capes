export enum AuthErrorCode {
  IncorrectUsernamePassword = 'incorrect-username-password',
  UserNotFound = 'user-not-found',
  IncorrectPassword = 'incorrect-password',
  UserMissingPassword = 'missing-password',
  TwoFactorDisabled = 'two-factor-disabled',
  TwoFactorAlreadyEnabled = 'two-factor-already-enabled',
  TwoFactorSetupRequired = 'two-factor-setup-required',
  SecondFactorRequired = 'second-factor-required',
  IncorrectTwoFactorCode = 'incorrect-two-factor-code',
  InternalServerError = 'internal-server-error',
  NewPasswordMatchesOld = 'new-password-matches-old',
  ThirdPartyIdentityProviderEnabled = 'third-party-identity-provider-enabled',
  // NextAuth.js errors
  CredentialsSignin = 'CredentialsSignin',
}

export enum TwoFactorProvider {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  AUTHENTICATOR = 'AUTHENTICATOR',
}

export const friendlyAuthErrorMessages: Record<string, string> = {
  [AuthErrorCode.IncorrectUsernamePassword]: 'Incorrect username or password',
  [AuthErrorCode.UserNotFound]: 'User not found',
  [AuthErrorCode.IncorrectPassword]: 'Incorrect password',
  [AuthErrorCode.UserMissingPassword]: 'User missing password',
  [AuthErrorCode.TwoFactorDisabled]: 'Two-factor authentication is disabled',
  [AuthErrorCode.TwoFactorAlreadyEnabled]:
    'Two-factor authentication is already enabled',
  [AuthErrorCode.TwoFactorSetupRequired]:
    'Two-factor authentication setup required',
  [AuthErrorCode.SecondFactorRequired]: 'Second factor required',
  [AuthErrorCode.IncorrectTwoFactorCode]:
    'Incorrect two-factor code, please try again',
  [AuthErrorCode.InternalServerError]: 'Internal server error',
  [AuthErrorCode.NewPasswordMatchesOld]: 'New password matches old password',
  [AuthErrorCode.ThirdPartyIdentityProviderEnabled]:
    'Third-party identity provider enabled',
  [AuthErrorCode.CredentialsSignin]: 'Incorrect username or password',
};

enum UserRoleEnum {
  ADMIN = 'admin',
  MEMBER = 'member',
  SUPER_ADMIN = 'super_admin',
}

export const userRoleList = Object.values(UserRoleEnum).filter(
  (r) => r !== UserRoleEnum.SUPER_ADMIN
);

export { UserRoleEnum };
