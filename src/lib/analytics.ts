export const ANALYTICS_CONSENT_STORAGE_KEY = 'finance-analytics-consent';

export type AnalyticsConsent = 'accepted' | 'rejected';

type GtagCommand = [command: string, ...args: unknown[]];

declare global {
  interface Window {
    dataLayer?: GtagCommand[];
    gtag?: (...args: GtagCommand) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

let analyticsLoadPromise: Promise<boolean> | undefined;

function getMeasurementId() {
  const measurementId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID?.trim();
  return measurementId && /^G-[A-Z0-9]+$/.test(measurementId)
    ? measurementId
    : undefined;
}

export function getAnalyticsConsent(): AnalyticsConsent | null {
  const consent = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
  return consent === 'accepted' || consent === 'rejected' ? consent : null;
}

function configureDataLayer() {
  window.dataLayer ??= [];
  window.gtag ??= (...args: GtagCommand) => window.dataLayer?.push(args);
}

export function saveAnalyticsConsent(consent: AnalyticsConsent) {
  window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);

  const measurementId = getMeasurementId();
  if (consent === 'rejected' && measurementId) {
    window[`ga-disable-${measurementId}`] = true;
    window.gtag?.('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  }
}

export function loadGoogleAnalytics(): Promise<boolean> {
  const measurementId = getMeasurementId();
  if (!measurementId || getAnalyticsConsent() !== 'accepted') {
    return Promise.resolve(false);
  }

  if (analyticsLoadPromise) return analyticsLoadPromise;

  analyticsLoadPromise = new Promise((resolve) => {
    configureDataLayer();
    window[`ga-disable-${measurementId}`] = false;
    window.gtag?.('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500,
    });

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[data-google-analytics="${measurementId}"]`
    );

    const finishSetup = () => {
      window.gtag?.('js', new Date());
      window.gtag?.('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
      window.gtag?.('config', measurementId, {
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        send_page_view: false,
      });
      resolve(true);
    };

    if (existingScript) {
      finishSetup();
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.googleAnalytics = measurementId;
    script.addEventListener('load', finishSetup, { once: true });
    script.addEventListener('error', () => resolve(false), { once: true });
    document.head.append(script);
  });

  return analyticsLoadPromise;
}

export async function trackPageView(path: string) {
  const measurementId = getMeasurementId();
  if (!measurementId || !(await loadGoogleAnalytics())) return;

  window.gtag?.('event', 'page_view', {
    page_location: new URL(path, window.location.origin).href,
    page_path: path,
    page_title: document.title,
  });
}
