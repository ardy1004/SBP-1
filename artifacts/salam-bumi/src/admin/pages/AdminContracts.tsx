import { useState, useRef } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { mockContracts, Contract } from "../data/mockData";
import { Eye, Edit, Download, RefreshCw, X, PenLine, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import SignatureCanvas from "react-signature-canvas";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending_signature: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
  terminated: "bg-red-200 text-red-800",
};
const STATUS_LABELS: Record<string, string> = {
  draft: "Draft", pending_signature: "Pending Signature",
  active: "Aktif", expired: "Expired", terminated: "Diberhentikan",
};
const CONTRACT_TYPE_LABELS: Record<string, string> = {
  OPEN_LISTING: "Open Listing",
  EXCLUSIVE_BOOSTER: "Exclusive Booster",
  EXCLUSIVE_COMPANY: "Exclusive Company",
};

function SignatureModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const sigRef = useRef<SignatureCanvas | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [ownerName, setOwnerName] = useState("");

  const handleSave = () => {
    if (!agreed) { toast({ title: "Persetujuan diperlukan", description: "Centang kotak persetujuan terlebih dahulu.", variant: "destructive" }); return; }
    if (!ownerName) { toast({ title: "Nama diperlukan", description: "Masukkan nama pemilik.", variant: "destructive" }); return; }
    if (sigRef.current?.isEmpty()) { toast({ title: "Tanda tangan diperlukan", description: "Silakan buat tanda tangan.", variant: "destructive" }); return; }
    toast({ title: "Kontrak ditandatangani!", description: `Tanda tangan dari ${ownerName} berhasil disimpan. Kontrak diaktifkan.` });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2"><PenLine className="w-5 h-5 text-primary" />Tanda Tangan Digital</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-5">
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 border border-gray-200">
            <p className="font-bold text-gray-900 mb-2">PERJANJIAN JASA PEMASARAN</p>
            <p>Dengan menandatangani dokumen ini, pemilik properti menyatakan setuju dengan syarat dan ketentuan jasa pemasaran Salam Bumi Property, termasuk ketentuan fee/komisi dan masa kontrak yang telah disepakati.</p>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Nama Pemilik / Pihak II</Label>
            <Input placeholder="Nama lengkap pemilik properti" value={ownerName} onChange={e => setOwnerName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Tanda Tangan Pemilik</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50">
              <SignatureCanvas
                ref={sigRef}
                penColor="#1E3A8A"
                canvasProps={{ className: "w-full", height: 180 }}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => sigRef.current?.clear()} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Hapus
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input type="checkbox" id="agree" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-primary" />
            <label htmlFor="agree" className="text-sm text-gray-700 cursor-pointer">Saya setuju dengan syarat dan ketentuan yang berlaku dalam perjanjian jasa pemasaran ini.</label>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">Batal</Button>
            <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 gap-2">
              <PenLine className="w-4 h-4" /> Tandatangani Kontrak
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminContracts() {
  const { toast } = useToast();
  const [showSignature, setShowSignature] = useState(false);
  const [confirmTerminate, setConfirmTerminate] = useState<string | null>(null);

  const activeCount = mockContracts.filter(c => c.status === "active").length;
  const pendingCount = mockContracts.filter(c => c.status === "pending_signature").length;
  const expiredCount = mockContracts.filter(c => c.status === "expired").length;

  return (
    <AdminLayout title="Perjanjian & Kontrak">
      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div key={key} className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-extrabold text-gray-900">{mockContracts.filter(c => c.status === key).length}</div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-yellow-700 text-sm font-medium mb-4">
          <strong>{pendingCount} kontrak</strong> menunggu tanda tangan.{" "}
          <button onClick={() => setShowSignature(true)} className="underline font-bold">Tandatangani sekarang</button>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <Button onClick={() => toast({ title: "Kontrak baru", description: "Form kontrak baru akan segera tersedia." })} className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Buat Kontrak Baru
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">No. Kontrak</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Nama Owner</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Properti</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Jenis</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Fee</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockContracts.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-sm text-gray-900">{c.contract_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{c.owner_name}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600 max-w-[180px] truncate">{c.property_title}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-600">{CONTRACT_TYPE_LABELS[c.contract_type]}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm font-bold text-primary">{c.fee_percent}%</td>
                  <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLORS[c.status]}`}>{STATUS_LABELS[c.status]}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {c.status === "pending_signature" && (
                        <button onClick={() => setShowSignature(true)} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Tandatangani">
                          <PenLine className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Lihat">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => toast({ title: "Download PDF", description: "Mengunduh kontrak..." })} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Download PDF">
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={() => toast({ title: "Perpanjang", description: "Kontrak diperpanjang." })} className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Perpanjang">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      {c.status !== "terminated" && (
                        <button
                          onClick={() => { if (confirmTerminate === c.id) { toast({ title: "Kontrak dihentikan" }); setConfirmTerminate(null); } else { setConfirmTerminate(c.id); } }}
                          className={`p-1.5 rounded-lg transition-colors ${confirmTerminate === c.id ? "text-white bg-red-500" : "text-gray-400 hover:text-red-500 hover:bg-red-50"}`}
                          title="Hentikan"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showSignature && <SignatureModal onClose={() => setShowSignature(false)} />}
    </AdminLayout>
  );
}
