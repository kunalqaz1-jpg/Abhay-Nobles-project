"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SVGProps } from "react";
import { TeacherDemoView, type TeacherNavKey } from "./teacher-demo-views";
import "./teacher-dashboard.css";

const TEACHER_NAME = "Ms. Neha Sharma";

const SEARCH_INDEX: { title: string; sub: string; nav: TeacherNavKey; keywords: string }[] = [
  { title: "My Classes", sub: "Roster & periods", nav: "my-classes", keywords: "class section" },
  { title: "Attendance", sub: "Mark & history", nav: "attendance", keywords: "present absent" },
  { title: "Homework", sub: "Upload & review", nav: "homework", keywords: "hw assignment" },
  { title: "Fees", sub: "Due & payment history", nav: "fees", keywords: "fees payment due exam term yearly" },
  { title: "Results", sub: "Marks & reports", nav: "results", keywords: "marks grade" },
  { title: "Students", sub: "Profiles & remarks", nav: "students", keywords: "learner pupil" },
  { title: "Timetable", sub: "Weekly schedule", nav: "timetable", keywords: "period time" },
  { title: "Notices", sub: "School announcements", nav: "notices", keywords: "circular news" },
  { title: "Messages", sub: "Inbox & compose", nav: "messages", keywords: "chat parent" },
  { title: "Study Material", sub: "Files & links", nav: "study-material", keywords: "pdf notes resource" },
  { title: "Settings", sub: "Preferences", nav: "settings", keywords: "config profile" },
];

const NAV_DEF: { id: TeacherNavKey; label: string; Icon: typeof IconLayout }[] = [
  { id: "dashboard", label: "Dashboard", Icon: IconLayout },
  { id: "my-classes", label: "My Classes", Icon: IconBookOpen },
  { id: "attendance", label: "Attendance", Icon: IconCheck },
  { id: "homework", label: "Homework", Icon: IconFile },
  { id: "fees", label: "Fees", Icon: IconWallet },
  { id: "results", label: "Results", Icon: IconChart },
  { id: "students", label: "Students", Icon: IconUsers },
  { id: "timetable", label: "Timetable", Icon: IconCalendar },
  { id: "notices", label: "Notices", Icon: IconBell },
  { id: "messages", label: "Messages", Icon: IconMessage },
  { id: "study-material", label: "Study Material", Icon: IconFolder },
  { id: "settings", label: "Settings", Icon: IconGear },
];

const classesTable = [
  { cls: "X - Section A", subj: "Mathematics", students: 32, att: 94, perf: 82 },
  { cls: "IX - Section B", subj: "Mathematics", students: 40, att: 91, perf: 79 },
  { cls: "VIII - A", subj: "Mathematics", students: 36, att: 96, perf: 85 },
  { cls: "XI - Science", subj: "Mathematics", students: 28, att: 89, perf: 88 },
];

export default function TeacherDashboardClient() {
  const [activeNav, setActiveNav] = useState<TeacherNavKey>("dashboard");
  const [narrow, setNarrow] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeDark, setThemeDark] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [showAllNotices, setShowAllNotices] = useState(false);

  const quickRef = useRef<HTMLDivElement>(null);
  const notifyRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((m: string) => setToast(m), []);

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
        setTimeout(() => searchRef.current?.focus(), 50);
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
    function onMd(e: MouseEvent) {
      const t = e.target as Node;
      if (quickRef.current?.contains(t)) return;
      if (notifyRef.current?.contains(t)) return;
      if (profileRef.current?.contains(t)) return;
      setQuickOpen(false);
      setNotifyOpen(false);
      setProfileOpen(false);
    }
    document.addEventListener("mousedown", onMd);
    return () => document.removeEventListener("mousedown", onMd);
  }, []);

  const isMobile = () => typeof window !== "undefined" && window.innerWidth <= 900;

  const toggleSidebar = () => {
    if (isMobile()) setMobileOpen((v) => !v);
    else setNarrow((v) => !v);
  };

  const go = (nav: TeacherNavKey, msg?: string) => {
    setActiveNav(nav);
    setQuickOpen(false);
    setNotifyOpen(false);
    setProfileOpen(false);
    setSearchOpen(false);
    if (isMobile()) setMobileOpen(false);
    if (msg) showToast(msg);
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

  const noticesShort = [
    { title: "Summer vacation notice", date: "8 May 2026", time: "09:00 AM" },
    { title: "PTM briefing — Class X", date: "7 May 2026", time: "04:30 PM" },
    { title: "Lab safety drill", date: "6 May 2026", time: "11:00 AM" },
  ];
  const noticesList = showAllNotices ? noticesShort : noticesShort.slice(0, 2);

  const pageTitle =
    activeNav === "dashboard"
      ? `Welcome back, ${TEACHER_NAME} 👋`
      : NAV_DEF.find((n) => n.id === activeNav)?.label ?? "Dashboard";

  const pageSub =
    activeNav === "dashboard"
      ? "You have 4 classes today. Make today a great day for your students!"
      : `Demo · ${NAV_DEF.find((n) => n.id === activeNav)?.label ?? ""}`;

  return (
    <div
      className={`td-erp ${narrow ? "td-narrow" : ""} ${themeDark ? "td-dark" : ""} ${mobileOpen ? "td-mobile-open" : ""}`}
    >
      {toast ? <div className="td-toast" role="status">{toast}</div> : null}

      <button
        type="button"
        className="td-sidebar-overlay"
        aria-label="Close menu"
        onClick={() => setMobileOpen(false)}
      />

      {searchOpen ? (
        <div
          className="td-search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSearchOpen(false);
          }}
        >
          <div className="td-search-modal" onMouseDown={(e) => e.stopPropagation()}>
            <input
              ref={searchRef}
              type="search"
              placeholder="Search students, classes, notes…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Command search"
            />
            <p className="td-search-hint">Pick a module · Esc to close · ⌘K</p>
            <div className="td-search-res">
              {filteredSearch.map((item) => (
                <button
                  key={item.nav + item.title}
                  type="button"
                  className="td-sres-btn"
                  onClick={() => go(item.nav, `Opened: ${item.title}`)}
                >
                  {item.title}
                  <span>{item.sub}</span>
                </button>
              ))}
              {filteredSearch.length === 0 ? (
                <p className="td-search-hint" style={{ padding: "1rem" }}>
                  No matches. Try “homework”, “student”, or “timetable”.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <aside className="td-sidebar" aria-label="Teacher navigation">
        <div className="td-brand">
          <div className="td-logo" aria-hidden>
            SAN
          </div>
          <div className="td-brand-text">
            <strong>SHRI ABHAY NOBLES</strong>
            <span>Senior Secondary School</span>
          </div>
        </div>
        <div className="td-nav-wrap">
          <p className="td-nav-label">Teacher menu</p>
          <nav className="td-nav">
            {NAV_DEF.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`td-nav-item ${activeNav === item.id ? "td-active" : ""}`}
                onClick={() => {
                  setActiveNav(item.id);
                  if (item.id !== "dashboard") showToast(`Opened: ${item.label}`);
                  if (isMobile()) setMobileOpen(false);
                }}
              >
                <item.Icon />
                <span className="td-nav-text">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="td-sidebar-footer">
          <div className="td-user-card">
            <div className="td-user-avatar" aria-hidden />
            <div className="td-user-meta">
              <strong>{TEACHER_NAME}</strong>
              <small>
                <span className="td-dot-on" aria-hidden />
                Mathematics Teacher · Online
              </small>
            </div>
          </div>
          <Link href="/teacher/login" className="td-btn-logout">
            <IconLogout />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      <div className="td-main">
        <header className="td-topbar">
          <button type="button" className="td-hamburger" aria-label="Toggle sidebar" onClick={toggleSidebar}>
            <IconMenu />
          </button>
          <div className="td-search-wrap">
            <IconSearch className="td-search-ic" />
            <input
              type="search"
              placeholder="Search students, classes, notes..."
              aria-label="Search"
              readOnly
              onFocus={() => setSearchOpen(true)}
              onClick={() => setSearchOpen(true)}
            />
            <kbd className="td-kbd">⌘ K</kbd>
          </div>
          <div className="td-topbar-right">
            <span className="td-badge-ok">
              <span className="td-pulse" aria-hidden />
              All Systems Operational
            </span>
            <span className="td-date">
              <IconCalendarSmall />
              8 May 2026, Thursday
            </span>
            <div className="td-dropdown-wrap" ref={notifyRef}>
              <button
                type="button"
                className="td-icon-btn"
                aria-label="Notifications"
                aria-expanded={notifyOpen}
                onClick={() => {
                  setNotifyOpen((v) => !v);
                  setProfileOpen(false);
                  setQuickOpen(false);
                }}
              >
                <IconBell />
                <span className="td-notify-badge">6</span>
              </button>
              {notifyOpen ? (
                <div className="td-dropdown">
                  <div className="td-dd-head">Notifications</div>
                  <button type="button" className="td-dd-item" onClick={() => go("homework", "12 submissions to review (demo)")}>
                    <strong>Homework queue</strong>
                    <small>12 pending reviews</small>
                  </button>
                  <button type="button" className="td-dd-item" onClick={() => go("messages", "New parent message (demo)")}>
                    <strong>Parent message</strong>
                    <small>Re: doubt in Ch. 5</small>
                  </button>
                  <button type="button" className="td-dd-item" onClick={() => go("notices", "New notice published (demo)")}>
                    <strong>Notice</strong>
                    <small>Summer vacation dates</small>
                  </button>
                  <div className="td-dd-div" />
                  <button type="button" className="td-dd-item" onClick={() => go("dashboard", "All read (demo)")}>
                    <small>Mark all as read</small>
                  </button>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="td-theme-btn"
              aria-label={themeDark ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => {
                setThemeDark((v) => !v);
                showToast(themeDark ? "Light theme (demo)" : "Dark theme (demo)");
              }}
            >
              {themeDark ? <IconSun /> : <IconMoon />}
            </button>
            <div className="td-dropdown-wrap" ref={profileRef}>
              <button
                type="button"
                className="td-profile-btn"
                aria-expanded={profileOpen}
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setNotifyOpen(false);
                  setQuickOpen(false);
                }}
              >
                <span className="td-profile-mini" aria-hidden />
                <span>
                  {TEACHER_NAME}
                  <br />
                  <small style={{ fontWeight: 500, color: "var(--td-muted)" }}>Teacher</small>
                </span>
                <IconChevron />
              </button>
              {profileOpen ? (
                <div className="td-dropdown td-dropdown-wide">
                  <button type="button" className="td-dd-item" onClick={() => showToast("Demo: My profile")}>
                    <strong>My profile</strong>
                  </button>
                  <button type="button" className="td-dd-item" onClick={() => go("settings", "Settings (demo)")}>
                    <strong>Settings</strong>
                  </button>
                  <button type="button" className="td-dd-item" onClick={() => showToast("Demo: Help")}>
                    <strong>Help center</strong>
                  </button>
                  <div className="td-dd-div" />
                  <Link href="/teacher/login" className="td-dd-item" onClick={() => setProfileOpen(false)}>
                    Sign out
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="td-content">
          <div className="td-welcome-row">
            <div>
              <h1>{pageTitle}</h1>
              <p>{pageSub}</p>
            </div>
            <div className="td-quick-wrap" ref={quickRef}>
              <button
                type="button"
                className="td-btn-quick"
                aria-expanded={quickOpen}
                onClick={() => {
                  setQuickOpen((v) => !v);
                  setNotifyOpen(false);
                  setProfileOpen(false);
                }}
              >
                <IconBolt />
                Quick Actions
                <IconChevronSmall style={{ transform: quickOpen ? "rotate(270deg)" : "rotate(90deg)" }} />
              </button>
              {quickOpen ? (
                <div className="td-dropdown td-dropdown-wide td-dd-quick">
                  <div className="td-dd-head">Shortcuts</div>
                  <button type="button" className="td-dd-item" onClick={() => go("attendance", "Mark attendance (demo)")}>
                    Mark attendance
                  </button>
                  <button type="button" className="td-dd-item" onClick={() => go("homework", "Upload homework (demo)")}>
                    Upload homework
                  </button>
                  <button type="button" className="td-dd-item" onClick={() => go("results", "Upload results (demo)")}>
                    Upload results
                  </button>
                  <button type="button" className="td-dd-item" onClick={() => go("notices", "Send notice (demo)")}>
                    Send notice
                  </button>
                  <button type="button" className="td-dd-item" onClick={() => go("timetable", "Timetable (demo)")}>
                    View timetable
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {activeNav === "dashboard" ? (
            <>
              <section className="td-stat-grid" aria-label="Summary">
                {([
                  {
                    ic: "#dbeafe",
                    c: "#1d4ed8",
                    v: "4",
                    l: "My Classes",
                    sub: "Classes assigned",
                    nav: "my-classes" as TeacherNavKey,
                  },
                  {
                    ic: "#dcfce7",
                    c: "#15803d",
                    v: "128",
                    l: "Students",
                    sub: "Total students",
                    nav: "students",
                  },
                  {
                    ic: "#ffedd5",
                    c: "#c2410c",
                    v: "4",
                    l: "Today's Classes",
                    sub: "Classes today",
                    nav: "timetable",
                  },
                  {
                    ic: "#f3e8ff",
                    c: "#7c3aed",
                    v: "92.6%",
                    l: "Attendance Today",
                    sub: "Average attendance",
                    nav: "attendance",
                  },
                  {
                    ic: "#fce7f3",
                    c: "#be185d",
                    v: "12",
                    l: "Pending Homework",
                    sub: "To review",
                    nav: "homework",
                  },
                  {
                    ic: "#e0f2fe",
                    c: "#0369a1",
                    v: "3",
                    l: "Upcoming Exams",
                    sub: "This month",
                    nav: "results",
                  },
                ] as {
                  ic: string;
                  c: string;
                  v: string;
                  l: string;
                  sub: string;
                  nav: TeacherNavKey;
                }[]).map((s) => (
                  <article key={s.l} className="td-stat-card">
                    <div className="td-stat-ic" style={{ background: s.ic, color: s.c }}>
                      <IconChartMini />
                    </div>
                    <strong>{s.v}</strong>
                    <label>{s.l}</label>
                    <p className="td-muted" style={{ margin: "0.25rem 0 0", fontSize: "0.78rem" }}>
                      {s.sub}
                    </p>
                    <button type="button" className="td-view" onClick={() => go(s.nav, `View: ${s.l}`)}>
                      View
                    </button>
                  </article>
                ))}
              </section>

              <section className="td-mid-grid">
                <div className="td-panel">
                  <div className="td-panel-head">
                    <h3>Today&apos;s Classes</h3>
                    <button type="button" className="td-select" style={{ cursor: "pointer" }} onClick={() => showToast("Filter: Today (demo)")}>
                      Today ▾
                    </button>
                  </div>
                  <div className="td-timeline">
                    {[
                      { time: "08:00 – 09:00", cls: "Class X - Section A", sub: "Mathematics", st: "done" as const },
                      { time: "09:05 – 10:00", cls: "Class IX - Section B", sub: "Mathematics", st: "done" as const },
                      { time: "10:40 – 11:30", cls: "Class VIII - A", sub: "Mathematics", st: "up" as const },
                      { time: "12:20 – 13:10", cls: "Class XI - Science", sub: "Mathematics", st: "up" as const },
                    ].map((row) => (
                      <div key={row.time} className="td-tl-item">
                        <div className="td-tl-time">{row.time}</div>
                        <div className="td-tl-body">
                          <strong>{row.cls}</strong>
                          <small>{row.sub}</small>
                          <span className={`td-badge ${row.st === "done" ? "td-badge-done" : "td-badge-up"}`}>
                            {row.st === "done" ? "Completed" : "Upcoming"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="td-panel-head" style={{ marginTop: "1rem" }}>
                    <h3>Student Performance</h3>
                    <select className="td-select" defaultValue="avg" onChange={(e) => showToast(`Metric: ${e.target.value} (demo)`)}>
                      <option value="avg">Class average</option>
                      <option value="test">Latest test</option>
                    </select>
                  </div>
                  <div className="td-bar-performance" role="img" aria-label="Bar chart Class X 88 IX 76 VIII 82 percent">
                    {[88, 76, 82].map((h, i) => (
                      <div key={i} className="td-bar-p" style={{ height: `${h}%` }} title={`${["X", "IX", "VIII"][i]}: ${h}%`} />
                    ))}
                  </div>
                  <div className="td-bar-labels">
                    <span>Class X</span>
                    <span>Class IX</span>
                    <span>Class VIII</span>
                  </div>
                  <p className="td-overall">Overall average: 73%</p>
                </div>

                <div className="td-panel">
                  <div className="td-panel-head">
                    <h3>Attendance Overview</h3>
                    <select className="td-select" defaultValue="week" onChange={(e) => showToast(`Attendance: ${e.target.value} (demo)`)}>
                      <option value="week">This week</option>
                      <option value="month">This month</option>
                    </select>
                  </div>
                  <div className="td-chart-h" style={{ position: "relative" }}>
                    <TeacherWeekLineChart />
                    <div
                      style={{
                        position: "absolute",
                        top: "8%",
                        right: "6%",
                        background: "var(--td-card)",
                        border: "1px solid var(--td-border)",
                        borderRadius: 8,
                        padding: "0.35rem 0.5rem",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        boxShadow: "0 4px 12px rgba(15,23,42,0.1)",
                      }}
                    >
                      92.6% · 8 May
                    </div>
                  </div>
                  <div className="td-panel-head" style={{ marginTop: "0.5rem" }}>
                    <h3>Recent Notices</h3>
                    <button
                      type="button"
                      className="td-select"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setShowAllNotices((v) => {
                          const next = !v;
                          showToast(next ? "View all notices (demo)" : "Showing fewer notices");
                          return next;
                        });
                      }}
                    >
                      {showAllNotices ? "Show less" : "View all"}
                    </button>
                  </div>
                  <div>
                    {noticesList.map((n) => (
                      <div key={n.title} className="td-notice-item">
                        <strong>{n.title}</strong>
                        <small>
                          {n.date} · {n.time}
                        </small>
                        <button type="button" className="td-link-btn" style={{ marginTop: "0.35rem" }} onClick={() => go("notices", `Read: ${n.title}`)}>
                          Open
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="td-panel">
                  <div className="td-panel-head">
                    <h3>Pending Homework Review</h3>
                    <button type="button" className="td-select" style={{ cursor: "pointer" }} onClick={() => go("homework", "Full queue (demo)")}>
                      View all
                    </button>
                  </div>
                  {[
                    { t: "Algebra problem set · X-A", due: "Due 12 May", n: "4 pending" },
                    { t: "Geometry worksheet · IX-B", due: "Due 11 May", n: "8 pending" },
                  ].map((h) => (
                    <div key={h.t} className="td-hw-item">
                      <div>
                        <strong style={{ fontSize: "0.8125rem" }}>{h.t}</strong>
                        <small className="td-muted" style={{ display: "block", marginTop: "0.2rem" }}>
                          {h.due}
                        </small>
                      </div>
                      <button type="button" className="td-btn-secondary" style={{ padding: "0.35rem 0.6rem", fontSize: "0.72rem" }} onClick={() => go("homework", `Review ${h.n}`)}>
                        {h.n}
                      </button>
                    </div>
                  ))}
                  <h3 style={{ margin: "1rem 0 0", fontSize: "0.9375rem" }}>Quick Actions</h3>
                  <div className="td-quick-grid">
                    <button type="button" className="td-qbtn td-q1" onClick={() => go("attendance", "Mark attendance")}>
                      Mark Attendance
                    </button>
                    <button type="button" className="td-qbtn td-q2" onClick={() => go("homework", "Upload homework")}>
                      Upload Homework
                    </button>
                    <button type="button" className="td-qbtn td-q3" onClick={() => go("results", "Upload results")}>
                      Upload Results
                    </button>
                    <button type="button" className="td-qbtn td-q4" onClick={() => go("notices", "Send notice")}>
                      Send Notice
                    </button>
                    <button type="button" className="td-qbtn td-q5" onClick={() => go("timetable", "Timetable")}>
                      View Timetable
                    </button>
                    <button type="button" className="td-qbtn td-q6" onClick={() => go("messages", "Open messages")}>
                      Open Messages
                    </button>
                  </div>
                  <div className="td-panel-head" style={{ marginTop: "1rem" }}>
                    <h3>Upcoming Exams</h3>
                  </div>
                  {[
                    { d: "15", m: "May", t: "Unit Test — Mathematics", time: "09:00 AM" },
                    { d: "22", m: "May", t: "Pre-board Practical", time: "10:30 AM" },
                    { d: "28", m: "May", t: "Internal Assessment", time: "08:30 AM" },
                  ].map((ex) => (
                    <div key={ex.t} className="td-exam-item">
                      <div className="td-exam-date">
                        <strong>{ex.d}</strong>
                        <small>{ex.m}</small>
                      </div>
                      <div>
                        <strong style={{ fontSize: "0.8125rem" }}>{ex.t}</strong>
                        <small className="td-muted" style={{ display: "block" }}>
                          {ex.time}
                        </small>
                        <button type="button" className="td-link-btn" style={{ marginTop: "0.35rem" }} onClick={() => go("results", `Exam: ${ex.t}`)}>
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="td-bottom-table-wrap" aria-label="My classes overview">
                <div className="td-panel-head" style={{ padding: "1rem 1rem 0" }}>
                  <h3 style={{ margin: 0 }}>My Classes Overview</h3>
                  <button type="button" className="td-select" style={{ cursor: "pointer" }} onClick={() => showToast("Export table (demo)")}>
                    Export
                  </button>
                </div>
                <table className="td-data-table">
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Subject</th>
                      <th>Students</th>
                      <th>Attendance (Today)</th>
                      <th>Avg. Performance</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classesTable.map((r) => (
                      <tr key={r.cls}>
                        <td>{r.cls}</td>
                        <td>{r.subj}</td>
                        <td>{r.students}</td>
                        <td>
                          {r.att}%
                          <div className="td-mini-track">
                            <span style={{ width: `${r.att}%` }} />
                          </div>
                        </td>
                        <td>
                          {r.perf}%
                          <div className="td-mini-track">
                            <span style={{ width: `${r.perf}%` }} />
                          </div>
                        </td>
                        <td>
                          <div className="td-action-ic">
                            <button type="button" className="td-ic-btn" aria-label="View details" onClick={() => go("my-classes", `Details ${r.cls}`)}>
                              <IconEye />
                            </button>
                            <button type="button" className="td-ic-btn" aria-label="Analytics" onClick={() => go("results", `Analytics ${r.cls}`)}>
                              <IconChartMini />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          ) : (
            <TeacherDemoView nav={activeNav} toast={showToast} />
          )}
        </div>
      </div>
    </div>
  );
}

function TeacherWeekLineChart() {
  const w = 360;
  const h = 110;
  const pad = 10;
  const days = 6;
  const vals = [0.88, 0.9, 0.87, 0.91, 0.89, 0.926];
  const toX = (i: number) => pad + (i / (days - 1)) * (w - pad * 2);
  const toY = (v: number) => h - pad - v * (h - pad * 2);
  const d = vals.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`).join(" ");
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <svg viewBox={`0 0 ${w} ${h + 22}`} width="100%" height="160" preserveAspectRatio="xMidYMid meet" style={{ position: "relative" }}>
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={pad} x2={w - pad} y1={toY(t)} y2={toY(t)} stroke="var(--td-border)" strokeWidth="1" />
      ))}
      <path
        d={d}
        fill="none"
        stroke="var(--td-blue)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {vals.map((v, i) => (
        <circle key={i} cx={toX(i)} cy={toY(v)} r="4" fill="var(--td-card)" stroke="var(--td-blue)" strokeWidth="2" />
      ))}
      {labels.map((lb, i) => (
        <text key={lb} x={toX(i) - 10} y={h + 16} fill="var(--td-muted)" fontSize="9">
          {lb}
        </text>
      ))}
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

function IconBookOpen() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
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

function IconFile() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconMessage() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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

function IconWallet() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M16 12h5v4h-5a2 2 0 0 1 0-4z" />
      <path d="M3 8l13-4" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
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

function IconChevron(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconChevronSmall(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconChartMini() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
