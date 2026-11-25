export const PRIORITIES = ['critical', 'high', 'normal'];
export const STATUSES = ['open', 'assigned', 'resolved'];
export const KINDS = { leak: 'Pipe leak', burst: 'Main burst', pressure: 'Low pressure', quality: 'Water quality' };

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

// Assign a crew to an open incident. Returns { incidents, crews } or null if the move is not allowed.
export function assignCrew(incidents, crews, incidentId, crewId) {
  const inc = incidents.find((i) => i.id === incidentId);
  const crew = crews.find((c) => c.id === crewId);
  if (!inc || !crew || inc.status !== 'open' || crew.status !== 'available') return null;
  return {
    incidents: incidents.map((i) => (i.id === incidentId ? { ...i, status: 'assigned', crewId } : i)),
    crews: crews.map((c) => (c.id === crewId ? { ...c, status: 'busy', incidentId } : c)),
  };
}

// Resolve an assigned incident and free its crew at the incident's location.
export function resolveIncident(incidents, crews, incidentId) {
  const inc = incidents.find((i) => i.id === incidentId);
  if (!inc || inc.status !== 'assigned') return null;
  return {
    incidents: incidents.map((i) => (i.id === incidentId ? { ...i, status: 'resolved' } : i)),
    crews: crews.map((c) => (c.id === inc.crewId ? { ...c, status: 'available', coord: inc.coord, incidentId: undefined } : c)),
  };
}
