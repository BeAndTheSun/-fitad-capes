import Image from 'next/image';

import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSelector } from '@/ui/language-toggle';

export const AuthLayout: React.FC<React.PropsWithChildren> = (props) => {
  const { children } = props;

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="absolute right-10 top-4 md:right-16 md:top-8">
        <LanguageSelector />
      </div>
      <div className="absolute right-4 top-4 md:right-8 md:top-8">
        <ThemeToggle />
      </div>

      <div className="mx-auto flex w-full flex-col items-center justify-center space-y-6 p-8 sm:w-[350px] sm:p-0">
        <Image src="/logo.svg" alt="Logo" width={128} height={28} />

        {children}
      </div>
    </div>
  );
};
