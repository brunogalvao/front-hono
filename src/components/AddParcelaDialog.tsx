import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NumericFormat } from 'react-number-format';
import { TypeSelector } from '@/components/TypeSelector';
import { MESES_LISTA } from '@/model/mes.enum';
import { TASK_STATUS } from '@/model/tasks.model';
import { getExpenseTypes } from '@/service/expense-types/getExpenseTypes';
import { useCreateTask } from '@/hooks/use-tasks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader } from 'lucide-react';
import { LiquidButton } from './animate-ui/buttons/liquid';
import { AnimateIcon } from './animate-ui/icons/icon';
import { Plus } from './animate-ui/icons/plus';

interface AddParcelaDialogProps {
  onCreated: () => void;
}

export function AddParcelaDialog({ onCreated }: AddParcelaDialogProps) {
  const [open, setOpen] = useState(false);
  const [allTypes, setAllTypes] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '',
    price: '' as string | number,
    parcela_total: 2,
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    type: '',
  });

  const createTaskMutation = useCreateTask();

  useEffect(() => {
    getExpenseTypes()
      .then((types) => setAllTypes(types.map((t) => t.name)))
      .catch(console.error);
  }, []);

  const resetForm = () => {
    setForm({
      title: '',
      price: '',
      parcela_total: 2,
      mes: new Date().getMonth() + 1,
      ano: new Date().getFullYear(),
      type: '',
    });
    setOpen(false);
  };

  const isValid =
    String(form.title).trim().length > 0 &&
    Number(form.price) > 0 &&
    form.parcela_total >= 2;

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      await createTaskMutation.mutateAsync({
        title: form.title.trim(),
        price: Number(form.price),
        done: TASK_STATUS.Pendente,
        mes: form.mes,
        ano: form.ano,
        type: form.type,
        recorrente: false,
        parcela_total: form.parcela_total,
      });
      onCreated();
      resetForm();
    } catch (err) {
      console.error('Erro ao criar compra parcelada:', err);
    }
  };

  const valorParcela =
    Number(form.price) > 0 && form.parcela_total >= 2
      ? Number(form.price) / form.parcela_total
      : null;

  return (
    <>
      <LiquidButton className="text-white" onClick={() => setOpen(true)}>
        <AnimateIcon animateOnHover>
          <div className="flex flex-row items-center gap-3 px-12">
            Adicionar
            <Plus className="size-5" />
          </div>
        </AnimateIcon>
      </LiquidButton>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Compra Parcelada</DialogTitle>
          </DialogHeader>
          <DialogDescription id="add-parcela-description">
            Cadastre uma compra parcelada. As parcelas serão criadas automaticamente nos meses seguintes.
          </DialogDescription>

          <div className="flex flex-col space-y-5">
            {/* Título */}
            <div className="flex flex-col space-y-2">
              <Label className="text-base font-medium">Descrição</Label>
              <Input
                placeholder="Ex: iPhone 16, Notebook, etc."
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="h-12 text-base"
              />
            </div>

            {/* Valor total + Parcelas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <Label className="text-base font-medium">Valor total</Label>
                <NumericFormat
                  value={form.price}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, price: v.floatValue ?? '' }))
                  }
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  allowNegative={false}
                  fixedDecimalScale={false}
                  customInput={Input}
                  className="h-12 text-base"
                  placeholder="0,00"
                  autoComplete="off"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label className="text-base font-medium">Nº de parcelas</Label>
                <Input
                  type="number"
                  min={2}
                  max={360}
                  value={form.parcela_total}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      parcela_total: parseInt(e.target.value) || 2,
                    }))
                  }
                  className="h-12 text-base"
                />
                {valorParcela !== null && (
                  <span className="text-muted-foreground text-xs">
                    ≈ R$ {valorParcela.toFixed(2)} / parcela
                  </span>
                )}
              </div>
            </div>

            {/* Mês + Ano de início */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <Label className="text-base font-medium">Mês de início</Label>
                <Select
                  value={String(form.mes)}
                  onValueChange={(v) => setForm((p) => ({ ...p, mes: parseInt(v) }))}
                >
                  <SelectTrigger className="h-12! w-full text-base">
                    <SelectValue />
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
                    setForm((p) => ({ ...p, ano: parseInt(e.target.value) }))
                  }
                  className="h-12 text-base"
                />
              </div>
            </div>

            {/* Categoria */}
            <div className="flex flex-col space-y-2">
              <Label className="text-base font-medium">Categoria</Label>
              <div className="bg-background min-h-12 rounded-md border p-4">
                <TypeSelector
                  value={form.type}
                  onChange={(v) => setForm((p) => ({ ...p, type: v }))}
                  allTypes={allTypes}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={resetForm} className="h-11 px-6">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || createTaskMutation.isPending}
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
    </>
  );
}
