import { useState } from "react";
import { createTask } from "@/service/createTask";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AiOutlinePlus } from "react-icons/ai";

export function AddTaskDialog({
  onTaskCreated,
}: {
  onTaskCreated: () => void;
}) {
  const [title, setTitle] = useState("");

  const handleSubmit = async () => {
    if (!title) return;
    await createTask({ title, done: false });
    onTaskCreated();
    setTitle("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded-full">
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

        <Input
          placeholder="Título da tarefa"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button variant="secondary">Cancelar</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleSubmit}>Salvar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
