import type { ReactNode } from "react";
import { Header } from "./Header";
import { Navbar, type AppView } from "./Navbar";
import { BottomNav } from "./BottomNav";

export function AppShell({
  view,
  onNavigate,
  children,
}: {
  view: AppView;
  onNavigate: (view: AppView) => void;
  children: ReactNode;
}) {
  return (
    <div className="shell">
      <Header />
      <Navbar view={view} onNavigate={onNavigate} />
      <main className="main-content">{children}</main>
      <BottomNav view={view} onNavigate={onNavigate} />
    </div>
  );
}
