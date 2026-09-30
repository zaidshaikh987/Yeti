import { db } from '@/api/base44Client';

import React from "react";
import { Link } from "react-router-dom";
import { Network, ArrowRight } from "lucide-react";

import { useForceGraph, curvedPath } from "@/hooks/useForceGraph";

const NODE_CONFIG = {
  expedition: { color: "#4DA8D8" },
  station: { color: "#0B2942" },
  theme: { color: "#F4A340" },
  report: { color: "#6366F1" },
  dataset: { color: "#0EA5E9" },
  publication: { color: "#8B5CF6" },
  photograph: { color: "#22C55E" },
  video: { color: "#EF4444" },
};

export default function KnowledgeGraphPreview() {
  const [rawNodes, setRawNodes] = React.useState([]);
  const [rawEdges, setRawEdges] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [hovered, setHovered] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const [aRes, eRes, sRes, tRes] = await Promise.all([
          db.entities.Asset.filter({ review_status: "approved" }, { limit: 30 }),
          db.entities.Expedition.filter({}, { limit: 10 }),
          db.entities.Station.filter({}, { limit: 10 }),
          db.entities.ResearchTheme.filter({}, { limit: 10 }),
        ]);
        const assets = aRes.items || [];
        const expeditions = eRes.items || [];
        const stations = sRes.items || [];
        const themes = tRes.items || [];

        const nodes = [];
        const edges = [];

        expeditions.slice(0, 4).forEach((e) => {
          nodes.push({ id: `exp_${e.id}`, type: "expedition", label: `ISEA ${e.expedition_number || ""}`, full: e.title });
        });
        const stnMap = {};
        stations.forEach((s) => {
          nodes.push({ id: `stn_${s.id}`, type: "station", label: s.name, full: s.name, data: s });
          stnMap[s.name] = `stn_${s.id}`;
        });
        const thmMap = {};
        themes.forEach((t) => {
          nodes.push({ id: `thm_${t.id}`, type: "theme", label: t.name?.split(" ")[0] || "Theme", full: t.name });
          thmMap[t.name] = `thm_${t.id}`;
        });
        assets.slice(0, 16).forEach((a) => {
          nodes.push({ id: `ast_${a.id}`, type: a.content_type || "report", label: a.title?.slice(0, 18) || "Asset", full: a.title, entityId: a.id });
        });

        expeditions.forEach((e) => {
          (e.stations || []).forEach((sn) => { if (stnMap[sn]) edges.push({ s: `exp_${e.id}`, t: stnMap[sn], c: "#4DA8D8" }); });
          (e.research_themes || []).forEach((tn) => { if (thmMap[tn]) edges.push({ s: `exp_${e.id}`, t: thmMap[tn], c: "#F4A340" }); });
        });
        assets.forEach((a) => {
          if (a.station_id && stnMap[a.station_id]) edges.push({ s: `ast_${a.id}`, t: stnMap[a.station_id], c: "#0B2942" });
          if (a.research_theme && thmMap[a.research_theme]) edges.push({ s: `ast_${a.id}`, t: thmMap[a.research_theme], c: "#8B5CF6" });
        });

        setRawNodes(nodes);
        setRawEdges(edges);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { nodes, edges } = useForceGraph(rawNodes, rawEdges, { width: 600, height: 440, iterations: 300 });
  const nodeById = React.useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const connected = React.useMemo(() => {
    if (!hovered) return null;
    const ids = new Set([hovered]);
    edges.forEach((e) => { if (e.source === hovered) ids.add(e.target); if (e.target === hovered) ids.add(e.source); });
    return ids;
  }, [hovered, edges]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#F5F8FA] to-[#EAF2F6]">
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
        <Network className="h-5 w-5 text-[#4DA8D8]" />
        <span className="text-sm font-semibold text-[#071A2B]">Knowledge Graph</span>
      </div>
      {loading ? (
        <div className="flex h-[440px] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-border border-t-[#4DA8D8]" />
        </div>
      ) : (
        <svg viewBox="0 0 600 440" className="w-full" style={{ minHeight: 300 }}>
          <defs>
            {Object.values(NODE_CONFIG).map((c) => (
              <radialGradient key={c.color} id={`pg_${c.color.replace("#", "")}`} cx="35%" cy="35%">
                <stop offset="0%" stopColor="white" stopOpacity="0.5" />
                <stop offset="100%" stopColor={c.color} stopOpacity="0.9" />
              </radialGradient>
            ))}
          </defs>
          {edges.map((e, i) => {
            const s = nodeById.get(e.source);
            const t = nodeById.get(e.target);
            if (!s || !t) return null;
            const hl = connected?.has(e.source) && connected?.has(e.target);
            return (
              <path
                key={i}
                d={curvedPath(s.x, s.y, t.x, t.y, 0.12)}
                fill="none"
                stroke={e.color || e.c}
                strokeWidth={hl ? 2 : 0.6}
                strokeOpacity={hl ? 0.8 : connected ? 0.07 : 0.22}
                strokeLinecap="round"
              />
            );
          })}
          {nodes.map((n) => {
            const cfg = NODE_CONFIG[n.type] || NODE_CONFIG.report;
            const r = n.type === "expedition" ? 15 : n.type === "station" ? 12 : n.type === "theme" ? 10 : 8;
            const dim = connected && !connected.has(n.id);
            const isHover = hovered === n.id;
            const gradId = `pg_${cfg.color.replace("#", "")}`;
            return (
              <g
                key={n.id}
                transform={`translate(${n.x}, ${n.y})`}
                className="cursor-pointer"
                onMouseEnter={() => setHovered(n.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ opacity: dim ? 0.25 : 1, transition: "opacity 0.2s" }}
              >
                {isHover && <circle r={r + 5} fill={cfg.color} fillOpacity={0.15} />}
                <circle r={r} fill={`url(#${gradId})`} stroke="white" strokeWidth={1.4} />
                <text y={r + 11} textAnchor="middle" className="pointer-events-none fill-[#071A2B] text-[8px] font-semibold">
                  {n.label.length > 14 ? n.label.slice(0, 12) + "…" : n.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
      <Link to="/knowledge-graph" className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-lg bg-[#0B2942] px-4 py-2 text-xs font-semibold text-white hover:bg-[#071A2B]">
        Explore Full Graph <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}