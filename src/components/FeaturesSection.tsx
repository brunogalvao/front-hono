import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MotionHighlight } from '@/components/animate-ui/effects/motion-highlight';
import { Bell } from '@/components/animate-ui/icons/bell';
import { BellOff } from '@/components/animate-ui/icons/bell-off';
import { Clock7 } from '@/components/animate-ui/icons/clock-7';
import { Cog } from '@/components/animate-ui/icons/cog';
import { Heart } from '@/components/animate-ui/icons/heart';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { RefreshCcw } from '@/components/animate-ui/icons/refresh-ccw';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';

const ICONS = { Clock7, Bell, Heart, Cog, BellOff, RefreshCcw } as const;

type CardKey =
  | 'register'
  | 'deadlines'
  | 'history'
  | 'insights'
  | 'alerts'
  | 'sync';

const CARD_ICONS: { key: CardKey; icon: keyof typeof ICONS }[] = [
  { key: 'register', icon: 'Clock7' },
  { key: 'deadlines', icon: 'Bell' },
  { key: 'history', icon: 'Cog' },
  { key: 'insights', icon: 'Heart' },
  { key: 'alerts', icon: 'BellOff' },
  { key: 'sync', icon: 'RefreshCcw' },
];

export default function FeaturesSection() {
  const { t } = useTranslation('home');

  return (
    <>
      <div className="text-center">
        <span className="bg-primary/10 text-primary-text mb-4 inline-block rounded-full px-4 py-1 text-sm font-medium">
          {t('features.label')}
        </span>
        <h2 className="text-2xl font-bold text-balance sm:text-3xl">
          {t('features.title')}
        </h2>
        <p className="text-muted-foreground mt-2 text-base">
          {t('features.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MotionHighlight hover className="rounded-2xl">
          {CARD_ICONS.map(({ key, icon }, idx) => {
            const IconComponent = ICONS[icon];
            const isLeft = idx % 2 === 0;
            return (
              <motion.div
                key={key}
                initial={{ x: isLeft ? '-30%' : '30%', opacity: 0 }}
                whileInView={{ x: '0%', opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 1.2,
                  ease: 'easeInOut',
                  delay: idx * 0.05,
                }}
              >
                <Card data-value={key} className="bg-transparent">
                  <CardContent>
                    <AnimateIcon animateOnHover>
                      <CardTitle className="mb-4 flex flex-row items-center gap-3">
                        <IconComponent
                          className="text-primary size-8"
                          animate="default"
                        />
                        {t(`features.cards.${key}.title`)}
                      </CardTitle>
                    </AnimateIcon>
                    <CardDescription>
                      {t(`features.cards.${key}.description`)}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </MotionHighlight>
      </div>
    </>
  );
}
