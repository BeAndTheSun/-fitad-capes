import { Spinner } from '@meltstudio/theme';

export const Loading: React.FC = () => (
  <div className="flex h-screen w-screen items-center justify-center">
    <Spinner size="xlarge" />
  </div>
);
