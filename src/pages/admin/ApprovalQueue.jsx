import { db } from '@/api/base44Client';

import React from "react";
import { useSearchParams } from "react-router-dom";
import { ClipboardCheck, CheckCircle, XCircle, RefreshCw, MessageSquare, Clock, ShieldCheck, FileText, Sparkles, Copy, ScanText } from "lucide-react";

import { ReviewBadge, PrototypeTag } from "@/components/Badges";
import { cn } from "@/lib/utils";

const TABS = ["all", "metadata", "scientific", "duplicate", "ocr"];
const TAB_LABELS = { all: "All", metadata: "Metadata Review", scientific: "Scientific Review", duplicate: "Duplicate Review", ocr: "OCR Correction" };

export default function ApprovalQueue() {
  const [params] = useSearchParams();
  const [tasks, setTasks] = React.useState([]);
  const [generated, setGenerated] = React.useState([]);
  const [tab, setTab] = React.useState("all");
  const [loading, setLoading] = React.useState(true);
  const [commentModal, setCommentModal] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const [taskRes, genRes] = await Promise.all([
          db.entities.ReviewTask.filter({}, { sort: "-created_date", limit: 50 }),
          db.entities.GeneratedContent.filter({ status: { $in: ["ai_generated", "editor_review"] } }, { sort: "-created_date", limit: 50 }),
        ]);
        setTasks(taskRes.items || []);
        setGenerated(genRes.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredTasks = tab === "all" ? tasks : tasks.filter((t) => t.review_type === tab);

  const handleAction = async (task, action) => {
    if ((action === "changes_requested" || action === "rejected") && !commentModal?.comment) {
      setCommentModal({ task, action, comment: "" });
      return;
    }
    await db.entities.ReviewTask.update(task.id, {
      status: action,
      reviewer: "Scientific Reviewer",
      comments: commentModal?.comment || "",
    });
    await db.entities.AuditLog.create({
      actor: "Scientific Reviewer",
      action: action === "approved" ? "approval" : action === "rejected" ? "rejection" : "review",
      target: task.asset_title,
      target_type: "review_task",
      details: `Review ${action} for ${task.asset_title}${commentModal?.comment ? ` — ${commentModal.comment}` : ""}`,
      is_prototype: true,
    });
    setCommentModal(null);
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: action, reviewer: "Scientific Reviewer" } : t));
  };

  const handleContentAction = async (content, newStatus) => {
    await db.entities.GeneratedContent.update(content.id, { status: newStatus, reviewer: "Scientific Reviewer" });
    await db.entities.AuditLog.create({
      actor: "Scientific Reviewer",
      action: newStatus === "approved" ? "approval" : "review",
      target: content.title,
      target_type: "generated_content",
      details: `AI content moved to ${newStatus}`,
      is_prototype: true,
    });
    setGenerated((prev) => prev.map((g) => g.id === content.id ? { ...g, status: newStatus } : g));
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
          <ClipboardCheck className="h-6 w-6 text-[#4DA8D8]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#071A2B]">Approval Queue</h1>
          <p className="text-sm text-muted-foreground">Review assets and AI-generated content before publication</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-px">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t ? "border-[#4DA8D8] text-[#071A2B]" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {TAB_LABELS[t]}
            {t !== "all" && <span className="ml-1.5 rounded-full bg-secondary px-1.5 text-xs">{tasks.filter((x) => x.review_type === t).length}</span>}
          </button>
        ))}
      </div>

      {/* AI Content Review section */}
      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h2 className="text-base font-semibold text-[#071A2B]">AI-Generated Content Review</h2>
          {generated.length > 0 && <PrototypeTag />}
        </div>
        {loading ? (
          <div className="space-y-2">{[...Array(2)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl border border-border bg-muted" />)}</div>
        ) : generated.length > 0 ? (
          <div className="space-y-3">
            {generated.map((c) => (
              <div key={c.id} className="rounded-xl border border-border bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#071A2B]">{c.title}</h3>
                      <ReviewBadge status={c.status} />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Source: {c.source_title} · Format: {c.format?.replace("_", " ")} · Audience: {c.audience?.replace("_", " ")}
                    </div>
                    {c.unsupported_claims?.length > 0 && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                        ⚠ {c.unsupported_claims.length} unsupported claim(s)
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => handleContentAction(c, "editor_review")} className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-muted">
                      <RefreshCw className="h-3.5 w-3.5" /> Request Changes
                    </button>
                    <button onClick={() => handleContentAction(c, "rejected")} className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                    <button onClick={() => handleContentAction(c, "approved")} className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <CheckCircle className="mx-auto h-8 w-8 text-emerald-500" />
            <p className="mt-2 text-sm text-muted-foreground">You're all caught up — no AI content awaiting review.</p>
          </div>
        )}
      </div>

      {/* Asset review tasks */}
      <div className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-[#071A2B]">Asset Review Tasks</h2>
        {loading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl border border-border bg-muted" />)}</div>
        ) : filteredTasks.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Content</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.source || "Upload Centre"}</td>
                    <td className="px-4 py-3"><div className="font-medium text-[#071A2B]">{t.asset_title}</div></td>
                    <td className="px-4 py-3"><span className="rounded bg-secondary px-2 py-0.5 text-xs capitalize">{t.review_type}</span></td>
                    <td className="px-4 py-3"><ReviewBadge status={t.status === "pending" ? "draft" : t.status === "approved" ? "approved" : "editor_review"} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(t.created_date).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {t.status === "pending" && (
                          <>
                            <button onClick={() => handleAction(t, "changes_requested")} className="rounded-md border border-border p-1.5 text-amber-600 hover:bg-amber-50" title="Request changes"><RefreshCw className="h-3.5 w-3.5" /></button>
                            <button onClick={() => handleAction(t, "rejected")} className="rounded-md border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100" title="Reject"><XCircle className="h-3.5 w-3.5" /></button>
                            <button onClick={() => handleAction(t, "approved")} className="rounded-md border border-emerald-200 bg-emerald-50 p-1.5 text-emerald-600 hover:bg-emerald-100" title="Approve"><CheckCircle className="h-3.5 w-3.5" /></button>
                          </>
                        )}
                        {t.status !== "pending" && <span className="text-xs text-muted-foreground">{t.reviewer || "—"}</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <CheckCircle className="mx-auto h-8 w-8 text-emerald-500" />
            <p className="mt-2 text-sm text-muted-foreground">You're all caught up — no review tasks in this category.</p>
          </div>
        )}
      </div>

      {/* Comment modal */}
      {commentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-white p-5">
            <h3 className="text-base font-semibold text-[#071A2B]">
              {commentModal.action === "rejected" ? "Reject" : "Request Changes"} — Comment Required
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">A comment is required when requesting changes or rejecting.</p>
            <textarea
              value={commentModal.comment}
              onChange={(e) => setCommentModal({ ...commentModal, comment: e.target.value })}
              placeholder="Explain what needs to change…"
              rows={4}
              className="mt-3 w-full rounded-lg border border-border p-3 text-sm focus:border-[#4DA8D8] focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setCommentModal(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
              <button
                onClick={() => handleAction(commentModal.task, commentModal.action)}
                disabled={!commentModal.comment}
                className="rounded-lg bg-[#0B2942] px-4 py-2 text-sm font-semibold text-white hover:bg-[#071A2B] disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}