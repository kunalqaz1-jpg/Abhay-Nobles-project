import { pgTable, text, integer, jsonb, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";

export const studentsTable = pgTable("students", {
  studentId: text("student_id").primaryKey(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  className: text("class_name").notNull(),
  section: text("section").notNull(),
  rollNo: text("roll_no").notNull(),
  photo: text("photo").default("./demo-student-profile.png"),
  parents: jsonb("parents").$type<{ relation: string; name: string; phone: string }[]>().default([]),
  fees: jsonb("fees").$type<{
    currentTermStatus: string;
    currentTermNote: string;
    nextDueAmount: string;
    nextDueLabel: string;
    history: { period: string; amount: string; status: string }[];
  }>().default({ currentTermStatus: "Pending", currentTermNote: "", nextDueAmount: "0", nextDueLabel: "", history: [] }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [index("students_class_idx").on(t.className)]);

export const teachersTable = pgTable("teachers", {
  teacherId: text("teacher_id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  qualification: text("qualification").default(""),
  joinDate: text("join_date").default(""),
  phone: text("phone").default(""),
  assignedClasses: jsonb("assigned_classes").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const classAttendanceTable = pgTable("class_attendance", {
  id: text("id").primaryKey(),
  className: text("class_name").notNull(),
  date: text("date").notNull(),
  teacherName: text("teacher_name").notNull(),
  updatedAt: text("updated_at").notNull(),
  entries: jsonb("entries").$type<{ studentId: string; studentName: string; status: "present" | "absent"; remark: string }[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  uniqueIndex("attendance_class_date_idx").on(t.className, t.date),
  index("attendance_class_idx").on(t.className),
]);

export const homeworkTable = pgTable("homework", {
  id: text("id").primaryKey(),
  className: text("class_name").notNull(),
  section: text("section").notNull(),
  subject: text("subject").notNull(),
  title: text("title").notNull(),
  description: text("description").default(""),
  dueDate: text("due_date").notNull(),
  fileName: text("file_name").default(""),
  teacherName: text("teacher_name").notNull(),
  createdAt: text("created_at").notNull(),
  dbCreatedAt: timestamp("db_created_at").defaultNow(),
}, (t) => [index("homework_class_idx").on(t.className)]);

export const resultsTable = pgTable("results", {
  id: text("id").primaryKey(),
  className: text("class_name").notNull(),
  section: text("section").notNull(),
  subject: text("subject").notNull(),
  examType: text("exam_type").notNull(),
  unitTestNumber: integer("unit_test_number"),
  title: text("title").notNull(),
  fileName: text("file_name").default(""),
  targetRollNo: text("target_roll_no"),
  teacherName: text("teacher_name").notNull(),
  createdAt: text("created_at").notNull(),
  dbCreatedAt: timestamp("db_created_at").defaultNow(),
}, (t) => [
  index("results_class_idx").on(t.className),
  index("results_roll_idx").on(t.targetRollNo),
]);

export const noticesTable = pgTable("notices", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  audience: text("audience").default("All Classes"),
  className: text("class_name").default(""),
  teacherName: text("teacher_name").default(""),
  createdAt: text("created_at").notNull(),
  dbCreatedAt: timestamp("db_created_at").defaultNow(),
});

export const messagesTable = pgTable("messages", {
  id: text("id").primaryKey(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  audience: text("audience").notNull(),
  className: text("class_name").default("All Classes"),
  studentId: text("student_id").default(""),
  studentName: text("student_name").default(""),
  teacherName: text("teacher_name").default(""),
  sentAt: text("sent_at").notNull(),
  dbCreatedAt: timestamp("db_created_at").defaultNow(),
}, (t) => [index("messages_class_idx").on(t.className)]);

export const studyMaterialsTable = pgTable("study_materials", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  className: text("class_name").notNull(),
  fileName: text("file_name").default(""),
  videoUrl: text("video_url").default(""),
  resourceType: text("resource_type").default("File"),
  updatedAt: text("updated_at").notNull(),
  dbCreatedAt: timestamp("db_created_at").defaultNow(),
}, (t) => [index("materials_class_idx").on(t.className)]);

export const timetableTable = pgTable("timetable", {
  id: text("id").primaryKey(),
  className: text("class_name").notNull(),
  period: text("period").notNull(),
  subject: text("subject").notNull(),
  time: text("time").notNull(),
  updatedAt: text("updated_at").notNull(),
  dbCreatedAt: timestamp("db_created_at").defaultNow(),
}, (t) => [index("timetable_class_idx").on(t.className)]);

export const eventsTable = pgTable("events", {
  id: text("id").primaryKey(),
  className: text("class_name").default("All Classes"),
  title: text("title").notNull(),
  description: text("description").default(""),
  eventDate: text("event_date").notNull(),
  teacherName: text("teacher_name").default(""),
  createdAt: text("created_at").notNull(),
  dbCreatedAt: timestamp("db_created_at").defaultNow(),
}, (t) => [index("events_class_idx").on(t.className)]);

export type Student = typeof studentsTable.$inferSelect;
export type Teacher = typeof teachersTable.$inferSelect;
export type ClassAttendanceRecord = typeof classAttendanceTable.$inferSelect;
export type Homework = typeof homeworkTable.$inferSelect;
export type Result = typeof resultsTable.$inferSelect;
export type Notice = typeof noticesTable.$inferSelect;
export type Message = typeof messagesTable.$inferSelect;
export type StudyMaterial = typeof studyMaterialsTable.$inferSelect;
export type TimetableRow = typeof timetableTable.$inferSelect;
export type Event = typeof eventsTable.$inferSelect;
