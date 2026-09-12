import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { CheckCircle2 } from 'lucide-react';
import { HighlightText } from '@/components/animate-ui/text/highlight';

const BENEFIT_KEYS = ['1', '2', '3', '4'] as const;

export default function MidPageCta() {
  const { t } = useTranslation('home');

  return (
    <section className="border-border relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border px-5 py-14 sm:px-8 sm:py-20 md:min-h-[70svh]">
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--color-primary) 20%, transparent) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="from-background via-background/50 absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_30%,var(--tw-gradient-stops))]" />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center gap-5 text-center sm:gap-6">
        <h2 className="text-foreground text-3xl leading-tight font-bold tracking-[-0.03em] text-balance sm:text-4xl">
          {t('cta.title')}
        </h2>
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed text-pretty sm:text-base">
          {t('cta.subtitle')}
        </p>

        <ul className="flex w-full max-w-xl flex-col gap-3 text-left">
          {BENEFIT_KEYS.map((key) => (
            <li
              key={key}
              className="text-muted-foreground flex items-start gap-3 text-sm leading-relaxed sm:text-base"
            >
              <CheckCircle2 className="text-primary mt-0.5 size-5 shrink-0" />
              <span>{t(`cta.benefits.${key}`)}</span>
            </li>
          ))}
        </ul>

        <Link
          to="/login"
          className="focus-visible:ring-primary mt-2 inline-flex min-h-12 w-full max-w-sm items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <HighlightText
            text={t('cta.login')}
            transition={{ duration: 4, ease: 'easeInOut' }}
            inViewOnce
            className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-full px-8 py-3 font-bold duration-200 hover:underline"
          />
        </Link>
      </div>
    </section>
  );
}
