// All data here is invented for the demo. Locations are real Cairo streets and districts,
// but the incidents, crews and pipes are not real utility data.
export const CENTER = [31.2357, 30.0444];

export const initialIncidents = [
  { id: 'INC-101', kind: 'burst', priority: 'critical', status: 'open', address: 'Corniche El Nil, Garden City', coord: [31.2303, 30.0371], reportedAt: '2026-11-25T07:40:00' },
  { id: 'INC-102', kind: 'leak', priority: 'normal', status: 'open', address: 'Talaat Harb Street, Downtown', coord: [31.2395, 30.0488], reportedAt: '2026-11-25T08:15:00' },
  { id: 'INC-103', kind: 'pressure', priority: 'high', status: 'open', address: 'Road 9, Maadi', coord: [31.2578, 29.9602], reportedAt: '2026-11-25T06:50:00',
    history: [
      { at: '2026-11-25T06:50:00', type: 'reported' },
      { at: '2026-11-25T07:20:00', type: 'note', note: 'Inlet pressure logger reads normal, site check requested' },
    ] },
  { id: 'INC-104', kind: 'quality', priority: 'high', status: 'open', address: '26th of July Corridor, Zamalek', coord: [31.2204, 30.0626], reportedAt: '2026-11-25T07:05:00' },
  { id: 'INC-105', kind: 'leak', priority: 'normal', status: 'open', address: 'Al Haram Street, Giza', coord: [31.1630, 30.0105], reportedAt: '2026-11-25T05:55:00' },
  { id: 'INC-106', kind: 'burst', priority: 'critical', status: 'open', address: 'Salah Salem Road, Nasr City', coord: [31.3070, 30.0580], reportedAt: '2026-11-25T08:30:00' },
  { id: 'INC-107', kind: 'pressure', priority: 'normal', status: 'open', address: 'Mohandessin, Gamet El Dowal', coord: [31.2000, 30.0560], reportedAt: '2026-11-25T04:20:00' },
  { id: 'INC-108', kind: 'leak', priority: 'high', status: 'open', address: 'Abbassia Square', coord: [31.2780, 30.0720], reportedAt: '2026-11-25T03:45:00' },
  { id: 'INC-109', kind: 'quality', priority: 'normal', status: 'resolved', address: 'Shubra Street', coord: [31.2450, 30.1000], reportedAt: '2026-11-24T14:10:00',
    history: [
      { at: '2026-11-24T14:10:00', type: 'reported' },
      { at: '2026-11-24T14:55:00', type: 'note', note: 'Discoloured water from a service line, not the main' },
      { at: '2026-11-24T17:30:00', type: 'resolved' },
    ] },
];

export const initialCrews = [
  { id: 'C1', name: 'Crew 1', status: 'available', coord: [31.2340, 30.0440] },
  { id: 'C2', name: 'Crew 2', status: 'available', coord: [31.2140, 30.0580] },
  { id: 'C3', name: 'Crew 3', status: 'available', coord: [31.2500, 29.9800] },
  { id: 'C4', name: 'Crew 4', status: 'available', coord: [31.2900, 30.0600] },
  { id: 'C5', name: 'Crew 5', status: 'available', coord: [31.1750, 30.0200] },
];

// Simplified main pipes (invented). Each is a line of [lon, lat] points.
export const pipes = [
  { id: 'P1', name: 'East-west trunk main', coords: [[31.1630, 30.0105], [31.1900, 30.0300], [31.2200, 30.0450], [31.2395, 30.0488], [31.2780, 30.0720]] },
  { id: 'P2', name: 'South feeder', coords: [[31.2303, 30.0371], [31.2400, 30.0100], [31.2578, 29.9602]] },
  { id: 'P3', name: 'North feeder', coords: [[31.2395, 30.0488], [31.2300, 30.0620], [31.2450, 30.1000]] },
  { id: 'P4', name: 'Nasr City ring', coords: [[31.2780, 30.0720], [31.3070, 30.0580], [31.2900, 30.0600], [31.2780, 30.0450], [31.2395, 30.0488]] },
];
