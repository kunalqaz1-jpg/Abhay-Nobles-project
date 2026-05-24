import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || "/api";

function getStudentToken() {
  try { return localStorage.getItem("abhay_student_token") ?? ""; } catch { return ""; }
}

async function apiFetch(path: string, init?: RequestInit) {
  const token = getStudentToken();
  const res = await fetch(API_BASE + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
}

const NAV = [
  { id: "profile", label: "Profile", icon: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { id: "attendance", label: "Attendance", icon: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> },
  { id: "homework", label: "Homework", icon: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M8 7h8M8 11h8"/></svg> },
  { id: "results", label: "Results", icon: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg> },
  { id: "fees", label: "Fees", icon: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg> },
  { id: "notices", label: "Notices", icon: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg> },
  { id: "material", label: "Study Material", icon: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg> },
  { id: "timetable", label: "Timetable", icon: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
  { id: "events", label: "Events", icon: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { id: "messages", label: "Messages", icon: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
];

type HomeworkItem = { subject: string; title: string; description?: string; dueDate: string; status: string; fileName?: string; fileData?: string; fileMimeType?: string; teacherName?: string };
type ResultItem = { id: string; title: string; subject: string; examType: string; fileName?: string; fileData?: string; fileMimeType?: string; teacherName?: string; createdAt: string };
type MaterialItem = { title: string; type: string; fileName?: string; fileData?: string; fileMimeType?: string; videoUrl?: string };

type DashboardData = {
  student: {
    studentId: string;
    fullName: string;
    className: string;
    section: string;
    rollNo: string;
    photo: string;
    parents: { relation: string; name: string; phone: string }[];
    fees: { currentTermStatus: string; currentTermNote: string; nextDueAmount: string; nextDueLabel: string; history: { period: string; amount: string; status: string }[] };
  };
  attendance:
    | {
        className: string;
        date: string;
        teacherName: string;
        updatedAt: string;
        presentCount: number;
        absentCount: number;
        totalStudents: number;
        studentEntry: { studentId: string; studentName?: string; status: string; remark?: string } | null;
        entries: { studentId: string; studentName?: string; status: string; remark?: string }[];
      }
    | null;
  homework: HomeworkItem[];
  result: ResultItem[] | null;
  notices: { title: string; type: string; date: string }[];
  materials: MaterialItem[];
  timetable: { period: string; time: string; subject: string }[];
  events: { name: string; detail: string; date: string }[];
  messages: { from: string; subject: string; date: string; body: string }[];
};

export default function StudentPortal() {
  const [view, setView] = useState<"login" | "dashboard">("login");
  const [activePanel, setActivePanel] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [welcomeName, setWelcomeName] = useState("Student");
  const hwFileRef = useRef<HTMLInputElement>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrSeconds, setQrSeconds] = useState(240);
  const qrTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function openQr() {
    if (qrTimerRef.current) clearInterval(qrTimerRef.current);
    setQrSeconds(240);
    setQrOpen(true);
    qrTimerRef.current = setInterval(() => {
      setQrSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(qrTimerRef.current!);
          setQrOpen(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function closeQr() {
    if (qrTimerRef.current) clearInterval(qrTimerRef.current);
    setQrOpen(false);
  }

  function fmtQrTimer(sec: number) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function downloadDataFile(fileName: string, fileData: string) {
    const link = document.createElement("a");
    link.href = fileData;
    link.download = fileName || "download";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function openFile(fileName: string, fileData: string, videoUrl: string, mode: "view" | "download" = "view") {
    if (videoUrl) { window.open(videoUrl, "_blank"); return; }
    if (fileData) {
      if (mode === "download") {
        downloadDataFile(fileName, fileData);
        return;
      }
      window.open(fileData, "_blank");
      return;
    }
    if (fileName) { alert(`File "${fileName}" is listed, but its upload data is missing.`); return; }
    alert("No file attached.");
  }

  useEffect(() => {
    const saved = localStorage.getItem("abhay_student_session");
    if (saved) {
      try {
        const sess = JSON.parse(saved) as { studentId: string; name: string };
        setWelcomeName(sess.name.split(" ")[0]);
        void loadDashboard(sess.studentId, true);
      } catch {
        localStorage.removeItem("abhay_student_session");
      }
    }
    const rid = localStorage.getItem("abhay_student_remember_id");
    if (rid) setStudentId(rid);
  }, []);

  async function loadDashboard(sid: string, switchToDashboard = false) {
    try {
      const data = await apiFetch(`/students/${encodeURIComponent(sid)}/dashboard`);
      setDashData(data as DashboardData);
      setWelcomeName((data.student?.fullName || "Student").split(" ")[0]);
      if (switchToDashboard) setView("dashboard");
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load dashboard.";
      setLoginError(message || "Unable to load dashboard.");
      localStorage.removeItem("abhay_student_session");
      localStorage.removeItem("abhay_student_token");
      setDashData(null);
      setWelcomeName("");
      setView("login");
      return false;
    }
  }

  useEffect(() => {
    if (view !== "dashboard") return;
    const saved = localStorage.getItem("abhay_student_session");
    if (!saved) return;

    let sid = "";
    try {
      sid = (JSON.parse(saved) as { studentId: string }).studentId;
    } catch {
      return;
    }

    const timer = window.setInterval(() => {
      void loadDashboard(sid);
    }, 15000);

    return () => window.clearInterval(timer);
  }, [view]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    try {
      const data = await apiFetch("/students/login", {
        method: "POST",
        body: JSON.stringify({ studentId: studentId.trim(), password }),
      });
      if (!data.token) {
        throw new Error("Login failed.");
      }
      localStorage.setItem("abhay_student_token", data.token);
      localStorage.setItem("abhay_student_session", JSON.stringify({ studentId: studentId.trim(), name: data.student?.fullName || studentId }));
      if (remember) localStorage.setItem("abhay_student_remember_id", studentId.trim());
      setWelcomeName((data.student?.fullName || studentId).split(" ")[0]);
      const dashboardLoaded = await loadDashboard(studentId.trim(), true);
      if (!dashboardLoaded) {
        throw new Error("Unable to load student dashboard.");
      }
    } catch (error) {
      if (error instanceof Error && error.message !== "Invalid Student ID or password.") {
        setLoginError(error.message);
      } else {
        setLoginError("Invalid Student ID or password.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("abhay_student_session");
    localStorage.removeItem("abhay_student_token");
    setView("login");
    setDashData(null);
    setActivePanel("profile");
    setPassword("");
  }

  const student = dashData?.student;
  const latestAttendance = dashData?.attendance as
    | {
        date?: string;
        presentCount?: number;
        absentCount?: number;
        studentEntry?: { status?: string };
      }
    | null
    | undefined;
  const latestAttendanceStatus = latestAttendance?.studentEntry?.status ?? "Unknown";
  const latestAttendanceLabel = latestAttendance?.date ?? "No record";
  const latestPresentCount = latestAttendance?.presentCount ?? 0;
  const latestAbsentCount = latestAttendance?.absentCount ?? 0;
  const klass = student?.className ? `Class ${student.className} — Section ${student.section}` : "Unassigned";

  if (view === "login") {
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          :root {
            --navy: #0B1628; --navy-mid: #132040; --navy-light: #1E3060;
            --gold: #C9A84C; --gold-light: #E2C97E; --cream: #FAF7F0;
            --white: #FFFFFF; --slate: #64748B; --radius: 14px; --radius-sm: 8px;
            --font-display: 'Cormorant Garamond', serif; --font-body: 'Outfit', sans-serif;
          }
          .sp-login-wrap *, .sp-login-wrap *::before, .sp-login-wrap *::after { box-sizing: border-box; margin: 0; padding: 0; }
          .sp-login-wrap { font-family: var(--font-body); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem 1rem; position: relative; isolation: isolate; }
          .sp-login-bg { position: fixed; inset: 0; z-index: -1; background: linear-gradient(135deg, #060e1e 0%, #0B1628 35%, #132040 100%); overflow: hidden; }
          .sp-login-bg::before { content: ''; position: absolute; inset: -50%; background: radial-gradient(ellipse at 30% 20%, rgba(201,168,76,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(30,48,96,0.5) 0%, transparent 45%); animation: bgDrift 18s ease-in-out infinite alternate; }
          .sp-login-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(201,168,76,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.05) 1px, transparent 1px); background-size: 48px 48px; mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 75%); pointer-events: none; }
          @keyframes bgDrift { 0% { transform: translate(0, 0) rotate(0deg); } 100% { transform: translate(-4%, 3%) rotate(2deg); } }
          .sp-orb { position: absolute; border-radius: 50%; filter: blur(64px); animation: orbFloat 10s ease-in-out infinite; pointer-events: none; }
          .sp-orb-1 { width: 320px; height: 320px; background: rgba(201,168,76,0.12); top: 15%; left: 10%; }
          .sp-orb-2 { width: 280px; height: 280px; background: rgba(62,106,173,0.2); bottom: 12%; right: 8%; animation-delay: -5s; }
          @keyframes orbFloat { 0%, 100% { transform: translate(0, 0); opacity: 0.85; } 50% { transform: translate(24px, -20px); opacity: 1; } }
          .sp-back { position: fixed; top: 1.25rem; left: 1.25rem; z-index: 2; font-size: 0.85rem; color: rgba(255,255,255,0.55); display: flex; align-items: center; gap: 0.35rem; transition: color 0.2s; font-family: var(--font-body); text-decoration: none; }
          .sp-back:hover { color: var(--gold-light); }
          .sp-card { width: 100%; max-width: 420px; background: rgba(255,255,255,0.06); border: 1px solid rgba(201,168,76,0.22); border-radius: calc(var(--radius) + 4px); padding: 2.25rem 2rem; backdrop-filter: blur(20px); box-shadow: 0 24px 80px rgba(0,0,0,0.35); animation: cardIn 0.6s ease forwards; opacity: 0; transform: translateY(14px); }
          @keyframes cardIn { to { opacity: 1; transform: translateY(0); } }
          .sp-brand { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 1.75rem; }
          .sp-brand img { width: 76px; height: 76px; border-radius: 16px; object-fit: cover; border: 2px solid rgba(255,255,255,0.25); margin-bottom: 0.85rem; background: var(--cream); }
          .sp-brand h1 { font-family: var(--font-display); font-size: 1.65rem; font-weight: 700; color: var(--white); line-height: 1.15; }
          .sp-brand span { font-size: 0.7rem; color: var(--gold-light); letter-spacing: 0.12em; text-transform: uppercase; margin-top: 0.35rem; font-weight: 500; display: block; }
          .sp-subtitle { text-align: center; color: rgba(255,255,255,0.55); font-size: 0.9rem; margin-bottom: 1.5rem; }
          .sp-group { margin-bottom: 1.1rem; }
          .sp-group label { display: block; font-size: 0.78rem; font-weight: 600; color: rgba(255,255,255,0.75); margin-bottom: 0.45rem; letter-spacing: 0.03em; }
          .sp-group input { width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.12); background: rgba(0,0,0,0.2); color: var(--white); font-size: 0.95rem; font-family: var(--font-body); transition: border-color 0.2s, box-shadow 0.2s; outline: none; }
          .sp-group input::placeholder { color: rgba(255,255,255,0.35); }
          .sp-group input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.15); }
          .sp-row-extras { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.65rem; margin-bottom: 1.35rem; }
          .sp-remember { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: rgba(255,255,255,0.7); cursor: pointer; user-select: none; }
          .sp-remember input { width: 16px; height: 16px; accent-color: var(--gold); }
          .sp-forgot { font-size: 0.85rem; font-weight: 500; color: var(--gold-light); background: none; border: none; cursor: pointer; font-family: inherit; padding: 0; }
          .sp-btn-login { width: 100%; padding: 0.92rem; border-radius: 999px; font-size: 0.95rem; font-weight: 700; color: var(--navy); background: linear-gradient(135deg, var(--gold), var(--gold-light)); border: none; cursor: pointer; transition: transform 0.25s, box-shadow 0.25s; margin-bottom: 1rem; font-family: var(--font-body); }
          .sp-btn-login:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(201,168,76,0.35); }
          .sp-btn-login:disabled { opacity: 0.7; cursor: not-allowed; }
          .sp-footer-links { text-align: center; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.08); font-size: 0.875rem; color: rgba(255,255,255,0.55); }
          .sp-footer-links a { color: var(--gold-light); font-weight: 600; }
          .sp-hint { margin-top: 1rem; font-size: 0.72rem; color: rgba(255,255,255,0.35); text-align: center; }
          .sp-error { color: #fca5a5; font-size: 0.82rem; text-align: center; margin-bottom: 0.75rem; }
        `}</style>
        <div className="sp-login-wrap">
          <div className="sp-login-bg"><div className="sp-login-grid" /></div>
          <div className="sp-orb sp-orb-1" />
          <div className="sp-orb sp-orb-2" />
          <Link href="/" className="sp-back">← Back to school website</Link>
          <div className="sp-card">
            <div className="sp-brand">
              <img src="/school-logo.jpg" alt="School logo" />
              <h1>Shri Abhay Nobles</h1>
              <span>Student Portal</span>
            </div>
            <p className="sp-subtitle">Sign in with your Admission Number and password.</p>
            {loginError && <p className="sp-error">{loginError}</p>}
            <form onSubmit={handleLogin} noValidate>
              <div className="sp-group">
                <label htmlFor="sp-sid">Student ID / Admission Number</label>
                <input id="sp-sid" type="text" placeholder="Enter your admission number" value={studentId} onChange={(e) => setStudentId(e.target.value)} autoComplete="username" required />
              </div>
              <div className="sp-group">
                <label htmlFor="sp-pw">Password</label>
                <input id="sp-pw" type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
              </div>
              <div className="sp-row-extras">
                <label className="sp-remember">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  Remember Me
                </label>
                <button type="button" className="sp-forgot" onClick={() => setForgotOpen(true)}>Forgot Password?</button>
              </div>
              <button type="submit" className="sp-btn-login" disabled={loading}>{loading ? "Signing in…" : "Login"}</button>
              <div className="sp-footer-links">
                Need assistance? <a href="mailto:shriabhaynoble@gmail.com">Help / Contact School</a>
              </div>
            </form>
          </div>

          {/* Forgot modal */}
          {forgotOpen && (
            <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,28,53,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(6px)" }}>
              <div style={{ background: "var(--white)", padding: "1.75rem", borderRadius: "var(--radius)", maxWidth: 380, width: "100%" }}>
                <h3 style={{ fontFamily: "var(--font-display)", marginBottom: "0.75rem", color: "var(--navy)" }}>Reset password</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--slate)", marginBottom: "1rem" }}>Contact the school office with your Admission Number for a reset link or temporary password.</p>
                <p style={{ fontSize: "0.9rem", color: "var(--slate)", marginBottom: 0 }}><strong>School:</strong> <a href="tel:+919413078545">+91 9413078545</a></p>
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                  <button type="button" style={{ padding: "0.55rem 1rem", borderRadius: 10, fontWeight: 600, fontSize: "0.85rem", background: "#f1f5f9", color: "var(--navy)", border: "1px solid rgba(11,22,40,0.08)", cursor: "pointer", fontFamily: "inherit" }} onClick={() => setForgotOpen(false)}>Close</button>
                  <a href="mailto:shriabhaynoble@gmail.com" style={{ padding: "0.55rem 1rem", borderRadius: 10, fontWeight: 600, fontSize: "0.85rem", background: "var(--navy)", color: "var(--white)", display: "inline-flex", alignItems: "center", textDecoration: "none" }}>Email Office</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  if (!student) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "Outfit, sans-serif", background: "#f8fafc", color: "#10213b" }}>
        Loading student dashboard…
      </div>
    );
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        :root {
          --navy: #0B1628; --navy-mid: #132040; --navy-light: #1E3060;
          --gold: #C9A84C; --gold-light: #E2C97E; --cream: #FAF7F0;
          --white: #FFFFFF; --slate: #64748B; --green: #0d9488; --red: #dc2626;
          --surface: #f1f5f9; --border: rgba(11,22,40,0.08); --radius: 14px;
          --sidebar-w: 260px; --font-display: 'Cormorant Garamond', serif; --font-body: 'Outfit', sans-serif;
        }
        .sp-dash *, .sp-dash *::before, .sp-dash *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .sp-dash { font-family: var(--font-body); color: #334155; background: var(--cream); line-height: 1.55; min-height: 100vh; display: grid; grid-template-columns: var(--sidebar-w) 1fr; }
        .sp-sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 99; }
        .sp-sidebar { position: sticky; top: 0; align-self: start; height: 100vh; background: var(--navy); color: rgba(255,255,255,0.82); padding: 1.25rem 0; border-right: 1px solid rgba(201,168,76,0.12); display: flex; flex-direction: column; z-index: 100; transition: transform 0.35s; }
        .sp-brand { padding: 0 1.1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 0.75rem; }
        .sp-brand img { width: 44px; height: 44px; border-radius: 10px; object-fit: cover; border: 2px solid rgba(255,255,255,0.15); background: var(--cream); }
        .sp-brand h2 { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--white); line-height: 1.2; }
        .sp-brand span { font-size: 0.65rem; color: var(--gold-light); opacity: 0.9; letter-spacing: 0.08em; display: block; }
        .sp-nav { flex: 1; overflow-y: auto; padding: 1rem 0.65rem; margin-top: 0.75rem; }
        .sp-nav-item { display: flex; align-items: center; gap: 0.65rem; padding: 0.72rem 0.85rem; margin-bottom: 0.25rem; border-radius: 10px; font-size: 0.88rem; font-weight: 500; color: rgba(255,255,255,0.7); transition: background 0.2s, color 0.2s; cursor: pointer; border: none; background: transparent; width: 100%; text-align: left; font-family: inherit; }
        .sp-nav-item svg { width: 20px; height: 20px; flex-shrink: 0; }
        .sp-nav-item:hover { background: rgba(255,255,255,0.06); color: var(--white); }
        .sp-nav-item.active { background: linear-gradient(90deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05)); color: var(--gold-light); border-left: 3px solid var(--gold); padding-left: calc(0.85rem - 3px); }
        .sp-main { min-height: 100vh; background: var(--surface); }
        .sp-topbar { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.95rem 1.5rem; background: rgba(248,250,252,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
        .sp-menu-toggle { display: none; padding: 0.55rem; border-radius: 10px; background: var(--white); border: 1px solid var(--border); color: var(--navy); cursor: pointer; }
        .sp-welcome { font-size: 0.92rem; color: var(--slate); }
        .sp-welcome strong { color: var(--navy); font-weight: 600; }
        .sp-btn-logout { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.55rem 1.15rem; border-radius: 999px; font-size: 0.82rem; font-weight: 600; color: var(--navy); background: linear-gradient(135deg, var(--gold-light), var(--gold)); box-shadow: 0 4px 16px rgba(201,168,76,0.25); border: none; cursor: pointer; transition: transform 0.25s, box-shadow 0.25s; font-family: inherit; flex-shrink: 0; }
        .sp-btn-logout:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(201,168,76,0.35); }
        .sp-content { padding: 1.5rem clamp(1rem, 3vw, 2rem) 3rem; max-width: 1200px; }
        .sp-panel { animation: spFade 0.45s ease forwards; }
        @keyframes spFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .sp-section-head { display: flex; align-items: center; gap: 0.65rem; margin-bottom: 1.35rem; }
        .sp-section-head svg { width: 28px; height: 28px; color: var(--navy-light); }
        .sp-section-head h2 { font-family: var(--font-display); font-size: clamp(1.45rem, 3vw, 1.85rem); font-weight: 700; color: var(--navy); }
        .sp-card-grid { display: grid; gap: 1.25rem; }
        .sp-card-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
        .sp-card { background: var(--white); border-radius: var(--radius); border: 1px solid var(--border); padding: 1.25rem 1.35rem; box-shadow: 0 4px 24px rgba(11,22,40,0.04); }
        .sp-card h3 { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--slate); margin-bottom: 0.85rem; }
        .sp-tag { display: inline-block; padding: 0.2rem 0.55rem; border-radius: 6px; font-size: 0.72rem; font-weight: 600; }
        .sp-tag.ok { background: #ccfbf1; color: #0f766e; }
        .sp-tag.pending { background: #fef3c7; color: #b45309; }
        .sp-tag.bad { background: #fee2e2; color: #b91c1c; }
        .sp-table { width: 100%; border-collapse: collapse; font-size: 0.855rem; }
        .sp-table th, .sp-table td { text-align: left; padding: 0.65rem 0.85rem; border-bottom: 1px solid var(--border); }
        .sp-table th { font-weight: 600; color: var(--navy); background: var(--surface); font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.04em; }
        .sp-profile-hero { display: grid; gap: 1.35rem; }
        @media (min-width: 720px) { .sp-profile-hero { grid-template-columns: auto 1fr; align-items: start; } }
        .sp-avatar-ring { display: inline-block; padding: 5px; border-radius: 50%; background: linear-gradient(145deg, var(--gold), var(--gold-light), rgba(30,48,96,0.35)); box-shadow: 0 14px 40px rgba(11,22,40,0.14); }
        .sp-avatar-crop { width: min(200px, 78vw); height: min(200px, 78vw); border-radius: 50%; overflow: hidden; border: 4px solid var(--white); background: var(--surface); }
        .sp-avatar-crop img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 26%; transform: scale(1.12); transform-origin: 50% 32%; display: block; }
        .sp-profile-caption { display: block; margin-top: 0.85rem; font-size: 0.78rem; font-weight: 600; color: var(--navy); text-align: center; }
        .sp-profile-caption small { display: block; margin-top: 0.2rem; font-weight: 500; color: var(--slate); font-size: 0.72rem; }
        .sp-profile-fields { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
        .sp-field-cell { padding: 0.75rem; background: var(--surface); border-radius: 10px; font-size: 0.875rem; }
        .sp-field-dt { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--slate); margin-bottom: 0.2rem; }
        .sp-field-dd { font-weight: 600; color: var(--navy); }
        .sp-stat-row { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem; }
        .sp-stat-chip { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.85rem 1.1rem; background: var(--white); border-radius: 12px; border: 1px solid var(--border); }
        .sp-stat-chip figure { font-size: 1.75rem; font-weight: 700; color: var(--navy); font-family: var(--font-display); line-height: 1; }
        .sp-stat-chip span { font-size: 0.78rem; color: var(--slate); }
        .sp-tslot { display: flex; justify-content: space-between; align-items: baseline; padding: 0.65rem; margin-bottom: 0.35rem; background: var(--surface); border-radius: 8px; font-size: 0.88rem; }
        .sp-tslot strong { color: var(--navy); }
        .sp-msg-item { padding: 0.85rem 1rem; margin-bottom: 0.65rem; background: var(--white); border-radius: 10px; border: 1px solid var(--border); border-left: 3px solid var(--gold); font-size: 0.88rem; }
        .sp-msg-meta { font-size: 0.72rem; color: var(--slate); display: block; margin-bottom: 0.35rem; }
        .sp-upload-zone { border: 2px dashed rgba(11,22,40,0.15); border-radius: var(--radius); padding: 1.35rem; text-align: center; margin-top: 0.85rem; background: rgba(255,255,255,0.6); }
        .sp-upload-zone label { cursor: pointer; color: var(--navy-light); font-weight: 600; font-size: 0.875rem; }
        .sp-btn-mini { padding: 0.55rem 1rem; border-radius: 10px; font-weight: 600; font-size: 0.85rem; background: var(--navy); color: var(--white); border: none; cursor: pointer; font-family: inherit; }
        .sp-file-btn { padding: 0.3rem 0.75rem; border-radius: 8px; font-size: 0.78rem; font-weight: 600; border: none; cursor: pointer; font-family: inherit; transition: opacity 0.2s; }
        .sp-file-btn.view { background: #e0f2fe; color: #0369a1; }
        .sp-file-btn.dl { background: #dcfce7; color: #15803d; }
        .sp-file-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .sp-file-btns { display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap; }
        .sp-result-card { background: var(--white); border-radius: var(--radius-sm); border: 1px solid var(--border); padding: 1rem 1.1rem; margin-bottom: 0.75rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
        .sp-result-meta { flex: 1; min-width: 0; }
        .sp-result-meta strong { display: block; font-size: 0.9rem; color: var(--navy); margin-bottom: 0.2rem; }
        .sp-result-meta small { color: var(--slate); font-size: 0.76rem; }
        .sp-exam-badge { display: inline-block; padding: 0.18rem 0.55rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; background: #ede9fe; color: #6d28d9; margin-right: 0.4rem; }
        .sp-qr-modal-overlay { position: fixed; inset: 0; z-index: 300; background: rgba(11,22,40,0.65); display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(8px); }
        .sp-qr-modal { background: var(--white); border-radius: calc(var(--radius) + 4px); padding: 2rem 1.75rem 1.75rem; max-width: 360px; width: 100%; text-align: center; box-shadow: 0 24px 80px rgba(0,0,0,0.35); animation: cardIn 0.4s ease; }
        .sp-qr-modal h3 { font-family: var(--font-display); font-size: 1.4rem; color: var(--navy); margin-bottom: 0.25rem; }
        .sp-qr-modal p { font-size: 0.82rem; color: var(--slate); margin-bottom: 1rem; }
        .sp-qr-img { width: 100%; max-width: 240px; border-radius: 10px; border: 2px solid var(--border); margin: 0 auto 0.85rem; display: block; }
        .sp-qr-upi { font-size: 0.85rem; color: var(--slate); margin-bottom: 0.5rem; }
        .sp-qr-timer { font-size: 1.65rem; font-weight: 700; font-family: var(--font-display); color: var(--navy); margin-bottom: 1rem; letter-spacing: 0.05em; }
        .sp-qr-timer.urgent { color: #dc2626; }
        .sp-qr-close { padding: 0.6rem 1.5rem; border-radius: 999px; font-size: 0.88rem; font-weight: 600; background: var(--navy); color: var(--white); border: none; cursor: pointer; font-family: inherit; }
        .sp-btn-qr { padding: 0.65rem 1.35rem; border-radius: 10px; font-weight: 600; font-size: 0.88rem; background: linear-gradient(135deg, var(--gold), var(--gold-light)); color: var(--navy); border: none; cursor: pointer; font-family: inherit; margin-top: 0.85rem; display: inline-flex; align-items: center; gap: 0.45rem; box-shadow: 0 4px 16px rgba(201,168,76,0.25); transition: transform 0.2s; }
        .sp-btn-qr:hover { transform: translateY(-1px); }
        @media (max-width: 900px) {
          .sp-dash { grid-template-columns: 1fr; }
          .sp-sidebar { position: fixed; width: min(288px, 88vw); transform: translateX(-100%); box-shadow: 8px 0 40px rgba(0,0,0,0.25); }
          .sp-sidebar.open { transform: translateX(0); }
          .sp-sidebar-overlay.open { display: block; }
          .sp-menu-toggle { display: inline-flex; }
          .sp-card-grid.cols-2 { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="sp-dash">
        <div className={`sp-sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />
        <aside className={`sp-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sp-brand">
            <img src="/school-logo.jpg" alt="" />
            <div>
              <h2>Portal</h2>
              <span>Shri Abhay Nobles</span>
            </div>
          </div>
          <nav className="sp-nav">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`sp-nav-item ${activePanel === item.id ? "active" : ""}`}
                onClick={() => { setActivePanel(item.id); setSidebarOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="sp-main">
          <header className="sp-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button type="button" className="sp-menu-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h14M4 12h14M4 17h14" /></svg>
              </button>
              <p className="sp-welcome">Welcome back, <strong>{welcomeName}</strong></p>
            </div>
            <button type="button" className="sp-btn-logout" onClick={handleLogout}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
              Logout
            </button>
          </header>

          <div className="sp-content">
            {activePanel === "profile" && (
              <div className="sp-panel">
                <div className="sp-section-head"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><h2>Profile</h2></div>
                <div className="sp-card sp-profile-hero">
                  <div style={{ textAlign: "center" }}>
                    <div className="sp-avatar-ring">
                      <div className="sp-avatar-crop">
                        <img src={student.photo || "/student-profile.png"} alt={student.fullName} width="200" height="200" />
                      </div>
                    </div>
                    <span className="sp-profile-caption">{student.fullName}<small>Profile photo</small></span>
                  </div>
                  <div>
                    <h3 style={{ marginBottom: ".75rem" }}>Student Details</h3>
                    <div className="sp-profile-fields">
                      {[["Full Name", student.fullName], ["Class / Section", klass], ["Roll Number", student.rollNo || "—"], ["Admission No.", student.studentId || "—"]].map(([dt, dd]) => (
                        <div key={dt} className="sp-field-cell"><div className="sp-field-dt">{dt}</div><div className="sp-field-dd">{dd}</div></div>
                      ))}
                    </div>
                    <h3 style={{ margin: "1rem 0 .75rem" }}>Parent / Guardian</h3>
                    <div className="sp-profile-fields">
                      {student.parents.map((p) => (
                        <div key={p.relation} className="sp-field-cell"><div className="sp-field-dt">{p.relation}</div><div className="sp-field-dd">{p.name}<br /><small style={{ color: "var(--slate)", fontWeight: 500 }}>{p.phone}</small></div></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePanel === "attendance" && (
              <div className="sp-panel">
                <div className="sp-section-head"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><h2>Attendance</h2></div>
                <div className="sp-stat-row">
                  {[
                    [latestAttendanceStatus, "Latest Status"],
                    [String(latestPresentCount), "Present Students"],
                    [String(latestAbsentCount), "Absent Students"],
                  ].map(([v, l]) => (
                    <div key={l} className="sp-stat-chip"><div><figure>{v}</figure><span>{l}</span></div></div>
                  ))}
                </div>
                <div className="sp-card-grid cols-2">
                  <div className="sp-card">
                    <h3>Latest Class Snapshot</h3>
                    <table className="sp-table">
                      <thead><tr><th>Date</th><th>Present</th><th>Absent</th></tr></thead>
                      <tbody>
                        <tr>
                          <td>{latestAttendanceLabel}</td>
                          <td>{latestPresentCount}</td>
                          <td>{latestAbsentCount}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="sp-card">
                    <h3>Key Info</h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--slate)", lineHeight: 1.6 }}>
                      Latest attendance record: {latestAttendanceLabel}. Status: {latestAttendanceStatus}. Contact the school office for any discrepancy.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activePanel === "homework" && (
              <div className="sp-panel">
                <div className="sp-section-head"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M8 7h8M8 11h8"/></svg><h2>Homework / Assignments</h2></div>
                <div className="sp-card">
                  <h3>Assigned work</h3>
                  <table className="sp-table">
                    <thead><tr><th>Subject</th><th>Task</th><th>Due Date</th><th>Status</th><th>File</th></tr></thead>
                    <tbody>
                      {(dashData?.homework ?? []).map((h, i) => (
                        <tr key={i}>
                          <td>{h.subject}</td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{h.title}</div>
                            {h.teacherName && <small style={{ color: "var(--slate)", fontSize: "0.72rem" }}>{h.teacherName}</small>}
                          </td>
                          <td>{h.dueDate}</td>
                          <td><span className={`sp-tag ${h.status === "Submitted" ? "ok" : h.status === "Reviewed" ? "ok" : "pending"}`}>{h.status}</span></td>
                          <td>
                            <div className="sp-file-btns">
                              <button type="button" className="sp-file-btn view" onClick={() => openFile(h.fileName || "", h.fileData || "", "", "view")}>View</button>
                              <button type="button" className="sp-file-btn dl" onClick={() => openFile(h.fileName || "", h.fileData || "", "", "download")}>Download</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="sp-upload-zone">
                    <label htmlFor="hw-upload">📎 Submit assignment — choose file</label>
                    <input type="file" id="hw-upload" ref={hwFileRef} accept=".pdf,.doc,.docx,image/*" style={{ display: "none" }} onChange={() => alert("File selected. Contact your teacher to submit.")} />
                    <p style={{ marginTop: ".5rem", fontSize: ".75rem", color: "var(--slate)" }}>Accepted: PDF, Word, Images</p>
                  </div>
                </div>
              </div>
            )}

            {activePanel === "results" && (
              <div className="sp-panel">
                <div className="sp-section-head"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg><h2>Results / Report Card</h2></div>
                <div className="sp-card">
                  <h3>Uploaded Results — Session 2025–26</h3>
                  {(dashData?.result?.length ?? 0) ? (
                    (dashData?.result ?? []).map((r) => (
                      <div key={r.id} className="sp-result-card">
                        <div className="sp-result-meta">
                          <strong>{r.title}</strong>
                          <small>
                            <span className="sp-exam-badge">{r.examType}</span>
                            {r.subject} · {r.teacherName} · {r.createdAt}
                          </small>
                        </div>
                        <div className="sp-file-btns">
                          <button type="button" className="sp-file-btn view" onClick={() => openFile(r.fileName || "", r.fileData || "", "", "view")}>View</button>
                          <button type="button" className="sp-file-btn dl" onClick={() => openFile(r.fileName || "", r.fileData || "", "", "download")}>Download</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "var(--slate)", fontSize: "0.9rem", padding: "1rem 0" }}>No results uploaded yet. Check back after exams.</p>
                  )}
                </div>
              </div>
            )}

            {activePanel === "fees" && (
              <div className="sp-panel">
                <div className="sp-section-head"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg><h2>Fee Section</h2></div>
                <div className="sp-card-grid cols-2">
                  <div className="sp-card">
                    <h3>Current Term</h3>
                    <p style={{ marginBottom: ".5rem" }}><span className={`sp-tag ${student.fees.currentTermStatus === "Paid" ? "ok" : "pending"}`}>{student.fees.currentTermStatus ?? "Pending"}</span></p>
                    <p style={{ fontSize: ".9rem", color: "var(--slate)" }}>{student.fees.currentTermNote ?? "Fee details will appear here once updated by admin."}</p>
                    <p style={{ marginTop: ".75rem", fontWeight: 600 }}>Next Due: {student.fees.nextDueAmount ?? "—"} — {student.fees.nextDueLabel ?? "Not set"}</p>
                    <button type="button" className="sp-btn-qr" onClick={openQr}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h.01M18 14h.01M14 18h.01M18 18h.01M14 14v4M18 14v4"/></svg>
                      Pay via QR Code
                    </button>
                  </div>
                  <div className="sp-card">
                    <h3>Fee history</h3>
                    <table className="sp-table">
                      <thead><tr><th>Period</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                        {(student.fees.history ?? []).map((h) => (
                          <tr key={h.period}><td>{h.period}</td><td>{h.amount}</td><td><span className={`sp-tag ${h.status === "Paid" ? "ok" : "pending"}`}>{h.status}</span></td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activePanel === "notices" && (
              <div className="sp-panel">
                <div className="sp-section-head"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg><h2>Notices / Announcements</h2></div>
                <div className="sp-card">
                  {(dashData?.notices ?? []).map((n, i) => (
                    <div key={i} className="sp-msg-item">
                      <span className="sp-msg-meta">{n.date} · <strong>{n.type}</strong></span>
                      {n.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePanel === "material" && (
              <div className="sp-panel">
                <div className="sp-section-head"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg><h2>Study Material</h2></div>
                <div className="sp-card">
                  <table className="sp-table">
                    <thead><tr><th>Resource</th><th>Type</th><th>Actions</th></tr></thead>
                    <tbody>
                      {(dashData?.materials ?? []).map((m, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 500 }}>{m.title}</td>
                          <td><span className="sp-tag pending" style={{ background: "#f0f9ff", color: "#0369a1" }}>{m.type}</span></td>
                          <td>
                            <div className="sp-file-btns">
                              {m.videoUrl ? (
                                <button type="button" className="sp-file-btn view" onClick={() => window.open(m.videoUrl, "_blank")}>▶ Watch</button>
                              ) : (
                                <button type="button" className="sp-file-btn view" onClick={() => openFile(m.fileName || "", m.fileData || "", m.videoUrl || "", "view")}>View</button>
                              )}
                              <button type="button" className="sp-file-btn dl" onClick={() => openFile(m.fileName || "", m.fileData || "", m.videoUrl || "", "download")}>Download</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activePanel === "timetable" && (
              <div className="sp-panel">
                <div className="sp-section-head"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><h2>Timetable — Monday</h2></div>
                <div className="sp-card">
                  {(dashData?.timetable ?? []).map((t, i) => (
                    <div key={i} className="sp-tslot"><span>{t.period} · {t.time}</span><strong>{t.subject}</strong></div>
                  ))}
                </div>
              </div>
            )}

            {activePanel === "events" && (
              <div className="sp-panel">
                <div className="sp-section-head"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><h2>Events</h2></div>
                {(() => {
                  const allEvents = dashData?.events ?? [];
                  if (!allEvents.length) return (
                    <div className="sp-card"><p style={{ color: "var(--slate)", fontSize: "0.9rem" }}>No upcoming events. Check back soon.</p></div>
                  );
                  return (
                    <div className="sp-card">
                      <h3>All Events</h3>
                      {allEvents.map((e, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "0.75rem 0", borderBottom: i < allEvents.length - 1 ? "1px solid var(--border)" : "none", gap: "1rem" }}>
                          <div>
                            <strong style={{ fontSize: "0.9rem", color: "var(--navy)", display: "block", marginBottom: "0.2rem" }}>{e.name}</strong>
                            <span style={{ color: "var(--slate)", fontSize: "0.8rem" }}>{e.detail}</span>
                          </div>
                          <span style={{ background: "#fef3c7", color: "#b45309", padding: "0.2rem 0.6rem", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600, flexShrink: 0 }}>{e.date}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {activePanel === "messages" && (
              <div className="sp-panel">
                <div className="sp-section-head"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg><h2>Messages</h2></div>
                <div className="sp-card">
                  {(dashData?.messages ?? []).map((m, i) => (
                    <div key={i} className="sp-msg-item">
                      <span className="sp-msg-meta">{m.date} · <strong>{m.from}</strong> — {m.subject}</span>
                      {m.body}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Payment Modal */}
      {qrOpen && (
        <div className="sp-qr-modal-overlay" onClick={closeQr}>
          <div className="sp-qr-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Scan &amp; Pay</h3>
            <p>Scan the QR code using any UPI app to pay school fees.</p>
            <img src="/qr-payment.jpeg" alt="Payment QR Code" className="sp-qr-img" />
            <p className="sp-qr-upi">UPI ID: <strong>71175149523@sbi</strong></p>
            <div className={`sp-qr-timer${qrSeconds <= 60 ? " urgent" : ""}`}>{fmtQrTimer(qrSeconds)}</div>
            <p style={{ fontSize: "0.75rem", color: "var(--slate)", marginBottom: "1rem" }}>
              {qrSeconds <= 60 ? "⚠ QR code expiring soon!" : "QR code valid for 4 minutes"}
            </p>
            <button type="button" className="sp-qr-close" onClick={closeQr}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
