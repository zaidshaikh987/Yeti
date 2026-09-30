import { db } from '@/api/base44Client';

import React from "react";
import { Link } from "react-router-dom";
import { BookMarked, Search, ArrowRight } from "lucide-react";

import { PrototypeTag } from "@/components/Badges";

const FALLBACK_TERMS = [
  { term: "Cryosphere", definition: "The frozen parts of the Earth system, including ice sheets, glaciers, sea ice, permafrost and snow cover.", related_topics: ["Sea Ice", "Ice Sheet", "Permafrost"], hindi_translation: "हिममंडल", marathi_translation: "हिमवलय", category: "Climate", is_prototype: true },
  { term: "Sea Ice", definition: "Frozen seawater that forms on the surface of the ocean in polar regions. It differs from icebergs, which are chunks of freshwater ice calved from glaciers.", related_topics: ["Cryosphere", "Southern Ocean", "Albedo"], hindi_translation: "समुद्री हिम", marathi_translation: "समुद्री बर्फ", category: "Cryosphere", is_prototype: true },
  { term: "Ice Sheet", definition: "A mass of glacial land ice extending more than 50,000 square kilometers. The two major ice sheets are in Antarctica and Greenland.", related_topics: ["Cryosphere", "Glacier", "Ice Shelf"], hindi_translation: "हिमचादर", category: "Cryosphere", is_prototype: true },
  { term: "Ice Shelf", definition: "A floating extension of land ice that projects from the coast over the sea, fed by glaciers and ice sheets.", related_topics: ["Ice Sheet", "Iceberg"], hindi_translation: "हिमशेल्फ", category: "Cryosphere", is_prototype: true },
  { term: "Polynya", definition: "An area of open water surrounded by sea ice, often maintained by ocean currents or upwelling of warmer water.", related_topics: ["Sea Ice", "Southern Ocean"], hindi_translation: "पोलिन्या", category: "Oceanography", is_prototype: true },
  { term: "Iceberg", definition: "A large piece of freshwater ice that has broken off from a glacier or ice shelf and is floating in open water.", related_topics: ["Ice Sheet", "Ice Shelf"], hindi_translation: "हिमखंड", category: "Cryosphere", is_prototype: true },
  { term: "Albedo", definition: "The fraction of incoming solar radiation reflected by a surface. Snow and ice have high albedo, reflecting most sunlight.", related_topics: ["Sea Ice", "Climate Change"], hindi_translation: "परावर्तनता", category: "Climate", is_prototype: true },
  { term: "Southern Ocean", definition: "The ocean surrounding Antarctica, also known as the Antarctic Ocean, playing a key role in global ocean circulation.", related_topics: ["Antarctica", "Oceanography"], hindi_translation: "दक्षिण महासागर", category: "Oceanography", is_prototype: true },
  { term: "Permafrost", definition: "Ground that remains frozen for at least two consecutive years, common in Arctic regions.", related_topics: ["Cryosphere", "Arctic"], hindi_translation: "स्थायी हिम", category: "Cryosphere", is_prototype: true },
  { term: "Calving", definition: "The process by which chunks of ice break off from a glacier or ice shelf to form icebergs.", related_topics: ["Iceberg", "Ice Shelf"], hindi_translation: "जनन", category: "Cryosphere", is_prototype: true },
];

export default function Glossary() {
  const [terms, setTerms] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await db.entities.GlossaryTerm.filter({}, { sort: "term", limit: 100 });
        setTerms(res.items?.length ? res.items : FALLBACK_TERMS);
      } catch (e) {
        setTerms(FALLBACK_TERMS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = terms.filter((t) =>
    !search ||
    t.term?.toLowerCase().includes(search.toLowerCase()) ||
    t.definition?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-[1360px] px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link to="/learn" className="hover:text-foreground">Learn</Link>
        <span>/</span>
        <span className="font-medium text-foreground">Glossary</span>
      </nav>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
          <BookMarked className="h-6 w-6 text-[#4DA8D8]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#071A2B]">Scientific Glossary</h1>
          <p className="text-sm text-muted-foreground">Polar science terms with approved Hindi and Marathi translations</p>
        </div>
      </div>

      <div className="mt-6 relative max-w-xl">
        <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search terms…"
          className="w-full rounded-lg border border-border bg-white py-3 pl-11 pr-4 text-sm focus:border-[#4DA8D8] focus:outline-none focus:ring-2 focus:ring-[#4DA8D8]/20"
        />
      </div>

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 animate-pulse rounded-xl border border-border bg-muted" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => (
            <div key={i} className="flex flex-col rounded-xl border border-border bg-white p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-[#071A2B]">{t.term}</h3>
                {t.is_prototype && <PrototypeTag />}
              </div>
              {t.category && <span className="mt-1 self-start rounded bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground">{t.category}</span>}
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{t.definition}</p>
              {t.related_topics?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.related_topics.map((rt, j) => (
                    <span key={j} className="rounded-full bg-[#4DA8D8]/10 px-2 py-0.5 text-[11px] font-medium text-[#4DA8D8]">{rt}</span>
                  ))}
                </div>
              )}
              {(t.hindi_translation || t.marathi_translation) && (
                <div className="mt-3 space-y-1 border-t border-border pt-3 text-xs">
                  {t.hindi_translation && <div><span className="font-semibold text-muted-foreground">Hindi:</span> <span className="text-foreground">{t.hindi_translation}</span></div>}
                  {t.marathi_translation && <div><span className="font-semibold text-muted-foreground">Marathi:</span> <span className="text-foreground">{t.marathi_translation}</span></div>}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-border p-12 text-center">
          <Search className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No terms match your search. Try a different keyword.</p>
        </div>
      )}
    </div>
  );
}