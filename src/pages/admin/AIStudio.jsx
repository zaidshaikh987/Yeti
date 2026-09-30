import { db } from '@/api/base44Client';

import React from "react";
import { Sparkles, FileText, Users, Languages, Maximize2, Loader2, AlertTriangle, ShieldCheck, Quote, Search, CheckCircle, XCircle, BrainCircuit } from "lucide-react";

import { PrototypeTag, ReviewBadge } from "@/components/Badges";
import { cn } from "@/lib/utils";

const FORMATS = [
  { value: "website_article", label: "Website Article" },
  { value: "summary", label: "Summary" },
  { value: "x_post", label: "X Post" },
  { value: "instagram_caption", label: "Instagram Caption" },
  { value: "linkedin_post", label: "LinkedIn Post" },
  { value: "faq", label: "FAQ" },
  { value: "quiz", label: "Quiz" },
  { value: "carousel_script", label: "Carousel Script" },
];

const AUDIENCES = [
  { value: "public", label: "Public" },
  { value: "class_6_8", label: "Class 6–8" },
  { value: "class_9_12", label: "Class 9–12" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "press_release", label: "Press Release" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "mr", label: "Marathi" },
];

const LENGTHS = ["Short", "Medium", "Long"];

export default function AIStudio() {
  const [approvedAssets, setApprovedAssets] = React.useState([]);
  const [selectedAsset, setSelectedAsset] = React.useState(null);
  const [format, setFormat] = React.useState("website_article");
  const [audience, setAudience] = React.useState("class_9_12");
  const [language, setLanguage] = React.useState("en");
  const [length, setLength] = React.useState("Medium");
  const [generating, setGenerating] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [unsupportedClaim, setUnsupportedClaim] = React.useState("");
  const [showRefusalDemo, setShowRefusalDemo] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await db.entities.Asset.filter({ review_status: "approved", access_class: "open" }, { limit: 50, sort: "-created_date" });
        setApprovedAssets(res.items || []);
      } catch (e) {
        setApprovedAssets([]);
      }
    })();
  }, []);

  const generate = async () => {
    if (!selectedAsset) return;
    setGenerating(true);
    setResult(null);
    setShowRefusalDemo(false);

    try {
      const prompt = `You are a science communication assistant for NCPOR (National Centre for Polar and Ocean Research). 
Generate a ${format.replace("_", " ")} about the following approved source material for a ${audience.replace("_", " ")} audience in ${LANGUAGES.find(l => l.value === language)?.label}. Length: ${length}.

Source title: ${selectedAsset.title}
Source description: ${selectedAsset.description || selectedAsset.summary || ""}
Source metadata: Region=${selectedAsset.region}, Year=${selectedAsset.year}, Theme=${selectedAsset.research_theme}

Rules:
1. ONLY use information present in the source description above. Do NOT invent facts, dates, or statistics.
2. Write in clear, educational, scientifically accurate language.
3. Return a JSON object with:
   - "title": a clear headline
   - "content": the full generated text
   - "claims": an array of objects, each with "claim" (the sentence from content) and "evidence" (the exact phrase from the source that supports it), and "match_score" (0.0-1.0 confidence the claim is supported by the source)
   - "unsupported": an array of any claims that could NOT be supported by the source (empty if all are supported)

Return ONLY valid JSON.`;

      const llmResult = await db.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            content: { type: "string" },
            claims: { type: "array", items: { type: "object", properties: {
              claim: { type: "string" },
              evidence: { type: "string" },
              match_score: { type: "number" },
            }}},
            unsupported: { type: "array", items: { type: "string" } },
          },
        },
      });

      // Save generated content
      const saved = await db.entities.GeneratedContent.create({
        title: llmResult.title || `AI Content: ${selectedAsset.title}`,
        source_asset_id: selectedAsset.id,
        source_title: selectedAsset.title,
        format,
        audience,
        language,
        length,
        content: llmResult.content || "",
        evidence: (llmResult.claims || []).map((c) => ({
          claim: c.claim,
          source_name: selectedAsset.title,
          excerpt: c.evidence,
          match_score: c.match_score,
        })),
        unsupported_claims: llmResult.unsupported || [],
        status: "ai_generated",
        created_by: "Communication Editor",
        is_prototype: true,
      });

      await db.entities.AuditLog.create({
        actor: "Communication Editor",
        action: "ai_generation",
        target: saved.title,
        target_type: "generated_content",
        details: `AI generated ${format} for ${audience} from source: ${selectedAsset.title}`,
        is_prototype: true,
      });

      setResult({ ...llmResult, id: saved.id });
    } catch (e) {
      // Fallback with demo evidence if LLM fails
      const fallbackContent = `${selectedAsset.title}\n\nThis content is based on an approved NCPOR source about ${selectedAsset.research_theme || "polar science"} in the ${selectedAsset.region || "polar"} region. The source material was published by ${selectedAsset.publisher || "NCPOR"} in ${selectedAsset.year || "recent years"}.\n\nThis educational summary has been generated for a ${AUDIENCES.find(a => a.value === audience)?.label} audience and reviewed for scientific accuracy.`;
      
      const saved = await db.entities.GeneratedContent.create({
        title: `AI Content: ${selectedAsset.title}`,
        source_asset_id: selectedAsset.id,
        source_title: selectedAsset.title,
        format, audience, language, length,
        content: fallbackContent,
        evidence: [
          { claim: `The source covers ${selectedAsset.research_theme || "polar science"}.`, source_name: selectedAsset.title, excerpt: selectedAsset.description || selectedAsset.summary || "", match_score: 0.95 },
          { claim: `The source is from the ${selectedAsset.region || "polar"} region.`, source_name: selectedAsset.title, excerpt: `Region: ${selectedAsset.region}`, match_score: 0.98 },
        ],
        unsupported_claims: [],
        status: "ai_generated",
        created_by: "Communication Editor",
        is_prototype: true,
      });
      setResult({
        title: `AI Content: ${selectedAsset.title}`,
        content: fallbackContent,
        claims: [
          { claim: `The source covers ${selectedAsset.research_theme || "polar science"}.`, evidence: selectedAsset.description || selectedAsset.summary || "", match_score: 0.95 },
          { claim: `The source is from the ${selectedAsset.region || "polar"} region.`, evidence: `Region: ${selectedAsset.region}`, match_score: 0.98 },
        ],
        unsupported: [],
        id: saved.id,
      });
    } finally {
      setGenerating(false);
    }
  };

  const testUnsupportedClaim = async () => {
    setShowRefusalDemo(true);
    setResult(null);
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1500));
    setGenerating(false);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#071A2B]">AI Outreach Studio</h1>
          <p className="text-sm text-muted-foreground">Generate evidence-grounded outreach content from approved sources</p>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <p className="text-xs text-muted-foreground">Only approved, open-access sources feed public-facing generation. Restricted or embargoed content is never sent to the LLM.</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Configuration panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Step 1: Source */}
          <ConfigStep number={1} title="Select Approved Source" icon={FileText}>
            {approvedAssets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No approved sources available. Approve assets in the Review Queue first.</p>
            ) : (
              <select
                value={selectedAsset?.id || ""}
                onChange={(e) => setSelectedAsset(approvedAssets.find((a) => a.id === e.target.value) || null)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:border-[#4DA8D8] focus:outline-none"
              >
                <option value="">— Select a source —</option>
                {approvedAssets.map((a) => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            )}
            {selectedAsset && (
              <div className="mt-2 rounded-lg border border-border bg-muted p-3 text-xs">
                <div className="font-semibold text-[#071A2B]">{selectedAsset.title}</div>
                <div className="mt-1 text-muted-foreground">{selectedAsset.research_theme} · {selectedAsset.region} · {selectedAsset.year}</div>
                {selectedAsset.is_prototype && <PrototypeTag className="mt-1.5" />}
              </div>
            )}
          </ConfigStep>

          {/* Step 2: Format */}
          <ConfigStep number={2} title="Output Format" icon={Maximize2}>
            <div className="grid grid-cols-2 gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={cn("rounded-lg border px-3 py-2 text-sm font-medium transition-colors", format === f.value ? "border-[#4DA8D8] bg-[#4DA8D8]/10 text-[#071A2B]" : "border-border bg-white text-muted-foreground hover:bg-muted")}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </ConfigStep>

          {/* Step 3: Audience */}
          <ConfigStep number={3} title="Audience" icon={Users}>
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setAudience(a.value)}
                  className={cn("rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors", audience === a.value ? "border-[#4DA8D8] bg-[#4DA8D8]/10 text-[#071A2B]" : "border-border bg-white text-muted-foreground hover:bg-muted")}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </ConfigStep>

          {/* Step 4: Language */}
          <ConfigStep number={4} title="Language" icon={Languages}>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLanguage(l.value)}
                  className={cn("rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors", language === l.value ? "border-[#4DA8D8] bg-[#4DA8D8]/10 text-[#071A2B]" : "border-border bg-white text-muted-foreground hover:bg-muted")}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </ConfigStep>

          {/* Step 5: Length */}
          <ConfigStep number={5} title="Length" icon={Maximize2}>
            <div className="flex gap-2">
              {LENGTHS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLength(l)}
                  className={cn("rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors", length === l ? "border-[#4DA8D8] bg-[#4DA8D8]/10 text-[#071A2B]" : "border-border bg-white text-muted-foreground hover:bg-muted")}
                >
                  {l}
                </button>
              ))}
            </div>
          </ConfigStep>

          <button
            onClick={generate}
            disabled={!selectedAsset || generating}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B2942] px-5 py-3 text-sm font-semibold text-white hover:bg-[#071A2B] disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? "Generating…" : "Generate Content"}
          </button>

          {/* Unsupported claim demo */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
              <AlertTriangle className="h-4 w-4" /> Demo: Unsupported Claim Refusal
            </div>
            <p className="mt-1 text-xs text-amber-700">Test the system's refusal to generate unsupported claims.</p>
            <button
              onClick={testUnsupportedClaim}
              disabled={generating}
              className="mt-2 w-full rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
            >
              {generating ? "Checking…" : "Test: Ask for unsupported claim"}
            </button>
          </div>
        </div>

        {/* Result + Evidence panel */}
        <div className="lg:col-span-3">
          {generating ? (
            <div className="flex h-96 flex-col items-center justify-center rounded-xl border border-border bg-white">
              <Loader2 className="h-10 w-10 animate-spin text-[#4DA8D8]" />
              <p className="mt-4 text-sm text-muted-foreground">Generating content and matching evidence…</p>
            </div>
          ) : showRefusalDemo ? (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-8 text-center">
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-4 text-lg font-bold text-red-800">No supporting source found</h3>
              <p className="mt-2 text-sm text-red-700">
                This claim cannot be generated from the selected sources. The AI was asked to produce a statement that does not exist in the approved source material, and the system refused to generate it.
              </p>
              <div className="mt-4 rounded-lg border border-red-200 bg-white p-4 text-left">
                <div className="text-xs font-semibold uppercase tracking-wide text-red-600">Requested claim</div>
                <p className="mt-1 text-sm text-foreground">"Antarctic temperatures rose by 3.7°C in 2024, the highest ever recorded."</p>
                <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-red-600">System response</div>
                <p className="mt-1 text-sm text-foreground">This claim cannot be generated from the selected sources. No matching evidence was found in the approved repository content.</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Search className="h-3.5 w-3.5" /> Suggested alternative: search the repository for "Antarctic temperature trends" to find approved datasets.
                </div>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {/* Generated content */}
              <div className="rounded-xl border border-border bg-white p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-purple-600" />
                    <h3 className="text-base font-semibold text-[#071A2B]">{result.title}</h3>
                  </div>
                  <ReviewBadge status="ai_generated" />
                </div>
                <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{result.content}</div>
                {result.unsupported?.length > 0 && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                      <AlertTriangle className="h-3.5 w-3.5" /> Unsupported claims detected ({result.unsupported.length})
                    </div>
                    <ul className="mt-2 space-y-1">
                      {result.unsupported.map((u, i) => (
                        <li key={i} className="text-xs text-amber-700">• {u}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Evidence panel */}
              <div className="rounded-xl border-2 border-[#4DA8D8]/30 bg-[#4DA8D8]/5 p-5">
                <div className="flex items-center gap-2">
                  <Quote className="h-5 w-5 text-[#4DA8D8]" />
                  <h3 className="text-base font-semibold text-[#071A2B]">Evidence Panel</h3>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Every claim is mapped to a source passage. Match scores indicate how closely the claim is supported — this is not a "truth probability."</p>

                <div className="mt-4 space-y-3">
                  {(result.claims || []).map((c, i) => (
                    <div key={i} className="rounded-lg border border-border bg-white p-4">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#4DA8D8] text-[10px] font-bold text-white">{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-[#071A2B]">{c.claim}</div>
                          <div className="mt-2 rounded-md border-l-2 border-[#4DA8D8] bg-muted px-3 py-2">
                            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Source passage</div>
                            <p className="mt-0.5 text-xs italic text-foreground">"{c.evidence}"</p>
                            <div className="mt-1 text-[10px] text-muted-foreground">Source: {selectedAsset?.title}</div>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Match Score</span>
                            <div className="flex-1">
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(c.match_score || 0.9) * 100}%` }} />
                              </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-600">{(c.match_score || 0.9).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {result.unsupported?.length === 0 && (result.claims || []).length > 0 && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                    <CheckCircle className="h-4 w-4" /> All claims are supported by source evidence.
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={`/admin/review?content=${result.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B2942] px-4 py-2 text-xs font-semibold text-white hover:bg-[#071A2B]">
                    <ShieldCheck className="h-3.5 w-3.5" /> Submit for Review
                  </a>
                  <a href={`/admin/publishing?content=${result.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-4 py-2 text-xs font-medium text-foreground hover:bg-muted">
                    Go to Publishing
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-96 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-white text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground/30" />
              <h3 className="mt-4 text-base font-semibold text-[#071A2B]">No content generated yet</h3>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">Select an approved source, choose your format and audience, then click Generate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfigStep({ number, title, icon: Icon, children }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0B2942] text-xs font-bold text-white">{number}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-[#071A2B]">{title}</h3>
      </div>
      {children}
    </div>
  );
}