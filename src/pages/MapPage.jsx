import { db } from '@/api/base44Client';

import React from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Tooltip, ScaleControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, X, Filter, Compass, FileText, Database, Image, Video, ExternalLink, Layers, Info, Crosshair } from "lucide-react";

import { REGIONS } from "@/lib/polarSetu";
import { AccessBadge, ReviewBadge, PrototypeTag } from "@/components/Badges";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const FALLBACK_STATIONS = [
  { id: "s1", name: "Bharati", region: "antarctica", latitude: -69.4, longitude: 76.18, description: "Research station in Larsemann Hills, East Antarctica. Commissioned in 2012. Supports research in polar geology, atmospheric science and oceanography.", commissioned_year: 2012, status: "active", is_prototype: true },
  { id: "s2", name: "Maitri", region: "antarctica", latitude: -70.75, longitude: 11.72, description: "India's second Antarctic research station, operational since 1989. Located in the Schirmacher Oasis, it supports year-round scientific activities.", commissioned_year: 1989, status: "active", is_prototype: true },
  { id: "s3", name: "Himadri", region: "arctic", latitude: 78.92, longitude: 11.93, description: "India's first Arctic research station in Ny-Ålesund, Svalbard. Established 2008. Facilitates Arctic atmospheric and biological research.", commissioned_year: 2008, status: "active", is_prototype: true },
  { id: "s4", name: "Himansh", region: "himalaya", latitude: 32.35, longitude: 77.13, description: "Glaciological research station in the Western Himalaya, monitoring Himalayan glaciers and climate change impacts.", commissioned_year: 2012, status: "seasonal", is_prototype: true },
  { id: "s5", name: "Dakshin Gangotri", region: "antarctica", latitude: -70.12, longitude: 12.0, description: "India's first Antarctic station, established 1983. Now decommissioned and buried under ice. Maintained as a historic monument.", commissioned_year: 1983, status: "decommissioned", is_prototype: true },
];

const REGION_COLORS = {
  antarctica: "#4DA8D8",
  arctic: "#818CF8",
  himalaya: "#14B8A6",
};

const REGION_CENTERS = {
  antarctica: [-75, 20],
  arctic: [78, 5],
  himalaya: [32, 77],
};

export default function MapPage() {
  const [stations, setStations] = React.useState([]);
  const [assets, setAssets] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [regionFilter, setRegionFilter] = React.useState("");
  const [mapStyle, setMapStyle] = React.useState("dark");
  const [showLegend, setShowLegend] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const [stRes, aRes] = await Promise.all([
          db.entities.Station.filter({}, { limit: 50 }),
          db.entities.Asset.filter({ review_status: "approved" }, { limit: 100 }),
        ]);
        setStations(stRes.items?.length ? stRes.items : FALLBACK_STATIONS);
        setAssets(aRes.items || []);
      } catch (e) {
        setStations(FALLBACK_STATIONS);
        setAssets([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredStations = regionFilter ? stations.filter((s) => s.region === regionFilter) : stations;
  const stationAssets = (station) => assets.filter((a) => a.station_id === station.name || a.region === station.region).slice(0, 6);

  const customIcon = (color, isActive) =>
    L.divIcon({
      className: "custom-marker",
      html: `<div style="position:relative;width:28px;height:28px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:${color}33;animation:pulse 2s infinite;"></div>
        <div style="position:absolute;inset:4px;border-radius:50% 50% 50% 0;background:${color};border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);transform:rotate(-45deg);"></div>
        <div style="position:absolute;top:8px;left:8px;width:8px;height:8px;border-radius:50%;background:white;"></div>
      </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });

  const tileLayers = {
    dark: {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; Esri',
    },
    light: {
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    },
  };

  const mapCenter = regionFilter ? REGION_CENTERS[regionFilter] : [20, 40];
  const mapZoom = regionFilter ? 3 : 2;

  return (
    <div className="mx-auto max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8">
      <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="font-medium text-foreground">Interactive Map</span>
      </nav>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#071A2B]">Interactive Polar Map</h1>
          <p className="mt-1 text-sm text-muted-foreground">India's research stations across Antarctica, the Arctic and the Himalaya — linked to repository content</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Map style toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1">
            <Layers className="ml-1.5 h-4 w-4 text-muted-foreground" />
            {["dark", "satellite", "light"].map((s) => (
              <button
                key={s}
                onClick={() => setMapStyle(s)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium capitalize transition-colors ${mapStyle === s ? "bg-[#0B2942] text-white" : "text-muted-foreground hover:bg-muted"}`}
              >
                {s}
              </button>
            ))}
          </div>
          {/* Region filter */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-[#4DA8D8] focus:outline-none"
          >
            <option value="">All Regions</option>
            <option value="antarctica">Antarctica</option>
            <option value="arctic">Arctic</option>
            <option value="himalaya">Himalaya</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="relative h-[500px] overflow-hidden rounded-xl border border-border shadow-md lg:h-[620px]">
            {loading ? (
              <div className="flex h-full items-center justify-center bg-[#071A2B]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-[#4DA8D8]" />
              </div>
            ) : (
              <MapContainer
                key={`${mapStyle}-${regionFilter}`}
                center={mapCenter}
                zoom={mapZoom}
                minZoom={1}
                maxZoom={12}
                scrollWheelZoom={true}
                className="h-full w-full"
                style={{ background: mapStyle === "dark" ? "#0B1426" : "#D9E3E8" }}
              >
                <TileLayer
                  url={tileLayers[mapStyle].url}
                  attribution={tileLayers[mapStyle].attribution}
                />
                <ScaleControl position="bottomleft" />

                {filteredStations.map((s) =>
                  s.latitude != null && s.longitude != null ? (
                    <Marker
                      key={s.id}
                      position={[s.latitude, s.longitude]}
                      icon={customIcon(REGION_COLORS[s.region] || "#4DA8D8", s.status === "active")}
                      eventHandlers={{ click: () => setSelected(s) }}
                    >
                      <Popup>
                        <div className="min-w-[180px] text-sm">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" style={{ color: REGION_COLORS[s.region] }} />
                            <strong>{s.name}</strong>
                          </div>
                          <div className="mt-1 text-xs text-slate-500">{REGIONS[s.region]}</div>
                          <div className="mt-1 font-mono text-[11px] text-slate-500">
                            {s.latitude.toFixed(2)}°, {s.longitude.toFixed(2)}°
                          </div>
                          <div className="mt-1.5">
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${s.status === "active" ? "bg-emerald-100 text-emerald-700" : s.status === "decommissioned" ? "bg-slate-100 text-slate-500" : "bg-amber-100 text-amber-700"}`}>
                              {s.status}
                            </span>
                          </div>
                          <button onClick={() => setSelected(s)} className="mt-2 text-xs font-medium text-[#4DA8D8] hover:underline">View details →</button>
                        </div>
                      </Popup>
                    </Marker>
                  ) : null
                )}

                {/* Region circles for visual context */}
                {Object.entries(REGION_CENTERS).map(([region, center]) => {
                  if (regionFilter && regionFilter !== region) return null;
                  return (
                    <CircleMarker
                      key={region}
                      center={center}
                      radius={regionFilter === region ? 50 : 30}
                      pathOptions={{
                        color: REGION_COLORS[region],
                        fillColor: REGION_COLORS[region],
                        fillOpacity: 0.05,
                        weight: 1,
                        dashArray: "4 4",
                      }}
                    />
                  );
                })}
              </MapContainer>
            )}

            {/* Legend overlay */}
            {showLegend && !loading && (
              <div className="absolute bottom-3 right-3 z-[1000] rounded-lg border border-white/10 bg-[#071A2B]/90 p-3 text-white shadow-lg backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/60">Legend</span>
                  <button onClick={() => setShowLegend(false)} className="text-white/40 hover:text-white"><X className="h-3.5 w-3.5" /></button>
                </div>
                <div className="mt-2 space-y-1.5">
                  {Object.entries(REGION_COLORS).map(([region, color]) => (
                    <div key={region} className="flex items-center gap-2 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="capitalize text-white/80">{region}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!showLegend && (
              <button onClick={() => setShowLegend(true)} className="absolute bottom-3 right-3 z-[1000] rounded-lg border border-white/10 bg-[#071A2B]/90 p-2 text-white shadow-lg backdrop-blur hover:bg-[#071A2B]">
                <Info className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Text alternative */}
          <div className="mt-2 rounded-lg border border-border bg-muted p-3">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">Text alternative:</span> India operates research stations at Bharati (69°24′S, 76°11′E) and Maitri (70°45′S, 11°43′E) in Antarctica, Himadri (78°55′N, 11°56′E) in the Arctic at Ny-Ålesund, Svalbard, and Himansh in the Western Himalaya. Dakshin Gangotri (decommissioned, 1983) was India's first Antarctic station.
              </p>
            </div>
          </div>
        </div>

        {/* Side panel / station list */}
        <div className="lg:col-span-1">
          {selected ? (
            <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#071A2B]">{selected.name}</h2>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {REGIONS[selected.region]}
                    {selected.latitude != null && <span className="font-mono">{selected.latitude.toFixed(2)}°, {selected.longitude.toFixed(2)}°</span>}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-md p-1 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>

              {selected.is_prototype && <PrototypeTag className="mt-2" />}

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{selected.description}</p>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded bg-secondary px-2 py-1 font-medium">Commissioned: {selected.commissioned_year || "—"}</span>
                <span className={`rounded px-2 py-1 font-medium uppercase ${selected.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>Status: {selected.status}</span>
              </div>

              {/* Linked content */}
              <div className="mt-5 border-t border-border pt-4">
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#071A2B]">
                  <FileText className="h-4 w-4 text-[#4DA8D8]" /> Linked Repository Content
                </h3>
                {stationAssets(selected).length > 0 ? (
                  <div className="space-y-2">
                    {stationAssets(selected).map((a) => (
                      <Link key={a.id} to={`/asset/${a.id}`} className="group flex items-center gap-2.5 rounded-lg border border-border p-2.5 hover:border-[#4DA8D8]/40 hover:bg-secondary">
                        <ContentTypeIcon type={a.content_type} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-[#071A2B] group-hover:text-[#4DA8D8]">{a.title}</div>
                          <div className="flex items-center gap-1.5">
                            <AccessBadge accessClass={a.access_class} />
                            <span className="text-[11px] text-muted-foreground">{a.year}</span>
                          </div>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No linked content yet for this station.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#071A2B]">Select a Station</h3>
              <p className="text-xs text-muted-foreground">Click a marker on the map or choose from the list below to see linked content.</p>
              <div className="space-y-2">
                {filteredStations.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border bg-white p-3 text-left transition-all hover:border-[#4DA8D8]/40 hover:shadow-sm"
                  >
                    <div className="relative">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: REGION_COLORS[s.region] || "#4DA8D8" }} />
                      {s.status === "active" && <div className="absolute inset-0 animate-ping rounded-full opacity-40" style={{ backgroundColor: REGION_COLORS[s.region] || "#4DA8D8" }} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-[#071A2B]">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{REGIONS[s.region]} · {s.status}</div>
                    </div>
                    {s.is_prototype && <PrototypeTag />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}

function ContentTypeIcon({ type }) {
  const icons = { report: FileText, dataset: Database, publication: FileText, photograph: Image, video: Video, expedition: Compass };
  const Icon = icons[type] || FileText;
  return <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-secondary"><Icon className="h-4 w-4 text-[#4DA8D8]" /></div>;
}