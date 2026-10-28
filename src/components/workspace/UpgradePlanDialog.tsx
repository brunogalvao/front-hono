import { CheckCircle2, Crown, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UpgradePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: 'workspaces' | 'members' | 'categories';
}

export function UpgradePlanDialog({
  open,
  onOpenChange,
  feature,
}: UpgradePlanDialogProps) {
  const { t } = useTranslation(['workspace', 'common']);

  const benefits = [
    t('upgrade.benefits.workspaces'),
    t('upgrade.benefits.members'),
    t('upgrade.benefits.categories'),
    t('upgrade.benefits.settings'),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
              <Crown className="size-5" aria-hidden="true" />
            </div>
            <Badge className="gap-1">
              <Sparkles className="size-3" aria-hidden="true" />
              {t('upgrade.badge')}
            </Badge>
          </div>
          <DialogTitle>{t('upgrade.title')}</DialogTitle>
          <DialogDescription>
            {feature
              ? t(`upgrade.featureReason.${feature}`, {
                  defaultValue: t('upgrade.description'),
                })
              : t('upgrade.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 space-y-2.5 rounded-lg border p-4">
          <p className="text-xs font-semibold tracking-wide uppercase">
            {t('upgrade.includedTitle')}
          </p>
          <ul className="space-y-2">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm">
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-emerald-500"
                  aria-hidden="true"
                />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-muted-foreground text-xs">
          {t('upgrade.contactHint')}
        </p>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('common:close', { defaultValue: 'Fechar' })}
          </Button>
          <Button
            type="button"
            asChild
            onClick={() => onOpenChange(false)}
          >
            <a
              href="mailto:bruno_galvao@outlook.com?subject=Upgrade%20Plano%20Pro%20-%20Finance"
              target="_blank"
              rel="noreferrer"
            >
              <Crown className="mr-1.5 size-4" aria-hidden="true" />
              {t('upgrade.cta')}
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
