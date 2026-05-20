import {
  pgTable,
  serial,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const studentsTable = pgTable("students", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  className: text("class_name").notNull(),
  section: text("section").notNull(),
  rollNo: text("roll_no").notNull(),
  photo: text("photo").notNull().default(""),
  passwordHash: text("password_hash").notNull().default(""),
  parents: jsonb("parents").notNull().default([]),
  fees: jsonb("fees").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const teachersTable = pgTable("teachers", {
  id: serial("id").primaryKey(),
  teacherId: text("teacher_id").notNull().unique(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  qualification: text("qualification").notNull(),
  joinDate: text("join_date").notNull(),
  phone: text("phone").notNull(),
  passwordHash: text("password_hash").notNull().default(""),
  assignedClasses: jsonb("assigned_classes").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const adminUsersTable = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const attendanceRecordsTable = pgTable("attendance_records", {
  id: serial("id").primaryKey(),
  className: text("class_name").notNull(),
  date: text("date").notNull(),
  teacherName: text("teacher_name").notNull(),
  entries: jsonb("entries").notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const homeworkTable = pgTable("homework", {
  id: serial("id").primaryKey(),
  hwId: text("hw_id").notNull().unique(),
  className: text("class_name").notNull(),
  section: text("section").notNull(),
  subject: text("subject").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  dueDate: text("due_date").notNull(),
  fileName: text("file_name").notNull().default(""),
  teacherName: text("teacher_name").notNull(),
  createdAt: text("created_at").notNull(),
  createdTs: timestamp("created_ts").notNull().defaultNow(),
});

export const resultsTable = pgTable("results", {
  id: serial("id").primaryKey(),
  resultId: text("result_id").notNull().unique(),
  className: text("class_name").notNull(),
  section: text("section").notNull(),
  subject: text("subject").notNull(),
  examType: text("exam_type").notNull(),
  unitTestNumber: integer("unit_test_number"),
  title: text("title").notNull(),
  fileName: text("file_name").notNull().default(""),
  targetRollNo: text("target_roll_no"),
  teacherName: text("teacher_name").notNull(),
  createdAt: text("created_at").notNull(),
  createdTs: timestamp("created_ts").notNull().defaultNow(),
});

export const noticesTable = pgTable("notices", {
  id: serial("id").primaryKey(),
  noticeId: text("notice_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  audience: text("audience").notNull(),
  className: text("class_name").notNull().default(""),
  teacherName: text("teacher_name").notNull(),
  createdAt: text("created_at").notNull(),
  createdTs: timestamp("created_ts").notNull().defaultNow(),
});

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  messageId: text("message_id").notNull().unique(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  audience: text("audience").notNull(),
  className: text("class_name").notNull().default(""),
  studentId: text("student_id"),
  studentName: text("student_name"),
  teacherName: text("teacher_name").notNull(),
  sentAt: text("sent_at").notNull(),
  sentTs: timestamp("sent_ts").notNull().defaultNow(),
});

export const studyMaterialsTable = pgTable("study_materials", {
  id: serial("id").primaryKey(),
  materialId: text("material_id").notNull().unique(),
  title: text("title").notNull(),
  className: text("class_name").notNull(),
  fileName: text("file_name").notNull().default(""),
  videoUrl: text("video_url").notNull().default(""),
  resourceType: text("resource_type").notNull(),
  updatedAt: text("updated_at").notNull(),
  updatedTs: timestamp("updated_ts").notNull().defaultNow(),
});

export const timetableTable = pgTable("timetable", {
  id: serial("id").primaryKey(),
  rowId: text("row_id").notNull().unique(),
  className: text("class_name").notNull(),
  period: text("period").notNull(),
  subject: text("subject").notNull(),
  time: text("time").notNull(),
  updatedAt: text("updated_at").notNull(),
  updatedTs: timestamp("updated_ts").notNull().defaultNow(),
});

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  eventId: text("event_id").notNull().unique(),
  className: text("class_name").notNull().default(""),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  eventDate: text("event_date").notNull(),
  teacherName: text("teacher_name").notNull(),
  createdAt: text("created_at").notNull(),
  createdTs: timestamp("created_ts").notNull().defaultNow(),
});

export const admissionsTable = pgTable("admissions", {
  id: serial("id").primaryKey(),
  studentName: text("student_name").notNull(),
  parentName: text("parent_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  classApplied: text("class_applied").notNull(),
  message: text("message").notNull().default(""),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contactsTable = pgTable("contacts", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const announcementsTable = pgTable("announcements", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Student = typeof studentsTable.$inferSelect;
export type Teacher = typeof teachersTable.$inferSelect;
export type AdminUser = typeof adminUsersTable.$inferSelect;
export type AttendanceRecord = typeof attendanceRecordsTable.$inferSelect;
export type Homework = typeof homeworkTable.$inferSelect;
export type Result = typeof resultsTable.$inferSelect;
export type Notice = typeof noticesTable.$inferSelect;
export type Message = typeof messagesTable.$inferSelect;
export type StudyMaterial = typeof studyMaterialsTable.$inferSelect;
export type TimetableRow = typeof timetableTable.$inferSelect;
export type Event = typeof eventsTable.$inferSelect;
export type Admission = typeof admissionsTable.$inferSelect;
export type Contact = typeof contactsTable.$inferSelect;
export type Announcement = typeof announcementsTable.$inferSelect;
