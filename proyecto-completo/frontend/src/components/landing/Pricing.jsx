import { Check } from 'lucide-react';
import Reveal from '../Reveal';
import { cn } from '../../lib/utils';

const plans = [
  { name: 'Básico',    price: '24.999', speed: '100 Mbps', featured: false, features: ['Fibra óptica', 'Router Wi-Fi incluido', 'Soporte técnico'] },
  { name: 'Estándar',  price: '39.999', speed: '300 Mbps', featured: false, features: ['Fibra óptica', 'Router Wi-Fi incluido', 'Soporte técnico', 'Baja latencia'] },
  { name: 'Premium',   price: '54.999', speed: '600 Mbps', featured: true,  features: ['Fibra óptica', 'Router Wi-Fi incluido', 'Soporte prioritario', 'Streaming TV incluido'] },
  { name: 'Gamer',     price: '74.999', speed: '1 Gbps',   featured: false, features: ['Fibra óptica', 'Router Wi-Fi Pro', 'Soporte prioritario 24/7', 'Latencia ultra baja'] },
];

const paymentMethods = [
  'Tarjeta de Crédito', 'Tarjeta de Débito', 'Transferencia Bancaria',
  'Mercado Pago', 'Débito Automático', 'Pago Fácil', 'Rapipago',
];

export default function Pricing() {
  return (
    <section id="planes" className="bg-card py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Cargos Mensuales</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
            Elegí el plan perfecto para vos
          </h2>
          <p className="mt-4 text-muted-foreground">Precios claros y transparentes, sin costos ocultos.</p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
            <Reveal
              key={plan.name}
              delay={i * 100}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-background p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md',
                plan.featured ? 'border-primary ring-2 ring-primary/20' : 'border-border'
              )}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  Más elegido
                </span>
              )}
              <h3 className="text-lg font-bold text-brand-dark">{plan.name}</h3>
              <span className="mt-1 inline-flex w-fit rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
                {plan.speed}
              </span>
              <div className="mt-5">
                <span className="text-sm font-medium text-muted-foreground">$</span>
                <span className="text-4xl font-extrabold tracking-tight text-brand-dark">{plan.price}</span>
                <span className="text-sm text-muted-foreground">/mes</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{feature}
                  </li>
                ))}
              </ul>
              <a
                href="#contacto"
                className={cn(
                  'mt-6 flex w-full items-center justify-center rounded-xl py-2.5 text-sm font-semibold transition-transform hover:scale-105',
                  plan.featured ? 'bg-primary text-white hover:bg-primary/90' : 'bg-secondary text-brand-dark hover:bg-accent'
                )}
              >
                Contratar
              </a>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Todos los planes incluyen instalación, router Wi-Fi y soporte técnico.
        </p>

        <Reveal className="mx-auto mt-14 max-w-4xl rounded-2xl border border-border bg-background p-8 shadow-sm">
          <h3 className="text-center text-base font-bold text-brand-dark">Medios de pago aceptados</h3>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {paymentMethods.map((method) => (
              <span key={method} className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80 shadow-sm transition-colors hover:border-primary/40 hover:text-primary">
                {method}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
