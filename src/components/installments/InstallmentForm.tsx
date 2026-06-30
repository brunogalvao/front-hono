import { useEffect } from 'react';
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
import { useCategories } from '@/hooks/useCategories';
import { useWorkspace } from '@/context/WorkspaceContext';
import {
  calcInstallmentAmount,
  type Installment,
  type InstallmentInput,
  type InstallmentUpdateInput,
} from '@/hooks/useInstallments';
import { toast } from 'sonner';

const createSchema = z.object({
  description: z.string().min(1, 'Descrição obrigatória'),
  total_amount: z.coerce.number().positive('Valor deve ser maior que zero'),
  total_installments: z.coerce.number().int().min(2, 'Mínimo 2 parcelas'),
  first_installment_date: z.string().min(1, 'Data da 1ª parcela obrigatória'),
  category_id: z.string().optional().nullable(),
});

const editSchema = z.object({
  description: z.string().min(1, 'Descrição obrigatória'),
  category_id: z.string().optional().nullable(),
  installment_amount: z.coerce
    .number()
    .positive('Valor deve ser maior que zero'),
  total_installments: z.coerce.number().int().min(1, 'Mínimo 1 parcela'),
  status: z.enum(['active', 'completed', 'cancelled']),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

interface InstallmentFormCreateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: InstallmentInput) => Promise<unknown>;
  mode?: 'create';
  installment?: never;
}

interface InstallmentFormEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: InstallmentUpdateInput) => Promise<unknown>;
  mode: 'edit';
  installment: Installment;
}

type InstallmentFormProps =
  | InstallmentFormCreateProps
  | InstallmentFormEditProps;

export function InstallmentForm({
  open,
  onOpenChange,
  onSubmit,
  mode = 'create',
  installment,
}: InstallmentFormProps) {
  const { t } = useTranslation(['installments', 'common']);
  const { activeWorkspaceId } = useWorkspace();
  const { data: categories = [] } = useCategories(activeWorkspaceId);
  const isEdit = mode === 'edit';

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      description: '',
      total_amount: 0,
      total_installments: 2,
      first_installment_date: new Date().toISOString().split('T')[0],
      category_id: null,
    },
  });

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      description: installment?.description ?? '',
      category_id: installment?.category_id ?? null,
      installment_amount: installment?.installment_amount ?? 0,
      total_installments: installment?.total_installments ?? 1,
      status: installment?.status ?? 'active',
    },
  });

  useEffect(() => {
    if (isEdit && installment && open) {
      editForm.reset({
        description: installment.description,
        category_id: installment.category_id,
        installment_amount: installment.installment_amount,
        total_installments: installment.total_installments,
        status: installment.status,
      });
    } else if (!isEdit && open) {
      createForm.reset();
    }
  }, [open, installment, isEdit, editForm, createForm]);

  const totalAmount = createForm.watch('total_amount');
  const count = createForm.watch('total_installments');
  const preview =
    !isEdit && count >= 2 && totalAmount > 0
      ? calcInstallmentAmount(totalAmount, count)
      : null;

  const expenseCategories = categories.filter((c) => c.type === 'despesa');

  const formatBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(v);

  const handleCreateSubmit = async (values: CreateValues) => {
    if (!activeWorkspaceId) return;
    try {
      await (onSubmit as (input: InstallmentInput) => Promise<unknown>)({
        workspace_id: activeWorkspaceId,
        description: values.description,
        total_amount: values.total_amount,
        total_installments: values.total_installments,
        first_installment_date: values.first_installment_date,
        category_id: values.category_id ?? null,
      });
      createForm.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toast.saveError'));
    }
  };

  const handleEditSubmit = async (values: EditValues) => {
    try {
      await (onSubmit as (input: InstallmentUpdateInput) => Promise<unknown>)({
        description: values.description,
        category_id: values.category_id ?? null,
        installment_amount: values.installment_amount,
        total_installments: values.total_installments,
        status: values.status,
      });
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toast.saveError'));
    }
  };

  if (isEdit) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('form.editTitle')}</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.description')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('form.descriptionPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={editForm.control}
                  name="installment_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.installmentAmount')}</FormLabel>
                      <FormControl>
                        <CurrencyInput value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="total_installments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.installmentCount')}</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" step="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.status')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">
                            {t('status.active')}
                          </SelectItem>
                          <SelectItem value="completed">
                            {t('status.completed')}
                          </SelectItem>
                          <SelectItem value="cancelled">
                            {t('status.cancelled')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.category')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ''}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={t('form.categoryPlaceholder')}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expenseCategories.map((cat) => (
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {t('common:cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={editForm.formState.isSubmitting}
                >
                  {editForm.formState.isSubmitting
                    ? t('form.saving')
                    : t('common:save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('form.title')}</DialogTitle>
        </DialogHeader>
        <Form {...createForm}>
          <form
            onSubmit={createForm.handleSubmit(handleCreateSubmit)}
            className="space-y-4"
          >
            <FormField
              control={createForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.description')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('form.descriptionPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={createForm.control}
                name="total_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.totalAmount')}</FormLabel>
                    <FormControl>
                      <CurrencyInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="total_installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.installmentCount')}</FormLabel>
                    <FormControl>
                      <Input type="number" min="2" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {preview && (
              <div className="bg-muted rounded-lg p-3 text-sm">
                <p className="font-medium">{t('form.preview')}</p>
                <p className="text-muted-foreground">
                  {count - (preview.remainder_amount > 0 ? 1 : 0)}x{' '}
                  {formatBRL(preview.installment_amount)}
                  {preview.remainder_amount > 0 &&
                    ` + 1x ${formatBRL(preview.installment_amount + preview.remainder_amount)}`}
                </p>
              </div>
            )}

            <FormField
              control={createForm.control}
              name="first_installment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.firstDate')}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createForm.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.category')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('form.categoryPlaceholder')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseCategories.map((cat) => (
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('common:cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createForm.formState.isSubmitting}
              >
                {createForm.formState.isSubmitting
                  ? t('form.saving')
                  : t('form.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
