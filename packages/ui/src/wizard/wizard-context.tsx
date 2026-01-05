/* eslint-disable @typescript-eslint/no-floating-promises */
import { useRouter } from 'next/router';
import type { PropsWithChildren } from 'react';
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { z } from 'zod';

import type { WizardCompletionCallback } from './types';
import { WizardCompletionAction } from './types';

type CustomNavigation = {
  onNext?: () => void | Promise<void>;
  onBack?: () => void | Promise<void>;
};

type WizardContextType<TFormData, TResponse, TError> = {
  onNext: () => void;
  onBack: () => void;
  resetWizard: () => void;
  currentStep: number;
  formData: TFormData;
  updateFormData: <TStepKey extends keyof TFormData>(
    key: TStepKey,
    newData: TFormData[TStepKey]
  ) => void;
  isCompleted: boolean;
  customNavigation?: CustomNavigation;
  setCustomNavigation: (navigation: CustomNavigation) => void;
  completionResponse: TResponse;
  completionError: TError;
  onTryAgain: () => void;
};

type WizardProviderProps<TSchema extends z.ZodTypeAny, TResponse, TError> = {
  totalSteps: number;
  onCompleted: WizardCompletionCallback<TSchema, TResponse, TError>; // Callback for when the wizard is completed
} & PropsWithChildren;

const WizardContext = createContext<WizardContextType<
  unknown,
  unknown,
  unknown
> | null>(null);

export const WizardContextProvider = <
  TSchema extends z.ZodTypeAny,
  TResponse,
  TError = Error,
>({
  children,
  totalSteps,
  onCompleted,
}: WizardProviderProps<TSchema, TResponse, TError>): JSX.Element => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<z.infer<TSchema>>(
    {} as z.infer<TSchema>
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionResponse, setCompletionResponse] = useState<TResponse>();
  const [completionError, setCompletionError] = useState<TError>();
  const router = useRouter();

  // set custom navigation buttons functionality
  const [customNavigation, setCustomNavigation] = useState<CustomNavigation>(
    {}
  );

  // Update form data with new values from each step
  const updateFormData = useCallback(
    <TStepKey extends keyof z.infer<TSchema>>(
      key: TStepKey,
      newData: z.infer<TSchema>[TStepKey]
    ): void => {
      setFormData((prev) => ({
        ...prev,
        [key]: newData,
      }));
    },
    []
  );

  const resetWizard = useCallback((): void => {
    setCurrentStep(1);
    setIsCompleted(false);
    setFormData({} as z.infer<TSchema>); // Reset form data
    router.push({ query: { ...router.query, step: 1 } });
  }, [router]);

  // Validate and synchronize the current step with URL query parameters
  useEffect(() => {
    const queryStep = parseInt(router.query.step as string, 10);

    // If wizard is completed, don't update the step from URL
    if (isCompleted) return;

    // Check if the step is valid (within bounds and a number)
    if (Number.isNaN(queryStep) || queryStep < 1 || queryStep > totalSteps) {
      router.replace({ query: { ...router.query, step: 1 } });
      setCurrentStep(1);
    } else {
      setCurrentStep(queryStep);
    }
  }, [router.query.step, totalSteps, isCompleted, router]);

  const handleComplete = useCallback(async (): Promise<void> => {
    const result = await onCompleted(formData); // Pass final data to the completion callback
    if (result.action === WizardCompletionAction.goToSuccess) {
      setIsCompleted(true);
      setCompletionResponse(result.response);
      router.push({ query: { ...router.query, step: totalSteps } });
    } else if (result.action === WizardCompletionAction.goToError) {
      setCompletionError(result.error);
    }
  }, [formData, onCompleted, router, totalSteps]);

  const onNext = useCallback(async (): Promise<void> => {
    const nextStep = currentStep + 1;
    if (nextStep > totalSteps) {
      await handleComplete(); // Mark the wizard as completed
      return;
    }
    setCurrentStep(nextStep);
    router.push({ query: { ...router.query, step: nextStep } });
  }, [currentStep, handleComplete, router, totalSteps]);

  const onBack = useCallback((): void => {
    setCurrentStep((prev) => {
      const previousStep = prev - 1;
      router.push({ query: { ...router.query, step: previousStep } });
      return previousStep;
    });
  }, [router]);

  const onTryAgain = useCallback(() => {
    setCompletionError(undefined);
  }, []);

  const value = useMemo(
    () => ({
      onNext,
      onBack,
      resetWizard,
      currentStep,
      formData,
      updateFormData,
      isCompleted,
      customNavigation,
      setCustomNavigation,
      completionResponse,
      completionError,
      onTryAgain,
    }),
    [
      onNext,
      onBack,
      resetWizard,
      currentStep,
      formData,
      updateFormData,
      isCompleted,
      customNavigation,
      completionResponse,
      completionError,
      onTryAgain,
    ]
  );

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
};

export const useWizardContext = <
  TSchema extends z.ZodTypeAny,
  TResponse = object,
  TError = Error,
>(): WizardContextType<z.infer<TSchema>, TResponse, TError> => {
  const context = React.useContext(WizardContext) as WizardContextType<
    z.infer<TSchema>,
    TResponse,
    TError
  > | null;
  if (!context) {
    throw new Error('useWizardContext must be used within a WizardProvider');
  }
  return context;
};
