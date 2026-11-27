import test from 'node:test';
import assert from 'node:assert/strict';
import { filterIncidents, sortByUrgency, countByStatus, assignCrew, resolveIncident, historyOf, describeEvent } from './incidents.js';
import { incidents, crews } from './fixtures.js';

test('filter by status, priority and text', () => {
  assert.deepEqual(filterIncidents(incidents, { status: 'open' }).map((i) => i.id), ['INC-1', 'INC-2', 'INC-4']);
  assert.deepEqual(filterIncidents(incidents, { priority: 'high' }).map((i) => i.id), ['INC-3', 'INC-4']);
  assert.deepEqual(filterIncidents(incidents, { query: 'tahrir' }).map((i) => i.id), ['INC-2']);
  assert.deepEqual(filterIncidents(incidents, { query: 'burst' }).map((i) => i.id), ['INC-1']);
  assert.equal(filterIncidents(incidents, { status: 'open', priority: 'normal' }).length, 1);
});
test('urgency sort: priority, then oldest, resolved last, input untouched', () => {
  const copy = [...incidents];
  assert.deepEqual(sortByUrgency(incidents).map((i) => i.id), ['INC-1', 'INC-4', 'INC-2', 'INC-3']);
  assert.deepEqual(incidents, copy);
});
test('count by status includes zeros', () => {
  assert.deepEqual(countByStatus(incidents), { open: 3, assigned: 0, resolved: 1 });
});
test('assign marks both sides and does not mutate', () => {
  const r = assignCrew(incidents, crews, 'INC-1', 'C1');
  assert.equal(r.incidents[0].status, 'assigned');
  assert.equal(r.incidents[0].crewId, 'C1');
  assert.equal(r.crews[0].status, 'busy');
  assert.equal(incidents[0].status, 'open');
});
test('assign refuses busy crews, non-open incidents and unknown ids', () => {
  assert.equal(assignCrew(incidents, crews, 'INC-1', 'C3'), null);
  assert.equal(assignCrew(incidents, crews, 'INC-3', 'C1'), null);
  assert.equal(assignCrew(incidents, crews, 'nope', 'C1'), null);
});
test('resolve frees the crew at the incident location', () => {
  const a = assignCrew(incidents, crews, 'INC-1', 'C1');
  const r = resolveIncident(a.incidents, a.crews, 'INC-1');
  assert.equal(r.incidents[0].status, 'resolved');
  const c1 = r.crews.find((c) => c.id === 'C1');
  assert.equal(c1.status, 'available');
  assert.deepEqual(c1.coord, incidents[0].coord);
});
test('resolve only works on assigned incidents', () => {
  assert.equal(resolveIncident(incidents, crews, 'INC-1'), null);
});

test('historyOf synthesises the report for incidents saved without history', () => {
  assert.deepEqual(historyOf(incidents[0]), [{ at: '2026-11-25T08:00:00', type: 'reported' }]);
});

test('historyOf sorts stored events oldest first', () => {
  const inc = { reportedAt: '2026-11-25T08:00:00', history: [{ at: '2026-11-25T09:00:00', type: 'resolved' }, { at: '2026-11-25T08:00:00', type: 'reported' }] };
  assert.deepEqual(historyOf(inc).map((e) => e.type), ['reported', 'resolved']);
});

test('assign and resolve append to the timeline', () => {
  const a = assignCrew(incidents, crews, 'INC-1', 'C1', '2026-11-25T09:00:00.000Z');
  assert.deepEqual(a.incidents[0].history.map((e) => e.type), ['reported', 'assigned']);
  assert.equal(a.incidents[0].history[1].crewId, 'C1');
  const r = resolveIncident(a.incidents, a.crews, 'INC-1', '2026-11-25T09:30:00.000Z');
  assert.deepEqual(r.incidents[0].history.map((e) => e.type), ['reported', 'assigned', 'resolved']);
  assert.equal(incidents[0].history, undefined);
});

test('describeEvent names the crew and passes notes through', () => {
  assert.equal(describeEvent({ type: 'assigned', crewId: 'C2' }, crews), 'Assigned to Crew 2');
  assert.equal(describeEvent({ type: 'assigned', crewId: 'C9' }, crews), 'Assigned to C9');
  assert.equal(describeEvent({ type: 'resolved' }), 'Resolved');
  assert.equal(describeEvent({ type: 'note', note: 'Valve closed' }), 'Valve closed');
});
