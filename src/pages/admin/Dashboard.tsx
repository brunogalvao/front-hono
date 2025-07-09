import { useEffect, useState } from "react";
import TituloPage from "@/components/TituloPage";
import { totalItems } from "@/service/total";
import { totalIncomes } from "@/service/income/totalIncome";
import { getInvestmentAdvice } from "@/service/ai/investmentAdvice";

const Dashboard = () => {
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAdvice = async () => {
      setLoading(true);
      try {
        const [income, paid] = await Promise.all([
          totalIncomes(),
          totalItems(),
        ]);

        const msg = await getInvestmentAdvice(income, paid);
        setAdvice(msg);
      } catch (error) {
        console.error("Erro ao obter sugestão de investimento:", error);
        setAdvice("Não foi possível obter uma sugestão.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdvice();
  }, []);

  return (
    <div className="space-y-6">
      <TituloPage titulo="Home" />
      <div className="bg-muted p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2">
          💡 Sugestão de Investimento
        </h2>
        {loading ? (
          <p>Carregando sugestão...</p>
        ) : (
          <p className="text-muted-foreground">{advice}</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
