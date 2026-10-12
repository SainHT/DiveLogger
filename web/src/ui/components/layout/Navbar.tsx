import { BookOpen, Bluetooth, Compass, Map } from 'lucide-react';

export type AppView = 'overview' | 'logbook' | 'entry' | 'detail' | 'presets' | 'connect' | 'planner';

export function Navbar({ view, onNavigate }: { view: AppView; onNavigate: (view: AppView) => void }) {
  return <nav className="navbar" aria-label="Primary navigation">
    <button className={view === 'overview' ? 'nav-link selected' : 'nav-link'} onClick={() => onNavigate('overview')}><Compass size={17} /> Overview</button>
    <button className={view === 'logbook' || view === 'detail' || view === 'presets' ? 'nav-link selected' : 'nav-link'} onClick={() => onNavigate('logbook')}><BookOpen size={17} /> Logbook</button>
    <button className={view === 'connect' ? 'nav-link selected' : 'nav-link'} onClick={() => onNavigate('connect')}><Bluetooth size={17} /> Connect</button>
    <button className={view === 'planner' ? 'nav-link selected' : 'nav-link'} onClick={() => onNavigate('planner')}><Map size={17} /> Dive Planner</button>
  </nav>;
}