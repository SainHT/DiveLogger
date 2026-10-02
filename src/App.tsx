import { useState } from 'react';
import type { DiveLog } from './modules/dives/domain/dive.model';
import { AppShell } from './ui/components/layout/AppShell';
import type { AppView } from './ui/components/layout/Navbar';
import { DiveDetailView } from './ui/views/DiveDetailView';
import { DiveEntryView } from './ui/views/DiveEntryView';
import { LogbookView } from './ui/views/LogbookView';
import { OverviewView } from './ui/views/OverviewView';

function App() {
  const [view, setView] = useState<AppView>('overview');
  const [selectedDive, setSelectedDive] = useState<DiveLog>();
  const [toast, setToast] = useState('');
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 3200); };
  const openDive = (dive: DiveLog) => { setSelectedDive(dive); setView('detail'); };
  const content = view === 'overview' ? <OverviewView onNewDive={() => setView('entry')} onDive={openDive} /> : view === 'logbook' ? <LogbookView onDive={openDive} /> : view === 'entry' ? <DiveEntryView nextNumber={1} onCancel={() => setView('overview')} onSaved={() => { setView('overview'); showToast('Dive saved locally'); }} /> : selectedDive ? <DiveDetailView dive={selectedDive} onBack={() => setView('logbook')} onEdit={() => setView('entry')} onDeleted={() => { setSelectedDive(undefined); setView('logbook'); showToast('Dive moved to trash'); }} /> : <OverviewView onNewDive={() => setView('entry')} onDive={openDive} />;
  return <AppShell view={view} onNavigate={setView}>{content}{toast && <div className="toast" role="status">{toast}</div>}</AppShell>;
}

export default App;
