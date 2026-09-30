import { db } from '@/api/base44Client';

import React from "react";
import { useSearchParams } from "react-router-dom";
import { Send, Calendar, Copy, Download, Eye, Lock, AlertTriangle, CheckCircle, Globe, Instagram, Linkedin, Twitter, Facebook, Youtube, Rss, Clock, ShieldCheck } from "lucide-react";

import { ReviewBadge, PrototypeTag } from "@/components/Badges";
import { canPublish } from "@/lib/polarSetu";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { value: "website", label: "Website", icon: Globe, color: "text-blue-600" },
  { value: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-600" },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
  { value: "x", label: "X", icon: Twitter, color: "text-slate-800" },
  { value: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-600" },
  { value: "youtube", label: "YouTube", icon: Youtube, color: "text-red-600" },
  { value: "rss", label: "RSS / Newsletter", icon: Rss, color: "text-orange-600" },
];

export default function Publishing() {
  const [params] = useSearchParams();
  const [content, setContent] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [platform, setPlatform] = React.useState("website");
  const [scheduledTime, setScheduledTime] = React.useState("");
  const [publishBlocked, setPublishBlocked] = React.useState(false);
  const [toast, setToast] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        const res = await db.entities.GeneratedContent.filter({}, { sort: "-created_date", limit: 50 });
        setContent(res.items || []);
        const contentId = params.get("content");
        if (contentId && res.items) {
          const found = res.items.find((c) => c.id === contentId);
          if (found) setSelected(found);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handlePublish = async () => {
    if (!selected) return;
    if (!canPublish(selected.status)) {
      setPublishBlocked(true);
      setTimeout(() => setPublishBlocked(false), 4000);
      return;
    }
    await db.entities.GeneratedContent.update(selected.id, { status: "published", platform, scheduled_time: scheduledTime || new Date().toISOString() });
    await db.entities.AuditLog.create({
      actor: "Communication Editor",
      action: "publication",
      target: selected.title,
      target_type: "generated_content",
      details: `Published to ${platform}${scheduledTime ? ` scheduled for ${scheduledTime}` : ""}`,
      is_prototype: true,
    });
    setSelected({ ...selected, status: "published" });
    showToast("Content published successfully.");
  };

  const handleSchedule = async () => {
    if (!selected || !scheduledTime) return;
    if (!canPublish(selected.status)) {
      setPublishBlocked(true);
      setTimeout(() => setPublishBlocked(false), 4000);
      return;
    }
    await db.entities.GeneratedContent.update(selected.id, { status: "scheduled", platform, scheduled_time: scheduledTime });
    await db.entities.AuditLog.create({
      actor: "Communication Editor",
      action: "publication",
      target: selected.title,
      target_type: "generated_content",
      details: `Scheduled for ${platform} at ${scheduledTime}`,
      is_prototype: true,
    });
    setSelected({ ...selected, status: "scheduled" });
    showToast("Content scheduled.");
  };

  const charCount = selected?.content?.length || 0;
  const PlatformIcon = PLATFORMS.find((p) => p.value === platform)?.icon || Globe;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
          <Send className="h-6 w-6 text-[#4DA8D8]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#071A2B]">Publishing</h1>
          <p className="text-sm text-muted-foreground">Preview, schedule and export approved content across platforms</p>
        </div>
      </div>

      {publishBlocked && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <Lock className="h-5 w-5" />
          <div>
            <strong>Publishing unavailable — scientific approval required.</strong>
            <p className="text-xs">This content has not reached the Approved state. It must pass scientific review before publishing.</p>
          </div>
        </div>
      )}

      {toast && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle className="h-4 w-4" /> {toast}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Content list */}
        <div className="lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-[#071A2B]">Generated Content</h2>
          <div className="space-y-2">
            {content.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No content yet. Generate content in the AI Outreach Studio.
              </div>
            ) : content.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={cn("w-full rounded-lg border p-3 text-left transition-colors", selected?.id === c.id ? "border-[#4DA8D8] bg-[#4DA8D8]/5" : "border-border bg-white hover:bg-muted")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-[#071A2B]">{c.title}</span>
                  <ReviewBadge status={c.status} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{c.format?.replace("_", " ")} · {c.audience?.replace("_", " ")}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview + actions */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              {/* Platform selector */}
              <div className="rounded-xl border border-border bg-white p-4">
                <h3 className="text-sm font-semibold text-[#071A2B]">Platform</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.value}
                        onClick={() => setPlatform(p.value)}
                        className={cn("inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors", platform === p.value ? "border-[#4DA8D8] bg-[#4DA8D8]/10" : "border-border bg-white hover:bg-muted")}
                      >
                        <Icon className={cn("h-4 w-4", p.color)} /> {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-xl border border-border bg-white p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlatformIcon className="h-5 w-5 text-[#4DA8D8]" />
                    <h3 className="text-sm font-semibold text-[#071A2B]">{PLATFORMS.find(p => p.value === platform)?.label} Preview</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <ReviewBadge status={selected.status} />
                    {selected.is_prototype && <PrototypeTag />}
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-border bg-muted p-4">
                  <div className="text-base font-semibold text-[#071A2B]">{selected.title}</div>
                  <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground line-clamp-6">{selected.content}</div>
                  <div className="mt-3 border-t border-border pt-2 text-xs text-muted-foreground">
                    Source: {selected.source_title} · AI-assisted content · {selected.language}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>Character count: <strong className="text-foreground">{charCount}</strong></span>
                  <span>Platform: <strong className="text-foreground">{PLATFORMS.find(p => p.value === platform)?.label}</strong></span>
                  <span>Approval: <strong className={canPublish(selected.status) ? "text-emerald-600" : "text-amber-600"}>{canPublish(selected.status) ? "Approved" : "Pending"}</strong></span>
                </div>
              </div>

              {/* Schedule + actions */}
              <div className="rounded-xl border border-border bg-white p-4">
                <h3 className="text-sm font-semibold text-[#071A2B]">Schedule & Export</h3>
                <div className="mt-3 flex flex-wrap items-end gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Scheduled time</label>
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="mt-1 block rounded-lg border border-border px-3 py-2 text-sm focus:border-[#4DA8D8] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={handleSchedule} disabled={!canPublish(selected.status)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#4DA8D8] bg-[#4DA8D8]/10 px-4 py-2 text-sm font-semibold text-[#071A2B] hover:bg-[#4DA8D8]/20 disabled:opacity-50">
                    <Calendar className="h-4 w-4" /> Schedule
                  </button>
                  <button onClick={handlePublish} disabled={!canPublish(selected.status)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B2942] px-4 py-2 text-sm font-semibold text-white hover:bg-[#071A2B] disabled:opacity-50">
                    <Send className="h-4 w-4" /> Mock Publish
                  </button>
                  <button onClick={() => showToast("Copied to clipboard")} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-muted">
                    <Copy className="h-4 w-4" /> Copy Text
                  </button>
                  <button onClick={() => showToast("Exported as JSON")} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-muted">
                    <Download className="h-4 w-4" /> Export JSON
                  </button>
                  <button onClick={() => showToast("Exported as CSV")} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-muted">
                    <Download className="h-4 w-4" /> Export CSV
                  </button>
                </div>
                {!canPublish(selected.status) && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    <AlertTriangle className="h-4 w-4" /> Publishing is blocked until this content reaches the <strong>Approved</strong> state. Submit it for scientific review first.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-96 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-white text-center">
              <Send className="h-12 w-12 text-muted-foreground/30" />
              <h3 className="mt-4 text-base font-semibold text-[#071A2B]">Select content to publish</h3>
              <p className="mt-1 text-sm text-muted-foreground">Choose a generated content item from the list to preview and publish.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}