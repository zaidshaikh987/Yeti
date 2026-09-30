import { db } from '@/api/base44Client';

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap, BookOpen, HelpCircle, FileText, Package, Compass, Database,
  ArrowRight, BookMarked, ListChecks, X, Download, Map as MapIcon, Search,
  Microscope, Globe2, Snowflake,
} from "lucide-react";

import { PrototypeTag } from "@/components/Badges";
import LearnQuiz from "@/components/LearnQuiz";

const SECTIONS = [
  { key: "lessons", label: "Lessons", icon: BookOpen, desc: "Structured learning units with source-backed explanations" },
  { key: "quiz", label: "Quizzes", icon: HelpCircle, desc: "Self-assessment questions on polar science topics" },
  { key: "glossary", label: "Glossary", icon: BookMarked, desc: "Scientific terms with translations", path: "/glossary" },
  { key: "activity", label: "Activity Sheets", icon: FileText, desc: "Downloadable worksheets for classroom use" },
  { key: "project", label: "Project Packs", icon: Package, desc: "Multi-lesson project resources for students" },
  { key: "expedition", label: "Virtual Expeditions", icon: Compass, desc: "Follow real expeditions step by step", path: "/map" },
  { key: "dataset", label: "Dataset Exercises", icon: Database, desc: "Learn data literacy with real polar datasets", path: "/search?content_type=dataset" },
];

const SEA_ICE_JOURNEY = [
  { step: 1, label: "Short explanation", desc: "Sea ice is frozen seawater that forms, grows and melts in the polar oceans. It reflects sunlight, regulates ocean–atmosphere heat exchange and shapes polar ecosystems." },
  { step: 2, label: "Sea-ice map", desc: "View seasonal sea-ice extent in the Southern Ocean around Antarctica." },
  { step: 3, label: "Expedition photograph", desc: "Photographs from Indian Antarctic expeditions document sea-ice conditions first-hand." },
  { step: 4, label: "Dataset preview", desc: "Explore a sample dataset of sea-ice concentration measurements." },
  { step: 5, label: "Guided questions", desc: "Why does sea ice matter for global climate? How does it differ from ice shelves?" },
  { step: 6, label: "Source-backed answer", desc: "Answers reference approved NCPOR publications and datasets." },
  { step: 7, label: "Downloadable worksheet", desc: "A printable worksheet reinforces the learning journey." },
];

const LESSONS = [
  { title: "Why is Sea Ice Important?", level: "Class 9–12", duration: "45 min", theme: "Cryosphere", desc: "Explore sea ice formation, its role in climate regulation and why scientists monitor it." },
  { title: "India's Polar Stations", level: "Class 6–8", duration: "30 min", theme: "Geography", desc: "Learn about Bharati, Maitri, Himadri and Himansh — India's research outposts in extreme environments." },
  { title: "Climate Change & the Poles", level: "Class 9–12", duration: "40 min", theme: "Climate", desc: "Understand how polar regions act as sentinels of global climate change." },
  { title: "Polar Ecosystems & Wildlife", level: "Class 6–8", duration: "35 min", theme: "Biology", desc: "Discover the unique plants and animals that survive in Earth's coldest habitats." },
];

const PROJECT_PACKS = [
  { title: "Antarctica Expedition Project", desc: "A 5-lesson project pack where students plan a virtual Antarctic expedition, covering logistics, science objectives, weather challenges and teamwork.", lessons: 5, level: "Class 9–12" },
  { title: "Arctic Climate Investigation", desc: "Study Arctic warming through data analysis, satellite imagery interpretation and group research on tipping points.", lessons: 4, level: "Class 9–12" },
  { title: "Polar Science for Young Explorers", desc: "An introductory pack with hands-on activities, simple experiments and storytelling for younger students.", lessons: 6, level: "Class 6–8" },
];

function Modal({ title, icon: Icon, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl border border-border bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border bg-[#071A2B] px-5 py-3 text-white">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-[#4DA8D8]" />}
            <h3 className="text-base font-semibold">{title}</h3>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[calc(85vh-52px)] overflow-y-auto p-5 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Learn() {
  const [assets, setAssets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [activeModal, setActiveModal] = useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await db.entities.Asset.filter(
          { content_type: { $in: ["report", "dataset"] }, review_status: "approved", access_class: "open" },
          { limit: 4 }
        );
        setAssets(res.items || []);
      } catch (e) {
        setAssets([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openSection = (section) => {
    if (section.path) return;
    setActiveModal(section.key);
  };

  const downloadActivitySheet = () => {
    const worksheet = `POLARSETU — ACTIVITY SHEET
${"=".repeat(50)}

Lesson: Why is Sea Ice Important?
Level: Class 9–12 | Duration: 45 min
Theme: Cryosphere

${"-".repeat(50)}

PART A: Fill in the Blanks

1. Sea ice is frozen __________ that forms on the ocean surface.
2. India's two Antarctic research stations are __________ and __________.
3. The reflectivity of a surface is called its __________.
4. NCPOR stands for National Centre for __________ and __________ Research.
5. India's Arctic station Himadri is located in __________, Norway.

${"-".repeat(50)}

PART B: Short Answer Questions

1. Why does sea ice matter for global climate regulation?
   _______________________________________________
   _______________________________________________
   _______________________________________________

2. What is the difference between sea ice and an ice shelf?
   _______________________________________________
   _______________________________________________
   _______________________________________________

3. How do scientists measure sea ice extent?
   _______________________________________________
   _______________________________________________
   _______________________________________________

${"-".repeat(50)}

PART C: Think & Discuss

1. If all Arctic sea ice melted, how would it affect global temperatures?
2. Why is it important for India, a tropical country, to study polar regions?
3. How can you reduce your carbon footprint to help protect polar ice?

${"-".repeat(50)}

Answer Key (Teacher's Copy):

Part A: 1) seawater  2) Bharati, Maitri  3) albedo
        4) Polar, Ocean  5) Svalbard (Ny-Alesund)

Part B: 1) Sea ice reflects sunlight (high albedo), regulating ocean-atmosphere
   heat exchange. As ice melts, darker ocean absorbs more heat, accelerating
   warming.
   2) Sea ice forms directly on the ocean surface and is frozen seawater.
   Ice shelves are floating extensions of land-based glaciers/ice sheets.
   3) Scientists use satellite imagery, ship-based observations, and
   automated buoys to monitor sea ice concentration and extent.

${"=".repeat(50)}
Generated by PolarSetu Education Hub — NCPOR
`;
    const blob = new Blob([worksheet], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "polarsetu-activity-sheet-sea-ice.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setActiveModal(null);
  };

  return (
    <div className="mx-auto max-w-[1360px] px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="font-medium text-foreground">Education Hub</span>
      </nav>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4DA8D8] to-[#0B2942] text-white">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#071A2B]">Education Hub</h1>
          <p className="text-sm text-muted-foreground">Smart Education — polar science for students, teachers and curious citizens</p>
        </div>
      </div>

      {/* Sections */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const content = (
            <div className="group flex h-full cursor-pointer flex-col rounded-xl border border-border bg-white p-5 transition-all hover:border-[#4DA8D8]/40 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Icon className="h-5 w-5 text-[#4DA8D8]" />
              </div>
              <h3 className="mt-3 font-semibold text-[#071A2B]">{s.label}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{s.desc}</p>
              <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#4DA8D8]">
                Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
          return s.path
            ? <Link key={s.label} to={s.path}>{content}</Link>
            : <div key={s.label} onClick={() => openSection(s)}>{content}</div>;
        })}
      </section>

      {/* Featured lesson */}
      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-[#4DA8D8]" />
          <h2 className="text-xl font-bold text-[#071A2B]">Featured Lesson</h2>
          <PrototypeTag />
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <div className="grid lg:grid-cols-2">
            <div className="relative bg-[#071A2B] p-8 text-white">
              <div className="absolute inset-0 opacity-20">
                <img src="https://images.unsplash.com/photo-1725768755113-5c8d3a3b3f6a?w=800&q=80" alt="Sea ice" className="h-full w-full object-cover" onError={(e) => e.target.style.display = "none"} />
              </div>
              <div className="relative">
                <span className="rounded-full bg-[#4DA8D8] px-3 py-1 text-xs font-semibold">Featured Lesson</span>
                <h3 className="mt-4 text-2xl font-bold">Why is Sea Ice Important?</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  Sea ice is one of the most dynamic and influential components of the Earth's climate system. This lesson explores its formation, role in climate regulation and why scientists monitor it closely.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded bg-white/10 px-2 py-1">Level: Class 9–12</span>
                  <span className="rounded bg-white/10 px-2 py-1">Duration: 45 min</span>
                  <span className="rounded bg-white/10 px-2 py-1">Theme: Cryosphere</span>
                </div>
                <button onClick={() => setActiveModal("lessons")} className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-[#4DA8D8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3A98C8]">
                  Start Lesson <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Learning Journey</h4>
              <div className="mt-4 space-y-3">
                {SEA_ICE_JOURNEY.map((step) => (
                  <div key={step.step} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4DA8D8] text-xs font-bold text-white">{step.step}</div>
                    <div className="flex-1 pb-1">
                      <div className="text-sm font-semibold text-[#071A2B]">{step.label}</div>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related datasets */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-[#071A2B]">Related Datasets & Reports</h2>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-xl border border-border bg-muted" />)}
          </div>
        ) : assets.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {assets.map((a) => (
              <Link key={a.id} to={`/asset/${a.id}`} className="group rounded-xl border border-border bg-white p-4 transition-all hover:border-[#4DA8D8]/40 hover:shadow-md">
                <h3 className="line-clamp-2 text-sm font-semibold text-[#071A2B] group-hover:text-[#4DA8D8]">{a.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{a.summary}</p>
                <div className="mt-3 text-[11px] text-muted-foreground">{a.content_type} · {a.year}</div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No educational resources linked yet.
          </div>
        )}
      </section>

      {/* Modals */}
      {activeModal === "lessons" && (
        <Modal title="Polar Science Lessons" icon={BookOpen} onClose={() => setActiveModal(null)}>
          <div className="space-y-3">
            {LESSONS.map((lesson, i) => (
              <div key={i} className="rounded-xl border border-border p-4 transition-all hover:border-[#4DA8D8]/40 hover:shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#071A2B]">{lesson.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{lesson.desc}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">{lesson.level}</span>
                      <span className="rounded bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">{lesson.duration}</span>
                      <span className="rounded bg-[#4DA8D8]/10 px-2 py-0.5 text-[11px] font-medium text-[#4DA8D8]">{lesson.theme}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setActiveModal(null); setTimeout(() => setActiveModal("featured"), 100); }}
                    className="shrink-0 rounded-lg bg-[#0B2942] px-3 py-2 text-xs font-medium text-white hover:bg-[#071A2B]"
                  >
                    Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {activeModal === "featured" && (
        <Modal title="Why is Sea Ice Important?" icon={Snowflake} onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div className="rounded-lg bg-secondary p-4">
              <h4 className="font-semibold text-[#071A2B]">What is Sea Ice?</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                Sea ice is frozen seawater that forms on the surface of polar oceans. Unlike icebergs (which break off from glaciers) or ice shelves (floating glacier extensions), sea ice forms directly from ocean water freezing.
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <h4 className="font-semibold text-[#071A2B]">Why Does It Matter?</h4>
              <ul className="mt-1.5 space-y-1.5 text-sm text-foreground">
                <li className="flex gap-2"><span className="text-[#4DA8D8]">•</span> <span><strong>Albedo effect:</strong> Sea ice reflects up to 80% of sunlight, keeping the planet cool.</span></li>
                <li className="flex gap-2"><span className="text-[#4DA8D8]">•</span> <span><strong>Climate regulation:</strong> It drives ocean circulation by controlling heat exchange between ocean and atmosphere.</span></li>
                <li className="flex gap-2"><span className="text-[#4DA8D8]">•</span> <span><strong>Ecosystems:</strong> Polar wildlife — from penguins to polar bears — depend on sea ice for hunting, breeding and migration.</span></li>
                <li className="flex gap-2"><span className="text-[#4DA8D8]">•</span> <span><strong>Climate indicator:</strong> Scientists monitor sea ice extent as a key measure of global warming.</span></li>
              </ul>
            </div>
            <div className="rounded-lg border border-[#4DA8D8]/20 bg-[#4DA8D8]/5 p-4">
              <h4 className="font-semibold text-[#071A2B]">Guided Questions</h4>
              <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-sm text-foreground">
                <li>What happens to global temperatures when sea ice melts?</li>
                <li>How is sea ice different from an ice shelf?</li>
                <li>Why should a tropical country like India care about polar ice?</li>
              </ol>
            </div>
            <div className="flex gap-3">
              <button onClick={downloadActivitySheet} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B2942] px-4 py-2 text-sm font-medium text-white hover:bg-[#071A2B]">
                <Download className="h-4 w-4" /> Download Worksheet
              </button>
              <button onClick={() => setActiveModal("quiz")} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
                <HelpCircle className="h-4 w-4" /> Take Quiz
              </button>
            </div>
          </div>
        </Modal>
      )}

      {activeModal === "quiz" && (
        <Modal title="Polar Science Quiz" icon={HelpCircle} onClose={() => setActiveModal(null)}>
          <LearnQuiz onClose={() => setActiveModal(null)} />
        </Modal>
      )}

      {activeModal === "activity" && (
        <Modal title="Activity Sheets" icon={FileText} onClose={() => setActiveModal(null)}>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Download printable worksheets for classroom or self-study use.</p>
            {[
              { title: "Sea Ice & Climate Worksheet", desc: "Fill-in-the-blanks, short answers and discussion questions about sea ice.", file: "polarsetu-activity-sheet-sea-ice.txt" },
              { title: "India's Polar Stations Worksheet", desc: "Map labeling, matching and short research questions about Indian polar research.", file: "polarsetu-activity-sheet-stations.txt" },
              { title: "Arctic vs Antarctic Comparison", desc: "Compare and contrast the two polar regions with a structured Venn diagram activity.", file: "polarsetu-activity-sheet-comparison.txt" },
            ].map((sheet, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-border p-4 hover:border-[#4DA8D8]/40">
                <div className="flex-1">
                  <h4 className="font-semibold text-[#071A2B]">{sheet.title}</h4>
                  <p className="mt-0.5 text-sm text-muted-foreground">{sheet.desc}</p>
                </div>
                <button
                  onClick={downloadActivitySheet}
                  className="shrink-0 rounded-lg bg-[#0B2942] px-3 py-2 text-xs font-medium text-white hover:bg-[#071A2B]"
                >
                  <Download className="mr-1 inline h-3.5 w-3.5" /> Download
                </button>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {activeModal === "project" && (
        <Modal title="Project Packs" icon={Package} onClose={() => setActiveModal(null)}>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Multi-lesson project resources for deeper student engagement.</p>
            {PROJECT_PACKS.map((pack, i) => (
              <div key={i} className="rounded-xl border border-border p-4 hover:border-[#4DA8D8]/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#071A2B]">{pack.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{pack.desc}</p>
                    <div className="mt-2 flex gap-1.5">
                      <span className="rounded bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">{pack.lessons} lessons</span>
                      <span className="rounded bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">{pack.level}</span>
                    </div>
                  </div>
                  <button
                    onClick={downloadActivitySheet}
                    className="shrink-0 rounded-lg bg-[#0B2942] px-3 py-2 text-xs font-medium text-white hover:bg-[#071A2B]"
                  >
                    <Download className="mr-1 inline h-3.5 w-3.5" /> Get Pack
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

    </div>
  );
}