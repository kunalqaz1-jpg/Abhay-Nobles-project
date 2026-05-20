import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SchoolWebsite from "@/pages/school/SchoolWebsite";
import GalleryPage from "@/pages/school/GalleryPage";
import StudentPortal from "@/pages/student/StudentPortal";
import TeacherLogin from "@/pages/teacher/TeacherLogin";
import AdminLogin from "@/pages/admin/AdminLogin";
import TeacherDashboardClient from "@/pages/teacher/TeacherDashboardClient";
import AdminPrincipalDashboard from "@/pages/admin/AdminPrincipalDashboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={SchoolWebsite} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/student/portal" component={StudentPortal} />
      <Route path="/teacher/login" component={TeacherLogin} />
      <Route path="/teacher/dashboard" component={TeacherDashboardClient} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminPrincipalDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
