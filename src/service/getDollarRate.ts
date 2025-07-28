// const ACCESS_KEY = "0ecb5a1fc652ab5a02581d58a8d2436d"; // Troque pela sua chave

export const getDollarRate = async (): Promise<number> => {
  const res = await fetch(
    "https://economia.awesomeapi.com.br/json/last/USD-BRL",
  );
  if (!res.ok) throw new Error("Erro ao buscar cotação do dólar");
  const data = await res.json();
  if (!data.USDBRL || !data.USDBRL.bid)
    throw new Error("Cotação não encontrada");
  return Number(data.USDBRL.bid);
};
