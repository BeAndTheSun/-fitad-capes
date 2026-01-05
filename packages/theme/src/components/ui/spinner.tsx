import React from 'react';

import { cn } from '@/theme/utils';

type SpinnerProps = {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  color?: string;
};

const Spinner: React.FC<SpinnerProps> = ({
  size = 'small',
  color = 'border-primary',
}) => {
  const spinnerClass = cn(
    'inline-block border-solid rounded-full animate-spin',
    {
      'w-4 h-4 border-2': size === 'small',
      'w-8 h-8 border-4': size === 'medium',
      'w-12 h-12 border-4': size === 'large',
      'w-16 h-16 border-4': size === 'xlarge',
    },
    color,
    ' border-t-transparent'
  );

  return <div className={spinnerClass} />;
};

export { Spinner };
