import { CheckIcon } from '@radix-ui/react-icons';
import React from 'react';

import { useWizardContext } from './wizard-context';

type StepperProps = {
  steps: string[];
  isCompleted: boolean;
};

const Stepper: React.FC<StepperProps> = ({ steps, isCompleted }) => {
  const {
    currentStep,
    onNext,
    onBack,
    customNavigation,
    completionError,
    onTryAgain,
  } = useWizardContext();

  const handleStepClick = async (stepIndex: number): Promise<void> => {
    if (stepIndex > currentStep && !completionError) {
      // User is moving forward
      if (customNavigation?.onNext) {
        await customNavigation.onNext();
      } else {
        onNext();
      }
    } else if (stepIndex < currentStep) {
      // User is moving backward
      if (customNavigation?.onBack) {
        await customNavigation.onBack();
      } else {
        onBack();
      }
      onTryAgain();
    }
  };

  return (
    <nav aria-label="Progress" className="pb-6">
      <ol className="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0">
        {steps.map((step, index) => {
          const stepIndex = index + 1;
          const isStepCompleted = stepIndex < currentStep || isCompleted;
          const isActive = stepIndex === currentStep && !isCompleted;

          return (
            <li key={step} className="relative md:flex md:flex-1">
              {((): JSX.Element => {
                if (isStepCompleted) {
                  return (
                    <button
                      type="button"
                      onClick={async (): Promise<void> => {
                        await handleStepClick(stepIndex);
                      }}
                      className="group flex w-full items-center"
                    >
                      <span className="flex items-center px-6 py-4 text-sm font-medium">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary group-hover:bg-primary/80">
                          <CheckIcon
                            aria-hidden="true"
                            className="size-6 text-secondary"
                          />
                        </span>
                        <span className="ml-4 text-sm font-medium text-primary">
                          {step}
                        </span>
                      </span>
                    </button>
                  );
                }
                if (isActive) {
                  return (
                    <button
                      type="button"
                      onClick={async (): Promise<void> => {
                        await handleStepClick(stepIndex);
                      }}
                      aria-current="step"
                      className="flex items-center px-6 py-4 text-sm font-medium"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-primary">
                        <span className="text-primary">{stepIndex}</span>
                      </span>
                      <span className="ml-4 text-sm font-medium text-primary">
                        {step}
                      </span>
                    </button>
                  );
                }
                return (
                  <button
                    type="button"
                    onClick={async (): Promise<void> => {
                      await handleStepClick(stepIndex);
                    }}
                    className="group flex items-center"
                  >
                    <span className="flex items-center px-6 py-4 text-sm font-medium">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-secondary group-hover:border-secondary/60">
                        <span className="text-primary group-hover:text-primary/60">
                          {stepIndex}
                        </span>
                      </span>
                      <span className="ml-4 text-sm font-medium text-primary group-hover:text-primary/60">
                        {step}
                      </span>
                    </span>
                  </button>
                );
              })()}

              {index !== steps.length - 1 ? (
                <>
                  {/* Arrow separator for lg screens and up */}
                  <div
                    aria-hidden="true"
                    className="absolute right-0 top-0 hidden h-full w-5 md:block"
                  >
                    <svg
                      fill="none"
                      viewBox="0 0 22 80"
                      preserveAspectRatio="none"
                      className="size-full text-gray-300"
                    >
                      <path
                        d="M0 -2L20 40L0 82"
                        stroke="currentcolor"
                        vectorEffect="non-scaling-stroke"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export { Stepper };
