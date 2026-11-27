import test from 'node:test';
import assert from 'node:assert/strict';
import { formatEta, mergeLegs, parseTable, tableUrl } from './routing.js';
import { rankCrews } from './geo.js';
import { crews } from './fixtures.js';

const ORIGIN = [31.2303, 30.0371];

test('tableUrl sends one source and every crew as a destination', () => {
  assert.equal(
    tableUrl(ORIGIN, [[31.234, 30.044], [31.25, 30.05]]),
    'https://router.project-osrm.org/table/v1/driving/31.230300,30.037100;31.234000,30.044000;31.250000,30.050000?sources=0&annotations=duration,distance',
  );
});

test('parseTable skips the origin column and keeps one leg per crew', () => {
  const json = { code: 'Ok', durations: [[0, 420, 900]], distances: [[0, 2300, 5100]] };
  assert.deepEqual(parseTable(json, 2), [
    { seconds: 420, meters: 2300 },
    { seconds: 900, meters: 5100 },
  ]);
});

test('parseTable returns null for errors and null legs for unreachable crews', () => {
  assert.equal(parseTable({ code: 'NoTable' }, 2), null);
  assert.equal(parseTable(null, 2), null);
  assert.deepEqual(parseTable({ code: 'Ok', durations: [[0, 420, null]], distances: [[0, 2300, null]] }, 2), [
    { seconds: 420, meters: 2300 },
    null,
  ]);
});

test('mergeLegs ranks by travel time and marks the source of each number', () => {
  const ranked = rankCrews(crews, ORIGIN);
  const legs = [{ seconds: 900, meters: 4000 }, { seconds: 300, meters: 3000 }];
  const merged = mergeLegs(ranked, legs);
  assert.deepEqual(merged.map((m) => m.crew.id), ['C2', 'C1']);
  assert.equal(merged[0].byRoad, true);
  assert.equal(merged[0].meters, 3000);
  assert.equal(merged[0].seconds, 300);
});

test('mergeLegs falls back to straight-line estimates when routing is missing', () => {
  const ranked = rankCrews(crews, ORIGIN);
  const merged = mergeLegs(ranked, null);
  assert.deepEqual(merged.map((m) => m.crew.id), ['C1', 'C2']);
  assert.ok(merged.every((m) => m.byRoad === false));
  assert.ok(merged[0].seconds < merged[1].seconds);
  assert.equal(merged[0].seconds, Math.max(1, Math.round((merged[0].meters / 1000 / 25) * 60)) * 60);
});

test('mergeLegs mixes a routed crew with a fallback crew', () => {
  const ranked = rankCrews(crews, ORIGIN);
  const merged = mergeLegs(ranked, [null, { seconds: 90, meters: 900 }]);
  assert.deepEqual(merged.map((m) => [m.crew.id, m.byRoad]), [['C2', true], ['C1', false]]);
});

test('formatEta reads in minutes and hours', () => {
  assert.equal(formatEta(10), '1 min');
  assert.equal(formatEta(420), '7 min');
  assert.equal(formatEta(3600), '1 h');
  assert.equal(formatEta(4380), '1 h 13 min');
});
