export const PRIORITIES = ['critical', 'high', 'normal'];
export const STATUSES = ['open', 'assigned', 'resolved'];
export const KINDS = { leak: 'Pipe leak', burst: 'Main burst', pressure: 'Low pressure', quality: 'Water quality' };
export const EVENT_LABELS = { reported: 'Reported', assigned: 'Crew assigned', resolved: 'Resolved' };

export function filterIncidents(incidents, { status = 'all', priority = 'all', query = '' } = {}) {
  const q = query.trim().toLowerCase();
  return incidents.filter((i) => {
    if (status !== 'all' && i.status !== status) return false;
    if (priority !== 'all' && i.priority !== priority) return false;
    return !q || i.id.toLowerCase().includes(q) || i.address.toLowerCase().includes(q) || KINDS[i.kind].toLowerCase().includes(q);
  });
}

// Most urgent first, then oldest first. Resolved incidents go last.
export function sortByUrgency(incidents) {
  const rank = (i) => (i.status === 'resolved' ? 99 : PRIORITIES.indexOf(i.priority));
  return [...incidents].sort((a, b) => rank(a) - rank(b) || a.reportedAt.localeCompare(b.reportedAt) || a.id.localeCompare(b.id));
}

export function countByStatus(incidents) {
  const out = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const i of incidents) out[i.status] += 1;
  return out;
}

// The incident's timeline, oldest first, always starting with the report.
// Incidents saved before history existed only have reportedAt, so the report is synthesised.
export function historyOf(incident) {
  const stored = Array.isArray(incident.history) ? incident.history.filter((e) => e && e.at) : [];
  const list = stored.length ? stored : [{ at: incident.reportedAt, type: 'reported' }];
  return [...list].sort((a, b) => String(a.at).localeCompare(String(b.at)));
}

export function describeEvent(event, crews = []) {
  if (event.type === 'assigned') {
    const crew = crews.find((c) => c.id === event.crewId);
    return `Assigned to ${crew ? crew.name : event.crewId}`;
  }
  if (event.type === 'note') return event.note || 'Note';
  return EVENT_LABELS[event.type] || event.type;
}

const withEvent = (incident, event) => ({ ...incident, history: [...historyOf(incident), event] });

// Assign a crew to an open incident. Returns { incidents, crews } or null if the move is not allowed.
export function assignCrew(incidents, crews, incidentId, crewId, at = new Date().toISOString()) {
  const inc = incidents.find((i) => i.id === incidentId);
  const crew = crews.find((c) => c.id === crewId);
  if (!inc || !crew || inc.status !== 'open' || crew.status !== 'available') return null;
  return {
    incidents: incidents.map((i) => (i.id === incidentId ? withEvent({ ...i, status: 'assigned', crewId }, { at, type: 'assigned', crewId }) : i)),
    crews: crews.map((c) => (c.id === crewId ? { ...c, status: 'busy', incidentId } : c)),
  };
}

// Resolve an assigned incident and free its crew at the incident's location.
export function resolveIncident(incidents, crews, incidentId, at = new Date().toISOString()) {
  const inc = incidents.find((i) => i.id === incidentId);
  if (!inc || inc.status !== 'assigned') return null;
  return {
    incidents: incidents.map((i) => (i.id === incidentId ? withEvent({ ...i, status: 'resolved' }, { at, type: 'resolved' }) : i)),
    crews: crews.map((c) => (c.id === inc.crewId ? { ...c, status: 'available', coord: inc.coord, incidentId: undefined } : c)),
  };
}
