import { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import type { Task, TaskStatus } from '@/model/tasks.model';
import { TASK_STATUS } from '@/model/tasks.model';
import { Switch } from '@/components/ui/switch';
import { getExpenseTypes } from '@/service/expense-types/getExpenseTypes';
import { z } from 'zod';
import { taskSchema } from '@/schema/taskSchema';
import { useEditTask, useDeleteTask } from '@/hooks/use-tasks';
import { useIA } from '@/hooks/use-ia';
import { useIncomesByMonth } from '@/hooks/use-incomes-by-month';

// ui
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Skeleton } from './ui/skeleton';
import { TypeSelector } from './TypeSelector';
import StatusDropdown from './StatusDropdown';

// icons
import { Pencil, Trash, Loader, RefreshCw } from 'lucide-react';
import { formatToBRL } from '@/utils/format';
import { cn } from '@/lib/utils';

interface TaskTable {
  tasks: Task[];
  totalPrice: number;
  total: number;
  onTasksChange: () => void;
  isLoading?: boolean;
}

// Componente Skeleton para a tabela de despesas
const TasksTableSkeleton = () => (
  <div className="space-y-4">
    <div className="rounded-md border">
      <div className="bg-muted/50 border-b px-4 py-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="bg-muted/50 border-b px-4 py-3">
        <div className="grid grid-cols-5 gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className="divide-y">
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="px-4 py-3">
            <div className="grid grid-cols-5 gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const TasksTable = memo(function TasksTable({
  tasks,
  onTasksChange,
  isLoading = false,
}: TaskTable) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [allTypes, setAllTypes] = useState<string[]>([]);
  const [editForm, setEditForm] = useState({
    title: '',
    price: '',
    done: TASK_STATUS.Pendente as TaskStatus,
    type: '',
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    recorrente: false,
  });

  const [highlightedTaskId] = useState<string | null>(() => {
    const id = sessionStorage.getItem('highlightTaskId');
    if (id) sessionStorage.removeItem('highlightTaskId');
    return id;
  });
  const highlightRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Hooks para edição e deleção com invalidação automática do cache
  const editTaskMutation = useEditTask();
  const deleteTaskMutation = useDeleteTask();

  const handleEditClick = useCallback((task: Task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title ?? '',
      price: task.price !== null && task.price !== undefined ? task.price.toString() : '',
      type: task.type ?? '',
      done: task.done,
      mes: task.mes,
      ano: task.ano,
      recorrente: task.recorrente ?? false,
    });
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (editingTask) {
      try {
        await editTaskMutation.mutateAsync({
          id: editingTask.id,
          data: {
            title: editForm.title,
            done: editForm.done,
            price: editForm.price ? Number(editForm.price) : null,
            type: editForm.type,
            mes: editForm.mes,
            ano: editForm.ano,
            recorrente: editForm.recorrente,
          },
        });
        console.log('🟢 Editado com sucesso');
        setEditingTask(null);
        // Fecha o dialog
        setDialogOpen(false);
        // Atualiza a tabela
        onTasksChange();
      } catch (err) {
        console.error('❌ Erro ao editar:', err);
      }
    }
  }, [
    editingTask,
    editForm,
    onTasksChange,
    editTaskMutation,
  ]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteTaskMutation.mutateAsync(id);

        // Atualiza a tabela
        onTasksChange();

        // Atualiza a lista de tipos
        const types = await getExpenseTypes();
        setAllTypes(types.map((t) => t.name));
      } catch (err) {
        console.error('❌ Erro ao deletar:', err);
      }
    },
    [onTasksChange, deleteTaskMutation]
  );

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await getExpenseTypes();
        console.log('✅ Tipos carregados:', types);
        setAllTypes(types.map((t) => t.name)); // ou t.nome se não fez o mapeamento na API
      } catch (err) {
        console.error('Erro ao carregar tipos de gasto:', err);
      }
    };

    fetchTypes();
  }, []);

  // Memoiza a validação do formulário
  const formErrors = useMemo(() => {
    try {
      taskSchema.parse({
        title: editForm.title,
        price: editForm.price ? Number(editForm.price) : null,
        type: editForm.type,
        done: editForm.done,
        mes: editForm.mes,
        ano: editForm.ano,
      });
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            errors[err.path[0] as string] = err.message;
          }
        });
        return errors;
      }
      return {};
    }
  }, [editForm]);

  const isFormValid = Object.keys(formErrors).length === 0;

  // Hook para buscar dados da IA simplificados
  const { data: iaData } = useIA();

  // Hook para buscar rendimentos por mês (ainda usado para exibição no header)
  const { data: salariosPorMes = {} } = useIncomesByMonth();

  const mesAtual = new Date().getMonth() + 1;

  // Usar dados da IA ou fallback para valores locais
  // const totalMesAtual =
  //   iaData?.data?.rendimentoMes || salariosPorMes[mesAtual] || 0;

  const totalDespesasMesAtual =
    iaData?.data?.totalDespesas || salariosPorMes[mesAtual] || 0;

  if (isLoading) {
    return <TasksTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableCaption>
          <div className="flex justify-between">
            <div>{tasks.length} Despesas</div>
            <div className="font-bold">
              Total {formatToBRL(totalDespesasMesAtual)}
            </div>
          </div>
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]" scope="col">
              Título
            </TableHead>
            <TableHead scope="col">Tipo</TableHead>
            <TableHead scope="col">Preço</TableHead>
            <TableHead scope="col">Status</TableHead>
            <TableHead scope="col">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const isPendente = task.done === TASK_STATUS.Pendente;
            const isRecorrente = task.recorrente === true;
            const isRecurringCopy = !!task.fixo_source_id;
            const isHighlighted = task.id === highlightedTaskId;
            return (
            <TableRow
              key={task.id}
              ref={isHighlighted ? highlightRef : undefined}
              className={cn(
                isPendente && !isRecorrente && !isRecurringCopy && 'border-l-2 border-l-amber-500 bg-amber-500/5',
                (isRecorrente || isRecurringCopy) && 'border-l-2 border-l-blue-400 bg-blue-500/5',
                isHighlighted && 'ring-2 ring-amber-400 ring-inset bg-amber-500/15',
              )}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {isPendente && !isRecorrente && !isRecurringCopy && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                  )}
                  {(isRecorrente || isRecurringCopy) && (
                    <RefreshCw className="h-3 w-3 shrink-0 text-blue-400" />
                  )}
                  {task.title}
                </div>
              </TableCell>
              <TableCell>{task.type || 'Sem tipo'}</TableCell>
              <TableCell>
                {task.price ? formatToBRL(task.price) : 'Sem preço'}
              </TableCell>
              <TableCell>
                <StatusDropdown
                  task={{ ...task, done: task.done }}
                  onStatusChanged={onTasksChange}
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(task)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(task.id)}
                    disabled={deleteTaskMutation.isPending}
                  >
                    {deleteTaskMutation.isPending ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Dialog de edição - Movido para fora da tabela */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="w-full max-w-2xl"
          aria-describedby="edit-task-description"
        >
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
          </DialogHeader>
          <DialogDescription className="pb-4" id="edit-task-description">
            Edite os detalhes da despesa selecionada.
            {editingTask?.fixo_source_id && (
              <span className="mt-1 flex items-center gap-1.5 text-blue-400">
                <RefreshCw className="h-3 w-3" />
                Despesa recorrente — alterações se aplicam apenas a este mês.
              </span>
            )}
          </DialogDescription>
          <div className="flex flex-col space-y-6">
            {/* Título - Largura total */}
            <div className="flex flex-col space-y-2">
              <Label className="text-base font-medium">Título</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                className="h-12 text-base"
              />
            </div>

            {/* Preço e Status - Em linha */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <Label className="text-base font-medium">Preço</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.price}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
                  className="h-12 text-base"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label className="text-base font-medium">Status</Label>
                <Select
                  value={editForm.done}
                  onValueChange={(value) => setEditForm((prev) => ({ ...prev, done: value as TaskStatus }))}
                >
                  <SelectTrigger className="border-input bg-background !h-12 w-full border px-3 py-2 text-base">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TASK_STATUS.Pendente}>Pendente</SelectItem>
                    <SelectItem value={TASK_STATUS.Pago}>Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Recorrência */}
            {!editingTask?.fixo_source_id && (
              <div className="flex flex-col space-y-2">
                <Label className="text-base font-medium">Recorrência</Label>
                <div className="border-input bg-background flex h-12 items-center gap-3 rounded-md border px-3">
                  <Switch
                    id="edit-recorrente"
                    checked={editForm.recorrente}
                    onCheckedChange={(checked) =>
                      setEditForm((prev) => ({ ...prev, recorrente: checked }))
                    }
                  />
                  <Label htmlFor="edit-recorrente" className="cursor-pointer text-sm font-normal">
                    {editForm.recorrente ? 'Recorrente (todos os meses)' : 'Apenas este mês'}
                  </Label>
                </div>
              </div>
            )}

            {/* Tipo de Gasto - Largura total */}
            <div className="flex flex-col space-y-2">
              <Label className="text-base font-medium">Tipo de Gasto</Label>
              <div className="bg-background flex min-h-[3rem] flex-col items-center gap-2 rounded-md border p-4">
                <TypeSelector
                  value={editForm.type}
                  onChange={(value) => setEditForm((prev) => ({ ...prev, type: value }))}
                  allTypes={allTypes}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="h-11 px-6"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isFormValid || editTaskMutation.isPending}
              className="h-11 px-8"
            >
              {editTaskMutation.isPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});
