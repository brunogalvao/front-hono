import { Link } from '@tanstack/react-router';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { OPEN_COOKIE_SETTINGS_EVENT } from '@/components/CookieConsent';

export default function PrivacyPage() {
  const { t } = useTranslation('common');

  return (
    <main className="container mx-auto min-h-svh max-w-3xl px-4 py-10 sm:py-16">
      <Logo size={48} wordmarkClassName="text-xl sm:text-2xl" />
      <div className="mt-10 flex items-center gap-3">
        <span className="bg-primary/10 text-primary-text flex size-12 items-center justify-center rounded-full">
          <ShieldCheck aria-hidden="true" className="size-6" />
        </span>
        <div>
          <p className="text-primary-text text-sm font-semibold">
            {t('privacy.eyebrow')}
          </p>
          <h1 className="text-3xl font-bold tracking-[-0.025em] text-balance sm:text-4xl">
            {t('privacy.title')}
          </h1>
        </div>
      </div>

      <p className="text-muted-foreground mt-6 leading-relaxed">
        {t('privacy.introduction')}
      </p>

      <div className="mt-10 space-y-8">
        {(['essential', 'analytics', 'errors', 'control'] as const).map(
          (section) => (
            <section key={section} aria-labelledby={`privacy-${section}`}>
              <h2
                id={`privacy-${section}`}
                className="text-xl font-semibold text-balance"
              >
                {t(`privacy.sections.${section}.title`)}
              </h2>
              <p className="text-muted-foreground mt-2 leading-relaxed text-pretty">
                {t(`privacy.sections.${section}.description`)}
              </p>
            </section>
          )
        )}
      </div>

      <div className="mt-10 flex flex-col gap-3 border-t pt-6 sm:flex-row">
        <Button asChild variant="outline" className="min-h-11">
          <Link to="/">
            <ArrowLeft aria-hidden="true" />
            {t('privacy.back')}
          </Link>
        </Button>
        <Button
          type="button"
          className="min-h-11"
          onClick={() =>
            window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))
          }
        >
          {t('privacy.manage')}
        </Button>
      </div>
    </main>
  );
}
