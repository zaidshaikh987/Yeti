import { db } from '@/api/base44Client';

import React from "react";
import { Link } from "react-router-dom";
import {
  Upload, ClipboardCheck, Sparkles, Send, BarChart3, Users, ScrollText,
  FileText, CheckCircle, Clock, AlertTriangle, ArrowRight, ShieldCheck,
  Boxes, Archive, FileCheck, Copy,
} from "lucide-react";

import { PrototypeTag } from "@/components/Badges";
import { formatDate } from "@/lib/polarSetu";

export default function AdminDashboard() {
  const [stats, setStats] = React.useState({ total: 0, approved: 0, pending: 0, draft: 0 });
  const [reviewTasks, setReviewTasks] = React.useState([]);
  const [generated, setGenerated] = React.useState([]);
  const [audit, setAudit] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const [total, approved, pending, draft, tasks, gen, aud] = await Promise.all([
          db.entities.Asset.count({}),
          db.entities.Asset.count({ review_status: "approved" }),
          db.entities.Asset.count({ review_status: { $in: ["draft", "editor_review", "scientific_review"] } }),
          db.entities.Asset.count({ review_status: "draft" }),
          db.entities.ReviewTask.filter({ status: "pending" }, { limit: 5, sort: "-created_date" }),
          db.entities.GeneratedContent.filter({}, { limit: 5, sort: "-created_date" }),
          db.entities.AuditLog.filter({}, { limit: 8, sort: "-created_date" }),
        ]);
        setStats({ total: total || 0, approved: approved || 0, pending: pending || 0, draft: draft || 0 });
        setReviewTasks(tasks.items || []);
        setGenerated(gen.items || []);
        setAudit(aud.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = [
    { label: "Ingestion Queue", value: stats.draft, desc: "Assets in draft / processing", icon: Upload, path: "/admin/upload", color: "from-blue-500 to-blue-600" },
    { label: "Review Queue", value: stats.pending, desc: "Pending review tasks", icon: ClipboardCheck, path: "/admin/review", color: "from-amber-500 to-orange-500" },
    { label: "AI Content", value: generated.length, desc: "Generated content items", icon: Sparkles, path: "/admin/ai-studio", color: "from-purple-500 to-indigo-500" },
    { label: "Publishing", value: "—", desc: "Pipeline & calendar", icon: Send, path: "/admin/publishing", color: "from-teal-500 to-cyan-500" },
    { label: "Analytics", value: "—", desc: "Search & usage metrics", icon: BarChart3, path: "/admin/analytics", color: "from-slate-500 to-slate-600" },
    { label: "Users & Roles", value: "—", desc: "RBAC management", icon: Users, path: "/admin/users", color: "from-indigo-500 to-blue-500" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#071A2B]">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Operational overview of the PolarSetu knowledge pipeline</p>
        </div>
        <PrototypeTag />
      </div>

      {/* Top cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} to={c.path} className="group flex items-center gap-4 rounded-xl border border-border bg-white p-5 transition-all hover:border-[#4DA8D8]/40 hover:shadow-md">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${c.color} text-white`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-2xl font-bold text-[#071A2B]">{loading ? "—" : c.value}</div>
                <div className="text-sm font-medium text-foreground">{c.label}</div>
                <div className="text-xs text-muted-foreground">{c.desc}</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Ingestion status */}
        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="text-base font-semibold text-[#071A2B]">Ingestion Status</h2>
          <div className="mt-4 space-y-3">
            {[
              { label: "Uploaded", value: stats.total, color: "bg-blue-500" },
              { label: "Processing", value: "—", color: "bg-amber-500" },
              { label: "OCR", value: "—", color: "bg-purple-500" },
              { label: "Needs Review", value: stats.pending, color: "bg-orange-500" },
              { label: "Approved", value: stats.approved, color: "bg-emerald-500" },
              { label: "Failed", value: 0, color: "bg-red-500" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                <span className="flex-1 text-sm text-muted-foreground">{s.label}</span>
                <span className="text-sm font-semibold text-[#071A2B]">{loading ? "—" : s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review status */}
        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="text-base font-semibold text-[#071A2B]">Review Status</h2>
          <div className="mt-4 space-y-3">
            {[
              { label: "Pending", value: reviewTasks.length, color: "bg-amber-500" },
              { label: "Changes Requested", value: 0, color: "bg-orange-500" },
              { label: "Scientific Review", value: 0, color: "bg-indigo-500" },
              { label: "Approved", value: stats.approved, color: "bg-emerald-500" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                <span className="flex-1 text-sm text-muted-foreground">{s.label}</span>
                <span className="text-sm font-semibold text-[#071A2B]">{loading ? "—" : s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Publishing pipeline */}
        <div className="rounded-xl border border-border bg-white p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-[#071A2B]">Publishing Pipeline</h2>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {["Draft", "AI Generated", "Editor Review", "Scientific Review", "Approved", "Scheduled", "Published"].map((stage, i, arr) => (
              <React.Fragment key={stage}>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2">
                  <span className="text-xs font-semibold text-[#071A2B]">{stage}</span>
                </div>
                {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </React.Fragment>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Publishing is technically blocked unless content reaches <strong>Approved</strong> state.</p>
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-6 rounded-xl border border-border bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#071A2B]">Recent Activity</h2>
          <Link to="/admin/audit" className="text-sm font-medium text-[#4DA8D8] hover:underline">View audit log →</Link>
        </div>
        {loading ? (
          <div className="mt-4 space-y-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />)}
          </div>
        ) : audit.length > 0 ? (
          <div className="mt-4 space-y-2">
            {audit.map((log) => (
              <div key={log.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-[#4DA8D8]">
                  {log.actor?.[0]?.toUpperCase() || "S"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-foreground">
                    <span className="font-semibold">{log.actor}</span> · <span className="text-muted-foreground">{log.action.replace(/_/g, " ")}</span>
                    {log.target && <> — {log.target}</>}
                  </div>
                  {log.details && <div className="text-xs text-muted-foreground">{log.details}</div>}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDate(log.created_date)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No activity recorded yet. Actions across the admin portal will appear here.</p>
        )}
      </div>
    </div>
  );
}