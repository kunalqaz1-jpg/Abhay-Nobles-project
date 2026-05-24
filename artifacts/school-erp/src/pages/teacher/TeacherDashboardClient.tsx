import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/shared/api-base";

type TeacherSession = { teacherId: string; name: string; subject: string };
type StudentRecord = {
  studentId: string;
  fullName: string;
  className: string;
  section: string;
  rollNo: string;
  parents: { relation: string; name: string; phone: string }[];
};
type AttendanceRecord = {
  className: string;
  date: string;
  teacherName: string;
  updatedAt: string;
  presentCount: number;
  absentCount: number;
  totalStudents: number;
  entries: { studentId: string; studentName?: string; status: string; remark?: string }[];
};
type TeacherDashboardData = {
  teacher: {
    teacherId: string;
    name: string;
    subject: string;
    qualification: string;
    joinDate: string;
    phone: string;
    assignedClasses: string[];
  };
  assignedClasses: string[];
  students: StudentRecord[];
  homework: {
    id: string;
    className: string;
    section: string;
    subject: string;
    title: string;
    description: string;
    dueDate: string;
    teacherName: string;
    createdAt: string;
  }[];
  results: {
    id: string;
    className: string;
    section: string;
    subject: string;
    examType: string;
    title: string;
    targetRollNo?: string | null;
    teacherName: string;
    createdAt: string;
  }[];
  notices: {
    id: string;
    title: string;
    description: string;
    audience: string;
    className: string;
    teacherName: string;
    createdAt: string;
  }[];
  messages: {
    id: string;
    subject: string;
    body: string;
    audience: string;
    className: string;
    studentId?: string | null;
    studentName?: string | null;
    teacherName: string;
    sentAt: string;
  }[];
  materials: {
    id: string;
    title: string;
    className: string;
    fileName: string;
    videoUrl: string;
    resourceType: string;
    teacherName: string;
    updatedAt: string;
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
  attendance: AttendanceRecord[];
};

function getTeacherSession(): TeacherSession | null {
  try {
    const raw = sessionStorage.getItem("abhay_teacher_session");
    return raw ? (JSON.parse(raw) as TeacherSession) : null;
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

function parseAssignment(value: string) {
  const [className, section] = value.split("|").map((item) => item.trim());
  return { className: className ?? "", section: section ?? "" };
}

export default function TeacherDashboardClient() {
  const [, setLocation] = useLocation();
  const [session] = useState<TeacherSession | null>(() => getTeacherSession());
  const [dashboard, setDashboard] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(todayValue());
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: string; remark: string }>>({});
  const [homeworkForm, setHomeworkForm] = useState({ title: "", description: "", dueDate: todayValue() });
  const [noticeForm, setNoticeForm] = useState({ title: "", description: "", audience: "class" });
  const [messageForm, setMessageForm] = useState({ subject: "", body: "", audience: "class", studentId: "" });
  const [materialForm, setMaterialForm] = useState({ title: "", resourceType: "PDF", fileName: "", videoUrl: "" });
  const [eventForm, setEventForm] = useState({ title: "", description: "", eventDate: todayValue() });

  const loadDashboard = async (showSpinner = false) => {
    if (!session?.teacherId) {
      setLocation("/teacher/login");
      return;
    }

    if (showSpinner) setLoading(true);
    try {
      const data = await apiRequest<TeacherDashboardData>(`/teachers/${encodeURIComponent(session.teacherId)}/dashboard`);
      setDashboard(data);
      setError("");
      if (!selectedClass && data.assignedClasses.length > 0) {
        setSelectedClass(data.assignedClasses[0]);
      }
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Unable to load teacher dashboard.";
      setError(message);
      if (message.toLowerCase().includes("session") || message.toLowerCase().includes("unauthorised")) {
        handleLogout();
      }
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.teacherId) {
      setLocation("/teacher/login");
      return;
    }
    void loadDashboard(true);
  }, [session?.teacherId]);

  useEffect(() => {
    if (!session?.teacherId) return;
    const timer = window.setInterval(() => {
      void loadDashboard(false);
    }, 10000);
    return () => window.clearInterval(timer);
  }, [session?.teacherId, selectedClass]);

  useEffect(() => {
    if (!selectedClass || !dashboard) return;
    const { className } = parseAssignment(selectedClass);
    const existing = dashboard.attendance.find((item) => item.className === className && item.date === attendanceDate);
    const nextMap: Record<string, { status: string; remark: string }> = {};
    for (const student of dashboard.students.filter((item) => item.className === className)) {
      const existingEntry = existing?.entries.find((entry) => entry.studentId === student.studentId);
      nextMap[student.studentId] = {
        status: existingEntry?.status ?? "Present",
        remark: existingEntry?.remark ?? "",
      };
    }
    setAttendanceMap(nextMap);
  }, [selectedClass, attendanceDate, dashboard]);

  const classRoster = useMemo(() => {
    if (!dashboard || !selectedClass) return [];
    const { className, section } = parseAssignment(selectedClass);
    return dashboard.students.filter((student) => student.className === className && (!section || student.section === section));
  }, [dashboard, selectedClass]);

  const recentAttendance = useMemo(() => {
    if (!dashboard || !selectedClass) return [];
    const { className } = parseAssignment(selectedClass);
    return dashboard.attendance.filter((item) => item.className === className).slice(0, 5);
  }, [dashboard, selectedClass]);

  const currentClassName = selectedClass ? parseAssignment(selectedClass).className : "";
  const attendanceSummary = recentAttendance[0];

  function handleLogout() {
    sessionStorage.removeItem("abhay_teacher_session");
    sessionStorage.removeItem("abhay_teacher_token");
    setLocation("/teacher/login");
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

  async function saveAttendance() {
    if (!dashboard || !selectedClass || classRoster.length === 0) return;
    const { className } = parseAssignment(selectedClass);
    await runSave("Attendance", async () => {
      await apiRequest("/attendance/class", {
        method: "POST",
        body: JSON.stringify({
          className,
          date: attendanceDate,
          teacherName: dashboard.teacher.name,
          entries: classRoster.map((student) => ({
            studentId: student.studentId,
            studentName: student.fullName,
            status: attendanceMap[student.studentId]?.status ?? "Present",
            remark: attendanceMap[student.studentId]?.remark ?? "",
          })),
        }),
      });
    });
  }

  async function saveHomework() {
    if (!dashboard || !selectedClass) return;
    const { className, section } = parseAssignment(selectedClass);
    await runSave("Homework", async () => {
      await apiRequest("/homework", {
        method: "POST",
        body: JSON.stringify({
          id: crypto.randomUUID(),
          className,
          section,
          subject: dashboard.teacher.subject,
          title: homeworkForm.title,
          description: homeworkForm.description,
          dueDate: homeworkForm.dueDate,
          fileName: "",
          teacherName: dashboard.teacher.name,
          createdAt: nowLabel(),
        }),
      });
      setHomeworkForm({ title: "", description: "", dueDate: todayValue() });
    });
  }

  async function saveNotice() {
    if (!dashboard || !selectedClass) return;
    const { className } = parseAssignment(selectedClass);
    await runSave("Notice", async () => {
      await apiRequest("/notices", {
        method: "POST",
        body: JSON.stringify({
          id: crypto.randomUUID(),
          title: noticeForm.title,
          description: noticeForm.description,
          audience: noticeForm.audience,
          className: noticeForm.audience === "all" ? "" : className,
          teacherName: dashboard.teacher.name,
          createdAt: nowLabel(),
        }),
      });
      setNoticeForm({ title: "", description: "", audience: "class" });
    });
  }

  async function saveMessage() {
    if (!dashboard || !selectedClass) return;
    const { className } = parseAssignment(selectedClass);
    const targetStudent = dashboard.students.find((student) => student.studentId === messageForm.studentId);
    await runSave("Message", async () => {
      await apiRequest("/messages", {
        method: "POST",
        body: JSON.stringify({
          id: crypto.randomUUID(),
          subject: messageForm.subject,
          body: messageForm.body,
          audience: messageForm.studentId ? "student" : messageForm.audience,
          className,
          studentId: targetStudent?.studentId ?? null,
          studentName: targetStudent?.fullName ?? null,
          teacherName: dashboard.teacher.name,
          sentAt: nowLabel(),
        }),
      });
      setMessageForm({ subject: "", body: "", audience: "class", studentId: "" });
    });
  }

  async function saveMaterial() {
    if (!dashboard || !selectedClass) return;
    const { className } = parseAssignment(selectedClass);
    await runSave("Material", async () => {
      await apiRequest("/materials", {
        method: "POST",
        body: JSON.stringify({
          id: crypto.randomUUID(),
          title: materialForm.title,
          className,
          fileName: materialForm.fileName,
          videoUrl: materialForm.videoUrl,
          resourceType: materialForm.resourceType,
          teacherName: dashboard.teacher.name,
          updatedAt: nowLabel(),
        }),
      });
      setMaterialForm({ title: "", resourceType: "PDF", fileName: "", videoUrl: "" });
    });
  }

  async function deleteStudentAccount(studentId: string, studentName: string) {
    const confirmed = window.confirm(`Delete student ${studentName} (${studentId}) from the portal? This cannot be undone.`);
    if (!confirmed) return;

    await runSave("Student Delete", async () => {
      await apiRequest(`/students/${encodeURIComponent(studentId)}`, {
        method: "DELETE",
      });
    });
  }

  async function saveEvent() {
    if (!dashboard || !selectedClass) return;
    const { className } = parseAssignment(selectedClass);
    await runSave("Event", async () => {
      await apiRequest("/events", {
        method: "POST",
        body: JSON.stringify({
          id: crypto.randomUUID(),
          className,
          title: eventForm.title,
          description: eventForm.description,
          eventDate: eventForm.eventDate,
          teacherName: dashboard.teacher.name,
          createdAt: nowLabel(),
        }),
      });
      setEventForm({ title: "", description: "", eventDate: todayValue() });
    });
  }

  if (!session) return null;

  return (
    <>
      <style>{`
        .td-live { min-height: 100vh; background: #f7f4ed; color: #10213b; font-family: "Outfit", sans-serif; }
        .td-shell { max-width: 1400px; margin: 0 auto; padding: 1.5rem; }
        .td-top { display: flex; justify-content: space-between; gap: 1rem; align-items: center; margin-bottom: 1.5rem; }
        .td-title h1 { margin: 0; font-size: clamp(1.8rem, 4vw, 2.6rem); font-family: "Cormorant Garamond", serif; }
        .td-title p { margin: 0.35rem 0 0; color: #516074; }
        .td-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .td-btn, .td-live input, .td-live select, .td-live textarea { font: inherit; }
        .td-btn { border: none; border-radius: 999px; padding: 0.8rem 1.2rem; cursor: pointer; }
        .td-btn.primary { background: linear-gradient(135deg, #c9a84c, #e2c97e); color: #10213b; font-weight: 700; }
        .td-btn.secondary { background: #10213b; color: #fff; }
        .td-grid { display: grid; gap: 1rem; grid-template-columns: repeat(12, minmax(0, 1fr)); }
        .td-card { background: #fff; border: 1px solid rgba(16,33,59,0.08); border-radius: 20px; padding: 1.2rem; box-shadow: 0 18px 40px rgba(16,33,59,0.06); }
        .td-card h2, .td-card h3 { margin: 0 0 0.8rem; }
        .td-card h2 { font-size: 1.05rem; }
        .td-card h3 { font-size: 0.95rem; color: #3d4f67; }
        .td-span-3 { grid-column: span 3; }
        .td-span-4 { grid-column: span 4; }
        .td-span-5 { grid-column: span 5; }
        .td-span-6 { grid-column: span 6; }
        .td-span-7 { grid-column: span 7; }
        .td-span-8 { grid-column: span 8; }
        .td-span-12 { grid-column: span 12; }
        .td-kpi strong { display: block; font-size: 1.9rem; margin-top: 0.25rem; }
        .td-kpi span { color: #64748b; font-size: 0.86rem; }
        .td-toolbar { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; margin-bottom: 1rem; }
        .td-toolbar select, .td-toolbar input, .td-form input, .td-form select, .td-form textarea { width: 100%; border: 1px solid rgba(16,33,59,0.14); border-radius: 12px; padding: 0.7rem 0.85rem; background: #fff; }
        .td-form textarea { min-height: 92px; resize: vertical; }
        .td-form { display: grid; gap: 0.75rem; }
        .td-form.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .td-list { display: grid; gap: 0.75rem; }
        .td-item { padding: 0.85rem; border-radius: 14px; background: #f8fafc; border: 1px solid rgba(16,33,59,0.08); }
        .td-item strong { display: block; margin-bottom: 0.25rem; }
        .td-item small { color: #64748b; }
        .td-table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
        .td-table th, .td-table td { text-align: left; padding: 0.65rem; border-bottom: 1px solid rgba(16,33,59,0.08); vertical-align: top; }
        .td-table th { color: #475569; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; }
        .td-pill { display: inline-flex; padding: 0.25rem 0.65rem; border-radius: 999px; font-size: 0.78rem; background: #dbeafe; color: #1d4ed8; }
        .td-banner { margin-bottom: 1rem; padding: 0.85rem 1rem; border-radius: 14px; }
        .td-banner.error { background: #fee2e2; color: #991b1b; }
        .td-banner.ok { background: #dcfce7; color: #166534; }
        @media (max-width: 1100px) {
          .td-span-3, .td-span-4, .td-span-5, .td-span-6, .td-span-7, .td-span-8 { grid-column: span 12; }
          .td-form.two { grid-template-columns: 1fr; }
          .td-top { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
      <div className="td-live">
        <div className="td-shell">
          <div className="td-top">
            <div className="td-title">
              <h1>{dashboard?.teacher.name ?? session.name}</h1>
              <p>
                Teacher dashboard with live database data. Student portal refreshes automatically after your updates.
              </p>
            </div>
            <div className="td-actions">
              <button type="button" className="td-btn secondary" onClick={() => void loadDashboard(false)}>
                Refresh
              </button>
              <button type="button" className="td-btn primary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>

          {error ? <div className="td-banner error">{error}</div> : null}
          {notice ? <div className="td-banner ok">{notice}</div> : null}

          {loading || !dashboard ? (
            <div className="td-card">Loading teacher dashboard…</div>
          ) : (
            <div className="td-grid">
              <div className="td-card td-span-3 td-kpi">
                <span>Assigned Classes</span>
                <strong>{dashboard.assignedClasses.length}</strong>
              </div>
              <div className="td-card td-span-3 td-kpi">
                <span>Students Connected</span>
                <strong>{dashboard.students.length}</strong>
              </div>
              <div className="td-card td-span-3 td-kpi">
                <span>Latest Attendance</span>
                <strong>{attendanceSummary ? `${attendanceSummary.presentCount}/${attendanceSummary.totalStudents}` : "—"}</strong>
              </div>
              <div className="td-card td-span-3 td-kpi">
                <span>Recent Messages</span>
                <strong>{dashboard.messages.length}</strong>
              </div>

              <div className="td-card td-span-12">
                <div className="td-toolbar">
                  <div style={{ minWidth: 280, flex: 1 }}>
                    <label>Working Class</label>
                    <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                      {dashboard.assignedClasses.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ minWidth: 220 }}>
                    <label>Attendance Date</label>
                    <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="td-card td-span-7">
                <h2>Class Roster</h2>
                <table className="td-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Roll</th>
                      <th>Status</th>
                      <th>Remark</th>
                      <th>Account</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classRoster.map((student) => (
                      <tr key={student.studentId}>
                        <td>
                          <strong>{student.fullName}</strong>
                          <div><small>{student.studentId}</small></div>
                        </td>
                        <td>{student.rollNo}</td>
                        <td>
                          <select
                            value={attendanceMap[student.studentId]?.status ?? "Present"}
                            onChange={(e) => setAttendanceMap((current) => ({
                              ...current,
                              [student.studentId]: {
                                status: e.target.value,
                                remark: current[student.studentId]?.remark ?? "",
                              },
                            }))}
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Leave">Leave</option>
                          </select>
                        </td>
                        <td>
                          <input
                            value={attendanceMap[student.studentId]?.remark ?? ""}
                            onChange={(e) => setAttendanceMap((current) => ({
                              ...current,
                              [student.studentId]: {
                                status: current[student.studentId]?.status ?? "Present",
                                remark: e.target.value,
                              },
                            }))}
                            placeholder="Optional note"
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="td-btn secondary"
                            disabled={saving === "Student Delete"}
                            onClick={() => void deleteStudentAccount(student.studentId, student.fullName)}
                            style={{ padding: "0.55rem 0.9rem" }}
                          >
                            {saving === "Student Delete" ? "Deleting…" : "Delete Student"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: "1rem" }}>
                  <button type="button" className="td-btn primary" disabled={saving === "Attendance"} onClick={() => void saveAttendance()}>
                    {saving === "Attendance" ? "Saving…" : "Save Attendance"}
                  </button>
                </div>
              </div>

              <div className="td-card td-span-5">
                <h2>Recent Attendance Sync</h2>
                <div className="td-list">
                  {recentAttendance.map((item) => (
                    <div key={`${item.className}-${item.date}`} className="td-item">
                      <strong>{item.className} · {item.date}</strong>
                      <small>{item.presentCount} present, {item.absentCount} absent · updated {new Date(item.updatedAt).toLocaleString("en-IN")}</small>
                    </div>
                  ))}
                  {recentAttendance.length === 0 ? <div className="td-item"><small>No attendance saved yet.</small></div> : null}
                </div>
              </div>

              <div className="td-card td-span-4">
                <h2>Post Homework</h2>
                <div className="td-form">
                  <input placeholder="Homework title" value={homeworkForm.title} onChange={(e) => setHomeworkForm((form) => ({ ...form, title: e.target.value }))} />
                  <textarea placeholder="Description" value={homeworkForm.description} onChange={(e) => setHomeworkForm((form) => ({ ...form, description: e.target.value }))} />
                  <input type="date" value={homeworkForm.dueDate} onChange={(e) => setHomeworkForm((form) => ({ ...form, dueDate: e.target.value }))} />
                  <button type="button" className="td-btn primary" disabled={saving === "Homework"} onClick={() => void saveHomework()}>
                    {saving === "Homework" ? "Saving…" : "Publish Homework"}
                  </button>
                </div>
              </div>

              <div className="td-card td-span-4">
                <h2>Send Notice</h2>
                <div className="td-form">
                  <input placeholder="Notice title" value={noticeForm.title} onChange={(e) => setNoticeForm((form) => ({ ...form, title: e.target.value }))} />
                  <textarea placeholder="Notice description" value={noticeForm.description} onChange={(e) => setNoticeForm((form) => ({ ...form, description: e.target.value }))} />
                  <select value={noticeForm.audience} onChange={(e) => setNoticeForm((form) => ({ ...form, audience: e.target.value }))}>
                    <option value="class">Only this class</option>
                    <option value="all">School wide</option>
                  </select>
                  <button type="button" className="td-btn primary" disabled={saving === "Notice"} onClick={() => void saveNotice()}>
                    {saving === "Notice" ? "Saving…" : "Publish Notice"}
                  </button>
                </div>
              </div>

              <div className="td-card td-span-4">
                <h2>Send Message</h2>
                <div className="td-form">
                  <input placeholder="Subject" value={messageForm.subject} onChange={(e) => setMessageForm((form) => ({ ...form, subject: e.target.value }))} />
                  <textarea placeholder="Message body" value={messageForm.body} onChange={(e) => setMessageForm((form) => ({ ...form, body: e.target.value }))} />
                  <select value={messageForm.studentId} onChange={(e) => setMessageForm((form) => ({ ...form, studentId: e.target.value }))}>
                    <option value="">Entire class</option>
                    {classRoster.map((student) => (
                      <option key={student.studentId} value={student.studentId}>{student.fullName}</option>
                    ))}
                  </select>
                  <button type="button" className="td-btn primary" disabled={saving === "Message"} onClick={() => void saveMessage()}>
                    {saving === "Message" ? "Saving…" : "Send Message"}
                  </button>
                </div>
              </div>

              <div className="td-card td-span-6">
                <h2>Study Material</h2>
                <div className="td-form two">
                  <input placeholder="Material title" value={materialForm.title} onChange={(e) => setMaterialForm((form) => ({ ...form, title: e.target.value }))} />
                  <select value={materialForm.resourceType} onChange={(e) => setMaterialForm((form) => ({ ...form, resourceType: e.target.value }))}>
                    <option value="PDF">PDF</option>
                    <option value="Video">Video</option>
                    <option value="Worksheet">Worksheet</option>
                    <option value="Notes">Notes</option>
                  </select>
                  <input placeholder="File name (optional)" value={materialForm.fileName} onChange={(e) => setMaterialForm((form) => ({ ...form, fileName: e.target.value }))} />
                  <input placeholder="Video URL (optional)" value={materialForm.videoUrl} onChange={(e) => setMaterialForm((form) => ({ ...form, videoUrl: e.target.value }))} />
                </div>
                <div style={{ marginTop: "1rem" }}>
                  <button type="button" className="td-btn primary" disabled={saving === "Material"} onClick={() => void saveMaterial()}>
                    {saving === "Material" ? "Saving…" : "Save Material"}
                  </button>
                </div>
              </div>

              <div className="td-card td-span-6">
                <h2>Create Event</h2>
                <div className="td-form">
                  <input placeholder="Event title" value={eventForm.title} onChange={(e) => setEventForm((form) => ({ ...form, title: e.target.value }))} />
                  <textarea placeholder="Event description" value={eventForm.description} onChange={(e) => setEventForm((form) => ({ ...form, description: e.target.value }))} />
                  <input type="date" value={eventForm.eventDate} onChange={(e) => setEventForm((form) => ({ ...form, eventDate: e.target.value }))} />
                  <button type="button" className="td-btn primary" disabled={saving === "Event"} onClick={() => void saveEvent()}>
                    {saving === "Event" ? "Saving…" : "Publish Event"}
                  </button>
                </div>
              </div>

              <div className="td-card td-span-6">
                <h2>Recent Communication</h2>
                <div className="td-list">
                  {dashboard.notices.slice(0, 4).map((item) => (
                    <div key={item.id} className="td-item">
                      <strong>{item.title}</strong>
                      <small>{item.className || "All classes"} · {item.createdAt}</small>
                    </div>
                  ))}
                  {dashboard.messages.slice(0, 4).map((item) => (
                    <div key={item.id} className="td-item">
                      <strong>{item.subject}</strong>
                      <small>{item.studentName ?? item.className} · {item.sentAt}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="td-card td-span-6">
                <h2>Student Portal Feed</h2>
                <div className="td-list">
                  {dashboard.homework.slice(0, 3).map((item) => (
                    <div key={item.id} className="td-item">
                      <strong>{item.title}</strong>
                      <small>{item.className} · due {item.dueDate}</small>
                    </div>
                  ))}
                  {dashboard.materials.slice(0, 3).map((item) => (
                    <div key={item.id} className="td-item">
                      <strong>{item.title}</strong>
                      <small>{item.className} · {item.resourceType}</small>
                    </div>
                  ))}
                  {dashboard.events.slice(0, 3).map((item) => (
                    <div key={item.id} className="td-item">
                      <strong>{item.title}</strong>
                      <small>{item.className || "All classes"} · {item.eventDate}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="td-card td-span-12">
                <h2>Timetable for {currentClassName || "Assigned Classes"}</h2>
                <table className="td-table">
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Period</th>
                      <th>Subject</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.timetable
                      .filter((row) => !currentClassName || row.className === currentClassName)
                      .map((row) => (
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
            </div>
          )}
        </div>
      </div>
    </>
  );
}
