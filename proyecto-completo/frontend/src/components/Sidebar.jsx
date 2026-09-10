import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, HelpCircle, Home, LogOut, Menu, Package, X } from 'lucide-react';
import { removeToken } from '../utils/auth';

export const navItems = [
  { label: 'Inicio', href: '/dashboard', icon: Home, end: true },
  { label: 'Facturación', href: '/dashboard/facturacion', icon: CreditCard },
  { label: 'Mis Servicios', href: '/dashboard/servicios', icon: Package },
  { label: 'Soporte', href: '/dashboard/soporte', icon: HelpCircle },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    removeToken();
    navigate('/login');
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-card px-5 py-6 transition-transform duration-200 lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="mb-10 flex items-center justify-between px-2">
        <NavLink to="/dashboard" className="flex items-center gap-3" onClick={onClose}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            C
          </span>
          <span className="leading-tight">
            <strong className="block text-base text-brand-dark">ConectaMax</strong>
            <small className="text-xs text-muted-foreground">Telecom</small>
          </span>
        </NavLink>
        <button
          type="button"
          aria-label="Cerrar menú"
          className="rounded-lg p-2 text-muted-foreground lg:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-2" aria-label="Navegación principal">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Menú principal
        </p>
        {navItems.map(({ label, href, icon: Icon, end }) => {
          const active =
            end
              ? location.pathname === href
              : location.pathname === href || location.pathname.startsWith(`${href}/`);

          return (
            <NavLink
              key={href}
              to={href}
              end={end}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <LogOut className="h-5 w-5" />
        Cerrar sesión
      </button>
    </aside>
  );
}

export function MobileMenuButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Abrir menú"
      className="rounded-xl border border-border bg-card p-2.5 text-muted-foreground lg:hidden"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
