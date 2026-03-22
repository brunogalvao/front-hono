import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const GRADIENT =
  'linear-gradient(90deg, #3b82f6 0%, #a855f7 20%, #ec4899 50%, #a855f7 80%, #3b82f6 100%)';

interface GsapHeroTitleProps {
  text: string;
  className?: string;
}

export function GsapHeroTitle({ text, className }: GsapHeroTitleProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const letters = text.split('');
  const n = letters.length;

  useGSAP(
    () => {
      const letterEls = Array.from(
        containerRef.current?.querySelectorAll<HTMLElement>('.gsap-letter') ?? [],
      );
      if (!letterEls.length) return;

      // 1. Entrance: each letter drops from above with stagger
      gsap.from(letterEls, {
        y: -80,
        opacity: 0,
        duration: 0.8,
        stagger: 0.07,
        ease: 'back.out(2)',
      });

      // 2. Shimmer: continuously scroll backgroundPosition on all letters in sync
      const state = { offset: 0 };
      gsap.to(state, {
        offset: 500,
        duration: 8,
        repeat: -1,
        ease: 'none',
        onUpdate() {
          letterEls.forEach((el, i) => {
            const basePos = n > 1 ? (i / (n - 1)) * 100 : 0;
            el.style.backgroundPosition = `${basePos + state.offset}% 0%`;
          });
        },
      });
    },
    { scope: containerRef },
  );

  return (
    <span ref={containerRef} className={cn('inline-block', className)}>
      {letters.map((char, i) => (
        <span
          key={i}
          className="gsap-letter inline-block bg-clip-text text-transparent"
          style={{
            backgroundImage: GRADIENT,
            backgroundSize: `${n * 100}%`,
            backgroundPosition: `${n > 1 ? (i / (n - 1)) * 100 : 0}% 0%`,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
