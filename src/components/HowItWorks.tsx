import { motion } from 'framer-motion';
import { UserPlus, PencilLine, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STEP_ICONS = [UserPlus, PencilLine, BarChart3];
const STEP_KEYS = ['1', '2', '3'] as const;

const HowItWorks = () => {
  const { t } = useTranslation('home');

  return (
    <section className="py-16">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold">{t('howItWorks.title')}</h2>
        <p className="text-muted-foreground mt-2 text-base">{t('howItWorks.subtitle')}</p>
      </div>

      <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="absolute top-10 hidden h-px w-full bg-linear-to-r from-transparent via-border to-transparent md:block" />

        {STEP_KEYS.map((key, idx) => {
          const Icon = STEP_ICONS[idx];
          const step = String(idx + 1).padStart(2, '0');
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="relative flex flex-col items-center gap-4 text-center"
            >
              <div className="bg-background border-border relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-2">
                <Icon className="text-primary size-8" />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {step}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">{t(`howItWorks.steps.${key}.title`)}</h3>
                <p className="text-muted-foreground text-sm">{t(`howItWorks.steps.${key}.description`)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWorks;
