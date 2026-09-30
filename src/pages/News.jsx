import { db } from '@/api/base44Client';

import React from "react";
import { Link } from "react-router-dom";
import { Newspaper, Calendar } from "lucide-react";

import { PrototypeTag } from "@/components/Badges";
import { cn } from "@/lib/utils";

const CATEGORIES = ["all", "expedition", "research", "education", "institutional", "announcement"];

const FALLBACK_NEWS = [
  { id: "n1", title: "42nd Indian Scientific Expedition to Antarctica concludes successfully", summary: "The 42nd ISEA completed its annual research programme across atmospheric, oceanographic and glaciological themes.", category: "expedition", date: "2024-03-15", is_prototype: true },
  { id: "n2", title: "New sea-ice dataset published in the PolarSetu repository", summary: "A processed dataset of Southern Ocean sea-ice concentration measurements is now available to registered researchers.", category: "research", date: "2024-02-20", is_prototype: true },
  { id: "n3", title: "Polar science workshop for school teachers held at NCPOR", summary: "NCPOR hosted a two-day workshop connecting polar science with school curricula.", category: "education", date: "2024-01-30", is_prototype: true },
];

export default function News() {
  const [news, setNews] = React.useState([]);
  const [filter, setFilter] = React.useState("all");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await db.entities.NewsItem.filter({}, { sort: "-date", limit: 50 });
        setNews(res.items?.length ? res.items : FALLBACK_NEWS);
      } catch (e) {
        setNews(FALLBACK_NEWS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = filter === "all" ? news : news.filter((n) => n.category === filter);

  return (
    <div className="mx-auto max-w-[1360px] px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="font-medium text-foreground">News</span>
      </nav>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
          <Newspaper className="h-6 w-6 text-[#4DA8D8]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#071A2B]">News & Announcements</h1>
          <p className="text-sm text-muted-foreground">Updates from NCPOR's polar science programme</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={cn(
              "rounded-lg border px-3.5 py-2 text-sm font-medium capitalize transition-colors",
              filter === c ? "border-[#4DA8D8] bg-[#4DA8D8]/10 text-[#071A2B]" : "border-border bg-white text-muted-foreground hover:bg-muted"
            )}
          >
            {c === "all" ? "All News" : c}
          </button>
        ))}
      </div>

      {/* News grid */}
      {loading ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 animate-pulse rounded-xl border border-border bg-muted" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <article key={item.id} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-all hover:shadow-md">
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="h-44 w-full object-cover" />
              ) : (
                <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-[#071A2B] to-[#0B2942]">
                  <Newspaper className="h-10 w-10 text-white/30" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground">{item.category}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {item.is_prototype && <PrototypeTag />}
                </div>
                <h3 className="line-clamp-2 text-sm font-semibold text-[#071A2B] group-hover:text-[#4DA8D8]">{item.title}</h3>
                <p className="mt-1.5 line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">{item.summary}</p>
                <button className="mt-3 self-start text-xs font-medium text-[#4DA8D8] hover:underline">Read more →</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-border p-12 text-center">
          <Newspaper className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No news in this category yet.</p>
        </div>
      )}
    </div>
  );
}