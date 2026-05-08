import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system';

const THEMES: Theme[] = ['system', 'light', 'dark'];

const ICONS: Record<Theme, React.ElementType> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const iconVariants = {
  enter: { opacity: 0, rotate: -30, scale: 0.5 },
  center: { opacity: 1, rotate: 0, scale: 1 },
  exit: { opacity: 0, rotate: 30, scale: 0.5 },
};

export function AnimatedThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation('common');

  const Icon = ICONS[theme as Theme] ?? Monitor;

  return (
    <div className="flex w-full flex-col gap-2">
      {/* Animated icon + label */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="relative flex h-4 w-4 items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              variants={iconVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              className="absolute"
            >
              <Icon className="size-4" />
            </motion.div>
          </AnimatePresence>
        </div>
        <span>{t('theme.toggle')}</span>
      </div>

      {/* Button group */}
      <div className="flex w-full overflow-hidden rounded-md border">
        {THEMES.map((t_) => {
          const active = theme === t_;
          const BtnIcon = ICONS[t_];
          return (
            <button
              key={t_}
              onClick={() => setTheme(t_)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 py-1.5 text-xs transition-colors',
                active
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <BtnIcon className="size-3.5 shrink-0" />
              <span>{t(`theme.${t_}`)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
