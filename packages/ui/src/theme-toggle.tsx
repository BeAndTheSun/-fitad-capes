'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@meltstudio/theme';
import { LaptopIcon, MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { Trans } from 'next-i18next';

type ThemeToggleProps = {
  setTheme: (theme: string) => void;
};

export const ThemeToggle: React.FC<ThemeToggleProps> = (props) => {
  const { setTheme } = props;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <SunIcon className="rotate-0 scale-100 transition-all hover:text-slate-900 dark:-rotate-90 dark:scale-0 dark:text-slate-400 dark:hover:text-slate-100" />
          <MoonIcon className="absolute rotate-90 scale-0 transition-all hover:text-slate-900 dark:rotate-0 dark:scale-100 dark:text-slate-400 dark:hover:text-slate-100" />
          <span className="sr-only">
            <Trans>Toggle theme</Trans>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" forceMount>
        <DropdownMenuItem onClick={(): void => setTheme('light')}>
          <SunIcon className="mr-2 size-4" />
          <span>
            <Trans>Light</Trans>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(): void => setTheme('dark')}>
          <MoonIcon className="mr-2 size-4" />
          <span>
            <Trans>Dark</Trans>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(): void => setTheme('system')}>
          <LaptopIcon className="mr-2 size-4" />
          <span>
            <Trans>System</Trans>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
