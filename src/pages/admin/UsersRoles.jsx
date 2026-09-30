import { db } from '@/api/base44Client';

import React from "react";
import { Users, Search, ShieldCheck, Plus, MoreVertical, CheckCircle, XCircle, Clock } from "lucide-react";

import { ROLES } from "@/lib/polarSetu";
import { PrototypeTag } from "@/components/Badges";
import { cn } from "@/lib/utils";

const PERMISSION_MATRIX = [
  { permission: "Manage Users & Roles", roles: ["super_admin"] },
  { permission: "System Configuration", roles: ["super_admin"] },
  { permission: "Upload Assets", roles: ["super_admin", "repository_admin"] },
  { permission: "Edit Metadata", roles: ["super_admin", "repository_admin"] },
  { permission: "Resolve Duplicates", roles: ["super_admin", "repository_admin"] },
  { permission: "Manage Access Classes", roles: ["super_admin", "repository_admin"] },
  { permission: "Generate AI Drafts", roles: ["super_admin", "communication_editor"] },
  { permission: "Edit AI Drafts", roles: ["super_admin", "communication_editor"] },
  { permission: "Schedule Content", roles: ["super_admin", "communication_editor"] },
  { permission: "Export Content", roles: ["super_admin", "communication_editor"] },
  { permission: "Review Scientific Accuracy", roles: ["super_admin", "scientific_reviewer"] },
  { permission: "Approve / Reject", roles: ["super_admin", "scientific_reviewer"] },
  { permission: "Request Changes", roles: ["super_admin", "scientific_reviewer"] },
  { permission: "Create Lessons & Quizzes", roles: ["super_admin", "teacher_coordinator"] },
  { permission: "View Audit Logs", roles: ["super_admin", "read_only_auditor"] },
  { permission: "View Dashboard", roles: ["super_admin", "repository_admin", "communication_editor", "scientific_reviewer", "teacher_coordinator", "read_only_auditor"] },
];

const ROLE_KEYS = ["super_admin", "repository_admin", "communication_editor", "scientific_reviewer", "teacher_coordinator", "read_only_auditor"];

export default function UsersRoles() {
  const [users, setUsers] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [showInvite, setShowInvite] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState("user");
  const [toast, setToast] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        const res = await db.entities.User.list({ limit: 100 });
        setUsers(res.items || []);
      } catch (e) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    try {
      await db.users.inviteUser(inviteEmail, inviteRole === "super_admin" ? "admin" : "user");
      await db.entities.AuditLog.create({
        actor: "Super Administrator",
        action: "role_change",
        target: inviteEmail,
        target_type: "user",
        details: `Invited user with role: ${ROLES[inviteRole]?.label || inviteRole}`,
        is_prototype: true,
      });
      showToast(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setShowInvite(false);
    } catch (e) {
      showToast("Failed to send invitation.");
    }
  };

  const filtered = users.filter((u) => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
            <Users className="h-6 w-6 text-[#4DA8D8]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#071A2B]">Users & Roles</h1>
            <p className="text-sm text-muted-foreground">Manage user accounts, roles and permissions (RBAC)</p>
          </div>
        </div>
        <button onClick={() => setShowInvite(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#0B2942] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#071A2B]">
          <Plus className="h-4 w-4" /> Invite User
        </button>
      </div>

      {toast && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle className="h-4 w-4" /> {toast}
        </div>
      )}

      {/* Users table */}
      <div className="mt-6">
        <div className="mb-3 relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            className="w-full rounded-lg border border-border bg-white py-2.5 pl-11 pr-4 text-sm focus:border-[#4DA8D8] focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl border border-border bg-muted" />)}</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="hidden px-4 py-3 md:table-cell">Department</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const roleConfig = ROLES[u.role] || ROLES.user;
                  return (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B2942] text-xs font-semibold text-white">
                            {u.full_name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="font-medium text-[#071A2B]">{u.full_name || "Unnamed"}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold", roleConfig.color)}>
                          <ShieldCheck className="h-3 w-3" /> {roleConfig.label}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{u.department || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1 text-xs font-medium", u.status === "active" ? "text-emerald-600" : "text-amber-600")}>
                          {u.status === "active" ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                          {u.status || "active"}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">{u.last_active || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">No users found. Invite team members to get started.</p>
          </div>
        )}
      </div>

      {/* Permission matrix */}
      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-base font-semibold text-[#071A2B]">Permission Matrix</h2>
          <PrototypeTag />
        </div>
        <div className="overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Permission</th>
                {ROLE_KEYS.map((r) => (
                  <th key={r} className="px-3 py-3 text-center" title={ROLES[r].label}>
                    {ROLES[r].label.split(" ")[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_MATRIX.map((row) => (
                <tr key={row.permission} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium text-[#071A2B]">{row.permission}</td>
                  {ROLE_KEYS.map((r) => (
                    <td key={r} className="px-3 py-2.5 text-center">
                      {row.roles.includes(r) ? (
                        <CheckCircle className="mx-auto h-4 w-4 text-emerald-600" />
                      ) : (
                        <XCircle className="mx-auto h-4 w-4 text-border" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-white p-5">
            <h3 className="text-base font-semibold text-[#071A2B]">Invite User</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="name@ncpor.gov.in" className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-[#4DA8D8] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Role</label>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-[#4DA8D8] focus:outline-none">
                  {Object.entries(ROLES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowInvite(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
              <button onClick={handleInvite} disabled={!inviteEmail} className="rounded-lg bg-[#0B2942] px-4 py-2 text-sm font-semibold text-white hover:bg-[#071A2B] disabled:opacity-50">Send Invitation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}