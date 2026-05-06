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

type CardKey = 'register' | 'deadlines' | 'history' | 'insights' | 'alerts' | 'sync';

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
          <div className="flex w-full flex-col gap-4 md:w-[60%]">
            <GsapHeroTitle
              className="w-full text-7xl font-bold md:text-8xl"
              text={t('hero.title')}
            />
            <p className="text-muted-foreground text-lg">{t('hero.headline')}</p>

            <div className="mt-2 flex flex-col gap-4">
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

              <div className="flex flex-wrap gap-3">
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

          <p className="text-muted-foreground w-full text-base md:w-[40%] md:ps-8 md:text-end">
            {t('hero.description')}
          </p>
        </section>

        {/* Como funciona */}
        <section
          id="como-funciona"
          className="flex h-svh scroll-mt-16 flex-col justify-center"
        >
          <HowItWorks />
        </section>

        {/* Recursos */}
        <section
          id="recursos"
          className="flex h-svh scroll-mt-16 flex-col justify-center gap-10"
        >
          <div className="text-center">
            <SectionLabel>{t('features.label')}</SectionLabel>
            <h2 className="text-3xl font-bold">{t('features.title')}</h2>
            <p className="text-muted-foreground mt-2 text-base">{t('features.description')}</p>
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
                    transition={{ duration: 1.2, ease: 'easeInOut', delay: idx * 0.05 }}
                  >
                    <Card data-value={key} className="bg-transparent">
                      <CardContent>
                        <AnimateIcon animateOnHover>
                          <CardTitle className="mb-4 flex flex-row items-center gap-3">
                            <IconComponent className="text-primary size-8" animate="default" />
                            {t(`features.cards.${key}.title`)}
                          </CardTitle>
                        </AnimateIcon>
                        <CardDescription>{t(`features.cards.${key}.description`)}</CardDescription>
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
          className="flex h-svh scroll-mt-16 flex-col items-center justify-center gap-12"
        >
          <div className="text-center">
            <SectionLabel>{t('stats.label')}</SectionLabel>
            <h2 className="text-3xl font-bold">{t('stats.title')}</h2>
            <p className="text-muted-foreground mt-2 text-base">{t('stats.subtitle')}</p>
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
                      <p className="text-sm font-semibold">{t(`testimonials.items.${key}.name`)}</p>
                      <p className="text-muted-foreground text-xs">{t(`testimonials.items.${key}.role`)}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA intermediário */}
        <div className="border-border relative flex h-svh flex-col items-center justify-center gap-8 overflow-hidden rounded-2xl border">
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--color-primary) 20%, transparent) 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="from-background via-background/50 absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_30%,var(--tw-gradient-stops))]" />

          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
            <span className="text-foreground text-3xl font-bold">{t('cta.title')}</span>
            <p className="text-muted-foreground max-w-md text-sm">{t('cta.subtitle')}</p>

            <ul className="flex flex-col gap-2">
              {BENEFIT_KEYS.map((key) => (
                <li key={key} className="text-muted-foreground flex items-center gap-2 text-sm">
                  <CheckCircle2 className="text-primary size-4 shrink-0" />
                  {t(`cta.benefits.${key}`)}
                </li>
              ))}
            </ul>

            <Link to="/login">
              <HighlightText
                text={t('cta.login')}
                transition={{ duration: 4, ease: 'easeInOut' }}
                inViewOnce
                className="cursor-pointer rounded-full px-16 py-2 font-bold duration-200 hover:underline"
              />
            </Link>
          </div>
        </div>

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
          className="fixed right-8 bottom-8 rounded-full shadow-md"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowUp className="size-4" />
        </Button>
      )}
    </div>
  );
}

export default Home;
