import test from 'node:test';
import assert from 'node:assert/strict';
import { distanceMeters, formatDistance, etaMinutes, rankCrews } from './geo.js';
import { crews } from './fixtures.js';

test('distance between identical points is zero', () => assert.equal(distanceMeters([31.2, 30], [31.2, 30]), 0));
test('one degree of latitude is about 111.2 km', () => {
  const d = distanceMeters([31, 30], [31, 31]);
  assert.ok(Math.abs(d - 111195) < 100, String(d));
});
test('Cairo Tahrir to Giza Pyramids is roughly 13 km', () => {
  const d = distanceMeters([31.2357, 30.0444], [31.1342, 29.9792]) / 1000;
  assert.ok(d > 11 && d < 15, String(d));
});
test('distance is symmetric', () => {
  const a = [31.2, 30.0], b = [31.3, 30.1];
  assert.equal(distanceMeters(a, b), distanceMeters(b, a));
});
test('formatDistance switches to km', () => {
  assert.equal(formatDistance(480), '480 m');
  assert.equal(formatDistance(1540), '1.5 km');
});
test('eta is at least one minute and scales with distance', () => {
  assert.equal(etaMinutes(10), 1);
  assert.equal(etaMinutes(5000), 12); // 5 km at 25 km/h
});
test('rankCrews skips busy crews and sorts nearest first', () => {
  const r = rankCrews(crews, [31.2300, 30.0450]);
  assert.deepEqual(r.map((x) => x.crew.id), ['C1', 'C2']);
  assert.ok(r[0].meters < r[1].meters);
});
test('rankCrews with no available crews is empty', () => {
  assert.deepEqual(rankCrews(crews.map((c) => ({ ...c, status: 'busy' })), [31.2, 30]), []);
});
