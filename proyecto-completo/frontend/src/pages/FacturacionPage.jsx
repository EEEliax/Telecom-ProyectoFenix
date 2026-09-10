import { useEffect, useState } from 'react';
import { Check, Download, MoreHorizontal } from 'lucide-react';
import Card from '../components/dashboard/Card';
import Eyebrow from '../components/dashboard/Eyebrow';
import Header from '../components/dashboard/Header';
import Status from '../components/dashboard/Status';
import { getToken } from '../utils/auth';

function BillingLines({ activeServices, monthlyCharges }) {
  // Generar desglose proporcional en frontend (Requirement A.2)
  if (!activeServices || activeServices.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay servicios activos</p>;
  }

  const weight = 1 / activeServices.length;
  let used = 0;

  return activeServices.map((service, i) => {
    const amount = i === activeServices.length - 1 
      ? monthlyCharges - used 
      : Math.round(monthlyCharges * weight);
    used += amount;
    return (
      <div key={service} className="flex justify-between py-2 text-sm">
        <span className="text-muted-foreground">{service}</span>
        <span className="font-medium text-brand-dark">${amount.toLocaleString('es-AR')}</span>
      </div>
    );
  });
}

export default function FacturacionPage() {
  const [paid, setPaid] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard/facturacion', {
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
        <Header title="Facturación" subtitle="Consultá y administrá tus pagos." />
        <Card className="animate-pulse">
          <div className="h-64 w-full bg-muted" />
        </Card>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Facturación" subtitle="Consultá y administrá tus pagos." />
        <Card>
          <p className="text-sm text-muted-foreground">Error al cargar los datos. Por favor, intenta nuevamente.</p>
        </Card>
      </>
    );
  }

  const activeServices = data?.activeServices || [];
  const monthlyCharges = data?.monthlyCharges || 0;
  const contractType = data?.contractType || 'No disponible';
  const paymentMethod = data?.paymentMethod || 'No disponible';

  return (
    <>
      <Header title="Facturación" subtitle="Consultá y administrá tus pagos." />
      <Card className="mb-5">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <Eyebrow>Factura de junio 2024</Eyebrow>
            <p className="mt-2 text-sm text-muted-foreground">Período 01 Jun — 30 Jun 2024</p>
          </div>
          {paid ? <Status tone="green">Pago confirmado</Status> : <Status tone="yellow">Pendiente de pago</Status>}
        </div>
        <div className="my-8 border-y border-border py-5">
          <BillingLines activeServices={activeServices} monthlyCharges={monthlyCharges} />
          <div className="mt-3 flex justify-between border-t border-border pt-4">
            <span className="font-semibold text-brand-dark">Total a pagar</span>
            <strong className="text-2xl text-brand-dark">${monthlyCharges.toLocaleString('es-AR')}</strong>
          </div>
        </div>
        <div className="grid gap-4 border-b border-border pb-6 sm:grid-cols-2">
          <p className="text-sm text-muted-foreground">
            Tipo de contrato <strong className="block text-brand-dark">{contractType}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Método de pago <strong className="block text-brand-dark">{paymentMethod}</strong>
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Vencimiento: <strong className="text-brand-dark">10 de julio de 2024</strong>
          </p>
          <button
            type="button"
            onClick={() => setPaid(true)}
            disabled={paid}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:scale-[1.01] hover:bg-primary/90 hover:shadow-md disabled:bg-emerald-600 disabled:hover:scale-100"
          >
            <Check className="h-4 w-4" />
            {paid ? 'Pago realizado' : 'Pagar Ahora'}
          </button>
        </div>
      </Card>
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-brand-dark">Historial de facturación</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tus últimas facturas</p>
          </div>
          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
        </div>
        {['Junio 2024', 'Mayo 2024', 'Abril 2024'].map((month) => (
          <div key={month} className="flex items-center justify-between border-t border-border py-4 text-sm">
            <span className="font-medium text-brand-dark">{month}</span>
            <span className="text-muted-foreground">${monthlyCharges.toLocaleString('es-AR')}</span>
            <Status tone="green">Pagada</Status>
            <Download className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}
      </Card>
    </>
  );
}