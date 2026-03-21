import { Link } from "wouter";
import { AdminLayout } from "../components/AdminLayout";
import { mockLeads, mockContracts, mockSubmissions, mockAnalytics, mockPropertyTypes, mockLeadSources } from "../data/mockData";
import { mockProperties } from "@/data/properties";
import { formatCurrency } from "@/lib/utils";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Home, Tag, CheckCircle, Users, Plus, FileSignature, BarChart3, TrendingUp, ArrowUpRight, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = ["#1E3A8A", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444"];

function StatCard({ icon: Icon, label, value, trend, color }: { icon: React.ElementType; label: string; value: string | number; trend: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-600", green: "bg-green-500/10 text-green-600",
    gold: "bg-amber-500/10 text-amber-600", red: "bg-red-500/10 text-red-600",
  };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <div className="text-sm text-gray-500 font-medium">{label}</div>
        <div className="text-2xl font-extrabold text-gray-900 mt-0.5">{value}</div>
        <div className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-1">
          <TrendingUp className="w-3 h-3" />{trend}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const totalProps = mockProperties.length;
  const activeProps = mockProperties.filter(p => !p.badges.is_sold).length;
  const soldProps = mockProperties.filter(p => p.badges.is_sold).length;
  const newLeads = mockLeads.filter(l => l.status === "new").length;

  const activities = [
    { text: "Properti baru ditambahkan: Rumah Mewah Hook Tropis", time: "2 jam lalu", icon: Home },
    { text: "Lead baru dari: Dewi Kurniawati (WhatsApp)", time: "4 jam lalu", icon: Users },
    { text: "Kontrak aktif: SBP-K2.05 Kost Babarsari", time: "1 hari lalu", icon: FileSignature },
    { text: "Form submission baru: Pak Agus Salim", time: "2 hari lalu", icon: Eye },
    { text: "Properti Tanah Kavling Godean diupdate", time: "3 hari lalu", icon: Clock },
  ];

  return (
    <AdminLayout title="Dashboard Overview">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Home} label="Total Properti" value={totalProps} trend={`+2 bulan ini`} color="blue" />
        <StatCard icon={Tag} label="Properti Aktif" value={activeProps} trend={`${activeProps} tersedia`} color="green" />
        <StatCard icon={CheckCircle} label="Terjual/Bulan" value={soldProps} trend="+25%" color="gold" />
        <StatCard icon={Users} label="Lead Baru" value={newLeads} trend={`${newLeads} belum direspond`} color="red" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Lead per Bulan (6 Bulan Terakhir)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mockAnalytics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="leads" stroke="#1E3A8A" strokeWidth={2.5} dot={{ r: 4, fill: "#1E3A8A" }} name="Lead" />
              <Line type="monotone" dataKey="deals" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4, fill: "#F59E0B" }} name="Deal" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Properti per Tipe</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={mockPropertyTypes} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, count }) => `${name}: ${count}`} labelLine={false}>
                {mockPropertyTypes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Lead Source Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockLeadSources}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="source" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="leads" fill="#1E3A8A" radius={[4, 4, 0, 0]} name="Lead" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Aktivitas Terbaru</h3>
          <div className="space-y-3">
            {activities.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-primary" />
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

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Tambah Properti", icon: Plus, path: "/admin/properties/add", color: "bg-primary" },
            { label: "Lihat Lead", icon: Users, path: "/admin/leads", color: "bg-green-500" },
            { label: "Kontrak Baru", icon: FileSignature, path: "/admin/contracts", color: "bg-secondary" },
            { label: "Analytics", icon: BarChart3, path: "/admin/analytics", color: "bg-purple-500" },
          ].map(q => {
            const Icon = q.icon;
            return (
              <Link key={q.path} href={q.path}>
                <div className={`${q.color} text-white rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity`}>
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-semibold text-center">{q.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="mt-4 bg-gradient-to-r from-primary to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium opacity-80">Total Komisi Bulan Ini (Estimasi)</div>
            <div className="text-3xl font-extrabold mt-1">{formatCurrency(420000000)}</div>
            <div className="text-sm opacity-70 flex items-center gap-1 mt-1"><ArrowUpRight className="w-4 h-4" />+50% dari bulan lalu</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium opacity-80">Properti Terjual</div>
            <div className="text-3xl font-extrabold mt-1">4</div>
            <div className="text-sm opacity-70">Mar 2026</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
