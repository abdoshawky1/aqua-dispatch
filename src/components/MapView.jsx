import { useEffect, useRef } from 'react';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import OSM from 'ol/source/OSM.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import LineString from 'ol/geom/LineString.js';
import { fromLonLat } from 'ol/proj.js';
import { Circle as CircleStyle, Fill, RegularShape, Stroke, Style } from 'ol/style.js';
import { CENTER, pipes } from '../data/seed.js';

const COLORS = { critical: '#c62828', high: '#ef6c00', normal: '#1565c0', resolved: '#78909c' };

const incidentStyle = (f, selected) => {
  const status = f.get('status');
  const color = status === 'resolved' ? COLORS.resolved : COLORS[f.get('priority')];
  return new Style({
    image: new CircleStyle({
      radius: selected ? 11 : 8,
      fill: new Fill({ color }),
      stroke: new Stroke({ color: selected ? '#111' : '#fff', width: selected ? 3 : 2 }),
    }),
  });
};
const crewStyle = (f) => new Style({
  image: new RegularShape({
    points: 4, radius: 9, angle: Math.PI / 4,
    fill: new Fill({ color: f.get('status') === 'busy' ? '#6a1b9a' : '#2e7d32' }),
    stroke: new Stroke({ color: '#fff', width: 2 }),
  }),
});
const pipeStyle = new Style({ stroke: new Stroke({ color: 'rgba(11,110,138,.65)', width: 4 }) });

export default function MapView({ incidents, crews, selectedId, onSelect, layers }) {
  const el = useRef(null);
  const ref = useRef({});
  const selectedRef = useRef(selectedId);
  const onSelectRef = useRef(onSelect);
  selectedRef.current = selectedId;
  onSelectRef.current = onSelect;

  // Create the map once.
  useEffect(() => {
    const incSource = new VectorSource();
    const crewSource = new VectorSource();
    const pipeSource = new VectorSource({
      features: pipes.map((p) => new Feature({ geometry: new LineString(p.coords.map((c) => fromLonLat(c))), name: p.name })),
    });
    const l = {
      pipes: new VectorLayer({ source: pipeSource, style: pipeStyle }),
      crews: new VectorLayer({ source: crewSource, style: crewStyle, zIndex: 2 }),
      incidents: new VectorLayer({ source: incSource, style: (f) => incidentStyle(f, f.get('id') === selectedRef.current), zIndex: 3 }),
    };
    const map = new Map({
      target: el.current,
      layers: [new TileLayer({ source: new OSM() }), l.pipes, l.crews, l.incidents],
      view: new View({ center: fromLonLat(CENTER), zoom: 11.5 }),
    });
    map.on('singleclick', (e) => {
      const hit = map.forEachFeatureAtPixel(e.pixel, (f) => f, { layerFilter: (layer) => layer === l.incidents, hitTolerance: 6 });
      onSelectRef.current(hit ? hit.get('id') : null);
    });
    map.on('pointermove', (e) => {
      const hit = map.hasFeatureAtPixel(e.pixel, { layerFilter: (layer) => layer === l.incidents, hitTolerance: 6 });
      map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });
    ref.current = { map, incSource, crewSource, layers: l };
    return () => map.setTarget(undefined);
  }, []);

  // Redraw points when the data changes.
  useEffect(() => {
    const { incSource, crewSource } = ref.current;
    incSource.clear();
    incSource.addFeatures(incidents.map((i) => new Feature({ geometry: new Point(fromLonLat(i.coord)), id: i.id, status: i.status, priority: i.priority })));
    crewSource.clear();
    crewSource.addFeatures(crews.map((c) => new Feature({ geometry: new Point(fromLonLat(c.coord)), id: c.id, status: c.status })));
  }, [incidents, crews]);

  // Restyle when the selection changes, and centre on the selected incident.
  useEffect(() => {
    const { map, layers: l } = ref.current;
    l.incidents.changed();
    const inc = incidents.find((i) => i.id === selectedId);
    if (inc) map.getView().animate({ center: fromLonLat(inc.coord), zoom: Math.max(map.getView().getZoom(), 13), duration: 350 });
    // Only re-centre when the selection itself changes, not when incident data updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    const { layers: l } = ref.current;
    for (const k of Object.keys(layers)) l[k].setVisible(layers[k]);
  }, [layers]);

  return <div ref={el} className="map" role="application" aria-label="Incident map" />;
}
