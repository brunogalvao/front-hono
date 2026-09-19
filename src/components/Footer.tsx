import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/Logo';
import { OPEN_COOKIE_SETTINGS_EVENT } from '@/components/CookieConsent';

const AIVISION_LOGO_URL =
  'https://assets.aivision.app.br/aivision/logo-aivision-branca.svg';

const Footer = () => {
  const { t } = useTranslation('home');

  return (
    <footer className="bg-zinc-950 px-4 pt-6 pb-[max(5rem,env(safe-area-inset-bottom))] text-white sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="container mx-auto flex flex-row items-center justify-center gap-6">
        <Logo
          size={42}
          iconClassName="rounded-lg p-2"
          wordmarkClassName="text-xl text-white sm:text-2xl"
        />

        <div className="flex max-w-sm flex-col items-center gap-3 border-l border-white/10">
          {/*<span className="text-xs text-zinc-400 w-full">{t('footer.productBy')}</span>*/}

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
                className="h-5 w-auto"
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
      </div>

      <div className="flex justify-center">
        <div className="flex w-full flex-col items-center gap-2 text-center text-xs leading-relaxed text-zinc-300 sm:text-sm">
          <small>{t('footer.copyright')}</small>
          <button
            type="button"
            className="min-h-6 rounded-sm underline underline-offset-4 hover:text-white focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none"
            onClick={() =>
              window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))
            }
          >
            {t('footer.manageCookies')}
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
