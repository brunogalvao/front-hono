import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import StatsSection from '@/components/StatsSection';
import { Card, CardContent } from '@/components/ui/card';

const TESTIMONIAL_KEYS = ['ana', 'carlos', 'juliana'] as const;

export default function SocialProofSection() {
  const { t } = useTranslation('home');

  return (
    <>
      <div className="text-center">
        <span className="bg-primary/10 text-primary-text mb-4 inline-block rounded-full px-4 py-1 text-sm font-medium">
          {t('stats.label')}
        </span>
        <h2 className="text-2xl font-bold text-balance sm:text-3xl">
          {t('stats.title')}
        </h2>
        <p className="text-muted-foreground mt-2 text-base">
          {t('stats.subtitle')}
        </p>
      </div>

      <StatsSection />

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
        {TESTIMONIAL_KEYS.map((key, idx) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="flex flex-col gap-4 pt-6">
                <Quote className="text-primary size-5 opacity-60" />
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(`testimonials.items.${key}.text`)}
                </p>
                <div className="mt-auto">
                  <p className="text-sm font-semibold">
                    {t(`testimonials.items.${key}.name`)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t(`testimonials.items.${key}.role`)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </>
  );
}
