import Link from "next/link";
import { OrbBackground } from "./components/erp-ui";

export default function Home() {
  return (
    <div className="landing">
      <OrbBackground />
      <section className="hero glass-panel">
        <p className="eyebrow">Standalone Internal Platform</p>
        <h1>Shri Abhay Nobles Senior Secondary School ERP</h1>
        <p className="muted">
          Premium, futuristic, and secure school management ecosystem for Principal
          and Teachers.
        </p>
      </section>
      <section className="role-grid">
        <Link href="/admin/login" className="role-card glass-panel">
          <h3>Principal / Admin Console</h3>
          <p className="muted">Operations, analytics, finance, governance, and control.</p>
          <span className="btn-primary">Open Admin Access</span>
        </Link>
        <Link href="/teacher/login" className="role-card glass-panel">
          <h3>Teacher Workbench</h3>
          <p className="muted">Attendance, assignments, marks, communication, and classes.</p>
          <span className="btn-primary">Open Teacher Access</span>
        </Link>
      </section>
    </div>
  );
}
