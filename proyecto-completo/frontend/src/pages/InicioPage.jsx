import { useEffect, useState } from 'react';
import { CreditCard, Gauge, Wifi } from 'lucide-react';
import Card from '../components/dashboard/Card';
import Eyebrow from '../components/dashboard/Eyebrow';
import Header from '../components/dashboard/Header';
import { getToken } from '../utils/auth';

export default function InicioPage({ userEmail = '' }) {
  const greetingName = userEmail ? userEmail.split('@')[0] : 'Cliente';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard/inicio', {
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
        <Header title={`Hola, ${greetingName}`} subtitle="Este es el resumen de tu cuenta." />
        <div className="grid gap-5 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-24 w-full bg-muted" />
            </Card>
          ))}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title={`Hola, ${greetingName}`} subtitle="Este es el resumen de tu cuenta." />
        <Card>
          <p className="text-sm text-muted-foreground">Error al cargar los datos. Por favor, intenta nuevamente.</p>
        </Card>
      </>
    );
  }

  const internetService = data?.internetService || 'No';
  const monthlyCharges = data?.monthlyCharges || 0;

  // Mapeo de servicio a texto legible
  const internetServiceText = internetService === 'Fiber optic' ? 'Fibra Óptica' : internetService === 'DSL' ? 'DSL' : 'No contratado';

  // Mbps siguen inventados en frontend (Requirement 1.2)
  const mbps = internetService === 'Fiber optic' ? '300 Mbps' : internetService === 'DSL' ? '100 Mbps' : '—';

  return (
    <>
      <Header title={`Hola, ${greetingName}`} subtitle="Este es el resumen de tu cuenta." />
      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <div className="mb-7 flex items-center justify-between">
            <Eyebrow>Tu plan actual</Eyebrow>
            <Wifi className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-brand-dark">
            {internetService === 'No' ? 'Sin servicio' : `Internet ${internetServiceText}`}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {internetService === 'No' ? 'No tenés servicio de internet contratado' : 'Internet Fibra Óptica'}
          </p>
          <div className="mt-6 flex items-end justify-between">
            <span className="text-2xl font-bold text-brand-dark">{mbps}</span>
            <span className="text-sm font-semibold text-brand-dark">
              ${monthlyCharges.toLocaleString('es-AR')}<small className="font-normal text-muted-foreground"> /mes</small>
            </span>
          </div>
        </Card>
        <Card>
          <div className="mb-7 flex items-center justify-between">
            <Eyebrow>Método de pago</Eyebrow>
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-12 items-center justify-center rounded-md bg-brand-dark text-xs font-bold text-card">
              VISA
            </div>
            <span className="font-semibold text-brand-dark">•••• 4242</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Vence 08/26</p>
        </Card>
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <Eyebrow>Consumo del ciclo</Eyebrow>
              <p className="mt-1 text-xs text-muted-foreground">1 — 30 de junio</p>
            </div>
            <Gauge className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-baseline gap-1">
            <strong className="text-2xl text-brand-dark">68</strong>
            <span className="text-sm text-muted-foreground">GB / 100 GB</span>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[68%] rounded-full bg-primary" />
          </div>
        </Card>
      </div>
    </>
  );
}