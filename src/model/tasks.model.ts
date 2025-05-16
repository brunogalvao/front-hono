export type Task = {
  id: string;
  title: string;
  price: number | null;
  done: boolean;
  created_at?: string;
};

// Modelo de criação
export type NewTask = Omit<Task, "id" | "created_at">;
