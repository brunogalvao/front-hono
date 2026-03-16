import { motion } from 'framer-motion';
import { SlidingNumber } from '@/components/animate-ui/text/sliding-number';

const stats = [
  {
    value: 100,
    suffix: '%',
    label: 'Gratuito',
    description: 'Sem custos ocultos',
  },
  {
    value: 12,
    suffix: '',
    label: 'Meses de histórico',
    description: 'Visão anual completa',
  },
  {
    value: 3,
    suffix: 's',
    label: 'Para registrar',
    description: 'Receitas e despesas',
  },
  {
    value: 1,
    suffix: '',
    label: 'Lugar só',
    description: 'Para tudo que é seu',
  },
];

const StatsSection = () => {
  return (
    <section className="border-border w-full rounded-2xl border py-12">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="flex flex-col items-center gap-1 text-center"
          >
            <div className="text-primary flex items-end text-4xl font-bold">
              <SlidingNumber number={stat.value} inView />
              <span>{stat.suffix}</span>
            </div>
            <p className="text-sm font-semibold">{stat.label}</p>
            <p className="text-muted-foreground text-xs">{stat.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
