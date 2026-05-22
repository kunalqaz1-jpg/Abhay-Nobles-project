import { useState } from "react";
import { useLocation, Link } from "wouter";

const DEMO_TEACHER = {
  username: "T-402",
  password: "teacher123",
  session: {
    teacherId: "T-402",
    name: "Rahul Sharma",
    subject: "Mathematics",
  },
};

export default function TeacherLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function openDemoDashboard() {
    sessionStorage.setItem("abhay_teacher_session", JSON.stringify(DEMO_TEACHER.session));
    sessionStorage.setItem("abhay_teacher_token", "demo-teacher-token");
    setLocation("/teacher/dashboard");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/teachers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("invalid");
      const data = await res.json();
      sessionStorage.setItem("abhay_teacher_session", JSON.stringify({ teacherId: data.teacherId, name: data.name, subject: data.subject }));
      if (data.token) sessionStorage.setItem("abhay_teacher_token", data.token);
      setLocation("/teacher/dashboard");
    } catch {
      const normalizedUsername = username.trim().toUpperCase();
      if (
        (normalizedUsername === DEMO_TEACHER.username || normalizedUsername === "TEACHER") &&
        password === DEMO_TEACHER.password
      ) {
        openDemoDashboard();
        return;
      }
      setError("Invalid credentials. Use your Staff ID and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        :root { --navy:#0B1628;--navy-mid:#132040;--gold:#C9A84C;--gold-light:#E2C97E;--white:#FFFFFF;--font-display:'Cormorant Garamond',serif;--font-body:'Outfit',sans-serif; }
        .erp-login-wrap{font-family:var(--font-body);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem 1rem;position:relative;background:linear-gradient(135deg,#060e1e 0%,#0B1628 40%,#132040 100%);}
        .erp-login-wrap::before{content:'';position:fixed;inset:-50%;background:radial-gradient(ellipse at 30% 20%,rgba(201,168,76,0.12) 0%,transparent 50%),radial-gradient(ellipse at 70% 80%,rgba(30,48,96,0.5) 0%,transparent 45%);animation:bgDrift 18s ease-in-out infinite alternate;pointer-events:none;}
        @keyframes bgDrift{0%{transform:translate(0,0) rotate(0deg);}100%{transform:translate(-4%,3%) rotate(2deg);}}
        .erp-back{position:fixed;top:1.25rem;left:1.25rem;z-index:2;font-size:0.85rem;color:rgba(255,255,255,0.55);display:flex;align-items:center;gap:.35rem;transition:color .2s;text-decoration:none;font-family:var(--font-body);}
        .erp-back:hover{color:var(--gold-light);}
        .erp-card{position:relative;z-index:1;width:100%;max-width:420px;background:rgba(255,255,255,0.06);border:1px solid rgba(201,168,76,0.22);border-radius:18px;padding:2.25rem 2rem;backdrop-filter:blur(20px);box-shadow:0 24px 80px rgba(0,0,0,0.35);}
        .erp-brand{display:flex;flex-direction:column;align-items:center;text-align:center;margin-bottom:1.75rem;}
        .erp-brand img{width:76px;height:76px;border-radius:16px;object-fit:cover;border:2px solid rgba(255,255,255,0.25);margin-bottom:.85rem;background:#FAF7F0;}
        .erp-brand h1{font-family:var(--font-display);font-size:1.65rem;font-weight:700;color:var(--white);line-height:1.15;}
        .erp-brand span{font-size:.7rem;color:var(--gold-light);letter-spacing:.12em;text-transform:uppercase;margin-top:.35rem;font-weight:500;display:block;}
        .erp-group{margin-bottom:1.1rem;}
        .erp-group label{display:block;font-size:.78rem;font-weight:600;color:rgba(255,255,255,.75);margin-bottom:.45rem;letter-spacing:.03em;}
        .erp-group input{width:100%;padding:.75rem 1rem;border-radius:8px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.2);color:var(--white);font-size:.95rem;font-family:var(--font-body);outline:none;transition:border-color .2s,box-shadow .2s;}
        .erp-group input::placeholder{color:rgba(255,255,255,.35);}
        .erp-group input:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,168,76,.15);}
        .erp-btn{width:100%;padding:.92rem;border-radius:999px;font-size:.95rem;font-weight:700;color:var(--navy);background:linear-gradient(135deg,var(--gold),var(--gold-light));border:none;cursor:pointer;transition:transform .25s,box-shadow .25s;font-family:var(--font-body);margin-top:.5rem;}
        .erp-btn:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(201,168,76,.35);}
        .erp-btn:disabled{opacity:.7;cursor:not-allowed;}
        .erp-error{color:#fca5a5;font-size:.82rem;text-align:center;margin-bottom:.75rem;}
        .erp-hint{margin-top:1rem;font-size:.72rem;color:rgba(255,255,255,.35);text-align:center;}
        .erp-footer{margin-top:1.25rem;text-align:center;padding-top:.75rem;border-top:1px solid rgba(255,255,255,.08);font-size:.85rem;color:rgba(255,255,255,.5);}
        .erp-footer a{color:var(--gold-light);}
      `}</style>
      <div className="erp-login-wrap">
        <Link href="/" className="erp-back">← Back to school website</Link>
        <div className="erp-card">
          <div className="erp-brand">
            <img src="/school-logo.jpg" alt="School logo" />
            <h1>Shri Abhay Nobles</h1>
            <span>Teacher Portal</span>
          </div>
          {error && <p className="erp-error">{error}</p>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="erp-group">
              <label htmlFor="tl-user">Username / Staff ID</label>
              <input id="tl-user" type="text" placeholder="e.g. teacher" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="erp-group">
              <label htmlFor="tl-pw">Password</label>
              <input id="tl-pw" type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="erp-btn" disabled={loading}>{loading ? "Signing in…" : "Login"}</button>
          </form>
          <p className="erp-hint">Demo: <strong>T-402</strong> / <strong>teacher123</strong></p>
          <div className="erp-footer">
            <Link href="/admin/login">Switch to Admin Portal →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
