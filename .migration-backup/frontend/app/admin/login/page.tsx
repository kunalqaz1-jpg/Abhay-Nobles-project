import { LoginScreen } from "@/app/components/erp-ui";

export default function AdminLogin() {
  return (
    <LoginScreen
      role="Principal / Admin"
      accent="#67e8f9"
      description="Executive visibility for admissions, academics, staffing, compliance, and financial intelligence."
      dashboardHref="/admin/dashboard"
    />
  );
}