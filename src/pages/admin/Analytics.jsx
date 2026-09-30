import { db } from '@/api/base44Client';

import React from "react";
import { BarChart3, Search, TrendingUp, Eye, Clock, FileText, Tag, AlertTriangle, CheckCircle, GraduationCap, Globe, Database } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend as RLegend } from "recharts";

import { PrototypeTag } from "@/components/Badges";

export default function Analytics() {
  const [stats, setStats] = React.useState({ total: 0, approved: 0, open: 0 });
  const [typeData, setTypeData] = React.useState([]);
  const [accessData, setAccessData] = React.useState([]);
  const [regionData, setRegionData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const [total, approved, open, typeAgg, accessAgg, regionAgg] = await Promise.all([
          db.entities.Asset.count({}),
          db.entities.Asset.count({ review_status: "approved" }),
          db.entities.Asset.count({ access_class: "open" }),
          db.entities.Asset.aggregate({ groupBy: "content_type", count: true }),
          db.entities.Asset.aggregate({ groupBy: "access_class", count: true }),
          db.entities.Asset.aggregate({ groupBy: "region", count: true }),
        ]);
        setStats({ total: total || 0, approved: approved || 0, open: open || 0 });
        setTypeData((typeAgg?.rows || []).map((r) => ({ name: r.content_type, count: r.count })));
        setAccessData((accessAgg?.rows || []).map((r) => ({ name: (r.access_class || "unknown").toUpperCase(), value: r.count })));
        setRegionData((regionAgg?.rows || []).map((r) => ({ name: r.region, count: r.count })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const PIE_COLORS = ["#4DA8D8", "#6366F1", "#22C55E", "#EF4444", "#F59E0B", "#8B5CF6", "#14B8A6"];
  const BAR_COLOR = "#0B2942";
  const expeditionsByYear = [
    { year: "2019", expeditions: 1, assets: 2 },
    { year: "2020", expeditions: 0, assets: 1 },
    { year: "2021", expeditions: 1, assets: 3 },
    { year: "2022", expeditions: 1, assets: 5 },
    { year: "2023", expeditions: 2, assets: 8 },
    { year: "2024", expeditions: 1, assets: 7 },
  ];

  const metrics = [
    { label: "Top Searches", value: "sea ice, Antarctic expedition, Bharati station", icon: Search, sample: true },
    { label: "Zero-result Searches", value: "14 queries", icon: AlertTriangle, sample: true },
    { label: "Most-viewed Assets", value: `${stats.approved} approved records`, icon: Eye, sample: false },
    { label: "Pipeline Status", value: `${stats.total} total · ${stats.approved} approved`, icon: TrendingUp, sample: false },
    { label: "Search Latency", value: "0.42s avg (target: <1s)", icon: Clock, sample: true },
    { label: "Metadata Completeness", value: "92% (target: 90%+)", icon: FileText, sample: true },
    { label: "Citation Coverage", value: "88% of approved assets", icon: Tag, sample: true },
    { label: "Unsupported-claim Rate", value: "3.2% (target: 0%)", icon: AlertTriangle, sample: true },
    { label: "Approval Rate", value: "76% of submissions", icon: CheckCircle, sample: true },
    { label: "Avg Review Time", value: "2.3 days", icon: Clock, sample: true },
    { label: "Student Resource Usage", value: "1,240 views (sample)", icon: GraduationCap, sample: true },
    { label: "Popular Themes", value: "Cryosphere, Atmospheric Sci, Oceanography", icon: TrendingUp, sample: true },
    { label: "Geographic Spread", value: "Antarctica 45% · Arctic 30% · Himalaya 25%", icon: Globe, sample: true },
    { label: "Open Access Records", value: `${stats.open} records`, icon: Database, sample: false },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
            <BarChart3 className="h-6 w-6 text-[#4DA8D8]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#071A2B]">Analytics</h1>
            <p className="text-sm text-muted-foreground">Repository, search and outreach performance metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">Sample Data</span>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Assets by content type */}
        <div className="rounded-xl border border-border bg-white p-5">
          <h3 className="text-sm font-semibold text-[#071A2B]">Assets by Content Type</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={typeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <RTooltip contentStyle={{ borderRadius: 8, border: "1px solid #D9E3E8", fontSize: 12 }} />
              <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} name="Assets" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Access class distribution */}
        <div className="rounded-xl border border-border bg-white p-5">
          <h3 className="text-sm font-semibold text-[#071A2B]">Access Class Distribution</h3>
          {accessData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={accessData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} label={({ name, value }) => `${name}: ${value}`}>
                  {accessData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <RTooltip contentStyle={{ borderRadius: 8, border: "1px solid #D9E3E8", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">No data</div>
          )}
        </div>

        {/* Expeditions & assets over years */}
        <div className="rounded-xl border border-border bg-white p-5">
          <h3 className="text-sm font-semibold text-[#071A2B]">Expeditions & Assets Over Years <span className="ml-1 text-[10px] font-normal text-amber-600">(sample)</span></h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={expeditionsByYear} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <RTooltip contentStyle={{ borderRadius: 8, border: "1px solid #D9E3E8", fontSize: 12 }} />
              <RLegend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="expeditions" stroke="#4DA8D8" strokeWidth={2} dot={{ r: 4 }} name="Expeditions" />
              <Line type="monotone" dataKey="assets" stroke="#F4A340" strokeWidth={2} dot={{ r: 4 }} name="Assets" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Assets by region */}
        <div className="rounded-xl border border-border bg-white p-5">
          <h3 className="text-sm font-semibold text-[#071A2B]">Assets by Region</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={regionData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
              <RTooltip contentStyle={{ borderRadius: 8, border: "1px solid #D9E3E8", fontSize: 12 }} />
              <Bar dataKey="count" fill="#4DA8D8" radius={[0, 4, 4, 0]} name="Assets" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metric cards */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="rounded-xl border border-border bg-white p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="h-5 w-5 text-[#4DA8D8]" />
                </div>
                {m.sample && <PrototypeTag />}
              </div>
              <div className="mt-3 text-sm font-medium text-muted-foreground">{m.label}</div>
              <div className="mt-1 text-lg font-bold text-[#071A2B]">{loading ? "—" : m.value}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-2 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          <span><strong>SAMPLE DATA</strong> — These metrics are prototype values for demonstration. They do not represent real NCPOR statistics. Production analytics will be populated from actual usage data.</span>
        </div>
      </div>
    </div>
  );
}