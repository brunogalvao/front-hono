import { useState } from "react";
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
import { AiOutlinePlus } from "react-icons/ai";

import { taskSchema } from "@/schema/taskSchema";
import { NumericFormat } from "react-number-format";

export function AddTaskDialog({
  onTaskCreated,
}: {
  onTaskCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<string | number>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Salvar
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = taskSchema.safeParse({
      title,
      price,
      done: false,
    });

    if (!result.success) {
      console.error(result.error.format());
      alert("Erro no formulário.");
      return;
    }

    await createTask(result.data);
    onTaskCreated();
    setTitle("");
    setPrice("");
    setIsSubmitting(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded-full cursor-pointer">
          Adicionar
          <AiOutlinePlus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar nova tarefa</DialogTitle>
          <DialogDescription>
            Insira o título da tarefa que deseja adicionar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-2">
          <Label>Titulo</Label>
          <Input
            placeholder="Título da tarefa"
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
            fixedDecimalScale={false} // 👈 isso remove zeros fixos no final
            customInput={Input}
          />
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
