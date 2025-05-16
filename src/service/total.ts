import { API_BASE_URL } from "@/config/api";

export const totalItems = async (): Promise<number> => {
  const res = await fetch(`${API_BASE_URL}/tasks/total`);

  if (!res.ok) {
    console.error(`Erro: ${res.status}`);
    throw new Error("Erro ao buscar total de tarefas");
  }

  const data = await res.json();
  return data.total; // ✅ retorna apenas o número
};

export const totalPrice = async (): Promise<number> => {
  const res = await fetch(`${API_BASE_URL}/tasks/total-price`);

  if (!res.ok) {
    console.error(`Erro: ${res.status}`);
    throw new Error("Erro ao buscar total");
  }

  const data = await res.json();
  return data.totalPrice; // ✅ garante retorno como número, e não objeto
};
