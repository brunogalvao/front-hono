import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { CurrencyInput } from '@/components/ui/currency-input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import { useWorkspace } from '@/context/WorkspaceContext';
import type { Transaction, TransactionInput } from '@/hooks/useTransactions';
import { toast } from 'sonner';

const schema = z.object({
  type: z.enum(['receita', 'despesa']),
  status: z.enum(['pago', 'pendente', 'recebido']),
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
  const { t } = useTranslation(['transactions', 'common']);
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

  // Auto-set status based on type
  useEffect(() => {
    if (selectedType === 'receita') {
      form.setValue('status', 'recebido');
    } else if (form.getValues('status') === 'recebido') {
      form.setValue('status', 'pendente');
    }
  }, [selectedType, form]);

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
      toast.success(
        mode === 'create' ? t('toast.created') : t('toast.updated')
      );
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toast.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? t('newTransaction') : t('editTransaction')}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.type')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="min-h-11 w-full sm:min-h-9">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="despesa">
                        {t('type.despesa')}
                      </SelectItem>
                      <SelectItem value="receita">
                        {t('type.receita')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType === 'despesa' && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.status')}</FormLabel>
                    <div className="flex gap-2">
                      {(['pendente', 'pago'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => field.onChange(s)}
                          className={cn(
                            'min-h-11 flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors sm:min-h-9',
                            field.value === s
                              ? s === 'pago'
                                ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400'
                                : 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'border-border text-muted-foreground hover:bg-muted'
                          )}
                        >
                          {s === 'pago'
                            ? t('status.pago')
                            : t('status.pendente')}
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.amount')}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      className="min-h-11 sm:min-h-9"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.date')}</FormLabel>
                    <FormControl>
                      <Input
                        className="min-h-11 sm:min-h-9"
                        type="date"
                        {...field}
                      />
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
                    <FormLabel>{t('form.category')}</FormLabel>
                    <Select
                      key={transaction?.id ?? 'new'}
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                    >
                      <FormControl>
                        <SelectTrigger className="min-h-11 w-full sm:min-h-9">
                          <SelectValue
                            placeholder={t('form.categoryPlaceholder')}
                          />
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
                  <FormLabel>{t('form.description')}</FormLabel>
                  <FormControl>
                    <Input
                      className="min-h-11 sm:min-h-9"
                      placeholder={t('form.descriptionPlaceholder')}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="min-h-11 sm:min-h-9"
                onClick={() => onOpenChange(false)}
              >
                {t('common:cancel')}
              </Button>
              <Button
                type="submit"
                className="min-h-11 sm:min-h-9"
                disabled={submitting}
              >
                {submitting
                  ? t('form.saving')
                  : mode === 'create'
                    ? t('form.create')
                    : t('common:save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
