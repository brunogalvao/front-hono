import { Separator } from "./ui/separator";

import img01 from "@/assets/tela-inicial.png";

const DescriptionHome = () => {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 my-8">
      <div className="w-full p-3 flex flex-col space-y-3 text-end">
        <h1 className="text-3xl font-bold">Bem-Vindo ao FinanceTask</h1>
        <p className="text-gray-600">
          Gerencie suas finanças de forma simples, rápida e inteligente. Aqui,
          você pode registrar receitas e despesas em poucos cliques, acompanhar
          seu saldo em tempo real e nunca mais esquecer um compromisso
          financeiro. Nossa plataforma foi criada para facilitar sua vida: com
          ferramentas intuitivas, lembretes automáticos e um visual moderno,
          você tem o controle total do seu dinheiro na palma da mão.
        </p>
        <span className="font-bold">
          Comece agora mesmo e descubra como é fácil organizar sua vida
          financeira!
        </span>
      </div>
      <Separator orientation="vertical" className="h-12 mx-4" />
      <div className="relative w-fit inline-block">
        <img className="rounded-2xl" src={img01} alt="FinanceTask" />
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))",
          }}
        />
      </div>
    </div>
  );
};

export default DescriptionHome;
