import { CalendarClock, Check, FileText, Leaf } from 'lucide-react';
import Reveal from '../Reveal';

const contractOptions = ['Sin permanencia', 'Contrato de 12 meses', 'Contrato de 24 meses'];
const contractBenefits = ['Descuentos por permanencia', 'Instalación bonificada', 'Equipamiento incluido'];
const paperlessAdvantages = ['Sin papel', 'Acceso desde cualquier lugar', 'Más ecológico', 'Historial completo de facturas'];

export default function ValueAdded() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Beneficios adicionales</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
            Contratación y facturación a tu medida
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
              <CalendarClock className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-xl font-bold text-brand-dark">Modalidades de contrato</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {contractOptions.map((option) => (
                <span key={option} className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-semibold text-brand-dark">
                  {option}
                </span>
              ))}
            </div>
            <ul className="mt-5 space-y-2">
              {contractBenefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-sm text-foreground/80">
                  <Check className="h-4 w-4 shrink-0 text-primary" />{benefit}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120} className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
              <FileText className="h-6 w-6" />
            </span>
            <h3 className="mt-5 flex items-center gap-2 text-xl font-bold text-brand-dark">
              Facturación electrónica <Leaf className="h-5 w-5 text-brand-sky" />
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">Recibí y gestioná tus facturas sin papel.</p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {paperlessAdvantages.map((advantage) => (
                <li key={advantage} className="flex items-center gap-2 text-sm text-foreground/80">
                  <Check className="h-4 w-4 shrink-0 text-primary" />{advantage}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
