import { describeEvent, historyOf } from '../lib/incidents.js';

const when = (at) => new Date(at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

export default function IncidentTimeline({ incident, crews }) {
  const events = historyOf(incident);
  return (
    <div className="timeline">
      <h3>History</h3>
      <ol aria-label="Incident history">
        {events.map((e, i) => (
          <li key={`${e.at}-${e.type}-${i}`}>
            <span className="tl-body">
              <strong>{describeEvent(e, crews)}</strong>
              <br />
              <span className="muted small">{when(e.at)}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
