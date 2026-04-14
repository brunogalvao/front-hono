import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface FinancialAdvisorPeriod {
  month: number;
  year: number;
}

interface FinancialAdvisorState {
  analysis: string;
  isLoading: boolean;
  error: string | null;
  analyzeFinances: (period: FinancialAdvisorPeriod) => void;
  reset: () => void;
}

export function useFinancialAdvisor(): FinancialAdvisorState {
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (period: FinancialAdvisorPeriod) => {
      setAnalysis('');
      setError(null);

      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user)
        throw new Error('Usuário não autenticado.');

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError || !sessionData.session)
        throw new Error('Sessão inválida.');

      const token = sessionData.session.access_token;
      const user = userData.user;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      console.log('[FinancialAdvisor] token prefix:', token?.slice(0, 20));
      console.log(
        '[FinancialAdvisor] anonKey prefix:',
        supabaseAnonKey?.slice(0, 20)
      );
      console.log(
        '[FinancialAdvisor] url:',
        `${supabaseUrl}/functions/v1/financial-advisor`
      );

      const response = await fetch(
        `${supabaseUrl}/functions/v1/financial-advisor`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: supabaseAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id, period }),
        }
      );

      if (!response.ok) {
        const body = await response.text();
        let msg = `Erro ${response.status}`;
        try {
          const parsed = JSON.parse(body);
          msg = parsed.error ?? msg;
        } catch {
          // body não é JSON
        }
        throw new Error(msg);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Stream não disponível.');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setAnalysis(accumulated);
      }

      return accumulated;
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const analyzeFinances = useCallback(
    (period: FinancialAdvisorPeriod) => {
      mutation.mutate(period);
    },
    [mutation]
  );

  const reset = useCallback(() => {
    mutation.reset();
    setAnalysis('');
    setError(null);
  }, [mutation]);

  return {
    analysis,
    isLoading: mutation.isPending,
    error,
    analyzeFinances,
    reset,
  };
}
