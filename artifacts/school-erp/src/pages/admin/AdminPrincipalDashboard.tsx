import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/shared/api-base";

type AdminSession = { id: string; username: string };
type StudentRecord = {
  studentId: string;
  fullName: string;
  className: string;
  section: string;
  rollNo: string;
  photo?: string;
  parents: { relation: string; name: string; phone: string }[];
  fees: {
    currentTermStatus?: string;
    currentTermNote?: string;
    nextDueAmount?: string;
    nextDueLabel?: string;
    history?: { period: string; amount: string; status: string }[];
  };
};
type TeacherRecord = {
  teacherId: string;
  name: string;
  subject: string;
  qualification: string;
  joinDate: string;
  phone: string;
  assignedClasses: string[];
};
type AdminDashboardData = {
  kpis: { label: string; value: string; sub: string }[];
  recentAdmissions: {
    id: string;
    studentName: string;
    parentName: string;
    phone: string;
    email: string;
    classApplied: string;
    message: string;
    status: string;
    createdAt: string;
  }[];
  recentAttendance: {
    className: string;
    date: string;
    teacherName: string;
    updatedAt: string;
    presentCount: number;
    absentCount: number;
    totalStudents: number;
  }[];
  students: StudentRecord[];
  teachers: TeacherRecord[];
  notices: {
    id: string;
    title: string;
    description: string;
    audience: string;
    className: string;
    teacherName: string;
    createdAt: string;
  }[];
  events: {
    id: string;
    className: string;
    title: string;
    description: string;
    eventDate: string;
    teacherName: string;
    createdAt: string;
  }[];
  timetable: {
    id: string;
    className: string;
    period: string;
    subject: string;
    time: string;
    updatedAt: string;
  }[];
  contacts: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
  }[];
};

function getAdminSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem("abhay_admin_session");
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function nowLabel() {
  return new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminPrincipalDashboard() {
  const [, setLocation] = useLocation();
  const [session] = useState<AdminSession | null>(() => getAdminSession());
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [studentForm, setStudentForm] = useState({
    studentId: "",
    fullName: "",
    className: "",
    section: "",
    rollNo: "",
    password: "",
    fatherName: "",
    fatherPhone: "",
    motherName: "",
    motherPhone: "",
  });
  const [teacherForm, setTeacherForm] = useState({
    teacherId: "",
    name: "",
    subject: "",
    qualification: "",
    joinDate: todayValue(),
    phone: "",
    password: "",
    assignedClasses: "",
  });
  const [feeForm, setFeeForm] = useState({
    studentId: "",
    currentTermStatus: "Pending",
    currentTermNote: "",
    nextDueAmount: "",
    nextDueLabel: "",
    historyPeriod: "",
    historyAmount: "",
    historyStatus: "Pending",
  });
  const [timetableForm, setTimetableForm] = useState({
    className: "",
    period: "",
    subject: "",
    time: "",
  });
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    description: "",
    audience: "all",
    className: "",
  });
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    className: "",
    eventDate: todayValue(),
  });

  async function deleteTeacherAccount(teacherId: string, teacherName: string) {
    const confirmed = window.confirm(`Delete teacher ${teacherName} (${teacherId}) and all uploaded data? This cannot be undone.`);
    if (!confirmed) return;

    await runSave("Teacher Delete", async () => {
      await apiRequest(`/teachers/${encodeURIComponent(teacherId)}`, {
        method: "DELETE",
      });
    });
  }

  const loadDashboard = async (showSpinner = false) => {
    if (!session?.username) {
      setLocation("/admin/login");
      return;
    }

    if (showSpinner) setLoading(true);
    try {
      const data = await apiRequest<AdminDashboardData>("/admin/dashboard");
      setDashboard(data);
      setError("");
      if (!feeForm.studentId && data.students.length > 0) {
        setFeeForm((form) => ({ ...form, studentId: data.students[0].studentId }));
      }
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Unable to load admin dashboard.";
      setError(message);
      if (message.toLowerCase().includes("session") || message.toLowerCase().includes("unauthorised")) {
        handleLogout();
      }
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.username) {
      setLocation("/admin/login");
      return;
    }
    void loadDashboard(true);
  }, [session?.username]);

  useEffect(() => {
    if (!session?.username) return;
    const timer = window.setInterval(() => {
      void loadDashboard(false);
    }, 10000);
    return () => window.clearInterval(timer);
  }, [session?.username]);

  const selectedStudent = useMemo(
    () => dashboard?.students.find((student) => student.studentId === feeForm.studentId) ?? null,
    [dashboard, feeForm.studentId],
  );

  function handleLogout() {
    sessionStorage.removeItem("abhay_admin_session");
    sessionStorage.removeItem("abhay_admin_token");
    setLocation("/admin/login");
  }

  async function runSave(label: string, action: () => Promise<void>) {
    setSaving(label);
    setError("");
    setNotice("");
    try {
      await action();
      await loadDashboard(false);
      setNotice(`${label} saved successfully.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : `Unable to save ${label.toLowerCase()}.`);
    } finally {
      setSaving(null);
    }
  }

  async function saveStudent() {
    await runSave("Student", async () => {
      await apiRequest("/students", {
        method: "POST",
        body: JSON.stringify({
          studentId: studentForm.studentId,
          fullName: studentForm.fullName,
          className: studentForm.className,
          section: studentForm.section,
          rollNo: studentForm.rollNo,
          password: studentForm.password,
          parents: [
            { relation: "Father", name: studentForm.fatherName, phone: studentForm.fatherPhone },
            { relation: "Mother", name: studentForm.motherName, phone: studentForm.motherPhone },
          ].filter((parent) => parent.name || parent.phone),
          fees: selectedStudent?.fees ?? {},
        }),
      });
      setStudentForm({
        studentId: "",
        fullName: "",
        className: "",
        section: "",
        rollNo: "",
        password: "",
        fatherName: "",
        fatherPhone: "",
        motherName: "",
        motherPhone: "",
      });
    });
  }

  async function saveTeacher() {
    await runSave("Teacher", async () => {
      await apiRequest("/teachers", {
        method: "POST",
        body: JSON.stringify({
          teacherId: teacherForm.teacherId,
          name: teacherForm.name,
          subject: teacherForm.subject,
          qualification: teacherForm.qualification,
          joinDate: teacherForm.joinDate,
          phone: teacherForm.phone,
          password: teacherForm.password,
          assignedClasses: teacherForm.assignedClasses.split(",").map((item) => item.trim()).filter(Boolean),
        }),
      });
      setTeacherForm({
        teacherId: "",
        name: "",
        subject: "",
        qualification: "",
        joinDate: todayValue(),
        phone: "",
        password: "",
        assignedClasses: "",
      });
    });
  }

  async function saveFees() {
    if (!feeForm.studentId) return;
    await runSave("Fees", async () => {
      const existingHistory = selectedStudent?.fees?.history ?? [];
      const nextHistory = feeForm.historyPeriod
        ? [{ period: feeForm.historyPeriod, amount: feeForm.historyAmount, status: feeForm.historyStatus }, ...existingHistory]
        : existingHistory;

      await apiRequest(`/students/${encodeURIComponent(feeForm.studentId)}/fees`, {
        method: "POST",
        body: JSON.stringify({
          fees: {
            currentTermStatus: feeForm.currentTermStatus,
            currentTermNote: feeForm.currentTermNote,
            nextDueAmount: feeForm.nextDueAmount,
            nextDueLabel: feeForm.nextDueLabel,
            history: nextHistory,
          },
        }),
      });
      setFeeForm((form) => ({
        ...form,
        historyPeriod: "",
        historyAmount: "",
        historyStatus: "Pending",
      }));
    });
  }

  async function saveTimetable() {
    await runSave("Timetable", async () => {
      await apiRequest("/timetable", {
        method: "POST",
        body: JSON.stringify({
          id: crypto.randomUUID(),
          className: timetableForm.className,
          period: timetableForm.period,
          subject: timetableForm.subject,
          time: timetableForm.time,
          updatedAt: nowLabel(),
        }),
      });
      setTimetableForm({ className: "", period: "", subject: "", time: "" });
    });
  }

  async function saveNotice() {
    await runSave("Notice", async () => {
      await apiRequest("/notices", {
        method: "POST",
        body: JSON.stringify({
          id: crypto.randomUUID(),
          title: noticeForm.title,
          description: noticeForm.description,
          audience: noticeForm.audience,
          className: noticeForm.audience === "all" ? "" : noticeForm.className,
          teacherName: "Admin",
          createdAt: nowLabel(),
        }),
      });
      setNoticeForm({ title: "", description: "", audience: "all", className: "" });
    });
  }

  async function saveEvent() {
    await runSave("Event", async () => {
      await apiRequest("/events", {
        method: "POST",
        body: JSON.stringify({
          id: crypto.randomUUID(),
          className: eventForm.className,
          title: eventForm.title,
          description: eventForm.description,
          eventDate: eventForm.eventDate,
          teacherName: "Admin",
          createdAt: nowLabel(),
        }),
      });
      setEventForm({ title: "", description: "", className: "", eventDate: todayValue() });
    });
  }

  if (!session) return null;

  return (
    <>
      <style>{`
        .ap-live { min-height: 100vh; background: #f5f7fb; color: #0f172a; font-family: "Outfit", sans-serif; }
        .ap-shell { max-width: 1450px; margin: 0 auto; padding: 1.5rem; }
        .ap-top { display: flex; justify-content: space-between; gap: 1rem; align-items: center; margin-bottom: 1.5rem; }
        .ap-title h1 { margin: 0; font-size: clamp(1.9rem, 4vw, 2.8rem); font-family: "Cormorant Garamond", serif; }
        .ap-title p { margin: 0.35rem 0 0; color: #475569; }
        .ap-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .ap-btn, .ap-live input, .ap-live select, .ap-live textarea { font: inherit; }
        .ap-btn { border: none; border-radius: 999px; padding: 0.8rem 1.2rem; cursor: pointer; }
        .ap-btn.primary { background: linear-gradient(135deg, #c9a84c, #ead48e); color: #10213b; font-weight: 700; }
        .ap-btn.secondary { background: #10213b; color: #fff; }
        .ap-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 1rem; }
        .ap-card { background: #fff; border-radius: 22px; padding: 1.2rem; border: 1px solid rgba(15,23,42,0.08); box-shadow: 0 18px 44px rgba(15,23,42,0.06); }
        .ap-card h2, .ap-card h3 { margin: 0 0 0.8rem; }
        .ap-card h2 { font-size: 1.05rem; }
        .ap-card h3 { font-size: 0.92rem; color: #475569; }
        .ap-span-3 { grid-column: span 3; }
        .ap-span-4 { grid-column: span 4; }
        .ap-span-5 { grid-column: span 5; }
        .ap-span-6 { grid-column: span 6; }
        .ap-span-7 { grid-column: span 7; }
        .ap-span-8 { grid-column: span 8; }
        .ap-span-12 { grid-column: span 12; }
        .ap-kpi strong { display: block; font-size: 1.9rem; margin-top: 0.25rem; }
        .ap-kpi span { color: #64748b; font-size: 0.86rem; }
        .ap-form { display: grid; gap: 0.75rem; }
        .ap-form.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .ap-form.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .ap-form input, .ap-form select, .ap-form textarea { width: 100%; border: 1px solid rgba(15,23,42,0.14); border-radius: 12px; padding: 0.72rem 0.85rem; background: #fff; }
        .ap-form textarea { min-height: 88px; resize: vertical; }
        .ap-table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
        .ap-table th, .ap-table td { text-align: left; padding: 0.65rem; border-bottom: 1px solid rgba(15,23,42,0.08); vertical-align: top; }
        .ap-table th { color: #475569; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; }
        .ap-list { display: grid; gap: 0.75rem; }
        .ap-item { border-radius: 14px; border: 1px solid rgba(15,23,42,0.08); background: #f8fafc; padding: 0.85rem; }
        .ap-item strong { display: block; margin-bottom: 0.25rem; }
        .ap-item small { color: #64748b; }
        .ap-banner { margin-bottom: 1rem; padding: 0.85rem 1rem; border-radius: 14px; }
        .ap-banner.error { background: #fee2e2; color: #991b1b; }
        .ap-banner.ok { background: #dcfce7; color: #166534; }
        .ap-muted { color: #64748b; }
        @media (max-width: 1100px) {
          .ap-span-3, .ap-span-4, .ap-span-5, .ap-span-6, .ap-span-7, .ap-span-8 { grid-column: span 12; }
          .ap-top { flex-direction: column; align-items: flex-start; }
          .ap-form.two, .ap-form.three { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="ap-live">
        <div className="ap-shell">
          <div className="ap-top">
            <div className="ap-title">
              <h1>Admin Dashboard</h1>
              <p>Live ERP control panel. Changes here sync to teacher and student portals on automatic refresh.</p>
            </div>
            <div className="ap-actions">
              <button type="button" className="ap-btn secondary" onClick={() => void loadDashboard(false)}>
                Refresh
              </button>
              <button type="button" className="ap-btn primary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>

          {error ? <div className="ap-banner error">{error}</div> : null}
          {notice ? <div className="ap-banner ok">{notice}</div> : null}

          {loading || !dashboard ? (
            <div className="ap-card">Loading admin dashboard…</div>
          ) : (
            <div className="ap-grid">
              {dashboard.kpis.map((item) => (
                <div key={item.label} className="ap-card ap-span-3 ap-kpi">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <div className="ap-muted">{item.sub}</div>
                </div>
              ))}

              <div className="ap-card ap-span-6">
                <h2>Recent Attendance</h2>
                <div className="ap-list">
                  {dashboard.recentAttendance.map((item) => (
                    <div key={`${item.className}-${item.date}`} className="ap-item">
                      <strong>{item.className} · {item.date}</strong>
                      <small>{item.presentCount} present, {item.absentCount} absent · {item.teacherName}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ap-card ap-span-6">
                <h2>Recent Admissions</h2>
                <div className="ap-list">
                  {dashboard.recentAdmissions.map((item) => (
                    <div key={item.id} className="ap-item">
                      <strong>{item.studentName}</strong>
                      <small>{item.classApplied || "Class not set"} · {item.parentName} · {item.phone}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ap-card ap-span-6">
                <h2>Create or Update Student</h2>
                <div className="ap-form two">
                  <input placeholder="Student ID" value={studentForm.studentId} onChange={(e) => setStudentForm((form) => ({ ...form, studentId: e.target.value }))} />
                  <input placeholder="Full name" value={studentForm.fullName} onChange={(e) => setStudentForm((form) => ({ ...form, fullName: e.target.value }))} />
                  <input placeholder="Class" value={studentForm.className} onChange={(e) => setStudentForm((form) => ({ ...form, className: e.target.value }))} />
                  <input placeholder="Section" value={studentForm.section} onChange={(e) => setStudentForm((form) => ({ ...form, section: e.target.value }))} />
                  <input placeholder="Roll number" value={studentForm.rollNo} onChange={(e) => setStudentForm((form) => ({ ...form, rollNo: e.target.value }))} />
                  <input placeholder="Portal password" value={studentForm.password} onChange={(e) => setStudentForm((form) => ({ ...form, password: e.target.value }))} />
                  <input placeholder="Father name" value={studentForm.fatherName} onChange={(e) => setStudentForm((form) => ({ ...form, fatherName: e.target.value }))} />
                  <input placeholder="Father phone" value={studentForm.fatherPhone} onChange={(e) => setStudentForm((form) => ({ ...form, fatherPhone: e.target.value }))} />
                  <input placeholder="Mother name" value={studentForm.motherName} onChange={(e) => setStudentForm((form) => ({ ...form, motherName: e.target.value }))} />
                  <input placeholder="Mother phone" value={studentForm.motherPhone} onChange={(e) => setStudentForm((form) => ({ ...form, motherPhone: e.target.value }))} />
                </div>
                <div style={{ marginTop: "1rem" }}>
                  <button type="button" className="ap-btn primary" disabled={saving === "Student"} onClick={() => void saveStudent()}>
                    {saving === "Student" ? "Saving…" : "Save Student"}
                  </button>
                </div>
              </div>

              <div className="ap-card ap-span-6">
                <h2>Create or Update Teacher</h2>
                <div className="ap-form two">
                  <input placeholder="Teacher ID" value={teacherForm.teacherId} onChange={(e) => setTeacherForm((form) => ({ ...form, teacherId: e.target.value }))} />
                  <input placeholder="Teacher name" value={teacherForm.name} onChange={(e) => setTeacherForm((form) => ({ ...form, name: e.target.value }))} />
                  <input placeholder="Subject" value={teacherForm.subject} onChange={(e) => setTeacherForm((form) => ({ ...form, subject: e.target.value }))} />
                  <input placeholder="Qualification" value={teacherForm.qualification} onChange={(e) => setTeacherForm((form) => ({ ...form, qualification: e.target.value }))} />
                  <input type="date" value={teacherForm.joinDate} onChange={(e) => setTeacherForm((form) => ({ ...form, joinDate: e.target.value }))} />
                  <input placeholder="Phone" value={teacherForm.phone} onChange={(e) => setTeacherForm((form) => ({ ...form, phone: e.target.value }))} />
                  <input placeholder="Password" value={teacherForm.password} onChange={(e) => setTeacherForm((form) => ({ ...form, password: e.target.value }))} />
                  <input placeholder="Assigned classes, comma separated" value={teacherForm.assignedClasses} onChange={(e) => setTeacherForm((form) => ({ ...form, assignedClasses: e.target.value }))} />
                </div>
                <div style={{ marginTop: "1rem" }}>
                  <button type="button" className="ap-btn primary" disabled={saving === "Teacher"} onClick={() => void saveTeacher()}>
                    {saving === "Teacher" ? "Saving…" : "Save Teacher"}
                  </button>
                </div>
              </div>

              <div className="ap-card ap-span-5">
                <h2>Fee Management</h2>
                <div className="ap-form">
                  <select value={feeForm.studentId} onChange={(e) => setFeeForm((form) => ({ ...form, studentId: e.target.value }))}>
                    <option value="">Select student</option>
                    {dashboard.students.map((student) => (
                      <option key={student.studentId} value={student.studentId}>{student.fullName} · {student.studentId}</option>
                    ))}
                  </select>
                  <select value={feeForm.currentTermStatus} onChange={(e) => setFeeForm((form) => ({ ...form, currentTermStatus: e.target.value }))}>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                  </select>
                  <input placeholder="Current term note" value={feeForm.currentTermNote} onChange={(e) => setFeeForm((form) => ({ ...form, currentTermNote: e.target.value }))} />
                  <input placeholder="Next due amount" value={feeForm.nextDueAmount} onChange={(e) => setFeeForm((form) => ({ ...form, nextDueAmount: e.target.value }))} />
                  <input placeholder="Next due label" value={feeForm.nextDueLabel} onChange={(e) => setFeeForm((form) => ({ ...form, nextDueLabel: e.target.value }))} />
                  <input placeholder="History period (optional)" value={feeForm.historyPeriod} onChange={(e) => setFeeForm((form) => ({ ...form, historyPeriod: e.target.value }))} />
                  <input placeholder="History amount" value={feeForm.historyAmount} onChange={(e) => setFeeForm((form) => ({ ...form, historyAmount: e.target.value }))} />
                  <select value={feeForm.historyStatus} onChange={(e) => setFeeForm((form) => ({ ...form, historyStatus: e.target.value }))}>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div style={{ marginTop: "1rem" }}>
                  <button type="button" className="ap-btn primary" disabled={saving === "Fees"} onClick={() => void saveFees()}>
                    {saving === "Fees" ? "Saving…" : "Update Fees"}
                  </button>
                </div>
                {selectedStudent ? (
                  <div className="ap-item" style={{ marginTop: "1rem" }}>
                    <strong>{selectedStudent.fullName}</strong>
                    <small>Current status: {selectedStudent.fees?.currentTermStatus ?? "Not set"}</small>
                  </div>
                ) : null}
              </div>

              <div className="ap-card ap-span-7">
                <h2>Timetable Manager</h2>
                <div className="ap-form three">
                  <input placeholder="Class" value={timetableForm.className} onChange={(e) => setTimetableForm((form) => ({ ...form, className: e.target.value }))} />
                  <input placeholder="Period" value={timetableForm.period} onChange={(e) => setTimetableForm((form) => ({ ...form, period: e.target.value }))} />
                  <input placeholder="Subject" value={timetableForm.subject} onChange={(e) => setTimetableForm((form) => ({ ...form, subject: e.target.value }))} />
                  <input placeholder="Time" value={timetableForm.time} onChange={(e) => setTimetableForm((form) => ({ ...form, time: e.target.value }))} />
                </div>
                <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                  <button type="button" className="ap-btn primary" disabled={saving === "Timetable"} onClick={() => void saveTimetable()}>
                    {saving === "Timetable" ? "Saving…" : "Save Timetable Row"}
                  </button>
                </div>
                <table className="ap-table">
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Period</th>
                      <th>Subject</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.timetable.slice(0, 8).map((row) => (
                      <tr key={row.id}>
                        <td>{row.className}</td>
                        <td>{row.period}</td>
                        <td>{row.subject}</td>
                        <td>{row.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="ap-card ap-span-6">
                <h2>Broadcast Notice</h2>
                <div className="ap-form">
                  <input placeholder="Notice title" value={noticeForm.title} onChange={(e) => setNoticeForm((form) => ({ ...form, title: e.target.value }))} />
                  <textarea placeholder="Description" value={noticeForm.description} onChange={(e) => setNoticeForm((form) => ({ ...form, description: e.target.value }))} />
                  <select value={noticeForm.audience} onChange={(e) => setNoticeForm((form) => ({ ...form, audience: e.target.value }))}>
                    <option value="all">School wide</option>
                    <option value="class">Specific class</option>
                  </select>
                  {noticeForm.audience === "class" ? (
                    <input placeholder="Class name" value={noticeForm.className} onChange={(e) => setNoticeForm((form) => ({ ...form, className: e.target.value }))} />
                  ) : null}
                  <button type="button" className="ap-btn primary" disabled={saving === "Notice"} onClick={() => void saveNotice()}>
                    {saving === "Notice" ? "Saving…" : "Publish Notice"}
                  </button>
                </div>
              </div>

              <div className="ap-card ap-span-6">
                <h2>Create Event</h2>
                <div className="ap-form">
                  <input placeholder="Event title" value={eventForm.title} onChange={(e) => setEventForm((form) => ({ ...form, title: e.target.value }))} />
                  <textarea placeholder="Description" value={eventForm.description} onChange={(e) => setEventForm((form) => ({ ...form, description: e.target.value }))} />
                  <input placeholder="Class name, leave blank for all" value={eventForm.className} onChange={(e) => setEventForm((form) => ({ ...form, className: e.target.value }))} />
                  <input type="date" value={eventForm.eventDate} onChange={(e) => setEventForm((form) => ({ ...form, eventDate: e.target.value }))} />
                  <button type="button" className="ap-btn primary" disabled={saving === "Event"} onClick={() => void saveEvent()}>
                    {saving === "Event" ? "Saving…" : "Publish Event"}
                  </button>
                </div>
              </div>

              <div className="ap-card ap-span-8">
                <h2>Students Connected to Database</h2>
                <table className="ap-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Student ID</th>
                      <th>Class</th>
                      <th>Fees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.students.slice(0, 10).map((student) => (
                      <tr key={student.studentId}>
                        <td>{student.fullName}</td>
                        <td>{student.studentId}</td>
                        <td>{student.className} {student.section}</td>
                        <td>{student.fees?.currentTermStatus ?? "Not set"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="ap-card ap-span-4">
                <h2>Teachers Connected to Database</h2>
                <div className="ap-list">
                  {dashboard.teachers.slice(0, 8).map((teacher) => (
                    <div key={teacher.teacherId} className="ap-item">
                      <strong>{teacher.name}</strong>
                      <small>{teacher.teacherId} · {teacher.subject}</small>
                      <div style={{ marginTop: "0.75rem" }}>
                        <button
                          type="button"
                          className="ap-btn secondary"
                          disabled={saving === "Teacher Delete"}
                          onClick={() => void deleteTeacherAccount(teacher.teacherId, teacher.name)}
                        >
                          {saving === "Teacher Delete" ? "Deleting…" : "Delete Teacher + Uploaded Data"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ap-card ap-span-6">
                <h2>Latest Notices and Events</h2>
                <div className="ap-list">
                  {dashboard.notices.slice(0, 4).map((item) => (
                    <div key={item.id} className="ap-item">
                      <strong>{item.title}</strong>
                      <small>{item.className || "All classes"} · {item.createdAt}</small>
                    </div>
                  ))}
                  {dashboard.events.slice(0, 4).map((item) => (
                    <div key={item.id} className="ap-item">
                      <strong>{item.title}</strong>
                      <small>{item.className || "All classes"} · {item.eventDate}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ap-card ap-span-6">
                <h2>Recent Contact Messages</h2>
                <div className="ap-list">
                  {dashboard.contacts.slice(0, 5).map((item) => (
                    <div key={item.id} className="ap-item">
                      <strong>{item.fullName}</strong>
                      <small>{item.subject || "General"} · {item.phone || item.email}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
