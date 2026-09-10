export default function Header({ title, subtitle, action }) {
  return (
    <header className="mb-8 flex items-start justify-between gap-4">
      <div>
        <p className="mb-2 text-sm font-medium text-primary">ConectaMax Telecom</p>
        <h1 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </header>
  );
}
