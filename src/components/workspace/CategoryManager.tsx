import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCategories, type Category } from '@/hooks/useCategories';
import { CategoryIcon, CATEGORY_ICONS } from '@/lib/category-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { useWorkspace } from '@/context/WorkspaceContext';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(50),
  type: z.enum(['receita', 'despesa'] as const),
  icon: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CategoryManager() {
  const { t } = useTranslation(['workspace', 'common']);
  const { activeWorkspaceId } = useWorkspace();
  const { data: categories = [] } = useCategories(activeWorkspaceId);
  const queryClient = useQueryClient();
  const qKey = queryKeys.categories.list(activeWorkspaceId ?? '');

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', type: 'despesa', icon: null },
  });

  const createCat = useMutation({
    mutationFn: async (values: FormValues) => {
      const { error } = await supabase.from('categories').insert({
        workspace_id: activeWorkspaceId,
        name: values.name,
        type: values.type,
        icon: values.icon ?? null,
        is_default: false,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }),
  });

  const updateCat = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: FormValues }) => {
      const { error } = await supabase.from('categories')
        .update({ name: values.name, type: values.type, icon: values.icon ?? null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }),
  });

  const deleteCat = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }),
  });

  const openCreate = () => {
    form.reset({ name: '', type: 'despesa', icon: null });
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = (cat: Category) => {
    form.reset({ name: cat.name, type: cat.type, icon: cat.icon ?? null });
    setEditTarget(cat);
    setFormOpen(true);
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      if (editTarget) {
        await updateCat.mutateAsync({ id: editTarget.id, values });
        toast.success(t('category.toast.updated'));
      } else {
        await createCat.mutateAsync(values);
        toast.success(t('category.toast.created'));
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('category.toast.saveError'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCat.mutateAsync(deleteTarget);
      toast.success(t('category.toast.deleted'));
    } catch { toast.error(t('category.toast.deleteError')); }
    setDeleteTarget(null);
  };

  const custom = categories.filter((c) => !c.is_default);
  const defaults = categories.filter((c) => c.is_default);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{t('category.customTitle')}</p>
        <Button size="sm" variant="outline" onClick={openCreate}>
          <Plus className="mr-1 h-3 w-3" /> {t('category.new')}
        </Button>
      </div>

      {custom.length === 0 && (
        <p className="text-muted-foreground text-sm">{t('category.empty')}</p>
      )}

      <div className="space-y-1">
        {custom.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2 rounded-lg border p-2">
            {cat.icon && <CategoryIcon name={cat.icon} className="text-muted-foreground h-4 w-4 shrink-0" />}
            <span className="flex-1 text-sm">{cat.name}</span>
            <Badge variant={cat.type === 'receita' ? 'default' : 'secondary'} className="text-xs">
              {t(`category.type.${cat.type}`)}
            </Badge>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(cat)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost" size="icon"
              className="text-destructive hover:text-destructive h-7 w-7"
              onClick={() => setDeleteTarget(cat.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <p className="text-muted-foreground mb-2 text-xs font-medium">{t('category.defaultTitle')}</p>
        <div className="flex flex-wrap gap-1">
          {defaults.map((cat) => (
            <Badge key={cat.id} variant="outline" className="text-xs">
              {cat.name}
            </Badge>
          ))}
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editTarget ? t('category.editTitle') : t('category.newTitle')}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('category.form.name')}</FormLabel>
                  <FormControl><Input placeholder={t('category.form.namePlaceholder')} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('category.form.type')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="despesa">{t('category.type.despesa')}</SelectItem>
                      <SelectItem value="receita">{t('category.type.receita')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="icon" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('category.form.icon')}</FormLabel>
                  <div className="grid grid-cols-8 gap-1">
                    {CATEGORY_ICONS.map(({ name, label, Icon }) => (
                      <button
                        key={name}
                        type="button"
                        title={label}
                        onClick={() => field.onChange(field.value === name ? null : name)}
                        className={`flex items-center justify-center rounded-md p-1.5 transition-colors hover:bg-muted ${field.value === name ? 'bg-primary/10 text-primary ring-1 ring-primary' : 'text-muted-foreground'}`}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>{t('common:cancel')}</Button>
                <Button type="submit">{editTarget ? t('common:save') : t('category.form.create')}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('category.delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('category.delete.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>{t('common:delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
