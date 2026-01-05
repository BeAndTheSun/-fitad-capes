import { ThemeToggle as ThemeToggleUI } from '@meltstudio/ui';
import { useTheme } from 'next-themes';

export const ThemeToggle: React.FC = () => {
  const { setTheme } = useTheme();

  return <ThemeToggleUI setTheme={setTheme} />;
};
