import type { ReactNode } from 'react';

export function StatCard({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return <article className="stat-card">
    <div className="stat-icon">{icon}</div>
    <span className="eyebrow">{label}</span>
    <strong>{value}</strong>
  </article>;
}