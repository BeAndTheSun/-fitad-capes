import { Trans } from 'next-i18next';
import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import type { z } from 'zod';

import { Button } from '@/theme/index';

import { Stepper } from './stepper';
import type { WizardCompletionCallback } from './types';
import { useWizardContext, WizardContextProvider } from './wizard-context';
import type { StepProps } from './wizard-step';

type WizardComponent<TSchema extends z.ZodTypeAny, TResponse, TError> = Props<
  TSchema,
  TResponse,
  TError
> & {
  onCompleted: WizardCompletionCallback<TSchema, TResponse, TError>;
};

type Props<TSchema extends z.ZodTypeAny, TResponse, TError> = {
  children: React.ReactNode;
  renderCompletionComponent?: (
    data: z.infer<TSchema>,
    response: TResponse
  ) => ReactElement;
  renderErrorComponent?: (
    data: z.infer<TSchema>,
    error: TError,
    onTryAgain: () => void
  ) => ReactElement;
  finalButtonLabel?: ReactNode;
  completionLoading?: boolean;
};

const WizardContent = <TSchema extends z.ZodTypeAny, TResponse, TError>({
  children,
  finalButtonLabel,
  renderCompletionComponent,
  renderErrorComponent,
  completionLoading,
}: Props<TSchema, TResponse, TError>): JSX.Element => {
  const childrenStep = React.Children.toArray(children);
  const {
    currentStep,
    onNext,
    onBack,
    isCompleted,
    customNavigation,
    formData,
    completionResponse,
    completionError,
    onTryAgain,
  } = useWizardContext<z.infer<TSchema>, TResponse, TError>();
  const totalSteps = childrenStep.length;
  const isLastStep = currentStep === totalSteps;

  const isStepElement = (
    child: React.ReactNode
  ): child is ReactElement<StepProps> => {
    return React.isValidElement(child);
  };

  const defaultErrorComponent = (
    <div>
      <p className="mt-4">
        <Trans>An error has ocurred</Trans>
      </p>

      <p className="mt-4">
        <Trans>Please try again</Trans>
      </p>
      <Button onClick={onTryAgain}>
        <Trans>Return to wizard</Trans>
      </Button>
    </div>
  );

  // Extract labels from valid step elements
  const stepLabels = childrenStep
    .filter(isStepElement)
    .map((child) => child.props.label);

  // Extract onNext callback from valid step elements
  const onNextCallbacks = childrenStep
    .filter(isStepElement)
    .map((child) => child.props.onNext);

  const currentElement = useMemo(() => {
    const current = childrenStep[currentStep - 1];
    if (isStepElement(current)) {
      const clonedElement = React.cloneElement(current, {
        stepIndex: currentStep,
      });

      // Pass the stepIndex prop to the cloned element's children
      const childrenWithProps = React.Children.map(
        clonedElement.props.children,
        (child) =>
          isStepElement(child) &&
          React.cloneElement(child, { stepIndex: currentStep })
      );

      return React.cloneElement(clonedElement, { children: childrenWithProps });
    }
    return null;
  }, [childrenStep, currentStep]);

  let componentToShow = <div>{currentElement}</div>;
  if (isCompleted && renderCompletionComponent) {
    componentToShow = (
      <div className="mt-6">
        {renderCompletionComponent(formData, completionResponse)}
      </div>
    );
  } else if (completionError) {
    componentToShow = (
      <div className="mt-6">
        {renderErrorComponent?.(formData, completionError, onTryAgain) ??
          defaultErrorComponent}
      </div>
    );
  }

  const buttonLabel = useMemo(() => {
    let lastButtonLabel: ReactNode = <Trans>Complete</Trans>;
    if (finalButtonLabel) {
      lastButtonLabel = finalButtonLabel;
    }
    if (isLastStep) {
      return lastButtonLabel;
    }
    return <Trans>Next</Trans>;
  }, [isLastStep, finalButtonLabel]);

  return (
    <div className="mx-auto w-full px-4 py-8">
      {/* Step Progress Indicator */}
      <Stepper steps={stepLabels} isCompleted={isCompleted} />

      <div className="mb-8">
        {/* Show completionComponent if completed, otherwise show current step */}
        {componentToShow}
      </div>

      {/* Navigation Buttons */}
      {!isCompleted && !completionError && (
        <div className="flex justify-between">
          {currentStep > 1 ? (
            <Button
              onClick={async (): Promise<void> => {
                if (customNavigation?.onBack) {
                  await customNavigation.onBack();
                } else {
                  onBack();
                }
              }}
              className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-800 shadow-md hover:bg-gray-300"
            >
              <Trans>Back</Trans>
            </Button>
          ) : (
            <span />
          )}
          <Button
            onClick={async (): Promise<void> => {
              if (customNavigation?.onNext) {
                await customNavigation.onNext();
              } else {
                onNext();
                if (!isLastStep) {
                  onNextCallbacks[currentStep - 1]?.();
                }
              }
            }}
            loading={completionLoading}
            className="rounded-lg bg-primary px-4 py-2 font-semibold text-secondary shadow-md hover:bg-primary/60"
          >
            {buttonLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export const Wizard = <TSchema extends z.ZodTypeAny, TResponse, TError = Error>(
  props: WizardComponent<TSchema, TResponse, TError>
): JSX.Element => {
  const { children, onCompleted } = props;
  const childrenStep = React.Children.toArray(children);
  const totalSteps = childrenStep.length;
  return (
    <WizardContextProvider<z.infer<TSchema>, TResponse, TError>
      onCompleted={onCompleted}
      totalSteps={totalSteps}
    >
      <WizardContent<z.infer<TSchema>, TResponse, TError> {...props}>
        {children}
      </WizardContent>
    </WizardContextProvider>
  );
};
