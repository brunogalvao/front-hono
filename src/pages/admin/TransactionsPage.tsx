import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { MonthYearPicker } from '@/components/ui/month-year-picker';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { useTransactions } from '@/hooks/useTransactions';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';
import type { TransactionStatus } from '@/model/transaction.model';

export default function TransactionsPage() {
  const { t } = useTranslation('transactions');
  const { activeWorkspaceId } = useWorkspace();
  const { can } = usePermissions();
  const search = useSearch({ from: '/admin/transactions' });
  const now = new Date();
  const [month, setMonth] = useState(search.month ?? now.getMonth() + 1);
  const [year, setYear] = useState(search.year ?? now.getFullYear());
  const [createOpen, setCreateOpen] = useState(false);

  const { create } = useTransactions(activeWorkspaceId, month, year);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>(
    search.status ?? 'all'
  );

  useEffect(() => {
    if (search.month) setMonth(search.month);
    if (search.year) setYear(search.year);
    setStatusFilter(search.status ?? 'all');
  }, [search.month, search.status, search.year]);

  const handleCreate = async (
    input: Parameters<typeof create.mutateAsync>[0]
  ) => {
    try {
      await create.mutateAsync(input);
      if (categoryFilter !== 'all') {
        setCategoryFilter('all');
        toast.success(t('toast.createdFilterReset'));
      } else {
        toast.success(t('toast.created'));
      }
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
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <MonthYearPicker
            month={month}
            year={year}
            onChange={(m, y) => {
              setMonth(m);
              setYear(y);
            }}
          />
          {can('transactions', 'create') && (
            <Button
              className="min-h-11 w-full sm:w-auto"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              {t('newTransaction')}
            </Button>
          )}
        </div>
      </div>

      <TransactionTable
        month={month}
        year={year}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        highlightId={search.highlight}
      />

      <TransactionForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        mode="create"
      />
    </div>
  );
}
