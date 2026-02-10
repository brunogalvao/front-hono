import { Separator } from './ui/separator';

import img01 from '@/assets/tela-inicial.png';

const DescriptionHome = () => {
  return (
    <div className="my-8 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
      <div className="flex w-full flex-col space-y-3 p-3 text-end">
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
      <Separator orientation="vertical" className="mx-4 h-12" />
      <div className="relative inline-block w-fit">
        <img className="rounded-2xl" src={img01} alt="FinanceTask" />
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))',
          }}
        />
      </div>
    </div>
  );
};

export default DescriptionHome;
