import clsx from 'clsx';

import { EmailText } from './text';

type HeadingProps = {
  className?: string;
  children: React.ReactNode;
};

export const Heading: React.FC<HeadingProps> = ({ className, children }) => {
  return (
    <EmailText className={clsx('font-sans text-xl font-normal', className)}>
      {children}
    </EmailText>
  );
};
