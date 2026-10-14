import { Waves } from 'lucide-react';

export function Header() {
  return <header className="app-header">
    <div className="brand"><span className="brand-mark"><Waves size={20} /></span><span>Scuba Log</span></div>
    <div className="offline-status"><span className="status-dot" /> Local-First / Offline Ready</div>
  </header>;
}