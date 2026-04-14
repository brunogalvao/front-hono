import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { buttonVariants } from '@/components/ui/button';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { LogIn } from '@/components/animate-ui/icons/log-in';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Recursos', href: '#recursos' },
  { label: 'Estatísticas', href: '#estatisticas' },
];

function scrollToSection(href: string) {
  const id = href.replace('#', '');
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.replace('#', ''));

    const onScroll = () => {
      setScrolled(window.scrollY > 20);

      const offset = 80; // altura da navbar sticky
      const scrollY = window.scrollY + offset;

      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // inicializa no mount
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-background/80 shadow-sm backdrop-blur-md'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex flex-col items-center">
        <div className="flex w-full flex-row justify-between px-6 py-7">
          {/* Logo */}
          <span className="text-lg font-bold tracking-tight">
            Task's Finance
          </span>

          {/* Links de seção */}
          <nav className="hidden items-center gap-3 md:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className={cn(
                  'cursor-pointer rounded-full px-6 py-1.5 text-sm font-medium transition-colors',
                  activeSection === link.href.replace('#', '')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Login */}
          <Link
            to="/login"
            className={cn(
              buttonVariants({ variant: 'default', size: 'sm' }),
              'gap-2 rounded-full px-6!'
            )}
          >
            Entrar
            <AnimateIcon animateOnHover animation="default-loop">
              <LogIn className="size-4" />
            </AnimateIcon>
          </Link>
        </div>

        <Separator orientation="horizontal" />
      </div>
    </header>
  );
}
