import { db } from '@/api/base44Client';
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Network, Search, ZoomIn, ZoomOut, Maximize, Filter, X, Compass, MapPin, FileText, Database, BookOpen, Image as ImageIcon, Video, Tag, ExternalLink } from "lucide-react";
import ForceGraph2D from "react-force-graph-2d";
import { PrototypeTag } from "@/components/Badges";
import { cn } from "@/lib/utils";

const NODE_TYPES = {
  expedition: { label: "Expedition", icon: Compass, color: "#4DA8D8", radius: 10 },
  station: { label: "Station", icon: MapPin, color: "#0B2942", radius: 8 },
  theme: { label: "Theme", icon: Tag, color: "#F4A340", radius: 7 },
  report: { label: "Report", icon: FileText, color: "#6366F1", radius: 5 },
  dataset: { label: "Dataset", icon: Database, color: "#0EA5E9", radius: 5 },
  publication: { label: "Publication", icon: BookOpen, color: "#8B5CF6", radius: 5 },
  photograph: { label: "Photograph", icon: ImageIcon, color: "#22C55E", radius: 4 },
  video: { label: "Video", icon: Video, color: "#EF4444", radius: 4 },
};

export default function KnowledgeGraph() {
  const [assets, setAssets] = useState([]);
  const [expeditions, setExpeditions] = useState([]);
  const [stations, setStations] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTypes, setActiveTypes] = useState(Object.keys(NODE_TYPES));
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  
  const fgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
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

  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth } = containerRef.current;
      setDimensions({ width: clientWidth, height: 600 });
      
      const handleResize = () => {
        if (containerRef.current) {
          setDimensions({ width: containerRef.current.clientWidth, height: 600 });
        }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [loading]);

  const { graphData } = useMemo(() => {
    const nodes = [];
    const edges = [];

    expeditions.forEach((e) => {
      nodes.push({ id: `exp_${e.id}`, entityId: e.id, type: "expedition", label: e.title?.replace(/Indian Scientific Expedition to Antarctica/, "ISEA") || `Exp ${e.expedition_number}`, fullLabel: e.title, data: e });
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

    return { graphData: { nodes, links: edges } };
  }, [assets, expeditions, stations, themes]);

  const filteredData = useMemo(() => {
    const validNodeIds = new Set(
      graphData.nodes
        .filter(n => activeTypes.includes(n.type))
        .filter(n => !search || n.fullLabel?.toLowerCase().includes(search.toLowerCase()))
        .map(n => n.id)
    );

    return {
      nodes: graphData.nodes.filter(n => validNodeIds.has(n.id)),
      links: graphData.links.filter(l => validNodeIds.has(l.source.id || l.source) && validNodeIds.has(l.target.id || l.target))
    };
  }, [graphData, activeTypes, search]);

  const highlightNodes = useMemo(() => {
    const nodes = new Set();
    const links = new Set();
    if (hoveredNode) {
      nodes.add(hoveredNode.id);
      filteredData.links.forEach(l => {
        if (l.source.id === hoveredNode.id) { nodes.add(l.target.id); links.add(l); }
        if (l.target.id === hoveredNode.id) { nodes.add(l.source.id); links.add(l); }
      });
    }
    if (selectedNode) {
      nodes.add(selectedNode.id);
      filteredData.links.forEach(l => {
        if (l.source.id === selectedNode.id) { nodes.add(l.target.id); links.add(l); }
        if (l.target.id === selectedNode.id) { nodes.add(l.source.id); links.add(l); }
      });
    }
    return { nodes, links };
  }, [hoveredNode, selectedNode, filteredData]);

  const handleNodeClick = useCallback(node => {
    setSelectedNode(node);
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(3, 1000);
    }
  }, []);

  const resetView = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(1000, 50);
    }
  };

  const edgeColor = (type) => (type === "exp-station" ? "#4DA8D8" : type === "exp-theme" ? "#F4A340" : type === "asset-station" ? "#0B2942" : "#8B5CF6");

  const toggleType = (type) => {
    setActiveTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

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
          <p className="text-sm text-muted-foreground">Interactive visualization of all connected repository entities.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
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
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {Object.entries(NODE_TYPES).map(([type, config]) => {
                const Icon = config.icon;
                const active = activeTypes.includes(type);
                const count = graphData.nodes.filter((n) => n.type === type).length;
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
            <div className="rounded-xl border border-[#4DA8D8]/40 bg-[#4DA8D8]/5 p-4 shadow-sm transition-all">
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
                <Link to={`/asset/${selectedNode.entityId}`} className="mt-4 inline-flex items-center justify-center w-full gap-2 bg-[#4DA8D8] text-white py-2 rounded-md text-xs font-medium hover:bg-[#3d8cb5] transition-colors">
                  Open Details <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div ref={containerRef} className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-[#1E293B] to-[#0F172A] shadow-inner">
            <div className="absolute right-3 top-3 z-10 flex flex-col gap-1 rounded-lg border border-border/50 bg-white/10 backdrop-blur-md p-1 shadow-sm">
              <button onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.2, 400)} className="rounded-md p-1.5 text-white hover:bg-white/20 transition-colors" title="Zoom in"><ZoomIn className="h-4 w-4" /></button>
              <button onClick={() => fgRef.current?.zoom(fgRef.current.zoom() / 1.2, 400)} className="rounded-md p-1.5 text-white hover:bg-white/20 transition-colors" title="Zoom out"><ZoomOut className="h-4 w-4" /></button>
              <button onClick={resetView} className="rounded-md p-1.5 text-white hover:bg-white/20 transition-colors" title="Reset"><Maximize className="h-4 w-4" /></button>
            </div>

            {loading ? (
              <div className="flex h-[600px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-[#4DA8D8]" />
              </div>
            ) : (
              <ForceGraph2D
                ref={fgRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={filteredData}
                nodeRelSize={1}
                nodeVal={node => NODE_TYPES[node.type]?.radius || 5}
                nodeColor={node => {
                  const isHighlight = highlightNodes.nodes.size > 0;
                  return isHighlight && !highlightNodes.nodes.has(node.id) 
                    ? '#334155' 
                    : (NODE_TYPES[node.type]?.color || '#cbd5e1');
                }}
                nodeCanvasObjectMode={() => "after"}
                nodeCanvasObject={(node, ctx, globalScale) => {
                  const label = node.label;
                  const fontSize = 12/globalScale;
                  ctx.font = `${fontSize}px Sans-Serif`;
                  const textWidth = ctx.measureText(label).width;
                  const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                  const isHighlight = highlightNodes.nodes.size > 0;
                  const dimmed = isHighlight && !highlightNodes.nodes.has(node.id);

                  if (globalScale > 1.5 && !dimmed) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + (NODE_TYPES[node.type]?.radius || 5) + 2, bckgDimensions[0], bckgDimensions[1]);
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#0F172A';
                    ctx.fillText(label, node.x, node.y + (NODE_TYPES[node.type]?.radius || 5) + 2 + bckgDimensions[1]/2);
                  }
                }}
                linkColor={link => edgeColor(link.type)}
                linkWidth={link => highlightNodes.links.has(link) ? 3 : 1}
                linkOpacity={link => highlightNodes.links.size > 0 && !highlightNodes.links.has(link) ? 0.1 : 0.6}
                onNodeHover={node => setHoveredNode(node)}
                onNodeClick={handleNodeClick}
                onEngineStop={() => fgRef.current?.zoomToFit(400, 50)}
              />
            )}
          </div>
          
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span><strong className="text-foreground">{filteredData.nodes.length}</strong> nodes</span>
            <span><strong className="text-foreground">{filteredData.links.length}</strong> relationships</span>
            <span>Drag nodes to pin them · Scroll to zoom · Click for details</span>
            <PrototypeTag />
          </div>
        </div>
      </div>
    </div>
  );
}