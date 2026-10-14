type BadgeTone = 'cyan' | 'emerald' | 'pink' | 'muted' | 'amber';

export function Badge({ children, tone }: { children: string; tone?: BadgeTone }) {
  const gasTone =
    children === 'AIR'
      ? 'cyan'
      : children === 'EAN32' || children === 'EAN36'
        ? 'emerald'
        : children === 'TRIMIX'
          ? 'pink'
          : undefined;

  return <span className={`badge badge-${tone ?? gasTone ?? 'muted'}`}>{children}</span>;
}