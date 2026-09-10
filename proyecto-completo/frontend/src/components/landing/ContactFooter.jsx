import { useState } from 'react';
import { Clock, Mail, MapPin, Phone, Radio, Send } from 'lucide-react';
import Reveal from '../Reveal';

const contactDetails = [
  { icon: MapPin, label: 'Dirección', value: 'Av. Corrientes 1234, Buenos Aires' },
  { icon: Phone,  label: 'Teléfono', value: '+54 11 4000-0000' },
  { icon: Mail,   label: 'Email',    value: 'soporte@telecomunicaciones-fyb.com' },
  { icon: Clock,  label: 'Horarios', value: 'Lun a Vie 8:00–20:00 · Sáb 9:00–14:00' },
];

const footerLinks = [
  { label: 'Inicio',    href: '#inicio' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Planes',    href: '#planes' },
  { label: 'Contacto',  href: '#contacto' },
];

export default function ContactFooter() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <>
      {/* ── Sección de contacto ── */}
      <section id="contacto" className="py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Contacto</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
              Contratá tu servicio hoy
            </h2>
            <p className="mt-4 text-muted-foreground">
              Dejanos tus datos y un asesor se comunicará con vos a la brevedad.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {contactDetails.map((detail) => (
                <div key={detail.label} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                    <detail.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{detail.label}</p>
                    <p className="mt-0.5 text-sm font-medium text-brand-dark">{detail.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120} className="rounded-3xl border border-border bg-card p-8 shadow-md">
            {sent ? (
              <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
                  <Send className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-xl font-bold text-brand-dark">¡Gracias por contactarnos!</h3>
                <p className="mt-2 text-muted-foreground">Un asesor se comunicará con vos muy pronto.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="nombre" className="text-sm font-medium text-brand-dark">Nombre</label>
                    <input id="nombre" required className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Tu nombre" />
                  </div>
                  <div>
                    <label htmlFor="telefono" className="text-sm font-medium text-brand-dark">Teléfono</label>
                    <input id="telefono" type="tel" required className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Tu teléfono" />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-email" className="text-sm font-medium text-brand-dark">Email</label>
                  <input id="contact-email" type="email" required className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="tu@email.com" />
                </div>
                <div>
                  <label htmlFor="plan-select" className="text-sm font-medium text-brand-dark">Plan de interés</label>
                  <select id="plan-select" className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20">
                    <option>Básico · 100 Mbps</option>
                    <option>Estándar · 300 Mbps</option>
                    <option>Premium · 600 Mbps</option>
                    <option>Gamer · 1 Gbps</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="mensaje" className="text-sm font-medium text-brand-dark">Mensaje</label>
                  <textarea id="mensaje" rows={3} className="mt-1.5 w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Contanos qué necesitás" />
                </div>
                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] hover:bg-primary/90">
                  Contratar Ahora <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-brand-dark text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                  <Radio className="h-5 w-5" />
                </span>
                <span className="text-lg font-bold">ConectaMax Telecom</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-sky-200">
                Conectando personas, hogares y empresas con la mejor tecnología.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-sky-200">Navegación</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {footerLinks.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="text-sky-100/80 transition-colors hover:text-white">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-sky-200">Contacto</h3>
              <ul className="mt-4 space-y-2 text-sm text-sky-100/80">
                <li>Av. Corrientes 1234, Buenos Aires</li>
                <li>+54 11 4000-0000</li>
                <li>soporte@telecomunicaciones-fyb.com</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-sky-100/70 sm:flex-row">
            <p>© {new Date().getFullYear()} ConectaMax Telecom. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="transition-colors hover:text-white">Términos del Servicio</a>
              <a href="#" className="transition-colors hover:text-white">Políticas de Privacidad</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
