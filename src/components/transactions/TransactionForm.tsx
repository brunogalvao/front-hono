import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import { useWorkspace } from '@/context/WorkspaceContext';
import type { Transaction, TransactionInput } from '@/hooks/useTransactions';
import { toast } from 'sonner';

const schema = z.object({
  type: z.enum(['receita', 'despesa']),
  status: z.enum(['pago', 'pendente']),
  amount: z.coerce.number().positive('Valor deve ser maior que zero'),
  date: z.string().min(1, 'Data obrigatória'),
  category_id: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
  onSubmit: (input: TransactionInput) => Promise<unknown>;
  mode?: 'create' | 'edit';
}

export function TransactionForm({
  open,
  onOpenChange,
  transaction,
  onSubmit,
  mode = 'create',
}: TransactionFormProps) {
  const { activeWorkspaceId } = useWorkspace();
  const { data: categories = [] } = useCategories(activeWorkspaceId);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'despesa',
      status: 'pendente',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category_id: null,
      description: null,
    },
  });

  useEffect(() => {
    if (transaction && open) {
      form.reset({
        type: transaction.type,
        status: transaction.status ?? 'pendente',
        amount: transaction.amount,
        date: transaction.date,
        category_id: transaction.category_id,
        description: transaction.description,
      });
    } else if (!transaction && open) {
      form.reset({
        type: 'despesa',
        status: 'pendente',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        category_id: null,
        description: null,
      });
    }
  }, [transaction, open, form]);

  const selectedType = form.watch('type');
  const filteredCategories = categories.filter((c) => c.type === selectedType);

  const handleSubmit = async (values: FormValues) => {
    if (!activeWorkspaceId) return;
    setSubmitting(true);
    try {
      await onSubmit({
        workspace_id: activeWorkspaceId,
        type: values.type,
        status: values.status,
        amount: values.amount,
        date: values.date,
        category_id: values.category_id ?? null,
        description: values.description ?? null,
      });
      toast.success(mode === 'create' ? 'Transação criada!' : 'Transação atualizada!');
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar transação');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nova Transação' : 'Editar Transação'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="despesa">Despesa</SelectItem>
                      <SelectItem value="receita">Receita</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <div className="flex gap-2">
                    {(['pendente', 'pago'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => field.onChange(s)}
                        className={cn(
                          'flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                          field.value === s
                            ? s === 'pago'
                              ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400'
                              : 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'border-border text-muted-foreground hover:bg-muted',
                        )}
                      >
                        {s === 'pago' ? 'Pago' : 'Pendente'}
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      key={transaction?.id ?? 'new'}
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descrição opcional"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Salvando...' : mode === 'create' ? 'Criar' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
