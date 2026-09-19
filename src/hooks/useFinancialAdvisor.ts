import { useState, useCallback, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const ADVISOR_INACTIVITY_TIMEOUT_MS = 45_000;

export type FinancialAdvisorErrorCode =
  | 'session'
  | 'service'
  | 'stream'
  | 'timeout'
  | 'generic';

interface FinancialAdvisorPeriod {
  month: number;
  year: number;
}

interface FinancialAdvisorState {
  analysis: string;
  isLoading: boolean;
  error: FinancialAdvisorErrorCode | null;
  retrySeconds: number | null;
  analyzeFinances: (period: FinancialAdvisorPeriod) => void;
  reset: () => void;
}

export function useFinancialAdvisor(): FinancialAdvisorState {
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState<FinancialAdvisorErrorCode | null>(null);
  const [retrySeconds, setRetrySeconds] = useState<number | null>(null);
  const activeRequestRef = useRef<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: async (period: FinancialAdvisorPeriod) => {
      activeRequestRef.current?.abort('replaced');
      const controller = new AbortController();
      activeRequestRef.current = controller;

      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const armInactivityTimeout = () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(
          () => controller.abort('timeout'),
          ADVISOR_INACTIVITY_TIMEOUT_MS
        );
      };

      setAnalysis('');
      setError(null);
      setRetrySeconds(null);
      armInactivityTimeout();

      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
          throw new Error('SESSION_INVALID');
        }

        const token = sessionData.session.access_token;
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const response = await fetch(
          `${supabaseUrl}/functions/v1/financial-advisor`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              apikey: supabaseAnonKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ period }),
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          const body = await response.text();
          let parsed: Record<string, unknown> = {};
          try {
            parsed = JSON.parse(body);
          } catch {
            /* resposta sem JSON */
          }

          if (response.status === 429 || parsed.error === 'QUOTA_EXCEEDED') {
            setRetrySeconds((parsed.retrySeconds as number) ?? null);
            throw new Error('QUOTA_EXCEEDED');
          }

          if (parsed.error === 'GEMINI_ERROR') {
            throw new Error('SERVICE_ERROR');
          }

          throw new Error('REQUEST_ERROR');
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('STREAM_UNAVAILABLE');

        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          armInactivityTimeout();
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setAnalysis(accumulated);
        }

        return accumulated;
      } catch (caught) {
        if (controller.signal.aborted) {
          throw new Error(
            controller.signal.reason === 'timeout' ? 'TIMEOUT' : 'CANCELLED'
          );
        }
        throw caught;
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        if (activeRequestRef.current === controller) {
          activeRequestRef.current = null;
        }
      }
    },
    onError: (caught: Error) => {
      switch (caught.message) {
        case 'QUOTA_EXCEEDED':
        case 'CANCELLED':
          return;
        case 'SESSION_INVALID':
          setError('session');
          return;
        case 'SERVICE_ERROR':
          setError('service');
          return;
        case 'STREAM_UNAVAILABLE':
          setError('stream');
          return;
        case 'TIMEOUT':
          setError('timeout');
          return;
        default:
          setError('generic');
      }
    },
  });

  const analyzeFinances = useCallback(
    (period: FinancialAdvisorPeriod) => {
      mutation.mutate(period);
    },
    [mutation]
  );

  const reset = useCallback(() => {
    activeRequestRef.current?.abort('reset');
    activeRequestRef.current = null;
    mutation.reset();
    setAnalysis('');
    setError(null);
    setRetrySeconds(null);
  }, [mutation]);

  useEffect(
    () => () => {
      activeRequestRef.current?.abort('unmount');
    },
    []
  );

  return {
    analysis,
    isLoading: mutation.isPending,
    error,
    retrySeconds,
    analyzeFinances,
    reset,
  };
}
