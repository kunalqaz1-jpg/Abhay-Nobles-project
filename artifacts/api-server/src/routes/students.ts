import { Router } from "express";
import { eq, or, and, desc, asc } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  studentsTable,
  classAttendanceTable,
  homeworkTable,
  resultsTable,
  noticesTable,
  studyMaterialsTable,
  timetableTable,
  eventsTable,
  messagesTable,
} from "@workspace/db";

const router = Router();

function sanitizeStudent(s: Record<string, unknown>) {
  const { password: _pw, ...safe } = s;
  return safe;
}

function buildAttendanceSummary(
  records: { date: string; entries: { studentId: string; status: string; remark: string }[] }[],
  studentId: string,
) {
  if (!records.length) {
    return {
      percent: "0%",
      daysPresent: 0,
      daysAbsent: 0,
      weeklyRows: [],
      calendar: [],
      monthLabel: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    };
  }

  const latestRecord = records[0];
  const monthLabel = new Date(latestRecord.date).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const presentDates: string[] = [];
  const absentDates: string[] = [];

  for (const record of records) {
    const entry = (record.entries as { studentId: string; status: string }[]).find((e) => e.studentId === studentId);
    if (!entry) continue;
    if (entry.status === "present") presentDates.push(record.date);
    else absentDates.push(record.date);
  }

  const totalDays = presentDates.length + absentDates.length;
  const percent = totalDays ? `${Math.round((presentDates.length / totalDays) * 100)}%` : "0%";

  const weeks = new Map<string, { week: string; present: number; absent: number }>();
  for (const date of presentDates) {
    const day = Number(date.slice(-2));
    const week = `W${Math.ceil(day / 7)} ${new Date(date).toLocaleDateString("en-IN", { month: "short" })}`;
    const row = weeks.get(week) || { week, present: 0, absent: 0 };
    row.present += 1;
    weeks.set(week, row);
  }
  for (const date of absentDates) {
    const day = Number(date.slice(-2));
    const week = `W${Math.ceil(day / 7)} ${new Date(date).toLocaleDateString("en-IN", { month: "short" })}`;
    const row = weeks.get(week) || { week, present: 0, absent: 0 };
    row.absent += 1;
    weeks.set(week, row);
  }

  const attendanceByDay = new Map<number, string>();
  for (const date of presentDates) attendanceByDay.set(Number(date.slice(-2)), "present");
  for (const date of absentDates) attendanceByDay.set(Number(date.slice(-2)), "absent");

  const year = Number(latestRecord.date.slice(0, 4));
  const month = Number(latestRecord.date.slice(5, 7));
  const lastDay = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const calendar = [];
  for (let day = 1; day <= lastDay; day++) {
    calendar.push({ day, status: attendanceByDay.get(day) || "muted", ...(day === 1 ? { offset: firstWeekday } : {}) });
  }

  return {
    percent,
    daysPresent: presentDates.length,
    daysAbsent: absentDates.length,
    weeklyRows: Array.from(weeks.values()).sort((a, b) => a.week.localeCompare(b.week)),
    calendar,
    monthLabel,
  };
}

async function getStudentDashboard(studentId: string) {
  const student = await db.select().from(studentsTable).where(eq(studentsTable.studentId, studentId)).limit(1);
  if (!student[0]) return null;

  const s = student[0];

  const attendanceRecords = await db
    .select()
    .from(classAttendanceTable)
    .where(eq(classAttendanceTable.className, s.className))
    .orderBy(desc(classAttendanceTable.date));

  const filteredAttendance = attendanceRecords.filter((r) =>
    (r.entries as { studentId: string }[]).some((e) => e.studentId === studentId)
  );

  const [homeworkRecords, resultsRecords, noticesRaw, materials, timetable, events, messages] = await Promise.all([
    db.select().from(homeworkTable)
      .where(eq(homeworkTable.className, s.className))
      .orderBy(desc(homeworkTable.createdAt))
      .limit(10),
    db.select().from(resultsTable)
      .where(eq(resultsTable.className, s.className))
      .orderBy(desc(resultsTable.createdAt))
      .limit(20),
    db.select().from(noticesTable)
      .orderBy(desc(noticesTable.createdAt))
      .limit(20),
    db.select().from(studyMaterialsTable)
      .where(eq(studyMaterialsTable.className, s.className))
      .orderBy(desc(studyMaterialsTable.updatedAt))
      .limit(20),
    db.select().from(timetableTable)
      .where(eq(timetableTable.className, s.className))
      .orderBy(asc(timetableTable.period))
      .limit(20),
    db.select().from(eventsTable)
      .orderBy(asc(eventsTable.eventDate))
      .limit(20),
    db.select().from(messagesTable)
      .orderBy(desc(messagesTable.sentAt))
      .limit(20),
  ]);

  const summary = buildAttendanceSummary(filteredAttendance, studentId);

  const filteredNotices = noticesRaw.filter(
    (n) => n.audience === "All Classes" || n.className === s.className || n.audience === s.className
  );
  const filteredEvents = events.filter((e) => e.className === "All Classes" || e.className === s.className);
  const filteredMessages = messages.filter(
    (m) => m.audience === "all-students" || m.className === s.className || m.studentId === studentId
  );

  function fmtDate(iso: string | null | undefined) {
    if (!iso) return "";
    try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" }); }
    catch { return iso; }
  }

  return {
    student: sanitizeStudent(s as unknown as Record<string, unknown>),
    attendance: {
      classWise: {
        className: `${s.className}-${s.section}`,
        weeks: summary.weeklyRows,
        calendarDays: summary.calendar,
      },
      summary,
    },
    homework: homeworkRecords.map((h) => ({
      subject: h.subject,
      title: h.title,
      description: h.description || "",
      dueDate: h.dueDate,
      status: "Pending",
      fileName: h.fileName || "",
      teacherName: h.teacherName || "",
    })),
    result: (() => {
      const filteredResults = resultsRecords.filter(
        (r) => !r.targetRollNo || r.targetRollNo === s.rollNo
      );
      if (!filteredResults.length) return null;
      return filteredResults.map((r) => ({
        id: r.id,
        title: r.title,
        subject: r.subject,
        examType: r.examType,
        fileName: r.fileName || "",
        teacherName: r.teacherName || "",
        createdAt: fmtDate(r.createdAt),
      }));
    })(),
    notices: filteredNotices.map((n) => ({
      title: n.title,
      type: n.audience === "All Classes" ? "General" : "Alert",
      date: fmtDate(n.createdAt ?? n.dbCreatedAt?.toISOString() ?? ""),
    })),
    materials: materials.map((m) => ({
      title: m.title,
      type: m.resourceType || "File",
      fileName: m.fileName || "",
      videoUrl: m.videoUrl || "",
    })),
    timetable: timetable.map((t) => ({
      period: t.period,
      time: t.time,
      subject: t.subject,
    })),
    events: filteredEvents.map((e) => ({
      name: e.title,
      detail: e.description || "",
      date: e.eventDate,
    })),
    messages: filteredMessages.map((m) => ({
      from: m.teacherName || "School Office",
      subject: m.subject,
      date: fmtDate(m.sentAt),
      body: m.body,
    })),
  };
}

router.get("/students", async (_req, res) => {
  const students = await db
    .select()
    .from(studentsTable)
    .orderBy(asc(studentsTable.className), asc(studentsTable.rollNo));
  res.json(students.map((s) => sanitizeStudent(s as unknown as Record<string, unknown>)));
});

router.get("/students/:studentId", async (req, res) => {
  const student = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.studentId, req.params.studentId))
    .limit(1);
  if (!student[0]) return res.status(404).json({ message: "Student not found." });
  return res.json(sanitizeStudent(student[0] as unknown as Record<string, unknown>));
});

router.post("/students/login", async (req, res) => {
  try {
    const { studentId, password } = req.body || {};
    if (!studentId || !password) return res.status(400).json({ message: "Student ID and password are required." });
    const student = await db.select().from(studentsTable).where(eq(studentsTable.studentId, studentId)).limit(1);
    if (!student[0] || student[0].password !== password) return res.status(401).json({ message: "Invalid student credentials." });
    return res.json({ student: sanitizeStudent(student[0] as unknown as Record<string, unknown>) });
  } catch (err: unknown) {
    return res.status(500).json({ message: "Login failed.", error: (err as Error).message });
  }
});

router.get("/students/:studentId/dashboard", async (req, res) => {
  try {
    const dashboard = await getStudentDashboard(req.params.studentId);
    if (!dashboard) return res.status(404).json({ message: "Student not found." });
    return res.json(dashboard);
  } catch (err: unknown) {
    return res.status(500).json({ message: "Failed to load dashboard.", error: (err as Error).message });
  }
});

router.post("/students", async (req, res) => {
  try {
    const p = req.body;
    if (!p?.studentId || !p?.fullName || !p?.className || !p?.section || !p?.rollNo) {
      return res.status(400).json({ message: "Student ID, name, class, section, and roll number are required." });
    }
    const providedPassword = p.password ? String(p.password).trim() : "";
    const existing = await db.select().from(studentsTable).where(eq(studentsTable.studentId, String(p.studentId).trim())).limit(1);
    if (!existing[0] && providedPassword.length < 4) {
      return res.status(400).json({ message: "New student password must be at least 4 characters." });
    }
    if (existing[0] && providedPassword && providedPassword.length < 4) {
      return res.status(400).json({ message: "Updated password must be at least 4 characters." });
    }
    const password = providedPassword || existing[0]?.password || "1234";
    const payload = {
      studentId: String(p.studentId).trim(),
      password,
      fullName: String(p.fullName).trim(),
      className: String(p.className).trim(),
      section: String(p.section).trim(),
      rollNo: String(p.rollNo).trim(),
      photo: String(p.photo || existing[0]?.photo || "./demo-student-profile.png").trim(),
      parents: Array.isArray(p.parents) ? p.parents : (existing[0]?.parents ?? []),
      fees: p.fees || existing[0]?.fees || { currentTermStatus: "Pending", currentTermNote: "", nextDueAmount: "0", nextDueLabel: "", history: [] },
      updatedAt: new Date(),
    };
    const saved = await db
      .insert(studentsTable)
      .values(payload)
      .onConflictDoUpdate({ target: studentsTable.studentId, set: { ...payload } })
      .returning();
    return res.json(sanitizeStudent(saved[0] as unknown as Record<string, unknown>));
  } catch (err: unknown) {
    return res.status(500).json({ message: "Failed to save student.", error: (err as Error).message });
  }
});

router.post("/students/:studentId/fees", async (req, res) => {
  try {
    const student = await db.select().from(studentsTable).where(eq(studentsTable.studentId, req.params.studentId)).limit(1);
    if (!student[0]) return res.status(404).json({ message: "Student not found." });
    if (!req.body?.fees) return res.status(400).json({ message: "fees payload is required." });
    const saved = await db
      .update(studentsTable)
      .set({ fees: req.body.fees, updatedAt: new Date() })
      .where(eq(studentsTable.studentId, req.params.studentId))
      .returning();
    return res.json(sanitizeStudent(saved[0] as unknown as Record<string, unknown>));
  } catch (err: unknown) {
    return res.status(500).json({ message: "Failed to update fees.", error: (err as Error).message });
  }
});

export default router;
