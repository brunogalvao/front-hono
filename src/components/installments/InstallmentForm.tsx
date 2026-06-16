import { useTranslation } from 'react-i18next';
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
import { calcInstallmentAmount, type InstallmentInput } from '@/hooks/useInstallments';
import { toast } from 'sonner';

const schema = z.object({
  description: z.string().min(1, 'Descrição obrigatória'),
  total_amount: z.coerce.number().positive('Valor deve ser maior que zero'),
  total_installments: z.coerce.number().int().min(2, 'Mínimo 2 parcelas'),
  first_installment_date: z.string().min(1, 'Data da 1ª parcela obrigatória'),
  category_id: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

interface InstallmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: InstallmentInput) => Promise<unknown>;
}

export function InstallmentForm({ open, onOpenChange, onSubmit }: InstallmentFormProps) {
  const { t } = useTranslation(['installments', 'common']);
  const { activeWorkspaceId } = useWorkspace();
  const { data: categories = [] } = useCategories(activeWorkspaceId);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: '',
      total_amount: 0,
      total_installments: 2,
      first_installment_date: new Date().toISOString().split('T')[0],
      category_id: null,
    },
  });

  const totalAmount = form.watch('total_amount');
  const count = form.watch('total_installments');
  const preview = count >= 2 && totalAmount > 0
    ? calcInstallmentAmount(totalAmount, count)
    : null;

  const expenseCategories = categories.filter((c) => c.type === 'despesa');

  const formatBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const handleSubmit = async (values: FormValues) => {
    if (!activeWorkspaceId) return;
    try {
      await onSubmit({
        workspace_id: activeWorkspaceId,
        description: values.description,
        total_amount: values.total_amount,
        total_installments: values.total_installments,
        first_installment_date: values.first_installment_date,
        category_id: values.category_id ?? null,
      });
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toast.saveError'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('form.title')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.description')}</FormLabel>
                <FormControl><Input placeholder={t('form.descriptionPlaceholder')} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="total_amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.totalAmount')}</FormLabel>
                  <FormControl><Input type="number" step="0.01" min="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="total_installments" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.installmentCount')}</FormLabel>
                  <FormControl><Input type="number" min="2" step="1" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {preview && (
              <div className="bg-muted rounded-lg p-3 text-sm">
                <p className="font-medium">{t('form.preview')}</p>
                <p className="text-muted-foreground">
                  {count - (preview.remainder_amount > 0 ? 1 : 0)}x {formatBRL(preview.installment_amount)}
                  {preview.remainder_amount > 0 && ` + 1x ${formatBRL(preview.installment_amount + preview.remainder_amount)}`}
                </p>
              </div>
            )}

            <FormField control={form.control} name="first_installment_date" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.firstDate')}</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="category_id" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.category')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <FormControl><SelectTrigger><SelectValue placeholder={t('form.categoryPlaceholder')} /></SelectTrigger></FormControl>
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common:cancel')}</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t('form.saving') : t('form.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
