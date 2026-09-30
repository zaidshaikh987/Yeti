import { db } from '@/api/base44Client';

import React from "react";
import { useSearchParams } from "react-router-dom";
import { FileText, Save, Send, Sparkles, User, Tag, MapPin, Calendar, Languages, Shield, FileCheck, Hash, Link2, Quote, Check, Loader2 } from "lucide-react";

import { REGIONS, CONTENT_TYPES } from "@/lib/polarSetu";
import { AccessBadge, ReviewBadge, PrototypeTag } from "@/components/Badges";

export default function MetadataEditor() {
  const [params] = useSearchParams();
  const [assets, setAssets] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [form, setForm] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        const res = await db.entities.Asset.filter({ review_status: { $in: ["draft", "editor_review"] } }, { sort: "-created_date", limit: 50 });
        setAssets(res.items || []);
        const assetId = params.get("asset");
        if (assetId && res.items) {
          const found = res.items.find((a) => a.id === assetId);
          if (found) selectAsset(found);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const selectAsset = (asset) => {
    setSelected(asset);
    setForm({
      title: asset.title || "",
      description: asset.description || "",
      creator: asset.creator || "",
      contributor: asset.contributor || "",
      publisher: asset.publisher || "",
      language: asset.language || "en",
      content_type: asset.content_type || "report",
      region: asset.region || "antarctica",
      research_theme: asset.research_theme || "",
      keywords: (asset.keywords || []).join(", "),
      rights: asset.rights || "NCPOR",
      license: asset.license || "CC-BY 4.0",
      access_class: asset.access_class || "open",
      file_format: asset.file_format || "",
      citation: asset.citation || "",
      source_url: asset.source_url || "",
    });
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleSave = async (submitForReview) => {
    setSaving(true);
    try {
      const keywords = form.keywords.split(",").map((k) => k.trim()).filter(Boolean);
      await db.entities.Asset.update(selected.id, {
        ...form,
        keywords,
        review_status: submitForReview ? "editor_review" : selected.review_status,
      });
      await db.entities.AuditLog.create({
        actor: "Repository Administrator",
        action: "metadata_change",
        target: selected.title,
        target_type: "asset",
        details: submitForReview ? "Metadata updated and submitted for review" : "Metadata saved",
        is_prototype: true,
      });
      if (submitForReview) {
        await db.entities.ReviewTask.create({
          asset_id: selected.id,
          asset_title: form.title,
          review_type: "metadata",
          status: "pending",
          source: "Metadata Editor",
          priority: "medium",
          is_prototype: true,
        });
      }
      showToast(submitForReview ? "Metadata saved and submitted for review." : "Metadata saved.");
      setSelected({ ...selected, ...form, keywords, review_status: submitForReview ? "editor_review" : selected.review_status });
    } catch (e) {
      showToast("Failed to save metadata.");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: "title", label: "Title", icon: FileText, full: true },
    { key: "description", label: "Description", icon: FileText, full: true, textarea: true },
    { key: "creator", label: "Creator", icon: User },
    { key: "contributor", label: "Contributor", icon: User },
    { key: "publisher", label: "Publisher", icon: FileText },
    { key: "language", label: "Language", icon: Languages, select: ["en", "hi", "mr"] },
    { key: "content_type", label: "Content Type", icon: Tag, select: Object.keys(CONTENT_TYPES) },
    { key: "region", label: "Region", icon: MapPin, select: Object.keys(REGIONS) },
    { key: "research_theme", label: "Research Theme", icon: Tag },
    { key: "keywords", label: "Keywords (comma-separated)", icon: Tag, full: true },
    { key: "rights", label: "Rights", icon: Shield },
    { key: "license", label: "License", icon: FileCheck },
    { key: "access_class", label: "Access Class", icon: Shield, select: ["open", "registered", "restricted", "embargoed", "internal", "removed"] },
    { key: "file_format", label: "File Format", icon: FileText },
    { key: "source_url", label: "Source URL", icon: Link2, full: true },
    { key: "citation", label: "Citation", icon: Quote, full: true, textarea: true },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
          <FileText className="h-6 w-6 text-[#4DA8D8]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#071A2B]">Metadata Editor</h1>
          <p className="text-sm text-muted-foreground">Review AI-suggested metadata and edit before submission</p>
        </div>
      </div>

      {toast && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <Check className="h-4 w-4" /> {toast}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-4">
        {/* Asset list */}
        <div className="lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-[#071A2B]">Pending Metadata</h2>
          {assets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No assets awaiting metadata review.</div>
          ) : (
            <div className="space-y-2">
              {assets.map((a) => (
                <button key={a.id} onClick={() => selectAsset(a)} className={`w-full rounded-lg border p-3 text-left transition-colors ${selected?.id === a.id ? "border-[#4DA8D8] bg-[#4DA8D8]/5" : "border-border bg-white hover:bg-muted"}`}>
                  <div className="truncate text-sm font-medium text-[#071A2B]">{a.title}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <ReviewBadge status={a.review_status} />
                    {a.is_prototype && <PrototypeTag />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="lg:col-span-3">
          {form ? (
            <div className="space-y-4">
              {/* AI suggested banner */}
              <div className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm text-purple-800">
                <Sparkles className="h-4 w-4" />
                <span><strong>AI Suggested</strong> metadata is pre-filled. Review and edit fields marked with AI suggestions before saving.</span>
              </div>

              {/* File info */}
              <div className="rounded-xl border border-border bg-white p-4">
                <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                  <div><span className="text-muted-foreground">File Format:</span> <strong className="text-foreground">{selected.file_format || "—"}</strong></div>
                  <div><span className="text-muted-foreground">File Size:</span> <strong className="text-foreground">{selected.file_size || "—"}</strong></div>
                  <div><span className="text-muted-foreground">Checksum:</span> <strong className="font-mono text-foreground">{selected.checksum?.slice(0, 20) || "—"}…</strong></div>
                  <div><span className="text-muted-foreground">Version:</span> <strong className="text-foreground">{selected.version || "1.0"}</strong></div>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                {fields.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.key} className={f.full ? "sm:col-span-2" : ""}>
                      <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Icon className="h-3.5 w-3.5" /> {f.label}
                      </label>
                      {f.textarea ? (
                        <textarea
                          value={form[f.key] || ""}
                          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                          rows={3}
                          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-[#4DA8D8] focus:outline-none"
                        />
                      ) : f.select ? (
                        <select
                          value={form[f.key] || ""}
                          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-[#4DA8D8] focus:outline-none"
                        >
                          {f.select.map((opt) => <option key={opt} value={opt}>{f.key === "content_type" ? CONTENT_TYPES[opt]?.label : f.key === "region" ? REGIONS[opt] : opt.toUpperCase()}</option>)}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={form[f.key] || ""}
                          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-[#4DA8D8] focus:outline-none"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <button onClick={() => handleSave(false)} disabled={saving} className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-muted">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
                </button>
                <button onClick={() => handleSave(true)} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#0B2942] px-4 py-2 text-sm font-semibold text-white hover:bg-[#071A2B]">
                  <Send className="h-4 w-4" /> Submit for Review
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-96 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-white text-center">
              <FileText className="h-12 w-12 text-muted-foreground/30" />
              <h3 className="mt-4 text-base font-semibold text-[#071A2B]">Select an asset</h3>
              <p className="mt-1 text-sm text-muted-foreground">Choose an asset from the list to edit its metadata.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}