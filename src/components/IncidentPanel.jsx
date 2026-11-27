import { useMemo } from 'react';
import { distanceMeters, etaMinutes, formatDistance, rankCrews } from '../lib/geo.js';
import { formatEta, mergeLegs } from '../lib/routing.js';
import { useRoadEta } from '../hooks/useRoadEta.js';
import { KINDS } from '../lib/incidents.js';
import IncidentTimeline from './IncidentTimeline.jsx';

export default function IncidentPanel({ incident, crews, onAssign, onResolve, onClose }) {
  const free = useMemo(() => crews.filter((c) => c.status === 'available'), [crews]);
  const ranked = useMemo(() => (incident.status === 'open' ? rankCrews(free, incident.coord) : []), [free, incident]);
  const crew = crews.find((c) => c.id === incident.crewId);
  // Route the crews we are about to show: the free ones for an open incident, the assigned one after that.
  const target = incident.status === 'open' ? ranked.map((r) => r.crew) : incident.status === 'assigned' && crew ? [crew] : [];
  const { status: routeStatus, legs } = useRoadEta(target.length ? incident : null, target);
  const options = useMemo(() => mergeLegs(ranked, legs), [ranked, legs]);
  const assignedLeg = incident.status === 'assigned' ? legs?.[0] : null;
  const reported = new Date(incident.reportedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <section className="detail card" aria-label={`Incident ${incident.id}`}>
      <header>
        <h2>{incident.id}: {KINDS[incident.kind]}</h2>
        <button className="btn btn-ghost" onClick={onClose} aria-label="Close">✕</button>
      </header>
      <p><span className={`pill pill-${incident.status === 'resolved' ? 'resolved' : incident.priority}`}>{incident.status === 'resolved' ? 'resolved' : incident.priority}</span> <span className="pill pill-status">{incident.status}</span></p>
      <p className="muted">{incident.address}<br />Reported {reported}</p>

      {incident.status === 'open' && (
        options.length ? (
          <>
            <h3>Nearest available crews</h3>
            {routeStatus === 'loading' && <p className="muted small">Checking road routes…</p>}
            {routeStatus === 'failed' && <p className="muted small">Road routing is unavailable, so these are straight-line estimates.</p>}
            <ul className="crews">
              {options.map(({ crew: c, meters, seconds, byRoad }, idx) => (
                <li key={c.id}>
                  <span>
                    <strong>{c.name}</strong>{idx === 0 && <em className="best"> nearest</em>}<br />
                    <span className="muted small">{formatDistance(meters)} {byRoad ? 'by road' : 'straight-line'} · about {formatEta(seconds)}</span>
                  </span>
                  <button className="btn btn-small" onClick={() => onAssign(incident.id, c.id)}>Assign</button>
                </li>
              ))}
            </ul>
            {routeStatus === 'done' && <p className="muted small">Drive times are road routes from the public OSRM demo server.</p>}
          </>
        ) : <p className="notice">All crews are busy. Resolve an assigned incident to free one.</p>
      )}
      {incident.status === 'assigned' && crew && (
        <>
          <p><strong>{crew.name}</strong> is on the way ({assignedLeg
            ? `${formatDistance(assignedLeg.meters)} by road, about ${formatEta(assignedLeg.seconds)}`
            : `${formatDistance(distanceMeters(crew.coord, incident.coord))} straight-line, about ${formatEta(etaMinutes(distanceMeters(crew.coord, incident.coord)) * 60)}`}).</p>
          <button className="btn" onClick={() => onResolve(incident.id)}>Mark resolved</button>
        </>
      )}
      {incident.status === 'resolved' && <p className="muted">This incident is closed.</p>}

      <IncidentTimeline incident={incident} crews={crews} />
    </section>
  );
}
