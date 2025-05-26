import { useEffect, useState } from "react";
import TituloPage from "@/components/TituloPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createIncome } from "@/service/income/createIncome";
import { getIncomes } from "@/service/income/getIncome";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { IncomeItem } from "@/model/incomes.model";
import { NumericFormat } from "react-number-format";
import { deleteIncome } from "@/service/income/deleteIncome";
import { formatToBRL } from "@/utils/format";
import { getNomeMes, MESES_LISTA } from "@/model/mes.enum";

function Income() {
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [form, setForm] = useState({
    descricao: "",
    valor: 0,
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
  });

  const load = async () => {
    try {
      const data = await getIncomes(); // IncomeItem[]
      setIncomes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async () => {
    try {
      const newIncome = await createIncome(form);
      console.log("🧾 Novo rendimento:", newIncome);
      setIncomes((prev) => [...prev, newIncome as IncomeItem]);

      setForm({
        descricao: "",
        valor: 0,
        mes: new Date().getMonth() + 1,
        ano: new Date().getFullYear(),
      });
    } catch (err) {
      console.error("Erro ao adicionar:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteIncome(id);
      setIncomes((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Erro ao deletar:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <TituloPage titulo="Rendimentos" />

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

        <div className="flex flex-col space-y-3 w-32">
          <Label>Mês</Label>
          <Select
            value={String(form.mes)}
            onValueChange={(value) =>
              setForm((f) => ({ ...f, mes: parseInt(value) }))
            }
          >
            <SelectTrigger>
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

        <div className="flex flex-col space-y-3 w-32">
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
          <Button onClick={handleAdd} className="px-10">
            Adicionar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>Aqui será a tabela de rendimentos</CardHeader>
        <CardContent>
          {incomes.length === 0 ? (
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

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    Deletar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Income;
