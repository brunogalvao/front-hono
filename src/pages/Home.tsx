import { StarsBackground } from "@/components/animate-ui/backgrounds/stars";
import { MotionHighlight } from "@/components/animate-ui/effects/motion-highlight";
import { Bell } from "@/components/animate-ui/icons/bell";
import { Clock7 } from "@/components/animate-ui/icons/clock-7";
import { Cog } from "@/components/animate-ui/icons/cog";
import { Heart } from "@/components/animate-ui/icons/heart";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { LogIn } from "@/components/animate-ui/icons/log-in";
import { GradientText } from "@/components/animate-ui/text/gradient";
import { HighlightText } from "@/components/animate-ui/text/highlight";
import DescriptionHome from "@/components/DescriptionHome";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CARDS } from "@/data/cardsIntro";
import { textoChamada } from "@/data/textoTitulo";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

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
    navigate("/login");
  };

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 pb-8 flex gap-y-3 flex-col">
        <div className="flex justify-end py-2">
          <Button variant="link">
            <AnimateIcon animateOnHover animation="default-loop">
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  goLogin();
                }}
                className="text-white font-semibold py-2 px-4 rounded transition duration-300 flex items-center gap-3"
              >
                Login
                <LogIn className="size-6" />
              </Link>
            </AnimateIcon>
          </Button>
        </div>

        <Separator orientation="horizontal" />

        <div className="flex py-20 md:flex-row flex-col gap-3 items-center">
          <div className="flex w-full md:w-[60%] flex-col">
            <GradientText
              className="text-8xl font-bold mb-3 w-full capitalize"
              text={textoChamada[0].title}
            />
            <p className="text-gray-600 text-base">
              {textoChamada[0].tituloHeader}
            </p>
          </div>

          <p className="text-gray-600 mt-8 w-full md:w-[40%] md:ps-8 md:text-end text-center text-base">
            {textoChamada[0].textoHeader}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MotionHighlight hover className="rounded-2xl">
            {CARDS.map((card, idx) => {
              const IconComponent = ICONS[card.icons];
              const isLeft = idx % 2 === 0;

              return (
                <motion.div
                  key={card.title}
                  initial={{ x: isLeft ? "-50%" : "50%", opacity: 0 }}
                  whileInView={{ x: "0%", opacity: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                  <Card data-value={card.title} className="bg-transparent">
                    <CardContent>
                      <AnimateIcon animateOnHover>
                        <CardTitle className="flex flex-row items-center gap-3 mb-4">
                          <IconComponent
                            className="size-8 text-primary"
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
        <div className="h-80 flex flex-col gap-8 items-center text-xl justify-center relative">
          <StarsBackground className="absolute inset-0 flex items-center rounded-xl justify-center z-0" />

          <span className="font-bold z-10">Conheça agora mesmo</span>
          <span
            className="flex gap-3 z-10 cursor-pointer"
            onClick={goLogin}
            style={{ cursor: "pointer" }}
          >
            <HighlightText
              text="Faça o login"
              transition={{ duration: 4, ease: "easeInOut" }}
              inViewOnce
              className="py-2 px-16 font-bold cursor-pointer rounded-full hover:underline duration-200"
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
