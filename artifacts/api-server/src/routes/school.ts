import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import {
  studentsTable,
  teachersTable,
  adminUsersTable,
  attendanceRecordsTable,
  homeworkTable,
  resultsTable,
  noticesTable,
  messagesTable,
  studyMaterialsTable,
  timetableTable,
  eventsTable,
  admissionsTable,
  contactsTable,
  announcementsTable,
} from "@workspace/db/schema";
import { eq, and, desc, isNull, or } from "drizzle-orm";
import bcryptjs from "bcryptjs";
import { randomUUID } from "crypto";

const router = Router();

// ─── AUTH SESSIONS (in-memory token store) ──────────────────────────────────

type SessionInfo = { role: "student" | "teacher" | "admin"; id: string; expiresAt: number };
const sessions = new Map<string, SessionInfo>();

function createToken(role: SessionInfo["role"], id: string): string {
  const token = randomUUID();
  sessions.set(token, { role, id, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
  return token;
}

function requireAuth(roles?: SessionInfo["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Unauthorised" });
    const session = sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      sessions.delete(token);
      return res.status(401).json({ error: "Session expired" });
    }
    if (roles && !roles.includes(session.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

// ─── helpers ────────────────────────────────────────────────────────────────

function formatStudent(s: typeof studentsTable.$inferSelect) {
  return {
    studentId: s.studentId,
    fullName: s.fullName,
    className: s.className,
    section: s.section,
    rollNo: s.rollNo,
    photo: s.photo,
    parents: (s.parents as object[]) ?? [],
    fees: (s.fees as object) ?? {},
  };
}

function formatTeacher(t: typeof teachersTable.$inferSelect) {
  return {
    teacherId: t.teacherId,
    name: t.name,
    subject: t.subject,
    qualification: t.qualification,
    joinDate: t.joinDate,
    phone: t.phone,
    assignedClasses: (t.assignedClasses as string[]) ?? [],
  };
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

// POST /students/login
router.post("/students/login", async (req, res) => {
  const { username, password, studentId } = req.body;
  const loginId = username || studentId;
  if (!loginId || !password) {
    return res.status(400).json({ error: "studentId and password required" });
  }
  const rows = await db.select().from(studentsTable).where(eq(studentsTable.studentId, loginId));
  if (rows.length === 0) return res.status(401).json({ error: "Invalid student ID or password" });
  const student = rows[0];
  const valid = student.passwordHash.startsWith("$2")
    ? await bcryptjs.compare(password, student.passwordHash)
    : student.passwordHash === password;
  if (!valid) return res.status(401).json({ error: "Invalid student ID or password" });
  const token = createToken("student", student.studentId);
  return res.json({ student: formatStudent(student), token });
});

// POST /teachers/login
router.post("/teachers/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "username and password required" });
  const rows = await db.select().from(teachersTable).where(eq(teachersTable.teacherId, username));
  if (rows.length === 0) return res.status(401).json({ error: "Invalid teacher ID or password" });
  const teacher = rows[0];
  const valid = teacher.passwordHash.startsWith("$2")
    ? await bcryptjs.compare(password, teacher.passwordHash)
    : teacher.passwordHash === password;
  if (!valid) return res.status(401).json({ error: "Invalid teacher ID or password" });
  const token = createToken("teacher", teacher.teacherId);
  return res.json({ ...formatTeacher(teacher), token });
});

// POST /admin/login
router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "username and password required" });
  const rows = await db.select().from(adminUsersTable).where(eq(adminUsersTable.username, username));
  if (rows.length === 0) return res.status(401).json({ error: "Invalid username or password" });
  const admin = rows[0];
  const valid = admin.passwordHash.startsWith("$2")
    ? await bcryptjs.compare(password, admin.passwordHash)
    : admin.passwordHash === password;
  if (!valid) return res.status(401).json({ error: "Invalid username or password" });
  const token = createToken("admin", admin.username);
  return res.json({ id: admin.id, username: admin.username, token });
});

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────

router.get("/admin/dashboard", requireAuth(["admin"]), async (_req, res) => {
  const [students, teachers, admissions, attendanceRows] = await Promise.all([
    db.select().from(studentsTable),
    db.select().from(teachersTable),
    db.select().from(admissionsTable).orderBy(desc(admissionsTable.createdAt)).limit(5),
    db.select().from(attendanceRecordsTable).orderBy(desc(attendanceRecordsTable.updatedAt)).limit(5),
  ]);

  const kpis = [
    { label: "Total Students", value: String(students.length), sub: "enrolled" },
    { label: "Total Teachers", value: String(teachers.length), sub: "on staff" },
    { label: "Admissions", value: String(admissions.length), sub: "recent inquiries" },
    { label: "Attendance Records", value: String(attendanceRows.length), sub: "recent entries" },
  ];

  const recentAdmissions = admissions.map((a) => ({
    id: a.id,
    studentName: a.studentName,
    parentName: a.parentName,
    phone: a.phone,
    email: a.email,
    classApplied: a.classApplied,
    message: a.message,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
  }));

  const recentAttendance = attendanceRows.map((r) => ({
    className: r.className,
    date: r.date,
    teacherName: r.teacherName,
    updatedAt: r.updatedAt.toISOString(),
    entries: (r.entries as object[]) ?? [],
  }));

  return res.json({
    kpis,
    recentAdmissions,
    recentAttendance,
    recentFees: [],
  });
});

// ─── STUDENTS ────────────────────────────────────────────────────────────────

router.get("/students", async (_req, res) => {
  const rows = await db.select().from(studentsTable).orderBy(studentsTable.fullName);
  return res.json(rows.map(formatStudent));
});

router.post("/students", async (req, res) => {
  const {
    studentId, fullName, className, section, rollNo, photo, parents, fees, password,
  } = req.body;
  if (!studentId || !fullName) {
    return res.status(400).json({ error: "studentId and fullName required" });
  }

  const existing = await db.select().from(studentsTable).where(eq(studentsTable.studentId, studentId));
  if (existing.length > 0) {
    const updated = await db
      .update(studentsTable)
      .set({
        fullName,
        className,
        section,
        rollNo,
        photo: photo ?? "",
        parents: parents ?? [],
        fees: fees ?? {},
        ...(password ? { passwordHash: password } : {}),
        updatedAt: new Date(),
      })
      .where(eq(studentsTable.studentId, studentId))
      .returning();
    return res.json(formatStudent(updated[0]));
  }

  const inserted = await db
    .insert(studentsTable)
    .values({
      studentId,
      fullName,
      className,
      section,
      rollNo,
      photo: photo ?? "",
      passwordHash: password ?? "",
      parents: parents ?? [],
      fees: fees ?? {},
    })
    .returning();
  return res.json(formatStudent(inserted[0]));
});

router.get("/students/:studentId/dashboard", requireAuth(["student"]), async (req, res) => {
  const { studentId } = req.params;
  const rows = await db.select().from(studentsTable).where(eq(studentsTable.studentId, studentId));
  if (rows.length === 0) {
    return res.status(404).json({ error: "Student not found" });
  }
  const student = rows[0];
  const cls = student.className;

  const [homework, results, notices, timetable, events, messages, materials] = await Promise.all([
    db.select().from(homeworkTable).where(eq(homeworkTable.className, cls)).orderBy(desc(homeworkTable.createdTs)).limit(10),
    db.select().from(resultsTable).where(eq(resultsTable.className, cls)).orderBy(desc(resultsTable.createdTs)).limit(10),
    db.select().from(noticesTable).orderBy(desc(noticesTable.createdTs)).limit(10),
    db.select().from(timetableTable).where(eq(timetableTable.className, cls)),
    db.select().from(eventsTable).orderBy(desc(eventsTable.createdTs)).limit(10),
    db.select().from(messagesTable).where(eq(messagesTable.className, cls)).orderBy(desc(messagesTable.sentTs)).limit(10),
    db.select().from(studyMaterialsTable).where(eq(studyMaterialsTable.className, cls)).orderBy(desc(studyMaterialsTable.updatedTs)).limit(10),
  ]);

  return res.json({
    student: formatStudent(student),
    attendance: null,
    homework: homework.map((h) => ({
      subject: h.subject,
      title: h.title,
      description: h.description ?? "",
      dueDate: h.dueDate,
      status: "Pending",
      fileName: h.fileName ?? "",
      teacherName: h.teacherName,
    })),
    result: results.map((r) => ({
      id: r.resultId,
      title: r.title,
      subject: r.subject,
      examType: r.examType,
      fileName: r.fileName ?? "",
      teacherName: r.teacherName,
      createdAt: r.createdAt,
    })),
    notices: notices.map((n) => ({
      title: n.title,
      type: n.audience ?? "General",
      date: n.createdAt,
    })),
    timetable: timetable.map((t) => ({
      period: t.period,
      time: t.time,
      subject: t.subject,
    })),
    events: events.map((e) => ({
      name: e.title,
      detail: e.description ?? "",
      date: e.eventDate,
    })),
    messages: messages.map((m) => ({
      from: m.teacherName,
      subject: m.subject,
      date: m.sentAt,
      body: m.body,
    })),
    materials: materials.map((m) => ({
      title: m.title,
      type: m.resourceType,
      fileName: m.fileName ?? "",
      videoUrl: m.videoUrl ?? "",
    })),
  });
});

router.post("/students/:studentId/fees", async (req, res) => {
  const { studentId } = req.params;
  const { fees } = req.body;
  const updated = await db
    .update(studentsTable)
    .set({ fees, updatedAt: new Date() })
    .where(eq(studentsTable.studentId, studentId))
    .returning();
  if (updated.length === 0) {
    return res.status(404).json({ error: "Student not found" });
  }
  return res.json(formatStudent(updated[0]));
});

// ─── TEACHERS ────────────────────────────────────────────────────────────────

router.get("/teachers", async (_req, res) => {
  const rows = await db.select().from(teachersTable).orderBy(teachersTable.name);
  return res.json(rows.map(formatTeacher));
});

router.post("/teachers", async (req, res) => {
  const { teacherId, name, subject, qualification, joinDate, phone, assignedClasses, password } = req.body;
  if (!teacherId || !name) {
    return res.status(400).json({ error: "teacherId and name required" });
  }

  const existing = await db.select().from(teachersTable).where(eq(teachersTable.teacherId, teacherId));
  if (existing.length > 0) {
    const updated = await db
      .update(teachersTable)
      .set({
        name, subject, qualification, joinDate, phone,
        assignedClasses: assignedClasses ?? [],
        ...(password ? { passwordHash: password } : {}),
        updatedAt: new Date(),
      })
      .where(eq(teachersTable.teacherId, teacherId))
      .returning();
    return res.json(formatTeacher(updated[0]));
  }

  const inserted = await db
    .insert(teachersTable)
    .values({
      teacherId, name, subject, qualification, joinDate, phone,
      passwordHash: password ?? "",
      assignedClasses: assignedClasses ?? [],
    })
    .returning();
  return res.json(formatTeacher(inserted[0]));
});

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────

router.post("/attendance/class", async (req, res) => {
  const { className, date, teacherName, updatedAt, entries } = req.body;

  const existing = await db
    .select()
    .from(attendanceRecordsTable)
    .where(and(eq(attendanceRecordsTable.className, className), eq(attendanceRecordsTable.date, date)));

  if (existing.length > 0) {
    const updated = await db
      .update(attendanceRecordsTable)
      .set({ teacherName, entries, updatedAt: new Date() })
      .where(eq(attendanceRecordsTable.id, existing[0].id))
      .returning();
    const r = updated[0];
    return res.json({ className: r.className, date: r.date, teacherName: r.teacherName, updatedAt: r.updatedAt.toISOString(), entries: r.entries });
  }

  const inserted = await db
    .insert(attendanceRecordsTable)
    .values({ className, date, teacherName, entries })
    .returning();
  const r = inserted[0];
  return res.json({ className: r.className, date: r.date, teacherName: r.teacherName, updatedAt: r.updatedAt.toISOString(), entries: r.entries });
});

router.get("/attendance/class", async (req, res) => {
  const { className, date } = req.query as { className: string; date: string };
  const rows = await db
    .select()
    .from(attendanceRecordsTable)
    .where(and(eq(attendanceRecordsTable.className, className), eq(attendanceRecordsTable.date, date)));
  if (rows.length === 0) {
    return res.status(404).json({ error: "No attendance record found" });
  }
  const r = rows[0];
  return res.json({ className: r.className, date: r.date, teacherName: r.teacherName, updatedAt: r.updatedAt.toISOString(), entries: r.entries });
});

router.get("/attendance/student/:studentId/latest", async (req, res) => {
  const { studentId } = req.params;
  const rows = await db
    .select()
    .from(attendanceRecordsTable)
    .orderBy(desc(attendanceRecordsTable.updatedAt))
    .limit(50);

  for (const record of rows) {
    const entries = (record.entries as Array<{ studentId: string; studentName: string; status: string; remark: string }>) ?? [];
    const entry = entries.find((e) => e.studentId === studentId);
    if (entry) {
      return res.json({
        record: { className: record.className, date: record.date, teacherName: record.teacherName, updatedAt: record.updatedAt.toISOString(), entries },
        entry,
      });
    }
  }
  return res.status(404).json({ error: "No attendance found for student" });
});

// ─── HOMEWORK ─────────────────────────────────────────────────────────────────

router.post("/homework", async (req, res) => {
  const { id, className, section, subject, title, description, dueDate, fileName, teacherName, createdAt } = req.body;

  const existing = await db.select().from(homeworkTable).where(eq(homeworkTable.hwId, id));
  if (existing.length > 0) {
    const updated = await db
      .update(homeworkTable)
      .set({ className, section, subject, title, description, dueDate, fileName, teacherName, createdAt })
      .where(eq(homeworkTable.hwId, id))
      .returning();
    const h = updated[0];
    return res.json({ id: h.hwId, className: h.className, section: h.section, subject: h.subject, title: h.title, description: h.description, dueDate: h.dueDate, fileName: h.fileName, teacherName: h.teacherName, createdAt: h.createdAt });
  }

  const inserted = await db
    .insert(homeworkTable)
    .values({ hwId: id, className, section, subject, title, description, dueDate, fileName, teacherName, createdAt })
    .returning();
  const h = inserted[0];
  return res.json({ id: h.hwId, className: h.className, section: h.section, subject: h.subject, title: h.title, description: h.description, dueDate: h.dueDate, fileName: h.fileName, teacherName: h.teacherName, createdAt: h.createdAt });
});

router.get("/homework/latest/:className", async (req, res) => {
  const className = decodeURIComponent(req.params.className);
  const rows = await db
    .select()
    .from(homeworkTable)
    .where(eq(homeworkTable.className, className))
    .orderBy(desc(homeworkTable.createdTs))
    .limit(1);
  if (rows.length === 0) {
    return res.status(404).json({ error: "No homework found" });
  }
  const h = rows[0];
  return res.json({ id: h.hwId, className: h.className, section: h.section, subject: h.subject, title: h.title, description: h.description, dueDate: h.dueDate, fileName: h.fileName, teacherName: h.teacherName, createdAt: h.createdAt });
});

// ─── RESULTS ─────────────────────────────────────────────────────────────────

router.post("/results", async (req, res) => {
  const { id, className, section, subject, examType, unitTestNumber, title, fileName, targetRollNo, teacherName, createdAt } = req.body;

  const existing = await db.select().from(resultsTable).where(eq(resultsTable.resultId, id));
  if (existing.length > 0) {
    const updated = await db
      .update(resultsTable)
      .set({ className, section, subject, examType, unitTestNumber: unitTestNumber ?? null, title, fileName, targetRollNo: targetRollNo ?? null, teacherName, createdAt })
      .where(eq(resultsTable.resultId, id))
      .returning();
    const r = updated[0];
    return res.json({ id: r.resultId, className: r.className, section: r.section, subject: r.subject, examType: r.examType, unitTestNumber: r.unitTestNumber, title: r.title, fileName: r.fileName, targetRollNo: r.targetRollNo, teacherName: r.teacherName, createdAt: r.createdAt });
  }

  const inserted = await db
    .insert(resultsTable)
    .values({ resultId: id, className, section, subject, examType, unitTestNumber: unitTestNumber ?? null, title, fileName, targetRollNo: targetRollNo ?? null, teacherName, createdAt })
    .returning();
  const r = inserted[0];
  return res.json({ id: r.resultId, className: r.className, section: r.section, subject: r.subject, examType: r.examType, unitTestNumber: r.unitTestNumber, title: r.title, fileName: r.fileName, targetRollNo: r.targetRollNo, teacherName: r.teacherName, createdAt: r.createdAt });
});

router.get("/results/latest", async (req, res) => {
  const { className, rollNo } = req.query as { className: string; rollNo?: string };
  const conditions = [eq(resultsTable.className, className)];
  if (rollNo) {
    conditions.push(eq(resultsTable.targetRollNo, rollNo));
  }
  const rows = await db
    .select()
    .from(resultsTable)
    .where(and(...conditions))
    .orderBy(desc(resultsTable.createdTs))
    .limit(1);
  if (rows.length === 0) {
    return res.status(404).json({ error: "No results found" });
  }
  const r = rows[0];
  return res.json({ id: r.resultId, className: r.className, section: r.section, subject: r.subject, examType: r.examType, unitTestNumber: r.unitTestNumber, title: r.title, fileName: r.fileName, targetRollNo: r.targetRollNo, teacherName: r.teacherName, createdAt: r.createdAt });
});

// ─── NOTICES ─────────────────────────────────────────────────────────────────

router.get("/notices", async (req, res) => {
  const { className } = req.query as { className?: string };
  let rows;
  if (className) {
    rows = await db.select().from(noticesTable)
      .where(or(eq(noticesTable.className, className), eq(noticesTable.className, ""), eq(noticesTable.audience, "all")))
      .orderBy(desc(noticesTable.createdTs));
  } else {
    rows = await db.select().from(noticesTable).orderBy(desc(noticesTable.createdTs));
  }
  return res.json(rows.map((n) => ({ id: n.noticeId, title: n.title, description: n.description, audience: n.audience, className: n.className, teacherName: n.teacherName, createdAt: n.createdAt })));
});

router.post("/notices", async (req, res) => {
  const { id, title, description, audience, className, teacherName, createdAt } = req.body;

  const existing = await db.select().from(noticesTable).where(eq(noticesTable.noticeId, id));
  if (existing.length > 0) {
    const updated = await db
      .update(noticesTable)
      .set({ title, description, audience, className, teacherName, createdAt })
      .where(eq(noticesTable.noticeId, id))
      .returning();
    const n = updated[0];
    return res.json({ id: n.noticeId, title: n.title, description: n.description, audience: n.audience, className: n.className, teacherName: n.teacherName, createdAt: n.createdAt });
  }

  const inserted = await db
    .insert(noticesTable)
    .values({ noticeId: id, title, description, audience: audience ?? "all", className: className ?? "", teacherName, createdAt })
    .returning();
  const n = inserted[0];
  return res.json({ id: n.noticeId, title: n.title, description: n.description, audience: n.audience, className: n.className, teacherName: n.teacherName, createdAt: n.createdAt });
});

// ─── MESSAGES ────────────────────────────────────────────────────────────────

router.get("/messages", async (req, res) => {
  const { className, studentId } = req.query as { className?: string; studentId?: string };
  let rows;
  if (className) {
    rows = await db.select().from(messagesTable).where(eq(messagesTable.className, className)).orderBy(desc(messagesTable.sentTs));
  } else {
    rows = await db.select().from(messagesTable).orderBy(desc(messagesTable.sentTs));
  }
  if (studentId) {
    rows = rows.filter((m) => !m.studentId || m.studentId === studentId);
  }
  return res.json(rows.map((m) => ({ id: m.messageId, subject: m.subject, body: m.body, audience: m.audience, className: m.className, studentId: m.studentId, studentName: m.studentName, teacherName: m.teacherName, sentAt: m.sentAt })));
});

router.post("/messages", async (req, res) => {
  const { id, subject, body, audience, className, studentId, studentName, teacherName, sentAt } = req.body;

  const existing = await db.select().from(messagesTable).where(eq(messagesTable.messageId, id));
  if (existing.length > 0) {
    return res.json({ id, subject, body, audience, className, studentId, studentName, teacherName, sentAt });
  }

  const inserted = await db
    .insert(messagesTable)
    .values({ messageId: id, subject, body, audience: audience ?? "class", className: className ?? "", studentId: studentId ?? null, studentName: studentName ?? null, teacherName, sentAt })
    .returning();
  const m = inserted[0];
  return res.json({ id: m.messageId, subject: m.subject, body: m.body, audience: m.audience, className: m.className, studentId: m.studentId, studentName: m.studentName, teacherName: m.teacherName, sentAt: m.sentAt });
});

// ─── STUDY MATERIALS ─────────────────────────────────────────────────────────

router.get("/materials", async (req, res) => {
  const { className } = req.query as { className?: string };
  let rows;
  if (className) {
    rows = await db.select().from(studyMaterialsTable).where(eq(studyMaterialsTable.className, className)).orderBy(desc(studyMaterialsTable.updatedTs));
  } else {
    rows = await db.select().from(studyMaterialsTable).orderBy(desc(studyMaterialsTable.updatedTs));
  }
  return res.json(rows.map((m) => ({ id: m.materialId, title: m.title, className: m.className, fileName: m.fileName, videoUrl: m.videoUrl, resourceType: m.resourceType, updatedAt: m.updatedAt })));
});

router.post("/materials", async (req, res) => {
  const { id, title, className, fileName, videoUrl, resourceType, updatedAt } = req.body;

  const existing = await db.select().from(studyMaterialsTable).where(eq(studyMaterialsTable.materialId, id));
  if (existing.length > 0) {
    const updated = await db
      .update(studyMaterialsTable)
      .set({ title, className, fileName, videoUrl, resourceType, updatedAt, updatedTs: new Date() })
      .where(eq(studyMaterialsTable.materialId, id))
      .returning();
    const m = updated[0];
    return res.json({ id: m.materialId, title: m.title, className: m.className, fileName: m.fileName, videoUrl: m.videoUrl, resourceType: m.resourceType, updatedAt: m.updatedAt });
  }

  const inserted = await db
    .insert(studyMaterialsTable)
    .values({ materialId: id, title, className, fileName: fileName ?? "", videoUrl: videoUrl ?? "", resourceType, updatedAt })
    .returning();
  const m = inserted[0];
  return res.json({ id: m.materialId, title: m.title, className: m.className, fileName: m.fileName, videoUrl: m.videoUrl, resourceType: m.resourceType, updatedAt: m.updatedAt });
});

// ─── TIMETABLE ───────────────────────────────────────────────────────────────

router.get("/timetable", async (req, res) => {
  const { className } = req.query as { className?: string };
  let rows;
  if (className) {
    rows = await db.select().from(timetableTable).where(eq(timetableTable.className, className));
  } else {
    rows = await db.select().from(timetableTable);
  }
  return res.json(rows.map((t) => ({ id: t.rowId, className: t.className, period: t.period, subject: t.subject, time: t.time, updatedAt: t.updatedAt })));
});

router.post("/timetable", async (req, res) => {
  const { id, className, period, subject, time, updatedAt } = req.body;

  const existing = await db.select().from(timetableTable).where(eq(timetableTable.rowId, id));
  if (existing.length > 0) {
    const updated = await db
      .update(timetableTable)
      .set({ className, period, subject, time, updatedAt, updatedTs: new Date() })
      .where(eq(timetableTable.rowId, id))
      .returning();
    const t = updated[0];
    return res.json({ id: t.rowId, className: t.className, period: t.period, subject: t.subject, time: t.time, updatedAt: t.updatedAt });
  }

  const inserted = await db
    .insert(timetableTable)
    .values({ rowId: id, className, period, subject, time, updatedAt })
    .returning();
  const t = inserted[0];
  return res.json({ id: t.rowId, className: t.className, period: t.period, subject: t.subject, time: t.time, updatedAt: t.updatedAt });
});

// ─── EVENTS ──────────────────────────────────────────────────────────────────

router.get("/events", async (req, res) => {
  const { className } = req.query as { className?: string };
  let rows;
  if (className) {
    rows = await db.select().from(eventsTable)
      .where(or(eq(eventsTable.className, className), eq(eventsTable.className, "")))
      .orderBy(desc(eventsTable.createdTs));
  } else {
    rows = await db.select().from(eventsTable).orderBy(desc(eventsTable.createdTs));
  }
  return res.json(rows.map((e) => ({ id: e.eventId, className: e.className, title: e.title, description: e.description, eventDate: e.eventDate, teacherName: e.teacherName, createdAt: e.createdAt })));
});

router.post("/events", async (req, res) => {
  const { id, className, title, description, eventDate, teacherName, createdAt } = req.body;

  const existing = await db.select().from(eventsTable).where(eq(eventsTable.eventId, id));
  if (existing.length > 0) {
    const updated = await db
      .update(eventsTable)
      .set({ className, title, description, eventDate, teacherName, createdAt })
      .where(eq(eventsTable.eventId, id))
      .returning();
    const e = updated[0];
    return res.json({ id: e.eventId, className: e.className, title: e.title, description: e.description, eventDate: e.eventDate, teacherName: e.teacherName, createdAt: e.createdAt });
  }

  const inserted = await db
    .insert(eventsTable)
    .values({ eventId: id, className: className ?? "", title, description: description ?? "", eventDate, teacherName, createdAt })
    .returning();
  const e = inserted[0];
  return res.json({ id: e.eventId, className: e.className, title: e.title, description: e.description, eventDate: e.eventDate, teacherName: e.teacherName, createdAt: e.createdAt });
});

// ─── ADMISSIONS ──────────────────────────────────────────────────────────────

router.post("/admissions", async (req, res) => {
  const { studentName, parentName, phone, email, classApplied, message } = req.body;
  if (!studentName || !phone) {
    return res.status(400).json({ error: "studentName and phone required" });
  }
  const inserted = await db
    .insert(admissionsTable)
    .values({ studentName, parentName: parentName ?? "", phone, email: email ?? "", classApplied: classApplied ?? "", message: message ?? "" })
    .returning();
  const a = inserted[0];
  return res.json({ id: a.id, studentName: a.studentName, parentName: a.parentName, phone: a.phone, email: a.email, classApplied: a.classApplied, message: a.message, status: a.status, createdAt: a.createdAt.toISOString() });
});

// ─── CONTACTS ────────────────────────────────────────────────────────────────

router.post("/contacts", async (req, res) => {
  const { fullName, phone, email, subject, message } = req.body;
  if (!fullName || !message) {
    return res.status(400).json({ error: "fullName and message required" });
  }
  const inserted = await db
    .insert(contactsTable)
    .values({ fullName, phone: phone ?? "", email: email ?? "", subject: subject ?? "", message })
    .returning();
  const c = inserted[0];
  return res.json({ id: c.id, fullName: c.fullName, phone: c.phone, email: c.email, subject: c.subject, message: c.message, createdAt: c.createdAt.toISOString() });
});

// ─── ANNOUNCEMENTS ───────────────────────────────────────────────────────────

router.get("/announcements", async (_req, res) => {
  const rows = await db
    .select()
    .from(announcementsTable)
    .where(eq(announcementsTable.isActive, true))
    .orderBy(announcementsTable.sortOrder);
  return res.json(rows.map((a) => ({ id: a.id, text: a.text, isActive: a.isActive, sortOrder: a.sortOrder })));
});

export default router;
