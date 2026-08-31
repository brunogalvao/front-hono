import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InstallmentTable } from '@/components/installments/InstallmentTable';
import { InstallmentForm } from '@/components/installments/InstallmentForm';
import { useInstallments } from '@/hooks/useInstallments';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';
import { useSearch } from '@tanstack/react-router';

export default function InstallmentsPage() {
  const { t } = useTranslation('installments');
  const { activeWorkspaceId } = useWorkspace();
  const { can } = usePermissions();
  const [createOpen, setCreateOpen] = useState(false);
  const { create } = useInstallments(activeWorkspaceId);
  const { highlight } = useSearch({ from: '/admin/installments' });

  const handleCreate = async (
    input: Parameters<typeof create.mutateAsync>[0]
  ) => {
    try {
      await create.mutateAsync(input);
      toast.success(t('toast.created'));
      setCreateOpen(false);
    } catch {
      toast.error(t('toast.createError'));
      throw new Error(t('toast.createError'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
        </div>
        {can('installments', 'create') && (
          <Button
            className="min-h-11 w-full sm:w-auto"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            {t('new')}
          </Button>
        )}
      </div>

      <InstallmentTable highlightId={highlight} />

      <InstallmentForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
}
