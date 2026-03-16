import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { DemoPreview } from './DemoPreview';

const FEATURES = [
  'Registre receitas e despesas em segundos',
  'Gráfico de evolução financeira mensal',
  'Insights automáticos com IA',
  'Histórico completo e organizado',
];

const DescriptionHome = () => {
  return (
    <div className="flex w-full flex-col items-center gap-12">
      {/* Heading centrado */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-3 text-center"
      >
        <span className="bg-primary/10 text-primary rounded-full px-4 py-1 text-sm font-medium">
          O app em ação
        </span>
        <h2 className="max-w-xl text-4xl font-bold leading-tight">
          Simples de usar,{' '}
          <span className="text-primary">poderoso</span> no resultado
        </h2>
        <p className="text-muted-foreground max-w-lg text-base">
          Veja como é fácil registrar, acompanhar e entender suas finanças em
          um só lugar — sem planilhas, sem complicação.
        </p>
      </motion.div>

      {/* Demo em destaque */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="w-full max-w-2xl"
        style={{
          filter: 'drop-shadow(0 24px 48px color-mix(in oklch, var(--color-primary) 15%, transparent))',
        }}
      >
        <DemoPreview />
      </motion.div>

      {/* Feature pills abaixo */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-wrap justify-center gap-3"
      >
        {FEATURES.map((f) => (
          <span
            key={f}
            className="border-border text-muted-foreground flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm"
          >
            <CheckCircle2 className="text-primary size-3.5 shrink-0" />
            {f}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default DescriptionHome;
