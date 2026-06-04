import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InstallmentList } from '@/components/installments/InstallmentList';
import { InstallmentForm } from '@/components/installments/InstallmentForm';
import { useInstallments } from '@/hooks/useInstallments';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';
import { useSearch } from '@tanstack/react-router';

export default function InstallmentsPage() {
  const { activeWorkspaceId } = useWorkspace();
  const { can } = usePermissions();
  const [createOpen, setCreateOpen] = useState(false);
  const { create, remove } = useInstallments(activeWorkspaceId);
  const { highlight } = useSearch({ from: '/admin/installments' });

  const handleCreate = async (input: Parameters<typeof create.mutateAsync>[0]) => {
    try {
      await create.mutateAsync(input);
      toast.success('Parcelamento criado!');
      setCreateOpen(false);
    } catch {
      toast.error('Erro ao criar parcelamento.');
      throw new Error('Erro ao criar parcelamento.');
    }
  };

  const handleDelete = async (id: string) => {
    await remove.mutateAsync(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Parcelamentos</h1>
          <p className="text-muted-foreground text-sm">Acompanhe compras parceladas</p>
        </div>
        {can('installments', 'create') && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Novo Parcelamento
          </Button>
        )}
      </div>

      <InstallmentList onDelete={handleDelete} highlightId={highlight} />

      <InstallmentForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
}
