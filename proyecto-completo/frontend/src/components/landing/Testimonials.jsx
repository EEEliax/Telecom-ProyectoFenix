import { Star } from 'lucide-react';
import Reveal from '../Reveal';

const testimonials = [
  { name: 'María G.',  quote: 'Excelente servicio, internet muy estable y soporte rápido.' },
  { name: 'Carlos M.', quote: 'Muy buenos precios y nunca tuve problemas de conexión.' },
  { name: 'Lucía F.',  quote: 'La instalación fue rápida y el servicio funciona perfectamente.' },
];

export default function Testimonials() {
  return (
    <section className="bg-card py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Opiniones</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
            Lo que dicen nuestros clientes
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal
              key={t.name}
              delay={i * 120}
              className="flex flex-col rounded-2xl border border-border bg-background p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex gap-1 text-brand-sky">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="mt-4 flex-1 leading-relaxed text-foreground/80">{`"${t.quote}"`}</p>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary font-bold text-primary">
                  {t.name.charAt(0)}
                </span>
                <span className="font-semibold text-brand-dark">{t.name}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
