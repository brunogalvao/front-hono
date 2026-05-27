import { useState } from 'react';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { useWorkspace } from '@/context/WorkspaceContext';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(50),
  type: z.enum(['receita', 'despesa'] as const),
});

type FormValues = z.infer<typeof schema>;

export function CategoryManager() {
  const { activeWorkspaceId } = useWorkspace();
  const { data: categories = [] } = useCategories(activeWorkspaceId);
  const queryClient = useQueryClient();
  const qKey = queryKeys.categories.list(activeWorkspaceId ?? '');

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', type: 'despesa' },
  });

  const createCat = useMutation({
    mutationFn: async (values: FormValues) => {
      const { error } = await supabase.from('categories').insert({
        workspace_id: activeWorkspaceId,
        name: values.name,
        type: values.type,
        is_default: false,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }),
  });

  const updateCat = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: FormValues }) => {
      const { error } = await supabase.from('categories').update({ name: values.name, type: values.type }).eq('id', id);
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
    form.reset({ name: '', type: 'despesa' });
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = (cat: Category) => {
    form.reset({ name: cat.name, type: cat.type });
    setEditTarget(cat);
    setFormOpen(true);
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      if (editTarget) {
        await updateCat.mutateAsync({ id: editTarget.id, values });
        toast.success('Categoria atualizada.');
      } else {
        await createCat.mutateAsync(values);
        toast.success('Categoria criada.');
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar categoria.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCat.mutateAsync(deleteTarget);
      toast.success('Categoria excluída.');
    } catch { toast.error('Erro ao excluir categoria.'); }
    setDeleteTarget(null);
  };

  const custom = categories.filter((c) => !c.is_default);
  const defaults = categories.filter((c) => c.is_default);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Categorias personalizadas</p>
        <Button size="sm" variant="outline" onClick={openCreate}>
          <Plus className="mr-1 h-3 w-3" /> Nova
        </Button>
      </div>

      {custom.length === 0 && (
        <p className="text-muted-foreground text-sm">Nenhuma categoria personalizada.</p>
      )}

      <div className="space-y-1">
        {custom.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2 rounded-lg border p-2">
            <span className="flex-1 text-sm">{cat.name}</span>
            <Badge variant={cat.type === 'receita' ? 'default' : 'secondary'} className="text-xs">
              {cat.type}
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
        <p className="text-muted-foreground mb-2 text-xs font-medium">Categorias padrão (somente leitura)</p>
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
            <DialogTitle>{editTarget ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl><Input placeholder="Ex: Academia" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="despesa">Despesa</SelectItem>
                      <SelectItem value="receita">Receita</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
                <Button type="submit">{editTarget ? 'Salvar' : 'Criar'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>Transações com esta categoria ficarão sem categoria.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
