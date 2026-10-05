import { useState } from 'react';
import type { DiveLog } from './modules/dives/domain/dive.model';
import { AppShell } from './ui/components/layout/AppShell';
import type { AppView } from './ui/components/layout/Navbar';
import { DiveDetailView } from './ui/views/DiveDetailView';
import { DiveEntryView } from './ui/views/DiveEntryView';
import { LogbookView } from './ui/views/LogbookView';
import { OverviewView } from './ui/views/OverviewView';
import { PresetsView } from './ui/views/PresetsView';

function App() {
  const [view, setView] = useState<AppView>('overview');
  const [selectedDive, setSelectedDive] = useState<DiveLog>();
  const [toast, setToast] = useState('');
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 3200); };
  const openDive = (dive: DiveLog) => { setSelectedDive(dive); setView('detail'); };
  const openNewDive = () => { setSelectedDive(undefined); setView('entry'); };
  const content = view === 'overview' ? <OverviewView onNewDive={openNewDive} onDive={openDive} onLogbook={() => setView('logbook')} /> : view === 'logbook' ? <LogbookView onDive={openDive} onNewDive={openNewDive} onPresets={() => setView('presets')} /> : view === 'presets' ? <PresetsView onBack={() => setView('logbook')} /> : view === 'entry' ? <DiveEntryView key={selectedDive?.id ?? 'new-dive'} nextNumber={1} editingDive={selectedDive} onCancel={() => setView(selectedDive ? 'detail' : 'overview')} onSaved={() => { setSelectedDive(undefined); setView('overview'); showToast('Dive saved locally'); }} /> : view === 'connect' || view === 'planner' ? <PlaceholderView title={view === 'connect' ? 'Connect hardware.' : 'Plan your next dive.'} /> : selectedDive ? <DiveDetailView dive={selectedDive} onBack={() => setView('logbook')} onEdit={() => setView('entry')} onDeleted={() => { setSelectedDive(undefined); setView('logbook'); showToast('Dive moved to trash'); }} /> : <OverviewView onNewDive={openNewDive} onDive={openDive} onLogbook={() => setView('logbook')} />;
  return <AppShell view={view} onNavigate={setView}>{content}{toast && <div className="toast" role="status">{toast}</div>}</AppShell>;
}

function PlaceholderView({ title }: { title: string }) {
  return <div className="page-stack"><section className="page-heading"><div><span className="eyebrow">COMING SOON</span><h1>{title}</h1><p className="muted">This workspace is ready for the next feature.</p></div></section><div className="empty-state">Available in a future update.</div></div>;
}

export default App;
