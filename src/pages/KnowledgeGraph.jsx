import { db } from '@/api/base44Client';

import React from "react";
import { Link } from "react-router-dom";
import { Network, Search, ZoomIn, ZoomOut, Maximize, Filter, X, Compass, MapPin, FileText, Database, BookOpen, Image, Video, Tag, ExternalLink } from "lucide-react";

import { PrototypeTag } from "@/components/Badges";
import { useForceGraph, curvedPath } from "@/hooks/useForceGraph";
import { cn } from "@/lib/utils";

const NODE_TYPES = {
  expedition: { label: "Expedition", icon: Compass, color: "#4DA8D8", radius: 26 },
  station: { label: "Station", icon: MapPin, color: "#0B2942", radius: 23 },
  theme: { label: "Theme", icon: Tag, color: "#F4A340", radius: 19 },
  report: { label: "Report", icon: FileText, color: "#6366F1", radius: 15 },
  dataset: { label: "Dataset", icon: Database, color: "#0EA5E9", radius: 15 },
  publication: { label: "Publication", icon: BookOpen, color: "#8B5CF6", radius: 15 },
  photograph: { label: "Photograph", icon: Image, color: "#22C55E", radius: 13 },
  video: { label: "Video", icon: Video, color: "#EF4444", radius: 13 },
};

export default function KnowledgeGraph() {
  const [assets, setAssets] = React.useState([]);
  const [expeditions, setExpeditions] = React.useState([]);
  const [stations, setStations] = React.useState([]);
  const [themes, setThemes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [activeTypes, setActiveTypes] = React.useState(Object.keys(NODE_TYPES));
  const [selectedNode, setSelectedNode] = React.useState(null);
  const [hoveredNode, setHoveredNode] = React.useState(null);
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStart = React.useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const svgRef = React.useRef(null);

  React.useEffect(() => {
    (async () => {
      try {
        const [aRes, eRes, sRes, tRes] = await Promise.all([
          db.entities.Asset.filter({ review_status: "approved" }, { limit: 100 }),
          db.entities.Expedition.filter({}, { limit: 50 }),
          db.entities.Station.filter({}, { limit: 50 }),
          db.entities.ResearchTheme.filter({}, { limit: 50 }),
        ]);
        setAssets(aRes.items || []);
        setExpeditions(eRes.items || []);
        setStations(sRes.items || []);
        setThemes(tRes.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Build raw nodes + edges (positions assigned by the force simulation)
  const { rawNodes, rawEdges } = React.useMemo(() => {
    const nodes = [];
    const edges = [];

    expeditions.forEach((e) => {
      nodes.push({
        id: `exp_${e.id}`,
        entityId: e.id,
        type: "expedition",
        label: e.title?.replace(/Indian Scientific Expedition to Antarctica/, "ISEA") || `Exp ${e.expedition_number}`,
        fullLabel: e.title,
        data: e,
      });
    });
    stations.forEach((s) => {
      nodes.push({ id: `stn_${s.id}`, entityId: s.id, type: "station", label: s.name, fullLabel: s.name, data: s });
    });
    themes.forEach((t) => {
      nodes.push({ id: `thm_${t.id}`, entityId: t.id, type: "theme", label: t.name?.split(" ")[0] || "Theme", fullLabel: t.name, data: t });
    });
    assets.forEach((a) => {
      nodes.push({ id: `ast_${a.id}`, entityId: a.id, type: a.content_type || "report", label: a.title?.slice(0, 24) || "Asset", fullLabel: a.title, data: a });
    });

    const stnByLabel = new Map(stations.map((s) => [s.name, `stn_${s.id}`]));
    const thmByName = new Map(themes.map((t) => [t.name, `thm_${t.id}`]));

    expeditions.forEach((e) => {
      (e.stations || []).forEach((sName) => {
        const t = stnByLabel.get(sName);
        if (t) edges.push({ source: `exp_${e.id}`, target: t, type: "exp-station" });
      });
      (e.research_themes || []).forEach((tName) => {
        const t = thmByName.get(tName);
        if (t) edges.push({ source: `exp_${e.id}`, target: t, type: "exp-theme" });
      });
    });
    assets.forEach((a) => {
      if (a.station_id) {
        const t = stnByLabel.get(a.station_id);
        if (t) edges.push({ source: `ast_${a.id}`, target: t, type: "asset-station" });
      }
      if (a.research_theme) {
        const t = thmByName.get(a.research_theme);
        if (t) edges.push({ source: `ast_${a.id}`, target: t, type: "asset-theme" });
      }
    });

    return { rawNodes: nodes, rawEdges: edges };
  }, [assets, expeditions, stations, themes]);

  const { nodes, edges } = useForceGraph(rawNodes, rawEdges, { width: 1000, height: 800, iterations: 340 });
  const nodeById = React.useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const filteredNodes = nodes.filter((n) => {
    if (!activeTypes.includes(n.type)) return false;
    if (search && !n.fullLabel?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const visibleNodeIds = new Set(filteredNodes.map((n) => n.id));
  const visibleEdges = edges.filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));

  const connectedIds = React.useMemo(() => {
    if (!hoveredNode && !selectedNode) return null;
    const nodeId = hoveredNode || selectedNode;
    const ids = new Set([nodeId]);
    visibleEdges.forEach((e) => {
      if (e.source === nodeId) ids.add(e.target);
      if (e.target === nodeId) ids.add(e.source);
    });
    return ids;
  }, [hoveredNode, selectedNode, visibleEdges]);

  const toggleType = (type) => {
    setActiveTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: dragStart.current.panX + (e.clientX - dragStart.current.x),
        y: dragStart.current.panY + (e.clientY - dragStart.current.y),
      });
    }
  };
  const handleMouseUp = () => setIsDragging(false);
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const edgeColor = (type) => (type === "exp-station" ? "#4DA8D8" : type === "exp-theme" ? "#F4A340" : type === "asset-station" ? "#0B2942" : "#8B5CF6");

  return (
    <div className="mx-auto max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8">
      <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link to="/search" className="hover:text-foreground">Research</Link>
        <span>/</span>
        <span className="font-medium text-foreground">Knowledge Graph</span>
      </nav>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
          <Network className="h-6 w-6 text-[#4DA8D8]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#071A2B]">Knowledge Graph</h1>
          <p className="text-sm text-muted-foreground">Explore how expeditions, stations, research themes and repository content connect</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        {/* Controls */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-border bg-white p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search nodes…"
                className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm focus:border-[#4DA8D8] focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-[#071A2B]">Filter by Type</h3>
            </div>
            <div className="space-y-1.5">
              {Object.entries(NODE_TYPES).map(([type, config]) => {
                const Icon = config.icon;
                const active = activeTypes.includes(type);
                const count = nodes.filter((n) => n.type === type).length;
                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={cn("flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors", active ? "border-border bg-white text-foreground" : "border-border bg-muted text-muted-foreground opacity-50")}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded" style={{ backgroundColor: config.color + "20" }}>
                      <Icon className="h-3 w-3" style={{ color: config.color }} />
                    </span>
                    <span className="flex-1 text-left font-medium">{config.label}</span>
                    <span className="text-xs text-muted-foreground">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedNode && (
            <div className="rounded-xl border border-[#4DA8D8]/40 bg-[#4DA8D8]/5 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = NODE_TYPES[selectedNode.type]?.icon;
                    return Icon ? <Icon className="h-4 w-4" style={{ color: NODE_TYPES[selectedNode.type]?.color }} /> : null;
                  })()}
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{NODE_TYPES[selectedNode.type]?.label}</span>
                </div>
                <button onClick={() => setSelectedNode(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-[#071A2B]">{selectedNode.fullLabel}</h3>
              {selectedNode.data?.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-3">{selectedNode.data.description}</p>}
              {selectedNode.data?.year && <p className="mt-1 text-xs text-muted-foreground">Year: {selectedNode.data.year}</p>}
              {selectedNode.data?.region && <p className="text-xs text-muted-foreground">Region: {selectedNode.data.region}</p>}
              {selectedNode.type !== "expedition" && selectedNode.type !== "station" && selectedNode.type !== "theme" && (
                <Link to={`/asset/${selectedNode.entityId}`} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#4DA8D8] hover:underline">
                  Open detail <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          )}

          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-[#071A2B]">Relationships</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="h-0.5 w-6" style={{ backgroundColor: "#4DA8D8" }} /> Expedition → Station</div>
              <div className="flex items-center gap-2"><span className="h-0.5 w-6" style={{ backgroundColor: "#F4A340" }} /> Expedition → Theme</div>
              <div className="flex items-center gap-2"><span className="h-0.5 w-6" style={{ backgroundColor: "#0B2942" }} /> Asset → Station</div>
              <div className="flex items-center gap-2"><span className="h-0.5 w-6" style={{ backgroundColor: "#8B5CF6" }} /> Asset → Theme</div>
            </div>
          </div>
        </div>

        {/* Graph */}
        <div className="lg:col-span-3">
          <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-[#F5F8FA] to-[#EAF2F6]">
            <div className="absolute right-3 top-3 z-10 flex flex-col gap-1 rounded-lg border border-border bg-white p-1 shadow-sm">
              <button onClick={() => setZoom((z) => Math.min(z + 0.2, 2.5))} className="rounded-md p-1.5 hover:bg-muted" title="Zoom in"><ZoomIn className="h-4 w-4" /></button>
              <button onClick={() => setZoom((z) => Math.max(z - 0.2, 0.4))} className="rounded-md p-1.5 hover:bg-muted" title="Zoom out"><ZoomOut className="h-4 w-4" /></button>
              <button onClick={resetView} className="rounded-md p-1.5 hover:bg-muted" title="Reset"><Maximize className="h-4 w-4" /></button>
            </div>

            {loading ? (
              <div className="flex h-[600px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-[#4DA8D8]" />
              </div>
            ) : (
              <svg
                ref={svgRef}
                width="100%"
                height="600"
                viewBox="0 0 1000 800"
                className="cursor-grab select-none"
                style={{ cursor: isDragging ? "grabbing" : "grab" }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <defs>
                  {Object.values(NODE_TYPES).map((c) => (
                    <radialGradient key={c.color} id={`grad_${c.color.replace("#", "")}`} cx="35%" cy="35%">
                      <stop offset="0%" stopColor="white" stopOpacity="0.55" />
                      <stop offset="45%" stopColor={c.color} stopOpacity="1" />
                      <stop offset="100%" stopColor={c.color} stopOpacity="0.85" />
                    </radialGradient>
                  ))}
                </defs>

                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  {/* Edges (curved) */}
                  {visibleEdges.map((edge, i) => {
                    const source = nodeById.get(edge.source);
                    const target = nodeById.get(edge.target);
                    if (!source || !target) return null;
                    const isHighlighted = connectedIds?.has(edge.source) && connectedIds?.has(edge.target);
                    const color = edgeColor(edge.type);
                    return (
                      <path
                        key={i}
                        d={curvedPath(source.x, source.y, target.x, target.y, 0.1)}
                        fill="none"
                        stroke={color}
                        strokeWidth={isHighlighted ? 2.2 : 0.9}
                        strokeOpacity={isHighlighted ? 0.85 : connectedIds ? 0.08 : 0.28}
                        strokeLinecap="round"
                      />
                    );
                  })}

                  {/* Nodes */}
                  {filteredNodes.map((node) => {
                    const config = NODE_TYPES[node.type] || NODE_TYPES.report;
                    const isHighlighted = connectedIds?.has(node.id);
                    const isDimmed = connectedIds && !connectedIds.has(node.id);
                    const isSelected = selectedNode?.id === node.id;
                    const isHover = hoveredNode === node.id;
                    const r = config.radius;
                    const gradId = `grad_${config.color.replace("#", "")}`;
                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        className="cursor-pointer transition-opacity"
                        onClick={() => setSelectedNode(node)}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        style={{ opacity: isDimmed ? 0.28 : 1 }}
                      >
                        {(isHover || isSelected) && (
                          <circle r={r + 6} fill={config.color} fillOpacity={0.14} />
                        )}
                        <circle
                          r={r}
                          fill={`url(#${gradId})`}
                          stroke={isSelected ? "#071A2B" : "white"}
                          strokeWidth={isSelected ? 2.5 : 1.5}
                        />
                        <text
                          y={r + 13}
                          textAnchor="middle"
                          className="pointer-events-none fill-[#071A2B] text-[10px] font-semibold"
                          style={{ opacity: isHighlighted || !connectedIds ? 1 : 0.45 }}
                        >
                          {node.label.length > 20 ? node.label.slice(0, 18) + "…" : node.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span><strong className="text-foreground">{filteredNodes.length}</strong> nodes</span>
            <span><strong className="text-foreground">{visibleEdges.length}</strong> relationships</span>
            <span>Click a node to see details · Drag to pan · Use zoom controls</span>
            <PrototypeTag />
          </div>
        </div>
      </div>
    </div>
  );
}