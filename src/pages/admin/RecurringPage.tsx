import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecurringTable } from '@/components/recurring/RecurringTable';
import { RecurringForm } from '@/components/recurring/RecurringForm';
import { useRecurring } from '@/hooks/useRecurring';
import { useWorkspace } from '@/context/WorkspaceContext';
import { canWrite } from '@/lib/permissions';
import { toast } from 'sonner';

export default function RecurringPage() {
  const { activeWorkspaceId, activeRole } = useWorkspace();
  const [createOpen, setCreateOpen] = useState(false);
  const { create } = useRecurring(activeWorkspaceId);

  const handleCreate = async (input: Parameters<typeof create.mutateAsync>[0]) => {
    try {
      await create.mutateAsync(input);
      toast.success('Recorrência criada!');
    } catch {
      toast.error('Erro ao criar recorrência.');
      throw new Error('Erro ao criar recorrência.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Despesas Recorrentes</h1>
          <p className="text-muted-foreground text-sm">Gerencie seus gastos fixos mensais</p>
        </div>
        {canWrite(activeRole) && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Nova Recorrência
          </Button>
        )}
      </div>

      <RecurringTable />

      <RecurringForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        mode="create"
      />
    </div>
  );
}
