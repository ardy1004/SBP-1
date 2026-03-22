import { Link } from "wouter";
import { AdminLayout } from "../components/AdminLayout";
import {
  mockLeads, mockContracts, mockSubmissions,
  mockAnalytics, mockPropertyTypes, mockLeadSources
} from "../data/mockData";
import { mockProperties } from "@/data/properties";
import { formatCurrency } from "@/lib/utils";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area
} from "recharts";
import {
  Home, Tag, CheckCircle, Users, Plus, FileSignature,
  BarChart3, TrendingUp, ArrowUpRight, Eye, Clock,
  FileText, Activity, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PIE_COLORS = ["#1E3A8A", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444", "#06B6D4"];

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendPositive = true,
  color,
  sub
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend: string;
  trendPositive?: boolean;
  color: string;
  sub?: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    blue:  { bg: "bg-blue-500/10",   text: "text-blue-600",   border: "border-blue-100" },
    green: { bg: "bg-green-500/10",  text: "text-green-600",  border: "border-green-100" },
    gold:  { bg: "bg-amber-500/10",  text: "text-amber-600",  border: "border-amber-100" },
    red:   { bg: "bg-red-500/10",    text: "text-red-600",    border: "border-red-100" },
  };
  const c = colorMap[color];
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border ${c.border} flex items-start gap-4 hover:shadow-md transition-shadow`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.bg}`}>
        <Icon className={`w-6 h-6 ${c.text}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</div>
        <div className="text-2xl font-extrabold text-gray-900 mt-1 leading-none">{value}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
        <div className={`text-xs font-semibold flex items-center gap-1 mt-1.5 ${trendPositive ? "text-green-600" : "text-red-500"}`}>
          <TrendingUp className="w-3 h-3" />
          {trend}
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-lg border border-gray-100 rounded-xl p-3 text-xs">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.name === "Revenue" ? formatCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const totalProps = mockProperties.length;
  const activeProps = mockProperties.filter(p => !p.badges.is_sold).length;
  const soldProps = mockProperties.filter(p => p.badges.is_sold).length;
  const newLeads = mockLeads.filter(l => l.status === "new").length;
  const hotLeads = mockLeads.filter(l => l.priority === "hot").length;
  const newSubmissions = mockSubmissions.filter(s => s.status === "new").length;
  const pendingContracts = mockContracts.filter(c => c.status === "pending_signature").length;
  const activeContracts = mockContracts.filter(c => c.status === "active").length;

  const latestMonth = mockAnalytics[mockAnalytics.length - 1];
  const prevMonth = mockAnalytics[mockAnalytics.length - 2];
  const revenueGrowth = prevMonth
    ? Math.round(((latestMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100)
    : 0;

  const activities = [
    { text: `Properti baru: ${mockProperties[0]?.title?.slice(0, 35) || "—"}`, time: "2 jam lalu", icon: Home },
    { text: `Lead baru: ${mockLeads.find(l => l.status === "new")?.name || "—"} (${mockLeads.find(l => l.status === "new")?.source || "—"})`, time: "4 jam lalu", icon: Users },
    { text: `Kontrak ditandatangani: ${mockContracts.find(c => c.status === "active")?.contract_number || "—"}`, time: "1 hari lalu", icon: FileSignature },
    { text: `Submission baru: ${mockSubmissions.find(s => s.status === "new")?.owner_name || "—"}`, time: "2 hari lalu", icon: FileText },
    { text: `Properti diupdate: ${mockProperties[1]?.title?.slice(0, 32) || "—"}`, time: "3 hari lalu", icon: Clock },
  ];

  return (
    <AdminLayout title="Dashboard Overview">

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Home}
          label="Total Properti"
          value={totalProps}
          sub={`${activeProps} tersedia`}
          trend={`+2 bulan ini`}
          color="blue"
        />
        <StatCard
          icon={Tag}
          label="Properti Aktif"
          value={activeProps}
          sub={`${activeProps} tersedia`}
          trend={`${activeProps} tersedia`}
          color="green"
        />
        <StatCard
          icon={CheckCircle}
          label="Terjual/Bulan"
          value={latestMonth.deals}
          sub={`+${revenueGrowth}%`}
          trend={`+${revenueGrowth}% dari bulan lalu`}
          color="gold"
        />
        <StatCard
          icon={Users}
          label="Lead Baru"
          value={newLeads}
          sub={`${newLeads} belum direspond`}
          trend={`${newLeads} belum direspond`}
          trendPositive={false}
          color="red"
        />
      </div>

      {/* Alert Bar */}
      {(newLeads > 0 || newSubmissions > 0 || pendingContracts > 0) && (
        <div className="flex flex-wrap gap-2 mb-5">
          {newLeads > 0 && (
            <Link href="/admin/leads">
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-red-100 transition-colors">
                <Activity className="w-4 h-4" />
                {newLeads} lead baru menunggu respons →
              </div>
            </Link>
          )}
          {newSubmissions > 0 && (
            <Link href="/admin/submissions">
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-amber-100 transition-colors">
                <FileText className="w-4 h-4" />
                {newSubmissions} form submission baru →
              </div>
            </Link>
          )}
          {pendingContracts > 0 && (
            <Link href="/admin/contracts">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-blue-100 transition-colors">
                <FileSignature className="w-4 h-4" />
                {pendingContracts} kontrak menunggu tanda tangan →
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-1">Lead per Bulan (6 Bulan Terakhir)</h3>
          <p className="text-xs text-gray-400 mb-4">6 bulan terakhir</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mockAnalytics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="leads" stroke="#1E3A8A" strokeWidth={2.5} dot={{ r: 4, fill: "#1E3A8A" }} name="Lead" activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="deals" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4, fill: "#F59E0B" }} name="Deal" activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-1">Properti per Tipe</h3>
          <p className="text-xs text-gray-400 mb-4">Distribusi listing aktif</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={mockPropertyTypes}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={75}
                innerRadius={35}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {mockPropertyTypes.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val, name) => [val, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-1">Lead Source Performance</h3>
          <p className="text-xs text-gray-400 mb-4">Total lead per saluran pemasaran</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockLeadSources} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="source" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="leads" fill="#1E3A8A" radius={[4, 4, 0, 0]} name="Lead">
                {mockLeadSources.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#1E3A8A" : i === 1 ? "#3B82F6" : i === 2 ? "#6366F1" : "#8B5CF6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3">Aktivitas Terbaru</h3>
          <div className="space-y-3">
            {activities.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-gray-700 font-medium leading-snug">{a.text}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{a.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Revenue Area Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
        <h3 className="font-bold text-gray-900 mb-1">Tren Revenue (6 Bulan Terakhir)</h3>
        <p className="text-xs text-gray-400 mb-4">Estimasi komisi dari properti terjual</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={mockAnalytics}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000000).toFixed(0)}jt`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#1E3A8A" strokeWidth={2.5} fill="url(#revGrad)" name="Revenue" activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row: Quick Actions + Revenue Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Tambah Properti", icon: Plus, path: "/admin/properties/add", color: "bg-[#1E3A8A]" },
              { label: "Lihat Lead", icon: Users, path: "/admin/leads", color: "bg-green-500", badge: newLeads },
              { label: "Kontrak Baru", icon: FileSignature, path: "/admin/contracts/new", color: "bg-[#F59E0B]" },
              { label: "Analytics", icon: BarChart3, path: "/admin/analytics", color: "bg-purple-500" },
            ].map(q => {
              const Icon = q.icon;
              return (
                <Link key={q.path} href={q.path}>
                  <div className={`${q.color} text-white rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity relative min-h-[80px] justify-center`}>
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-semibold text-center leading-tight">{q.label}</span>
                    {q.badge ? (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {q.badge}
                      </span>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: "Semua Properti", path: "/admin/properties", icon: Eye },
              { label: "Form Submission", path: "/admin/submissions", icon: FileText },
              { label: "Settings", path: "/admin/settings", icon: Activity },
            ].map(q => {
              const Icon = q.icon;
              return (
                <Link key={q.path} href={q.path}>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-[#1E3A8A] hover:text-[#1E3A8A] cursor-pointer transition-colors text-sm font-medium">
                    <Icon className="w-4 h-4" />
                    {q.label}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="bg-gradient-to-b from-[#1E3A8A] to-[#0f2461] rounded-2xl p-5 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-[#F59E0B]" />
              <span className="text-sm font-semibold opacity-80">Ringkasan Bulan Ini</span>
            </div>
            <div>
              <div className="text-xs opacity-60 mb-1">Total Komisi (Estimasi)</div>
              <div className="text-2xl font-extrabold">{formatCurrency(latestMonth.revenue)}</div>
              <div className="text-xs opacity-60 flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" />
                +{revenueGrowth}% dari bulan lalu
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs opacity-60">Properti Terjual</div>
                <div className="text-xl font-bold mt-0.5">{latestMonth.deals}</div>
                <div className="text-xs opacity-50">Mar 2026</div>
              </div>
              <div>
                <div className="text-xs opacity-60">Total Views</div>
                <div className="text-xl font-bold mt-0.5">{latestMonth.views}</div>
                <div className="text-xs opacity-50">bulan ini</div>
              </div>
            </div>
          </div>
          <Link href="/admin/analytics">
            <div className="mt-4 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-2.5 text-sm font-semibold text-center cursor-pointer flex items-center justify-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Lihat Analytics Lengkap
            </div>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
