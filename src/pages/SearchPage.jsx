import { db } from '@/api/base44Client';

import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, SlidersHorizontal, X, MapPin, Calendar, FileText, Database, BookOpen, Image, Video, ArrowUpDown, ChevronLeft, ChevronRight, Filter } from "lucide-react";

import AssetCard from "@/components/AssetCard";
import { REGIONS, CONTENT_TYPES } from "@/lib/polarSetu";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "-created_date", label: "Newest" },
  { value: "created_date", label: "Oldest" },
  { value: "title", label: "Title" },
];

const TYPE_FILTERS = ["report", "dataset", "publication", "photograph", "video", "expedition", "news"];
const REGION_FILTERS = ["antarctica", "arctic", "himalaya", "southern_ocean", "global"];
const ACCESS_FILTERS = ["open", "registered", "restricted", "embargoed", "internal"];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showFilters, setShowFilters] = React.useState(false);
  const [totalCount, setTotalCount] = React.useState(0);

  const q = params.get("q") || "";
  const type = params.get("type") || "";
  const region = params.get("region") || "";
  const theme = params.get("theme") || "";
  const access = params.get("access") || "";
  const year = params.get("year") || "";
  const sort = params.get("sort") || "relevance";

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  };

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const query = {};
        if (q) query.title = { $regex: q, $options: "i" };
        if (type) query.content_type = type;
        if (region) query.region = region;
        if (theme) query.research_theme = theme;
        if (access) query.access_class = access;
        if (year) query.year = { $gte: parseInt(year) };

        const opts = { limit: 24 };
        if (sort && sort !== "relevance") opts.sort = sort;

        const [res, count] = await Promise.all([
          db.entities.Asset.filter(query, opts),
          db.entities.Asset.count(query),
        ]);
        setResults(res.items || []);
        setTotalCount(count || 0);
      } catch (e) {
        console.error(e);
        setResults([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [q, type, region, theme, access, year, sort]);

  const activeFilters = [type, region, theme, access, year].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="font-medium text-foreground">Repository Search</span>
      </nav>

      <h1 className="text-2xl font-bold text-[#071A2B]">Repository Search</h1>
      <p className="mt-1 text-sm text-muted-foreground">Search reports, datasets, publications and media across the polar knowledge repository</p>

      {/* Search bar */}
      <div className="mt-5 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            defaultValue={q}
            onKeyDown={(e) => { if (e.key === "Enter") updateParam("q", e.target.value); }}
            placeholder="Try 'sea ice Southern Ocean' or 'datasets after 2018'"
            className="w-full rounded-lg border border-border bg-white py-3 pl-11 pr-4 text-sm focus:border-[#4DA8D8] focus:outline-none focus:ring-2 focus:ring-[#4DA8D8]/20"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn("inline-flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium lg:hidden", showFilters ? "border-[#4DA8D8] bg-secondary text-[#071A2B]" : "border-border bg-white text-muted-foreground")}
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters {activeFilters > 0 && <span className="rounded-full bg-[#4DA8D8] px-1.5 text-xs text-white">{activeFilters}</span>}
        </button>
      </div>

      <div className="mt-5 flex gap-6">
        {/* Filters sidebar */}
        <aside className={cn("w-full shrink-0 lg:w-64", showFilters ? "block" : "hidden lg:block")}>
          <div className="space-y-5 rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#071A2B]">Filters</h3>
              {activeFilters > 0 && (
                <button onClick={() => setParams(new URLSearchParams())} className="text-xs text-[#4DA8D8] hover:underline">Clear all</button>
              )}
            </div>

            <FilterGroup label="Content Type">
              {TYPE_FILTERS.map((t) => (
                <FilterCheckbox key={t} checked={type === t} onChange={() => updateParam("type", type === t ? "" : t)} label={CONTENT_TYPES[t]?.label || t} />
              ))}
            </FilterGroup>

            <FilterGroup label="Region">
              {REGION_FILTERS.map((r) => (
                <FilterCheckbox key={r} checked={region === r} onChange={() => updateParam("region", region === r ? "" : r)} label={REGIONS[r]} />
              ))}
            </FilterGroup>

            <FilterGroup label="Access Class">
              {ACCESS_FILTERS.map((a) => (
                <FilterCheckbox key={a} checked={access === a} onChange={() => updateParam("access", access === a ? "" : a)} label={a.toUpperCase()} />
              ))}
            </FilterGroup>

            <FilterGroup label="Year (from)">
              <input
                type="number"
                defaultValue={year}
                onBlur={(e) => updateParam("year", e.target.value)}
                placeholder="e.g. 2018"
                className="w-full rounded-md border border-border px-2.5 py-1.5 text-sm focus:border-[#4DA8D8] focus:outline-none"
              />
            </FilterGroup>
          </div>
        </aside>

        {/* Results */}
        <div className="min-w-0 flex-1">
          {/* Sort + count */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {loading ? "Searching…" : <><span className="font-semibold text-foreground">{totalCount}</span> records found{q && <> for "<span className="font-medium text-foreground">{q}</span>"</>}</>}
            </p>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <select
                value={sort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="rounded-md border border-border bg-white px-2.5 py-1.5 text-sm focus:border-[#4DA8D8] focus:outline-none"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilters > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {type && <Chip label={`Type: ${CONTENT_TYPES[type]?.label}`} onRemove={() => updateParam("type", "")} />}
              {region && <Chip label={`Region: ${REGIONS[region]}`} onRemove={() => updateParam("region", "")} />}
              {theme && <Chip label={`Theme: ${theme}`} onRemove={() => updateParam("theme", "")} />}
              {access && <Chip label={`Access: ${access.toUpperCase()}`} onRemove={() => updateParam("access", "")} />}
              {year && <Chip label={`From: ${year}`} onRemove={() => updateParam("year", "")} />}
            </div>
          )}

          {/* Results grid */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[...Array(9)].map((_, i) => <div key={i} className="h-44 animate-pulse rounded-xl border border-border bg-muted" />)}
            </div>
          ) : results.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((a) => <AssetCard key={a.id} asset={a} />)}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-16 text-center">
              <Search className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <h3 className="mt-3 text-base font-semibold text-[#071A2B]">No polar records match your search</h3>
              <p className="mt-1 text-sm text-muted-foreground">Try changing the filters or using different keywords.</p>
              <button onClick={() => setParams(new URLSearchParams())} className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
                <X className="h-4 w-4" /> Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function FilterCheckbox({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground hover:text-[#071A2B]">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-border text-[#4DA8D8] focus:ring-[#4DA8D8]" />
      {label}
    </label>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#4DA8D8]/30 bg-[#4DA8D8]/5 px-2.5 py-1 text-xs font-medium text-[#071A2B]">
      {label}
      <button onClick={onRemove} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
    </span>
  );
}