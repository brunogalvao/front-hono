import { motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StarsBackground } from '@/components/animate-ui/backgrounds/stars';

const CtaFinal = () => {
  const { t } = useTranslation('home');

  return (
    <section className="relative overflow-hidden rounded-2xl py-20">
      <StarsBackground className="absolute inset-0 z-0 rounded-2xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center gap-6 text-center"
      >
        <h2 className="text-4xl font-bold text-white md:text-5xl">
          {t('ctaFinal.title')}
        </h2>
        <p className="text-zinc-400 max-w-md text-base">
          {t('ctaFinal.subtitle')}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild className="gap-2 px-8">
            <Link to="/login">
              {t('ctaFinal.start')}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="gap-2 px-8 border-zinc-600 text-white hover:bg-zinc-800 hover:text-white">
            <Link to="/login">
              {t('ctaFinal.hasAccount')}
            </Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
};

export default CtaFinal;
