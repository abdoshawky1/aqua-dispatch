import { useMemo, useState } from 'react';
import { useDispatch } from './hooks/useDispatch.js';
import { KINDS, PRIORITIES, STATUSES, countByStatus, filterIncidents, sortByUrgency } from './lib/incidents.js';
import MapView from './components/MapView.jsx';
import IncidentPanel from './components/IncidentPanel.jsx';

export default function App() {
  const { incidents, crews, assign, resolve, reset } = useDispatch();
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [layers, setLayers] = useState({ incidents: true, crews: true, pipes: true });

  const list = useMemo(() => sortByUrgency(filterIncidents(incidents, { status, priority, query })), [incidents, status, priority, query]);
  const counts = countByStatus(incidents);
  const selected = incidents.find((i) => i.id === selectedId);
  const toggle = (k) => setLayers((l) => ({ ...l, [k]: !l[k] }));

  return (
    <div className="app">
      <header className="bar">
        <div className="brand"><span className="mark">A</span> Aqua Dispatch <span className="demo">demo</span></div>
        <div className="stats" aria-label="Incident counts">
          <span><b>{counts.open}</b> open</span><span><b>{counts.assigned}</b> assigned</span><span><b>{counts.resolved}</b> resolved</span>
          <span><b>{crews.filter((c) => c.status === 'available').length}</b>/{crews.length} crews free</span>
        </div>
      </header>

      <aside className="side">
        <div className="filters">
          <input type="search" placeholder="Search id, street or type" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search incidents" />
          <div className="row">
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
              <option value="all">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Filter by priority">
              <option value="all">All priorities</option>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="toggles" role="group" aria-label="Map layers">
            {[['incidents', 'Incidents'], ['crews', 'Crews'], ['pipes', 'Pipes']].map(([k, label]) => (
              <label key={k}><input type="checkbox" checked={layers[k]} onChange={() => toggle(k)} /> {label}</label>
            ))}
          </div>
        </div>

        {selected && <IncidentPanel incident={selected} crews={crews} onAssign={assign} onResolve={resolve} onClose={() => setSelectedId(null)} />}

        <ul className="list" aria-label="Incidents">
          {list.map((i) => (
            <li key={i.id}>
              <button className={`item ${i.id === selectedId ? 'on' : ''}`} onClick={() => setSelectedId(i.id)}>
                <span className={`dot dot-${i.status === 'resolved' ? 'resolved' : i.priority}`} aria-hidden="true" />
                <span className="item-main"><strong>{i.id}</strong> {KINDS[i.kind]}<br /><span className="muted small">{i.address}</span></span>
                <span className="pill pill-status">{i.status}</span>
              </button>
            </li>
          ))}
          {!list.length && <li className="empty">No incidents match these filters.</li>}
        </ul>
        <div className="legend small muted">
          <span><i className="dot dot-critical" /> critical</span><span><i className="dot dot-high" /> high</span><span><i className="dot dot-normal" /> normal</span>
          <span><i className="sq sq-free" /> free crew</span><span><i className="sq sq-busy" /> busy crew</span>
        </div>
        <p className="foot small muted">Demo with invented data. Map tiles © OpenStreetMap contributors. <button className="link-btn" onClick={() => window.confirm('Reset all demo changes?') && reset()}>Reset demo</button></p>
      </aside>

      <MapView incidents={incidents} crews={crews} selectedId={selectedId} onSelect={setSelectedId} layers={layers} />
    </div>
  );
}
