import { Router, type Request, type Response, type NextFunction } from "express";
import nodemailer from "nodemailer";

type SessionInfo = { role: "student" | "teacher" | "admin"; id: string; expiresAt: number };

declare module "express" {
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
  GalleryImage,
  Session,
  type IStudent,
  type ITeacher,
} from "@workspace/db";
import bcryptjs from "bcryptjs";
import { randomUUID } from "crypto";

const router = Router();

// ─── EMAIL MAILER ─────────────────────────────────────────────────────────────

function createMailer() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

async function sendEnquiryEmail(data: {
  type: "admission" | "contact";
  studentName?: string;
  parentName?: string;
  fullName?: string;
  phone: string;
  email: string;
  classApplied?: string;
  subject?: string;
  message?: string;
}) {
  const mailer = createMailer();
  if (!mailer) return;
  const to = process.env.SMTP_USER!;
  const isAdmission = data.type === "admission";

  const htmlBody = isAdmission
    ? `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:#0f172a;padding:20px 24px">
          <h2 style="color:#c9a84c;margin:0;font-size:18px">🎓 New Admission Enquiry</h2>
          <p style="color:#94a3b8;margin:4px 0 0;font-size:13px">Shri Abhay Nobles Senior Secondary School</p>
        </div>
        <div style="padding:24px">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#64748b;width:140px">Student Name</td><td style="font-weight:600">${data.studentName || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Parent Name</td><td style="font-weight:600">${data.parentName || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Mobile</td><td style="font-weight:600">${data.phone}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Email</td><td style="font-weight:600">${data.email || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Class Sought</td><td style="font-weight:600">${data.classApplied || "—"}</td></tr>
          </table>
          <p style="margin:16px 0 0;font-size:13px;color:#64748b">Please follow up within 24 hours.</p>
        </div>
      </div>`
    : `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:#0f172a;padding:20px 24px">
          <h2 style="color:#c9a84c;margin:0;font-size:18px">📬 New Contact Message</h2>
          <p style="color:#94a3b8;margin:4px 0 0;font-size:13px">Shri Abhay Nobles Senior Secondary School</p>
        </div>
        <div style="padding:24px">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#64748b;width:140px">Name</td><td style="font-weight:600">${data.fullName || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Mobile</td><td style="font-weight:600">${data.phone || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Email</td><td style="font-weight:600">${data.email || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Subject</td><td style="font-weight:600">${data.subject || "—"}</td></tr>
          </table>
          <div style="margin-top:16px;background:#f8fafc;border-radius:8px;padding:12px;font-size:14px;color:#0f172a">${data.message || ""}</div>
        </div>
      </div>`;

  await mailer.sendMail({
    from: `"Shri Abhay Nobles ERP" <${to}>`,
    to,
    subject: isAdmission
      ? `New Admission Enquiry — ${data.studentName || data.parentName} (${data.classApplied || "Class?"})`
      : `Contact Message — ${data.fullName} (${data.subject || "General"})`,
    html: htmlBody,
  });
}

// ─── AUTH SESSIONS (MongoDB-backed token store) ──────────────────────────────

async function createToken(role: SessionInfo["role"], id: string): Promise<string> {
  const token = randomUUID();
  await Session.create({
    token,
    role,
    sessionId: id,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  return token;
}

function requireAuth(roles?: SessionInfo["role"][]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Unauthorised" });
    const sessionDoc = await Session.findOne({ token, expiresAt: { $gt: new Date() } });
    if (!sessionDoc) {
      return res.status(401).json({ error: "Session expired" });
    }
    if (roles && !roles.includes(sessionDoc.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    req.session = { role: sessionDoc.role, id: sessionDoc.sessionId, expiresAt: sessionDoc.expiresAt.getTime() };
    return next();
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

function matchesStudentClass(student: IStudent, className?: string, section?: string) {
  if (!className) return true;
  if (student.className !== className) return false;
  if (!section) return true;
  return student.section === section;
}

function normalizeClassName(value: unknown) {
  return String(value || "").trim();
}

function normalizeSection(className: string, section: unknown) {
  const normalizedSection = String(section || "").trim();
  return normalizedSection || (className.split("-")[1] ?? "");
}

function normalizeAudience(value: unknown) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized || normalized === "all classes" || normalized === "all-students") {
    return "all";
  }
  return normalized;
}

function isSchoolWideAudience(value: unknown) {
  return normalizeAudience(value) === "all";
}

function normalizeAttendanceEntries(
  entries: unknown,
): Array<{ studentId: string; studentName?: string; status: string; remark?: string }> {
  if (!Array.isArray(entries)) return [];

  return entries.map((entry) => {
    const record = entry as {
      studentId?: unknown;
      studentName?: unknown;
      status?: unknown;
      remark?: unknown;
    };
    const normalizedStatus = String(record.status || "").trim().toLowerCase() === "absent" ? "Absent" : "Present";

    return {
      studentId: String(record.studentId || "").trim(),
      studentName: record.studentName ? String(record.studentName).trim() : "",
      status: normalizedStatus,
      remark: record.remark ? String(record.remark).trim() : "",
    };
  });
}

function parseAssignedClass(assignment: string) {
  const raw = String(assignment || "").trim();
  if (!raw) return { className: "", section: "" };
  if (raw.includes("|")) {
    const [className = "", section = ""] = raw.split("|").map((part) => part.trim());
    return { className: section ? `${className}-${section}` : className, section };
  }
  const [className = "", section = ""] = raw.split("-").map((part) => part.trim());
  return { className: raw, section: raw.includes("-") ? section : "" };
}

function teacherCanManageStudent(teacher: ITeacher, student: IStudent) {
  const assignedClasses = teacher.assignedClasses ?? [];
  return assignedClasses.some((assignment) => {
    const { className, section } = parseAssignedClass(assignment);
    return matchesStudentClass(student, className, section);
  });
}

function formatAttendanceSummary(
  record: {
    className: string;
    date: string;
    teacherName: string;
    updatedAt: Date;
    entries?: Array<{ studentId: string; studentName?: string; status: string; remark?: string }>;
  },
  studentId?: string,
) {
  const entries = record.entries ?? [];
  const presentCount = entries.filter((entry) => String(entry.status).toLowerCase() === "present").length;
  const absentCount = entries.length - presentCount;
  const studentEntry = studentId ? entries.find((entry) => entry.studentId === studentId) ?? null : null;

  return {
    className: record.className,
    date: record.date,
    teacherName: record.teacherName,
    updatedAt: record.updatedAt.toISOString(),
    presentCount,
    absentCount,
    totalStudents: entries.length,
    studentEntry,
    entries,
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
  const token = await createToken("student", student.studentId);
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
  const token = await createToken("teacher", teacher.teacherId);
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
  const token = await createToken("admin", admin.username);
  return res.json({ id: admin._id, username: admin.username, token });
});

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────

router.get("/admin/dashboard", requireAuth(["admin"]), async (_req, res) => {
  const [students, teachers, admissions, attendanceRows, notices, events, timetableRows, contacts] = await Promise.all([
    Student.find(),
    Teacher.find(),
    Admission.find().sort({ createdAt: -1 }).limit(5),
    AttendanceRecord.find().sort({ updatedAt: -1 }).limit(5),
    Notice.find().sort({ createdTs: -1 }).limit(10),
    Event.find().sort({ createdTs: -1 }).limit(10),
    TimetableRow.find().sort({ updatedTs: -1 }).limit(20),
    Contact.find().sort({ createdAt: -1 }).limit(10),
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

  const recentAttendance = attendanceRows.map((r) => formatAttendanceSummary({
    className: r.className,
    date: r.date,
    teacherName: r.teacherName,
    updatedAt: r.updatedAt,
    entries: (r.entries as Array<{ studentId: string; studentName?: string; status: string; remark?: string }>) ?? [],
  }));

  return res.json({
    kpis,
    recentAdmissions,
    recentAttendance,
    recentFees: [],
    students: students.map(formatStudent),
    teachers: teachers.map(formatTeacher),
    notices: notices.map((n) => ({
      id: n.noticeId,
      title: n.title,
      description: n.description,
      audience: n.audience,
      className: n.className,
      teacherName: n.teacherName,
      createdAt: n.createdAt,
    })),
    events: events.map((e) => ({
      id: e.eventId,
      className: e.className,
      title: e.title,
      description: e.description,
      eventDate: e.eventDate,
      teacherName: e.teacherName,
      createdAt: e.createdAt,
    })),
    timetable: timetableRows.map((t) => ({
      id: t.rowId,
      className: t.className,
      period: t.period,
      subject: t.subject,
      time: t.time,
      updatedAt: t.updatedAt,
    })),
    contacts: contacts.map((c) => ({
      id: c._id,
      fullName: c.fullName,
      phone: c.phone,
      email: c.email,
      subject: c.subject,
      message: c.message,
      createdAt: c.createdAt.toISOString(),
    })),
  });
});

// ─── STUDENTS ────────────────────────────────────────────────────────────────

router.get("/students", async (_req, res) => {
  const rows = await Student.find().sort({ fullName: 1 });
  return res.json(rows.map(formatStudent));
});

router.post("/students", requireAuth(["admin", "teacher"]), async (req, res) => {
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

router.delete("/students/:studentId", requireAuth(["admin", "teacher"]), async (req: Request, res) => {
  const { studentId } = req.params;
  const student = await Student.findOne({ studentId });
  if (!student) return res.status(404).json({ error: "Student not found" });

  if (req.session?.role === "teacher") {
    const teacher = await Teacher.findOne({ teacherId: req.session.id });
    if (!teacher || !teacherCanManageStudent(teacher, student)) {
      return res.status(403).json({ error: "You can only delete students from your assigned classes" });
    }
  }

  await Promise.all([
    Student.deleteOne({ studentId }),
    Session.deleteMany({ role: "student", sessionId: studentId }),
    Message.deleteMany({ studentId }),
    Result.deleteMany({ className: student.className, targetRollNo: student.rollNo }),
  ]);

  const attendanceRecords = await AttendanceRecord.find({ "entries.studentId": studentId });
  await Promise.all(attendanceRecords.map(async (record) => {
    const nextEntries = ((record.entries as Array<{ studentId: string }>) ?? []).filter((entry) => entry.studentId !== studentId);
    if (nextEntries.length === 0) {
      await AttendanceRecord.deleteOne({ _id: record._id });
      return;
    }
    record.entries = nextEntries;
    await record.save();
  }));

  return res.json({
    success: true,
    deletedStudentId: studentId,
  });
});

router.get("/students/:studentId/dashboard", requireAuth(["student"]), async (req: Request, res) => {
  const { studentId } = req.params;
  if (req.session!.id !== studentId) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const student = await Student.findOne({ studentId });
  if (!student) return res.status(404).json({ error: "Student not found" });
  const cls = student.className;

  const [homework, results, notices, timetable, events, messages, materials, attendanceRows] = await Promise.all([
    Homework.find({ className: cls }).sort({ createdTs: -1 }).limit(10),
    Result.find({
      className: cls,
      $or: [{ targetRollNo: student.rollNo }, { targetRollNo: null }, { targetRollNo: "" }],
    }).sort({ createdTs: -1 }).limit(10),
    Notice.find({
      $or: [
        { className: cls },
        { className: "" },
        { audience: { $in: ["all", "All Classes"] } },
      ],
    }).sort({ createdTs: -1 }).limit(10),
    TimetableRow.find({ className: cls }),
    Event.find({
      $or: [{ className: cls }, { className: "" }],
    }).sort({ createdTs: -1 }).limit(10),
    Message.find({
      $or: [
        { className: cls },
        { className: "" },
        { studentId: student.studentId },
      ],
    }).sort({ sentTs: -1 }).limit(10),
    StudyMaterial.find({ className: cls }).sort({ updatedTs: -1 }).limit(10),
    AttendanceRecord.find().sort({ updatedAt: -1 }).limit(100),
  ]);

  const latestAttendanceRecord = attendanceRows.find((record) => {
    const entries = (record.entries as Array<{ studentId: string; status: string; remark?: string }>) ?? [];
    return entries.some((entry) => entry.studentId === student.studentId);
  });

  const attendance = latestAttendanceRecord
    ? formatAttendanceSummary({
      className: latestAttendanceRecord.className,
      date: latestAttendanceRecord.date,
      teacherName: latestAttendanceRecord.teacherName,
      updatedAt: latestAttendanceRecord.updatedAt,
      entries: (latestAttendanceRecord.entries as Array<{ studentId: string; studentName?: string; status: string; remark?: string }>) ?? [],
    }, student.studentId)
    : null;

  return res.json({
    student: formatStudent(student),
    attendance,
    homework: homework.map((h) => ({
      subject: h.subject,
      title: h.title,
      description: h.description ?? "",
      dueDate: h.dueDate,
      status: "Pending",
      fileName: h.fileName ?? "",
      fileData: h.fileData ?? "",
      fileMimeType: h.fileMimeType ?? "",
      teacherName: h.teacherName,
    })),
    result: results.map((r) => ({
      id: r.resultId,
      title: r.title,
      subject: r.subject,
      examType: r.examType,
      fileName: r.fileName ?? "",
      fileData: r.fileData ?? "",
      fileMimeType: r.fileMimeType ?? "",
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
      fileData: m.fileData ?? "",
      fileMimeType: m.fileMimeType ?? "",
      videoUrl: m.videoUrl ?? "",
    })),
  });
});

router.get("/teachers/:teacherId/dashboard", requireAuth(["teacher"]), async (req: Request, res) => {
  const { teacherId } = req.params;
  if (req.session!.id !== teacherId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const teacher = await Teacher.findOne({ teacherId });
  if (!teacher) return res.status(404).json({ error: "Teacher not found" });

  const assignedClasses = teacher.assignedClasses ?? [];
  const classNames = assignedClasses.map((item) => parseAssignedClass(item).className).filter(Boolean);
  const uniqueClassNames = [...new Set(classNames)];

  const [students, homeworks, results, notices, messages, materials, events, timetableRows, attendanceRows] = await Promise.all([
    Student.find(),
    Homework.find({ className: { $in: uniqueClassNames } }).sort({ createdTs: -1 }).limit(20),
    Result.find({ className: { $in: uniqueClassNames } }).sort({ createdTs: -1 }).limit(20),
    Notice.find({
      $or: [
        { className: { $in: uniqueClassNames } },
        { className: "" },
        { audience: "all" },
      ],
    }).sort({ createdTs: -1 }).limit(20),
    Message.find({
      $or: [{ className: { $in: uniqueClassNames } }, { className: "" }],
    }).sort({ sentTs: -1 }).limit(20),
    StudyMaterial.find({ className: { $in: uniqueClassNames } }).sort({ updatedTs: -1 }).limit(20),
    Event.find({
      $or: [
        { className: { $in: uniqueClassNames } },
        { className: "" },
      ],
    }).sort({ createdTs: -1 }).limit(20),
    TimetableRow.find({ className: { $in: uniqueClassNames } }).sort({ updatedTs: -1 }),
    AttendanceRecord.find({ className: { $in: uniqueClassNames } }).sort({ updatedAt: -1 }).limit(20),
  ]);

  const roster = students
    .filter((student) => assignedClasses.some((assignment) => {
      const { className, section } = parseAssignedClass(assignment);
      return matchesStudentClass(student, className, section);
    }))
    .map(formatStudent);

  return res.json({
    teacher: formatTeacher(teacher),
    assignedClasses,
    students: roster,
    homework: homeworks.map((h) => ({
      id: h.hwId,
      className: h.className,
      section: h.section,
      subject: h.subject,
      title: h.title,
      description: h.description,
      dueDate: h.dueDate,
      fileName: h.fileName,
      fileData: h.fileData ?? "",
      fileMimeType: h.fileMimeType ?? "",
      teacherName: h.teacherName,
      createdAt: h.createdAt,
    })),
    results: results.map((r) => ({
      id: r.resultId,
      className: r.className,
      section: r.section,
      subject: r.subject,
      examType: r.examType,
      title: r.title,
      fileName: r.fileName,
      fileData: r.fileData ?? "",
      fileMimeType: r.fileMimeType ?? "",
      targetRollNo: r.targetRollNo,
      teacherName: r.teacherName,
      createdAt: r.createdAt,
    })),
    notices: notices.map((n) => ({
      id: n.noticeId,
      title: n.title,
      description: n.description,
      audience: n.audience,
      className: n.className,
      teacherName: n.teacherName,
      createdAt: n.createdAt,
    })),
    messages: messages.map((m) => ({
      id: m.messageId,
      subject: m.subject,
      body: m.body,
      audience: m.audience,
      className: m.className,
      studentId: m.studentId,
      studentName: m.studentName,
      teacherName: m.teacherName,
      sentAt: m.sentAt,
    })),
    materials: materials.map((m) => ({
      id: m.materialId,
      title: m.title,
      className: m.className,
      fileName: m.fileName,
      fileData: m.fileData ?? "",
      fileMimeType: m.fileMimeType ?? "",
      videoUrl: m.videoUrl,
      resourceType: m.resourceType,
      teacherName: m.teacherName,
      updatedAt: m.updatedAt,
    })),
    events: events.map((e) => ({
      id: e.eventId,
      className: e.className,
      title: e.title,
      description: e.description,
      eventDate: e.eventDate,
      teacherName: e.teacherName,
      createdAt: e.createdAt,
    })),
    timetable: timetableRows.map((t) => ({
      id: t.rowId,
      className: t.className,
      period: t.period,
      subject: t.subject,
      time: t.time,
      updatedAt: t.updatedAt,
    })),
    attendance: attendanceRows.map((record) => formatAttendanceSummary({
      className: record.className,
      date: record.date,
      teacherName: record.teacherName,
      updatedAt: record.updatedAt,
      entries: (record.entries as Array<{ studentId: string; studentName?: string; status: string; remark?: string }>) ?? [],
    })),
  });
});

router.post("/students/:studentId/fees", requireAuth(["admin", "teacher"]), async (req: Request, res) => {
  const { studentId } = req.params;
  const { fees } = req.body;
  if (req.session?.role === "teacher") {
    const teacher = await Teacher.findOne({ teacherId: req.session.id });
    const student = await Student.findOne({ studentId });
    if (!teacher || !student || !teacherCanManageStudent(teacher, student)) {
      return res.status(403).json({ error: "You can only update fees for students in your assigned classes" });
    }
  }
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
  const normalizedAssignedClasses = Array.isArray(assignedClasses)
    ? assignedClasses
        .map((value) => parseAssignedClass(String(value || "")).className)
        .filter(Boolean)
    : [];

  const existing = await Teacher.findOne({ teacherId });
  if (existing) {
    const updates: Record<string, unknown> = { name, subject, qualification, joinDate, phone, assignedClasses: normalizedAssignedClasses };
    if (password) updates.passwordHash = await bcryptjs.hash(password, 10);
    const updated = await Teacher.findOneAndUpdate({ teacherId }, updates, { new: true });
    return res.json(formatTeacher(updated!));
  }

  const inserted = await Teacher.create({
    teacherId, name, subject, qualification, joinDate, phone,
    passwordHash: password ? await bcryptjs.hash(password, 10) : "",
    assignedClasses: normalizedAssignedClasses,
  });
  return res.json(formatTeacher(inserted));
});

router.delete("/teachers/:teacherId", requireAuth(["admin"]), async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await Teacher.findOne({ teacherId });
  if (!teacher) return res.status(404).json({ error: "Teacher not found" });

  await Promise.all([
    Teacher.deleteOne({ teacherId }),
    Session.deleteMany({ role: "teacher", sessionId: teacherId }),
    Homework.deleteMany({ teacherName: teacher.name }),
    Result.deleteMany({ teacherName: teacher.name }),
    Notice.deleteMany({ teacherName: teacher.name }),
    Message.deleteMany({ teacherName: teacher.name }),
    StudyMaterial.deleteMany({ teacherName: teacher.name }),
    Event.deleteMany({ teacherName: teacher.name }),
    AttendanceRecord.deleteMany({ teacherName: teacher.name }),
  ]);

  return res.json({
    success: true,
    deletedTeacherId: teacherId,
  });
});

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────

router.post("/attendance/class", requireAuth(["teacher", "admin"]), async (req, res) => {
  const { className, date, teacherName, entries } = req.body;
  const normalizedClassName = normalizeClassName(className);
  const normalizedEntries = normalizeAttendanceEntries(entries);

  if (!normalizedClassName || !date || !teacherName) {
    return res.status(400).json({ error: "className, date, and teacherName are required" });
  }

  const existing = await AttendanceRecord.findOne({ className: normalizedClassName, date });
  if (existing) {
    const updated = await AttendanceRecord.findOneAndUpdate(
      { className: normalizedClassName, date },
      { teacherName, entries: normalizedEntries },
      { new: true }
    );
    const r = updated!;
    return res.json({ className: r.className, date: r.date, teacherName: r.teacherName, updatedAt: r.updatedAt.toISOString(), entries: r.entries });
  }

  const inserted = await AttendanceRecord.create({ className: normalizedClassName, date, teacherName, entries: normalizedEntries });
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
  const { id, className, section, subject, title, description, dueDate, fileName, fileData, fileMimeType, teacherName, createdAt } = req.body;
  const homeworkId = String(id || randomUUID());
  const normalizedClassName = String(className || "").trim();
  const normalizedSection = String(section || "").trim() || (normalizedClassName.split("-")[1] ?? "");

  if (!normalizedClassName || !subject || !title || !dueDate || !teacherName) {
    return res.status(400).json({ error: "className, subject, title, dueDate, and teacherName are required" });
  }

  const existing = await Homework.findOne({ hwId: homeworkId });
  if (existing) {
    const updated = await Homework.findOneAndUpdate(
      { hwId: homeworkId },
      {
        className: normalizedClassName,
        section: normalizedSection,
        subject,
        title,
        description,
        dueDate,
        fileName,
        fileData: fileData ?? "",
        fileMimeType: fileMimeType ?? "",
        teacherName,
        createdAt: createdAt ?? new Date().toISOString(),
      },
      { new: true }
    );
    const h = updated!;
    return res.json({ id: h.hwId, className: h.className, section: h.section, subject: h.subject, title: h.title, description: h.description, dueDate: h.dueDate, fileName: h.fileName, fileData: h.fileData ?? "", fileMimeType: h.fileMimeType ?? "", teacherName: h.teacherName, createdAt: h.createdAt });
  }

  const inserted = await Homework.create({
    hwId: homeworkId,
    className: normalizedClassName,
    section: normalizedSection,
    subject,
    title,
    description,
    dueDate,
    fileName,
    fileData: fileData ?? "",
    fileMimeType: fileMimeType ?? "",
    teacherName,
    createdAt: createdAt ?? new Date().toISOString(),
  });
  return res.json({ id: inserted.hwId, className: inserted.className, section: inserted.section, subject: inserted.subject, title: inserted.title, description: inserted.description, dueDate: inserted.dueDate, fileName: inserted.fileName, fileData: inserted.fileData ?? "", fileMimeType: inserted.fileMimeType ?? "", teacherName: inserted.teacherName, createdAt: inserted.createdAt });
});

router.get("/homework/latest/:className", async (req, res) => {
  const className = decodeURIComponent(req.params.className);
  const h = await Homework.findOne({ className }).sort({ createdTs: -1 });
  if (!h) return res.status(404).json({ error: "No homework found" });
  return res.json({ id: h.hwId, className: h.className, section: h.section, subject: h.subject, title: h.title, description: h.description, dueDate: h.dueDate, fileName: h.fileName, fileData: h.fileData ?? "", fileMimeType: h.fileMimeType ?? "", teacherName: h.teacherName, createdAt: h.createdAt });
});

// ─── RESULTS ─────────────────────────────────────────────────────────────────

router.post("/results", requireAuth(["teacher", "admin"]), async (req, res) => {
  const { id, className, section, subject, examType, unitTestNumber, title, fileName, fileData, fileMimeType, targetRollNo, teacherName, createdAt } = req.body;
  const resultId = String(id || randomUUID());
  const normalizedClassName = normalizeClassName(className);
  const normalizedSection = normalizeSection(normalizedClassName, section);

  if (!normalizedClassName || !subject || !examType || !title || !teacherName) {
    return res.status(400).json({ error: "className, subject, examType, title, and teacherName are required" });
  }

  const existing = await Result.findOne({ resultId });
  if (existing) {
    const updated = await Result.findOneAndUpdate(
      { resultId },
      { className: normalizedClassName, section: normalizedSection, subject, examType, unitTestNumber: unitTestNumber ?? null, title, fileName: fileName ?? "", fileData: fileData ?? "", fileMimeType: fileMimeType ?? "", targetRollNo: targetRollNo ?? null, teacherName, createdAt: createdAt ?? new Date().toISOString() },
      { new: true }
    );
    const r = updated!;
    return res.json({ id: r.resultId, className: r.className, section: r.section, subject: r.subject, examType: r.examType, unitTestNumber: r.unitTestNumber, title: r.title, fileName: r.fileName, fileData: r.fileData ?? "", fileMimeType: r.fileMimeType ?? "", targetRollNo: r.targetRollNo, teacherName: r.teacherName, createdAt: r.createdAt });
  }

  const inserted = await Result.create({ resultId, className: normalizedClassName, section: normalizedSection, subject, examType, unitTestNumber: unitTestNumber ?? null, title, fileName: fileName ?? "", fileData: fileData ?? "", fileMimeType: fileMimeType ?? "", targetRollNo: targetRollNo ?? null, teacherName, createdAt: createdAt ?? new Date().toISOString() });
  return res.json({ id: inserted.resultId, className: inserted.className, section: inserted.section, subject: inserted.subject, examType: inserted.examType, unitTestNumber: inserted.unitTestNumber, title: inserted.title, fileName: inserted.fileName, fileData: inserted.fileData ?? "", fileMimeType: inserted.fileMimeType ?? "", targetRollNo: inserted.targetRollNo, teacherName: inserted.teacherName, createdAt: inserted.createdAt });
});

router.get("/results/latest", async (req, res) => {
  const { className, rollNo } = req.query as { className: string; rollNo?: string };
  const filter: Record<string, unknown> = { className };
  if (rollNo) filter.targetRollNo = rollNo;
  const r = await Result.findOne(filter).sort({ createdTs: -1 });
  if (!r) return res.status(404).json({ error: "No results found" });
  return res.json({ id: r.resultId, className: r.className, section: r.section, subject: r.subject, examType: r.examType, unitTestNumber: r.unitTestNumber, title: r.title, fileName: r.fileName, fileData: r.fileData ?? "", fileMimeType: r.fileMimeType ?? "", targetRollNo: r.targetRollNo, teacherName: r.teacherName, createdAt: r.createdAt });
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
  const noticeId = String(id || randomUUID());
  const normalizedAudience = normalizeAudience(audience);
  const normalizedClassName = isSchoolWideAudience(audience) ? "" : normalizeClassName(className);

  if (!title || !teacherName) {
    return res.status(400).json({ error: "title and teacherName are required" });
  }

  const existing = await Notice.findOne({ noticeId });
  if (existing) {
    const updated = await Notice.findOneAndUpdate(
      { noticeId },
      { title, description, audience: normalizedAudience, className: normalizedClassName, teacherName, createdAt: createdAt ?? new Date().toISOString() },
      { new: true }
    );
    const n = updated!;
    return res.json({ id: n.noticeId, title: n.title, description: n.description, audience: n.audience, className: n.className, teacherName: n.teacherName, createdAt: n.createdAt });
  }

  const inserted = await Notice.create({ noticeId, title, description, audience: normalizedAudience, className: normalizedClassName, teacherName, createdAt: createdAt ?? new Date().toISOString() });
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
  const messageId = String(id || randomUUID());
  const normalizedAudience = normalizeAudience(audience);
  const normalizedClassName = isSchoolWideAudience(audience) ? "" : normalizeClassName(className);

  if (!subject || !body || !teacherName) {
    return res.status(400).json({ error: "subject, body, and teacherName are required" });
  }

  const existing = await Message.findOne({ messageId });
  if (existing) {
    return res.json({ id: messageId, subject, body, audience: normalizedAudience, className: normalizedClassName, studentId, studentName, teacherName, sentAt: sentAt ?? new Date().toISOString() });
  }

  const inserted = await Message.create({ messageId, subject, body, audience: normalizedAudience === "all" ? "all" : normalizedAudience || "class", className: normalizedClassName, studentId: studentId ?? null, studentName: studentName ?? null, teacherName, sentAt: sentAt ?? new Date().toISOString() });
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
  return res.json(rows.map((m) => ({ id: m.materialId, title: m.title, className: m.className, fileName: m.fileName, fileData: m.fileData ?? "", fileMimeType: m.fileMimeType ?? "", videoUrl: m.videoUrl, resourceType: m.resourceType, teacherName: m.teacherName, updatedAt: m.updatedAt })));
});

router.post("/materials", requireAuth(["teacher", "admin"]), async (req, res) => {
  const { id, title, className, fileName, fileData, fileMimeType, videoUrl, resourceType, teacherName, updatedAt } = req.body;
  const materialId = String(id || randomUUID());
  const normalizedClassName = normalizeClassName(className);

  if (!title || !normalizedClassName || !resourceType) {
    return res.status(400).json({ error: "title, className, and resourceType are required" });
  }

  const existing = await StudyMaterial.findOne({ materialId });
  if (existing) {
    const updated = await StudyMaterial.findOneAndUpdate(
      { materialId },
      { title, className: normalizedClassName, fileName, fileData: fileData ?? "", fileMimeType: fileMimeType ?? "", videoUrl, resourceType, teacherName: teacherName ?? "", updatedAt: updatedAt ?? new Date().toISOString() },
      { new: true }
    );
    const m = updated!;
    return res.json({ id: m.materialId, title: m.title, className: m.className, fileName: m.fileName, fileData: m.fileData ?? "", fileMimeType: m.fileMimeType ?? "", videoUrl: m.videoUrl, resourceType: m.resourceType, teacherName: m.teacherName, updatedAt: m.updatedAt });
  }

  const inserted = await StudyMaterial.create({ materialId, title, className: normalizedClassName, fileName: fileName ?? "", fileData: fileData ?? "", fileMimeType: fileMimeType ?? "", videoUrl: videoUrl ?? "", resourceType, teacherName: teacherName ?? "", updatedAt: updatedAt ?? new Date().toISOString() });
  return res.json({ id: inserted.materialId, title: inserted.title, className: inserted.className, fileName: inserted.fileName, fileData: inserted.fileData ?? "", fileMimeType: inserted.fileMimeType ?? "", videoUrl: inserted.videoUrl, resourceType: inserted.resourceType, teacherName: inserted.teacherName, updatedAt: inserted.updatedAt });
});

// ─── TIMETABLE ───────────────────────────────────────────────────────────────

router.get("/timetable", async (req, res) => {
  const { className } = req.query as { className?: string };
  const rows = className
    ? await TimetableRow.find({ className })
    : await TimetableRow.find();
  return res.json(rows.map((t) => ({ id: t.rowId, className: t.className, period: t.period, subject: t.subject, time: t.time, updatedAt: t.updatedAt })));
});

router.post("/timetable", requireAuth(["admin", "teacher"]), async (req, res) => {
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
  const eventId = String(id || randomUUID());
  const normalizedClassName = normalizeClassName(className);

  if (!title || !eventDate || !teacherName) {
    return res.status(400).json({ error: "title, eventDate, and teacherName are required" });
  }

  const existing = await Event.findOne({ eventId });
  if (existing) {
    const updated = await Event.findOneAndUpdate(
      { eventId },
      { className: normalizedClassName, title, description, eventDate, teacherName, createdAt: createdAt ?? new Date().toISOString() },
      { new: true }
    );
    const e = updated!;
    return res.json({ id: e.eventId, className: e.className, title: e.title, description: e.description, eventDate: e.eventDate, teacherName: e.teacherName, createdAt: e.createdAt });
  }

  const inserted = await Event.create({ eventId, className: normalizedClassName, title, description: description ?? "", eventDate, teacherName, createdAt: createdAt ?? new Date().toISOString() });
  return res.json({ id: inserted.eventId, className: inserted.className, title: inserted.title, description: inserted.description, eventDate: inserted.eventDate, teacherName: inserted.teacherName, createdAt: inserted.createdAt });
});


// ─── ADMISSIONS ──────────────────────────────────────────────────────────────

router.post("/admissions", async (req, res) => {
  const { studentName, parentName, phone, email, classApplied, message } = req.body;
  if (!studentName || !phone) {
    return res.status(400).json({ error: "studentName and phone required" });
  }
  const doc = await Admission.create({
    studentName,
    parentName: parentName ?? "",
    phone,
    email: email ?? "",
    classApplied: classApplied ?? "",
    message: message ?? "",
    status: "pending",
  });
  sendEnquiryEmail({ type: "admission", studentName, parentName, phone, email, classApplied, message }).catch((err) => {
    console.error("[SMTP] Failed to send admission enquiry email:", err?.message ?? err);
  });
  return res.status(201).json({
    id: doc._id,
    studentName: doc.studentName,
    parentName: doc.parentName,
    phone: doc.phone,
    email: doc.email,
    classApplied: doc.classApplied,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
  });
});

router.get("/admissions", requireAuth(["admin"]), async (_req, res) => {
  const rows = await Admission.find().sort({ createdAt: -1 });
  return res.json(rows.map((a) => ({
    id: a._id,
    studentName: a.studentName,
    parentName: a.parentName,
    phone: a.phone,
    email: a.email,
    classApplied: a.classApplied,
    message: a.message,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
  })));
});

router.patch("/admissions/:id", requireAuth(["admin"]), async (req, res) => {
  const { status } = req.body;
  const doc = await Admission.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!doc) return res.status(404).json({ error: "Not found" });
  return res.json({ id: doc._id, status: doc.status });
});

// ─── CONTACTS ────────────────────────────────────────────────────────────────

router.post("/contacts", async (req, res) => {
  const { fullName, phone, email, subject, message } = req.body;
  if (!fullName || !message) {
    return res.status(400).json({ error: "fullName and message required" });
  }
  const doc = await Contact.create({ fullName, phone: phone ?? "", email: email ?? "", subject: subject ?? "", message });
  sendEnquiryEmail({ type: "contact", fullName, phone, email, subject, message }).catch((err) => {
    console.error("[SMTP] Failed to send contact email:", err?.message ?? err);
  });
  return res.status(201).json({
    id: doc._id,
    fullName: doc.fullName,
    phone: doc.phone,
    email: doc.email,
    subject: doc.subject,
    message: doc.message,
    createdAt: doc.createdAt.toISOString(),
  });
});

router.get("/contacts", requireAuth(["admin"]), async (_req, res) => {
  const rows = await Contact.find().sort({ createdAt: -1 });
  return res.json(rows.map((c) => ({
    id: c._id,
    fullName: c.fullName,
    phone: c.phone,
    email: c.email,
    subject: c.subject,
    message: c.message,
    createdAt: c.createdAt.toISOString(),
  })));
});

// ─── ANNOUNCEMENTS ───────────────────────────────────────────────────────────

router.get("/announcements", async (_req, res) => {
  const rows = await Announcement.find({ isActive: true }).sort({ sortOrder: 1 });
  return res.json(rows.map((a) => ({ id: a._id, text: a.text, isActive: a.isActive, sortOrder: a.sortOrder })));
});

// ─── GALLERY IMAGES ───────────────────────────────────────────────────────────

router.get("/gallery-images", async (req, res) => {
  const { category, section } = req.query as { category?: string; section?: string };
  let filter: Record<string, unknown> = {};
  if (category) {
    filter.category = category;
  } else if (section) {
    if (section === "gallery") {
      filter.category = { $in: ["gallery-campus", "gallery-events", "gallery-sports", "gallery-cultural"] };
    } else {
      filter.category = section;
    }
  }
  const rows = await GalleryImage.find(filter).sort({ sortOrder: 1, createdAt: -1 });
  return res.json(rows.map((g) => ({
    _id: g._id,
    title: g.title,
    alt: g.alt,
    category: g.category,
    imageData: g.imageData,
    mimeType: g.mimeType,
    sortOrder: g.sortOrder,
    createdAt: (g.createdAt as Date).toISOString(),
  })));
});

router.post("/gallery-images", requireAuth(["admin"]), async (req, res) => {
  const { title, alt, category, imageData, mimeType, sortOrder } = req.body;
  if (!category || !imageData) {
    return res.status(400).json({ error: "category and imageData required" });
  }
  const inserted = await GalleryImage.create({
    title: title ?? "",
    alt: alt ?? title ?? "",
    category,
    imageData,
    mimeType: mimeType ?? "image/jpeg",
    sortOrder: sortOrder ?? 0,
  });
  return res.json({
    _id: inserted._id,
    title: inserted.title,
    alt: inserted.alt,
    category: inserted.category,
    imageData: inserted.imageData,
    mimeType: inserted.mimeType,
    sortOrder: inserted.sortOrder,
    createdAt: (inserted.createdAt as Date).toISOString(),
  });
});

router.delete("/gallery-images/:id", requireAuth(["admin"]), async (req, res) => {
  const { id } = req.params;
  await GalleryImage.findByIdAndDelete(id);
  return res.json({ success: true });
});

export default router;
