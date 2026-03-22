import { useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { mockSubmissions, Submission } from "../data/mockData";
import { Eye, Check, X, FilePlus, MessageCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  reviewing: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  published: "bg-emerald-100 text-emerald-700",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Baru", reviewing: "Ditinjau", approved: "Disetujui",
  rejected: "Ditolak", published: "Dipublish",
};

function SubmissionDetailModal({ sub, onClose }: { sub: Submission; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">Detail Submission</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><div className="text-gray-500 font-medium">Nama Pemilik</div><div className="font-semibold text-gray-900 mt-0.5">{sub.owner_name}</div></div>
            <div><div className="text-gray-500 font-medium">WhatsApp</div>
              <a href={`https://wa.me/${sub.whatsapp}`} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline mt-0.5 block">{sub.whatsapp}</a>
            </div>
            <div><div className="text-gray-500 font-medium">Jenis Properti</div><div className="font-semibold text-gray-900 mt-0.5">{sub.property_type}</div></div>
            <div><div className="text-gray-500 font-medium">Lokasi</div><div className="font-semibold text-gray-900 mt-0.5">{sub.location}</div></div>
            <div><div className="text-gray-500 font-medium">Tanggal Submit</div><div className="font-semibold text-gray-900 mt-0.5">{new Date(sub.submitted_at).toLocaleString("id-ID")}</div></div>
            <div><div className="text-gray-500 font-medium">Status</div><span className={`text-xs font-bold px-2 py-1 rounded-full mt-0.5 inline-block ${STATUS_COLORS[sub.status]}`}>{STATUS_LABELS[sub.status]}</span></div>
            {sub.notes && <div className="col-span-2"><div className="text-gray-500 font-medium">Catatan</div><div className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-1">{sub.notes}</div></div>}
          </div>

          {/* Opsi Perjanjian */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-sm font-semibold text-blue-800 mb-1">Opsi Perjanjian Dipilih</div>
            <div className="text-sm text-blue-700">Open Listing (3% fee) — Standar</div>
          </div>

          {/* Upload Dokumen */}
          <div className="mt-3">
            <div className="text-sm font-semibold text-gray-700 mb-2">Dokumen Terlampir</div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600">
                <FileText className="w-4 h-4 text-gray-400" /> KTP_Pemilik.pdf
              </div>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600">
                <FileText className="w-4 h-4 text-gray-400" /> Sertifikat_Tanah.pdf
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <a href={`https://wa.me/${sub.whatsapp}?text=${encodeURIComponent("Halo, kami sudah menerima submission properti Anda dan sedang dalam proses peninjauan.")}`} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="gap-2"><MessageCircle className="w-4 h-4" />WhatsApp</Button>
            </a>
            <Button size="sm" className="gap-2 bg-green-500 hover:bg-green-600"><Check className="w-4 h-4" />Approve & Publish</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminSubmissions() {
  const { toast } = useToast();
  const [items, setItems] = useState<Submission[]>(mockSubmissions);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [confirmReject, setConfirmReject] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setItems(prev => prev.map(s => s.id === id ? { ...s, status: "approved" as const } : s));
    toast({ title: "Disetujui", description: "Submission berhasil disetujui." });
  };

  const handleReject = (id: string) => {
    if (confirmReject === id) {
      setItems(prev => prev.map(s => s.id === id ? { ...s, status: "rejected" as const } : s));
      toast({ title: "Ditolak", description: "Submission telah ditolak." });
      setConfirmReject(null);
    } else {
      setConfirmReject(id);
    }
  };

  const newCount = items.filter(s => s.status === "new").length;

  return (
    <AdminLayout title="Form Submission">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const count = items.filter(s => s.status === key).length;
          return (
            <div key={key} className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
              <div className="text-2xl font-extrabold text-gray-900">{count}</div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">{label}</div>
            </div>
          );
        })}
      </div>

      {newCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-blue-700 text-sm font-medium mb-4">
          Ada <strong>{newCount} submission baru</strong> yang belum ditinjau.
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Tanggal</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Nama Pemilik</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">WhatsApp</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Jenis</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Lokasi</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(s.submitted_at).toLocaleDateString("id-ID")}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900 text-sm">{s.owner_name}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">{s.whatsapp}</a>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-600">{s.property_type}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-600">{s.location}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLORS[s.status]}`}>{STATUS_LABELS[s.status]}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setSelected(s)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleApprove(s.id)} className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"><Check className="w-4 h-4" /></button>
                      <button onClick={() => handleReject(s.id)} className={`p-1.5 rounded-lg transition-colors ${confirmReject === s.id ? "text-white bg-red-500" : "text-gray-400 hover:text-red-500 hover:bg-red-50"}`}><X className="w-4 h-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><FilePlus className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selected && <SubmissionDetailModal sub={selected} onClose={() => setSelected(null)} />}
    </AdminLayout>
  );
}
