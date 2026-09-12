import { lazy, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { ArrowRight, ArrowUp, CheckCircle2 } from 'lucide-react';
import { DeferredContent } from '@/components/DeferredContent';
import Footer from '@/components/Footer';
import { GsapHeroTitle } from '@/components/GsapHeroTitle';
import { LandingNavbar } from '@/components/LandingNavbar';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const HowItWorks = lazy(() => import('@/components/HowItWorks'));
const FeaturesSection = lazy(() => import('@/components/FeaturesSection'));
const SocialProofSection = lazy(
  () => import('@/components/SocialProofSection')
);
const MidPageCta = lazy(() => import('@/components/MidPageCta'));
const DescriptionHome = lazy(() => import('@/components/DescriptionHome'));
const CtaFinal = lazy(() => import('@/components/CtaFinal'));

function Home() {
  const { t } = useTranslation('home');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <a
        href="#main-content"
        className="bg-background text-foreground focus-visible:ring-primary sr-only fixed top-3 left-3 z-[60] rounded-md px-4 py-2 focus:not-sr-only focus-visible:ring-2 focus-visible:outline-none"
      >
        {t('skipToContent')}
      </a>

      <LandingNavbar />

      <main
        id="main-content"
        className="container mx-auto flex flex-col px-4 pb-8"
      >
        <section
          id="home"
          className="flex min-h-[calc(100vh-56px)] flex-col justify-center gap-12 md:flex-row md:items-center"
        >
          <div className="flex w-full min-w-0 flex-col gap-1 md:w-[60%] md:gap-4">
            <h1 className="min-w-0">
              <GsapHeroTitle
                className="block w-full max-w-full text-[clamp(2rem,11vw,6rem)] leading-[0.98] font-bold tracking-[-0.035em] text-balance"
                text={t('hero.title')}
              />
            </h1>
            <p className="text-muted-foreground text-sm md:text-lg">
              {t('hero.headline')}
            </p>

            <div className="mt-2 flex min-w-0 flex-col gap-4">
              <Link
                to="/login"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'w-fit gap-2 rounded-full px-8'
                )}
              >
                {t('hero.cta')}
                <ArrowRight className="size-4" />
              </Link>

              <div className="flex min-w-0 flex-wrap gap-x-3 gap-y-2">
                {(['free', 'ai', 'noCard'] as const).map((key) => (
                  <span
                    key={key}
                    className="text-muted-foreground flex items-center gap-1.5 text-sm"
                  >
                    <CheckCircle2 className="text-primary size-4" />
                    {t(`hero.badges.${key}`)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="text-muted-foreground w-full max-w-[70ch] min-w-0 text-base text-pretty md:w-[40%] md:ps-8 md:text-end">
            {t('hero.description')}
          </p>
        </section>

        <section
          id="como-funciona"
          className="flex min-h-svh scroll-mt-16 flex-col justify-center"
        >
          <DeferredContent>
            <HowItWorks />
          </DeferredContent>
        </section>

        <section
          id="recursos"
          className="flex min-h-svh scroll-mt-16 flex-col justify-center gap-8 py-16 md:gap-10"
        >
          <DeferredContent>
            <FeaturesSection />
          </DeferredContent>
        </section>

        <section
          id="estatisticas"
          className="flex min-h-svh scroll-mt-16 flex-col items-center justify-center gap-8 py-16 md:gap-12"
        >
          <DeferredContent>
            <SocialProofSection />
          </DeferredContent>
        </section>

        <DeferredContent className="min-h-[20rem]">
          <MidPageCta />
        </DeferredContent>

        <section className="flex min-h-svh flex-col items-center justify-center py-16">
          <DeferredContent>
            <DescriptionHome />
          </DeferredContent>
        </section>

        <DeferredContent className="min-h-[20rem]">
          <CtaFinal />
        </DeferredContent>
      </main>

      <Footer />

      {showScrollTop && (
        <Button
          variant="outline"
          size="icon"
          aria-label={t('scrollTop')}
          className="fixed right-4 bottom-4 rounded-full shadow-md sm:right-8 sm:bottom-8"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowUp className="size-4" />
        </Button>
      )}
    </div>
  );
}

export default Home;
