import { Router, type Request, type Response, type NextFunction } from "express";

declare module "express-serve-static-core" {
  interface Request { session?: SessionInfo; }
}

import {
  Student,
  Teacher,
  AdminUser,
  AttendanceRecord,
  Homework,
  Result,
  Notice,
  Message,
  StudyMaterial,
  TimetableRow,
  Event,
  Admission,
  Contact,
  Announcement,
  type IStudent,
  type ITeacher,
} from "@workspace/db";
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
    req.session = session;
    next();
  };
}

// ─── helpers ────────────────────────────────────────────────────────────────

function formatStudent(s: IStudent) {
  return {
    studentId: s.studentId,
    fullName: s.fullName,
    className: s.className,
    section: s.section,
    rollNo: s.rollNo,
    photo: s.photo,
    parents: s.parents ?? [],
    fees: s.fees ?? {},
  };
}

function formatTeacher(t: ITeacher) {
  return {
    teacherId: t.teacherId,
    name: t.name,
    subject: t.subject,
    qualification: t.qualification,
    joinDate: t.joinDate,
    phone: t.phone,
    assignedClasses: t.assignedClasses ?? [],
  };
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

router.post("/students/login", async (req, res) => {
  const { username, password, studentId } = req.body;
  const loginId = username || studentId;
  if (!loginId || !password) {
    return res.status(400).json({ error: "studentId and password required" });
  }
  const student = await Student.findOne({ studentId: loginId });
  if (!student) return res.status(401).json({ error: "Invalid student ID or password" });
  const valid = student.passwordHash.startsWith("$2")
    ? await bcryptjs.compare(password, student.passwordHash)
    : student.passwordHash === password;
  if (!valid) return res.status(401).json({ error: "Invalid student ID or password" });
  const token = createToken("student", student.studentId);
  return res.json({ student: formatStudent(student), token });
});

router.post("/teachers/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "username and password required" });
  const teacher = await Teacher.findOne({ teacherId: username });
  if (!teacher) return res.status(401).json({ error: "Invalid teacher ID or password" });
  const valid = teacher.passwordHash.startsWith("$2")
    ? await bcryptjs.compare(password, teacher.passwordHash)
    : teacher.passwordHash === password;
  if (!valid) return res.status(401).json({ error: "Invalid teacher ID or password" });
  const token = createToken("teacher", teacher.teacherId);
  return res.json({ ...formatTeacher(teacher), token });
});

router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "username and password required" });
  const admin = await AdminUser.findOne({ username });
  if (!admin) return res.status(401).json({ error: "Invalid username or password" });
  const valid = admin.passwordHash.startsWith("$2")
    ? await bcryptjs.compare(password, admin.passwordHash)
    : admin.passwordHash === password;
  if (!valid) return res.status(401).json({ error: "Invalid username or password" });
  const token = createToken("admin", admin.username);
  return res.json({ id: admin._id, username: admin.username, token });
});

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────

router.get("/admin/dashboard", requireAuth(["admin"]), async (_req, res) => {
  const [students, teachers, admissions, attendanceRows] = await Promise.all([
    Student.find(),
    Teacher.find(),
    Admission.find().sort({ createdAt: -1 }).limit(5),
    AttendanceRecord.find().sort({ updatedAt: -1 }).limit(5),
  ]);

  const kpis = [
    { label: "Total Students", value: String(students.length), sub: "enrolled" },
    { label: "Total Teachers", value: String(teachers.length), sub: "on staff" },
    { label: "Admissions", value: String(admissions.length), sub: "recent inquiries" },
    { label: "Attendance Records", value: String(attendanceRows.length), sub: "recent entries" },
  ];

  const recentAdmissions = admissions.map((a) => ({
    id: a._id,
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
    entries: r.entries ?? [],
  }));

  return res.json({ kpis, recentAdmissions, recentAttendance, recentFees: [] });
});

// ─── STUDENTS ────────────────────────────────────────────────────────────────

router.get("/students", async (_req, res) => {
  const rows = await Student.find().sort({ fullName: 1 });
  return res.json(rows.map(formatStudent));
});

router.post("/students", requireAuth(["admin"]), async (req, res) => {
  const { studentId, fullName, className, section, rollNo, photo, parents, fees, password } = req.body;
  if (!studentId || !fullName) {
    return res.status(400).json({ error: "studentId and fullName required" });
  }

  const existing = await Student.findOne({ studentId });
  if (existing) {
    const updates: Record<string, unknown> = { fullName, className, section, rollNo, photo: photo ?? "", parents: parents ?? [], fees: fees ?? {} };
    if (password) updates.passwordHash = await bcryptjs.hash(password, 10);
    const updated = await Student.findOneAndUpdate({ studentId }, updates, { new: true });
    return res.json(formatStudent(updated!));
  }

  const inserted = await Student.create({
    studentId, fullName, className, section, rollNo,
    photo: photo ?? "",
    passwordHash: password ? await bcryptjs.hash(password, 10) : "",
    parents: parents ?? [],
    fees: fees ?? {},
  });
  return res.json(formatStudent(inserted));
});

router.get("/students/:studentId/dashboard", requireAuth(["student"]), async (req, res) => {
  const { studentId } = req.params;
  if (req.session!.id !== studentId) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const student = await Student.findOne({ studentId });
  if (!student) return res.status(404).json({ error: "Student not found" });
  const cls = student.className;

  const [homework, results, notices, timetable, events, messages, materials] = await Promise.all([
    Homework.find({ className: cls }).sort({ createdTs: -1 }).limit(10),
    Result.find({ className: cls }).sort({ createdTs: -1 }).limit(10),
    Notice.find().sort({ createdTs: -1 }).limit(10),
    TimetableRow.find({ className: cls }),
    Event.find().sort({ createdTs: -1 }).limit(10),
    Message.find({ className: cls }).sort({ sentTs: -1 }).limit(10),
    StudyMaterial.find({ className: cls }).sort({ updatedTs: -1 }).limit(10),
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

router.post("/students/:studentId/fees", requireAuth(["admin"]), async (req, res) => {
  const { studentId } = req.params;
  const { fees } = req.body;
  const updated = await Student.findOneAndUpdate({ studentId }, { fees }, { new: true });
  if (!updated) return res.status(404).json({ error: "Student not found" });
  return res.json(formatStudent(updated));
});

// ─── TEACHERS ────────────────────────────────────────────────────────────────

router.get("/teachers", async (_req, res) => {
  const rows = await Teacher.find().sort({ name: 1 });
  return res.json(rows.map(formatTeacher));
});

router.post("/teachers", requireAuth(["admin"]), async (req, res) => {
  const { teacherId, name, subject, qualification, joinDate, phone, assignedClasses, password } = req.body;
  if (!teacherId || !name) {
    return res.status(400).json({ error: "teacherId and name required" });
  }

  const existing = await Teacher.findOne({ teacherId });
  if (existing) {
    const updates: Record<string, unknown> = { name, subject, qualification, joinDate, phone, assignedClasses: assignedClasses ?? [] };
    if (password) updates.passwordHash = await bcryptjs.hash(password, 10);
    const updated = await Teacher.findOneAndUpdate({ teacherId }, updates, { new: true });
    return res.json(formatTeacher(updated!));
  }

  const inserted = await Teacher.create({
    teacherId, name, subject, qualification, joinDate, phone,
    passwordHash: password ? await bcryptjs.hash(password, 10) : "",
    assignedClasses: assignedClasses ?? [],
  });
  return res.json(formatTeacher(inserted));
});

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────

router.post("/attendance/class", requireAuth(["teacher", "admin"]), async (req, res) => {
  const { className, date, teacherName, entries } = req.body;

  const existing = await AttendanceRecord.findOne({ className, date });
  if (existing) {
    const updated = await AttendanceRecord.findOneAndUpdate(
      { className, date },
      { teacherName, entries },
      { new: true }
    );
    const r = updated!;
    return res.json({ className: r.className, date: r.date, teacherName: r.teacherName, updatedAt: r.updatedAt.toISOString(), entries: r.entries });
  }

  const inserted = await AttendanceRecord.create({ className, date, teacherName, entries });
  return res.json({ className: inserted.className, date: inserted.date, teacherName: inserted.teacherName, updatedAt: inserted.updatedAt.toISOString(), entries: inserted.entries });
});

router.get("/attendance/class", async (req, res) => {
  const { className, date } = req.query as { className: string; date: string };
  const r = await AttendanceRecord.findOne({ className, date });
  if (!r) return res.status(404).json({ error: "No attendance record found" });
  return res.json({ className: r.className, date: r.date, teacherName: r.teacherName, updatedAt: r.updatedAt.toISOString(), entries: r.entries });
});

router.get("/attendance/student/:studentId/latest", async (req, res) => {
  const { studentId } = req.params;
  const rows = await AttendanceRecord.find().sort({ updatedAt: -1 }).limit(50);

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

router.post("/homework", requireAuth(["teacher", "admin"]), async (req, res) => {
  const { id, className, section, subject, title, description, dueDate, fileName, teacherName, createdAt } = req.body;

  const existing = await Homework.findOne({ hwId: id });
  if (existing) {
    const updated = await Homework.findOneAndUpdate(
      { hwId: id },
      { className, section, subject, title, description, dueDate, fileName, teacherName, createdAt },
      { new: true }
    );
    const h = updated!;
    return res.json({ id: h.hwId, className: h.className, section: h.section, subject: h.subject, title: h.title, description: h.description, dueDate: h.dueDate, fileName: h.fileName, teacherName: h.teacherName, createdAt: h.createdAt });
  }

  const inserted = await Homework.create({ hwId: id, className, section, subject, title, description, dueDate, fileName, teacherName, createdAt });
  return res.json({ id: inserted.hwId, className: inserted.className, section: inserted.section, subject: inserted.subject, title: inserted.title, description: inserted.description, dueDate: inserted.dueDate, fileName: inserted.fileName, teacherName: inserted.teacherName, createdAt: inserted.createdAt });
});

router.get("/homework/latest/:className", async (req, res) => {
  const className = decodeURIComponent(req.params.className);
  const h = await Homework.findOne({ className }).sort({ createdTs: -1 });
  if (!h) return res.status(404).json({ error: "No homework found" });
  return res.json({ id: h.hwId, className: h.className, section: h.section, subject: h.subject, title: h.title, description: h.description, dueDate: h.dueDate, fileName: h.fileName, teacherName: h.teacherName, createdAt: h.createdAt });
});

// ─── RESULTS ─────────────────────────────────────────────────────────────────

router.post("/results", requireAuth(["teacher", "admin"]), async (req, res) => {
  const { id, className, section, subject, examType, unitTestNumber, title, fileName, targetRollNo, teacherName, createdAt } = req.body;

  const existing = await Result.findOne({ resultId: id });
  if (existing) {
    const updated = await Result.findOneAndUpdate(
      { resultId: id },
      { className, section, subject, examType, unitTestNumber: unitTestNumber ?? null, title, fileName, targetRollNo: targetRollNo ?? null, teacherName, createdAt },
      { new: true }
    );
    const r = updated!;
    return res.json({ id: r.resultId, className: r.className, section: r.section, subject: r.subject, examType: r.examType, unitTestNumber: r.unitTestNumber, title: r.title, fileName: r.fileName, targetRollNo: r.targetRollNo, teacherName: r.teacherName, createdAt: r.createdAt });
  }

  const inserted = await Result.create({ resultId: id, className, section, subject, examType, unitTestNumber: unitTestNumber ?? null, title, fileName: fileName ?? "", targetRollNo: targetRollNo ?? null, teacherName, createdAt });
  return res.json({ id: inserted.resultId, className: inserted.className, section: inserted.section, subject: inserted.subject, examType: inserted.examType, unitTestNumber: inserted.unitTestNumber, title: inserted.title, fileName: inserted.fileName, targetRollNo: inserted.targetRollNo, teacherName: inserted.teacherName, createdAt: inserted.createdAt });
});

router.get("/results/latest", async (req, res) => {
  const { className, rollNo } = req.query as { className: string; rollNo?: string };
  const filter: Record<string, unknown> = { className };
  if (rollNo) filter.targetRollNo = rollNo;
  const r = await Result.findOne(filter).sort({ createdTs: -1 });
  if (!r) return res.status(404).json({ error: "No results found" });
  return res.json({ id: r.resultId, className: r.className, section: r.section, subject: r.subject, examType: r.examType, unitTestNumber: r.unitTestNumber, title: r.title, fileName: r.fileName, targetRollNo: r.targetRollNo, teacherName: r.teacherName, createdAt: r.createdAt });
});

// ─── NOTICES ─────────────────────────────────────────────────────────────────

router.get("/notices", async (req, res) => {
  const { className } = req.query as { className?: string };
  let rows;
  if (className) {
    rows = await Notice.find({
      $or: [{ className }, { className: "" }, { audience: "all" }],
    }).sort({ createdTs: -1 });
  } else {
    rows = await Notice.find().sort({ createdTs: -1 });
  }
  return res.json(rows.map((n) => ({ id: n.noticeId, title: n.title, description: n.description, audience: n.audience, className: n.className, teacherName: n.teacherName, createdAt: n.createdAt })));
});

router.post("/notices", requireAuth(["teacher", "admin"]), async (req, res) => {
  const { id, title, description, audience, className, teacherName, createdAt } = req.body;

  const existing = await Notice.findOne({ noticeId: id });
  if (existing) {
    const updated = await Notice.findOneAndUpdate(
      { noticeId: id },
      { title, description, audience, className, teacherName, createdAt },
      { new: true }
    );
    const n = updated!;
    return res.json({ id: n.noticeId, title: n.title, description: n.description, audience: n.audience, className: n.className, teacherName: n.teacherName, createdAt: n.createdAt });
  }

  const inserted = await Notice.create({ noticeId: id, title, description, audience: audience ?? "all", className: className ?? "", teacherName, createdAt });
  return res.json({ id: inserted.noticeId, title: inserted.title, description: inserted.description, audience: inserted.audience, className: inserted.className, teacherName: inserted.teacherName, createdAt: inserted.createdAt });
});

// ─── MESSAGES ────────────────────────────────────────────────────────────────

router.get("/messages", async (req, res) => {
  const { className, studentId } = req.query as { className?: string; studentId?: string };
  let rows;
  if (className) {
    rows = await Message.find({ className }).sort({ sentTs: -1 });
  } else {
    rows = await Message.find().sort({ sentTs: -1 });
  }
  if (studentId) {
    rows = rows.filter((m) => !m.studentId || m.studentId === studentId);
  }
  return res.json(rows.map((m) => ({ id: m.messageId, subject: m.subject, body: m.body, audience: m.audience, className: m.className, studentId: m.studentId, studentName: m.studentName, teacherName: m.teacherName, sentAt: m.sentAt })));
});

router.post("/messages", requireAuth(["teacher", "admin"]), async (req, res) => {
  const { id, subject, body, audience, className, studentId, studentName, teacherName, sentAt } = req.body;

  const existing = await Message.findOne({ messageId: id });
  if (existing) {
    return res.json({ id, subject, body, audience, className, studentId, studentName, teacherName, sentAt });
  }

  const inserted = await Message.create({ messageId: id, subject, body, audience: audience ?? "class", className: className ?? "", studentId: studentId ?? null, studentName: studentName ?? null, teacherName, sentAt });
  return res.json({ id: inserted.messageId, subject: inserted.subject, body: inserted.body, audience: inserted.audience, className: inserted.className, studentId: inserted.studentId, studentName: inserted.studentName, teacherName: inserted.teacherName, sentAt: inserted.sentAt });
});

// ─── STUDY MATERIALS ─────────────────────────────────────────────────────────

router.get("/materials", async (req, res) => {
  const { className } = req.query as { className?: string };
  let rows;
  if (className) {
    rows = await StudyMaterial.find({ className }).sort({ updatedTs: -1 });
  } else {
    rows = await StudyMaterial.find().sort({ updatedTs: -1 });
  }
  return res.json(rows.map((m) => ({ id: m.materialId, title: m.title, className: m.className, fileName: m.fileName, videoUrl: m.videoUrl, resourceType: m.resourceType, updatedAt: m.updatedAt })));
});

router.post("/materials", requireAuth(["teacher", "admin"]), async (req, res) => {
  const { id, title, className, fileName, videoUrl, resourceType, updatedAt } = req.body;

  const existing = await StudyMaterial.findOne({ materialId: id });
  if (existing) {
    const updated = await StudyMaterial.findOneAndUpdate(
      { materialId: id },
      { title, className, fileName, videoUrl, resourceType, updatedAt },
      { new: true }
    );
    const m = updated!;
    return res.json({ id: m.materialId, title: m.title, className: m.className, fileName: m.fileName, videoUrl: m.videoUrl, resourceType: m.resourceType, updatedAt: m.updatedAt });
  }

  const inserted = await StudyMaterial.create({ materialId: id, title, className, fileName: fileName ?? "", videoUrl: videoUrl ?? "", resourceType, updatedAt });
  return res.json({ id: inserted.materialId, title: inserted.title, className: inserted.className, fileName: inserted.fileName, videoUrl: inserted.videoUrl, resourceType: inserted.resourceType, updatedAt: inserted.updatedAt });
});

// ─── TIMETABLE ───────────────────────────────────────────────────────────────

router.get("/timetable", async (req, res) => {
  const { className } = req.query as { className?: string };
  const rows = className
    ? await TimetableRow.find({ className })
    : await TimetableRow.find();
  return res.json(rows.map((t) => ({ id: t.rowId, className: t.className, period: t.period, subject: t.subject, time: t.time, updatedAt: t.updatedAt })));
});

router.post("/timetable", requireAuth(["admin"]), async (req, res) => {
  const { id, className, period, subject, time, updatedAt } = req.body;

  const existing = await TimetableRow.findOne({ rowId: id });
  if (existing) {
    const updated = await TimetableRow.findOneAndUpdate(
      { rowId: id },
      { className, period, subject, time, updatedAt },
      { new: true }
    );
    const t = updated!;
    return res.json({ id: t.rowId, className: t.className, period: t.period, subject: t.subject, time: t.time, updatedAt: t.updatedAt });
  }

  const inserted = await TimetableRow.create({ rowId: id, className, period, subject, time, updatedAt });
  return res.json({ id: inserted.rowId, className: inserted.className, period: inserted.period, subject: inserted.subject, time: inserted.time, updatedAt: inserted.updatedAt });
});

// ─── EVENTS ──────────────────────────────────────────────────────────────────

router.get("/events", async (req, res) => {
  const { className } = req.query as { className?: string };
  let rows;
  if (className) {
    rows = await Event.find({ $or: [{ className }, { className: "" }] }).sort({ createdTs: -1 });
  } else {
    rows = await Event.find().sort({ createdTs: -1 });
  }
  return res.json(rows.map((e) => ({ id: e.eventId, className: e.className, title: e.title, description: e.description, eventDate: e.eventDate, teacherName: e.teacherName, createdAt: e.createdAt })));
});

router.post("/events", requireAuth(["teacher", "admin"]), async (req, res) => {
  const { id, className, title, description, eventDate, teacherName, createdAt } = req.body;

  const existing = await Event.findOne({ eventId: id });
  if (existing) {
    const updated = await Event.findOneAndUpdate(
      { eventId: id },
      { className, title, description, eventDate, teacherName, createdAt },
      { new: true }
    );
    const e = updated!;
    return res.json({ id: e.eventId, className: e.className, title: e.title, description: e.description, eventDate: e.eventDate, teacherName: e.teacherName, createdAt: e.createdAt });
  }

  const inserted = await Event.create({ eventId: id, className: className ?? "", title, description: description ?? "", eventDate, teacherName, createdAt });
  return res.json({ id: inserted.eventId, className: inserted.className, title: inserted.title, description: inserted.description, eventDate: inserted.eventDate, teacherName: inserted.teacherName, createdAt: inserted.createdAt });
});

// ─── ADMISSIONS ──────────────────────────────────────────────────────────────

router.post("/admissions", async (req, res) => {
  const { studentName, parentName, phone, email, classApplied, message } = req.body;
  if (!studentName || !phone) {
    return res.status(400).json({ error: "studentName and phone required" });
  }
  const inserted = await Admission.create({ studentName, parentName: parentName ?? "", phone, email: email ?? "", classApplied: classApplied ?? "", message: message ?? "" });
  return res.json({ id: inserted._id, studentName: inserted.studentName, parentName: inserted.parentName, phone: inserted.phone, email: inserted.email, classApplied: inserted.classApplied, message: inserted.message, status: inserted.status, createdAt: inserted.createdAt.toISOString() });
});

// ─── CONTACTS ────────────────────────────────────────────────────────────────

router.post("/contacts", async (req, res) => {
  const { fullName, phone, email, subject, message } = req.body;
  if (!fullName || !message) {
    return res.status(400).json({ error: "fullName and message required" });
  }
  const inserted = await Contact.create({ fullName, phone: phone ?? "", email: email ?? "", subject: subject ?? "", message });
  return res.json({ id: inserted._id, fullName: inserted.fullName, phone: inserted.phone, email: inserted.email, subject: inserted.subject, message: inserted.message, createdAt: inserted.createdAt.toISOString() });
});

// ─── ANNOUNCEMENTS ───────────────────────────────────────────────────────────

router.get("/announcements", async (_req, res) => {
  const rows = await Announcement.find({ isActive: true }).sort({ sortOrder: 1 });
  return res.json(rows.map((a) => ({ id: a._id, text: a.text, isActive: a.isActive, sortOrder: a.sortOrder })));
});

export default router;
