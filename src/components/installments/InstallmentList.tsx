import { useState } from 'react';
import { CheckCircle, CreditCard } from 'lucide-react';
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
import { useInstallments } from '@/hooks/useInstallments';
import { useWorkspace } from '@/context/WorkspaceContext';
import { canWrite } from '@/lib/permissions';
import { toast } from 'sonner';

export function InstallmentList() {
  const { activeWorkspaceId, activeRole } = useWorkspace();
  const { data: items = [], isLoading, earlyPayoff } = useInstallments(activeWorkspaceId);
  const [payoffTarget, setPayoffTarget] = useState<string | null>(null);

  const formatBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const handlePayoff = async () => {
    if (!payoffTarget) return;
    try {
      await earlyPayoff.mutateAsync(payoffTarget);
      toast.success('Parcelamento quitado antecipadamente.');
    } catch { toast.error('Erro ao quitar parcelamento.'); }
    setPayoffTarget(null);
  };

  const statusLabel = { active: 'Ativo', completed: 'Quitado', cancelled: 'Cancelado' };
  const statusVariant = {
    active: 'default' as const,
    completed: 'secondary' as const,
    cancelled: 'outline' as const,
  };

  if (isLoading) {
    return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        <CreditCard className="mx-auto mb-3 h-10 w-10 opacity-30" />
        <p className="font-medium">Nenhum parcelamento registrado</p>
        <p className="text-sm">Adicione um parcelamento para começar.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {items.map((item) => {
          const progress = (item.paid_installments / item.total_installments) * 100;
          const remaining = item.total_installments - item.paid_installments;

          return (
            <Card key={item.id} className={item.status !== 'active' ? 'opacity-70' : ''}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="font-medium">{item.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariant[item.status]}>{statusLabel[item.status]}</Badge>
                      {item.categories && <Badge variant="secondary" className="text-xs">{item.categories.name}</Badge>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-red-500">{formatBRL(item.installment_amount)}/mês</p>
                    <p className="text-muted-foreground text-xs">{formatBRL(item.total_amount)} total</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{item.paid_installments} de {item.total_installments} parcelas</span>
                    <span>{remaining > 0 ? `${remaining} restantes` : 'Concluído'}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {item.status === 'active' && canWrite(activeRole) && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => setPayoffTarget(item.id)}
                    >
                      <CheckCircle className="h-3 w-3" />
                      Quitar Antecipadamente
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!payoffTarget} onOpenChange={(open) => !open && setPayoffTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quitar parcelamento antecipadamente?</AlertDialogTitle>
            <AlertDialogDescription>
              As parcelas futuras serão canceladas. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handlePayoff}>Confirmar Quitação</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
