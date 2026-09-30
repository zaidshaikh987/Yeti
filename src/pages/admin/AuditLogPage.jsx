import { db } from '@/api/base44Client';

import React from "react";
import { ScrollText, Search, Filter, User, FileText, Sparkles, CheckCircle, XCircle, RefreshCw, Upload, Edit, Send, ShieldCheck, Lock, Users as UsersIcon } from "lucide-react";

import { PrototypeTag } from "@/components/Badges";
import { formatDate } from "@/lib/polarSetu";
import { cn } from "@/lib/utils";

const ACTION_ICONS = {
  upload: Upload, edit: Edit, metadata_change: Edit, ai_generation: Sparkles,
  review: RefreshCw, approval: CheckCircle, rejection: XCircle, publication: Send,
  access_request: Lock, role_change: UsersIcon, login: ShieldCheck, security: ShieldCheck,
};

export default function AuditLog() {
  const [logs, setLogs] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState("all");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await db.entities.AuditLog.filter({}, { sort: "-created_date", limit: 100 });
        setLogs(res.items || []);
      } catch (e) {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = logs.filter((l) => {
    if (actionFilter !== "all" && l.action !== actionFilter) return false;
    if (search && !l.actor?.toLowerCase().includes(search.toLowerCase()) && !l.target?.toLowerCase().includes(search.toLowerCase()) && !l.details?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const actions = ["all", "upload", "edit", "metadata_change", "ai_generation", "review", "approval", "rejection", "publication", "access_request", "role_change", "login"];

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
          <ScrollText className="h-6 w-6 text-[#4DA8D8]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#071A2B]">Audit Log</h1>
          <p className="text-sm text-muted-foreground">Chronological trail of all actions across the PolarSetu platform</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor, target, or details…"
            className="w-full rounded-lg border border-border bg-white py-2.5 pl-11 pr-4 text-sm focus:border-[#4DA8D8] focus:outline-none"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:border-[#4DA8D8] focus:outline-none"
        >
          {actions.map((a) => <option key={a} value={a}>{a === "all" ? "All Actions" : a.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="mt-6 space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg border border-border bg-muted" />)}</div>
      ) : filtered.length > 0 ? (
        <div className="mt-6 space-y-2">
          {filtered.map((log) => {
            const Icon = ACTION_ICONS[log.action] || FileText;
            return (
              <div key={log.id} className="flex items-start gap-3 rounded-lg border border-border bg-white p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <Icon className="h-4 w-4 text-[#4DA8D8]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[#071A2B]">{log.actor}</span>
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{log.action.replace(/_/g, " ")}</span>
                    {log.is_prototype && <PrototypeTag />}
                  </div>
                  {log.target && <div className="mt-0.5 text-sm text-foreground">{log.target}{log.target_type && <span className="text-muted-foreground"> ({log.target_type})</span>}</div>}
                  {log.details && <div className="mt-0.5 text-xs text-muted-foreground">{log.details}</div>}
                  {log.before_value && log.after_value && (
                    <div className="mt-1.5 flex items-center gap-2 text-xs">
                      <span className="rounded bg-red-50 px-2 py-0.5 text-red-700 line-through">{log.before_value}</span>
                      <span>→</span>
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">{log.after_value}</span>
                    </div>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDate(log.created_date)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-border p-12 text-center">
          <ScrollText className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No audit entries match your search.</p>
          <p className="text-xs text-muted-foreground">Actions performed across the admin portal will be recorded here automatically.</p>
        </div>
      )}
    </div>
  );
}