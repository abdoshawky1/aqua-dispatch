import { distanceMeters, etaMinutes, formatDistance, rankCrews } from '../lib/geo.js';
import { KINDS } from '../lib/incidents.js';

export default function IncidentPanel({ incident, crews, onAssign, onResolve, onClose }) {
  const ranked = incident.status === 'open' ? rankCrews(crews, incident.coord) : [];
  const crew = crews.find((c) => c.id === incident.crewId);
  return (
    <section className="detail card" aria-label={`Incident ${incident.id}`}>
      <header>
        <h2>{incident.id}: {KINDS[incident.kind]}</h2>
        <button className="btn btn-ghost" onClick={onClose} aria-label="Close">✕</button>
      </header>
      <p><span className={`pill pill-${incident.status === 'resolved' ? 'resolved' : incident.priority}`}>{incident.status === 'resolved' ? 'resolved' : incident.priority}</span> <span className="pill pill-status">{incident.status}</span></p>
      <p className="muted">{incident.address}<br />Reported {new Date(incident.reportedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>

      {incident.status === 'open' && (
        ranked.length ? (
          <>
            <h3>Nearest available crews</h3>
            <ul className="crews">
              {ranked.map(({ crew: c, meters }, idx) => (
                <li key={c.id}>
                  <span><strong>{c.name}</strong>{idx === 0 && <em className="best"> nearest</em>}<br /><span className="muted small">{formatDistance(meters)} · about {etaMinutes(meters)} min</span></span>
                  <button className="btn btn-small" onClick={() => onAssign(incident.id, c.id)}>Assign</button>
                </li>
              ))}
            </ul>
          </>
        ) : <p className="notice">All crews are busy. Resolve an assigned incident to free one.</p>
      )}
      {incident.status === 'assigned' && crew && (
        <>
          <p><strong>{crew.name}</strong> is on the way ({formatDistance(distanceMeters(crew.coord, incident.coord))} away).</p>
          <button className="btn" onClick={() => onResolve(incident.id)}>Mark resolved</button>
        </>
      )}
      {incident.status === 'resolved' && <p className="muted">This incident is closed.</p>}
    </section>
  );
}
