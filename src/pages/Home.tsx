import { StarsBackground } from '@/components/animate-ui/backgrounds/stars';
import { MotionHighlight } from '@/components/animate-ui/effects/motion-highlight';
import { Bell } from '@/components/animate-ui/icons/bell';
import { Clock7 } from '@/components/animate-ui/icons/clock-7';
import { Cog } from '@/components/animate-ui/icons/cog';
import { Heart } from '@/components/animate-ui/icons/heart';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { LogIn } from '@/components/animate-ui/icons/log-in';
import { GradientText } from '@/components/animate-ui/text/gradient';
import { HighlightText } from '@/components/animate-ui/text/highlight';
import CtaFinal from '@/components/CtaFinal';
import DescriptionHome from '@/components/DescriptionHome';
import Footer from '@/components/Footer';
import HowItWorks from '@/components/HowItWorks';
import StatsSection from '@/components/StatsSection';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CARDS } from '@/data/cardsIntro';
import { textoChamada } from '@/data/textoTitulo';
import { motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';

const ICONS = {
  Clock7,
  Bell,
  Heart,
  Cog,
} as const;

function Home() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto flex flex-col gap-y-8 px-4 pb-8">

        {/* Navbar */}
        <div className="flex justify-end py-2">
          <Button variant="link" asChild>
            <Link to="/login" className="flex items-center gap-3 font-semibold">
              Login
              <AnimateIcon animateOnHover animation="default-loop">
                <LogIn className="size-6" />
              </AnimateIcon>
            </Link>
          </Button>
        </div>

        <Separator orientation="horizontal" />

        {/* Hero */}
        <div className="flex min-h-[70vh] flex-col items-center gap-3 py-20 md:flex-row">
          <div className="flex w-full flex-col md:w-[60%]">
            <GradientText
              className="mb-3 w-full text-8xl font-bold"
              text={textoChamada[0].title}
            />
            <p className="text-muted-foreground text-base">
              {textoChamada[0].tituloHeader}
            </p>
          </div>

          <p className="mt-8 w-full text-center text-base text-muted-foreground md:w-[40%] md:ps-8 md:text-end">
            {textoChamada[0].textoHeader}
          </p>
        </div>

        {/* Como funciona */}
        <HowItWorks />

        {/* Feature Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <MotionHighlight hover className="rounded-2xl">
            {CARDS.map((card, idx) => {
              const IconComponent = ICONS[card.icons];
              const isLeft = idx % 2 === 0;

              return (
                <motion.div
                  key={card.title}
                  initial={{ x: isLeft ? '-50%' : '50%', opacity: 0 }}
                  whileInView={{ x: '0%', opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
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

        {/* Stats */}
        <StatsSection />

        {/* CTA antigo — link simples no meio da página */}
        <div className="relative flex h-48 flex-col items-center justify-center gap-8 text-xl">
          <StarsBackground className="absolute inset-0 z-0 flex items-center justify-center rounded-xl" />
          <span className="z-10 font-bold">Conheça agora mesmo</span>
          <Link to="/login" className="z-10">
            <HighlightText
              text="Faça o login"
              transition={{ duration: 4, ease: 'easeInOut' }}
              inViewOnce
              className="cursor-pointer rounded-full px-16 py-2 font-bold duration-200 hover:underline"
            />
          </Link>
        </div>

        {/* Description */}
        <DescriptionHome />

        {/* CTA Final */}
        <CtaFinal />

        <Footer />
      </div>
    </div>
  );
}

export default Home;
