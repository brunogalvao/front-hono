import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
// ui
import TituloPage from "@/components/TituloPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
// service
import { editIncome } from "@/service/income/editIncome";
import { createIncome } from "@/service/income/createIncome";
import { deleteIncome } from "@/service/income/deleteIncome";
import { totalIncomes } from "@/service/income/totalIncome";
import { getIncomes } from "@/service/income/getIncome";
// model's
import type { IncomeItem } from "@/model/incomes.model";
import { MESES_LISTA } from "@/model/mes.enum";
// import { Pencil, Trash } from "lucide-react";
import CardIncome from "@/components/CardIncome";
import { LiquidButton } from "@/components/animate-ui/buttons/liquid";
import { Plus } from "@/components/animate-ui/icons/plus";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { RefreshCcw } from "@/components/animate-ui/icons/refresh-ccw";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/animate-ui/components/tooltip";
import MonthIncome from "@/components/monthIncome";

function Income() {
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState<number>(0);
  const [form, setForm] = useState({
    descricao: "",
    valor: 0,
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
  });
  const [reloadFlag, setReloadFlag] = useState(Date.now());

  const loadTotal = async () => {
    try {
      const total = await totalIncomes();
      setTotal(total);
    } catch (err) {
      console.error("Erro ao carregar total de rendimentos:", err);
    }
  };

  const load = async () => {
    try {
      const data = await getIncomes();
      setIncomes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrEdit = async () => {
    try {
      if (editingId) {
        if (!editingId) return;

        const updated = await editIncome({ ...form, id: editingId });
        setIncomes((prev) =>
          prev.map((item) => (item.id === editingId ? updated : item)),
        );

        toast.success("Cadastro Editado");
      } else {
        const newIncome = await createIncome(form);
        setIncomes((prev) => [...prev, newIncome as IncomeItem]);

        toast.success("Salvo novo cadastro");
      }

      await loadTotal();

      setForm({
        descricao: "",
        valor: 0,
        mes: new Date().getMonth() + 1,
        ano: new Date().getFullYear(),
      });
      setEditingId(null);
    } catch (err) {
      console.error("Erro ao salvar:", err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Erro desconhecido";

      toast.error(errorMessage);
    }
    setReloadFlag(Date.now()); // força nova leitura
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteIncome(id);
      setIncomes((prev) => prev.filter((item) => item.id !== id));
      setReloadFlag(Date.now());
      await loadTotal();
    } catch (err) {
      console.error("Erro ao deletar:", err);
    }
  };

  useEffect(() => {
    load();
    loadTotal();
  }, []);

  return (
    <div className="space-y-6">
      <TituloPage titulo="Rendimentos" />

      <MonthIncome
        reloadTrigger={reloadFlag}
        onSelectMes={(mes) => setForm((f) => ({ ...f, mes }))}
      />

      <div className="flex flex-col space-y-6">
        <div className="flex flex-row gap-3">
          <div className="flex flex-col space-y-3 w-full">
            <Label>Descrição</Label>
            <Input
              className="w-full"
              placeholder="Descrição"
              value={form.descricao}
              onChange={(e) =>
                setForm((f) => ({ ...f, descricao: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col space-y-3 w-full">
            <Label>Salário</Label>
            <NumericFormat
              value={form.valor}
              onValueChange={({ floatValue }) => {
                setForm((f) => ({ ...f, valor: floatValue ?? 0 }));
              }}
              thousandSeparator="."
              decimalSeparator=","
              prefix="R$ "
              decimalScale={2}
              allowNegative={false}
              fixedDecimalScale={false} // 👈 isso remove zeros fixos no final
              customInput={Input}
            />
          </div>
        </div>

        <div className="flex flex-row gap-3">
          <div className="flex flex-col space-y-3 w-full">
            <Label>Mês</Label>
            <Select
              value={String(form.mes)}
              onValueChange={(value) =>
                setForm((f) => ({ ...f, mes: parseInt(value) }))
              }
            >
              <SelectTrigger className="w-full">
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

          <div className="flex flex-col space-y-3 w-full">
            <Label>Ano</Label>
            <Input
              type="number"
              value={form.ano}
              onChange={(e) =>
                setForm((f) => ({ ...f, ano: parseInt(e.target.value) }))
              }
            />
          </div>
          <div className="flex items-end">
            <AnimateIcon animateOnHover>
              <LiquidButton className="text-white" onClick={handleAddOrEdit}>
                <div className="px-12 flex flex-row items-center gap-3">
                  {editingId ? (
                    <>
                      Atualizar
                      <RefreshCcw />
                    </>
                  ) : (
                    <>
                      Adicionar
                      <Plus className="size-5" />
                    </>
                  )}
                </div>
              </LiquidButton>
            </AnimateIcon>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Rendimentos</CardTitle>
        </CardHeader>
        <CardContent>
          {incomes.length <= 0 ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  {/* <span>Hover me</span> */}
                  <p className="p-0 text-center text-sm text-zinc-500 cursor-pointer">
                    Sem Rendimento
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  Adicione seus rendimento nos campos acima.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <CardIncome
              incomes={incomes}
              loading={loading}
              total={total}
              setForm={setForm}
              setEditingId={setEditingId}
              handleDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Income;
