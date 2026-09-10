import { Award, Globe2, Headset, Users } from 'lucide-react';
import Reveal from '../Reveal';

const stats = [
  { icon: Award,   value: '15+',       label: 'Años de experiencia' },
  { icon: Users,   value: '150.000+',  label: 'Clientes activos' },
  { icon: Globe2,  value: 'Nacional',  label: 'Cobertura total' },
  { icon: Headset, value: '24/7',      label: 'Atención al cliente' },
];

export default function About() {
  return (
    <section id="sobre-nosotros" className="py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Sobre Nosotros</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
            Tecnología que conecta a las personas
          </h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Somos una empresa dedicada a brindar servicios de telecomunicaciones con cobertura nacional. Nuestro objetivo
            es ofrecer conexiones rápidas, seguras y estables para que puedas trabajar, estudiar, jugar y disfrutar del
            mejor entretenimiento sin interrupciones. Con más de 15 años de experiencia en el sector, miles de clientes
            confían en nosotros por nuestra calidad de servicio, atención personalizada y tecnología de última
            generación.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 100}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <stat.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-2xl font-extrabold text-brand-dark sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
