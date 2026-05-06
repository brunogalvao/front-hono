import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SlidingNumber } from '@/components/animate-ui/text/sliding-number';

const STATS = [
  { key: 'free', value: 100, suffix: '%' },
  { key: 'months', value: 12, suffix: '' },
  { key: 'record', value: 3, suffix: 's' },
  { key: 'place', value: 1, suffix: '' },
] as const;

const StatsSection = () => {
  const { t } = useTranslation('home');

  return (
    <section className="border-border w-full rounded-2xl border py-12">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {STATS.map((stat, idx) => (
          <motion.div
            key={stat.key}
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
            <p className="text-sm font-semibold">{t(`stats.items.${stat.key}.label`)}</p>
            <p className="text-muted-foreground text-xs">{t(`stats.items.${stat.key}.description`)}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
