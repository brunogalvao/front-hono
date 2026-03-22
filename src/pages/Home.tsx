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
import { CARDS } from '@/data/cardsIntro';
import { textoChamada } from '@/data/textoTitulo';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Quote, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const ICONS = {
  Clock7,
  Bell,
  Heart,
  Cog,
  BellOff,
  RefreshCcw,
} as const;

const HERO_BADGES = [
  '100% Gratuito',
  'Insights com IA',
  'Sem cartão de crédito',
];

const TESTIMONIALS = [
  {
    name: 'Ana Lima',
    role: 'Freelancer',
    text: 'Finalmente consigo ver pra onde meu dinheiro vai todo mês. Simples e muito rápido de usar.',
  },
  {
    name: 'Carlos Mendes',
    role: 'Empreendedor',
    text: 'Os insights automáticos me ajudaram a cortar gastos que eu nem sabia que tinha. Recomendo muito.',
  },
  {
    name: 'Juliana Costa',
    role: 'Professora',
    text: 'Uso todo mês para fechar as contas. A interface é limpa e nunca trava. Perfeito.',
  },
];

const CTA_BENEFITS = [
  'Registre receitas e despesas em segundos',
  'Histórico completo mês a mês',
  'Recomendações inteligentes baseadas no seu perfil',
  'Acesso imediato, sem burocracia',
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-primary/10 text-primary mb-4 inline-block rounded-full px-4 py-1 text-sm font-medium">
      {children}
    </span>
  );
}

function Home() {
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
              text={textoChamada[0].title}
            />
            <p className="text-muted-foreground text-lg">
              {textoChamada[0].tituloHeader}
            </p>

            <div className="mt-2 flex flex-col gap-4">
              <Link
                to="/login"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'w-fit gap-2 rounded-full px-8'
                )}
              >
                Começar agora
                <ArrowRight className="size-4" />
              </Link>

              <div className="flex flex-wrap gap-3">
                {HERO_BADGES.map((badge) => (
                  <span
                    key={badge}
                    className="text-muted-foreground flex items-center gap-1.5 text-sm"
                  >
                    <CheckCircle2 className="text-primary size-4" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="text-muted-foreground w-full text-base md:w-[40%] md:ps-8 md:text-end">
            {textoChamada[0].textoHeader}
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
            <SectionLabel>Funcionalidades</SectionLabel>
            <h2 className="text-3xl font-bold">Tudo que você precisa</h2>
            <p className="text-muted-foreground mt-2 text-base">
              Ferramentas simples para um controle financeiro poderoso.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MotionHighlight hover className="rounded-2xl">
              {CARDS.map((card, idx) => {
                const IconComponent = ICONS[card.icons];
                const isLeft = idx % 2 === 0;

                return (
                  <motion.div
                    key={card.title}
                    initial={{ x: isLeft ? '-30%' : '30%', opacity: 0 }}
                    whileInView={{ x: '0%', opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 1.2,
                      ease: 'easeInOut',
                      delay: idx * 0.05,
                    }}
                  >
                    <Card data-value={card.title} className="bg-transparent">
                      <CardContent>
                        <AnimateIcon animateOnHover>
                          <CardTitle className="mb-4 flex flex-row items-center gap-3">
                            <IconComponent
                              className="text-primary size-8"
                              animate="default"
                            />
                            {card.title}
                          </CardTitle>
                        </AnimateIcon>
                        <CardDescription>{card.description}</CardDescription>
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
            <SectionLabel>Números</SectionLabel>
            <h2 className="text-3xl font-bold">Números que falam por si</h2>
            <p className="text-muted-foreground mt-2 text-base">
              Simples, rápido e gratuito desde o primeiro dia.
            </p>
          </div>

          <StatsSection />

          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="flex flex-col gap-4 pt-6">
                    <Quote className="text-primary size-5 opacity-60" />
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t.text}
                    </p>
                    <div className="mt-auto">
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-muted-foreground text-xs">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA intermediário */}
        <div className="border-border relative flex h-svh flex-col items-center justify-center gap-8 overflow-hidden rounded-2xl border">
          {/* dot grid */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--color-primary) 20%, transparent) 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />
          {/* radial fade overlay */}
          <div className="from-background via-background/50 absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_30%,var(--tw-gradient-stops))]" />

          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
            <span className="text-foreground text-3xl font-bold">
              Pronto para começar?
            </span>
            <p className="text-muted-foreground max-w-md text-sm">
              Junte-se a quem já usa o FinanceTask para organizar as finanças
              com praticidade e inteligência.
            </p>

            <ul className="flex flex-col gap-2">
              {CTA_BENEFITS.map((b) => (
                <li
                  key={b}
                  className="text-muted-foreground flex items-center gap-2 text-sm"
                >
                  <CheckCircle2 className="text-primary size-4 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>

            <Link to="/login">
              <HighlightText
                text="Faça o login"
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
