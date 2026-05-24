import { Link } from "wouter";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SVGProps } from "react";
import { AdminDemoView, type NavKey } from "./admin-demo-views";
import "./admin-principal.css";

type AdminDashboardData = {
  kpis?: Array<{ label: string; value: string; sub: string }>;
  recentAdmissions?: Array<{ id: string; studentName: string; classApplied: string; status: string; createdAt: string }>;
  recentAttendance?: Array<{ className: string; date: string; presentCount: number; totalStudents: number; teacherName: string }>;
  students?: Array<{ studentId: string; fullName: string; className: string }>;
  teachers?: Array<{ teacherId: string; name: string; subject: string }>;
  notices?: Array<{ id: string; title: string; createdAt: string; audience: string }>;
  events?: Array<{ id: string; title: string; eventDate: string; className: string }>;
  timetable?: Array<{ id: string; className: string; period: string; subject: string; time: string }>;
  contacts?: Array<{ id: string; fullName: string; subject: string; createdAt: string }>;
};

const SEARCH_INDEX: { title: string; sub: string; nav: NavKey; keywords: string }[] = [
  { title: "Teachers", sub: "Staff directory & assignments", nav: "teachers", keywords: "teacher staff faculty" },
  { title: "Attendance", sub: "Class-wise attendance", nav: "attendance", keywords: "present absent" },
  { title: "Fee Management", sub: "Collections & defaulters", nav: "fees", keywords: "fee payment pending" },
  { title: "Notices", sub: "School announcements", nav: "notices", keywords: "notice circular message" },
  { title: "Settings", sub: "Institution configuration", nav: "settings", keywords: "config role year" },
];

const NAV_DEF: { id: NavKey; label: string; Icon: typeof IconLayout }[] = [
  { id: "dashboard", label: "Dashboard", Icon: IconLayout },
  { id: "teachers", label: "Teachers", Icon: IconTeacher },
  { id: "attendance", label: "Attendance", Icon: IconCheck },
  { id: "fees", label: "Fee Management", Icon: IconCurrency },
  { id: "timetable", label: "Timetable", Icon: IconCalendar },
  { id: "notices", label: "Notices", Icon: IconBell },
  { id: "enquiries", label: "Enquiries", Icon: IconInbox },
  { id: "gallery", label: "Gallery Manager", Icon: IconPhoto },
  { id: "settings", label: "Settings", Icon: IconGear },
];

const DEFAULT_KPI = [
  { label: "Total Students", value: "0", sub: "enrolled", trend: "up" as const },
  { label: "Total Teachers", value: "0", sub: "on staff", trend: "up" as const },
  { label: "Admissions", value: "0", sub: "recent inquiries", trend: "up" as const },
  { label: "Attendance Records", value: "0", sub: "recent entries", trend: "up" as const },
];

export default function AdminPrincipalDashboard() {
  const [activeNav, setActiveNav] = useState<NavKey>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);

  const quickRef = useRef<HTMLDivElement>(null);
  const notifyRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((message: string) => setToast(message), []);

  useEffect(() => {
    const token = (() => {
      try {
        return sessionStorage.getItem("abhay_admin_token") ?? "";
      } catch {
        return "";
      }
    })();
    if (!token || token === "demo-admin-token") return;

    fetch("/api/admin/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load admin dashboard"))))
      .then((data) => setDashboardData(data as AdminDashboardData))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
        window.setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setQuickOpen(false);
        setNotifyOpen(false);
        setProfileOpen(false);
        setMobileOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onMouseDown(ev: MouseEvent) {
      const t = ev.target as Node;
      if (quickRef.current?.contains(t)) return;
      if (notifyRef.current?.contains(t)) return;
      if (profileRef.current?.contains(t)) return;
      setQuickOpen(false);
      setNotifyOpen(false);
      setProfileOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const go = (nav: NavKey, message?: string) => {
    setActiveNav(nav);
    setQuickOpen(false);
    setNotifyOpen(false);
    setProfileOpen(false);
    setSearchOpen(false);
    if (message) showToast(message);
  };

  const filteredSearch = SEARCH_INDEX.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return item.title.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q) || item.keywords.includes(q);
  });

  const kpi = (dashboardData?.kpis?.length
    ? dashboardData.kpis.map((card) => ({ ...card, trend: "up" as const }))
    : DEFAULT_KPI);

  const recentAttendance = dashboardData?.recentAttendance ?? [];
  const recentAdmissions = dashboardData?.recentAdmissions ?? [];
  const recentNotices = dashboardData?.notices ?? [];
  const recentEvents = dashboardData?.events ?? [];
  const recentContacts = dashboardData?.contacts ?? [];
  const timetable = dashboardData?.timetable ?? [];
  const students = dashboardData?.students ?? [];
  const teachers = dashboardData?.teachers ?? [];

  const activityList = useMemo(() => {
    const base = [
      ...recentAdmissions.slice(0, 3).map((item) => ({
        title: item.studentName,
        detail: `${item.classApplied || "Class not set"} · ${item.status}`,
        time: new Date(item.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
        bg: "#dbeafe",
        color: "#1d4ed8",
        Icon: IconUsers,
      })),
      ...recentContacts.slice(0, 3).map((item) => ({
        title: item.fullName,
        detail: item.subject || "Website enquiry",
        time: new Date(item.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
        bg: "#dcfce7",
        color: "#15803d",
        Icon: IconInbox,
      })),
      ...recentEvents.slice(0, 3).map((item) => ({
        title: item.title,
        detail: `${item.className || "All classes"} · ${item.eventDate}`,
        time: new Date(item.eventDate).toLocaleDateString("en-IN", { dateStyle: "medium" }),
        bg: "#ffedd5",
        color: "#c2410c",
        Icon: IconCalendar,
      })),
    ];
    return showAllActivity ? base : base.slice(0, 3);
  }, [recentAdmissions, recentContacts, recentEvents, showAllActivity]);

  const pageTitle = activeNav === "dashboard" ? "Welcome back, Principal" : NAV_DEF.find((n) => n.id === activeNav)?.label ?? "Dashboard";
  const pageSub = activeNav === "dashboard"
    ? `${students.length} students, ${teachers.length} teachers, and ${timetable.length} timetable rows are live in the system.`
    : NAV_DEF.find((n) => n.id === activeNav)?.label ?? "";

  return (
    <div className={`ap-erp${mobileOpen ? " ap-mobile-open" : ""}`}>
      {toast ? <div className="ap-toast" role="status">{toast}</div> : null}
      <div className="ap-sidebar-overlay" onClick={() => setMobileOpen(false)} />

      {searchOpen ? (
        <div className="ap-search-overlay" role="dialog" aria-modal="true" aria-label="Search" onMouseDown={(e) => e.target === e.currentTarget && setSearchOpen(false)}>
          <div className="ap-search-modal" onMouseDown={(e) => e.stopPropagation()}>
            <input ref={searchInputRef} type="search" placeholder="Search modules, students, actions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} aria-label="Command search" />
            <p className="ap-search-hint">Live modules. Press Esc to close.</p>
            <div className="ap-search-results">
              {filteredSearch.map((item) => (
                <button key={item.nav + item.title} type="button" className="ap-search-result-btn" onClick={() => go(item.nav, `Opened: ${item.title}`)}>
                  {item.title}
                  <span>{item.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <aside className="ap-sidebar" aria-label="Main navigation">
        <div className="ap-brand">
          <div className="ap-logo" aria-hidden>SAN</div>
          <div className="ap-brand-text">
            <strong>SHRI ABHAY NOBLES</strong>
            <span>Senior Secondary School</span>
          </div>
        </div>
        <nav className="ap-nav">
          {NAV_DEF.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`ap-nav-item ${activeNav === item.id ? "ap-nav-active" : ""}`}
              onClick={() => {
                setActiveNav(item.id);
                setMobileOpen(false);
                if (item.id !== "dashboard") showToast(`Opened: ${item.label}`);
              }}
            >
              <item.Icon />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="ap-sidebar-footer">
          <div className="ap-user-card">
            <div className="ap-sidebar-avatar-sm" aria-hidden>A</div>
            <div className="ap-user-meta">
              <strong>Admin</strong>
              <small>
                <span className="ap-dot-online" aria-hidden />
                School Control Room
              </small>
            </div>
          </div>
          <Link href="/admin/login" className="ap-btn-logout">Logout</Link>
        </div>
      </aside>

      <div className="ap-main">
        <header className="ap-topbar">
          <button type="button" className="ap-hamburger" aria-label="Toggle sidebar" onClick={() => setMobileOpen((v) => !v)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <rect y="3" width="20" height="2" rx="1" fill="currentColor" />
              <rect y="9" width="20" height="2" rx="1" fill="currentColor" />
              <rect y="15" width="20" height="2" rx="1" fill="currentColor" />
            </svg>
          </button>
          <div className="ap-search-wrap">
            <IconSearch />
            <input type="search" placeholder="Search students, teachers, classes..." aria-label="Search" onFocus={() => setSearchOpen(true)} onClick={() => setSearchOpen(true)} readOnly />
            <kbd className="ap-kbd">Ctrl K</kbd>
          </div>
          <div className="ap-topbar-right">
            <span className="ap-badge-status">
              <span className="ap-pulse" aria-hidden />
              Live Dashboard
            </span>
            <span className="ap-date-pill">
              <IconCalendarSmall />
              {new Date().toLocaleDateString("en-IN", { dateStyle: "medium" })}
            </span>

            <div className="ap-dropdown-wrap" ref={notifyRef}>
              <button type="button" className="ap-notify-btn" aria-label="Notifications" aria-expanded={notifyOpen} onClick={() => { setNotifyOpen((v) => !v); setProfileOpen(false); setQuickOpen(false); }}>
                <IconBellOutline />
                <span className="ap-notify-count">{recentAdmissions.length + recentContacts.length}</span>
              </button>
              {notifyOpen ? (
                <div className="ap-dropdown-panel">
                  <div className="ap-dropdown-head">Latest Updates</div>
                  {activityList.length ? activityList.slice(0, 4).map((item) => (
                    <button key={item.title + item.time} type="button" className="ap-dropdown-item" onClick={() => go("enquiries", item.title)}>
                      <strong>{item.title}</strong>
                      <small>{item.detail}</small>
                    </button>
                  )) : <div className="ap-dropdown-item"><small>No recent updates yet.</small></div>}
                </div>
              ) : null}
            </div>

            <div className="ap-dropdown-wrap ap-profile-menu" ref={profileRef}>
              <button type="button" className="ap-profile" aria-label="Admin menu" aria-expanded={profileOpen} onClick={() => { setProfileOpen((v) => !v); setNotifyOpen(false); setQuickOpen(false); }}>
                <span className="ap-profile-avatar" aria-hidden />
                <span>Admin</span>
                <IconChevron className={`chev ${profileOpen ? "ap-chev-rot" : ""}`} />
              </button>
              {profileOpen ? (
                <div className="ap-dropdown-panel">
                  <button type="button" className="ap-dropdown-item" onClick={() => go("settings", "Open settings")}>
                    <strong>Settings</strong>
                    <small>School configuration</small>
                  </button>
                  <button type="button" className="ap-dropdown-item" onClick={() => go("teachers", "Open teachers")}>
                    <strong>Teachers</strong>
                    <small>Directory & assignments</small>
                  </button>
                  <div className="ap-dropdown-divider" />
                  <Link href="/admin/login" className="ap-dropdown-item" onClick={() => setProfileOpen(false)}>
                    <strong>Sign out</strong>
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="ap-content">
          <div className="ap-welcome-row">
            <div>
              <h1>{pageTitle}</h1>
              <p>{pageSub}</p>
            </div>
            <div className="ap-dropdown-wrap ap-quick-wrap" ref={quickRef}>
              <button type="button" className="ap-btn-quick" aria-expanded={quickOpen} onClick={() => { setQuickOpen((v) => !v); setNotifyOpen(false); setProfileOpen(false); }}>
                <IconBolt />
                Quick Actions
                <IconChevron className="chev" style={{ transform: quickOpen ? "rotate(270deg)" : "rotate(90deg)" }} />
              </button>
              {quickOpen ? (
                <div className="ap-dropdown-panel ap-dropdown-left">
                  <div className="ap-dropdown-head">Shortcuts</div>
                  <button type="button" className="ap-dropdown-item" onClick={() => go("fees", "Open fee management")}>
                    <strong>Fee Management</strong>
                    <small>Payments & reminders</small>
                  </button>
                  <button type="button" className="ap-dropdown-item" onClick={() => go("notices", "Open notices")}>
                    <strong>Publish Notice</strong>
                    <small>Students, staff, parents</small>
                  </button>
                  <button type="button" className="ap-dropdown-item" onClick={() => go("teachers", "Open teachers")}>
                    <strong>Staff Directory</strong>
                    <small>Faculty & assignments</small>
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {activeNav === "dashboard" ? (
            <>
              <section className="ap-kpi-grid" aria-label="Key metrics">
                {kpi.map((card) => (
                  <article key={card.label} className="ap-kpi">
                    <label>{card.label}</label>
                    <strong>{card.value}</strong>
                    <small className="up">{card.sub}</small>
                  </article>
                ))}
              </section>

              <section className="ap-mid-grid">
                <article className="ap-panel">
                  <div className="ap-panel-head">
                    <h3>Recent Attendance</h3>
                    <button type="button" className="ap-filter" style={{ cursor: "pointer" }} onClick={() => go("attendance", "Attendance")}>Open</button>
                  </div>
                  <div className="ap-feed">
                    {recentAttendance.length ? recentAttendance.map((item) => (
                      <div key={`${item.className}-${item.date}`} className="ap-feed-item">
                        <div className="ap-feed-icon" style={{ background: "#dbeafe", color: "#1d4ed8" }}>
                          <IconCheck />
                        </div>
                        <div>
                          <p>{item.className}</p>
                          <small>{item.presentCount}/{item.totalStudents} present · {item.teacherName}</small>
                        </div>
                        <time>{item.date}</time>
                      </div>
                    )) : <p className="ap-search-hint" style={{ marginTop: 0 }}>No attendance records available yet.</p>}
                  </div>
                </article>

                <article className="ap-panel">
                  <div className="ap-panel-head">
                    <h3>Recent Activities</h3>
                    <button type="button" className="ap-filter" style={{ cursor: "pointer" }} onClick={() => setShowAllActivity((v) => !v)}>
                      {showAllActivity ? "Show less" : "View all"}
                    </button>
                  </div>
                  <div className="ap-feed">
                    {activityList.length ? activityList.map((a) => (
                      <div key={a.title + a.time} className="ap-feed-item">
                        <div className="ap-feed-icon" style={{ background: a.bg, color: a.color }}>
                          <a.Icon />
                        </div>
                        <div>
                          <p>{a.title}</p>
                          <small>{a.detail}</small>
                        </div>
                        <time>{a.time}</time>
                      </div>
                    )) : <p className="ap-search-hint" style={{ marginTop: 0 }}>No recent activity yet.</p>}
                  </div>
                </article>
              </section>

              <section className="ap-bot-grid">
                <article className="ap-panel">
                  <div className="ap-panel-head">
                    <h3>Admissions</h3>
                    <button type="button" className="ap-filter" style={{ cursor: "pointer" }} onClick={() => go("enquiries", "Admissions")}>Open</button>
                  </div>
                  <div className="ap-feed">
                    {recentAdmissions.length ? recentAdmissions.map((item) => (
                      <div key={item.id} className="ap-feed-item">
                        <div className="ap-feed-icon" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                          <IconUsers />
                        </div>
                        <div>
                          <p>{item.studentName}</p>
                          <small>{item.classApplied || "Class not set"} · {item.status}</small>
                        </div>
                        <time>{new Date(item.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</time>
                      </div>
                    )) : <p className="ap-search-hint" style={{ marginTop: 0 }}>No admissions yet.</p>}
                  </div>
                </article>

                <article className="ap-panel">
                  <div className="ap-panel-head">
                    <h3>Upcoming Events & Notices</h3>
                  </div>
                  <div className="ap-events">
                    {[...recentEvents.slice(0, 3).map((item) => ({
                      key: item.id,
                      date: item.eventDate,
                      title: item.title,
                      tag: item.className || "School",
                    })), ...recentNotices.slice(0, 2).map((item) => ({
                      key: item.id,
                      date: item.createdAt,
                      title: item.title,
                      tag: item.audience || "Notice",
                    }))].map((item) => {
                      const d = new Date(item.date);
                      return (
                        <div key={item.key} className="ap-event">
                          <div className="ap-event-date">
                            <strong>{String(d.getDate()).padStart(2, "0")}</strong>
                            <small>{d.toLocaleString("en-IN", { month: "short" })}</small>
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem" }}>{item.title}</p>
                            <span className="ap-tag event">{item.tag}</span>
                          </div>
                        </div>
                      );
                    })}
                    {!recentEvents.length && !recentNotices.length ? <p className="ap-search-hint" style={{ marginTop: 0 }}>No events or notices yet.</p> : null}
                  </div>
                </article>
              </section>

              <section className="ap-panel" style={{ marginTop: "1.5rem" }}>
                <div className="ap-panel-head">
                  <h3>Latest Timetable Rows</h3>
                  <button type="button" className="ap-filter" style={{ cursor: "pointer" }} onClick={() => go("timetable", "Timetable")}>Open</button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="td-data-table" style={{ width: "100%" }}>
                    <thead>
                      <tr>
                        <th>Class</th>
                        <th>Period</th>
                        <th>Subject</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timetable.length ? timetable.slice(0, 8).map((row) => (
                        <tr key={row.id}>
                          <td>{row.className}</td>
                          <td>{row.period}</td>
                          <td>{row.subject}</td>
                          <td>{row.time}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} style={{ color: "#64748b" }}>No timetable rows saved yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : (
            <AdminDemoView nav={activeNav} toast={showToast} />
          )}
        </div>
      </div>
    </div>
  );
}

function IconLayout() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>;
}
function IconUsers() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}
function IconTeacher() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></svg>;
}
function IconCheck() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
}
function IconCurrency() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
}
function IconCalendar() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
}
function IconBell() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
}
function IconFolder() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>;
}
function IconGear() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>;
}
function IconPhoto() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>;
}
function IconInbox() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>;
}
function IconSearch() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
}
function IconCalendarSmall() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
}
function IconBellOutline() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
}
function IconChevron({ className, style, ...rest }: SVGProps<SVGSVGElement>) {
  return <svg className={className} style={style} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...rest}><polyline points="6 9 12 15 18 9" /></svg>;
}
function IconBolt() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" /></svg>;
}
