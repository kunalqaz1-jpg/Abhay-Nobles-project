import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, classAttendanceTable, studentsTable } from "@workspace/db";
import { randomUUID } from "node:crypto";

const router = Router();

router.post("/attendance/class", async (req, res) => {
  try {
    const record = req.body;
    if (!record?.className || !record?.date || !Array.isArray(record?.entries)) {
      return res.status(400).json({ message: "Invalid attendance payload." });
    }
    const id = `${record.className}__${record.date}`;
    const payload = {
      id,
      className: record.className,
      date: record.date,
      teacherName: record.teacherName || "",
      updatedAt: record.updatedAt || new Date().toISOString(),
      entries: record.entries,
    };
    const saved = await db
      .insert(classAttendanceTable)
      .values(payload)
      .onConflictDoUpdate({ target: classAttendanceTable.id, set: { entries: payload.entries, teacherName: payload.teacherName, updatedAt: payload.updatedAt } })
      .returning();
    return res.json(saved[0]);
  } catch (err: unknown) {
    return res.status(500).json({ message: "Failed to save attendance.", error: (err as Error).message });
  }
});

router.get("/attendance/class", async (req, res) => {
  try {
    const { className, date } = req.query;
    if (!className || !date) return res.status(400).json({ message: "className and date are required." });
    const record = await db
      .select()
      .from(classAttendanceTable)
      .where(and(eq(classAttendanceTable.className, String(className)), eq(classAttendanceTable.date, String(date))))
      .limit(1);
    return res.json(record[0] || null);
  } catch (err: unknown) {
    return res.status(500).json({ message: "Failed to fetch attendance.", error: (err as Error).message });
  }
});

router.get("/attendance/student/:studentId/latest", async (req, res) => {
  try {
    const student = await db.select().from(studentsTable).where(eq(studentsTable.studentId, req.params.studentId)).limit(1);
    if (!student[0]) return res.status(404).json({ message: "Student not found." });
    const records = await db
      .select()
      .from(classAttendanceTable)
      .where(eq(classAttendanceTable.className, student[0].className))
      .orderBy(desc(classAttendanceTable.date))
      .limit(30);
    const filtered = records.filter((r) =>
      (r.entries as { studentId: string }[]).some((e) => e.studentId === req.params.studentId)
    );
    if (!filtered[0]) return res.json(null);
    const entry = (filtered[0].entries as { studentId: string }[]).find((e) => e.studentId === req.params.studentId) || null;
    return res.json(entry ? { record: filtered[0], entry } : null);
  } catch (err: unknown) {
    return res.status(500).json({ message: "Failed to fetch student attendance.", error: (err as Error).message });
  }
});

export default router;
