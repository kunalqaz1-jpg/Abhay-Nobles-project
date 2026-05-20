import { Router } from "express";
import { eq, asc } from "drizzle-orm";
import { db, teachersTable } from "@workspace/db";

const router = Router();

router.get("/teachers", async (_req, res) => {
  const teachers = await db.select().from(teachersTable).orderBy(asc(teachersTable.name));
  res.json(teachers);
});

router.get("/teachers/:teacherId", async (req, res) => {
  const teacher = await db.select().from(teachersTable).where(eq(teachersTable.teacherId, req.params.teacherId)).limit(1);
  if (!teacher[0]) return res.status(404).json({ message: "Teacher not found." });
  return res.json(teacher[0]);
});

router.post("/teachers", async (req, res) => {
  try {
    const p = req.body;
    if (!p?.teacherId || !p?.name || !p?.subject) {
      return res.status(400).json({ message: "Teacher ID, name, and subject are required." });
    }
    const payload = {
      teacherId: String(p.teacherId).trim(),
      name: String(p.name).trim(),
      subject: String(p.subject).trim(),
      qualification: String(p.qualification || "").trim(),
      joinDate: String(p.joinDate || "").trim(),
      phone: String(p.phone || "").trim(),
      assignedClasses: Array.isArray(p.assignedClasses)
        ? p.assignedClasses.map((c: unknown) => String(c).trim()).filter(Boolean)
        : [],
      updatedAt: new Date(),
    };
    const saved = await db
      .insert(teachersTable)
      .values(payload)
      .onConflictDoUpdate({ target: teachersTable.teacherId, set: { ...payload } })
      .returning();
    return res.json(saved[0]);
  } catch (err: unknown) {
    return res.status(500).json({ message: "Failed to save teacher.", error: (err as Error).message });
  }
});

export default router;
