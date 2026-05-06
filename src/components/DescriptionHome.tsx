import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DemoPreview } from './DemoPreview';

const FEATURE_KEYS = ['1', '2', '3', '4'] as const;

const DescriptionHome = () => {
  const { t } = useTranslation('home');

  return (
    <div className="flex w-full flex-col items-center gap-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-3 text-center"
      >
        <span className="bg-primary/10 text-primary rounded-full px-4 py-1 text-sm font-medium">
          {t('description.label')}
        </span>
        <h2 className="max-w-xl text-4xl font-bold leading-tight">
          {t('description.title')}{' '}
          <span className="text-primary">{t('description.titleHighlight')}</span>{' '}
          {t('description.titleSuffix')}
        </h2>
        <p className="text-muted-foreground max-w-lg text-base">
          {t('description.subtitle')}
        </p>
      </motion.div>

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

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-wrap justify-center gap-3"
      >
        {FEATURE_KEYS.map((key) => (
          <span
            key={key}
            className="border-border text-muted-foreground flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm"
          >
            <CheckCircle2 className="text-primary size-3.5 shrink-0" />
            {t(`description.features.${key}`)}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default DescriptionHome;
