import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DeferredContentProps {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
}

export function DeferredContent({
  children,
  className,
  rootMargin = '200px 0px',
}: DeferredContentProps) {
  const boundaryRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const boundary = boundaryRef.current;
    if (!boundary || !('IntersectionObserver' in window)) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin }
    );

    observer.observe(boundary);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={boundaryRef} className={cn('w-full', className)}>
      {shouldRender ? <Suspense fallback={null}>{children}</Suspense> : null}
    </div>
  );
}
