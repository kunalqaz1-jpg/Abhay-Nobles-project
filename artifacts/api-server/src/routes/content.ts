import { Router } from "express";
import { eq, or, desc, asc } from "drizzle-orm";
import {
  db,
  homeworkTable,
  resultsTable,
  noticesTable,
  messagesTable,
  studyMaterialsTable,
  timetableTable,
  eventsTable,
} from "@workspace/db";

const router = Router();

router.post("/homework", async (req, res) => {
  try {
    const p = req.body;
    if (!p?.id || !p?.className || !p?.title) return res.status(400).json({ message: "Invalid homework payload." });
    const payload = { id: p.id, className: p.className, section: p.section || "", subject: p.subject || "", title: p.title, description: p.description || "", dueDate: p.dueDate || "", fileName: p.fileName || "", teacherName: p.teacherName || "", createdAt: p.createdAt || new Date().toISOString() };
    const saved = await db.insert(homeworkTable).values(payload).onConflictDoUpdate({ target: homeworkTable.id, set: payload }).returning();
    return res.json(saved[0]);
  } catch (err: unknown) {
    return res.status(500).json({ message: "Failed to save homework.", error: (err as Error).message });
  }
});

router.get("/homework/latest/:className", async (req, res) => {
  try {
    const record = await db.select().from(homeworkTable).where(eq(homeworkTable.className, req.params.className)).orderBy(desc(homeworkTable.createdAt)).limit(1);
    return res.json(record[0] || null);
  } catch (err: unknown) {
    return res.status(500).json({ message: "Failed to fetch homework.", error: (err as Error).message });
  }
});

router.post("/results", async (req, res) => {
  try {
    const p = req.body;
    if (!p?.id || !p?.className || !p?.title) return res.status(400).json({ message: "Invalid result payload." });
    const payload = { id: p.id, className: p.className, section: p.section || "", subject: p.subject || "", examType: p.examType || "yearly", unitTestNumber: p.unitTestNumber || null, title: p.title, fileName: p.fileName || "", targetRollNo: p.targetRollNo || null, teacherName: p.teacherName || "", createdAt: p.createdAt || new Date().toISOString() };
    const saved = await db.insert(resultsTable).values(payload).onConflictDoUpdate({ target: resultsTable.id, set: payload }).returning();
    return res.json(saved[0]);
  } catch (err: unknown) {
    return res.status(500).json({ message: "Failed to save result.", error: (err as Error).message });
  }
});

router.get("/results/latest", async (req, res) => {
  try {
    const { className, rollNo } = req.query;
    if (!className) return res.status(400).json({ message: "className is required." });
    const record = await db.select().from(resultsTable).where(eq(resultsTable.className, String(className))).orderBy(desc(resultsTable.createdAt)).limit(10);
    const found = record.find((r) => !r.targetRollNo || r.targetRollNo === rollNo) || null;
    return res.json(found);
  } catch (err: unknown) {
    return res.status(500).json({ message: "Failed to fetch result.", error: (err as Error).message });
  }
});

router.get("/notices", async (req, res) => {
  const notices = await db.select().from(noticesTable).orderBy(desc(noticesTable.createdAt));
  const { className } = req.query;
  if (className) {
    return res.json(notices.filter((n) => n.audience === "All Classes" || n.audience === className || n.className === className));
  }
  res.json(notices);
});

router.post("/notices", async (req, res) => {
  const p = req.body;
  if (!p?.id || !p?.title || !p?.description) return res.status(400).json({ message: "Invalid notice payload." });
  const payload = { id: p.id, title: p.title, description: p.description, audience: p.audience || "All Classes", className: p.className || "", teacherName: p.teacherName || "", createdAt: p.createdAt || new Date().toISOString() };
  const saved = await db.insert(noticesTable).values(payload).onConflictDoUpdate({ target: noticesTable.id, set: payload }).returning();
  return res.json(saved[0]);
});

router.get("/messages", async (req, res) => {
  const messages = await db.select().from(messagesTable).orderBy(desc(messagesTable.sentAt));
  const { className, studentId } = req.query;
  return res.json(messages.filter((m) => {
    if (m.audience === "all-students") return true;
    if (className && m.className === className) return true;
    if (studentId && m.studentId === studentId) return true;
    return false;
  }));
});

router.post("/messages", async (req, res) => {
  const p = req.body;
  if (!p?.id || !p?.subject || !p?.body) return res.status(400).json({ message: "Invalid message payload." });
  const payload = { id: p.id, subject: p.subject, body: p.body, audience: p.audience || "all-students", className: p.className || "All Classes", studentId: p.studentId || "", studentName: p.studentName || "", teacherName: p.teacherName || "", sentAt: p.sentAt || new Date().toISOString() };
  const saved = await db.insert(messagesTable).values(payload).onConflictDoUpdate({ target: messagesTable.id, set: payload }).returning();
  return res.json(saved[0]);
});

router.get("/materials", async (req, res) => {
  const { className } = req.query;
  const materials = className
    ? await db.select().from(studyMaterialsTable).where(eq(studyMaterialsTable.className, String(className))).orderBy(desc(studyMaterialsTable.updatedAt))
    : await db.select().from(studyMaterialsTable).orderBy(desc(studyMaterialsTable.updatedAt));
  res.json(materials);
});

router.post("/materials", async (req, res) => {
  const p = req.body;
  if (!p?.id || !p?.title || !p?.className) return res.status(400).json({ message: "Invalid study material payload." });
  const payload = { id: p.id, title: p.title, className: p.className, fileName: p.fileName || "", videoUrl: p.videoUrl || "", resourceType: p.resourceType || "File", updatedAt: p.updatedAt || new Date().toISOString() };
  const saved = await db.insert(studyMaterialsTable).values(payload).onConflictDoUpdate({ target: studyMaterialsTable.id, set: payload }).returning();
  return res.json(saved[0]);
});

router.get("/timetable", async (req, res) => {
  const { className } = req.query;
  const rows = className
    ? await db.select().from(timetableTable).where(eq(timetableTable.className, String(className))).orderBy(asc(timetableTable.period))
    : await db.select().from(timetableTable).orderBy(asc(timetableTable.period));
  res.json(rows);
});

router.post("/timetable", async (req, res) => {
  const p = req.body;
  if (!p?.id || !p?.className || !p?.period || !p?.time || !p?.subject) return res.status(400).json({ message: "Invalid timetable payload." });
  const payload = { id: p.id, className: p.className, period: p.period, subject: p.subject, time: p.time, updatedAt: p.updatedAt || new Date().toISOString() };
  const saved = await db.insert(timetableTable).values(payload).onConflictDoUpdate({ target: timetableTable.id, set: payload }).returning();
  return res.json(saved[0]);
});

router.get("/events", async (req, res) => {
  const events = await db.select().from(eventsTable).orderBy(asc(eventsTable.eventDate));
  const { className } = req.query;
  if (className) {
    return res.json(events.filter((e) => e.className === "All Classes" || e.className === className));
  }
  res.json(events);
});

router.post("/events", async (req, res) => {
  const p = req.body;
  if (!p?.id || !p?.title || !p?.eventDate) return res.status(400).json({ message: "Invalid event payload." });
  const payload = { id: p.id, className: p.className || "All Classes", title: p.title, description: p.description || "", eventDate: p.eventDate, teacherName: p.teacherName || "", createdAt: p.createdAt || new Date().toISOString() };
  const saved = await db.insert(eventsTable).values(payload).onConflictDoUpdate({ target: eventsTable.id, set: payload }).returning();
  return res.json(saved[0]);
});

export default router;
