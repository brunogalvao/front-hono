import { motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StarsBackground } from '@/components/animate-ui/backgrounds/stars';

const CtaFinal = () => {
  const { t } = useTranslation('home');

  return (
    <section className="relative overflow-hidden rounded-2xl px-5 py-14 sm:px-8 sm:py-20">
      <StarsBackground className="absolute inset-0 z-0 rounded-2xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-5 text-center sm:gap-6"
      >
        <h2 className="text-[clamp(2rem,9vw,3rem)] leading-[1.08] font-bold tracking-[-0.035em] text-balance text-white">
          {t('ctaFinal.title')}
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-pretty text-zinc-300 sm:text-base">
          {t('ctaFinal.subtitle')}
        </p>

        <div className="mt-2 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
          <Button
            size="lg"
            asChild
            className="min-h-12 w-full gap-2 px-8 sm:w-auto"
          >
            <Link to="/login">
              {t('ctaFinal.start')}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="min-h-12 w-full border-white bg-white px-8 text-zinc-950 hover:bg-zinc-100 hover:text-zinc-950 sm:w-auto"
          >
            <Link to="/login">{t('ctaFinal.hasAccount')}</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
};

export default CtaFinal;
