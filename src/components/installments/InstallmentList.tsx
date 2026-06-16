import { useState, useEffect, useRef } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { CheckCircle, CreditCard, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useInstallments, type Installment } from '@/hooks/useInstallments';
import { useWorkspace } from '@/context/WorkspaceContext';
import { canWrite } from '@/lib/permissions';
import { formatToBRL } from '@/utils/format';
import { toast } from 'sonner';

interface InstallmentListProps {
  onDelete: (id: string) => Promise<void>;
  highlightId?: string;
}

export function InstallmentList({ onDelete, highlightId }: InstallmentListProps) {
  const { t } = useTranslation(['installments', 'common']);
  const { activeWorkspaceId, activeRole } = useWorkspace();
  const { data: items = [], isLoading, earlyPayoff } = useInstallments(activeWorkspaceId);
  const [payoffTarget, setPayoffTarget] = useState<Installment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Installment | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightId, items]);

  const handlePayoff = async () => {
    if (!payoffTarget) return;
    try {
      await earlyPayoff.mutateAsync(payoffTarget.id);
      toast.success(t('toast.paidOff'));
    } catch {
      toast.error(t('toast.payoffError'));
    }
    setPayoffTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await onDelete(deleteTarget.id);
      toast.success(t('toast.deleted'));
    } catch {
      toast.error(t('toast.deleteError'));
    }
    setDeleteTarget(null);
  };

  const statusVariant = {
    active: 'default' as const,
    completed: 'secondary' as const,
    cancelled: 'outline' as const,
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        <CreditCard className="mx-auto mb-3 h-10 w-10 opacity-30" />
        <p className="font-medium">{t('empty')}</p>
        <p className="text-sm">{t('emptyHint')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {items.map((item) => {
          const progress = (item.paid_installments / item.total_installments) * 100;
          const remaining = item.total_installments - item.paid_installments;
          const canAct = item.status === 'active' && canWrite(activeRole);

          const isHighlighted = item.id === highlightId;
          return (
            <Card
              key={item.id}
              ref={isHighlighted ? highlightRef : null}
              className={cn(
                item.status !== 'active' && 'opacity-70',
                isHighlighted && 'ring-2 ring-primary ring-offset-2',
              )}
            >
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="font-medium">{item.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariant[item.status]}>{t(`status.${item.status}`)}</Badge>
                      {item.categories && (
                        <Badge variant="secondary" className="text-xs">
                          {item.categories.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-red-500">
                      {formatToBRL(item.installment_amount)}{t('perMonth')}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatToBRL(item.total_amount)} {t('totalSuffix')}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground flex justify-between text-xs">
                    <span>{t('progress', { paid: item.paid_installments, total: item.total_installments })}</span>
                    <span>{remaining > 0 ? t('remaining', { count: remaining }) : t('done')}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {canAct && (
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => setPayoffTarget(item)}
                    >
                      <CheckCircle className="h-3 w-3" />
                      {t('payoffEarly')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive gap-1 text-xs"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Trash2 className="h-3 w-3" />
                      {t('deleteSeries')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* T007 — dialog com detalhes de quantas parcelas serão quitadas */}
      <AlertDialog open={!!payoffTarget} onOpenChange={(open) => !open && setPayoffTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('payoff.title')}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-1">
                {payoffTarget && (() => {
                  const pendingCount = payoffTarget.total_installments - payoffTarget.paid_installments;
                  const pendingTotal = pendingCount * payoffTarget.installment_amount;
                  return (
                    <>
                      <p>
                        <Trans
                          ns="installments"
                          i18nKey={pendingCount === 1 ? 'payoff.descOne' : 'payoff.descMany'}
                          values={{ count: pendingCount, amount: formatToBRL(pendingTotal) }}
                          components={{ bold: <strong /> }}
                        />
                      </p>
                      <p>{t('payoff.warning')}</p>
                    </>
                  );
                })()}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handlePayoff}>{t('payoff.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* T010 — dialog de exclusão da série */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-1">
                {deleteTarget && (
                  <>
                    <p>
                      <Trans
                        ns="installments"
                        i18nKey={deleteTarget.total_installments === 1 ? 'deleteDialog.descOne' : 'deleteDialog.descMany'}
                        values={{ count: deleteTarget.total_installments }}
                        components={{ bold: <strong /> }}
                      />
                    </p>
                    <p>{t('deleteDialog.warning')}</p>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              {t('deleteSeries')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
