import { useEffect, useState } from 'react';
import type { DefaultValues, FieldValues } from 'react-hook-form';
import type { z } from 'zod';

import type { FieldData } from '@/ui/form-hook-helper';
import { useFormHelper } from '@/ui/form-hook-helper';

import { useWizardContext } from './wizard-context';

export type WizardFormStepProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSchema extends z.Schema<any, any>,
  TFieldValues extends FieldValues,
> = {
  label: string;
  schema: TSchema;
  fields: FieldData<TFieldValues>[];
  defaultValues: DefaultValues<TFieldValues>;
  stepKey: string;
  // eslint-disable-next-line react/no-unused-prop-types
  stepIndex?: number;
};

export const WizardFormStep = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSchema extends z.Schema<any, any>,
  TFieldValues extends FieldValues,
>({
  label,
  schema,
  fields,
  defaultValues,
  stepKey,
  stepIndex,
}: WizardFormStepProps<TSchema, TFieldValues>): JSX.Element => {
  const {
    updateFormData,
    formData,
    setCustomNavigation,
    currentStep,
    onNext,
    onBack,
  } = useWizardContext<z.infer<TSchema>>();

  const [shouldProceed, setShouldProceed] = useState(false);

  const { formComponent, form } = useFormHelper(
    {
      schema,
      fields,
      onSubmit: () => {},
      customSubmit: true,
    },
    {
      defaultValues:
        (formData[stepKey] as DefaultValues<TFieldValues>) || defaultValues,
    }
  );

  useEffect(() => {
    if (shouldProceed) {
      onNext();
      setShouldProceed(false); // Reset the flag after calling onNext
    }
    return () => {
      setShouldProceed(false); // Reset the flag when leaving the step
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, shouldProceed, stepKey]); // Re-run whenever formData or shouldProceed changes

  useEffect(() => {
    const handleNexSubmit = (values: z.infer<TSchema>): void => {
      updateFormData(stepKey, values);
      // Set the flag to trigger onNext after the form data has been updated
      setShouldProceed(true);
    };

    const handleBackSubmit = (values: z.infer<TSchema>): void => {
      updateFormData(stepKey, values);
    };

    if (currentStep === stepIndex) {
      setCustomNavigation({
        onNext: async () => {
          await form.handleSubmit(handleNexSubmit)();
        },
        onBack: () => {
          // not calling form.handleSubmit to avoid validations
          handleBackSubmit(form.getValues());
          onBack();
        },
      });
    }

    // Cleanup function to reset navigation when leaving the step
    return () => {
      if (currentStep === stepIndex) {
        setCustomNavigation({ onNext: undefined, onBack: undefined });
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, currentStep, stepIndex, stepKey]);
  return (
    <div className="mx-auto flex w-1/2 flex-col items-center justify-center gap-4">
      <h2 className="text-lg font-bold">{label}</h2>
      {formComponent}
    </div>
  );
};
