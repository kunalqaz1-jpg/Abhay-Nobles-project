import mongoose, { Schema, Document, Model } from "mongoose";

// ─── STUDENTS ────────────────────────────────────────────────────────────────

export interface IStudent extends Document {
  studentId: string;
  fullName: string;
  className: string;
  section: string;
  rollNo: string;
  photo: string;
  passwordHash: string;
  parents: object[];
  fees: object;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>({
  studentId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  className: { type: String, required: true },
  section: { type: String, required: true },
  rollNo: { type: String, required: true },
  photo: { type: String, default: "" },
  passwordHash: { type: String, default: "" },
  parents: { type: [Schema.Types.Mixed], default: [] },
  fees: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export const Student: Model<IStudent> = mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

// ─── TEACHERS ────────────────────────────────────────────────────────────────

export interface ITeacher extends Document {
  teacherId: string;
  name: string;
  subject: string;
  qualification: string;
  joinDate: string;
  phone: string;
  passwordHash: string;
  assignedClasses: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>({
  teacherId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subject: { type: String, required: true },
  qualification: { type: String, required: true },
  joinDate: { type: String, required: true },
  phone: { type: String, required: true },
  passwordHash: { type: String, default: "" },
  assignedClasses: { type: [String], default: [] },
}, { timestamps: true });

export const Teacher: Model<ITeacher> = mongoose.models.Teacher || mongoose.model<ITeacher>("Teacher", TeacherSchema);

// ─── ADMIN USERS ─────────────────────────────────────────────────────────────

export interface IAdminUser extends Document {
  username: string;
  passwordHash: string;
  createdAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

export const AdminUser: Model<IAdminUser> = mongoose.models.AdminUser || mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);

// ─── ATTENDANCE RECORDS ───────────────────────────────────────────────────────

export interface IAttendanceRecord extends Document {
  className: string;
  date: string;
  teacherName: string;
  entries: object[];
  updatedAt: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>({
  className: { type: String, required: true },
  date: { type: String, required: true },
  teacherName: { type: String, required: true },
  entries: { type: [Schema.Types.Mixed], default: [] },
}, { timestamps: true });

AttendanceRecordSchema.index({ className: 1, date: 1 }, { unique: true });

export const AttendanceRecord: Model<IAttendanceRecord> = mongoose.models.AttendanceRecord || mongoose.model<IAttendanceRecord>("AttendanceRecord", AttendanceRecordSchema);

// ─── HOMEWORK ─────────────────────────────────────────────────────────────────

export interface IHomework extends Document {
  hwId: string;
  className: string;
  section: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  fileName: string;
  teacherName: string;
  createdAt: string;
}

const HomeworkSchema = new Schema<IHomework>({
  hwId: { type: String, required: true, unique: true },
  className: { type: String, required: true },
  section: { type: String, required: true },
  subject: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  dueDate: { type: String, required: true },
  fileName: { type: String, default: "" },
  teacherName: { type: String, required: true },
  createdAt: { type: String, required: true },
}, { timestamps: { createdAt: "createdTs", updatedAt: "updatedTs" } });

export const Homework: Model<IHomework> = mongoose.models.Homework || mongoose.model<IHomework>("Homework", HomeworkSchema);

// ─── RESULTS ─────────────────────────────────────────────────────────────────

export interface IResult extends Document {
  resultId: string;
  className: string;
  section: string;
  subject: string;
  examType: string;
  unitTestNumber?: number | null;
  title: string;
  fileName: string;
  targetRollNo?: string | null;
  teacherName: string;
  createdAt: string;
}

const ResultSchema = new Schema<IResult>({
  resultId: { type: String, required: true, unique: true },
  className: { type: String, required: true },
  section: { type: String, required: true },
  subject: { type: String, required: true },
  examType: { type: String, required: true },
  unitTestNumber: { type: Number, default: null },
  title: { type: String, required: true },
  fileName: { type: String, default: "" },
  targetRollNo: { type: String, default: null },
  teacherName: { type: String, required: true },
  createdAt: { type: String, required: true },
}, { timestamps: { createdAt: "createdTs", updatedAt: "updatedTs" } });

export const Result: Model<IResult> = mongoose.models.Result || mongoose.model<IResult>("Result", ResultSchema);

// ─── NOTICES ─────────────────────────────────────────────────────────────────

export interface INotice extends Document {
  noticeId: string;
  title: string;
  description: string;
  audience: string;
  className: string;
  teacherName: string;
  createdAt: string;
}

const NoticeSchema = new Schema<INotice>({
  noticeId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  audience: { type: String, required: true },
  className: { type: String, default: "" },
  teacherName: { type: String, required: true },
  createdAt: { type: String, required: true },
}, { timestamps: { createdAt: "createdTs", updatedAt: "updatedTs" } });

export const Notice: Model<INotice> = mongoose.models.Notice || mongoose.model<INotice>("Notice", NoticeSchema);

// ─── MESSAGES ────────────────────────────────────────────────────────────────

export interface IMessage extends Document {
  messageId: string;
  subject: string;
  body: string;
  audience: string;
  className: string;
  studentId?: string | null;
  studentName?: string | null;
  teacherName: string;
  sentAt: string;
}

const MessageSchema = new Schema<IMessage>({
  messageId: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  audience: { type: String, required: true },
  className: { type: String, default: "" },
  studentId: { type: String, default: null },
  studentName: { type: String, default: null },
  teacherName: { type: String, required: true },
  sentAt: { type: String, required: true },
}, { timestamps: { createdAt: "sentTs", updatedAt: "updatedTs" } });

export const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

// ─── STUDY MATERIALS ─────────────────────────────────────────────────────────

export interface IStudyMaterial extends Document {
  materialId: string;
  title: string;
  className: string;
  fileName: string;
  videoUrl: string;
  resourceType: string;
  updatedAt: string;
}

const StudyMaterialSchema = new Schema<IStudyMaterial>({
  materialId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  className: { type: String, required: true },
  fileName: { type: String, default: "" },
  videoUrl: { type: String, default: "" },
  resourceType: { type: String, required: true },
  updatedAt: { type: String, required: true },
}, { timestamps: { createdAt: "createdTs", updatedAt: "updatedTs" } });

export const StudyMaterial: Model<IStudyMaterial> = mongoose.models.StudyMaterial || mongoose.model<IStudyMaterial>("StudyMaterial", StudyMaterialSchema);

// ─── TIMETABLE ───────────────────────────────────────────────────────────────

export interface ITimetableRow extends Document {
  rowId: string;
  className: string;
  period: string;
  subject: string;
  time: string;
  updatedAt: string;
}

const TimetableRowSchema = new Schema<ITimetableRow>({
  rowId: { type: String, required: true, unique: true },
  className: { type: String, required: true },
  period: { type: String, required: true },
  subject: { type: String, required: true },
  time: { type: String, required: true },
  updatedAt: { type: String, required: true },
}, { timestamps: { createdAt: "createdTs", updatedAt: "updatedTs" } });

export const TimetableRow: Model<ITimetableRow> = mongoose.models.TimetableRow || mongoose.model<ITimetableRow>("TimetableRow", TimetableRowSchema);

// ─── EVENTS ──────────────────────────────────────────────────────────────────

export interface IEvent extends Document {
  eventId: string;
  className: string;
  title: string;
  description: string;
  eventDate: string;
  teacherName: string;
  createdAt: string;
}

const EventSchema = new Schema<IEvent>({
  eventId: { type: String, required: true, unique: true },
  className: { type: String, default: "" },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  eventDate: { type: String, required: true },
  teacherName: { type: String, required: true },
  createdAt: { type: String, required: true },
}, { timestamps: { createdAt: "createdTs", updatedAt: "updatedTs" } });

export const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

// ─── ADMISSIONS ──────────────────────────────────────────────────────────────

export interface IAdmission extends Document {
  studentName: string;
  parentName: string;
  phone: string;
  email: string;
  classApplied: string;
  message: string;
  status: string;
  createdAt: Date;
}

const AdmissionSchema = new Schema<IAdmission>({
  studentName: { type: String, required: true },
  parentName: { type: String, default: "" },
  phone: { type: String, required: true },
  email: { type: String, default: "" },
  classApplied: { type: String, default: "" },
  message: { type: String, default: "" },
  status: { type: String, default: "pending" },
}, { timestamps: true });

export const Admission: Model<IAdmission> = mongoose.models.Admission || mongoose.model<IAdmission>("Admission", AdmissionSchema);

// ─── CONTACTS ────────────────────────────────────────────────────────────────

export interface IContact extends Document {
  fullName: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>({
  fullName: { type: String, required: true },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  subject: { type: String, default: "" },
  message: { type: String, required: true },
}, { timestamps: true });

export const Contact: Model<IContact> = mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);

// ─── ANNOUNCEMENTS ───────────────────────────────────────────────────────────

export interface IAnnouncement extends Document {
  text: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>({
  text: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

export const Announcement: Model<IAnnouncement> = mongoose.models.Announcement || mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);
