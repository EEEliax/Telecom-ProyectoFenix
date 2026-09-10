import { ArrowRight, Wifi, Zap } from 'lucide-react';
import Reveal from '../Reveal';

export default function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-card pt-28 pb-20 lg:pt-36 lg:pb-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(60% 50% at 80% 0%, rgba(56,189,248,0.14) 0%, rgba(56,189,248,0) 100%), radial-gradient(50% 50% at 0% 100%, rgba(37,99,235,0.10) 0%, rgba(37,99,235,0) 100%)',
        }}
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-brand-dark">
            <Zap className="h-4 w-4 text-primary" />
            Fibra óptica de última generación
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-brand-dark sm:text-5xl lg:text-6xl">
            Conectamos tu mundo, sin límites.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Internet de alta velocidad, telefonía y entretenimiento en un solo lugar. En ConectaMax Telecom ofrecemos
            soluciones de conectividad para hogares y empresas. Disfrutá de internet por fibra óptica, telefonía móvil,
            soporte técnico especializado y los mejores servicios de entretenimiento.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#planes"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105 hover:bg-primary/90"
            >
              Ver Planes <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#contacto"
              className="inline-flex items-center justify-center rounded-xl border border-primary/30 px-6 py-3 text-sm font-semibold text-primary transition-transform hover:scale-105 hover:bg-secondary"
            >
              Contratar Ahora
            </a>
          </div>
        </Reveal>

        <Reveal delay={150} className="relative">
          <div className="rounded-3xl border border-border bg-background p-6 shadow-md">
            <div className="flex items-center justify-between rounded-2xl bg-brand-dark p-6 text-white">
              <div>
                <p className="text-sm text-sky-200">Tu velocidad actual</p>
                <p className="mt-1 text-4xl font-extrabold">1 Gbps</p>
                <p className="mt-1 text-xs text-sky-200">Descarga simétrica garantizada</p>
              </div>
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-sky/20">
                <Wifi className="h-8 w-8 text-brand-sky" />
              </span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[{ k: 'Uptime', v: '99.9%' }, { k: 'Latencia', v: '<5 ms' }, { k: 'Soporte', v: '24/7' }].map((s) => (
                <div key={s.k} className="rounded-xl bg-card p-4 text-center shadow-sm">
                  <p className="text-lg font-bold text-primary">{s.v}</p>
                  <p className="text-xs text-muted-foreground">{s.k}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
