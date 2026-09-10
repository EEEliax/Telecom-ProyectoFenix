const colors = {
  blue: 'bg-primary/10 text-primary',
  green: 'bg-emerald-50 text-emerald-700',
  gray: 'bg-muted text-muted-foreground',
  yellow: 'bg-amber-50 text-amber-700',
};

export default function Status({ children, tone = 'blue' }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colors[tone]}`}>
      {children}
    </span>
  );
}
