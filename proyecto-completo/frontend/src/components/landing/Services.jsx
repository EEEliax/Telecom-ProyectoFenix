import { useState } from 'react';
import {
  Check, ChevronDown, Clapperboard, Cloud, Gauge, MonitorPlay,
  Phone, ShieldCheck, Smartphone, Users, Wifi, Wrench,
} from 'lucide-react';
import Reveal from '../Reveal';
import { cn } from '../../lib/utils';

const services = [
  {
    icon: Phone, title: 'Telefonía',
    description: 'Mantente comunicado con llamadas nacionales e internacionales, excelente calidad de voz y cobertura las 24 horas.',
    benefits: ['Llamadas ilimitadas nacionales', 'Excelente calidad de audio', 'Cobertura nacional', 'Planes para individuos y empresas'],
  },
  {
    icon: Users, title: 'Múltiples Líneas',
    description: 'Conectá a toda tu familia o empresa bajo una sola cuenta.',
    benefits: ['Hasta 10 líneas por cuenta', 'Descuentos por línea adicional', 'Administración centralizada', 'Facturación unificada'],
  },
  {
    icon: Wifi, title: 'Internet Fibra Óptica',
    description: 'Internet por fibra óptica de alta velocidad para navegar sin límites.',
    badges: ['100 Mbps', '300 Mbps', '600 Mbps', '1 Gbps'],
    benefits: ['Fibra óptica', 'Baja latencia', 'Conexión estable', 'Instalación rápida'],
  },
  {
    icon: ShieldCheck, title: 'Seguridad Online',
    description: 'Protegé todos tus dispositivos mientras navegás.',
    benefits: ['Antivirus Premium', 'Protección contra malware', 'Firewall avanzado', 'Protección de identidad'],
  },
  {
    icon: Cloud, title: 'Backup en la Nube',
    description: 'Tus archivos siempre seguros en la nube.',
    benefits: ['Copias automáticas', 'Restauración de archivos', 'Acceso desde cualquier dispositivo', 'Hasta 1 TB de almacenamiento'],
  },
  {
    icon: Smartphone, title: 'Protección de Equipos',
    description: 'Cobertura ante daños accidentales y fallas técnicas.',
    benefits: ['Reparación', 'Reemplazo de equipos', 'Asistencia técnica', 'Cobertura por accidentes'],
  },
  {
    icon: Wrench, title: 'Soporte Técnico',
    description: 'Nuestro equipo está disponible todos los días.',
    benefits: ['Chat online', 'WhatsApp', 'Teléfono', 'Atención presencial'],
    availability: '24 horas, los 365 días del año',
  },
  {
    icon: MonitorPlay, title: 'Streaming TV',
    description: 'Disfrutá de más de 150 canales.',
    benefits: ['Deportes', 'Noticias', 'Infantiles', 'Documentales', 'HD y 4K'],
  },
  {
    icon: Clapperboard, title: 'Streaming Películas',
    description: 'Miles de películas y series disponibles.',
    benefits: ['Catálogo actualizado', 'Estrenos mensuales', 'Contenido para toda la familia', 'Compatible con Smart TV'],
  },
];

function ServiceCard({ service }) {
  const [open, setOpen] = useState(false);
  const Icon = service.icon;

  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-5 text-lg font-bold text-brand-dark">{service.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.description}</p>

      {service.badges && (
        <div className="mt-4 flex flex-wrap gap-2">
          {service.badges.map((badge) => (
            <span key={badge} className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold text-brand-dark">
              <Gauge className="h-3 w-3 text-primary" />{badge}
            </span>
          ))}
        </div>
      )}

      {service.availability && (
        <span className="mt-4 inline-flex w-fit items-center rounded-lg bg-accent px-2.5 py-1 text-xs font-semibold text-brand-dark">
          {service.availability}
        </span>
      )}

      <div className={cn('grid transition-all duration-300 ease-in-out', open ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
        <ul className="overflow-hidden">
          {service.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 py-1 text-sm text-foreground/80">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{benefit}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-5 inline-flex items-center gap-1 self-start text-sm font-semibold text-primary transition-colors hover:text-brand-dark"
      >
        {open ? 'Ver menos' : 'Ver más'}
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
    </div>
  );
}

export default function Services() {
  return (
    <section id="servicios" className="bg-card py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Servicios</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
            Todo lo que necesitás en un solo lugar
          </h2>
          <p className="mt-4 text-muted-foreground">
            Explorá nuestra gama completa de servicios de conectividad y entretenimiento. Tocá cada tarjeta para conocer todos los beneficios.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.title} delay={(i % 3) * 100}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
