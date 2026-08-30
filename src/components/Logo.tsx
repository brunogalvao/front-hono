import logoSrc from '@/assets/logo.svg';

interface LogoProps {
  size?: number;
  className?: string;
  iconClassName?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

const LOGO_ASPECT_RATIO = 293 / 238;

export function Logo({
  size = 32,
  className = '',
  iconClassName = '',
  showWordmark = true,
  wordmarkClassName = '',
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
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
          className={`text-base leading-none font-bold tracking-tight ${wordmarkClassName}`}
        >
          Task's <span className="text-primary">Finance</span>
        </span>
      )}
    </div>
  );
}
