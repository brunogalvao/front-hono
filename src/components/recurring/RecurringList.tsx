import { useState } from 'react';
import { Pencil, Trash2, Power } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { RecurringForm } from './RecurringForm';
import { useRecurring, type RecurringExpense } from '@/hooks/useRecurring';
import { useWorkspace } from '@/context/WorkspaceContext';
import { canWrite } from '@/lib/permissions';
import { toast } from 'sonner';

const FREQ_LABELS = { monthly: 'Mensal', weekly: 'Semanal', yearly: 'Anual' };

export function RecurringList() {
  const { activeWorkspaceId, activeRole } = useWorkspace();
  const { data: items = [], isLoading, create, update, toggleActive, remove } = useRecurring(activeWorkspaceId);
  const [editTarget, setEditTarget] = useState<RecurringExpense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const formatBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleActive.mutateAsync({ id, is_active: !current });
      toast.success(current ? 'Recorrência desativada.' : 'Recorrência ativada.');
    } catch { toast.error('Erro ao alterar status.'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync(deleteTarget);
      toast.success('Recorrência excluída.');
    } catch { toast.error('Erro ao excluir.'); }
    setDeleteTarget(null);
  };

  if (isLoading) {
    return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        <Power className="mx-auto mb-3 h-10 w-10 opacity-30" />
        <p className="font-medium">Nenhuma despesa recorrente</p>
        <p className="text-sm">Adicione uma recorrência para começar.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.id} className={!item.is_active ? 'opacity-60' : ''}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex-1 space-y-0.5">
                <p className="font-medium">{item.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">{FREQ_LABELS[item.frequency]}</span>
                  {item.categories && <Badge variant="secondary" className="text-xs">{item.categories.name}</Badge>}
                  {!item.is_active && <Badge variant="outline" className="text-xs">Inativo</Badge>}
                </div>
              </div>

              <span className="font-semibold text-red-500 tabular-nums">{formatBRL(item.amount)}</span>

              {canWrite(activeRole) && (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.is_active}
                    onCheckedChange={() => handleToggle(item.id, item.is_active)}
                    aria-label="Ativar/desativar recorrência"
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditTarget(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8" onClick={() => setDeleteTarget(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {editTarget && (
        <RecurringForm
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          recurring={editTarget}
          onSubmit={(input) => update.mutateAsync({ id: editTarget.id, ...input })}
          mode="edit"
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir recorrência?</AlertDialogTitle>
            <AlertDialogDescription>As transações já geradas não serão afetadas.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
