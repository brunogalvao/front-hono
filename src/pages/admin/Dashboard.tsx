import { useEffect, useState } from 'react';
import TituloPage from '@/components/TituloPage';
import { getDollarRate } from '@/service/getDollarRate';
import { totalIncomes } from '@/service/income/totalIncome';
import { formatToBRL } from '@/utils/format';

const Dashboard = () => {
  const [dollarRate, setDollarRate] = useState<number | null>(null);
  const [rateError, setRateError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);

  const loadTotal = async () => {
    try {
      const total = await totalIncomes();
      setTotal(total);
    } catch (err) {
      console.error('Erro ao carregar total de rendimentos:', err);
    }
  };

  useEffect(() => {
    loadTotal();

    getDollarRate()
      .then((rate) => {
        setDollarRate(rate);
        setRateError(null);
      })
      .catch((err) => {
        console.error('Erro ao buscar cotação do dólar:', err);
        setRateError('Erro ao buscar cotação do dólar.');
        setDollarRate(null);
      });
  }, []);

  const valorDolar = total / (dollarRate ?? 0);

  return (
    <div className="space-y-6">
      <TituloPage titulo="Home" />
      <div className="bg-muted rounded-md p-4">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold">💡 Sugestão de Investimento</h2>
          {rateError && <span className="text-red-500">{rateError}</span>}
          {dollarRate !== null && (
            <span className="text-muted-foreground flex flex-col text-center text-sm">
              Dólar <b>R$ {dollarRate.toFixed(2)}</b>
            </span>
          )}
        </div>
      </div>
      {/*
        Trazer o total de rendimento,
        e ajustar para trazer o total de rendimentos Mensal
        e Task total mensal
      */}
      <div>Total de Rendimentos{formatToBRL(total)}</div>
      <div>{dollarRate}</div>
      <div className="flex flex-col">
        <span>Total de Dolar x Rendimento</span>
        {valorDolar.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })}
      </div>
    </div>
  );
};

export default Dashboard;
