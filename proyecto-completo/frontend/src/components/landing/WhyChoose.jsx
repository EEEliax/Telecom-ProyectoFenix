import { Check } from 'lucide-react';
import Reveal from '../Reveal';

const reasons = [
  'Más de 150.000 clientes.',
  'Cobertura nacional.',
  'Atención 24/7.',
  'Fibra óptica.',
  'Instalación en menos de 48 horas.',
  'Tecnología de última generación.',
];

export default function WhyChoose() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">¿Por qué elegirnos?</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
            Razones para confiar en nosotros
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason, i) => (
            <Reveal
              key={reason}
              delay={(i % 3) * 100}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <Check className="h-6 w-6 shrink-0 text-primary" />
              <span className="font-medium text-brand-dark">{reason}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
