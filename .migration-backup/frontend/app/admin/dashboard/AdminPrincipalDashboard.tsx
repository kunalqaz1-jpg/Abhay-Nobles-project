"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SVGProps } from "react";
import { AdminDemoView, type NavKey } from "./admin-demo-views";
import "./admin-principal.css";

const kpi = [
  { label: "Total Students", value: "1,248", delta: "+12.5% vs last month", trend: "up" as const },
  { label: "Total Teachers", value: "86", delta: "+8.2% vs last month", trend: "up" as const },
  { label: "Total Classes", value: "42", delta: "+5.4% vs last month", trend: "up" as const },
  { label: "Student Attendance Rate", value: "94.2%", delta: "+3.7% vs last month", trend: "up" as const },
  { label: "Pending Fees", value: "â‚¹5.48L", delta: "-6.3% vs last month", trend: "down" as const },
  { label: "Teacher Attendance Rate", value: "96.8%", delta: "+2.1% vs last month", trend: "up" as const },
];

const activities = [
  {
    title: "New student admission",
    detail: "Grade IX â€” Admission form verified",
    time: "10 min ago",
    bg: "#dbeafe",
    color: "#1d4ed8",
    Icon: IconUsers,
  },
  {
    title: "Fee payment received",
    detail: "â‚¹48,500 â€” Term II installment",
    time: "32 min ago",
    bg: "#dcfce7",
    color: "#15803d",
    Icon: IconCurrency,
  },
  {
    title: "Exam scheduled",
    detail: "Pre-board â€” Science practical batch A",
    time: "1 hr ago",
    bg: "#ffedd5",
    color: "#c2410c",
    Icon: IconClipboard,
  },
];

const activitiesMore = [
  ...activities,
  {
    title: "Timetable revision published",
    detail: "Grade X â€” Monday slot swap applied",
    time: "2 hr ago",
    bg: "#f3e8ff",
    color: "#7c3aed",
    Icon: IconCalendar,
  },
  {
    title: "Document uploaded",
    detail: "Board registration circular 2026.pdf",
    time: "3 hr ago",
    bg: "#e0f2fe",
    color: "#0369a1",
    Icon: IconFolder,
  },
  {
    title: "Low attendance alert",
    detail: "Class IX-B below 85% this week",
    time: "5 hr ago",
    bg: "#fee2e2",
    color: "#dc2626",
    Icon: IconBell,
  },
  {
    title: "Salary batch processed",
    detail: "May payroll â€” 86 staff",
    time: "Yesterday",
    bg: "#ecfdf5",
    color: "#15803d",
    Icon: IconWallet,
  },
  {
    title: "Parent enquiry resolved",
    detail: "Transport route C â€” callback logged",
    time: "Yesterday",
    bg: "#f1f5f9",
    color: "#475569",
    Icon: IconUsers,
  },
];

const admissionBars = [42, 55, 38, 62, 48, 71, 65, 58, 80, 52, 67, 74];
const monthLabels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

const events = [
  { day: "12", mon: "May", title: "PTM â€” Class X", tag: "Meeting", tagClass: "meeting" as const },
  { day: "18", mon: "May", title: "Annual Sports Day", tag: "Event", tagClass: "event" as const },
  { day: "22", mon: "May", title: "Pre-board â€” Mathematics", tag: "Exam", tagClass: "exam" as const },
];

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
  { id: "settings", label: "Settings", Icon: IconGear },
];

export default function AdminPrincipalDashboard() {
  const [activeNav, setActiveNav] = useState<NavKey>("dashboard");
  const [quickOpen, setQuickOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [attendanceRange, setAttendanceRange] = useState<"month" | "year">("month");
  const [toast, setToast] = useState<string | null>(null);

  const quickRef = useRef<HTMLDivElement>(null);
  const notifyRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
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

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

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
    return (
      item.title.toLowerCase().includes(q) ||
      item.sub.toLowerCase().includes(q) ||
      item.keywords.includes(q)
    );
  });

  const activityList = showAllActivity ? activitiesMore : activities;

  const pageTitle =
    activeNav === "dashboard"
      ? "Welcome back, Principal ðŸ‘‹"
      : NAV_DEF.find((n) => n.id === activeNav)?.label ?? "Dashboard";

  const pageSub =
    activeNav === "dashboard"
      ? "Here's what's happening in your institution today."
      : `Demo workspace Â· ${NAV_DEF.find((n) => n.id === activeNav)?.label ?? ""}`;

  return (
    <div className="ap-erp">
      {toast ? <div className="ap-toast" role="status">{toast}</div> : null}

      {searchOpen ? (
        <div
          className="ap-search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSearchOpen(false);
          }}
        >
          <div className="ap-search-modal" onMouseDown={(e) => e.stopPropagation()}>
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search modules, students, actionsâ€¦"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Command search"
            />
            <p className="ap-search-hint">â†‘â†“ Demo results Â· Enter to open Â· Esc to close Â· âŒ˜K to toggle</p>
            <div className="ap-search-results">
              {filteredSearch.map((item) => (
                <button
                  key={item.nav + item.title}
                  type="button"
                  className="ap-search-result-btn"
                  onClick={() => go(item.nav, `Opened: ${item.title}`)}
                >
                  {item.title}
                  <span>{item.sub}</span>
                </button>
              ))}
              {filteredSearch.length === 0 ? (
                <p className="ap-search-hint" style={{ padding: "1rem" }}>
                  No demo matches. Try â€œfeeâ€, â€œexamâ€, or â€œstudentâ€.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <aside className="ap-sidebar" aria-label="Main navigation">
        <div className="ap-brand">
          <div className="ap-logo" aria-hidden>
            SAN
          </div>
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
            <div className="ap-sidebar-avatar-sm" aria-hidden>
              N
            </div>
            <div className="ap-user-meta">
              <strong>Principal</strong>
              <small>
                <span className="ap-dot-online" aria-hidden />
                Shri Abhay Nobles Â· Online
              </small>
            </div>
          </div>
          <Link href="/admin/login" className="ap-btn-logout">
            Logout
          </Link>
        </div>
      </aside>

      <div className="ap-main">
        <header className="ap-topbar">
          <div className="ap-search-wrap">
            <IconSearch />
            <input
              type="search"
              placeholder="Search students, teachers, classes..."
              aria-label="Search"
              onFocus={() => setSearchOpen(true)}
              onClick={() => setSearchOpen(true)}
              readOnly
            />
            <kbd className="ap-kbd">âŒ˜ K</kbd>
          </div>
          <div className="ap-topbar-right">
            <span className="ap-badge-status">
              <span className="ap-pulse" aria-hidden />
              All Systems Operational
            </span>
            <span className="ap-date-pill">
              <IconCalendarSmall />
              8 May 2026, Thursday
            </span>

            <div className="ap-dropdown-wrap" ref={notifyRef}>
              <button
                type="button"
                className="ap-notify-btn"
                aria-label="Notifications, 8 unread"
                aria-expanded={notifyOpen}
                onClick={() => {
                  setNotifyOpen((v) => !v);
                  setProfileOpen(false);
                  setQuickOpen(false);
                }}
              >
                <IconBellOutline />
                <span className="ap-notify-count">8</span>
              </button>
              {notifyOpen ? (
                <div className="ap-dropdown-panel">
                  <div className="ap-dropdown-head">Notifications</div>
                  <button
                    type="button"
                    className="ap-dropdown-item ap-emergency"
                    onClick={() => go("notices", "Emergency: Weather advisory (demo)")}
                  >
                    <strong>Transport advisory</strong>
                    <small>Route C delay Â· 12 min ago</small>
                  </button>
                  <button
                    type="button"
                    className="ap-dropdown-item"
                    onClick={() => go("fees", "12 fee reminders pending (demo)")}
                  >
                    <strong>Fee reminders</strong>
                    <small>12 parents Â· batch ready</small>
                  </button>
                  <div className="ap-dropdown-divider" />
                  <button
                    type="button"
                    className="ap-dropdown-item"
                    onClick={() => go("dashboard", "All notifications marked read (demo)")}
                  >
                    <small>Mark all as read</small>
                  </button>
                </div>
              ) : null}
            </div>

            <div className="ap-dropdown-wrap ap-profile-menu" ref={profileRef}>
              <button
                type="button"
                className="ap-profile"
                aria-label="Principal Admin menu"
                aria-expanded={profileOpen}
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setNotifyOpen(false);
                  setQuickOpen(false);
                }}
              >
                <span className="ap-profile-avatar" aria-hidden />
                <span>Principal Admin</span>
                <IconChevron className={`chev ${profileOpen ? "ap-chev-rot" : ""}`} />
              </button>
              {profileOpen ? (
                <div className="ap-dropdown-panel">
                  <button type="button" className="ap-dropdown-item" onClick={() => showToast("Demo: My profile")}>
                    <strong>My profile</strong>
                    <small>Photo, signature, contact</small>
                  </button>
                  <button type="button" className="ap-dropdown-item" onClick={() => go("settings", "Security settings (demo)")}>
                    <strong>Security</strong>
                    <small>Password, 2FA, sessions</small>
                  </button>
                  <button type="button" className="ap-dropdown-item" onClick={() => showToast("Demo: Help center")}>
                    <strong>Help</strong>
                    <small>Guides & support</small>
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
              <button
                type="button"
                className="ap-btn-quick"
                aria-expanded={quickOpen}
                onClick={() => {
                  setQuickOpen((v) => !v);
                  setNotifyOpen(false);
                  setProfileOpen(false);
                }}
              >
                <IconBolt />
                Quick Actions
                <IconChevron className="chev" style={{ transform: quickOpen ? "rotate(270deg)" : "rotate(90deg)" }} />
              </button>
              {quickOpen ? (
                <div className="ap-dropdown-panel ap-dropdown-left">
                  <div className="ap-dropdown-head">Shortcuts</div>
                  <button type="button" className="ap-dropdown-item" onClick={() => go("fees", "Record payment (demo)")}>
                    <strong>Record fee payment</strong>
                    <small>Receipt & ledger</small>
                  </button>
                  <button type="button" className="ap-dropdown-item" onClick={() => go("notices", "Compose notice (demo)")}>
                    <strong>Publish notice</strong>
                    <small>Staff / parents / students</small>
                  </button>
                  <button type="button" className="ap-dropdown-item" onClick={() => go("teachers", "Open staff directory (demo)")}>
                    <strong>Open staff directory</strong>
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
                    <small className={card.trend === "up" ? "up" : "down"}>{card.delta}</small>
                  </article>
                ))}
              </section>

              <section className="ap-mid-grid">
                <article className="ap-panel">
                  <div className="ap-panel-head">
                    <h3>Attendance Overview</h3>
                    <select
                      className="ap-filter"
                      aria-label="Time range"
                      value={attendanceRange}
                      onChange={(e) => {
                        const v = e.target.value === "year" ? "year" : "month";
                        setAttendanceRange(v);
                        showToast(v === "month" ? "Showing: This month (demo)" : "Showing: This year (demo)");
                      }}
                    >
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>
                  <p className="ap-search-hint" style={{ marginTop: 0 }}>
                    {attendanceRange === "month"
                      ? "Demo: Daily attendance trend for the current month."
                      : "Demo: Year-to-date consolidated attendance curve."}
                  </p>
                  <div className="ap-line-chart">
                    <AttendanceLineChart />
                    <div className="ap-chart-hint" title="Tooltip">
                      94.2% Â· 8 May
                    </div>
                  </div>
                </article>                <article className="ap-panel">
                  <div className="ap-panel-head">
                    <h3>Recent Activities</h3>
                    <button
                      type="button"
                      className="ap-filter"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setShowAllActivity((v) => !v);
                        showToast(showAllActivity ? "Showing latest 3 activities" : "Showing all demo activities");
                      }}
                    >
                      {showAllActivity ? "Show less" : "View all"}
                    </button>
                  </div>
                  <div className="ap-feed">
                    {activityList.map((a) => (
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
                    ))}
                  </div>
                </article>
              </section>

              <section className="ap-bot-grid">
                <article className="ap-panel">
                  <div className="ap-panel-head">
                    <h3>Student Admission Overview</h3>
                    <select
                      className="ap-filter"
                      aria-label="Year"
                      defaultValue="2026"
                      onChange={(e) => showToast(`Admissions: ${e.target.value} (demo)`)}
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                    </select>
                  </div>
                  <div className="ap-bars" role="list">
                    {admissionBars.map((h, i) => (
                      <div key={monthLabels[i]} className="ap-bar-col" role="listitem">
                        <div
                          className="ap-bar"
                          style={{ height: `${Math.max(12, (h / 80) * 100)}%` }}
                          title={`${monthLabels[i]}: ${h}`}
                        />
                        <span>{monthLabels[i]}</span>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="ap-panel">
                  <div className="ap-panel-head">
                    <h3>Upcoming Events</h3>
                  </div>
                  <div className="ap-events">
                    {events.map((e) => (
                      <div key={e.title} className="ap-event">
                        <div className="ap-event-date">
                          <strong>{e.day}</strong>
                          <small>{e.mon}</small>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem" }}>{e.title}</p>
                          <span className={`ap-tag ${e.tagClass}`}>{e.tag}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
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

function AttendanceLineChart() {
  const w = 400;
  const h = 120;
  const pad = 8;
  const pts = [
    [0, 0.72],
    [1, 0.68],
    [2, 0.75],
    [3, 0.7],
    [4, 0.82],
    [5, 0.78],
    [6, 0.85],
    [7, 0.88],
    [8, 0.9],
    [9, 0.87],
    [10, 0.91],
    [11, 0.89],
    [12, 0.942],
  ];
  const toX = (i: number) => pad + (i / 12) * (w - pad * 2);
  const toY = (v: number) => h - pad - v * (h - pad * 2);
  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p[0])} ${toY(p[1])}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h + 24}`} preserveAspectRatio="none">
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={pad} x2={w - pad} y1={toY(t)} y2={toY(t)} stroke="#e2e8f0" strokeWidth="1" />
      ))}
      <path
        d={d}
        fill="none"
        stroke="var(--ap-blue)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={toX(12)} cy={toY(0.942)} r="5" fill="#fff" stroke="var(--ap-blue)" strokeWidth="2" />
      <text x={pad} y={h + 18} fill="#64748b" fontSize="10">
        Apr
      </text>
      <text x={w / 2 - 8} y={h + 18} fill="#64748b" fontSize="10">
        May
      </text>
      <text x={w - pad - 14} y={h + 18} fill="#64748b" fontSize="10">
        Jun
      </text>
    </svg>
  );
}

function IconLayout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconTeacher() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

function IconCurrency() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function IconWallet() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconFolder() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconGear() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconCalendarSmall() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconBellOutline() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconChevron({ className, style, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      style={style}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...rest}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  );
}

