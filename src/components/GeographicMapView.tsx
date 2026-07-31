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

// Catálogo de países e regiões com nomes em português do Brasil e coordenadas aproximadas
const COUNTRY_LABELS_PT: { name: string; lat: number; lng: number }[] = [
  // Oriente Médio e Ásia Menor
  { name: 'Iraque', lat: 33.3, lng: 44.4 },
  { name: 'Irã', lat: 32.4, lng: 53.7 },
  { name: 'Síria', lat: 34.8, lng: 38.9 },
  { name: 'Turquia', lat: 39.0, lng: 35.2 },
  { name: 'Arábia Saudita', lat: 23.9, lng: 45.1 },
  { name: 'Israel', lat: 31.5, lng: 34.8 },
  { name: 'Palestina', lat: 31.9, lng: 35.3 },
  { name: 'Jordânia', lat: 30.6, lng: 36.2 },
  { name: 'Líbano', lat: 33.9, lng: 35.9 },
  { name: 'Iêmen', lat: 15.6, lng: 48.5 },
  { name: 'Omã', lat: 21.5, lng: 55.9 },
  // Norte da África
  { name: 'Egito', lat: 26.8, lng: 30.8 },
  { name: 'Líbia', lat: 26.3, lng: 17.2 },
  { name: 'Tunísia', lat: 33.9, lng: 9.5 },
  { name: 'Argélia', lat: 28.0, lng: 1.7 },
  { name: 'Marrocos', lat: 31.8, lng: -7.1 },
  { name: 'Sudão', lat: 12.9, lng: 30.2 },
  // Europa
  { name: 'Portugal', lat: 39.4, lng: -8.2 },
  { name: 'Espanha', lat: 40.0, lng: -3.7 },
  { name: 'França', lat: 46.2, lng: 2.2 },
  { name: 'Reino Unido', lat: 54.0, lng: -2.0 },
  { name: 'Irlanda', lat: 53.4, lng: -8.2 },
  { name: 'Alemanha', lat: 51.2, lng: 10.5 },
  { name: 'Itália', lat: 42.8, lng: 12.6 },
  { name: 'Grécia', lat: 39.0, lng: 22.0 },
  { name: 'Bélgica', lat: 50.5, lng: 4.5 },
  { name: 'Holanda', lat: 52.1, lng: 5.3 },
  { name: 'Suíça', lat: 46.8, lng: 8.2 },
  { name: 'Áustria', lat: 47.5, lng: 14.6 },
  { name: 'Polônia', lat: 51.9, lng: 19.1 },
  { name: 'Rússia', lat: 61.5, lng: 105.3 },
  { name: 'Ucrânia', lat: 48.4, lng: 31.2 },
  { name: 'Suécia', lat: 60.1, lng: 18.6 },
  { name: 'Noruega', lat: 64.5, lng: 11.5 },
  { name: 'Dinamarca', lat: 56.3, lng: 9.5 },
  { name: 'Finlândia', lat: 61.9, lng: 25.7 },
  { name: 'Tchéquia', lat: 49.8, lng: 15.5 },
  { name: 'Hungria', lat: 47.2, lng: 19.5 },
  { name: 'Romênia', lat: 45.9, lng: 24.9 },
  { name: 'Bulgária', lat: 42.7, lng: 25.5 },
  { name: 'Sérvia', lat: 44.0, lng: 21.0 },
  { name: 'Croácia', lat: 45.1, lng: 15.2 },
  // Ásia
  { name: 'China', lat: 35.0, lng: 104.0 },
  { name: 'Índia', lat: 22.6, lng: 78.9 },
  { name: 'Japão', lat: 36.2, lng: 138.3 },
  { name: 'Coreia do Sul', lat: 36.5, lng: 127.8 },
  { name: 'Coreia do Norte', lat: 40.3, lng: 127.5 },
  { name: 'Mongólia', lat: 46.9, lng: 103.8 },
  { name: 'Vietnã', lat: 16.0, lng: 107.8 },
  { name: 'Tailândia', lat: 15.9, lng: 101.0 },
  { name: 'Camboja', lat: 12.6, lng: 104.9 },
  { name: 'Afeganistão', lat: 33.9, lng: 67.0 },
  { name: 'Paquistão', lat: 30.4, lng: 69.3 },
  { name: 'Cazaquistão', lat: 48.0, lng: 66.9 },
  { name: 'Uzbequistão', lat: 41.4, lng: 64.6 },
  // Américas
  { name: 'Brasil', lat: -10.0, lng: -55.0 },
  { name: 'Argentina', lat: -34.0, lng: -64.0 },
  { name: 'Uruguai', lat: -32.5, lng: -55.8 },
  { name: 'Paraguai', lat: -23.4, lng: -58.4 },
  { name: 'Bolívia', lat: -16.3, lng: -63.6 },
  { name: 'Chile', lat: -33.4, lng: -70.7 },
  { name: 'Peru', lat: -9.2, lng: -75.0 },
  { name: 'Colômbia', lat: 4.6, lng: -74.3 },
  { name: 'Venezuela', lat: 6.4, lng: -66.6 },
  { name: 'México', lat: 23.6, lng: -102.6 },
  { name: 'Estados Unidos', lat: 39.8, lng: -98.6 },
  { name: 'Canadá', lat: 56.1, lng: -106.3 },
  { name: 'Cuba', lat: 21.5, lng: -77.8 },
  // África Subsaariana
  { name: 'Etiópia', lat: 9.1, lng: 40.5 },
  { name: 'Quênia', lat: -0.0, lng: 37.9 },
  { name: 'Nigéria', lat: 9.1, lng: 8.7 },
  { name: 'África do Sul', lat: -30.6, lng: 22.9 },
  { name: 'Gana', lat: 7.9, lng: -1.0 },
  { name: 'Angola', lat: -11.2, lng: 17.9 },
  { name: 'Moçambique', lat: -18.7, lng: 35.5 },
  // Oceania
  { name: 'Austrália', lat: -25.3, lng: 133.8 },
  // Mares e regiões geográficas
  { name: 'Mar Mediterrâneo', lat: 34.0, lng: 18.0 },
  { name: 'Mar Egeu', lat: 38.0, lng: 25.5 },
  { name: 'Mar Negro', lat: 43.4, lng: 34.0 },
  { name: 'Mar Vermelho', lat: 20.0, lng: 38.0 },
  { name: 'Mar Cáspio', lat: 41.8, lng: 50.5 },
  { name: 'Golfo Pérsico', lat: 27.0, lng: 51.5 },
  { name: 'Oceano Atlântico', lat: 0.0, lng: -30.0 },
  { name: 'Oceano Índico', lat: -20.0, lng: 80.0 },
  { name: 'Oceano Pacífico', lat: 0.0, lng: 160.0 },
  { name: 'Canal da Mancha', lat: 50.0, lng: 1.0 },
  { name: 'Estreito de Bósforo', lat: 41.1, lng: 29.0 },
  { name: 'Península Arábica', lat: 22.0, lng: 47.0 },
  { name: 'Península Itálica', lat: 42.0, lng: 12.0 },
  { name: 'Península Ibérica', lat: 39.5, lng: -4.0 },
  { name: 'Balcãs', lat: 42.5, lng: 21.0 },
  { name: 'Cáucaso', lat: 42.0, lng: 44.0 },
  { name: 'Mesopotâmia', lat: 32.0, lng: 45.0 },
  { name: 'Crescente Fértil', lat: 33.0, lng: 42.0 },
  { name: 'Vale do Nilo', lat: 24.0, lng: 32.0 },
  { name: 'Sertão', lat: -10.0, lng: -40.0 },
  { name: 'Amazônia', lat: -3.0, lng: -60.0 },
  { name: 'Andes', lat: -20.0, lng: -68.0 },
  { name: 'Himalaia', lat: 28.0, lng: 87.0 },
  { name: 'Sahara', lat: 23.0, lng: 12.0 },
  { name: 'Estepe Eurasiana', lat: 50.0, lng: 70.0 },
];

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
  const countryLabelsRef = useRef<L.Marker[]>([]);
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

    // Adiciona rótulos de países/regiões em português
    const updateCountryLabels = () => {
      countryLabelsRef.current.forEach(m => map.removeLayer(m));
      countryLabelsRef.current = [];
      const zoom = map.getZoom();
      // Mostra rótulos de países apenas em zoom baixo/médio (panorama)
      if (zoom > 6) return;
      const bounds = map.getBounds();
      COUNTRY_LABELS_PT.forEach(c => {
        if (!bounds.contains([c.lat, c.lng])) return;
        const labelMarker = L.marker([c.lat, c.lng], {
          icon: L.divIcon({
            className: 'chronos-country-label',
            html: `<span>${c.name}</span>`,
            iconSize: [0, 0],
          }),
          interactive: false,
          keyboard: false,
        }).addTo(map);
        countryLabelsRef.current.push(labelMarker);
      });
    };

    updateCountryLabels();
    map.on('moveend zoomend', updateCountryLabels);

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

  // Estilos dos rótulos de países (injetados uma vez)
  useEffect(() => {
    const styleId = 'chronos-country-label-style';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .chronos-country-label {
        pointer-events: none !important;
      }
      .chronos-country-label span {
        display: inline-block;
        font-family: 'Georgia', serif !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        color: rgba(241, 245, 249, 0.7) !important;
        text-shadow: 0 0 3px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.6) !important;
        letter-spacing: 0.5px !important;
        white-space: nowrap !important;
        text-transform: uppercase !important;
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
