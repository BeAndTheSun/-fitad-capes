import { Text } from '@react-email/components';

type TextProps = {
  maxWidth?: number;
} & React.ComponentProps<typeof Text>;

export const EmailText: React.FC<TextProps> = (props) => {
  const { children, maxWidth, ...extra } = props;

  if (maxWidth) {
    return (
      <Text {...extra}>
        <div style={{ maxWidth }}>{children}</div>
      </Text>
    );
  }
  return <Text {...extra}>{children}</Text>;
};
