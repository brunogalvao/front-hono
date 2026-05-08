import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { type SupportedLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type Lang = SupportedLanguage;

const LANGS: { code: Lang; flag: string }[] = [
  { code: 'pt-BR', flag: '🇧🇷' },
  { code: 'en', flag: '🇺🇸' },
];

const flagVariants = {
  enter: { opacity: 0, scale: 0.5, rotate: -20 },
  center: { opacity: 1, scale: 1, rotate: 0 },
  exit: { opacity: 0, scale: 0.5, rotate: 20 },
};

export function AnimatedLanguageToggle() {
  const { i18n, t } = useTranslation('common');
  const current = i18n.language as Lang;
  const currentFlag = LANGS.find((l) => l.code === current)?.flag ?? '🇧🇷';

  return (
    <div className="flex w-full flex-col gap-2">
      {/* Animated flag + label */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="relative flex h-4 w-4 items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={current}
              variants={flagVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              className="absolute text-sm leading-none"
            >
              {currentFlag}
            </motion.span>
          </AnimatePresence>
        </div>
        <span>{t('language.toggle')}</span>
      </div>

      {/* Button group */}
      <div className="flex w-full overflow-hidden rounded-md border">
        {LANGS.map(({ code, flag }) => {
          const active = current === code;
          return (
            <button
              key={code}
              onClick={() => i18n.changeLanguage(code)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 py-1.5 text-xs transition-colors',
                active
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <span className="text-sm leading-none">{flag}</span>
              <span>{t(`language.${code}`)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
