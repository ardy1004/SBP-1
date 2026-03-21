import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Home, FileText, FileSignature, Users, BarChart3,
  Settings, LogOut, ChevronDown, ChevronRight, Menu, X, Bell,
  Plus, ChevronLeft, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  danger?: boolean;
  badge?: number;
  subitems?: { label: string; path: string }[];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  {
    icon: Home, label: "Kelola Properti", path: "/admin/properties",
    subitems: [
      { label: "Semua Properti", path: "/admin/properties" },
      { label: "Tambah Properti", path: "/admin/properties/add" },
    ]
  },
  { icon: FileText, label: "Form Submission", path: "/admin/submissions", badge: 2 },
  { icon: FileSignature, label: "Perjanjian & Kontrak", path: "/admin/contracts", badge: 1 },
  { icon: Users, label: "Lead Management", path: "/admin/leads", badge: 4 },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

function SidebarLink({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate: () => void }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const isActive = location.startsWith(item.path);
  const Icon = item.icon;

  if (item.subitems) {
    return (
      <div>
        <button
          onClick={() => setOpen(o => !o)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive ? "bg-primary/20 text-white" : "text-gray-300 hover:bg-white/10 hover:text-white"}`}
        >
          <Icon className="w-5 h-5 shrink-0" />
          {!collapsed && <><span className="flex-1 text-left">{item.label}</span>{open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</>}
        </button>
        {!collapsed && open && (
          <div className="ml-8 mt-1 space-y-1">
            {item.subitems.map(sub => (
              <Link key={sub.path} href={sub.path} onClick={onNavigate}>
                <span className={`block px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${location === sub.path ? "bg-primary/30 text-white font-semibold" : "text-gray-400 hover:text-white hover:bg-white/10"}`}>{sub.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href={item.path} onClick={onNavigate}>
      <span className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium cursor-pointer ${isActive ? "bg-primary/20 text-white" : item.danger ? "text-red-400 hover:bg-red-500/20 hover:text-red-300" : "text-gray-300 hover:bg-white/10 hover:text-white"}`}>
        <Icon className="w-5 h-5 shrink-0" />
        {!collapsed && <span className="flex-1">{item.label}</span>}
        {!collapsed && item.badge ? <span className="bg-accent text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{item.badge}</span> : null}
      </span>
    </Link>
  );
}

export function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, []);

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col bg-[#1F2937] transition-all duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${collapsed ? "w-16" : "w-64"}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-white font-extrabold text-sm leading-tight">SALAM BUMI</div>
              <div className="text-secondary text-xs font-semibold">PROPERTY</div>
            </div>
          )}
          <button onClick={() => setCollapsed(c => !c)} className="ml-auto text-gray-400 hover:text-white hidden lg:block">
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Admin Profile */}
        {!collapsed && (
          <div className="px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <img src={user?.photo} alt={user?.name} className="w-10 h-10 rounded-full object-cover border-2 border-secondary" />
              <div className="min-w-0">
                <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
                <div className="text-gray-400 text-xs truncate">{user?.role}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <SidebarLink key={item.path} item={item} collapsed={collapsed} onNavigate={() => setSidebarOpen(false)} />
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2 py-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center gap-4 shrink-0 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-gray-900">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1 truncate">{title}</h1>
          <Link href="/admin/properties/add">
            <Button size="sm" className="hidden sm:flex gap-2 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Tambah Properti</span>
            </Button>
          </Link>
          <button className="relative text-gray-500 hover:text-gray-700 p-2">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </button>
          <img src={user?.photo} alt={user?.name} className="w-9 h-9 rounded-full object-cover border-2 border-primary/30 cursor-pointer" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
