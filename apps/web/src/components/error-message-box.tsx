import type { FC } from 'react';

type Props = {
  error: string;
};
const ErrorMessageBox: FC<Props> = ({ error }) => (
  <div className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
    <span className="block sm:inline">{error}</span>
  </div>
);

export { ErrorMessageBox };
