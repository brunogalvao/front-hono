import { useEffect, useState } from "react";
import { createTask } from "@/service/task/createTask";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { taskSchema } from "@/schema/taskSchema";
import { NumericFormat } from "react-number-format";
import { LiquidButton } from "./animate-ui/buttons/liquid";
import { AnimateIcon } from "./animate-ui/icons/icon";
import { Plus } from "./animate-ui/icons/plus";
import { getExpenseTypes } from "@/service/expense-types/getExpenseTypes";
import { TypeSelector } from "./TypeSelector";
import { TASK_STATUS, type TaskStatus } from "@/model/tasks.model";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function AddTaskDialog({
  onTaskCreated,
}: {
  onTaskCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<string | number>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [type, setType] = useState("");
  const [allTypes, setAllTypes] = useState<string[]>([]);
  const [done, setDone] = useState<TaskStatus>(TASK_STATUS.Pendente);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await getExpenseTypes();
        const names = types.map((t) => t.name);
        setAllTypes(names);
      } catch (error) {
        console.error("Erro ao carregar tipos de gasto:", error);
      }
    };

    fetchTypes();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = taskSchema.safeParse({
      title,
      price,
      done,
      type,
    });

    if (!result.success) {
      console.error(result.error.format());
      setMsg("Erro no formulário.");
      setIsSubmitting(false);
      return;
    }

    if (!type.trim()) {
      setMsg("Tipo de gasto é obrigatório.");
      setIsSubmitting(false);
      return;
    }

    // Fix: Ensure 'done' is TaskStatus.Pending, not boolean
    await createTask({
      ...result.data,
      done: TASK_STATUS.Pendente,
    });

    // Atualizar a Lista
    if (type.trim() && !allTypes.includes(type.trim())) {
      setAllTypes((prev) => [...prev, type.trim()]);
    }

    onTaskCreated();
    setTitle("");
    setPrice("");
    setType("");
    setIsSubmitting(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <LiquidButton className="text-white">
          <AnimateIcon animateOnHover>
            <div className="px-12 flex flex-row items-center gap-3">
              Adicionar
              <Plus className="size-5" />
            </div>
          </AnimateIcon>
        </LiquidButton>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar novo Item</DialogTitle>
          <DialogDescription className="flex flex-col gap-3">
            Insira o título do Item que deseja adicionar.
            {msg && (
              <span className="text-destructive text-sm mt-2">{msg}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <Label>Título</Label>
            <Input
              placeholder="Título do Item"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label>Preço</Label>
            <NumericFormat
              value={price}
              onValueChange={(values) => {
                setPrice(values.floatValue ?? "");
              }}
              thousandSeparator="."
              decimalSeparator=","
              prefix="R$ "
              decimalScale={2}
              allowNegative={false}
              fixedDecimalScale={false}
              customInput={Input}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={done}
              onValueChange={(value) => setDone(value as TaskStatus)}
            >
              <SelectTrigger className="w-full">
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
          </div>

          <div className="flex flex-col space-y-2">
            {/* <Label>Tipo de Gasto</Label> */}
            <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background items-center">
              <TypeSelector
                value={type}
                onChange={setType}
                allTypes={allTypes}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button variant="secondary">Cancelar</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
