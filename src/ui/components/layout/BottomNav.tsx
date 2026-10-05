import { BookOpen, Bluetooth, Compass, Map } from 'lucide-react';
import type { AppView } from './Navbar';

export function BottomNav({ view, onNavigate }: { view: AppView; onNavigate: (view: AppView) => void }) {
  const items: { view: AppView; label: string; icon: typeof Compass }[] = [
    { view: 'overview', label: 'Overview', icon: Compass },
    { view: 'logbook', label: 'Logbook', icon: BookOpen },
    { view: 'connect', label: 'Connect', icon: Bluetooth },
    { view: 'planner', label: 'Dive Planner', icon: Map },
  ];
  return <nav className="bottom-nav" aria-label="Mobile navigation">{items.map(({ view: itemView, label, icon: Icon }) => <button key={itemView} className={(view === itemView || (itemView === 'logbook' && view === 'presets')) ? 'bottom-nav-link selected' : 'bottom-nav-link'} onClick={() => onNavigate(itemView)}><Icon size={18} /><span>{label}</span></button>)}</nav>;
}
