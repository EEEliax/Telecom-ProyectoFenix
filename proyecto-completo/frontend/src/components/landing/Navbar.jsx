import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Radio, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const navLinks = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Sobre Nosotros', href: '#sobre-nosotros' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Planes', href: '#planes' },
  { label: 'Soporte', href: '#soporte' },
  { label: 'Contacto', href: '#contacto' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'border-b border-border bg-card/90 shadow-sm backdrop-blur-md' : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#inicio" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <Radio className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-brand-dark">
            ConectaMax <span className="text-primary">Telecom</span>
          </span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-secondary hover:text-primary"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* "Acceder al Portal" — redirige a /login */}
        <div className="hidden lg:block">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105 hover:bg-primary/90"
          >
            Acceder al Portal
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground lg:hidden"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-card px-4 pb-4 pt-2 shadow-md lg:hidden">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="mt-3 flex w-full items-center justify-center rounded-xl bg-primary py-2.5 text-sm font-semibold text-white"
          >
            Acceder al Portal
          </Link>
        </div>
      )}
    </header>
  );
}
