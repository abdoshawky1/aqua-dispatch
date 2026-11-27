import { useEffect, useState } from 'react';
import { fetchRoadLegs } from '../lib/routing.js';

// Road legs for one incident's ranked crews. 'failed' means routing was unavailable
// and the caller should fall back to the straight-line estimate.
export function useRoadEta(incident, crews) {
  const key = incident ? `${incident.id}|${crews.map((c) => c.id).join(',')}` : '';
  const [state, setState] = useState({ key: '', status: 'idle', legs: null });

  useEffect(() => {
    if (!incident || !crews.length) return undefined;
    const ctrl = new AbortController();
    let live = true;
    setState({ key, status: 'loading', legs: null });
    fetchRoadLegs(incident.coord, crews.map((c) => c.coord), { signal: ctrl.signal }).then((legs) => {
      if (live) setState({ key, status: legs ? 'done' : 'failed', legs });
    });
    return () => {
      live = false;
      ctrl.abort();
    };
    // The key already covers the incident and every crew position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!incident || !crews.length) return { status: 'idle', legs: null };
  return state.key === key ? state : { status: 'loading', legs: null };
}
