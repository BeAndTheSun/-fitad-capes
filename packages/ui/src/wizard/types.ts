import type { z } from 'zod';

export enum WizardCompletionAction {
  goToSuccess = 'goToSuccess',
  goToError = 'goToError',
  doNothing = 'doNothing',
}

export type WizardCompletionResult<TResponse, TError> =
  | { action: WizardCompletionAction.goToSuccess; response: TResponse }
  | {
      action: WizardCompletionAction.goToError;
      error: TError;
    }
  | { action: WizardCompletionAction.doNothing };

export type WizardCompletionCallback<
  TSchema extends z.ZodTypeAny,
  TResponse,
  TError,
> = (
  data: z.infer<TSchema>
) =>
  | WizardCompletionResult<TResponse, TError>
  | Promise<WizardCompletionResult<TResponse, TError>>;
