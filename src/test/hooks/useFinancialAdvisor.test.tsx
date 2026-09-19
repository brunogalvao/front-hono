import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetSession } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { getSession: mockGetSession } },
}));

import { useFinancialAdvisor } from '@/hooks/useFinancialAdvisor';

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useFinancialAdvisor', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'user-token' } },
      error: null,
    });
  });

  it('envia somente o período e atualiza a análise durante o streaming', async () => {
    const encoder = new TextEncoder();
    const response = new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode('primeiro trecho'));
          controller.enqueue(encoder.encode(' e segundo trecho'));
          controller.close();
        },
      }),
      { status: 200 }
    );
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useFinancialAdvisor(), {
      wrapper: makeWrapper(),
    });

    act(() => result.current.analyzeFinances({ month: 9, year: 2026 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.analysis).toBe('primeiro trecho e segundo trecho');

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(String(request.body))).toEqual({
      period: { month: 9, year: 2026 },
    });
    expect(request.signal).toBeInstanceOf(AbortSignal);
  });

  it('mapeia falha do Gemini para um erro localizado estável', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'GEMINI_ERROR' }), {
          status: 502,
        })
      )
    );

    const { result } = renderHook(() => useFinancialAdvisor(), {
      wrapper: makeWrapper(),
    });

    act(() => result.current.analyzeFinances({ month: 9, year: 2026 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('service');
  });
});
