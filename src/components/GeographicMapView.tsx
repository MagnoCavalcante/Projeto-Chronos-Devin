/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Globe, Layers, Maximize2, Minimize2, Crosshair, MapPin } from 'lucide-react';
import { TopicGeoData, GeoPointType } from '../data/geographicCoordinates';

interface GeographicMapViewProps {
  data: TopicGeoData;
  height?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

type LayerStyle = 'dark' | 'satellite' | 'light';

// Usamos tiles SEM texto (nolabels) para evitar nomes em árabe/idioma local.
// Os nomes em português vêm dos nossos marcadores e popups.
const LAYER_CONFIG: Record<LayerStyle, { url: string; attribution: string; label: string }> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO, &copy; OpenStreetMap contributors',
    label: 'Mapa',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    label: 'Satélite',
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO, &copy; OpenStreetMap contributors',
    label: 'Claro',
  },
};

const MARKER_ICONS: Record<GeoPointType, string> = {
  capital: '🏛️',
  batalha: '⚔️',
  porto: '⚓',
  monumento: '📍',
  evento: '📍',
};

const MARKER_COLORS: Record<GeoPointType, string> = {
  capital: '#f59e0b',
  batalha: '#ef4444',
  porto: '#3b82f6',
  monumento: '#8b5cf6',
  evento: '#10b981',
};

function createDivIcon(type: GeoPointType): L.DivIcon {
  const emoji = MARKER_ICONS[type];
  const color = MARKER_COLORS[type];
  return L.divIcon({
    className: 'chronos-map-marker',
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);font-size:14px;">${emoji}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

export default function GeographicMapView({ data, height = '320px', isExpanded = false, onToggleExpand }: GeographicMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routesRef = useRef<L.Polyline[]>([]);
  const [activeLayer, setActiveLayer] = useState<LayerStyle>('dark');
  const [showLayerSwitcher, setShowLayerSwitcher] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: data.center,
      zoom: data.zoom,
      zoomControl: false,
      attributionControl: true,
    });
    mapRef.current = map;

    const layerCfg = LAYER_CONFIG[activeLayer];
    baseLayerRef.current = L.tileLayer(layerCfg.url, {
      attribution: layerCfg.attribution,
      maxZoom: 18,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView(data.center, data.zoom);
  }, [data.center, data.zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !baseLayerRef.current) return;

    map.removeLayer(baseLayerRef.current);
    const layerCfg = LAYER_CONFIG[activeLayer];
    baseLayerRef.current = L.tileLayer(layerCfg.url, {
      attribution: layerCfg.attribution,
      maxZoom: 18,
    }).addTo(map);

  }, [activeLayer]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(m => map.removeLayer(m));
    routesRef.current.forEach(r => map.removeLayer(r));
    markersRef.current = [];
    routesRef.current = [];

    data.routes.forEach(route => {
      if (route.coordinates.length < 2) return;
      const polyline = L.polyline(route.coordinates, {
        color: '#f59e0b',
        weight: 2,
        opacity: 0.7,
        dashArray: '6, 8',
      }).addTo(map);
      polyline.bindPopup(`<div style="font-family:serif;font-size:12px;font-weight:bold;color:#92400e;">${route.name}</div>`);
      routesRef.current.push(polyline);
    });

    data.points.forEach(point => {
      const marker = L.marker([point.lat, point.lng], { icon: createDivIcon(point.type) }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:serif;max-width:220px;">
          <div style="font-weight:bold;font-size:14px;color:#1e293b;margin-bottom:4px;">${MARKER_ICONS[point.type]} ${point.name}</div>
          <div style="font-size:11px;color:#64748b;line-height:1.4;margin-bottom:6px;">${point.description}</div>
          <div style="font-size:10px;color:#94a3b8;font-family:monospace;">${point.lat.toFixed(2)}°, ${point.lng.toFixed(2)}°</div>
        </div>
      `);
      // Rótulo permanente em português sobre o marcador
      marker.bindTooltip(point.name, {
        permanent: true,
        direction: 'top',
        offset: [0, -10],
        className: 'chronos-map-label',
      });
      markersRef.current.push(marker);
    });

    setTimeout(() => map.invalidateSize(), 100);
  }, [data]);

  // Estilos dos rótulos permanentes (injetados uma vez)
  useEffect(() => {
    const styleId = 'chronos-map-label-style';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .chronos-map-label {
        background: rgba(15, 23, 42, 0.85) !important;
        border: 1px solid rgba(245, 158, 11, 0.4) !important;
        border-radius: 4px !important;
        color: #f1f5f9 !important;
        font-family: 'Georgia', serif !important;
        font-size: 10px !important;
        font-weight: 600 !important;
        padding: 1px 6px !important;
        box-shadow: 0 1px 4px rgba(0,0,0,0.5) !important;
        white-space: nowrap !important;
      }
      .chronos-map-label::before {
        border-top-color: rgba(15, 23, 42, 0.85) !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.getElementById(styleId)?.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    setTimeout(() => map.invalidateSize(), 200);
  }, [isExpanded]);

  const flyToPoint = (lat: number, lng: number) => {
    mapRef.current?.flyTo([lat, lng], Math.max((mapRef.current?.getZoom() ?? data.zoom) + 2, 8), { duration: 1.2 });
  };

  const recenter = () => {
    mapRef.current?.flyTo(data.center, data.zoom, { duration: 1.0 });
  };

  const cycleLayer = () => {
    const order: LayerStyle[] = ['dark', 'satellite', 'light'];
    const idx = order.indexOf(activeLayer);
    setActiveLayer(order[(idx + 1) % order.length]);
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-700/60 shadow-lg" style={{ height: isExpanded ? '70vh' : height }}>
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Floating layer switcher button */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1.5">
        <button
          onClick={() => setShowLayerSwitcher(!showLayerSwitcher)}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/80 backdrop-blur-md text-slate-200 rounded-lg border border-slate-700/50 hover:bg-slate-800/90 transition-all text-xs font-mono font-bold shadow-lg cursor-pointer"
          title="Trocar camada de mapa"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>{LAYER_CONFIG[activeLayer].label}</span>
        </button>
        {showLayerSwitcher && (
          <div className="flex flex-col gap-1 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-700/50 p-1.5 shadow-xl">
            {(Object.keys(LAYER_CONFIG) as LayerStyle[]).map(key => (
              <button
                key={key}
                onClick={() => { setActiveLayer(key); setShowLayerSwitcher(false); }}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeLayer === key ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {LAYER_CONFIG[key].label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating controls (recenter + expand) */}
      <div className="absolute top-3 right-14 z-[1000] flex flex-col gap-1.5">
        <button
          onClick={recenter}
          className="p-2 bg-slate-900/80 backdrop-blur-md text-slate-200 rounded-lg border border-slate-700/50 hover:bg-slate-800/90 transition-all shadow-lg cursor-pointer"
          title="Recentralizar mapa"
        >
          <Crosshair className="w-4 h-4 text-amber-400" />
        </button>
        {onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className="p-2 bg-slate-900/80 backdrop-blur-md text-slate-200 rounded-lg border border-slate-700/50 hover:bg-slate-800/90 transition-all shadow-lg cursor-pointer"
            title={isExpanded ? 'Reduzir mapa' : 'Expandir mapa'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-amber-400" />}
          </button>
        )}
        <button
          onClick={cycleLayer}
          className="p-2 bg-slate-900/80 backdrop-blur-md text-slate-200 rounded-lg border border-slate-700/50 hover:bg-slate-800/90 transition-all shadow-lg cursor-pointer"
          title="Próxima camada"
        >
          <Globe className="w-4 h-4 text-amber-400" />
        </button>
      </div>

      {/* Bottom shortcuts bar */}
      {data.points.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-slate-950/85 backdrop-blur-md border-t border-slate-700/50 px-3 py-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 flex-nowrap">
            <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest shrink-0 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Locais:
            </span>
            {data.points.map((pt, idx) => (
              <button
                key={idx}
                onClick={() => flyToPoint(pt.lat, pt.lng)}
                className="px-2.5 py-1 bg-slate-800/80 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 rounded-md text-[10px] font-serif font-medium border border-slate-700/40 hover:border-amber-500/40 transition-all whitespace-nowrap cursor-pointer shrink-0"
              >
                {MARKER_ICONS[pt.type]} {pt.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
