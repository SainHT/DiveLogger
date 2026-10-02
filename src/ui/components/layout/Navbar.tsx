import { BookOpen, Compass, Plus } from 'lucide-react';

export type AppView = 'overview' | 'logbook' | 'entry' | 'detail';

export function Navbar({ view, onNavigate }: { view: AppView; onNavigate: (view: AppView) => void }) {
  return <nav className="navbar" aria-label="Primary navigation">
    <button className={view === 'overview' ? 'nav-link selected' : 'nav-link'} onClick={() => onNavigate('overview')}><Compass size={17} /> Overview</button>
    <button className={view === 'logbook' || view === 'detail' ? 'nav-link selected' : 'nav-link'} onClick={() => onNavigate('logbook')}><BookOpen size={17} /> Logbook</button>
    <button className="nav-link nav-new" onClick={() => onNavigate('entry')}><Plus size={17} /> New Dive</button>
  </nav>;
}