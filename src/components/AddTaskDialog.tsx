import { useEffect, useState } from 'react';
import { createTask } from '@/service/task/createTask';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from './ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { taskSchema } from '@/schema/taskSchema';
import { NumericFormat } from 'react-number-format';
import { LiquidButton } from './animate-ui/buttons/liquid';
import { AnimateIcon } from './animate-ui/icons/icon';
import { Plus } from './animate-ui/icons/plus';
import { getExpenseTypes } from '@/service/expense-types/getExpenseTypes';
import { TypeSelector } from './TypeSelector';
import { TASK_STATUS, type TaskStatus } from '@/model/tasks.model';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type z from 'zod';
import { MESES_LISTA } from '@/model/mes.enum';
import { useCreateTask } from '@/hooks/use-tasks';
import { Loader } from 'lucide-react';

export function AddTaskDialog({
  onTaskCreated,
}: {
  onTaskCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<string | number>('');
  const [msg, setMsg] = useState('');
  const [type, setType] = useState('');
  const [allTypes, setAllTypes] = useState<string[]>([]);
  const [done, setDone] = useState<TaskStatus>(TASK_STATUS.Pendente);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof z.infer<typeof taskSchema>, string>>
  >({});
  const [form, setForm] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
  });

  // Hook para criar tarefa com invalidação automática do cache
  const createTaskMutation = useCreateTask();

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await getExpenseTypes();
        const names = types.map((t) => t.name);
        setAllTypes(names);
      } catch (error) {
        console.error('Erro ao carregar tipos de gasto:', error);
      }
    };

    fetchTypes();
  }, []);

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setType('');
    setDone(TASK_STATUS.Pendente);
    setFormErrors({});
    setMsg('');
    setDialogOpen(false);
  };

  const handleSubmit = async () => {
    const result = taskSchema.safeParse({
      title,
      price,
      done,
      type,
      mes: form.mes,
      ano: form.ano,
    });

    if (!result.success) {
      const formatted = result.error.format();
      const fieldErrors: Partial<Record<keyof typeof formatted, string>> = {
        title: formatted.title?._errors?.[0],
        price: formatted.price?._errors?.[0],
        type: formatted.type?._errors?.[0],
        done: formatted.done?._errors?.[0],
        mes: formatted.mes?._errors?.[0],
        ano: formatted.ano?._errors?.[0],
      };

      setFormErrors(fieldErrors);
      return;
    }

    try {
      await createTaskMutation.mutateAsync({
        ...result.data,
        done,
        mes: form.mes,
        ano: form.ano,
      });

      if (type.trim() && !allTypes.includes(type.trim())) {
        setAllTypes((prev) => [...prev, type.trim()]);
      }

      onTaskCreated();
      resetForm();
    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <LiquidButton
          className="text-white"
          onClick={() => setDialogOpen(true)}
        >
          <AnimateIcon animateOnHover>
            <div className="flex flex-row items-center gap-3 px-12">
              Adicionar
              <Plus className="size-5" />
            </div>
          </AnimateIcon>
        </LiquidButton>
      </DialogTrigger>

      <DialogContent
        className="w-full max-w-2xl"
        aria-describedby="add-task-description"
      >
        <DialogHeader>
          <DialogTitle>Adicionar novo Item</DialogTitle>
        </DialogHeader>

        <DialogDescription className="pb-4" id="add-task-description">
          Insira os detalhes do item que deseja adicionar.
          {msg && <span className="text-destructive text-sm">{msg}</span>}
          {Object.values(formErrors).length > 0 && (
            <span className="text-destructive text-sm">
              Preencha os campos obrigatórios.
            </span>
          )}
        </DialogDescription>

        <div className="flex flex-col space-y-6">
          {/* Título - Largura total */}
          <div className="flex flex-col space-y-2">
            <Label className="text-base font-medium">Título</Label>
            <Input
              placeholder="Título do Item"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 text-base"
            />
            {formErrors.title && (
              <span className="text-destructive text-sm">
                {formErrors.title}
              </span>
            )}
          </div>

          {/* Preço, Mês e Ano - Em linha */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col space-y-2">
              <Label className="text-base font-medium">Preço</Label>
              <NumericFormat
                value={price}
                onValueChange={(values) => {
                  setPrice(values.floatValue ?? '');
                }}
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                decimalScale={2}
                allowNegative={false}
                fixedDecimalScale={false}
                customInput={Input}
                className="h-12 text-base"
                autoComplete="off"
                placeholder="0,00"
              />
              {formErrors.price && (
                <span className="text-destructive text-sm">
                  {formErrors.price}
                </span>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <Label className="text-base font-medium">Mês</Label>
              <Select
                value={String(form.mes)}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, mes: parseInt(value) }))
                }
              >
                <SelectTrigger className="!h-12 !w-full text-base">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {MESES_LISTA.map((mes) => (
                    <SelectItem key={mes.value} value={mes.value}>
                      {mes.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-2">
              <Label className="text-base font-medium">Ano</Label>
              <Input
                type="number"
                value={form.ano}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ano: parseInt(e.target.value) }))
                }
                className="h-12 text-base"
                placeholder="2025"
              />
            </div>
          </div>

          {/* Status e Tipo de Gasto - Em linha */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex w-full flex-col space-y-2">
              <Label className="text-base font-medium">Status</Label>
              <Select
                value={done}
                onValueChange={(value) => setDone(value as TaskStatus)}
              >
                <SelectTrigger className="!h-12 !w-full text-base">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_STATUS).map(([key, label]) => (
                    <SelectItem key={key} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {formErrors.done && (
                <span className="text-destructive text-sm">
                  {formErrors.done}
                </span>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <Label className="text-base font-medium">Tipo de Gasto</Label>
              <div className="bg-background flex min-h-[6rem] flex-col items-start gap-2 rounded-md border p-4">
                <TypeSelector
                  value={type}
                  onChange={setType}
                  allTypes={allTypes}
                />

                {formErrors.type && (
                  <span className="text-destructive text-sm">
                    {formErrors.type}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={resetForm} className="h-11 px-6">
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={createTaskMutation.isPending}
            className="h-11 px-8"
          >
            {createTaskMutation.isPending ? (
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
  );
}
