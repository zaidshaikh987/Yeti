import React from "react";
import { Link } from "react-router-dom";
import { FileText, Database, BookOpen, Image, Video, Newspaper, Compass, Building2, Microscope, MapPin, Calendar, ArrowRight } from "lucide-react";
import { AccessBadge, ReviewBadge, PrototypeTag } from "@/components/Badges";
import { REGIONS } from "@/lib/polarSetu";
import { cn } from "@/lib/utils";

const TYPE_ICONS = {
  expedition: Compass, report: FileText, dataset: Database, publication: BookOpen,
  photograph: Image, video: Video, news: Newspaper, institutional_activity: Building2, research_project: Microscope,
};

const TYPE_COLORS = {
  report: "bg-blue-50 text-blue-600",
  dataset: "bg-cyan-50 text-cyan-600",
  publication: "bg-indigo-50 text-indigo-600",
  photograph: "bg-emerald-50 text-emerald-600",
  video: "bg-rose-50 text-rose-600",
  news: "bg-amber-50 text-amber-600",
  expedition: "bg-slate-50 text-slate-600",
  institutional_activity: "bg-purple-50 text-purple-600",
  research_project: "bg-teal-50 text-teal-600",
};

export default function AssetCard({ asset }) {
  const Icon = TYPE_ICONS[asset.content_type] || FileText;
  const colorClass = TYPE_COLORS[asset.content_type] || "bg-slate-50 text-slate-600";

  return (
    <Link
      to={`/asset/${asset.id}`}
      className="group flex flex-col rounded-xl border border-border bg-white p-4 transition-all hover:border-[#4DA8D8]/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", colorClass)}>
          <Icon className="h-5 w-5" />
        </div>
        {asset.is_prototype && <PrototypeTag />}
      </div>

      <h3 className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-[#071A2B] group-hover:text-[#4DA8D8]">
        {asset.title}
      </h3>

      {asset.summary && (
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{asset.summary}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
        {asset.region && (
          <span className="inline-flex items-center gap-0.5">
            <MapPin className="h-3 w-3" /> {REGIONS[asset.region] || asset.region}
          </span>
        )}
        {asset.year && (
          <span className="inline-flex items-center gap-0.5">
            <Calendar className="h-3 w-3" /> {asset.year}
          </span>
        )}
        {asset.research_theme && (
          <span className="truncate rounded bg-secondary px-1.5 py-0.5 font-medium text-secondary-foreground">{asset.research_theme}</span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1.5">
          <AccessBadge accessClass={asset.access_class} />
          <ReviewBadge status={asset.review_status} />
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-[#4DA8D8]" />
      </div>
    </Link>
  );
}