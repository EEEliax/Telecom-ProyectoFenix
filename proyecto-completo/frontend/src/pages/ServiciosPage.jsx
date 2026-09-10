import { useEffect, useState } from 'react';
import {
  Cloud,
  Headphones,
  Phone,
  ShieldCheck,
  Smartphone,
  Tv,
  Wifi,
} from 'lucide-react';
import Card from '../components/dashboard/Card';
import Header from '../components/dashboard/Header';
import Status from '../components/dashboard/Status';
import { getToken } from '../utils/auth';

const labels = [
  { key: 'onlineSecurity', name: 'Seguridad Online', icon: ShieldCheck },
  { key: 'onlineBackup', name: 'Backup en la Nube', icon: Cloud },
  { key: 'deviceProtection', name: 'Protección de Dispositivos', icon: Smartphone },
  { key: 'techSupport', name: 'Soporte Técnico', icon: Headphones },
  { key: 'streamingTV', name: 'Streaming TV', icon: Tv },
  { key: 'streamingMovies', name: 'Streaming Películas', icon: Tv },
];

function AddonList({ subServices }) {
  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-2">
      {labels.map(({ key, name, icon: Icon }) => {
        const included = subServices?.[key] === true;
        return (
          <div
            key={key}
            className={`flex items-center gap-2 text-sm ${included ? 'text-primary' : 'text-muted-foreground/60'}`}
          >
            <Icon className="h-4 w-4" />
            <span>{name}</span>
            <span className="ml-auto font-bold">{included ? '✓' : '—'}</span>
          </div>
        );
      })}
    </div>
  );
}

function ServiceCard({ type, children, active = true, serviceType = '' }) {
  return (
    <Card className={active ? '' : 'opacity-60'}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {type === 'phone' ? <Phone className="h-5 w-5" /> : <Wifi className="h-5 w-5" />}
          </span>
          <div>
            <h2 className="font-bold text-brand-dark">
              {type === 'phone'
                ? 'Teléfono'
                : serviceType === 'DSL'
                  ? 'Internet DSL'
                  : serviceType === 'Fiber optic'
                    ? 'Internet Fibra Óptica'
                    : 'Internet'}
            </h2>
            <p className="text-sm text-muted-foreground">{active ? 'Servicio activo' : 'No contratado'}</p>
          </div>
        </div>
        {active && <Status tone="green">Activo</Status>}
      </div>
      {children}
      {active && (
        <button
          type="button"
          disabled
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground"
        >
          Upgrade Plan <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">Próximamente</span>
        </button>
      )}
    </Card>
  );
}

export default function ServiciosPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard/servicios', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Error fetching data');
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <Header title="Mis Servicios" subtitle="Todo lo que tenés contratado con ConectaMax." />
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-40 w-full bg-muted" />
            </Card>
          ))}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Mis Servicios" subtitle="Todo lo que tenés contratado con ConectaMax." />
        <Card>
          <p className="text-sm text-muted-foreground">Error al cargar los datos. Por favor, intenta nuevamente.</p>
        </Card>
      </>
    );
  }

  const internetActive = data?.internet?.active || false;
  const internetType = data?.internet?.type || 'No';
  const internetSubServices = data?.internet?.subServices || {};
  const phoneActive = data?.phone?.active || false;
  const phoneSubServices = data?.phone?.subServices || {};

  return (
    <>
      <Header title="Mis Servicios" subtitle="Todo lo que tenés contratado con ConectaMax." />
      <div className="grid gap-5 md:grid-cols-2">
        <ServiceCard type="internet" active={internetActive} serviceType={internetType}>
          <AddonList subServices={internetSubServices} />
        </ServiceCard>
        <ServiceCard type="phone" active={phoneActive}>
          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Líneas Múltiples</span>
            <span
              className={
                phoneActive && phoneSubServices.multipleLines === true
                  ? 'font-semibold text-primary'
                  : 'text-muted-foreground/60'
              }
            >
              {phoneActive && phoneSubServices.multipleLines === true ? '✓ Incluido' : '— No incluido'}
            </span>
          </div>
        </ServiceCard>
      </div>
    </>
  );
}