import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ExecutiveDashboard from './views/ExecutiveDashboard';
import OperationsDashboard from './views/OperationsDashboard';
import StrategyDashboard from './views/StrategyDashboard';
import LeaderPage from './views/LeaderPage';
import AllLeaders from './views/AllLeaders';
import StrategyMap from './views/StrategyMap';
import MyConnections from './views/MyConnections';
import ActionItemsView from './views/ActionItemsView';
import CadencesView from './views/CadencesView';
import ContentHub from './views/ContentHub';
import SearchResults from './views/SearchResults';

const PERSONAS = [
  { id: 'carolee', name: 'Carolee Friedlander', role: 'Executive', label: 'Executive View' },
  { id: 'steve', name: 'Steve (Operations Dir.)', role: 'Operations', label: 'Operations View' },
  { id: 'emily', name: 'Emily (Chief of Staff)', role: 'Strategy', label: 'Strategy View' },
  { id: 'leader', name: 'Irene Bletcher', role: 'Leader', label: 'Leader View', leaderId: 'leader-06' },
  { id: 'deputy', name: 'Sarah Chen (Deputy)', role: 'Deputy', label: 'Deputy View', leaderId: 'leader-06' },
];

export default function App() {
  const [persona, setPersona] = useState(PERSONAS[0]);
  const navigate = useNavigate();
  const location = useLocation();

  const handlePersonaChange = (p) => {
    setPersona(p);
    if (p.role === 'Leader' || p.role === 'Deputy') {
      navigate(`/leaders/${p.leaderId}`);
    } else {
      navigate('/');
    }
  };

  const isLeaderOrDeputy = persona.role === 'Leader' || persona.role === 'Deputy';

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        persona={persona}
        personas={PERSONAS}
        onPersonaChange={handlePersonaChange}
        currentPath={location.pathname}
      />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {persona.role === 'Deputy' && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-sm text-amber-800 font-medium">
            Acting as: {PERSONAS[3].name} (Deputy) &mdash; Updates will be attributed to {persona.name}
          </div>
        )}
        <Routes>
          <Route
            path="/"
            element={
              persona.role === 'Operations' ? <OperationsDashboard /> :
              persona.role === 'Strategy' ? <StrategyDashboard /> :
              isLeaderOrDeputy ? <LeaderPage persona={persona} /> :
              <ExecutiveDashboard />
            }
          />
          <Route path="/leaders" element={
            isLeaderOrDeputy
              ? <AllLeaders persona={persona} />
              : <AllLeaders persona={persona} />
          } />
          <Route path="/leaders/:leaderId" element={<LeaderPage persona={persona} />} />
          <Route path="/strategy-map" element={
            isLeaderOrDeputy
              ? <MyConnections persona={persona} />
              : <StrategyMap />
          } />
          <Route path="/action-items" element={<ActionItemsView persona={persona} />} />
          <Route path="/cadences" element={<CadencesView persona={persona} />} />
          <Route path="/content" element={<ContentHub persona={persona} />} />
          <Route path="/search" element={<SearchResults />} />
        </Routes>
      </main>
    </div>
  );
}
