import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/Logo';
import { OPEN_COOKIE_SETTINGS_EVENT } from '@/components/CookieConsent';
import { Separator } from '@/components/ui/separator';

const AIVISION_LOGO_URL =
  'https://assets.aivision.app.br/aivision/logo-aivision-branca.svg';

const Footer = () => {
  const { t } = useTranslation('home');

  return (
    <footer className="bg-zinc-950 px-4 py-12 text-white">
      <div className="flex w-full flex-col justify-center gap-6 sm:flex-row">
        <div className="container flex flex-col items-center justify-center sm:items-end">
          <Logo
            size={30}
            iconClassName="rounded-lg p-2"
            wordmarkClassName="text-xl text-white sm:text-2xl"
            accentClassName="text-violet-300"
          />
        </div>

        <Separator className="sm:hidden" />
        <Separator
          orientation="vertical"
          className="hidden self-stretch data-[orientation=vertical]:h-auto sm:block"
        />

        <div className="flex w-full items-center justify-center sm:justify-start">
          <div className="flex flex-row items-center gap-6 text-center text-xs leading-relaxed text-zinc-300 sm:text-sm">
            <div className="flex max-w-sm flex-col items-center gap-1">
              <a
                href="https://aivision.app.br/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`AI Vision Technology — ${t('footer.visitAiVision')}`}
                className="flex items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:outline-none"
              >
                <span className="flex size-8 items-center justify-center">
                  <img
                    src={AIVISION_LOGO_URL}
                    alt=""
                    width="16"
                    height="20"
                    loading="lazy"
                    className="h-7 w-auto"
                  />
                </span>

                <span className="flex flex-col items-start">
                  <strong className="text-sm leading-none font-semibold">
                    AI Vision
                  </strong>
                  <span className="mt-1 text-[0.5625rem] leading-none tracking-[0.08em] text-zinc-400">
                    TECHNOLOGY
                  </span>
                </span>
              </a>
            </div>

            <div className="flex flex-col gap-0">
              <small>{t('footer.copyright')}</small>
              <button
                type="button"
                className="min-h-6 rounded-sm hover:text-white focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none"
                onClick={() =>
                  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))
                }
              >
                {t('footer.manageCookies')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
