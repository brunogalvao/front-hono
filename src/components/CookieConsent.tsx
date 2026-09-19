import { useEffect, useState } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { Cookie } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  getAnalyticsConsent,
  loadGoogleAnalytics,
  saveAnalyticsConsent,
  trackPageView,
  type AnalyticsConsent,
} from '@/lib/analytics';
import { Button } from '@/components/ui/button';

export const OPEN_COOKIE_SETTINGS_EVENT = 'finance:open-cookie-settings';

export function CookieConsent() {
  const { t } = useTranslation('common');
  const locationHref = useRouterState({
    select: (state) => state.location.href,
  });
  const [consent, setConsent] = useState<AnalyticsConsent | null>(() =>
    getAnalyticsConsent()
  );
  const [isOpen, setIsOpen] = useState(() => consent === null);

  useEffect(() => {
    const openSettings = () => setIsOpen(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
    return () =>
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
  }, []);

  useEffect(() => {
    if (consent !== 'accepted') return;
    void loadGoogleAnalytics();
  }, [consent]);

  useEffect(() => {
    if (consent !== 'accepted') return;
    void trackPageView(locationHref);
  }, [consent, locationHref]);

  const chooseConsent = (choice: AnalyticsConsent) => {
    saveAnalyticsConsent(choice);
    setConsent(choice);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="border-border bg-background fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-2xl rounded-xl border p-5 shadow-lg sm:left-auto sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="bg-primary/10 text-primary-text flex size-10 shrink-0 items-center justify-center rounded-full">
          <Cookie aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="cookie-consent-title" className="text-base font-semibold">
            {t('cookies.title')}
          </h2>
          <p
            id="cookie-consent-description"
            className="text-muted-foreground mt-1 max-w-[65ch] text-sm leading-relaxed"
          >
            {t('cookies.description')}{' '}
            <a
              href="/privacidade"
              className="text-primary-text rounded-sm underline underline-offset-4 focus-visible:ring-2 focus-visible:outline-none"
            >
              {t('cookies.privacyLink')}
            </a>
          </p>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => chooseConsent('rejected')}
            >
              {t('cookies.reject')}
            </Button>
            <Button
              type="button"
              className="min-h-11"
              onClick={() => chooseConsent('accepted')}
            >
              {t('cookies.accept')}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
