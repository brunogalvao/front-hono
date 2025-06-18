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
// import { AiOutlinePlus } from "react-icons/ai";

import { taskSchema } from "@/schema/taskSchema";
import { NumericFormat } from "react-number-format";
import { LiquidButton } from "./animate-ui/buttons/liquid";
import { AnimateIcon } from "./animate-ui/icons/icon";
// import { RefreshCcw } from "./animate-ui/icons/refresh-ccw";
import { Plus } from "./animate-ui/icons/plus";

export function AddTaskDialog({
  onTaskCreated,
}: {
  onTaskCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<string | number>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

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
      // alert("Erro no formulário.");
      setMsg("Erro no formulário.");

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
          <DialogTitle>Adicionar nova tarefa</DialogTitle>
          <DialogDescription className="flex flex-col gap-3">
            Insira o título da tarefa que deseja adicionar.
            <p>{msg}</p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
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
