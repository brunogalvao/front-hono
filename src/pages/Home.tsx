import { useTranslation } from 'react-i18next';
import { MotionHighlight } from '@/components/animate-ui/effects/motion-highlight';
import { Bell } from '@/components/animate-ui/icons/bell';
import { BellOff } from '@/components/animate-ui/icons/bell-off';
import { Clock7 } from '@/components/animate-ui/icons/clock-7';
import { Cog } from '@/components/animate-ui/icons/cog';
import { Heart } from '@/components/animate-ui/icons/heart';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { RefreshCcw } from '@/components/animate-ui/icons/refresh-ccw';
import { GsapHeroTitle } from '@/components/GsapHeroTitle';
import { HighlightText } from '@/components/animate-ui/text/highlight';
import CtaFinal from '@/components/CtaFinal';
import DescriptionHome from '@/components/DescriptionHome';
import Footer from '@/components/Footer';
import HowItWorks from '@/components/HowItWorks';
import { LandingNavbar } from '@/components/LandingNavbar';
import StatsSection from '@/components/StatsSection';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Quote, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const ICONS = { Clock7, Bell, Heart, Cog, BellOff, RefreshCcw } as const;

type CardKey =
  | 'register'
  | 'deadlines'
  | 'history'
  | 'insights'
  | 'alerts'
  | 'sync';

const CARD_ICONS: { key: CardKey; icon: keyof typeof ICONS }[] = [
  { key: 'register', icon: 'Clock7' },
  { key: 'deadlines', icon: 'Bell' },
  { key: 'history', icon: 'Cog' },
  { key: 'insights', icon: 'Heart' },
  { key: 'alerts', icon: 'BellOff' },
  { key: 'sync', icon: 'RefreshCcw' },
];

const TESTIMONIAL_KEYS = ['ana', 'carlos', 'juliana'] as const;
const BENEFIT_KEYS = ['1', '2', '3', '4'] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-primary/10 text-primary mb-4 inline-block rounded-full px-4 py-1 text-sm font-medium">
      {children}
    </span>
  );
}

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
      <LandingNavbar />

      <div className="container mx-auto flex flex-col px-4 pb-8">
        {/* Hero */}
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

        {/* Como funciona */}
        <section
          id="como-funciona"
          className="flex min-h-svh scroll-mt-16 flex-col justify-center"
        >
          <HowItWorks />
        </section>

        {/* Recursos */}
        <section
          id="recursos"
          className="flex min-h-svh scroll-mt-16 flex-col justify-center gap-8 py-16 md:gap-10"
        >
          <div className="text-center">
            <SectionLabel>{t('features.label')}</SectionLabel>
            <h2 className="text-2xl font-bold text-balance sm:text-3xl">
              {t('features.title')}
            </h2>
            <p className="text-muted-foreground mt-2 text-base">
              {t('features.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MotionHighlight hover className="rounded-2xl">
              {CARD_ICONS.map(({ key, icon }, idx) => {
                const IconComponent = ICONS[icon];
                const isLeft = idx % 2 === 0;
                return (
                  <motion.div
                    key={key}
                    initial={{ x: isLeft ? '-30%' : '30%', opacity: 0 }}
                    whileInView={{ x: '0%', opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 1.2,
                      ease: 'easeInOut',
                      delay: idx * 0.05,
                    }}
                  >
                    <Card data-value={key} className="bg-transparent">
                      <CardContent>
                        <AnimateIcon animateOnHover>
                          <CardTitle className="mb-4 flex flex-row items-center gap-3">
                            <IconComponent
                              className="text-primary size-8"
                              animate="default"
                            />
                            {t(`features.cards.${key}.title`)}
                          </CardTitle>
                        </AnimateIcon>
                        <CardDescription>
                          {t(`features.cards.${key}.description`)}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </MotionHighlight>
          </div>
        </section>

        {/* Estatísticas */}
        <section
          id="estatisticas"
          className="flex min-h-svh scroll-mt-16 flex-col items-center justify-center gap-8 py-16 md:gap-12"
        >
          <div className="text-center">
            <SectionLabel>{t('stats.label')}</SectionLabel>
            <h2 className="text-2xl font-bold text-balance sm:text-3xl">
              {t('stats.title')}
            </h2>
            <p className="text-muted-foreground mt-2 text-base">
              {t('stats.subtitle')}
            </p>
          </div>

          <StatsSection />

          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
            {TESTIMONIAL_KEYS.map((key, idx) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="flex flex-col gap-4 pt-6">
                    <Quote className="text-primary size-5 opacity-60" />
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t(`testimonials.items.${key}.text`)}
                    </p>
                    <div className="mt-auto">
                      <p className="text-sm font-semibold">
                        {t(`testimonials.items.${key}.name`)}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {t(`testimonials.items.${key}.role`)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA intermediário */}
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

        {/* Description */}
        <section className="flex min-h-svh flex-col items-center justify-center py-16">
          <DescriptionHome />
        </section>

        {/* CTA Final */}
        <CtaFinal />
      </div>

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
