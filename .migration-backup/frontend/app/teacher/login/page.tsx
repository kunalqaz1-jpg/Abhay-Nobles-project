import { LoginScreen } from "@/app/components/erp-ui";

export default function TeacherLogin() {
  return (
    <LoginScreen
      role="Teacher"
      accent="#86efac"
      description="Productive teaching cockpit for attendance, assignments, grading, and parent communication."
      dashboardHref="/teacher/dashboard"
    />
  );
}