import { db } from '@/api/base44Client';

import React from "react";
import { Link } from "react-router-dom";
import { Search, Compass, Microscope, Users, ArrowRight, MapPin, BookOpen, Database, FileText, Image, Video, Newspaper, Sparkles, ShieldCheck, GraduationCap, Globe2, Network } from "lucide-react";

import { AccessBadge, PrototypeTag } from "@/components/Badges";
import PolarConnectMap from "@/components/PolarConnectMap";
import KnowledgeGraphPreview from "@/components/KnowledgeGraphPreview";

const STATIONS = [
  { name: "Bharati", region: "Antarctica", coords: "69°24′S, 76°11′E", year: 2012, desc: "Research station in Larsemann Hills, East Antarctica" },
  { name: "Maitri", region: "Antarctica", coords: "70°45′S, 11°43′E", year: 1989, desc: "India's second Antarctic research station" },
  { name: "Himadri", region: "Arctic", coords: "78°55′N, 11°56′E", year: 2008, desc: "India's first Arctic research station in Ny-Ålesund, Svalbard" },
  { name: "Himansh", region: "Himalaya", coords: "Western Himalaya", year: 2012, desc: "Glaciological research station in the Himalaya" },
];

const FEATURED_TYPES = [
  { label: "Expeditions", icon: Compass, color: "bg-blue-50 text-blue-600", path: "/search?type=expedition" },
  { label: "Stations", icon: MapPin, color: "bg-cyan-50 text-cyan-600", path: "/map" },
  { label: "Reports", icon: FileText, color: "bg-indigo-50 text-indigo-600", path: "/search?type=report" },
  { label: "Datasets", icon: Database, color: "bg-teal-50 text-teal-600", path: "/search?type=dataset" },
  { label: "Publications", icon: BookOpen, color: "bg-purple-50 text-purple-600", path: "/search?type=publication" },
  { label: "Photos", icon: Image, color: "bg-emerald-50 text-emerald-600", path: "/search?type=photograph" },
  { label: "Videos", icon: Video, color: "bg-rose-50 text-rose-600", path: "/search?type=video" },
];

export default function Home() {
  const [featured, setFeatured] = React.useState([]);
  const [news, setNews] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const [assetRes, newsRes] = await Promise.all([
          db.entities.Asset.filter({ review_status: "approved", access_class: "open" }, { sort: "-created_date", limit: 6 }),
          db.entities.NewsItem.filter({}, { sort: "-date", limit: 3 }),
        ]);
        setFeatured(assetRes.items || []);
        setNews(newsRes.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#071A2B] text-white">
        <div className="absolute inset-0">
          <img
            src="https://media.db.com/images/public/6abcce8a51c691e094fd5cb2/98f9294e7_generated_image.png"
            alt="India connecting to the Arctic and Antarctic polar regions"
            className="h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071A2B] via-[#071A2B]/80 to-[#071A2B]/30" />
        </div>
        <div className="relative mx-auto max-w-[1360px] px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-[#4DA8D8]" />
              National Centre for Polar and Ocean Research · Ministry of Earth Sciences
            </div>
            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl" style={{ fontFamily: "'Inter', sans-serif" }}>
              Connecting India to the <span className="text-[#4DA8D8]">Polar World</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              PolarSetu turns NCPOR's scattered polar knowledge into a searchable, evidence-linked repository and a reviewed publishing pipeline for education and outreach.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 rounded-lg bg-[#4DA8D8] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#3A8FBF]"
              >
                Explore Polar Knowledge <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/learn"
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
              >
                <GraduationCap className="h-4 w-4" /> Start Learning
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Polar Science */}
      <section className="mx-auto max-w-[1360px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#071A2B] sm:text-3xl">Explore Polar Science</h2>
          <p className="mt-1 text-muted-foreground">Choose your pathway into the repository</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Student", desc: "Lessons, quizzes, glossary and virtual expeditions for school and undergraduate learners.", icon: GraduationCap, path: "/learn", color: "from-[#4DA8D8] to-[#0B2942]" },
            { title: "Researcher", desc: "Faceted repository search, datasets, publications, knowledge graph and citation tools.", icon: Microscope, path: "/search", color: "from-[#0B2942] to-[#4DA8D8]" },
            { title: "Citizen", desc: "Discover expeditions, stations, news and stories from India's polar missions.", icon: Users, path: "/explore", color: "from-[#F4A340] to-[#0B2942]" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} to={card.path} className="group relative overflow-hidden rounded-xl border border-border bg-white p-6 transition-all hover:shadow-lg">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${card.color} text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-[#071A2B]">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.desc}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#4DA8D8]">
                  Enter <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Knowledge */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1360px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#071A2B] sm:text-3xl">Featured Knowledge</h2>
              <p className="mt-1 text-muted-foreground">Curated records from the repository</p>
            </div>
            <Link to="/search" className="hidden items-center gap-1 text-sm font-medium text-[#4DA8D8] hover:underline sm:flex">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mb-6 flex flex-wrap gap-2">
            {FEATURED_TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <Link key={t.label} to={t.path} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-[#071A2B] transition-colors hover:border-[#4DA8D8]/40 hover:bg-secondary">
                  <span className={`flex h-5 w-5 items-center justify-center rounded ${t.color}`}><Icon className="h-3 w-3" /></span>
                  {t.label}
                </Link>
              );
            })}
          </div>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-44 animate-pulse rounded-xl border border-border bg-muted" />)}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((asset) => (
                <Link key={asset.id} to={`/asset/${asset.id}`} className="group flex flex-col rounded-xl border border-border bg-white p-4 transition-all hover:border-[#4DA8D8]/40 hover:shadow-md">
                  {asset.is_prototype && <PrototypeTag className="mb-2 self-start" />}
                  <h3 className="line-clamp-2 text-sm font-semibold text-[#071A2B] group-hover:text-[#4DA8D8]">{asset.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{asset.summary || asset.description}</p>
                  <div className="mt-auto pt-3 flex items-center gap-2">
                    <AccessBadge accessClass={asset.access_class} />
                    {asset.region && <span className="text-[11px] text-muted-foreground">{asset.region}</span>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              No featured records yet. Visit the Upload Centre to add content.
            </div>
          )}
        </div>
      </section>

      {/* India in the Polar Regions */}
      <section className="bg-[#F5F8FA]">
        <div className="mx-auto max-w-[1360px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#071A2B] sm:text-3xl">India in the Polar Regions</h2>
            <p className="mt-1 text-muted-foreground">Research stations operated by NCPOR across Antarctica, the Arctic and the Himalaya</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATIONS.map((s) => (
              <Link key={s.name} to="/map" className="group rounded-xl border border-border bg-white p-5 transition-all hover:border-[#4DA8D8]/40 hover:shadow-md">
                <div className="flex items-center gap-2 text-[#4DA8D8]">
                  <MapPin className="h-5 w-5" />
                  <h3 className="text-lg font-semibold text-[#071A2B]">{s.name}</h3>
                </div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.region}</div>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <div>Coordinates: <span className="font-mono text-foreground">{s.coords}</span></div>
                  <div>Commissioned: <span className="font-medium text-foreground">{s.year}</span></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Polar Science Matters */}
      <section className="mx-auto max-w-[1360px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#071A2B] sm:text-3xl">Why Polar Science Matters</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              The polar regions are Earth's most sensitive climate sentinels. Changes in Antarctic ice sheets, Arctic sea ice and Himalayan glaciers directly influence global sea levels, ocean circulation and monsoon patterns that affect over a billion people in South Asia.
            </p>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              India's polar programme, led by NCPOR under the Ministry of Earth Sciences, advances scientific understanding of these critical systems — from atmospheric chemistry and cryospheric dynamics to Southern Ocean biogeochemistry and polar biology.
            </p>
            <Link to="/learn" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#4DA8D8] hover:underline">
              Explore educational resources <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border">
            <img src="https://images.unsplash.com/photo-1517783999520-f068d7431b60?w=800&q=80" alt="Polar research" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* India connecting to the poles — interactive polar map */}
      <section className="bg-[#071A2B] text-white">
        <div className="mx-auto max-w-[1360px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <Globe2 className="h-10 w-10 text-[#4DA8D8]" />
              <h2 className="mt-4 text-2xl font-bold sm:text-3xl">India at Both Poles</h2>
              <p className="mt-3 text-white/70">
                From the Arctic outpost of Himadri in Svalbard to Bharati and Maitri in Antarctica — and the Himalayan cryosphere in between — India's polar programme bridges the extremes of our planet. Explore the interactive map below.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/map" className="inline-flex items-center gap-2 rounded-lg bg-[#4DA8D8] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3A8FBF]">
                  Open Interactive Map <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/knowledge-graph" className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/10">
                  <Network className="h-4 w-4" /> Knowledge Graph
                </Link>
              </div>
            </div>
            <PolarConnectMap />
          </div>
        </div>
      </section>

      {/* Knowledge Graph preview */}
      <section className="mx-auto max-w-[1360px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#071A2B] sm:text-3xl">Knowledge Graph</h2>
            <p className="mt-1 text-muted-foreground">See how expeditions, stations, research themes and repository content connect</p>
          </div>
          <Link to="/knowledge-graph" className="hidden items-center gap-1 text-sm font-medium text-[#4DA8D8] hover:underline sm:flex">
            Open full graph <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <KnowledgeGraphPreview />
      </section>

      {/* Latest News */}
      <section className="mx-auto max-w-[1360px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#071A2B] sm:text-3xl">Latest News</h2>
            <p className="mt-1 text-muted-foreground">Announcements and updates from NCPOR's polar programme</p>
          </div>
          <Link to="/news" className="hidden items-center gap-1 text-sm font-medium text-[#4DA8D8] hover:underline sm:flex">
            All news <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-64 animate-pulse rounded-xl border border-border bg-muted" />)}
          </div>
        ) : news.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {news.map((item) => (
              <Link key={item.id} to="/news" className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-all hover:shadow-md">
                {item.image_url && <img src={item.image_url} alt={item.title} className="h-40 w-full object-cover" />}
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground">{item.category}</span>
                    <span className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <h3 className="line-clamp-2 text-sm font-semibold text-[#071A2B] group-hover:text-[#4DA8D8]">{item.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{item.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">No news items yet.</div>
        )}
      </section>
    </div>
  );
}