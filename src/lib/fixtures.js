export const incidents = [
  { id: 'INC-1', kind: 'burst', priority: 'critical', status: 'open', address: '12 Nile Corniche', coord: [31.2300, 30.0450], reportedAt: '2026-11-25T08:00:00' },
  { id: 'INC-2', kind: 'leak', priority: 'normal', status: 'open', address: '5 Tahrir Square', coord: [31.2357, 30.0444], reportedAt: '2026-11-25T07:00:00' },
  { id: 'INC-3', kind: 'pressure', priority: 'high', status: 'resolved', address: '9 Maadi Road', coord: [31.2570, 29.9600], reportedAt: '2026-11-24T10:00:00' },
  { id: 'INC-4', kind: 'quality', priority: 'high', status: 'open', address: '3 Zamalek Street', coord: [31.2200, 30.0600], reportedAt: '2026-11-25T06:00:00' },
];
export const crews = [
  { id: 'C1', name: 'Crew 1', status: 'available', coord: [31.2310, 30.0460] },
  { id: 'C2', name: 'Crew 2', status: 'available', coord: [31.2000, 30.0000] },
  { id: 'C3', name: 'Crew 3', status: 'busy', coord: [31.2301, 30.0451], incidentId: 'INC-9' },
];
