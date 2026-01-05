import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@meltstudio/theme';
import { GlobeIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/router';

export const LanguageSelector: React.FC = () => {
  const router = useRouter();

  const changeLanguage = async (locale: string): Promise<void> => {
    localStorage.setItem('locale', locale);
    const currentPath = router.asPath;
    await router.push(currentPath, currentPath, { locale });
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <GlobeIcon style={{ marginRight: '4px' }} />
          <span>{router.locale === 'en' ? 'EN' : 'ES'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" forceMount>
        <DropdownMenuItem onClick={(): Promise<void> => changeLanguage('en')}>
          <span>EN</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(): Promise<void> => changeLanguage('es')}>
          <span>ES</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
