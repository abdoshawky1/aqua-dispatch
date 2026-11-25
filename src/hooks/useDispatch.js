import { useCallback, useEffect, useState } from 'react';
import { initialCrews, initialIncidents } from '../data/seed.js';
import { assignCrew, resolveIncident } from '../lib/incidents.js';

const KEY = 'aqua-dispatch-v1';

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && Array.isArray(s.incidents) && Array.isArray(s.crews)) return s;
  } catch {
    // corrupted storage: start fresh
  }
  return { incidents: initialIncidents, crews: initialCrews };
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
  const reset = useCallback(() => setState({ incidents: initialIncidents, crews: initialCrews }), []);

  return { ...state, assign, resolve, reset };
}
