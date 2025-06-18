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
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const ICONS = {
    Clock7,
    Bell,
    Heart,
    Cog,
  } as const;

  type IconName = keyof typeof ICONS;

  const CARDS: { title: string; description: string; icons: IconName }[] = [
    {
      title: "Registre na hora",
      description: "Adicione receitas e despesas rapidamente, sem complicação.",
      icons: "Clock7",
    },
    {
      title: "Aqui para te lembras",
      description:
        "Mantenha suas tarefas financeiras organizadas e nunca perca um compromisso.",
      icons: "Bell",
    },
    {
      title: "Controle de tudo",
      description:
        "Gerencie suas finanças com ferramentas intuitivas e completas.",
      icons: "Cog",
    },
    {
      title: "Você vai adorar",
      description:
        "Experimente uma plataforma feita para facilitar sua vida financeira.",
      icons: "Heart",
    },
  ];

  const navigate = useNavigate();

  const goLogin = () => {
    navigate("/login", { state: { textoHeader } });
  };

  const tituloHeader = "Gerencie suas finanças de forma simples e eficiente.";
  const textoHeader =
    "Task’s Finance é uma plataforma que organiza suas receitas, despesas e tarefas financeiras mensais em um só lugar. Acompanhe seus gastos, visualize seus rendimentos e mantenha o controle do seu orçamento com clareza e praticidade.";

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 pb-8 flex gap-y-3 flex-col">
        <div className="flex justify-end py-2">
          <Button variant="link">
            <AnimateIcon animateOnHover>
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

        <div className="flex py-20 flex-row gap-3 items-center">
          <div className="flex w-[60%] flex-col">
            <GradientText
              className="text-8xl font-bold mb-3 w-full"
              text="Task's Finance"
            />
            <p className="text-gray-600 text-base">{tituloHeader}</p>
          </div>

          <p className="text-gray-600 mt-8 w-[40%] ps-8 text-end text-base">
            {textoHeader}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MotionHighlight hover className="rounded-2xl">
            {CARDS.map((card) => {
              const IconComponent = ICONS[card.icons];
              return (
                <Card
                  key={card.title}
                  data-value={card.title}
                  className="bg-transparent"
                >
                  <CardContent>
                    <AnimateIcon animateOnHover>
                      <CardTitle className="flex flex-row items-center gap-3 mb-4">
                        <IconComponent
                          className="size-8 text-primary"
                          animate="default"
                        />
                        {/* <span className="text-xl w-full">{card.title}</span> */}
                        {card.title}
                      </CardTitle>
                    </AnimateIcon>
                    <CardDescription>{card.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </MotionHighlight>
        </div>

        {/* Target */}
        <div className="h-48 flex flex-row gap-3 items-center text-xl justify-center relative">
          <StarsBackground className="absolute inset-0 flex items-center justify-center rounded-xl -z-10" />
          <span className="font-bold">Conheça agora mesmo</span>
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              goLogin();
            }}
          >
            <HighlightText
              text="Faça o login"
              inViewOnce
              className="px-8 py-1 font-bold cursor-pointer hover:underline"
            />
          </Link>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default Home;
