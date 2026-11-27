import { useCallback, useEffect, useState } from 'react';
import { initialCrews, initialIncidents } from '../data/seed.js';
import { assignCrew, historyOf, resolveIncident } from '../lib/incidents.js';

const KEY = 'aqua-dispatch-v1';

// Older saved state has no history, so every incident gets its report event on load.
const normalize = (state) => ({
  incidents: state.incidents.map((i) => ({ ...i, history: historyOf(i) })),
  crews: state.crews,
});

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && Array.isArray(s.incidents) && Array.isArray(s.crews)) return normalize(s);
  } catch {
    // corrupted storage: start fresh
  }
  return normalize({ incidents: initialIncidents, crews: initialCrews });
}

export function useDispatch() {
  const [state, setState] = useState(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const assign = useCallback((incidentId, crewId) => {
    setState((s) => assignCrew(s.incidents, s.crews, incidentId, crewId) ?? s);
  }, []);
  const resolve = useCallback((incidentId) => {
    setState((s) => resolveIncident(s.incidents, s.crews, incidentId) ?? s);
  }, []);
  const reset = useCallback(() => setState(normalize({ incidents: initialIncidents, crews: initialCrews })), []);

  return { ...state, assign, resolve, reset };
}
