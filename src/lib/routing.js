import { etaMinutes } from './geo.js';

// Road distance and drive time from a public OSRM server (https://project-osrm.org).
// The straight-line estimate in geo.js stays the fallback: this module returns null
// whenever routing is unavailable, and callers label which number they are showing.
const OSRM_BASE = 'https://router.project-osrm.org';
const PROFILE = 'driving';

const coord = ([lon, lat]) => `${lon.toFixed(6)},${lat.toFixed(6)}`;

// One request for the whole job: the incident is the only source, every crew is a destination.
// Column 0 of the response is the origin itself, so columns 1..n are the crews.
export function tableUrl(origin, destinations) {
  const path = [origin, ...destinations].map(coord).join(';');
  return `${OSRM_BASE}/table/v1/${PROFILE}/${path}?sources=0&annotations=duration,distance`;
}

// Turn an OSRM /table response into one leg per destination, or null if the response is unusable.
// A destination with no road route comes back as null rather than a made-up number.
export function parseTable(json, expected) {
  if (!json || json.code !== 'Ok' || !Array.isArray(json.durations) || !Array.isArray(json.durations[0])) return null;
  const durations = json.durations[0];
  const distances = Array.isArray(json.distances) && Array.isArray(json.distances[0]) ? json.distances[0] : [];
  const legs = [];
  for (let i = 1; i <= expected; i += 1) {
    const seconds = durations[i];
    const meters = distances[i];
    legs.push(Number.isFinite(seconds) && Number.isFinite(meters) ? { seconds, meters } : null);
  }
  return legs;
}

export async function fetchRoadLegs(origin, destinations, { signal, timeoutMs = 6000 } = {}) {
  if (!destinations.length) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  if (signal) signal.addEventListener('abort', () => ctrl.abort(), { once: true });
  try {
    const res = await fetch(tableUrl(origin, destinations), { signal: ctrl.signal, headers: { accept: 'application/json' } });
    if (!res.ok) return null;
    return parseTable(await res.json(), destinations.length);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function formatEta(seconds) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

// Ranked crews with road legs where we have them and straight-line estimates where we do not.
// Sorting is by travel time, so a crew closer by road can outrank one closer as the crow flies.
export function mergeLegs(ranked, legs) {
  const merged = ranked.map(({ crew, meters }, i) => {
    const leg = legs?.[i];
    if (leg) return { crew, meters: leg.meters, seconds: leg.seconds, byRoad: true };
    return { crew, meters, seconds: etaMinutes(meters) * 60, byRoad: false };
  });
  return merged.sort((a, b) => a.seconds - b.seconds || a.crew.id.localeCompare(b.crew.id));
}
