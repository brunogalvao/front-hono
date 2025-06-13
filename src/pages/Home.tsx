import { BellOff } from "@/components/animate-ui/icons/bell-off";
import { Clock7 } from "@/components/animate-ui/icons/clock-7";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { LogIn } from "@/components/animate-ui/icons/log-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

function Home() {
  const ICONS = {
    Clock7,
    BellOff,
  } as const;

  type IconName = keyof typeof ICONS;

  const CARD: { title: string; description: string; icons: IconName }[] = [
    {
      title: "Título",
      description: "Uma pequena descrição",
      icons: "Clock7",
    },
    {
      title: "Outro Título",
      description: "Outra descrição",
      icons: "BellOff",
    },
  ];
  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-8 flex gap-y-3 flex-col">
        <div className="grid grid-cols-2">
          <h1 className="text-4xl font-bold mb-6 text-primary">Bem-vindo!</h1>
          <div className="flex justify-end">
            <Button variant="link">
              <AnimateIcon animateOnHover>
                <Link
                  to="/login"
                  className="text-white font-semibold py-2 px-4 rounded transition duration-300 flex items-center gap-3"
                >
                  Login
                  <LogIn />
                </Link>
              </AnimateIcon>
            </Button>
          </div>
        </div>
        <p className="text-gray-600">
          Esta é a página inicial do nosso sistema. Por favor, faça login para
          acessar o CRUD.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {CARD.map((item, index) => {
            const IconComponent = ICONS[item.icons];
            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-3">
                  <AnimateIcon animateOnHover animation="default">
                    <IconComponent />
                  </AnimateIcon>
                  <p>{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Home;
