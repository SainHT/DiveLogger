export function Badge({ children, tone = 'cyan' }: { children: string; tone?: 'cyan' | 'muted' | 'amber' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}