/* eslint-disable react/no-unused-prop-types */
import type { FC } from 'react';
import React from 'react';

export type StepProps = {
  children: React.ReactNode;
  label: string;
  onNext?: () => void;
  stepIndex?: number;
};
export const WizardStep: FC<StepProps> = ({ children, label }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">{label}</h2>
      {children}
    </div>
  );
};
