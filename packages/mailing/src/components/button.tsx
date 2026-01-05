import { Button } from '@react-email/components';
import clsx from 'clsx';

import { colors } from '@/mailing/theme';

type ButtonProps = React.ComponentProps<typeof Button>;

export const EmailButton: React.FC<ButtonProps> = (props) => {
  const { children, className, ...rest } = props;
  return (
    <Button
      className={clsx(className)}
      style={{
        backgroundColor: colors.primary,
        color: colors.primaryForeground,
        borderRadius: '6px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '500',
        textDecoration: 'none',
        display: 'inline-block',
        textAlign: 'center',
        verticalAlign: 'middle',
        lineHeight: '1.4',
        minHeight: '40px',
        boxSizing: 'border-box',
        border: 'none',
        cursor: 'pointer',
      }}
      {...rest}
    >
      {children}
    </Button>
  );
};
