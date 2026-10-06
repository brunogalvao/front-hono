import logoSrc from '@/assets/logo.svg';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: number;
  className?: string;
  iconClassName?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  accentClassName?: string;
}

const LOGO_ASPECT_RATIO = 293 / 238;

export function Logo({
  size = 32,
  className = '',
  iconClassName = '',
  showWordmark = true,
  wordmarkClassName = '',
  accentClassName = '',
}: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className={iconClassName}>
        <img
          src={logoSrc}
          height={size}
          width={Math.round(size * LOGO_ASPECT_RATIO)}
          alt="Task's Finance logo"
          style={{ height: size, width: 'auto' }}
        />
      </span>
      {showWordmark && (
        <span
          className={cn(
            'text-foreground text-base leading-none font-bold tracking-tight',
            wordmarkClassName
          )}
        >
          <span>Task&apos;s</span>{' '}
          <span className={cn('text-primary-text', accentClassName)}>
            Finance
          </span>
        </span>
      )}
    </div>
  );
}
