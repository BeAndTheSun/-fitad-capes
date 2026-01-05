// {} is needed here to mirror react types
// eslint-disable-next-line @typescript-eslint/ban-types
export type EmailTemplate<P = {}> = React.FC<P> & {
  subject?: string;
  PreviewProps?: P;
};
