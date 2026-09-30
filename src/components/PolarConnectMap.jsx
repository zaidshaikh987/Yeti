import { db } from '@/api/base44Client';

import React from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";

const POLAR_IMG = "https://media.db.com/images/public/6abcce8a51c691e094fd5cb2/98f9294e7_generated_image.png";

// Fixed layout positions for the known Indian stations on the polar diagram
const STATION_POS = {
  Himadri: { x: 520, y: 60, region: "arctic" },
  Bharati: { x: 430, y: 560, region: "antarctica" },
  Maitri: { x: 600, y: 590, region: "antarctica" },
  "Dakshin Gangotri": { x: 545, y: 615, region: "antarctica" },
  Himansh: { x: 540, y: 320, region: "himalaya" },
};

const REGION_COLOR = {
  antarctica: "#4DA8D8",
  arctic: "#818CF8",
  himalaya: "#14B8A6",
};

export default function PolarConnectMap() {
  const [stations, setStations] = React.useState([]);
  const [hovered, setHovered] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await db.entities.Station.filter({}, { limit: 20 });
        setStations(res.items || []);
      } catch (e) {
        setStations([]);
      }
    })();
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#071A2B]">
      <img
        src={POLAR_IMG}
        alt="India connecting to the Arctic and Antarctic polar regions"
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#071A2B]/60 via-transparent to-[#071A2B]/70" />

      {/* Interactive overlay SVG */}
      <svg viewBox="0 0 1040 680" className="relative w-full" style={{ minHeight: 320 }}>
        {/* Connection arcs from India center to poles */}
        <defs>
          <linearGradient id="arcGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="50%" stopColor="#F4A340" />
            <stop offset="100%" stopColor="#4DA8D8" />
          </linearGradient>
        </defs>
        <path d="M 540 340 Q 700 150 520 70" fill="none" stroke="url(#arcGrad)" strokeWidth="2.5" strokeDasharray="6 6" opacity="0.7">
          <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M 540 340 Q 380 470 440 565" fill="none" stroke="url(#arcGrad)" strokeWidth="2.5" strokeDasharray="6 6" opacity="0.7">
          <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M 540 340 Q 680 470 610 585" fill="none" stroke="url(#arcGrad)" strokeWidth="2.5" strokeDasharray="6 6" opacity="0.7">
          <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="2s" repeatCount="indefinite" />
        </path>

        {/* India node */}
        <g transform="translate(540, 340)">
          <circle r="26" fill="#F4A340" fillOpacity="0.18">
            <animate attributeName="r" from="26" to="38" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="fill-opacity" from="0.25" to="0" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle r="16" fill="#F4A340" stroke="white" strokeWidth="3" />
          <text y="5" textAnchor="middle" className="fill-white text-[11px] font-bold">IN</text>
        </g>

        {/* Station markers */}
        {stations.filter((s) => STATION_POS[s.name]).map((s) => {
          const pos = STATION_POS[s.name];
          const color = REGION_COLOR[pos.region];
          const isHovered = hovered === s.id;
          return (
            <g
              key={s.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              className="cursor-pointer"
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <Link to="/map">
                <circle r="16" fill={color} fillOpacity="0.2">
                  <animate attributeName="r" from="14" to="22" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="fill-opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle r="9" fill={color} stroke="white" strokeWidth="2.5" />
                <circle r="2.5" fill="white" />
              </Link>
              {isHovered && (
                <g transform="translate(14, -8)">
                  <rect x="0" y="-22" width={s.name.length * 7 + 16} height="26" rx="5" fill="#071A2B" stroke={color} strokeWidth="1" opacity="0.95" />
                  <text x="8" y="-5" className="fill-white text-[11px] font-semibold">{s.name}</text>
                </g>
              )}
              <text y="26" textAnchor="middle" className="pointer-events-none fill-white/90 text-[10px] font-medium">{s.name}</text>
            </g>
          );
        })}
      </svg>

      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-white/80">
          {Object.entries(REGION_COLOR).map(([r, c]) => (
            <span key={r} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c }} />
              <span className="capitalize">{r}</span>
            </span>
          ))}
        </div>
        <Link to="/map" className="inline-flex items-center gap-1.5 rounded-lg bg-[#4DA8D8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3A8FBF]">
          <MapPin className="h-3.5 w-3.5" /> Open Interactive Map <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}