import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import PropertyDetail from "@/pages/PropertyDetail";
import { AuthProvider, useAuth } from "@/admin/context/AuthContext";
import AdminLogin from "@/admin/pages/AdminLogin";
import AdminDashboard from "@/admin/pages/AdminDashboard";
import AdminProperties from "@/admin/pages/AdminProperties";
import AdminPropertyForm from "@/admin/pages/AdminPropertyForm";
import AdminPropertiesAll from "@/admin/pages/AdminPropertiesAll";
import AdminPropertiesSold from "@/admin/pages/AdminPropertiesSold";
import AdminSubmissions from "@/admin/pages/AdminSubmissions";
import AdminContracts from "@/admin/pages/AdminContracts";
import AdminContractsNew from "@/admin/pages/AdminContractsNew";
import AdminLeads from "@/admin/pages/AdminLeads";
import AdminAnalytics from "@/admin/pages/AdminAnalytics";
import AdminSettings from "@/admin/pages/AdminSettings";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Redirect to="/admin/login" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/property/:slug" component={PropertyDetail} />

      {/* Admin */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={() => <ProtectedRoute component={AdminDashboard} />} />
      <Route path="/admin/properties/add" component={() => <ProtectedRoute component={AdminPropertyForm} />} />
      <Route path="/admin/properties/edit/:id" component={() => <ProtectedRoute component={AdminPropertyForm} />} />
      <Route path="/admin/properties/all" component={() => <ProtectedRoute component={AdminPropertiesAll} />} />
      <Route path="/admin/properties/sold" component={() => <ProtectedRoute component={AdminPropertiesSold} />} />
      <Route path="/admin/properties" component={() => <ProtectedRoute component={AdminProperties} />} />
      <Route path="/admin/submissions" component={() => <ProtectedRoute component={AdminSubmissions} />} />
      <Route path="/admin/contracts/new" component={() => <ProtectedRoute component={AdminContractsNew} />} />
      <Route path="/admin/contracts" component={() => <ProtectedRoute component={AdminContracts} />} />
      <Route path="/admin/leads" component={() => <ProtectedRoute component={AdminLeads} />} />
      <Route path="/admin/analytics" component={() => <ProtectedRoute component={AdminAnalytics} />} />
      <Route path="/admin/settings" component={() => <ProtectedRoute component={AdminSettings} />} />
      <Route path="/admin" component={() => <Redirect to="/admin/dashboard" />} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
