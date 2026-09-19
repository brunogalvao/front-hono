let sentryLoadPromise:
  | Promise<typeof import('@sentry/react') | null>
  | undefined;

async function loadSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN?.trim();
  if (!dsn || !import.meta.env.PROD) return null;

  sentryLoadPromise ??= import('@sentry/react').then((Sentry) => {
    if (!Sentry.isInitialized()) {
      Sentry.init({
        dsn,
        environment: import.meta.env.MODE,
        release: import.meta.env.VITE_APP_VERSION,
        sendDefaultPii: false,
        tracesSampleRate: 0,
      });
    }
    return Sentry;
  });

  return sentryLoadPromise;
}

export async function initializeMonitoring() {
  await loadSentry();
}

export async function reportError(
  error: unknown,
  context?: Record<string, unknown>
) {
  const Sentry = await loadSentry();
  if (!Sentry) return;

  Sentry.captureException(error, context ? { extra: context } : undefined);
}
