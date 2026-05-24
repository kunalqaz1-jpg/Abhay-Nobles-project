import { Link } from "wouter";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SVGProps } from "react";
import { TeacherDemoView, type TeacherNavKey } from "./teacher-demo-views";
import "./teacher-dashboard.css";

function getTeacherSession() {
  try {
    const s = sessionStorage.getItem("abhay_teacher_session");
    if (s) return JSON.parse(s) as { teacherId: string; name: string; subject: string };
  } catch {
    // ignore
  }
  return null;
}

type TeacherDashboardData = {
  teacher?: { teacherId?: string; name?: string; subject?: string; assignedClasses?: string[] };
  students?: Array<{ className: string; fullName?: string; rollNo?: string }>;
  homework?: Array<{ id?: string; className: string; title?: string; dueDate?: string }>;
  results?: Array<{ id?: string; title?: string; className?: string; createdAt?: string }>;
  notices?: Array<{ id?: string; title: string; createdAt?: string }>;
  messages?: Array<{ id?: string; subject?: string; studentName?: string; className?: string; sentAt?: string }>;
  timetable?: Array<{ id?: string; className: string; subject: string; time: string; period: string }>;
  attendance?: Array<{ className: string; date: string; presentCount: number; totalStudents: number }>;
};

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
  { title: "Events", sub: "School events & activities", nav: "events", keywords: "event activity sports cultural" },
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
  { id: "events", label: "Events", Icon: IconEvent },
  { id: "study-material", label: "Study Material", Icon: IconFolder },
  { id: "settings", label: "Settings", Icon: IconGear },
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
  const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null);
  const session = getTeacherSession();
  const teacherName = session?.name ?? "Teacher";

  const quickRef = useRef<HTMLDivElement>(null);
  const notifyRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((message: string) => setToast(message), []);

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
        window.setTimeout(() => searchRef.current?.focus(), 50);
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
    function onMouseDown(e: MouseEvent) {
      const t = e.target as Node;
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
    const teacherId = session?.teacherId;
    const token = (() => {
      try {
        return sessionStorage.getItem("abhay_teacher_token") ?? "";
      } catch {
        return "";
      }
    })();
    if (!teacherId || !token) return;

    fetch(`/api/teachers/${encodeURIComponent(teacherId)}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load teacher dashboard"))))
      .then((data) => setDashboardData(data as TeacherDashboardData))
      .catch(() => {});
  }, [session?.teacherId]);

  const isMobile = () => typeof window !== "undefined" && window.innerWidth <= 900;

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
    return item.title.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q) || item.keywords.includes(q);
  });

  const assignedClasses = useMemo(
    () =>
      [...new Set((dashboardData?.teacher?.assignedClasses ?? [])
        .map((value) => {
          const raw = String(value || "").trim();
          if (!raw) return "";
          if (raw.includes("|")) {
            const [className = "", section = ""] = raw.split("|").map((part) => part.trim());
            return section ? `${className}-${section}` : className;
          }
          return raw;
        })
        .filter(Boolean))],
    [dashboardData?.teacher?.assignedClasses],
  );
  const students = dashboardData?.students ?? [];
  const homework = dashboardData?.homework ?? [];
  const results = dashboardData?.results ?? [];
  const notices = dashboardData?.notices ?? [];
  const messages = dashboardData?.messages ?? [];
  const timetable = dashboardData?.timetable ?? [];
  const attendance = dashboardData?.attendance ?? [];

  const summaryCards = [
    { ic: "#dbeafe", c: "#1d4ed8", v: String(assignedClasses.length), l: "My Classes", sub: "Assigned sections", nav: "my-classes" as TeacherNavKey },
    { ic: "#dcfce7", c: "#15803d", v: String(students.length), l: "Students", sub: "Real student records", nav: "students" as TeacherNavKey },
    { ic: "#ffedd5", c: "#c2410c", v: String(timetable.length), l: "Timetable Rows", sub: "Live schedule", nav: "timetable" as TeacherNavKey },
    { ic: "#f3e8ff", c: "#7c3aed", v: String(homework.length), l: "Homework", sub: "Uploaded items", nav: "homework" as TeacherNavKey },
    { ic: "#fce7f3", c: "#be185d", v: String(results.length), l: "Results", sub: "Uploaded result files", nav: "results" as TeacherNavKey },
    {
      ic: "#e0f2fe",
      c: "#0369a1",
      v: `${attendance[0]?.totalStudents ? Math.round((attendance[0].presentCount / attendance[0].totalStudents) * 100) : 0}%`,
      l: "Latest Attendance",
      sub: "Most recent saved class",
      nav: "attendance" as TeacherNavKey,
    },
  ];

  const noticesToShow = (showAllNotices ? notices : notices.slice(0, 3)).map((item) => ({
    title: item.title,
    when: item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Recent",
  }));

  const messageAlerts = messages.slice(0, 3).map((item) => ({
    title: item.subject || "Message",
    detail: item.studentName ? `Student: ${item.studentName}` : item.className ? `Class: ${item.className}` : "Broadcast message",
  }));

  const homeworkAlerts = homework.slice(0, 3).map((item) => ({
    title: item.title || "Homework",
    detail: item.className,
  }));

  const classOverview = (assignedClasses.length ? assignedClasses : [...new Set(students.map((student) => student.className).filter(Boolean))]).map((className) => {
    const row = attendance.find((item) => item.className === className);
    const pct = row?.totalStudents ? Math.round((row.presentCount / row.totalStudents) * 100) : 0;
    return {
      className,
      subject: dashboardData?.teacher?.subject ?? session?.subject ?? "Subject",
      students: students.filter((student) => student.className === className).length,
      attendance: pct,
      lastDate: row?.date ?? "No record",
    };
  });

  const pageTitle = activeNav === "dashboard" ? `Welcome back, ${teacherName}` : NAV_DEF.find((n) => n.id === activeNav)?.label ?? "Dashboard";
  const pageSub = activeNav === "dashboard"
    ? `You are connected to ${students.length} students across ${classOverview.length} classes.`
    : NAV_DEF.find((n) => n.id === activeNav)?.label ?? "";

  return (
    <div className={`td-erp ${narrow ? "td-narrow" : ""} ${themeDark ? "td-dark" : ""} ${mobileOpen ? "td-mobile-open" : ""}`}>
      {toast ? <div className="td-toast" role="status">{toast}</div> : null}

      <button type="button" className="td-sidebar-overlay" aria-label="Close menu" onClick={() => setMobileOpen(false)} />

      {searchOpen ? (
        <div className="td-search-overlay" role="dialog" aria-modal="true" aria-label="Search" onMouseDown={(e) => e.target === e.currentTarget && setSearchOpen(false)}>
          <div className="td-search-modal" onMouseDown={(e) => e.stopPropagation()}>
            <input ref={searchRef} type="search" placeholder="Search students, classes, notes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} aria-label="Command search" />
            <p className="td-search-hint">Pick a module. Esc to close.</p>
            <div className="td-search-res">
              {filteredSearch.map((item) => (
                <button key={item.nav + item.title} type="button" className="td-sres-btn" onClick={() => go(item.nav, `Opened: ${item.title}`)}>
                  {item.title}
                  <span>{item.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <aside className="td-sidebar" aria-label="Teacher navigation">
        <div className="td-brand">
          <div className="td-logo" aria-hidden>SAN</div>
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
              <strong>{teacherName}</strong>
              <small>
                <span className="td-dot-on" aria-hidden />
                {session?.subject ?? "Teacher"} · Online
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
          <button type="button" className="td-hamburger" aria-label="Toggle sidebar" onClick={() => isMobile() ? setMobileOpen((v) => !v) : setNarrow((v) => !v)}>
            <IconMenu />
          </button>
          <div className="td-search-wrap">
            <IconSearch className="td-search-ic" />
            <input type="search" placeholder="Search students, classes, notes..." aria-label="Search" readOnly onFocus={() => setSearchOpen(true)} onClick={() => setSearchOpen(true)} />
            <kbd className="td-kbd">Ctrl K</kbd>
          </div>
          <div className="td-topbar-right">
            <span className="td-badge-ok">
              <span className="td-pulse" aria-hidden />
              Live Data Connected
            </span>
            <span className="td-date">
              <IconCalendarSmall />
              {new Date().toLocaleDateString("en-IN", { dateStyle: "medium" })}
            </span>
            <div className="td-dropdown-wrap" ref={notifyRef}>
              <button type="button" className="td-icon-btn" aria-label="Notifications" aria-expanded={notifyOpen} onClick={() => { setNotifyOpen((v) => !v); setProfileOpen(false); setQuickOpen(false); }}>
                <IconBell />
                <span className="td-notify-badge">{messageAlerts.length + homeworkAlerts.length}</span>
              </button>
              {notifyOpen ? (
                <div className="td-dropdown">
                  <div className="td-dd-head">Recent Updates</div>
                  {[...messageAlerts, ...homeworkAlerts].slice(0, 4).map((item) => (
                    <button key={item.title + item.detail} type="button" className="td-dd-item" onClick={() => go(item.detail.startsWith("Class") ? "messages" : "homework", item.title)}>
                      <strong>{item.title}</strong>
                      <small>{item.detail}</small>
                    </button>
                  ))}
                  {!messageAlerts.length && !homeworkAlerts.length ? <div className="td-dd-item"><small>No recent updates yet.</small></div> : null}
                </div>
              ) : null}
            </div>
            <button type="button" className="td-theme-btn" aria-label={themeDark ? "Switch to light mode" : "Switch to dark mode"} onClick={() => setThemeDark((v) => !v)}>
              {themeDark ? <IconSun /> : <IconMoon />}
            </button>
            <div className="td-dropdown-wrap" ref={profileRef}>
              <button type="button" className="td-profile-btn" aria-expanded={profileOpen} onClick={() => { setProfileOpen((v) => !v); setNotifyOpen(false); setQuickOpen(false); }}>
                <span className="td-profile-mini" aria-hidden />
                <span>
                  {teacherName}
                  <br />
                  <small style={{ fontWeight: 500, color: "var(--td-muted)" }}>{session?.subject ?? "Teacher"}</small>
                </span>
                <IconChevron />
              </button>
              {profileOpen ? (
                <div className="td-dropdown td-dropdown-wide">
                  <button type="button" className="td-dd-item" onClick={() => go("settings", "Profile settings")}>
                    <strong>Profile Settings</strong>
                  </button>
                  <button type="button" className="td-dd-item" onClick={() => go("messages", "Messages")}>
                    <strong>Messages</strong>
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
              <button type="button" className="td-btn-quick" aria-expanded={quickOpen} onClick={() => { setQuickOpen((v) => !v); setNotifyOpen(false); setProfileOpen(false); }}>
                <IconBolt />
                Quick Actions
                <IconChevronSmall style={{ transform: quickOpen ? "rotate(270deg)" : "rotate(90deg)" }} />
              </button>
              {quickOpen ? (
                <div className="td-dropdown td-dropdown-wide td-dd-quick">
                  <div className="td-dd-head">Shortcuts</div>
                  <button type="button" className="td-dd-item" onClick={() => go("attendance", "Mark attendance")}>Mark attendance</button>
                  <button type="button" className="td-dd-item" onClick={() => go("homework", "Upload homework")}>Upload homework</button>
                  <button type="button" className="td-dd-item" onClick={() => go("results", "Upload results")}>Upload results</button>
                  <button type="button" className="td-dd-item" onClick={() => go("timetable", "Open timetable")}>Open timetable</button>
                </div>
              ) : null}
            </div>
          </div>

          {activeNav === "dashboard" ? (
            <>
              <section className="td-stat-grid" aria-label="Summary">
                {summaryCards.map((s) => (
                  <article key={s.l} className="td-stat-card">
                    <div className="td-stat-ic" style={{ background: s.ic, color: s.c }}>
                      <IconChartMini />
                    </div>
                    <strong>{s.v}</strong>
                    <label>{s.l}</label>
                    <p className="td-muted" style={{ margin: "0.25rem 0 0", fontSize: "0.78rem" }}>{s.sub}</p>
                    <button type="button" className="td-view" onClick={() => go(s.nav, `View: ${s.l}`)}>View</button>
                  </article>
                ))}
              </section>

              <section className="td-mid-grid">
                <div className="td-panel">
                  <div className="td-panel-head">
                    <h3>Today's Classes</h3>
                    <button type="button" className="td-select" style={{ cursor: "pointer" }} onClick={() => go("timetable", "Timetable")}>Open</button>
                  </div>
                  <div className="td-timeline">
                    {timetable.length ? timetable.slice(0, 5).map((row) => (
                      <div key={`${row.className}-${row.period}-${row.time}`} className="td-tl-item">
                        <div className="td-tl-time">{row.time}</div>
                        <div className="td-tl-body">
                          <strong>{row.className}</strong>
                          <small>{row.subject} · Period {row.period}</small>
                          <span className="td-badge td-badge-up">Scheduled</span>
                        </div>
                      </div>
                    )) : <p className="td-muted">No timetable rows have been saved yet.</p>}
                  </div>
                </div>

                <div className="td-panel">
                  <div className="td-panel-head">
                    <h3>Recent Notices</h3>
                    <button type="button" className="td-select" style={{ cursor: "pointer" }} onClick={() => setShowAllNotices((v) => !v)}>
                      {showAllNotices ? "Show less" : "View all"}
                    </button>
                  </div>
                  <div>
                    {noticesToShow.length ? noticesToShow.map((notice) => (
                      <div key={notice.title + notice.when} className="td-notice-item">
                        <strong>{notice.title}</strong>
                        <small>{notice.when}</small>
                        <button type="button" className="td-link-btn" style={{ marginTop: "0.35rem" }} onClick={() => go("notices", notice.title)}>Open</button>
                      </div>
                    )) : <p className="td-muted">No notices published yet.</p>}
                  </div>
                </div>

                <div className="td-panel">
                  <div className="td-panel-head">
                    <h3>Recent Homework</h3>
                    <button type="button" className="td-select" style={{ cursor: "pointer" }} onClick={() => go("homework", "Homework")}>View all</button>
                  </div>
                  {homework.length ? homework.slice(0, 4).map((item) => (
                    <div key={item.id ?? item.title} className="td-hw-item">
                      <div>
                        <strong style={{ fontSize: "0.8125rem" }}>{item.title || "Homework"}</strong>
                        <small className="td-muted" style={{ display: "block", marginTop: "0.2rem" }}>
                          {item.className} · {item.dueDate ? `Due ${item.dueDate}` : "Due date not set"}
                        </small>
                      </div>
                      <button type="button" className="td-btn-secondary" style={{ padding: "0.35rem 0.6rem", fontSize: "0.72rem" }} onClick={() => go("homework", item.title || "Homework")}>
                        Open
                      </button>
                    </div>
                  )) : <p className="td-muted">No homework has been uploaded yet.</p>}
                  <h3 style={{ margin: "1rem 0 0", fontSize: "0.9375rem" }}>Quick Actions</h3>
                  <div className="td-quick-grid">
                    <button type="button" className="td-qbtn td-q1" onClick={() => go("attendance", "Mark attendance")}>Mark Attendance</button>
                    <button type="button" className="td-qbtn td-q2" onClick={() => go("homework", "Upload homework")}>Upload Homework</button>
                    <button type="button" className="td-qbtn td-q3" onClick={() => go("results", "Upload results")}>Upload Results</button>
                    <button type="button" className="td-qbtn td-q4" onClick={() => go("notices", "Send notice")}>Send Notice</button>
                    <button type="button" className="td-qbtn td-q5" onClick={() => go("timetable", "Timetable")}>View Timetable</button>
                    <button type="button" className="td-qbtn td-q6" onClick={() => go("messages", "Open messages")}>Open Messages</button>
                  </div>
                </div>
              </section>

              <section className="td-bottom-table-wrap" aria-label="My classes overview">
                <div className="td-panel-head" style={{ padding: "1rem 1rem 0" }}>
                  <h3 style={{ margin: 0 }}>My Classes Overview</h3>
                  <button type="button" className="td-select" style={{ cursor: "pointer" }} onClick={() => go("my-classes", "My classes")}>Open</button>
                </div>
                <table className="td-data-table">
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Subject</th>
                      <th>Students</th>
                      <th>Attendance</th>
                      <th>Last Saved</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classOverview.length ? classOverview.map((row) => (
                      <tr key={row.className}>
                        <td>{row.className}</td>
                        <td>{row.subject}</td>
                        <td>{row.students}</td>
                        <td>
                          {row.attendance}%
                          <div className="td-mini-track">
                            <span style={{ width: `${row.attendance}%` }} />
                          </div>
                        </td>
                        <td>{row.lastDate}</td>
                        <td>
                          <div className="td-action-ic">
                            <button type="button" className="td-ic-btn" aria-label="View details" onClick={() => go("my-classes", row.className)}>
                              <IconEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="td-muted">No assigned classes found yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            </>
          ) : (
            <TeacherDemoView
              nav={activeNav}
              toast={showToast}
              assignedClasses={assignedClasses}
              students={students}
              teacherSubject={dashboardData?.teacher?.subject ?? session?.subject}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function IconLayout() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>;
}
function IconBookOpen() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
}
function IconCheck() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
}
function IconFile() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
}
function IconChart() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
}
function IconUsers() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}
function IconCalendar() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
}
function IconBell() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
}
function IconMessage() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
}
function IconFolder() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>;
}
function IconGear() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>;
}
function IconWallet() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M16 12h5v4h-5a2 2 0 0 1 0-4z" /><path d="M3 8l13-4" /></svg>;
}
function IconMenu() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
}
function IconSearch({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
}
function IconCalendarSmall() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
}
function IconEvent() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}
function IconLogout() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
}
function IconBolt() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" /></svg>;
}
function IconChevron(props: SVGProps<SVGSVGElement>) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><polyline points="6 9 12 15 18 9" /></svg>;
}
function IconChevronSmall(props: SVGProps<SVGSVGElement>) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><polyline points="6 9 12 15 18 9" /></svg>;
}
function IconSun() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>;
}
function IconMoon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
}
function IconEye() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
}
function IconChartMini() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
}
