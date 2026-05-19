const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing. Add it to backend/.env");
}

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const feeHistorySchema = new mongoose.Schema(
  {
    period: { type: String, required: true },
    amount: { type: String, required: true },
    status: { type: String, required: true },
  },
  { _id: false },
);

const parentSchema = new mongoose.Schema(
  {
    relation: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false },
);

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    className: { type: String, required: true, index: true },
    section: { type: String, required: true },
    rollNo: { type: String, required: true, index: true },
    photo: { type: String, default: "./demo-student-profile.png" },
    parents: { type: [parentSchema], default: [] },
    fees: {
      currentTermStatus: { type: String, default: "Pending" },
      currentTermNote: { type: String, default: "" },
      nextDueAmount: { type: String, default: "0" },
      nextDueLabel: { type: String, default: "" },
      history: { type: [feeHistorySchema], default: [] },
    },
  },
  { timestamps: true },
);

const teacherSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    subject: { type: String, required: true },
    qualification: { type: String, default: "" },
    joinDate: { type: String, default: "" },
    phone: { type: String, default: "" },
    assignedClasses: { type: [String], default: [] },
  },
  { timestamps: true },
);

const attendanceEntrySchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    status: { type: String, enum: ["present", "absent"], required: true },
    remark: { type: String, default: "" },
  },
  { _id: false },
);

const classAttendanceSchema = new mongoose.Schema(
  {
    className: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    teacherName: { type: String, required: true },
    updatedAt: { type: String, required: true },
    entries: { type: [attendanceEntrySchema], default: [] },
  },
  { timestamps: true },
);
classAttendanceSchema.index({ className: 1, date: 1 }, { unique: true });

const homeworkSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    className: { type: String, required: true, index: true },
    section: { type: String, required: true },
    subject: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    dueDate: { type: String, required: true },
    fileName: { type: String, default: "" },
    teacherName: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  { timestamps: true },
);

const resultSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    className: { type: String, required: true, index: true },
    section: { type: String, required: true },
    subject: { type: String, required: true },
    examType: {
      type: String,
      enum: ["yearly", "half-yearly", "unit-test"],
      required: true,
    },
    unitTestNumber: { type: Number },
    title: { type: String, required: true },
    fileName: { type: String, default: "" },
    targetRollNo: { type: String, default: undefined, index: true },
    teacherName: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  { timestamps: true },
);

const noticeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    audience: { type: String, default: "All Classes" },
    className: { type: String, default: "" },
    teacherName: { type: String, default: "" },
    createdAt: { type: String, required: true },
  },
  { timestamps: true },
);

const messageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    audience: { type: String, required: true },
    className: { type: String, default: "All Classes", index: true },
    studentId: { type: String, default: "" },
    studentName: { type: String, default: "" },
    teacherName: { type: String, default: "" },
    sentAt: { type: String, required: true },
  },
  { timestamps: true },
);

const studyMaterialSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    className: { type: String, required: true, index: true },
    fileName: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    resourceType: { type: String, default: "File" },
    updatedAt: { type: String, required: true },
  },
  { timestamps: true },
);

const timetableRowSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    className: { type: String, required: true, index: true },
    period: { type: String, required: true },
    subject: { type: String, required: true },
    time: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { timestamps: true },
);

const eventSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    className: { type: String, default: "All Classes", index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    eventDate: { type: String, required: true },
    teacherName: { type: String, default: "" },
    createdAt: { type: String, required: true },
  },
  { timestamps: true },
);

const Student = mongoose.model("Student", studentSchema);
const Teacher = mongoose.model("Teacher", teacherSchema);
const ClassAttendance = mongoose.model("ClassAttendance", classAttendanceSchema);
const Homework = mongoose.model("Homework", homeworkSchema);
const Result = mongoose.model("Result", resultSchema);
const Notice = mongoose.model("Notice", noticeSchema);
const Message = mongoose.model("Message", messageSchema);
const StudyMaterial = mongoose.model("StudyMaterial", studyMaterialSchema);
const TimetableRow = mongoose.model("TimetableRow", timetableRowSchema);
const Event = mongoose.model("Event", eventSchema);

function sanitizeStudent(student) {
  const { password, ...safeStudent } = student;
  return safeStudent;
}

function buildAttendanceSummary(records, studentId) {
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
  const monthLabel = new Date(latestRecord.date).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const presentDates = [];
  const absentDates = [];

  for (const record of records) {
    const entry = record.entries.find((item) => item.studentId === studentId);
    if (!entry) continue;
    if (entry.status === "present") presentDates.push(record.date);
    else absentDates.push(record.date);
  }

  const totalDays = presentDates.length + absentDates.length;
  const percent = totalDays
    ? `${Math.round((presentDates.length / totalDays) * 100)}%`
    : "0%";

  const weeks = new Map();
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

  const attendanceByDay = new Map();
  for (const date of presentDates) attendanceByDay.set(Number(date.slice(-2)), "present");
  for (const date of absentDates) attendanceByDay.set(Number(date.slice(-2)), "absent");

  const year = Number(latestRecord.date.slice(0, 4));
  const month = Number(latestRecord.date.slice(5, 7));
  const lastDay = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const calendar = [];

  for (let day = 1; day <= lastDay; day += 1) {
    calendar.push({
      day,
      status: attendanceByDay.get(day) || "muted",
      offset: day === 1 ? firstWeekday : undefined,
    });
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

async function getStudentDashboard(studentId) {
  const student = await Student.findOne({ studentId }).lean();
  if (!student) return null;

  const attendanceRecords = await ClassAttendance.find({
    className: student.className,
    "entries.studentId": student.studentId,
  })
    .sort({ date: -1, createdAt: -1 })
    .lean();

  const latestAttendance = attendanceRecords[0] || null;
  const latestAttendanceEntry = latestAttendance
    ? latestAttendance.entries.find((entry) => entry.studentId === student.studentId) || null
    : null;

  const latestHomework =
    (await Homework.findOne({ className: student.className })
      .sort({ createdAt: -1, _id: -1 })
      .lean()) || null;

  const latestResult =
    (await Result.findOne({
      className: student.className,
      $or: [{ targetRollNo: { $exists: false } }, { targetRollNo: student.rollNo }],
    })
      .sort({ createdAt: -1, _id: -1 })
      .lean()) || null;

  const [notices, materials, timetable, events, messages] = await Promise.all([
    Notice.find({
      $or: [
        { audience: "All Classes" },
        { className: student.className },
        { audience: student.className },
      ],
    })
      .sort({ createdAt: -1, _id: -1 })
      .limit(20)
      .lean(),
    StudyMaterial.find({ className: student.className })
      .sort({ updatedAt: -1, _id: -1 })
      .limit(20)
      .lean(),
    TimetableRow.find({ className: student.className })
      .sort({ period: 1, updatedAt: -1 })
      .limit(20)
      .lean(),
    Event.find({
      $or: [{ className: "All Classes" }, { className: student.className }],
    })
      .sort({ eventDate: 1, createdAt: -1 })
      .limit(20)
      .lean(),
    Message.find({
      $or: [
        { audience: "all-students" },
        { className: student.className },
        { studentId: student.studentId },
      ],
    })
      .sort({ sentAt: -1, _id: -1 })
      .limit(20)
      .lean(),
  ]);

  return {
    student: sanitizeStudent(student),
    attendance: {
      latest:
        latestAttendance && latestAttendanceEntry
          ? {
              date: latestAttendance.date,
              status: latestAttendanceEntry.status,
              remark: latestAttendanceEntry.remark,
              teacherName: latestAttendance.teacherName,
            }
          : null,
      summary: buildAttendanceSummary(attendanceRecords, student.studentId),
    },
    homework: latestHomework,
    result: latestResult,
    notices,
    materials,
    timetable,
    events,
    messages,
  };
}

function normalizeStudentPayload(payload, existingStudent) {
  const studentId = String(payload?.studentId || existingStudent?.studentId || "").trim();
  const password = String(payload?.password || "").trim();
  const fullName = String(payload?.fullName || "").trim();
  const className = String(payload?.className || "").trim();
  const section = String(payload?.section || "").trim();
  const rollNo = String(payload?.rollNo || "").trim();

  if (!studentId || !fullName || !className || !section || !rollNo) {
    return { error: "Student ID, name, class, section, and roll number are required." };
  }
  if (!existingStudent && password.length < 4) {
    return { error: "New student password must be at least 4 characters." };
  }
  if (existingStudent && password && password.length < 4) {
    return { error: "Updated password must be at least 4 characters." };
  }

  return {
    value: {
      studentId,
      password: password || existingStudent?.password || "1234",
      fullName,
      className,
      section,
      rollNo,
      photo: String(payload?.photo || existingStudent?.photo || "./demo-student-profile.png").trim(),
      parents: Array.isArray(payload?.parents) ? payload.parents : existingStudent?.parents || [],
      fees: payload?.fees || existingStudent?.fees || {
        currentTermStatus: "Pending",
        currentTermNote: "",
        nextDueAmount: "0",
        nextDueLabel: "",
        history: [],
      },
    },
  };
}

function normalizeTeacherPayload(payload, existingTeacher) {
  const teacherId = String(payload?.teacherId || existingTeacher?.teacherId || "").trim();
  const name = String(payload?.name || "").trim();
  const subject = String(payload?.subject || "").trim();

  if (!teacherId || !name || !subject) {
    return { error: "Teacher ID, name, and subject are required." };
  }

  return {
    value: {
      teacherId,
      name,
      subject,
      qualification: String(payload?.qualification || existingTeacher?.qualification || "").trim(),
      joinDate: String(payload?.joinDate || existingTeacher?.joinDate || "").trim(),
      phone: String(payload?.phone || existingTeacher?.phone || "").trim(),
      assignedClasses: Array.isArray(payload?.assignedClasses)
        ? payload.assignedClasses.map((item) => String(item).trim()).filter(Boolean)
        : existingTeacher?.assignedClasses || [],
    },
  };
}

app.get("/", (_req, res) => {
  res.json({ message: "Shri Abhay Nobles ERP API" });
});

app.get("/api/health", async (_req, res) => {
  const [students, teachers, attendanceRecords, homeworkRecords, resultRecords, notices, messages, materials, timetableRows, events] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments(),
    ClassAttendance.countDocuments(),
    Homework.countDocuments(),
    Result.countDocuments(),
    Notice.countDocuments(),
    Message.countDocuments(),
    StudyMaterial.countDocuments(),
    TimetableRow.countDocuments(),
    Event.countDocuments(),
  ]);

  res.json({
    ok: true,
    storage: "mongodb",
    counts: { students, teachers, attendanceRecords, homeworkRecords, resultRecords, notices, messages, materials, timetableRows, events },
  });
});

app.get("/api/students", async (_req, res) => {
  const students = await Student.find().sort({ className: 1, rollNo: 1, fullName: 1 }).lean();
  res.json(students.map((student) => sanitizeStudent(student)));
});

app.get("/api/students/:studentId", async (req, res) => {
  const student = await Student.findOne({ studentId: req.params.studentId }).lean();
  if (!student) {
    return res.status(404).json({ message: "Student not found." });
  }
  return res.json(sanitizeStudent(student));
});

app.post("/api/students", async (req, res) => {
  const existingStudent = await Student.findOne({ studentId: req.body?.studentId }).lean();
  const normalized = normalizeStudentPayload(req.body, existingStudent);
  if (normalized.error) {
    return res.status(400).json({ message: normalized.error });
  }

  const saved = await Student.findOneAndUpdate(
    { studentId: normalized.value.studentId },
    normalized.value,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  return res.json(sanitizeStudent(saved));
});

app.post("/api/students/:studentId/fees", async (req, res) => {
  const student = await Student.findOne({ studentId: req.params.studentId }).lean();
  if (!student) {
    return res.status(404).json({ message: "Student not found." });
  }

  const fees = req.body?.fees;
  if (!fees) {
    return res.status(400).json({ message: "fees payload is required." });
  }

  const saved = await Student.findOneAndUpdate(
    { studentId: req.params.studentId },
    { fees },
    { new: true },
  ).lean();

  return res.json(sanitizeStudent(saved));
});

app.get("/api/teachers", async (_req, res) => {
  const teachers = await Teacher.find().sort({ name: 1 }).lean();
  res.json(teachers);
});

app.get("/api/teachers/:teacherId", async (req, res) => {
  const teacher = await Teacher.findOne({ teacherId: req.params.teacherId }).lean();
  if (!teacher) {
    return res.status(404).json({ message: "Teacher not found." });
  }
  return res.json(teacher);
});

app.post("/api/teachers", async (req, res) => {
  const existingTeacher = await Teacher.findOne({ teacherId: req.body?.teacherId }).lean();
  const normalized = normalizeTeacherPayload(req.body, existingTeacher);
  if (normalized.error) {
    return res.status(400).json({ message: normalized.error });
  }

  const saved = await Teacher.findOneAndUpdate(
    { teacherId: normalized.value.teacherId },
    normalized.value,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  return res.json(saved);
});

app.post("/api/students/login", async (req, res) => {
  try {
    const { studentId, password } = req.body || {};
    if (!studentId || !password) {
      return res.status(400).json({ message: "Student ID and password are required." });
    }

    const student = await Student.findOne({ studentId }).lean();
    if (!student || student.password !== password) {
      return res.status(401).json({ message: "Invalid student credentials." });
    }

    const dashboard = await getStudentDashboard(studentId);
    return res.json({ student: dashboard.student });
  } catch (error) {
    return res.status(500).json({ message: "Login failed.", error: error.message });
  }
});

app.get("/api/students/:studentId/dashboard", async (req, res) => {
  try {
    const dashboard = await getStudentDashboard(req.params.studentId);
    if (!dashboard) {
      return res.status(404).json({ message: "Student not found." });
    }
    return res.json(dashboard);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load dashboard.", error: error.message });
  }
});

app.post("/api/attendance/class", async (req, res) => {
  try {
    const record = req.body;
    if (!record?.className || !record?.date || !Array.isArray(record?.entries)) {
      return res.status(400).json({ message: "Invalid attendance payload." });
    }

    const saved = await ClassAttendance.findOneAndUpdate(
      { className: record.className, date: record.date },
      record,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    return res.json(saved);
  } catch (error) {
    return res.status(500).json({ message: "Failed to save attendance.", error: error.message });
  }
});

app.get("/api/attendance/class", async (req, res) => {
  try {
    const { className, date } = req.query;
    if (!className || !date) {
      return res.status(400).json({ message: "className and date are required." });
    }

    const record = await ClassAttendance.findOne({ className, date }).lean();
    return res.json(record || null);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch attendance.", error: error.message });
  }
});

app.get("/api/attendance/student/:studentId/latest", async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId }).lean();
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const record = await ClassAttendance.findOne({
      className: student.className,
      "entries.studentId": student.studentId,
    })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    if (!record) return res.json(null);

    const entry = record.entries.find((item) => item.studentId === student.studentId) || null;
    return res.json(entry ? { record, entry } : null);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch student attendance.", error: error.message });
  }
});

app.post("/api/homework", async (req, res) => {
  try {
    const payload = req.body;
    if (!payload?.id || !payload?.className || !payload?.title) {
      return res.status(400).json({ message: "Invalid homework payload." });
    }

    const saved = await Homework.findOneAndUpdate(
      { id: payload.id },
      payload,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    return res.json(saved);
  } catch (error) {
    return res.status(500).json({ message: "Failed to save homework.", error: error.message });
  }
});

app.get("/api/homework/latest/:className", async (req, res) => {
  try {
    const record = await Homework.findOne({ className: req.params.className })
      .sort({ createdAt: -1, _id: -1 })
      .lean();
    return res.json(record || null);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch homework.", error: error.message });
  }
});

app.post("/api/results", async (req, res) => {
  try {
    const payload = req.body;
    if (!payload?.id || !payload?.className || !payload?.title) {
      return res.status(400).json({ message: "Invalid result payload." });
    }

    const saved = await Result.findOneAndUpdate(
      { id: payload.id },
      payload,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    return res.json(saved);
  } catch (error) {
    return res.status(500).json({ message: "Failed to save result.", error: error.message });
  }
});

app.get("/api/results/latest", async (req, res) => {
  try {
    const { className, rollNo } = req.query;
    if (!className) {
      return res.status(400).json({ message: "className is required." });
    }

    const record = await Result.findOne({
      className,
      $or: [{ targetRollNo: { $exists: false } }, { targetRollNo: rollNo }],
    })
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    return res.json(record || null);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch result.", error: error.message });
  }
});

app.get("/api/notices", async (req, res) => {
  const { className } = req.query;
  const query = className
    ? { $or: [{ audience: "All Classes" }, { audience: className }, { className }] }
    : {};
  const notices = await Notice.find(query).sort({ createdAt: -1, _id: -1 }).lean();
  res.json(notices);
});

app.post("/api/notices", async (req, res) => {
  const payload = req.body;
  if (!payload?.id || !payload?.title || !payload?.description) {
    return res.status(400).json({ message: "Invalid notice payload." });
  }
  const saved = await Notice.findOneAndUpdate(
    { id: payload.id },
    payload,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
  return res.json(saved);
});

app.get("/api/messages", async (req, res) => {
  const { className, studentId } = req.query;
  const or = [{ audience: "all-students" }];
  if (className) or.push({ className });
  if (studentId) or.push({ studentId });
  const messages = await Message.find({ $or: or }).sort({ sentAt: -1, _id: -1 }).lean();
  res.json(messages);
});

app.post("/api/messages", async (req, res) => {
  const payload = req.body;
  if (!payload?.id || !payload?.subject || !payload?.body) {
    return res.status(400).json({ message: "Invalid message payload." });
  }
  const saved = await Message.findOneAndUpdate(
    { id: payload.id },
    payload,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
  return res.json(saved);
});

app.get("/api/materials", async (req, res) => {
  const { className } = req.query;
  const query = className ? { className } : {};
  const materials = await StudyMaterial.find(query).sort({ updatedAt: -1, _id: -1 }).lean();
  res.json(materials);
});

app.post("/api/materials", async (req, res) => {
  const payload = req.body;
  if (!payload?.id || !payload?.title || !payload?.className) {
    return res.status(400).json({ message: "Invalid study material payload." });
  }
  const saved = await StudyMaterial.findOneAndUpdate(
    { id: payload.id },
    payload,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
  return res.json(saved);
});

app.get("/api/timetable", async (req, res) => {
  const { className } = req.query;
  const query = className ? { className } : {};
  const rows = await TimetableRow.find(query).sort({ period: 1, updatedAt: -1 }).lean();
  res.json(rows);
});

app.post("/api/timetable", async (req, res) => {
  const payload = req.body;
  if (!payload?.id || !payload?.className || !payload?.period || !payload?.time || !payload?.subject) {
    return res.status(400).json({ message: "Invalid timetable payload." });
  }
  const saved = await TimetableRow.findOneAndUpdate(
    { id: payload.id },
    payload,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
  return res.json(saved);
});

app.get("/api/events", async (req, res) => {
  const { className } = req.query;
  const query = className ? { $or: [{ className: "All Classes" }, { className }] } : {};
  const events = await Event.find(query).sort({ eventDate: 1, createdAt: -1 }).lean();
  res.json(events);
});

app.post("/api/events", async (req, res) => {
  const payload = req.body;
  if (!payload?.id || !payload?.title || !payload?.eventDate) {
    return res.status(400).json({ message: "Invalid event payload." });
  }
  const saved = await Event.findOneAndUpdate(
    { id: payload.id },
    payload,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
  return res.json(saved);
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log("MongoDB connected");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  });
