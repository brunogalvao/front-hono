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
import DescriptionHome from '@/components/DescriptionHome';
import Footer from '@/components/Footer';
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
import { Link, useNavigate } from '@tanstack/react-router';

function Home() {
  // icon
  const ICONS = {
    Clock7,
    Bell,
    Heart,
    Cog,
  } as const;

  const navigate = useNavigate();

  const goLogin = () => {
    navigate({ to: '/login' });
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto flex flex-col gap-y-3 px-4 pb-8">
        <div className="flex justify-end py-2">
          <Button variant="link">
            <AnimateIcon animateOnHover animation="default-loop">
              <Link
                to="/login"
                onClick={(e) => {
                  e.preventDefault();
                  goLogin();
                }}
                className="flex items-center gap-3 rounded px-4 py-2 font-semibold text-white transition duration-300"
              >
                Login
                <LogIn className="size-6" />
              </Link>
            </AnimateIcon>
          </Button>
        </div>

        <Separator orientation="horizontal" />

        <div className="flex min-h-[70vh] flex-col items-center gap-3 py-20 md:flex-row">
          <div className="flex w-full flex-col md:w-[60%]">
            <GradientText
              className="mb-3 w-full text-8xl font-bold capitalize"
              text={textoChamada[0].title}
            />
            <p className="text-base text-gray-600">
              {textoChamada[0].tituloHeader}
            </p>
          </div>

          <p className="mt-8 w-full text-center text-base text-gray-600 md:w-[40%] md:ps-8 md:text-end">
            {textoChamada[0].textoHeader}
          </p>
        </div>

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
                  viewport={{ once: false }}
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

        {/* Target */}
        <div className="relative flex h-80 flex-col items-center justify-center gap-8 text-xl">
          <StarsBackground className="absolute inset-0 z-0 flex items-center justify-center rounded-xl" />

          <span className="z-10 font-bold">Conheça agora mesmo</span>
          <span
            className="z-10 flex cursor-pointer gap-3"
            onClick={goLogin}
            style={{ cursor: 'pointer' }}
          >
            <HighlightText
              text="Faça o login"
              transition={{ duration: 4, ease: 'easeInOut' }}
              inViewOnce
              className="cursor-pointer rounded-full px-16 py-2 font-bold duration-200 hover:underline"
            />
          </span>
        </div>

        {/* Description */}
        <DescriptionHome />

        <Footer />
      </div>
    </div>
  );
}

export default Home;
