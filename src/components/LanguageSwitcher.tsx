import { useTranslation } from 'react-i18next';
import { type SupportedLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

const LANGUAGES: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'pt-BR', label: 'PT', flag: '🇧🇷' },
  { code: 'en', label: 'EN', flag: '🇺🇸' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language as SupportedLanguage;

  const toggle = () => {
    const next = current === 'pt-BR' ? 'en' : 'pt-BR';
    i18n.changeLanguage(next);
  };

  const next = LANGUAGES.find((l) => l.code !== current);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="text-muted-foreground hover:text-foreground h-8 gap-1.5 px-2 text-xs"
    >
      <span>{next?.flag}</span>
      <span>{next?.label}</span>
    </Button>
  );
}
