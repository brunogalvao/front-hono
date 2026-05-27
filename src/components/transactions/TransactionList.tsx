import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TransactionCard } from './TransactionCard';
import { TransactionForm } from './TransactionForm';
import { useTransactions, type Transaction } from '@/hooks/useTransactions';
import { useWorkspace } from '@/context/WorkspaceContext';
import { toast } from 'sonner';

interface TransactionListProps {
  month: number;
  year: number;
  currentUserId: string;
}

export function TransactionList({ month, year, currentUserId }: TransactionListProps) {
  const { activeWorkspaceId } = useWorkspace();
  const { data: transactions = [], isLoading, update, remove } = useTransactions(
    activeWorkspaceId,
    month,
    year,
  );
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = Array.from(
    new Map(
      transactions
        .filter((t) => t.categories)
        .map((t) => [t.categories!.id, t.categories!]),
    ).values(),
  );

  const filtered =
    categoryFilter === 'all'
      ? transactions
      : transactions.filter((t) => t.category_id === categoryFilter);

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success('Transação excluída.');
    } catch {
      toast.error('Erro ao excluir transação.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.length > 0 && (
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-muted-foreground py-12 text-center">
          <p className="text-lg font-medium">Nenhuma transação encontrada</p>
          <p className="text-sm">Clique em "Nova Transação" para começar.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <TransactionCard
              key={t.id}
              transaction={t}
              currentUserId={currentUserId}
              onEdit={setEditTarget}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {editTarget && (
        <TransactionForm
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          transaction={editTarget}
          onSubmit={(input) =>
            update.mutateAsync({ id: editTarget.id, ...input })
          }
          mode="edit"
        />
      )}
    </div>
  );
}
