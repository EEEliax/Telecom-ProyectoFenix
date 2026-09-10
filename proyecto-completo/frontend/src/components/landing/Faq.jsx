import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Reveal from '../Reveal';
import { cn } from '../../lib/utils';

const faqs = [
  { q: '¿Cuánto tarda la instalación?',       a: 'Entre 24 y 72 horas dependiendo de la zona.' },
  { q: '¿Tiene permanencia?',                  a: 'Podés elegir planes con o sin permanencia.' },
  { q: '¿Qué pasa si tengo un inconveniente?', a: 'Nuestro soporte técnico está disponible las 24 horas.' },
  { q: '¿Puedo cambiar de plan?',              a: 'Sí, en cualquier momento.' },
  { q: '¿Hay límite de consumo?',              a: 'No. Todos nuestros planes cuentan con datos ilimitados.' },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="soporte" className="py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Preguntas frecuentes</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
            Resolvé tus dudas
          </h2>
        </Reveal>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={faq.q} delay={i * 60}>
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-semibold text-brand-dark">{faq.q}</span>
                    <ChevronDown className={cn('h-5 w-5 shrink-0 text-primary transition-transform', isOpen && 'rotate-180')} />
                  </button>
                  <div className={cn('grid transition-all duration-300 ease-in-out', isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-muted-foreground">{faq.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
