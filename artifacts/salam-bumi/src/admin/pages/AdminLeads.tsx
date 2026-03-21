import { useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { mockLeads, Lead } from "../data/mockData";
import { Search, Eye, MessageCircle, Calendar, FileText, ChevronDown, Flame, Sun, Snowflake, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  viewing_scheduled: "bg-purple-100 text-purple-700",
  negotiating: "bg-orange-100 text-orange-700",
  closed_won: "bg-green-100 text-green-700",
  closed_lost: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Baru", contacted: "Dihubungi", viewing_scheduled: "Jadwal Kunjungan",
  negotiating: "Negosiasi", closed_won: "Deal", closed_lost: "Gagal",
};

const PRIORITY_ICON: Record<string, React.ElementType> = {
  hot: Flame, warm: Sun, cold: Snowflake,
};
const PRIORITY_COLOR: Record<string, string> = {
  hot: "text-red-500", warm: "text-amber-500", cold: "text-blue-400",
};

function LeadDetailModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { toast } = useToast();
  const [note, setNote] = useState(lead.notes);
  const [status, setStatus] = useState(lead.status);

  const handleWA = () => {
    const msg = `Halo ${lead.name}! Terima kasih telah menghubungi Salam Bumi Property. Kami telah menerima inquiry Anda untuk properti ${lead.property_interest}. Admin kami akan segera merespons.`;
    window.open(`https://wa.me/${lead.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">Detail Lead</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">{lead.name.charAt(0)}</div>
            <div>
              <div className="font-bold text-gray-900">{lead.name}</div>
              <div className="text-sm text-gray-500">{lead.origin} · {lead.role}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><div className="text-gray-500 font-medium">WhatsApp</div><div className="font-semibold text-gray-900">{lead.whatsapp}</div></div>
            <div><div className="text-gray-500 font-medium">Sumber</div><div className="font-semibold text-gray-900">{lead.source}</div></div>
            <div><div className="text-gray-500 font-medium">Budget</div><div className="font-semibold text-gray-900">{lead.budget}</div></div>
            <div><div className="text-gray-500 font-medium">Pembayaran</div><div className="font-semibold text-gray-900">{lead.payment_plan}</div></div>
            <div className="col-span-2"><div className="text-gray-500 font-medium">Properti Diminati</div><div className="font-semibold text-gray-900">{lead.property_interest}</div></div>
            <div className="col-span-2"><div className="text-gray-500 font-medium">Pesan</div><div className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-1">{lead.message}</div></div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Status Lead</label>
            <select value={status} onChange={e => setStatus(e.target.value as Lead["status"])} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
              {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Catatan Internal</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Tambahkan catatan..." />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleWA} className="flex-1 gap-2 bg-[#25D366] hover:bg-[#20bf5a]">
              <MessageCircle className="w-4 h-4" /> Kirim WhatsApp
            </Button>
            <Button onClick={() => { toast({ title: "Tersimpan", description: "Perubahan lead berhasil disimpan." }); onClose(); }} className="flex-1 bg-primary hover:bg-primary/90">
              Simpan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLeads() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filtered = mockLeads.filter(l => {
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.whatsapp.includes(search) || l.property_interest.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || l.status === statusFilter;
    const matchPriority = priorityFilter === "All" || l.priority === priorityFilter.toLowerCase();
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <AdminLayout title="Lead Management">
      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const count = mockLeads.filter(l => l.status === key).length;
          return (
            <div key={key} className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
              <div className="text-xl font-extrabold text-gray-900">{count}</div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">{label}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Cari nama, WhatsApp, atau properti..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="All">Semua Status</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
          {["All", "HOT", "WARM", "COLD"].map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Priority</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Nama</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Properti</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Budget</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Sumber</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(l => {
                const PriorityIcon = PRIORITY_ICON[l.priority];
                return (
                  <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <PriorityIcon className={`w-5 h-5 ${PRIORITY_COLOR[l.priority]}`} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 text-sm">{l.name}</div>
                      <div className="text-xs text-gray-400">{l.origin} · {l.role}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-sm text-gray-700 truncate max-w-[180px]">{l.property_interest}</div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="text-sm text-gray-700">{l.budget}</div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="text-sm text-gray-500">{l.source}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLORS[l.status]}`}>{STATUS_LABELS[l.status]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setSelectedLead(l)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Detail">
                          <Eye className="w-4 h-4" />
                        </button>
                        <a href={`https://wa.me/${l.whatsapp}`} target="_blank" rel="noreferrer">
                          <button className="p-1.5 text-gray-400 hover:text-[#25D366] hover:bg-green-50 rounded-lg transition-colors" title="WhatsApp">
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Tidak ada lead ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLead && <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />}
    </AdminLayout>
  );
}
