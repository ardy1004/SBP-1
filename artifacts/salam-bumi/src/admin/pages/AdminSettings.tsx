import { useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Building2, Bell, Shield, Search, Database, Save, Eye, EyeOff } from "lucide-react";

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="font-bold text-gray-900">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function AdminSettings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true, whatsapp: true, leadAlerts: true, dailySummary: false,
  });
  const [profile, setProfile] = useState({
    name: user?.name || "Monica Vera S",
    whatsapp: "6281391278889",
    email: "admin@salambumi.xyz",
    newPassword: "",
  });
  const [company, setCompany] = useState({
    name: "CV Salam Bumi Property",
    address: "Yogyakarta, DIY",
    phone: "0813-9127-8889",
    email: "info@salambumi.xyz",
    website: "https://salambumi.xyz",
    instagram: "@salambumiproperty",
  });
  const [seo, setSeo] = useState({
    defaultTitle: "Salam Bumi Property - Agen Properti Yogyakarta Terpercaya",
    defaultDesc: "Temukan properti impian Anda di Yogyakarta. Rumah, Kost, Tanah, Villa, Ruko dijual dan disewakan.",
    gaId: "G-XXXXXXXXXX",
  });

  const save = (section: string) => toast({ title: "Tersimpan!", description: `Pengaturan ${section} berhasil disimpan.` });

  return (
    <AdminLayout title="Settings">
      <div className="space-y-5">
        {/* Profile */}
        <Section title="Profil Admin" icon={User}>
          <div className="flex items-center gap-4 mb-5">
            <img src={user?.photo} alt={user?.name} className="w-16 h-16 rounded-full object-cover border-2 border-primary/20" />
            <div>
              <div className="font-bold text-gray-900">{user?.name}</div>
              <div className="text-sm text-gray-500">{user?.role}</div>
              <button className="text-xs text-primary hover:underline mt-1">Ganti Foto</button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nama Admin</Label>
              <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>No. WhatsApp</Label>
              <Input value={profile.whatsapp} onChange={e => setProfile(p => ({ ...p, whatsapp: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Password Baru</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={profile.newPassword} onChange={e => setProfile(p => ({ ...p, newPassword: e.target.value }))} className="pr-10" />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <Button onClick={() => save("profil")} className="mt-4 gap-2 bg-primary hover:bg-primary/90"><Save className="w-4 h-4" />Simpan Profil</Button>
        </Section>

        {/* Company */}
        <Section title="Informasi Perusahaan" icon={Building2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Nama Perusahaan</Label><Input value={company.name} onChange={e => setCompany(c => ({ ...c, name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Telepon</Label><Input value={company.phone} onChange={e => setCompany(c => ({ ...c, phone: e.target.value }))} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Alamat</Label><Input value={company.address} onChange={e => setCompany(c => ({ ...c, address: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Email Perusahaan</Label><Input type="email" value={company.email} onChange={e => setCompany(c => ({ ...c, email: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Website</Label><Input value={company.website} onChange={e => setCompany(c => ({ ...c, website: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Instagram</Label><Input value={company.instagram} onChange={e => setCompany(c => ({ ...c, instagram: e.target.value }))} /></div>
          </div>
          <Button onClick={() => save("perusahaan")} className="mt-4 gap-2 bg-primary hover:bg-primary/90"><Save className="w-4 h-4" />Simpan</Button>
        </Section>

        {/* Notifications */}
        <Section title="Pengaturan Notifikasi" icon={Bell}>
          <div className="space-y-3">
            {[
              { key: "email", label: "Notifikasi Email", desc: "Terima email untuk lead baru dan update" },
              { key: "whatsapp", label: "Notifikasi WhatsApp", desc: "Terima WA untuk lead urgent" },
              { key: "leadAlerts", label: "Alert Lead Baru", desc: "Notifikasi real-time setiap ada lead baru" },
              { key: "dailySummary", label: "Laporan Harian", desc: "Ringkasan aktivitas harian via email" },
            ].map(n => (
              <div key={n.key} className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{n.label}</div>
                  <div className="text-xs text-gray-500">{n.desc}</div>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, [n.key]: !prev[n.key as keyof typeof notifications] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${notifications[n.key as keyof typeof notifications] ? "bg-primary" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifications[n.key as keyof typeof notifications] ? "translate-x-5" : ""}`} />
                </button>
              </div>
            ))}
          </div>
          <Button onClick={() => save("notifikasi")} className="mt-4 gap-2 bg-primary hover:bg-primary/90"><Save className="w-4 h-4" />Simpan</Button>
        </Section>

        {/* SEO */}
        <Section title="Pengaturan SEO" icon={Search}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Default Meta Title <span className="text-xs text-gray-400">({seo.defaultTitle.length}/60)</span></Label>
              <Input value={seo.defaultTitle} onChange={e => setSeo(s => ({ ...s, defaultTitle: e.target.value }))} maxLength={70} />
              {seo.defaultTitle.length > 60 && <p className="text-xs text-red-500">Melebihi batas 60 karakter!</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Default Meta Description <span className="text-xs text-gray-400">({seo.defaultDesc.length}/160)</span></Label>
              <textarea value={seo.defaultDesc} onChange={e => setSeo(s => ({ ...s, defaultDesc: e.target.value }))} maxLength={180} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
              {seo.defaultDesc.length > 160 && <p className="text-xs text-red-500">Melebihi batas 160 karakter!</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Google Analytics ID</Label>
              <Input placeholder="G-XXXXXXXXXX" value={seo.gaId} onChange={e => setSeo(s => ({ ...s, gaId: e.target.value }))} />
            </div>
          </div>
          <Button onClick={() => save("SEO")} className="mt-4 gap-2 bg-primary hover:bg-primary/90"><Save className="w-4 h-4" />Simpan</Button>
        </Section>

        {/* Security */}
        <Section title="Keamanan & Session" icon={Shield}>
          <div className="space-y-3">
            {[
              { label: "2FA Authentication", desc: "Google Authenticator (Direkomendasikan untuk produksi)", status: "Belum aktif" },
              { label: "IP Whitelist", desc: "Batasi akses hanya dari IP tertentu", status: "Nonaktif" },
              { label: "Session Timeout", desc: "Auto-logout setelah 30 menit tidak aktif", status: "Aktif" },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{s.label}</div>
                  <div className="text-xs text-gray-500">{s.desc}</div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.status === "Aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Logout */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-red-600 mb-2">Logout</h3>
          <p className="text-sm text-gray-500 mb-4">Keluar dari sesi admin dashboard ini.</p>
          <Button onClick={logout} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">Logout Sekarang</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
