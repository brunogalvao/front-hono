import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/hooks/useCategories';
import { useWorkspace } from '@/context/WorkspaceContext';
import type { RecurringExpense, RecurringInput } from '@/hooks/useRecurring';
import { toast } from 'sonner';

const schema = z.object({
  description: z.string().min(1, 'Descrição obrigatória'),
  amount: z.coerce.number().positive('Valor deve ser maior que zero'),
  frequency: z.enum(['monthly', 'weekly', 'yearly']),
  start_date: z.string().min(1, 'Data de início obrigatória'),
  end_date: z.string().optional().nullable(),
  category_id: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

interface RecurringFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recurring?: RecurringExpense | null;
  onSubmit: (input: RecurringInput) => Promise<unknown>;
  mode?: 'create' | 'edit';
}

const FREQ_LABELS = { monthly: 'Mensal', weekly: 'Semanal', yearly: 'Anual' };

export function RecurringForm({
  open, onOpenChange, recurring, onSubmit, mode = 'create',
}: RecurringFormProps) {
  const { activeWorkspaceId } = useWorkspace();
  const { data: categories = [] } = useCategories(activeWorkspaceId);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: '',
      amount: 0,
      frequency: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: null,
      category_id: null,
    },
  });

  useEffect(() => {
    if (recurring && open) {
      form.reset({
        description: recurring.description,
        amount: recurring.amount,
        frequency: recurring.frequency,
        start_date: recurring.start_date,
        end_date: recurring.end_date,
        category_id: recurring.category_id,
      });
    } else if (!recurring && open) {
      form.reset({
        description: '', amount: 0, frequency: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: null, category_id: null,
      });
    }
  }, [recurring, open, form]);

  const expenseCategories = categories.filter((c) => c.type === 'despesa');

  const handleSubmit = async (values: FormValues) => {
    if (!activeWorkspaceId) return;
    setSubmitting(true);
    try {
      await onSubmit({
        workspace_id: activeWorkspaceId,
        description: values.description,
        amount: values.amount,
        frequency: values.frequency,
        start_date: values.start_date,
        end_date: values.end_date ?? null,
        category_id: values.category_id ?? null,
      });
      toast.success(mode === 'create' ? 'Recorrência criada!' : 'Recorrência atualizada!');
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nova Recorrência' : 'Editar Recorrência'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl><Input placeholder="Ex: Netflix" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl><Input type="number" step="0.01" min="0.01" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="frequency" render={({ field }) => (
              <FormItem>
                <FormLabel>Periodicidade</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {Object.entries(FREQ_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="start_date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Início</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="end_date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fim (opcional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value || null)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="category_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Sem categoria" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
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
