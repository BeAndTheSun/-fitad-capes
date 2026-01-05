import { apiHooks } from './zodios';

export function useSignUp(): ReturnType<typeof apiHooks.useSignUp> {
  return apiHooks.useSignUp();
}

export function useSendPasswordRecoveryEmail(): ReturnType<
  typeof apiHooks.useSendPasswordRecoveryEmail
> {
  return apiHooks.useSendPasswordRecoveryEmail();
}

export function useRecoverPassword(): ReturnType<
  typeof apiHooks.useRecoverPassword
> {
  return apiHooks.useRecoverPassword();
}

export function useChangePassword(): ReturnType<
  typeof apiHooks.useChangePassword
> {
  return apiHooks.useChangePassword();
}

export function useSetup2fa(): ReturnType<typeof apiHooks.useSetup2fa> {
  return apiHooks.useSetup2fa();
}

export function useEnable2fa(): ReturnType<typeof apiHooks.useEnable2fa> {
  return apiHooks.useEnable2fa();
}

export function useDisable2fa(): ReturnType<typeof apiHooks.useDisable2fa> {
  return apiHooks.useDisable2fa();
}

export function useVerify2fa(): ReturnType<typeof apiHooks.useVerify2fa> {
  return apiHooks.useVerify2fa();
}

export function useSenTwoFactorAuthEmail(): ReturnType<
  typeof apiHooks.useSenTwoFactorAuthEmail
> {
  return apiHooks.useSenTwoFactorAuthEmail();
}
