import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
// ui
import TituloPage from "@/components/TituloPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Table } from "@/components/ui/table";
import { Loader } from "@/components/animate-ui/icons/loader";
import { toast } from "sonner";
import { formatToBRL } from "@/utils/format";
// service
import { editIncome } from "@/service/income/editIncome";
import { createIncome } from "@/service/income/createIncome";
import { deleteIncome } from "@/service/income/deleteIncome";
import { totalIncomes } from "@/service/income/totalIncome";
import { getIncomes } from "@/service/income/getIncome";
// model's
import type { IncomeItem } from "@/model/incomes.model";
import { getNomeMes, MESES_LISTA } from "@/model/mes.enum";

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
      const data = await getIncomes(); // IncomeItem[]
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
          prev.map((item) => (item.id === editingId ? updated : item))
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
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteIncome(id);
      setIncomes((prev) => prev.filter((item) => item.id !== id));
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
            <Button onClick={handleAddOrEdit} className="px-10">
              {editingId ? "Atualizar" : "Adicionar"}
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent>
          {/* <CardHeader>
            Aqui será a tabela de rendimentos
            <CardDescription>
              Total de Rendimentos {formatToBRL(total)}
            </CardDescription>
          </CardHeader> */}

          {incomes.length <= 0 ? (
            <p className="p-0 text-center">Sem Rendimento</p>
          ) : (
            <Table>
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <TableCaption className="text-left">
                  Valor Total {formatToBRL(total)}
                </TableCaption>
              )}

              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Nome</TableHead>
                  <TableHead className="w-[200px]">Valor</TableHead>
                  <TableHead className="w-1/5 text-center">Mês e Ano</TableHead>
                  <TableHead className="w-1/5 text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {incomes.map((incomes) => (
                  <TableRow key={incomes.id}>
                    <TableCell>{incomes.descricao}</TableCell>
                    <TableCell>{formatToBRL(incomes.valor)}</TableCell>
                    <TableCell>
                      {getNomeMes(incomes.mes)} / {incomes.ano}
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setForm({
                              descricao: incomes.descricao ?? "",
                              valor: incomes.valor,
                              mes: incomes.mes,
                              ano: incomes.ano,
                            });
                            setEditingId(incomes.id);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(incomes.id)}
                        >
                          Deletar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* {loading ? (
            <Loading />
          ) : incomes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum rendimento cadastrado.
            </p>
          ) : (
            <ul className="space-y-2">
              {incomes.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between border-b py-1"
                >
                  <span>{item.descricao || "Sem descrição"}</span>
                  <span>{formatToBRL(item.valor)}</span>
                  <span>
                    {getNomeMes(item.mes)} / {item.ano}
                  </span>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setForm({
                          descricao: item.descricao ?? "",
                          valor: item.valor,
                          mes: item.mes,
                          ano: item.ano,
                        });
                        setEditingId(item.id);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      Deletar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )} */}
        </CardContent>
      </Card>
    </div>
  );
}

export default Income;
