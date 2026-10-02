import type { ReactNode } from 'react';
import { Header } from './Header';
import { Navbar, type AppView } from './Navbar';

export function AppShell({ view, onNavigate, children }: { view: AppView; onNavigate: (view: AppView) => void; children: ReactNode }) {
  return <div className="shell"><Header /><Navbar view={view} onNavigate={onNavigate} /><main className="main-content">{children}</main></div>;
}