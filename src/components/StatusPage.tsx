import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, House } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';

interface StatusPageProps {
  code: string;
  title: string;
  description: string;
  icon: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  backLabel: string;
  homeLabel: string;
}

export function StatusPage({
  code,
  title,
  description,
  icon,
  onRetry,
  retryLabel,
  backLabel,
  homeLabel,
}: StatusPageProps) {
  return (
    <main className="bg-background text-foreground flex min-h-svh items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-xl flex-col items-center text-center">
        <Logo size={52} wordmarkClassName="text-xl sm:text-2xl" />
        <div className="bg-primary/10 text-primary-text mt-10 flex size-14 items-center justify-center rounded-full">
          {icon}
        </div>
        <p className="text-primary-text mt-6 text-sm font-semibold">{code}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.025em] text-balance sm:text-4xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-4 max-w-[60ch] text-base leading-relaxed text-pretty">
          {description}
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {onRetry && retryLabel ? (
            <Button onClick={onRetry} className="min-h-11 px-6">
              {retryLabel}
            </Button>
          ) : null}
          <Button asChild variant="outline" className="min-h-11 px-6">
            <Link to="/">
              <House aria-hidden="true" />
              {homeLabel}
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="min-h-11 px-6"
            onClick={() => window.history.back()}
          >
            <ArrowLeft aria-hidden="true" />
            {backLabel}
          </Button>
        </div>
      </div>
    </main>
  );
}
