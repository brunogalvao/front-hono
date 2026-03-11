import { motion } from 'framer-motion';
import { UserPlus, PencilLine, BarChart3 } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Crie sua conta',
    description:
      'Cadastre-se gratuitamente em segundos. Sem cartão de crédito, sem burocracia.',
  },
  {
    icon: PencilLine,
    step: '02',
    title: 'Registre suas finanças',
    description:
      'Adicione receitas, despesas e tarefas financeiras com poucos cliques. Organize tudo por mês.',
  },
  {
    icon: BarChart3,
    step: '03',
    title: 'Acompanhe seus resultados',
    description:
      'Visualize seu saldo, histórico mensal e receba insights inteligentes para melhorar sua saúde financeira.',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold">Como funciona</h2>
        <p className="text-muted-foreground mt-2 text-base">
          Em três passos simples você já está no controle.
        </p>
      </div>

      <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* linha conectando os passos — apenas desktop */}
        <div className="absolute top-10 hidden h-px w-full bg-gradient-to-r from-transparent via-border to-transparent md:block" />

        {steps.map((item, idx) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.15 }}
            className="relative flex flex-col items-center gap-4 text-center"
          >
            <div className="bg-background border-border relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-2">
              <item.icon className="text-primary size-8" />
              <span className="text-primary absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {item.step}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
