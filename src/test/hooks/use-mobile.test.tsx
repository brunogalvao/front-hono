import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useIsMobile } from '@/hooks/use-mobile';

function setViewport(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  });
}

describe('useIsMobile', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns the mobile mode on the first browser render', () => {
    setViewport(390);
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query) =>
        ({
          matches: true,
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as MediaQueryList
    );

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('reacts to media query changes at the 768px breakpoint', () => {
    setViewport(1024);
    let onChange: (() => void) | undefined;
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query) =>
        ({
          matches: false,
          media: query,
          onchange: null,
          addEventListener: (
            _type: string,
            listener: EventListenerOrEventListenerObject
          ) => {
            onChange = listener as () => void;
          },
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as MediaQueryList
    );

    const { result } = renderHook(() => useIsMobile());
    setViewport(767);
    act(() => onChange?.());

    expect(result.current).toBe(true);
  });
});
