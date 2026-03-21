import { AdminLayout } from "../components/AdminLayout";
import { mockAnalytics, mockPropertyTypes, mockLeadSources } from "../data/mockData";
import { formatCurrency } from "@/lib/utils";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, Eye, Users, ShoppingCart, DollarSign } from "lucide-react";

const COLORS = ["#1E3A8A", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444"];

const funnelData = [
  { stage: "Views", count: 2750, color: "#1E3A8A" },
  { stage: "Inquiries", count: 113, color: "#3B82F6" },
  { stage: "Viewings", count: 42, color: "#F59E0B" },
  { stage: "Negotiations", count: 18, color: "#F97316" },
  { stage: "Deals", count: 13, color: "#10B981" },
];

function MetricCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string; sub: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-600", green: "bg-green-500/10 text-green-600",
    gold: "bg-amber-500/10 text-amber-600", purple: "bg-purple-500/10 text-purple-600",
  };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-sm text-gray-500 font-medium">{label}</div>
        <div className="text-2xl font-extrabold text-gray-900 mt-0.5">{value}</div>
        <div className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-1">
          <TrendingUp className="w-3 h-3" />{sub}
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const totalRevenue = mockAnalytics.reduce((a, b) => a + b.revenue, 0);
  const totalLeads = mockAnalytics.reduce((a, b) => a + b.leads, 0);
  const totalDeals = mockAnalytics.reduce((a, b) => a + b.deals, 0);
  const totalViews = mockAnalytics.reduce((a, b) => a + b.views, 0);

  return (
    <AdminLayout title="Analytics & Performance">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard icon={Eye} label="Total Views" value={totalViews.toLocaleString("id-ID")} sub="+18% vs periode lalu" color="blue" />
        <MetricCard icon={Users} label="Total Leads" value={totalLeads.toString()} sub="+22% vs periode lalu" color="gold" />
        <MetricCard icon={ShoppingCart} label="Total Deals" value={totalDeals.toString()} sub="+30% vs periode lalu" color="green" />
        <MetricCard icon={DollarSign} label="Total Komisi" value={formatCurrency(totalRevenue)} sub="+25% vs periode lalu" color="purple" />
      </div>

      {/* Traffic & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Views & Lead per Bulan</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockAnalytics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="views" stroke="#1E3A8A" fill="#1E3A8A20" strokeWidth={2} name="Views" />
              <Area type="monotone" dataKey="leads" stroke="#F59E0B" fill="#F59E0B20" strokeWidth={2} name="Leads" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Revenue Komisi (12 Bulan)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockAnalytics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000000).toFixed(0)}jt`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="#1E3A8A" radius={[4, 4, 0, 0]} name="Komisi (Rp)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Property Types Pie */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Properti per Tipe</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={mockPropertyTypes} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, count }) => `${name}(${count})`} labelLine={false} fontSize={10}>
                {mockPropertyTypes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Sources */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Lead per Sumber</h3>
          <div className="space-y-3">
            {mockLeadSources.map((s, i) => {
              const max = Math.max(...mockLeadSources.map(x => x.leads));
              const pct = Math.round((s.leads / max) * 100);
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{s.source}</span>
                    <span className="font-bold text-gray-900">{s.leads}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Lead Conversion Funnel</h3>
          <div className="space-y-2">
            {funnelData.map((f, i) => {
              const maxCount = funnelData[0].count;
              const pct = Math.round((f.count / maxCount) * 100);
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-xs font-semibold text-gray-500 w-24 shrink-0">{f.stage}</div>
                  <div className="flex-1 h-6 bg-gray-50 rounded-lg overflow-hidden flex items-center">
                    <div className="h-full rounded-lg flex items-center justify-end pr-2 transition-all" style={{ width: `${pct}%`, backgroundColor: f.color }}>
                      <span className="text-white text-xs font-bold">{f.count.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Conversion Rate: <strong className="text-green-600">{((funnelData[4].count / funnelData[0].count) * 100).toFixed(1)}%</strong>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
