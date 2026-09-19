import { useEffect } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

const SITE_URL = 'https://finance.aivision.app.br';
const INDEXABLE_PATHS = new Set(['/', '/privacidade']);
const KNOWN_PATHS = new Set([
  '/',
  '/login',
  '/register',
  '/privacidade',
  '/auth/callback',
  '/auth/reset-password',
  '/auth/accept-invite',
  '/auth/workspace-invite',
]);

function isKnownPath(pathname: string) {
  return (
    KNOWN_PATHS.has(pathname) ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/invite/')
  );
}

function setMeta(selector: string, attribute: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    const [name, property] = selector
      .replace(/^meta\[|\]$/g, '')
      .split('=')
      .map((part) => part.replace(/"/g, ''));
    element.setAttribute(name, property);
    document.head.append(element);
  }
  element.setAttribute(attribute, value);
}

export function RouteMetadata() {
  const { t, i18n } = useTranslation('common');
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    const isHome = pathname === '/';
    const isPrivacy = pathname === '/privacidade';
    const isNotFound = !isKnownPath(pathname);
    const title = isHome
      ? "Task's Finance"
      : isPrivacy
        ? t('seo.privacyTitle')
        : isNotFound
          ? t('seo.notFoundTitle')
          : t('seo.appTitle');
    const description = isPrivacy
      ? t('seo.privacyDescription')
      : t('seo.description');
    const canonicalUrl = new URL(
      INDEXABLE_PATHS.has(pathname) ? pathname : '/',
      SITE_URL
    ).href;

    document.title = title;
    document.documentElement.lang = i18n.resolvedLanguage ?? 'pt-BR';
    setMeta('meta[name="description"]', 'content', description);
    setMeta(
      'meta[name="robots"]',
      'content',
      INDEXABLE_PATHS.has(pathname) ? 'index, follow' : 'noindex, nofollow'
    );
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);

    const canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    );
    canonical?.setAttribute('href', canonicalUrl);
  }, [i18n.resolvedLanguage, pathname, t]);

  return null;
}
