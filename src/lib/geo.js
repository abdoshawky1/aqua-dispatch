// Coordinates are [longitude, latitude] in degrees (WGS84), like GeoJSON.
const R = 6371008.8; // mean Earth radius in metres
const rad = (d) => (d * Math.PI) / 180;

// Great-circle distance in metres (haversine).
export function distanceMeters(a, b) {
  const dLat = rad(b[1] - a[1]);
  const dLon = rad(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistance(m) {
  return m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`;
}

// Rough drive time at an average urban speed. A demo estimate, not routing.
export function etaMinutes(meters, kmh = 25) {
  return Math.max(1, Math.round((meters / 1000 / kmh) * 60));
}

// Available crews sorted by distance to a point. Busy crews are never offered.
export function rankCrews(crews, point) {
  return crews
    .filter((c) => c.status === 'available')
    .map((c) => ({ crew: c, meters: distanceMeters(c.coord, point) }))
    .sort((x, y) => x.meters - y.meters || x.crew.id.localeCompare(y.crew.id));
}
