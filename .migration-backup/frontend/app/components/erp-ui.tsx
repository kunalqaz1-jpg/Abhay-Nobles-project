import Link from "next/link";
import { ReactNode } from "react";

type StatCard = {
  label: string;
  value: string;
  delta: string;
};

type ActivityItem = {
  title: string;
  detail: string;
  time: string;
  priority?: "high" | "normal";
};

type NavItem = {
  label: string;
  badge?: string;
};

export function OrbBackground() {
  return (
    <div className="orb-layer" aria-hidden>
      <span className="orb orb-one" />
      <span className="orb orb-two" />
      <span className="orb orb-three" />
      <span className="grid-overlay" />
    </div>
  );
}

export function LoginScreen({
  role,
  accent,
  description,
  dashboardHref,
}: {
  role: "Principal / Admin" | "Teacher" | "Student";
  accent: string;
  description: string;
  dashboardHref: string;
}) {
  return (
    <div className="auth-shell">
      <OrbBackground />
      <div className="auth-grid">
        <section className="auth-brand glass-panel">
          <p className="eyebrow">Shri Abhay Nobles Senior Secondary School</p>
          <h1>{role} Secure Access</h1>
          <p>{description}</p>
          <div className="feature-list">
            <div>
              <h4>Cloud-ready ERP Core</h4>
              <p>Centralized academic, financial, and operational workflows.</p>
            </div>
            <div>
              <h4>Role-based security</h4>
              <p>Multi-level permissions with activity tracking and login history.</p>
            </div>
            <div>
              <h4>Real-time intelligence</h4>
              <p>Smart analytics cards, risk alerts, and performance monitoring.</p>
            </div>
          </div>
        </section>

        <section className="auth-form glass-panel">
          <h2>{role} Login</h2>
          <p className="muted">Use your institutional credentials to continue.</p>
          <form className="form-grid">
            <label>
              Employee/Student ID
              <input placeholder="Enter ID" />
            </label>
            <label>
              Password
              <input type="password" placeholder="Enter secure password" />
            </label>
            <label>
              OTP Verification
              <div className="otp-wrap">
                <input maxLength={1} placeholder="0" />
                <input maxLength={1} placeholder="0" />
                <input maxLength={1} placeholder="0" />
                <input maxLength={1} placeholder="0" />
                <input maxLength={1} placeholder="0" />
                <input maxLength={1} placeholder="0" />
              </div>
            </label>
            <div className="form-meta">
              <label className="check">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="link">
                Forgot password?
              </a>
            </div>
            <Link href={dashboardHref} className="btn-primary">
              Access {role} Console
            </Link>
            <p className="tiny">
              Protected by JWT authentication, session intelligence, and role security.
            </p>
          </form>
        </section>
      </div>
      <style>{`:root { --accent-color: ${accent}; }`}</style>
    </div>
  );
}

export function DashboardShell({
  role,
  subtitle,
  navItems,
  stats,
  kpiBars,
  activities,
  rightRail,
  accentClass,
  children,
}: {
  role: string;
  subtitle: string;
  navItems: NavItem[];
  stats: StatCard[];
  kpiBars: { label: string; value: number }[];
  activities: ActivityItem[];
  rightRail: ReactNode;
  accentClass: string;
  children: ReactNode;
}) {
  return (
    <div className={`dashboard-shell ${accentClass}`}>
      <OrbBackground />
      <aside className="sidebar glass-panel">
        <div>
          <p className="eyebrow">Shri Abhay Nobles ERP</p>
          <h2>{role}</h2>
        </div>
        <nav>
          {navItems.map((item) => (
            <a href="#" key={item.label} className="nav-item">
              <span>{item.label}</span>
              {item.badge ? <em>{item.badge}</em> : null}
            </a>
          ))}
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="topbar glass-panel">
          <div>
            <h1>{role} Dashboard</h1>
            <p>{subtitle}</p>
          </div>
          <div className="topbar-actions">
            <input placeholder="Search students, classes, notices..." />
            <div className="notify">
              <button type="button">Notifications</button>
              <div className="notify-dropdown">
                <p>
                  <strong>Emergency:</strong> Weather alert for transport route C.
                </p>
                <p>
                  <strong>Priority:</strong> Fee defaulter report generated.
                </p>
                <p>
                  <strong>Update:</strong> Exam schedule revised for Grade XII.
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="kpi-grid">
          {stats.map((card) => (
            <article key={card.label} className="glass-panel card lift">
              <p>{card.label}</p>
              <h3>{card.value}</h3>
              <small>{card.delta}</small>
            </article>
          ))}
        </section>

        <section className="chart-grid">
          <article className="glass-panel card">
            <h4>Analytics Pulse</h4>
            <div className="line-chart" aria-hidden>
              <span style={{ height: "35%" }} />
              <span style={{ height: "50%" }} />
              <span style={{ height: "44%" }} />
              <span style={{ height: "68%" }} />
              <span style={{ height: "76%" }} />
              <span style={{ height: "83%" }} />
              <span style={{ height: "79%" }} />
              <span style={{ height: "94%" }} />
            </div>
            <div className="bar-list">
              {kpiBars.map((bar) => (
                <div key={bar.label}>
                  <div className="label-row">
                    <span>{bar.label}</span>
                    <span>{bar.value}%</span>
                  </div>
                  <div className="track">
                    <span style={{ width: `${bar.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-panel card">{rightRail}</article>
        </section>

        <section className="bottom-grid">
          <article className="glass-panel card">
            <h4>Recent Activities</h4>
            <div className="activity-list">
              {activities.map((item) => (
                <div key={item.title} className="activity-item">
                  <span className={`dot ${item.priority === "high" ? "high" : ""}`} />
                  <div>
                    <p>{item.title}</p>
                    <small>{item.detail}</small>
                  </div>
                  <time>{item.time}</time>
                </div>
              ))}
            </div>
          </article>
          <article className="glass-panel card">{children}</article>
        </section>
      </main>
    </div>
  );
}
