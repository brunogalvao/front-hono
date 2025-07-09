export async function getInvestmentAdvice(
  totalIncome: number,
  totalPaid: number,
) {
  const response = await fetch("/api/ia/investment-tip", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      income: totalIncome,
      expenses: totalPaid,
    }),
  });

  const data = await response.json();
  return data.advice ?? "Não foi possível gerar uma sugestão.";
}
