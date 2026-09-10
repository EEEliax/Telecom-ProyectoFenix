import { useMemo, useState, useEffect } from 'react';
import { Search, Zap } from 'lucide-react';
import Card from '../components/dashboard/Card';
import Header from '../components/dashboard/Header';
import Status from '../components/dashboard/Status';
import { getToken } from '../utils/auth';

function filterTickets(query, tickets) {
  const normalized = query.toLowerCase();
  return tickets.filter((t) =>
    `${t.fecha_creacion} ${t.tipo_ticket} ${t.descripcion_problema}`.toLowerCase().includes(normalized),
  );
}

export default function SoportePage() {
  const [query, setQuery] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const filtered = useMemo(() => filterTickets(query, tickets), [query, tickets]);

  useEffect(() => {
    fetch('/api/dashboard/tickets/history', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Error fetching data');
        return r.json();
      })
      .then((data) => setTickets(data.tickets || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const openChat = () => window.dispatchEvent(new CustomEvent('conectamax:open-chat'));

  if (loading) {
    return (
      <>
        <Header
          title="Soporte"
          subtitle="Estamos para ayudarte con lo que necesites."
          action={
            <button
              type="button"
              onClick={openChat}
              className="hidden items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:scale-[1.01] hover:bg-primary/90 hover:shadow-md sm:flex"
            >
              <Zap className="h-4 w-4" />
              Nuevo ticket
            </button>
          }
        />
        <Card className="animate-pulse">
          <div className="h-64 w-full bg-muted" />
        </Card>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header
          title="Soporte"
          subtitle="Estamos para ayudarte con lo que necesitas."
          action={
            <button
              type="button"
              onClick={openChat}
              className="hidden items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:scale-[1.01] hover:bg-primary/90 hover:shadow-md sm:flex"
            >
              <Zap className="h-4 w-4" />
              Nuevo ticket
            </button>
          }
        />
        <Card>
          <p className="text-sm text-muted-foreground">Error al cargar los datos. Por favor, intenta nuevamente.</p>
        </Card>
      </>
    );
  }

  return (
    <>
      <Header
        title="Soporte"
        subtitle="Estamos para ayudarte con lo que necesitas."
        action={
          <button
            type="button"
            onClick={openChat}
            className="hidden items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:scale-[1.01] hover:bg-primary/90 hover:shadow-md sm:flex"
          >
            <Zap className="h-4 w-4" />
            Nuevo ticket
          </button>
        }
      />
      <Card>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-brand-dark">Historial de tickets</h2>
            <p className="mt-1 text-sm text-muted-foreground">Revisá el estado de tus consultas</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por fecha de creación..."
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none sm:w-56"
            />
          </div>
        </div>
        <div className="hidden md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-y border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-3 pr-4">Fecha de creación</th>
                <th className="py-3 pr-4">Tipo de ticket</th>
                <th className="py-3 pr-4">Resumen del problema</th>
                <th className="py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket) => (
                <tr key={ticket.fecha_creacion} className="border-b border-border last:border-0">
                  <td className="py-4 pr-4 text-muted-foreground">
                    {new Date(ticket.fecha_creacion).toLocaleDateString('es-AR')}
                  </td>
                  <td className="py-4 pr-4 font-medium text-brand-dark">{ticket.tipo_ticket}</td>
                  <td className="py-4 pr-4 text-muted-foreground">{ticket.descripcion_problema}</td>
                  <td className="py-4">
                    <Status tone={ticket.estado_ticket === 'Cerrado' ? 'gray' : 'blue'}>{ticket.estado_ticket}</Status>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 md:hidden">
          {filtered.map((ticket) => (
            <article key={ticket.fecha_creacion} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  {new Date(ticket.fecha_creacion).toLocaleDateString('es-AR')}
                </span>
                <Status tone={ticket.estado_ticket === 'Cerrado' ? 'gray' : 'blue'}>{ticket.estado_ticket}</Status>
              </div>
              <p className="mt-3 text-sm font-semibold text-brand-dark">{ticket.tipo_ticket}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{ticket.descripcion_problema}</p>
            </article>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No encontramos tickets.</p>
        )}
      </Card>
    </>
  );
}