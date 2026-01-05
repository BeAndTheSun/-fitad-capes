import type { Text } from '@react-email/components';
import type { CSSProperties } from 'react';

import { colors } from '@/mailing/theme';

type HrefProps = {
  href?: string | undefined;
  target?: string | undefined;
  rel?: string | undefined;
};

type LinkProps = HrefProps & React.ComponentProps<typeof Text>;

const getHrefPropsFromProps = (props: LinkProps): HrefProps => {
  return {
    href: props.href,
    rel: props.rel,
    target: props.target,
  };
};

const getStylePropsFromProps = (props: CSSProperties): CSSProperties => {
  return {
    color: props.color,
    fontFamily: props.fontFamily,
    fontSize: props.fontSize,
    fontStyle: props.fontStyle,
    fontWeight: props.fontWeight,
    letterSpacing: props.letterSpacing,
    height: props.height,
    textDecoration: props.textDecoration,
    textTransform: props.textTransform,
    alignContent: props.alignContent,
  };
};

export const Link: React.FC<LinkProps> = (props) => {
  const { children, ...extra } = props;

  return (
    <a
      target="_blank"
      rel="noopener"
      {...getHrefPropsFromProps(extra)}
      style={{
        color: colors.blue600,
        ...getStylePropsFromProps(extra),
      }}
    >
      {children}
    </a>
  );
};
