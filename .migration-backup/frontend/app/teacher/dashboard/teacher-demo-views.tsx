"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  getClassAttendance,
  saveClassAttendance,
  type AttendanceEntry,
} from "@/app/shared/attendance-store";
import {
  getStudents,
  saveStudent,
  type StudentDirectoryRecord,
} from "@/app/shared/directory-store";
import { saveHomework } from "@/app/shared/homework-store";
import {
  getEvents,
  getMaterials,
  getMessages,
  getNotices,
  getTimetable,
  saveEvent,
  saveMaterial,
  saveMessage,
  saveNotice,
  saveTimetableRow,
  updateStudentFees,
  type EventRecord,
  type MessageRecord,
  type NoticeRecord,
  type StudyMaterialRecord,
  type TimetableRowRecord,
} from "@/app/shared/live-content-store";
import { saveResultRecord, type ExamType } from "@/app/shared/result-store";

export type TeacherNavKey =
  | "dashboard"
  | "my-classes"
  | "attendance"
  | "homework"
  | "fees"
  | "results"
  | "students"
  | "timetable"
  | "events"
  | "notices"
  | "messages"
  | "study-material"
  | "settings";

type ToastFn = (message: string) => void;

export function TeacherDemoView({ nav, toast }: { nav: TeacherNavKey; toast: ToastFn }) {
  if (nav === "dashboard") return null;

  switch (nav) {
    case "my-classes":
      return (
        <DemoPage title="My classes" crumb="Teacher Â· My Classes">
          <Toolbar primary="Add note (demo)" secondary="Export roster (demo)" toast={toast} />
          <div className="td-panel td-table-wrap">
            <table className="td-data-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Students</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["X - A", "Mathematics", "32"],
                  ["IX - B", "Mathematics", "40"],
                  ["VIII - A", "Mathematics", "36"],
                  ["XI - Sci", "Mathematics", "28"],
                ].map((r) => (
                  <tr key={r[0]}>
                    <td>{r[0]}</td>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DemoPage>
      );

    case "attendance":
      return <TeacherAttendanceInteractive toast={toast} />;

    case "homework":
      return <TeacherHomeworkInteractive toast={toast} />;

    case "fees":
      return <TeacherFeesInteractive toast={toast} />;

    case "results":
      return <TeacherResultsInteractive toast={toast} />;

    case "students":
      return <TeacherStudentsInteractive toast={toast} />;

    case "timetable":
      return <TeacherTimetableInteractive toast={toast} />;

    case "events":
      return <TeacherEventsInteractive toast={toast} />;

    case "notices":
      return <TeacherNoticesInteractive toast={toast} />;

    case "messages":
      return <TeacherMessagesInteractive toast={toast} />;

    case "study-material":
      return <TeacherStudyMaterialInteractive toast={toast} />;

    case "settings":
      return <TeacherSettingsInteractive toast={toast} />;

    default:
      return null;
  }
}

function DemoPage({ title, crumb, children }: { title: string; crumb: string; children: ReactNode }) {
  return (
    <div>
      <p className="td-crumb">{crumb}</p>
      <h1 className="td-page-title">{title}</h1>
      <p className="td-page-sub">Demo workspace for review â€” actions show toasts only.</p>
      {children}
    </div>
  );
}

function Toolbar({
  primary,
  secondary,
  toast,
}: {
  primary: string;
  secondary?: string;
  toast: ToastFn;
}) {
  return (
    <div className="td-toolbar">
      <button type="button" className="td-btn-primary" onClick={() => toast(`Demo: ${primary}`)}>
        {primary}
      </button>
      {secondary ? (
        <button type="button" className="td-btn-secondary" onClick={() => toast(`Demo: ${secondary}`)}>
          {secondary}
        </button>
      ) : null}
      <select
        className="td-select"
        aria-label="Filter"
        onChange={(e) => toast(`Filter: ${e.target.value} (demo)`)}
        defaultValue="week"
      >
        <option value="week">This week</option>
        <option value="month">This month</option>
      </select>
    </div>
  );
}



type TeacherNotice = {
  id: string;
  title: string;
  description: string;
  audience: string;
  createdAt: string;
};

type MessageAudience = "all-students" | "selected-class" | "particular-student";

type TeacherMessage = {
  id: string;
  subject: string;
  body: string;
  audience: MessageAudience;
  className: string;
  studentName?: string;
  sentAt: string;
};

type StudyMaterial = {
  id: string;
  title: string;
  className: string;
  fileName: string;
  videoUrl: string;
  resourceType: string;
  updatedAt: string;
};

type TeacherProfile = {
  profilePhoto: string;
  fullName: string;
  qualification: string;
  subject: string;
  assignedClasses: string[];
  email: string;
  phone: string;
  bio: string;
  teacherId: string;
  joiningDate: string;
  experienceYears: string;
};

type TeacherFeeRecord = {
  id: string;
  className: string;
  studentName: string;
  rollNo: string;
  feeType: "Term" | "Half-Yearly" | "Yearly" | "Exam";
  examName: string;
  dueAmount: string;
  nextDueAmount: string;
  dueDate: string;
  status: "Due" | "Advance Notice Sent" | "Paid";
  historyNote: string;
};

const DEFAULT_CLASS_OPTIONS = ["X-A", "IX-B", "VIII-A", "XI-Sci"];

function mergeClassOptions(students: StudentDirectoryRecord[], extra: string[] = []) {
  const seen = new Set<string>();
  const merged = [...extra, ...students.map((student) => student.className), ...DEFAULT_CLASS_OPTIONS]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .filter((value) => {
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });

  return merged.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function splitClassName(className: string) {
  const [standard = "", section = "A"] = className.split("-");
  return { standard, section };
}

function buildClassName(standard: string, section: string) {
  return `${standard}-${section}`;
}

function mapStudentDirectoryToTeacherStudents(student: StudentDirectoryRecord[]): TeacherStudent[] {
  return student.map((record) => ({
    studentId: record.studentId,
    name: record.fullName,
    className: record.className,
    rollNo: record.rollNo,
    gender: "Not set",
    parentName: record.parents?.[0]?.name || "",
    contact: record.parents?.[0]?.phone || "",
    performance: "Average",
  }));
}

function TeacherEventsInteractive({ toast }: { toast: ToastFn }) {
  const [studentDirectory, setStudentDirectory] = useState<StudentDirectoryRecord[]>(FALLBACK_STUDENTS);
  const classOptions = ["All Classes", ...mergeClassOptions(studentDirectory)];
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [className, setClassName] = useState(classOptions[0] ?? "All Classes");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    void getStudents()
      .then((items) => {
        if (!items.length) return;
        setStudentDirectory(items);
      })
      .catch(() => {});
    void getEvents().then((items) => setEvents(items)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!classOptions.includes(className)) {
      setClassName(classOptions[0] ?? "All Classes");
    }
  }, [className, classOptions]);

  const resetForm = () => {
    setEditingId(null);
    setClassName(classOptions[0] ?? "All Classes");
    setTitle("");
    setDescription("");
    setEventDate(new Date().toISOString().slice(0, 10));
  };

  const onSave = async () => {
    if (!title.trim()) {
      toast("Event title is required");
      return;
    }

    try {
      const payload: EventRecord = {
        id: editingId || `EVT-${Date.now()}`,
        className,
        title: title.trim(),
        description: description.trim(),
        eventDate,
        teacherName: "Ms. Neha Sharma",
        createdAt: new Date().toISOString(),
      };

      const saved = await saveEvent(payload);
      setEvents((prev) => [saved, ...prev.filter((item) => item.id !== saved.id)]);
      toast(editingId ? "Event updated" : "Event published");
      resetForm();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to save event");
    }
  };

  return (
    <div>
      <p className="td-crumb">Teacher · Events</p>
      <h1 className="td-page-title">Events</h1>
      <p className="td-page-sub">Create class-wise or school-wide events that appear directly in the student portal.</p>

      <div className="td-panel">
        <div className="td-demo-grid-2">
          <label className="td-field">
            <span>Event Title</span>
            <input className="td-select td-input-full" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="td-field">
            <span>Class</span>
            <select className="td-select td-input-full" value={className} onChange={(e) => setClassName(e.target.value)}>
              {classOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="td-field">
            <span>Event Date</span>
            <input type="date" className="td-select td-input-full" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </label>
        </div>
        <label className="td-field td-mt">
          <span>Description</span>
          <textarea className="td-select td-textarea" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="td-toolbar td-mt">
          <button type="button" className="td-btn-primary" onClick={onSave}>
            {editingId ? "Update Event" : "Publish Event"}
          </button>
          {editingId ? (
            <button type="button" className="td-btn-secondary" onClick={resetForm}>
              Cancel Edit
            </button>
          ) : null}
        </div>
      </div>

      <div className="td-panel td-mt">
        <div className="td-panel-head">
          <h3>Published Events</h3>
          <span className="td-muted">{events.length} total</span>
        </div>
        <div className="td-stack-sm">
          {events.map((item) => (
            <div key={item.id} className="td-surface">
              <div className="td-row-between td-row-top">
                <div>
                  <strong>{item.title}</strong>
                  <p className="td-muted td-m0">{item.eventDate} · {item.className}</p>
                </div>
                <button
                  type="button"
                  className="td-link-btn"
                  onClick={() => {
                    setEditingId(item.id);
                    setClassName(item.className);
                    setTitle(item.title);
                    setDescription(item.description);
                    setEventDate(item.eventDate);
                    toast("Editing event: " + item.title);
                  }}
                >
                  Edit
                </button>
              </div>
              <p className="td-m0 td-mt td-body-copy">{item.description || "No description added."}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeacherNoticesInteractive({ toast }: { toast: ToastFn }) {
  const [notices, setNotices] = useState<TeacherNotice[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("All Classes");

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setAudience("All Classes");
  };

  useEffect(() => {
    void getNotices().then((items) => setNotices(items as TeacherNotice[])).catch(() => {});
  }, []);

  const onSave = async () => {
    if (!title.trim() || !description.trim()) {
      toast("Notice title and description are required");
      return;
    }

    const payload: NoticeRecord = {
      id: editingId || "NT-" + Date.now(),
      title: title.trim(),
      description: description.trim(),
      audience,
      className: audience === "All Classes" ? "" : audience,
      teacherName: "Ms. Neha Sharma",
      createdAt: new Date().toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const saved = await saveNotice(payload);
    setNotices((prev) => [saved as TeacherNotice, ...prev.filter((item) => item.id !== saved.id)]);
    toast(editingId ? "Notice updated" : "Notice published");

    resetForm();
  };

  return (
    <div>
      <p className="td-crumb">Teacher Â· Notices</p>
      <h1 className="td-page-title">Notice Board Management</h1>
      <p className="td-page-sub">Create school notices, choose audience, and edit published notices anytime.</p>

      <div className="td-panel">
        <h3 className="td-h3">{editingId ? "Edit Notice" : "Add New Notice"}</h3>
        <div className="td-demo-grid-2">
          <label className="td-field">
            <span>Notice Title</span>
            <input className="td-select td-input-full" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="td-field">
            <span>Audience</span>
            <select className="td-select td-input-full" value={audience} onChange={(e) => setAudience(e.target.value)}>
              <option>All Classes</option>
              {ALLOTTED_CLASSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="td-field td-mt">
          <span>Notice Description</span>
          <textarea className="td-select td-textarea" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </label>
        <div className="td-toolbar td-mt">
          <button type="button" className="td-btn-primary" onClick={onSave}>
            {editingId ? "Update Notice" : "Publish Notice"}
          </button>
          {editingId ? (
            <button type="button" className="td-btn-secondary" onClick={resetForm}>
              Cancel Edit
            </button>
          ) : null}
        </div>
      </div>

      <div className="td-panel td-mt">
        <div className="td-panel-head">
          <h3>Published Notices</h3>
          <span className="td-muted">{notices.length} total</span>
        </div>
        <div className="td-stack-sm">
          {notices.map((item) => (
            <div key={item.id} className="td-surface">
              <div className="td-row-between td-row-top">
                <div>
                  <strong>{item.title}</strong>
                  <p className="td-muted td-m0">{item.createdAt}</p>
                </div>
                <button
                  type="button"
                  className="td-link-btn"
                  onClick={() => {
                    setEditingId(item.id);
                    setTitle(item.title);
                    setDescription(item.description);
                    setAudience(item.audience);
                    toast("Editing notice: " + item.title);
                  }}
                >
                  Edit
                </button>
              </div>
              <p className="td-m0 td-mt td-body-copy">{item.description}</p>
              <p className="td-muted td-m0 td-mt">Audience: {item.audience}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeacherMessagesInteractive({ toast }: { toast: ToastFn }) {
  const [studentDirectory, setStudentDirectory] = useState<StudentDirectoryRecord[]>(FALLBACK_STUDENTS);
  const classRosters = buildClassRosters(studentDirectory);
  const fallbackClass = classRosters[0]?.className ?? DEFAULT_CLASS_OPTIONS[0];
  const [audienceType, setAudienceType] = useState<MessageAudience>("all-students");
  const [selectedClass, setSelectedClass] = useState(fallbackClass);
  const [selectedStudent, setSelectedStudent] = useState(classRosters[0]?.students[0]?.studentName ?? "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [messages, setMessages] = useState<TeacherMessage[]>([]);

  useEffect(() => {
    void getMessages().then((items) => setMessages(items as TeacherMessage[])).catch(() => {});
  }, []);

  useEffect(() => {
    void getStudents()
      .then((items) => {
        if (!items.length) return;
        setStudentDirectory(items);
      })
      .catch(() => {});
  }, []);

  const currentClass = classRosters.some((item) => item.className === selectedClass)
    ? selectedClass
    : fallbackClass;
  const studentOptions = classRosters.find((item) => item.className === currentClass)?.students ?? [];

  useEffect(() => {
    if (!studentOptions.length) {
      setSelectedStudent("");
      return;
    }
    if (!studentOptions.some((student) => student.studentName === selectedStudent)) {
      setSelectedStudent(studentOptions[0]?.studentName ?? "");
    }
  }, [selectedStudent, studentOptions]);

  const sendMessage = async () => {
    if (!subject.trim() || !body.trim()) {
      toast("Message subject and content are required");
      return;
    }

    if (audienceType === "particular-student" && !selectedStudent) {
      toast("Please choose a student");
      return;
    }

    const selectedStudentRecord = studentOptions.find((student) => student.studentName === selectedStudent);
    const payload: MessageRecord = {
      id: "MSG-" + Date.now(),
      subject: subject.trim(),
      body: body.trim(),
      audience: audienceType,
      className: audienceType === "all-students" ? "All Classes" : currentClass,
      studentId: audienceType === "particular-student" ? selectedStudentRecord?.studentId : undefined,
      studentName: audienceType === "particular-student" ? selectedStudent : undefined,
      teacherName: "Ms. Neha Sharma",
      sentAt: new Date().toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const saved = await saveMessage(payload);
    setMessages((prev) => [saved as TeacherMessage, ...prev]);
    setSubject("");
    setBody("");

    toast(
      audienceType === "all-students"
        ? "Message sent to all students"
        : audienceType === "selected-class"
          ? "Message sent to " + selectedClass
          : "Message sent to " + selectedStudent + " (" + selectedClass + ")",
    );
  };

  return (
    <div>
      <p className="td-crumb">Teacher Â· Messages</p>
      <h1 className="td-page-title">Send Messages</h1>
      <p className="td-page-sub">Send updates to all students, one selected class, or one student from a chosen class.</p>

      <div className="td-panel">
        <div className="td-toolbar">
          <button type="button" className={audienceType === "all-students" ? "td-btn-primary" : "td-btn-secondary"} onClick={() => setAudienceType("all-students")}>
            All Students
          </button>
          <button type="button" className={audienceType === "selected-class" ? "td-btn-primary" : "td-btn-secondary"} onClick={() => setAudienceType("selected-class")}>
            Selected Class
          </button>
          <button type="button" className={audienceType === "particular-student" ? "td-btn-primary" : "td-btn-secondary"} onClick={() => setAudienceType("particular-student")}>
            Particular Student
          </button>
        </div>

        <div className="td-demo-grid-2">
          <label className="td-field">
            <span>Subject</span>
            <input className="td-select td-input-full" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </label>
          <label className="td-field">
            <span>Class</span>
            <select
              className="td-select td-input-full"
              value={selectedClass}
              disabled={audienceType === "all-students"}
              onChange={(e) => {
                const nextClass = e.target.value;
                setSelectedClass(nextClass);
                const firstStudent = classRosters.find((item) => item.className === nextClass)?.students[0]?.studentName ?? "";
                setSelectedStudent(firstStudent);
              }}
            >
              {classRosters.map((item) => (
                <option key={item.className} value={item.className}>
                  {item.className}
                </option>
              ))}
            </select>
          </label>
          {audienceType === "particular-student" ? (
            <label className="td-field">
              <span>Student</span>
              <select className="td-select td-input-full" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
                {studentOptions.map((student) => (
                  <option key={student.studentId} value={student.studentName}>
                    {student.studentName}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <label className="td-field td-mt">
          <span>Message</span>
          <textarea className="td-select td-textarea" value={body} onChange={(e) => setBody(e.target.value)} rows={5} />
        </label>

        <div className="td-toolbar td-mt">
          <button type="button" className="td-btn-primary" onClick={sendMessage}>
            Send Message
          </button>
        </div>
      </div>

      <div className="td-panel td-mt">
        <div className="td-panel-head">
          <h3>Recent Sent Messages</h3>
        </div>
        {messages.map((item) => (
          <div key={item.id} className="td-msg-row" style={{ cursor: "default" }}>
            <strong>{item.subject}</strong>
            <span className="td-muted">
              {item.audience === "all-students"
                ? "To: All Students"
                : item.audience === "selected-class"
                  ? "To: " + item.className
                  : "To: " + item.studentName + " | " + item.className}
            </span>
            <span className="td-body-copy">{item.body}</span>
            <time>{item.sentAt}</time>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeacherStudyMaterialInteractive({ toast }: { toast: ToastFn }) {
  const [studentDirectory, setStudentDirectory] = useState<StudentDirectoryRecord[]>(FALLBACK_STUDENTS);
  const classOptions = mergeClassOptions(studentDirectory);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState(classOptions[0] ?? DEFAULT_CLASS_OPTIONS[0]);
  const [fileName, setFileName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setClassName(classOptions[0] ?? DEFAULT_CLASS_OPTIONS[0]);
    setFileName("");
    setVideoUrl("");
  };

  useEffect(() => {
    void getMaterials().then((items) => setMaterials(items as StudyMaterial[])).catch(() => {});
    void getStudents()
      .then((items) => {
        if (!items.length) return;
        setStudentDirectory(items);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!classOptions.includes(className)) {
      setClassName(classOptions[0] ?? DEFAULT_CLASS_OPTIONS[0]);
    }
  }, [className, classOptions]);

  const saveStudyMaterial = async () => {
    if (!title.trim()) {
      toast("Resource title is required");
      return;
    }
    if (!fileName.trim() && !videoUrl.trim()) {
      toast("Please choose a file or add a video URL");
      return;
    }

    const resourceType = fileName && videoUrl ? "File + Video" : fileName ? fileName.split(".").pop()?.toUpperCase() ?? "File" : "Video URL";

    const payload: StudyMaterialRecord = {
      id: editingId || "MAT-" + Date.now(),
      title: title.trim(),
      className,
      fileName: fileName.trim(),
      videoUrl: videoUrl.trim(),
      resourceType,
      updatedAt: new Date().toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const saved = await saveMaterial(payload);
    setMaterials((prev) => [saved as StudyMaterial, ...prev.filter((item) => item.id !== saved.id)]);
    toast(editingId ? "Study material updated" : "Study material added for " + className);

    resetForm();
  };

  return (
    <div>
      <p className="td-crumb">Teacher Â· Study Material</p>
      <h1 className="td-page-title">Study Material</h1>
      <p className="td-page-sub">Upload PDF or image resources, add video URLs, and assign them to the right class with a resource title.</p>

      <div className="td-panel">
        <h3 className="td-h3">{editingId ? "Edit Resource" : "Add Resource"}</h3>
        <div className="td-demo-grid-2">
          <label className="td-field">
            <span>Resource Title</span>
            <input className="td-select td-input-full" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="td-field">
            <span>Assign to Class</span>
            <select className="td-select td-input-full" value={className} onChange={(e) => setClassName(e.target.value)}>
              {classOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="td-field">
            <span>Document / PDF / Image</span>
            <input type="file" accept=".pdf,image/*,.doc,.docx" className="td-select td-input-full" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? fileName)} />
            {fileName ? <small className="td-muted">Selected: {fileName}</small> : null}
          </label>
          <label className="td-field">
            <span>Video URL</span>
            <input className="td-select td-input-full" placeholder="https://youtube.com/..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
          </label>
        </div>

        <div className="td-toolbar td-mt">
          <button type="button" className="td-btn-primary" onClick={saveStudyMaterial}>
            {editingId ? "Update Resource" : "Add Resource"}
          </button>
          {editingId ? (
            <button type="button" className="td-btn-secondary" onClick={resetForm}>
              Cancel Edit
            </button>
          ) : null}
        </div>
      </div>

      <div className="td-panel td-table-wrap td-mt">
        <table className="td-data-table">
          <thead>
            <tr>
              <th>Resource Title</th>
              <th>Class</th>
              <th>File</th>
              <th>Video URL</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.className}</td>
                <td>{item.fileName || "-"}</td>
                <td>{item.videoUrl || "-"}</td>
                <td>{item.resourceType}</td>
                <td>
                  <button
                    type="button"
                    className="td-link-btn"
                    onClick={() => {
                      setEditingId(item.id);
                      setTitle(item.title);
                      setClassName(item.className);
                      setFileName(item.fileName);
                      setVideoUrl(item.videoUrl);
                      toast("Editing resource: " + item.title);
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeacherFeesInteractive({ toast }: { toast: ToastFn }) {
  const [studentDirectory, setStudentDirectory] = useState<StudentDirectoryRecord[]>(FALLBACK_STUDENTS);
  const classOptions = mergeClassOptions(studentDirectory);
  const [selectedClassName, setSelectedClassName] = useState(classOptions[0] ?? DEFAULT_CLASS_OPTIONS[0]);
  const [feeType, setFeeType] = useState<TeacherFeeRecord["feeType"]>("Term");
  const [examName, setExamName] = useState("Unit Test 1");
  const [dueAmount, setDueAmount] = useState("2500");
  const [nextDueAmount, setNextDueAmount] = useState("3000");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [feeStatus, setFeeStatus] = useState<TeacherFeeRecord["status"]>("Due");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  useEffect(() => {
    void getStudents()
      .then((items) => {
        if (!items.length) return;
        setStudentDirectory(items);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!classOptions.includes(selectedClassName)) {
      setSelectedClassName(classOptions[0] ?? DEFAULT_CLASS_OPTIONS[0]);
    }
  }, [classOptions, selectedClassName]);

  const finalClass = classOptions.includes(selectedClassName)
    ? selectedClassName
    : classOptions[0] ?? DEFAULT_CLASS_OPTIONS[0];
  const studentOptions = studentDirectory
    .filter((student) => student.className === finalClass)
    .sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true }));

  useEffect(() => {
    if (!studentOptions.length) {
      setSelectedStudentId("");
      return;
    }
    if (!studentOptions.some((student) => student.studentId === selectedStudentId)) {
      setSelectedStudentId(studentOptions[0]?.studentId ?? "");
    }
  }, [selectedStudentId, studentOptions]);

  const selectedStudent = studentOptions.find((student) => student.studentId === selectedStudentId) ?? studentOptions[0];
  const filteredHistory = selectedStudent?.fees?.history ?? [];

  return (
    <div>
      <p className="td-crumb">Teacher · Fees</p>
      <h1 className="td-page-title">Fees & Payment Messages</h1>
      <p className="td-page-sub">
        Select class, section, and student to send term-wise, half-yearly, yearly, or exam fee messages and track payment history.
      </p>

      <div className="td-panel">
        <div className="td-demo-grid-3">
          <label className="td-field">
            <span>Class</span>
            <select className="td-select td-input-full" value={finalClass} onChange={(e) => setSelectedClassName(e.target.value)}>
              {classOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="td-field">
            <span>Section</span>
            <input className="td-select td-input-full" value={splitClassName(finalClass).section} readOnly />
          </label>
          <label className="td-field">
            <span>Student</span>
            <select className="td-select td-input-full" value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
              {studentOptions.map((item) => (
                <option key={item.studentId} value={item.studentId}>
                  {item.fullName} ({item.rollNo})
                </option>
              ))}
            </select>
          </label>
          <label className="td-field">
            <span>Fee Type</span>
            <select className="td-select td-input-full" value={feeType} onChange={(e) => setFeeType(e.target.value as TeacherFeeRecord["feeType"])}>
              <option>Term</option>
              <option>Half-Yearly</option>
              <option>Yearly</option>
              <option>Exam</option>
            </select>
          </label>
          <label className="td-field">
            <span>Exam Option</span>
            <select className="td-select td-input-full" value={examName} onChange={(e) => setExamName(e.target.value)}>
              <option>Unit Test 1</option>
              <option>Unit Test 2</option>
              <option>Half-Yearly Exam</option>
              <option>Final Exam</option>
            </select>
          </label>
          <label className="td-field">
            <span>Status</span>
            <select className="td-select td-input-full" value={feeStatus} onChange={(e) => setFeeStatus(e.target.value as TeacherFeeRecord["status"])}>
              <option>Due</option>
              <option>Advance Notice Sent</option>
              <option>Paid</option>
            </select>
          </label>
          <label className="td-field">
            <span>Money Due</span>
            <input className="td-select td-input-full" value={dueAmount} onChange={(e) => setDueAmount(e.target.value)} />
          </label>
          <label className="td-field">
            <span>Next Due Amount</span>
            <input className="td-select td-input-full" value={nextDueAmount} onChange={(e) => setNextDueAmount(e.target.value)} />
          </label>
          <label className="td-field">
            <span>Due Date</span>
            <input type="date" className="td-select td-input-full" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </label>
        </div>

        <div className="td-toolbar td-mt">
          <button
            type="button"
            className="td-btn-primary"
            onClick={async () => {
              if (!selectedStudent) {
                toast("Please choose a student");
                return;
              }

              const note =
                feeStatus === "Paid"
                  ? `Paid on ${new Date().toLocaleDateString("en-IN")}`
                  : feeStatus === "Advance Notice Sent"
                    ? `Advance due notice sent for next amount of Rs. ${nextDueAmount}`
                    : `Due message sent for Rs. ${dueAmount}`;

              try {
                await updateStudentFees(selectedStudent.studentId, {
                  currentTermStatus: feeStatus,
                  currentTermNote: `${feeType}${feeType === "Exam" ? ` - ${examName}` : ""}: ${note}`,
                  nextDueAmount,
                  nextDueLabel: dueDate,
                  history: [
                    {
                      period: `${feeType}${feeType === "Exam" ? ` - ${examName}` : ""}`,
                      amount: dueAmount,
                      status: feeStatus,
                    },
                    ...(selectedStudent.fees?.history ?? []),
                  ],
                });

                const records = await getStudents();
                setStudentDirectory(records.length ? records : studentDirectory);
                toast(`Fee message sent to ${selectedStudent.fullName}`);
              } catch (error) {
                toast(error instanceof Error ? error.message : "Failed to update fees");
              }
            }}
          >
            Send Fee Message
          </button>
        </div>
      </div>

      <div className="td-panel td-table-wrap td-mt">
        <div className="td-panel-head" style={{ padding: "1rem 1rem 0" }}>
          <h3 style={{ margin: 0 }}>Fees History</h3>
          <span className="td-muted">{finalClass}</span>
        </div>
        <table className="td-data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Type</th>
              <th>Exam</th>
              <th>Due</th>
              <th>Next Due</th>
              <th>Status</th>
              <th>History</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length ? (
              filteredHistory.map((item, index) => (
                <tr key={`${item.period}-${index}`}>
                  <td>
                    {selectedStudent?.fullName ?? "-"}
                    <div className="td-muted">Roll {selectedStudent?.rollNo ?? "-"}</div>
                  </td>
                  <td>{item.period}</td>
                  <td>{feeType === "Exam" ? examName : "-"}</td>
                  <td>Rs. {item.amount}</td>
                  <td>Rs. {selectedStudent?.fees?.nextDueAmount ?? "0"}</td>
                  <td>{item.status}</td>
                  <td>{selectedStudent?.fees?.currentTermNote ?? "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="td-muted">
                  No fee history for this class yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeacherSettingsInteractive({ toast }: { toast: ToastFn }) {
  const [profile, setProfile] = useState<TeacherProfile>({
    profilePhoto: "neha-sharma-profile.jpg",
    fullName: "Ms. Neha Sharma",
    qualification: "M.Sc. Mathematics, B.Ed.",
    subject: "Mathematics",
    assignedClasses: ["X-A", "IX-B", "VIII-A"],
    email: "neha.sharma@abhaynobles.edu.in",
    phone: "9876543210",
    bio: "Passionate mathematics teacher focused on strong concepts and student confidence.",
    teacherId: "TCH-2045",
    joiningDate: "2019-07-01",
    experienceYears: "7",
  });

  const updateProfile = <K extends keyof TeacherProfile>(key: K, value: TeacherProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAssignedClass = (classValue: string) => {
    setProfile((prev) => ({
      ...prev,
      assignedClasses: prev.assignedClasses.includes(classValue)
        ? prev.assignedClasses.filter((item) => item !== classValue)
        : [...prev.assignedClasses, classValue],
    }));
  };

  return (
    <div>
      <p className="td-crumb">Teacher Â· Settings</p>
      <h1 className="td-page-title">Profile Settings</h1>
      <p className="td-page-sub">Manage your teacher profile, professional details, and assigned classes.</p>
      <div className="td-panel">
        <div className="td-demo-grid-2">
          <label className="td-field">
            <span>Profile Photo</span>
            <input type="file" accept="image/*" className="td-select td-input-full" onChange={(e) => updateProfile("profilePhoto", e.target.files?.[0]?.name ?? profile.profilePhoto)} />
            <small className="td-muted">Current: {profile.profilePhoto}</small>
          </label>
          <label className="td-field">
            <span>Full Name</span>
            <input className="td-select td-input-full" value={profile.fullName} onChange={(e) => updateProfile("fullName", e.target.value)} />
          </label>
          <label className="td-field">
            <span>Qualification</span>
            <input className="td-select td-input-full" value={profile.qualification} onChange={(e) => updateProfile("qualification", e.target.value)} />
          </label>
          <label className="td-field">
            <span>Subject</span>
            <input className="td-select td-input-full" value={profile.subject} onChange={(e) => updateProfile("subject", e.target.value)} />
          </label>
          <label className="td-field">
            <span>Email</span>
            <input type="email" className="td-select td-input-full" value={profile.email} onChange={(e) => updateProfile("email", e.target.value)} />
          </label>
          <label className="td-field">
            <span>Phone Number</span>
            <input className="td-select td-input-full" value={profile.phone} onChange={(e) => updateProfile("phone", e.target.value)} />
          </label>
          <label className="td-field">
            <span>Teacher ID</span>
            <input className="td-select td-input-full" value={profile.teacherId} onChange={(e) => updateProfile("teacherId", e.target.value)} />
          </label>
          <label className="td-field">
            <span>Joining Date</span>
            <input type="date" className="td-select td-input-full" value={profile.joiningDate} onChange={(e) => updateProfile("joiningDate", e.target.value)} />
          </label>
          <label className="td-field">
            <span>Experience Years</span>
            <input type="number" min="0" className="td-select td-input-full" value={profile.experienceYears} onChange={(e) => updateProfile("experienceYears", e.target.value)} />
          </label>
        </div>

        <div className="td-field td-mt">
          <span>Assigned Classes</span>
          <div className="td-chip-row">
            {ALLOTTED_CLASSES.map((item) => (
              <label key={item} className="td-chip-option">
                <input type="checkbox" checked={profile.assignedClasses.includes(item)} onChange={() => toggleAssignedClass(item)} />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>

        <label className="td-field td-mt">
          <span>Bio / About</span>
          <textarea className="td-select td-textarea" rows={4} value={profile.bio} onChange={(e) => updateProfile("bio", e.target.value)} />
        </label>

        <button type="button" className="td-btn-primary td-mt" onClick={() => toast("Profile saved for " + profile.fullName)}>
          Save Profile Settings
        </button>
      </div>
    </div>
  );
}

type ClassRoster = {
  className: string;
  students: { studentId: string; studentName: string; rollNo: string }[];
};

const FALLBACK_STUDENTS: StudentDirectoryRecord[] = [
  {
    studentId: "AN2024-0842",
    fullName: "Aarav Sharma",
    className: "X-A",
    section: "A",
    rollNo: "14",
    photo: "./demo-student-profile.png",
    parents: [],
    fees: {
      currentTermStatus: "Paid",
      currentTermNote: "",
      nextDueAmount: "12,400",
      nextDueLabel: "July 2026",
      history: [],
    },
  },
  {
    studentId: "AN2024-0907",
    fullName: "Ishita Meena",
    className: "IX-B",
    section: "B",
    rollNo: "07",
    photo: "./demo-student-profile.png",
    parents: [],
    fees: {
      currentTermStatus: "Pending",
      currentTermNote: "",
      nextDueAmount: "12,400",
      nextDueLabel: "May 2026",
      history: [],
    },
  },
];

function buildClassRosters(students: StudentDirectoryRecord[]): ClassRoster[] {
  const grouped = new Map<string, ClassRoster["students"]>();

  for (const student of students) {
    const current = grouped.get(student.className) || [];
    current.push({
      studentId: student.studentId,
      studentName: student.fullName,
      rollNo: student.rollNo,
    });
    grouped.set(student.className, current);
  }

  return Array.from(grouped.entries())
    .map(([className, members]) => ({
      className,
      students: [...members].sort((a, b) => a.rollNo.localeCompare(b.rollNo)),
    }))
    .sort((a, b) => a.className.localeCompare(b.className));
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function TeacherAttendanceInteractive({ toast }: { toast: ToastFn }) {
  const [studentDirectory, setStudentDirectory] = useState<StudentDirectoryRecord[]>(FALLBACK_STUDENTS);
  const classRosters = buildClassRosters(studentDirectory);
  const initialClass = classRosters[0]?.className ?? "X-A";
  const [selectedClass, setSelectedClass] = useState(initialClass);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [defaultRemark, setDefaultRemark] = useState("On time");
  const currentSelectedClass = classRosters.some((item) => item.className === selectedClass)
    ? selectedClass
    : initialClass;
  const [entries, setEntries] = useState<AttendanceEntry[]>(
    (classRosters[0]?.students ?? []).map((s) => ({
      studentId: s.studentId,
      studentName: s.studentName,
      status: "present",
      remark: "",
    })),
  );

  async function loadForSelection(className: string, date: string, rosters = classRosters) {
    const existing = await getClassAttendance(className, date);
    if (existing) {
      setEntries(existing.entries);
      return;
    }
    const roster = rosters.find((r) => r.className === className);
    setEntries(
      (roster?.students ?? []).map((s) => ({
        studentId: s.studentId,
        studentName: s.studentName,
        status: "present",
        remark: "",
      })),
    );
  }

  useEffect(() => {
    let ignore = false;

    async function hydrateStudents() {
      try {
        const records = await getStudents();
        if (ignore || !records.length) return;
        const nextRosters = buildClassRosters(records);
        const nextClass = nextRosters[0]?.className ?? "X-A";

        setStudentDirectory(records);
        setSelectedClass(nextClass);

        const existing = await getClassAttendance(nextClass, getToday());
        if (existing) {
          setEntries(existing.entries);
          return;
        }
        const roster = nextRosters.find((item) => item.className === nextClass);
        setEntries(
          (roster?.students ?? []).map((student) => ({
            studentId: student.studentId,
            studentName: student.studentName,
            status: "present",
            remark: "",
          })),
        );
      } catch {
        if (!ignore) {
          setStudentDirectory(FALLBACK_STUDENTS);
        }
      }
    }

    void hydrateStudents();
    return () => {
      ignore = true;
    };
  }, []);

  const setAllStatus = (status: "present" | "absent") => {
    setEntries((prev) =>
      prev.map((e) => ({
        ...e,
        status,
        remark: defaultRemark ? defaultRemark : e.remark,
      })),
    );
    toast(status === "present" ? "Marked all as Present" : "Marked all as Absent");
  };

  const updateEntry = (
    idx: number,
    patch: Partial<Pick<AttendanceEntry, "status" | "remark">>,
  ) => {
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, ...patch } : e)));
  };

  const presentCount = entries.filter((e) => e.status === "present").length;
  const absentCount = entries.length - presentCount;

  return (
    <div>
      <p className="td-crumb">Teacher Â· Attendance</p>
      <h1 className="td-page-title">Attendance Management</h1>
      <p className="td-page-sub">
        Select class and date, then mark present/absent with remarks. Saved records
        reflect on Student Portal.
      </p>

      <div className="td-toolbar">
        <select
          className="td-select"
          value={currentSelectedClass}
          onChange={(e) => {
            const nextClass = e.target.value;
            setSelectedClass(nextClass);
            void loadForSelection(nextClass, selectedDate, classRosters);
            toast(`Class selected: ${nextClass}`);
          }}
        >
          {classRosters.map((r) => (
            <option key={r.className} value={r.className}>
              {r.className}
            </option>
          ))}
        </select>
        <input
          className="td-select"
          type="date"
          value={selectedDate}
          onChange={(e) => {
            const nextDate = e.target.value;
            setSelectedDate(nextDate);
            void loadForSelection(currentSelectedClass, nextDate, classRosters);
            toast(`Date selected: ${nextDate}`);
          }}
        />
        <input
          className="td-select"
          style={{ minWidth: 200 }}
          placeholder="Default remark for bulk action"
          value={defaultRemark}
          onChange={(e) => setDefaultRemark(e.target.value)}
        />
        <button type="button" className="td-btn-primary" onClick={() => setAllStatus("present")}>
          Present All
        </button>
        <button
          type="button"
          className="td-btn-secondary"
          onClick={() => setAllStatus("absent")}
        >
          Absent All
        </button>
      </div>

      <div className="td-panel td-table-wrap">
        <table className="td-data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Status</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, idx) => (
              <tr key={e.studentId}>
                <td>{e.studentName}</td>
                <td>
                  <select
                    className="td-select"
                    value={e.status}
                    onChange={(ev) =>
                      updateEntry(idx, {
                        status: ev.target.value as "present" | "absent",
                      })
                    }
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                </td>
                <td>
                  <input
                    className="td-select"
                    style={{ width: "100%" }}
                    placeholder="Remark"
                    value={e.remark}
                    onChange={(ev) => updateEntry(idx, { remark: ev.target.value })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="td-toolbar td-mt">
        <span className="td-muted">
          Present: {presentCount} Â· Absent: {absentCount}
        </span>
        <button
          type="button"
          className="td-btn-primary"
          onClick={async () => {
            try {
              await saveClassAttendance({
              className: currentSelectedClass,
              date: selectedDate,
              teacherName: "Ms. Neha Sharma",
              updatedAt: new Date().toISOString(),
              entries,
              });
              toast("Attendance saved and synced to Student Portal");
            } catch (error) {
              toast(error instanceof Error ? error.message : "Failed to save attendance");
            }
          }}
        >
          Save Attendance
        </button>
      </div>
    </div>
  );
}

function TeacherHomeworkInteractive({ toast }: { toast: ToastFn }) {
  const [studentDirectory, setStudentDirectory] = useState<StudentDirectoryRecord[]>(FALLBACK_STUDENTS);
  const classOptions = mergeClassOptions(studentDirectory);
  const [selectedClassName, setSelectedClassName] = useState(classOptions[0] ?? DEFAULT_CLASS_OPTIONS[0]);
  const [subject, setSubject] = useState("Mathematics");
  const [title, setTitle] = useState("Exercise 5.2");
  const [description, setDescription] = useState("Complete all questions from exercise 5.2.");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [fileName, setFileName] = useState("homework-worksheet.pdf");
  const [statusRecords, setStatusRecords] = useState([
    { className: "X-A", student: "Aarav Sharma", rollNo: "14", status: "Submitted", updatedAt: "10 May 2026 · 08:40 AM" },
    { className: "X-A", student: "Riya Singh", rollNo: "15", status: "Pending", updatedAt: "Not submitted yet" },
    { className: "X-A", student: "Dev Mehta", rollNo: "16", status: "Reviewed", updatedAt: "9 May 2026 · 05:15 PM" },
    { className: "X-A", student: "Pooja Verma", rollNo: "17", status: "Late Submission", updatedAt: "10 May 2026 · 10:05 AM" },
    { className: "IX-B", student: "Ishita Meena", rollNo: "07", status: "Submitted", updatedAt: "10 May 2026 · 07:55 AM" },
    { className: "IX-B", student: "Rahul Jain", rollNo: "08", status: "Pending", updatedAt: "Not submitted yet" },
    { className: "IX-B", student: "Neha Saini", rollNo: "09", status: "Reviewed", updatedAt: "9 May 2026 · 06:10 PM" },
    { className: "IX-B", student: "Kunal Raj", rollNo: "10", status: "Submitted", updatedAt: "10 May 2026 · 09:12 AM" },
    { className: "VIII-A", student: "Student 01", rollNo: "01", status: "Submitted", updatedAt: "10 May 2026 · 08:20 AM" },
    { className: "VIII-A", student: "Student 02", rollNo: "02", status: "Pending", updatedAt: "Not submitted yet" },
    { className: "VIII-A", student: "Student 03", rollNo: "03", status: "Reviewed", updatedAt: "9 May 2026 · 04:50 PM" },
    { className: "VIII-A", student: "Student 04", rollNo: "04", status: "Late Submission", updatedAt: "10 May 2026 · 11:00 AM" },
  ]);

  useEffect(() => {
    void getStudents()
      .then((items) => {
        if (!items.length) return;
        setStudentDirectory(items);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!classOptions.includes(selectedClassName)) {
      setSelectedClassName(classOptions[0] ?? DEFAULT_CLASS_OPTIONS[0]);
    }
  }, [classOptions, selectedClassName]);

  const finalClass = classOptions.includes(selectedClassName)
    ? selectedClassName
    : classOptions[0] ?? DEFAULT_CLASS_OPTIONS[0];
  const { standard: className, section } = splitClassName(finalClass);
  const studentsForClass = studentDirectory
    .filter((student) => student.className === finalClass)
    .sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true }));
  const homeworkStatusList = statusRecords.filter((item) => item.className === finalClass);
  const visibleStudents = homeworkStatusList.length
    ? homeworkStatusList
    : studentsForClass.map((student) => ({
        className: finalClass,
        student: student.fullName,
        rollNo: student.rollNo,
        status: "Pending",
        updatedAt: "Not submitted yet",
      }));
  const [selectedStudentRollNo, setSelectedStudentRollNo] = useState(studentsForClass[0]?.rollNo ?? "");
  const [selectedStatus, setSelectedStatus] = useState("Submitted");

  const syncSelectedStudent = (nextClass: string) => {
    const nextStudents = statusRecords.filter((item) => item.className === nextClass);
    const firstStudent = nextStudents[0];
    if (firstStudent) {
      setSelectedStudentRollNo(firstStudent.rollNo);
      setSelectedStatus(firstStudent.status);
    } else {
      setSelectedStudentRollNo("");
      setSelectedStatus("Pending");
    }
  };

  return (
    <div>
      <p className="td-crumb">Teacher Â· Homework</p>
      <h1 className="td-page-title">Upload Homework</h1>
      <p className="td-page-sub">
        Fill all details, upload attachment, and manage each student&apos;s homework status.
      </p>

      <div className="td-panel">
        <div className="td-demo-grid-2">
          <label className="td-setting-row">
            <span>Class</span>
            <select
              className="td-select"
              value={className}
              onChange={(e) => {
                const nextClass = e.target.value;
                const nextFinalClass = buildClassName(nextClass, section);
                setSelectedClassName(nextFinalClass);
                syncSelectedStudent(nextFinalClass);
              }}
            >
              {Array.from(new Set(classOptions.map((item) => splitClassName(item).standard))).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="td-setting-row">
            <span>Section</span>
            <select
              className="td-select"
              value={section}
              onChange={(e) => {
                const nextSection = e.target.value;
                const nextFinalClass = buildClassName(className, nextSection);
                setSelectedClassName(nextFinalClass);
                syncSelectedStudent(nextFinalClass);
              }}
            >
              {Array.from(new Set(classOptions
                .filter((item) => splitClassName(item).standard === className)
                .map((item) => splitClassName(item).section))).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="td-setting-row">
            <span>Subject</span>
            <select className="td-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option>Mathematics</option>
              <option>Science</option>
              <option>English</option>
            </select>
          </label>
          <label className="td-setting-row">
            <span>Due Date</span>
            <input
              type="date"
              className="td-select"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>
        </div>

        <div className="td-setting-row">
          <span>Homework Title</span>
          <input
            className="td-select"
            style={{ width: "60%" }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="td-setting-row">
          <span>Description</span>
          <input
            className="td-select"
            style={{ width: "60%" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="td-setting-row">
          <span>Attach PDF/Image/File</span>
          <input
            type="file"
            className="td-select"
            style={{ width: "60%" }}
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? fileName)}
          />
        </div>

        <button
          type="button"
          className="td-btn-primary td-mt"
          onClick={async () => {
            try {
              await saveHomework({
              id: `${Date.now()}`,
              className: finalClass,
              section,
              subject,
              title,
              description,
              dueDate,
              fileName,
              teacherName: "Ms. Neha Sharma",
              createdAt: new Date().toISOString(),
              });
              toast(`Homework uploaded for ${finalClass} and synced to Student Portal`);
            } catch (error) {
              toast(error instanceof Error ? error.message : "Failed to upload homework");
            }
          }}
        >
          Upload Homework
        </button>
      </div>

      <div className="td-panel td-mt">
        <div className="td-panel-head">
          <h3>Change Student Homework Status</h3>
          <span className="td-muted">{finalClass} Â· {subject}</span>
        </div>
        <div className="td-demo-grid-3">
          <label className="td-field">
            <span>Choose Student</span>
            <select
              className="td-select td-input-full"
              value={selectedStudentRollNo}
              onChange={(e) => {
                const rollNo = e.target.value;
                setSelectedStudentRollNo(rollNo);
                const found = visibleStudents.find((item) => item.rollNo === rollNo);
                setSelectedStatus(found?.status ?? "Pending");
              }}
            >
              {visibleStudents.map((item) => (
                <option key={item.rollNo} value={item.rollNo}>
                  {item.student} ({item.rollNo})
                </option>
              ))}
            </select>
          </label>
          <label className="td-field">
            <span>Set Status</span>
            <select className="td-select td-input-full" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option>Pending</option>
              <option>Submitted</option>
              <option>Reviewed</option>
              <option>Late Submission</option>
            </select>
          </label>
          <div className="td-field">
            <span>Action</span>
            <button
              type="button"
              className="td-btn-primary"
              onClick={() => {
                if (!selectedStudentRollNo) {
                  toast("Please choose a student");
                  return;
                }
                setStatusRecords((prev) =>
                  prev.map((item) =>
                    item.className === finalClass && item.rollNo === selectedStudentRollNo
                      ? {
                          ...item,
                          status: selectedStatus,
                          updatedAt: new Date().toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }),
                        }
                      : item,
                  ),
                );
                const studentName = visibleStudents.find((item) => item.rollNo === selectedStudentRollNo)?.student ?? "Student";
                toast(`Homework status updated for ${studentName}`);
              }}
            >
              Update Status
            </button>
          </div>
        </div>
      </div>

      <div className="td-panel td-table-wrap td-mt">
        <div className="td-panel-head" style={{ padding: "1rem 1rem 0" }}>
          <h3 style={{ margin: 0 }}>Homework Status Grid</h3>
          <span className="td-muted">{finalClass} Â· {subject}</span>
        </div>
        <table className="td-data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Roll No</th>
              <th>Homework Status</th>
              <th>Last Update</th>
            </tr>
          </thead>
          <tbody>
            {visibleStudents.map((item) => (
              <tr key={item.rollNo}>
                <td>{item.student}</td>
                <td>{item.rollNo}</td>
                <td>{item.status}</td>
                <td>{item.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
type TeacherStudent = {
  studentId: string;
  password?: string;
  name: string;
  className: string;
  rollNo: string;
  gender: string;
  parentName: string;
  contact: string;
  performance: "Strong" | "Average" | "At risk";
};

const ALLOTTED_CLASSES = DEFAULT_CLASS_OPTIONS;

function TeacherStudentsInteractive({ toast }: { toast: ToastFn }) {
  const [selectedClass, setSelectedClass] = useState(DEFAULT_CLASS_OPTIONS[0]);
  const [students, setStudents] = useState<TeacherStudent[]>([]);

  const [mode, setMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TeacherStudent>({
    studentId: "",
    password: "1234",
    name: "",
    className: "X-A",
    rollNo: "",
    gender: "Male",
    parentName: "",
    contact: "",
    performance: "Average",
  });
  const classOptions = mergeClassOptions(
    students.map((student) => ({
      studentId: student.studentId,
      fullName: student.name,
      className: student.className,
      section: splitClassName(student.className).section,
      rollNo: student.rollNo,
      photo: "./demo-student-profile.png",
      parents: student.parentName ? [{ relation: "Parent", name: student.parentName, phone: student.contact }] : [],
      fees: {
        currentTermStatus: "Pending",
        currentTermNote: "",
        nextDueAmount: "0",
        nextDueLabel: "",
        history: [],
      },
    })),
    [selectedClass, form.className],
  );

  useEffect(() => {
    let ignore = false;
    async function hydrate() {
      try {
        const records = await getStudents();
        if (ignore) return;
        setStudents(mapStudentDirectoryToTeacherStudents(records));
      } catch (error) {
        if (!ignore) toast(error instanceof Error ? error.message : "Failed to load students");
      }
    }
    void hydrate();
    return () => {
      ignore = true;
    };
  }, [toast]);

  useEffect(() => {
    if (!classOptions.includes(selectedClass)) {
      setSelectedClass(classOptions[0] ?? DEFAULT_CLASS_OPTIONS[0]);
    }
  }, [classOptions, selectedClass]);

  const filtered = students.filter((s) => s.className === selectedClass);

  const resetForm = () => {
    setMode("add");
    setEditingId(null);
    setForm({
      studentId: "",
      password: "1234",
      name: "",
      className: selectedClass,
      rollNo: "",
      gender: "Male",
      parentName: "",
      contact: "",
      performance: "Average",
    });
  };

  const startEdit = (student: TeacherStudent) => {
    setMode("edit");
    setEditingId(student.studentId);
    setForm({
      studentId: student.studentId,
      password: "",
      name: student.name,
      className: student.className,
      rollNo: student.rollNo,
      gender: student.gender,
      parentName: student.parentName,
      contact: student.contact,
      performance: student.performance,
    });
  };

  return (
    <div>
      <p className="td-crumb">Teacher Â· Students</p>
      <h1 className="td-page-title">Student Records</h1>
      <p className="td-page-sub">
        Select your allotted class to view students. Add new students and edit existing
        details directly.
      </p>

      <div className="td-toolbar">
        <select
          className="td-select"
          value={selectedClass}
          onChange={(e) => {
            const v = e.target.value;
            setSelectedClass(v);
            setForm((prev) => ({ ...prev, className: v }));
            toast(`Showing students for ${v}`);
          }}
        >
          {classOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button type="button" className="td-btn-primary" onClick={resetForm}>
          + Add Student
        </button>
      </div>

      <div className="td-panel td-table-wrap">
        <table className="td-data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Class</th>
              <th>Roll No</th>
              <th>Gender</th>
              <th>Parent</th>
              <th>Contact</th>
              <th>Performance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length ? (
              filtered.map((s) => (
                <tr key={s.studentId}>
                  <td>{s.studentId}</td>
                  <td>{s.name}</td>
                  <td>{s.className}</td>
                  <td>{s.rollNo}</td>
                  <td>{s.gender}</td>
                  <td>{s.parentName}</td>
                  <td>{s.contact}</td>
                  <td>{s.performance}</td>
                  <td>
                    <button
                      type="button"
                      className="td-link-btn"
                      onClick={() => {
                        startEdit(s);
                        toast(`Editing ${s.name}`);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="td-muted">
                  No students found for this class.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="td-panel td-mt">
        <h3 className="td-h3">{mode === "add" ? "Add Student" : "Edit Student"}</h3>
        <div className="td-demo-grid-2">
          <label className="td-setting-row">
            <span>Student ID</span>
            <input
              className="td-select"
              value={form.studentId}
              placeholder="Auto-generated if left blank"
              onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
            />
          </label>
          <label className="td-setting-row">
            <span>Password</span>
            <input
              className="td-select"
              value={form.password || ""}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            />
          </label>
          <label className="td-setting-row">
            <span>Name</span>
            <input
              className="td-select"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </label>
          <label className="td-setting-row">
            <span>Class</span>
            <select
              className="td-select"
              value={form.className}
              onChange={(e) => setForm((p) => ({ ...p, className: e.target.value }))}
            >
              {classOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="td-setting-row">
            <span>Roll No</span>
            <input
              className="td-select"
              value={form.rollNo}
              onChange={(e) => setForm((p) => ({ ...p, rollNo: e.target.value }))}
            />
          </label>
          <label className="td-setting-row">
            <span>Gender</span>
            <select
              className="td-select"
              value={form.gender}
              onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </label>
          <label className="td-setting-row">
            <span>Parent Name</span>
            <input
              className="td-select"
              value={form.parentName}
              onChange={(e) => setForm((p) => ({ ...p, parentName: e.target.value }))}
            />
          </label>
          <label className="td-setting-row">
            <span>Contact</span>
            <input
              className="td-select"
              value={form.contact}
              onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))}
            />
          </label>
          <label className="td-setting-row">
            <span>Performance</span>
            <select
              className="td-select"
              value={form.performance}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  performance: e.target.value as TeacherStudent["performance"],
                }))
              }
            >
              <option>Strong</option>
              <option>Average</option>
              <option>At risk</option>
            </select>
          </label>
        </div>

        <div className="td-toolbar td-mt">
          <button
            type="button"
            className="td-btn-primary"
            onClick={async () => {
              if (!form.name.trim() || !form.rollNo.trim()) {
                toast("Name and Roll No are required");
                return;
              }
              try {
                const generatedStudentId =
                  form.studentId.trim() ||
                  `AN${new Date().getFullYear()}-${form.rollNo.trim().padStart(4, "0")}`;
                await saveStudent({
                  studentId: generatedStudentId,
                  password: form.password?.trim() || undefined,
                  fullName: form.name.trim(),
                  className: form.className,
                  section: form.className.split("-")[1] || "A",
                  rollNo: form.rollNo.trim(),
                  photo: "./demo-student-profile.png",
                  parents: form.parentName.trim()
                    ? [{ relation: "Parent", name: form.parentName.trim(), phone: form.contact.trim() }]
                    : [],
                  fees: {
                    currentTermStatus: "Pending",
                    currentTermNote: "",
                    nextDueAmount: "0",
                    nextDueLabel: "",
                    history: [],
                  },
                });
                const records = await getStudents();
                setStudents(mapStudentDirectoryToTeacherStudents(records));
                toast(
                  mode === "add"
                    ? `Student added. Login ID: ${generatedStudentId}, password: ${form.password || "1234"}`
                    : `Student ${form.name} updated`,
                );
                resetForm();
              } catch (error) {
                toast(error instanceof Error ? error.message : "Failed to save student");
              }
            }}
          >
            {mode === "add" ? "Save New Student" : "Update Student"}
          </button>
          {mode === "edit" ? (
            <button type="button" className="td-btn-secondary" onClick={resetForm}>
              Cancel Edit
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type TimetableRow = {
  id: string;
  period: string;
  className: string;
  subject: string;
  time: string;
};

function TeacherTimetableInteractive({ toast }: { toast: ToastFn }) {
  const [studentDirectory, setStudentDirectory] = useState<StudentDirectoryRecord[]>(FALLBACK_STUDENTS);
  const classOptions = mergeClassOptions(studentDirectory);
  const periodOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const timeOptions = [
    "08:00 AM - 09:00 AM",
    "09:05 AM - 10:00 AM",
    "10:40 AM - 11:30 AM",
    "11:35 AM - 12:20 PM",
    "12:25 PM - 01:10 PM",
  ];

  const [rows, setRows] = useState<TimetableRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [period, setPeriod] = useState(periodOptions[0]);
  const [className, setClassName] = useState(classOptions[0] ?? DEFAULT_CLASS_OPTIONS[0]);
  const [subject, setSubject] = useState("Mathematics");
  const [time, setTime] = useState(timeOptions[0]);

  const resetForm = () => {
    setEditingId(null);
    setPeriod(periodOptions[0]);
    setClassName(classOptions[0] ?? DEFAULT_CLASS_OPTIONS[0]);
    setSubject("Mathematics");
    setTime(timeOptions[0]);
  };

  useEffect(() => {
    void getStudents()
      .then((items) => {
        if (!items.length) return;
        setStudentDirectory(items);
      })
      .catch(() => {});
    void getTimetable()
      .then((items) =>
        setRows(
          items.map((item) => ({
            id: item.id,
            period: item.period,
            className: item.className,
            subject: item.subject,
            time: item.time,
          })),
        ),
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!classOptions.includes(className)) {
      setClassName(classOptions[0] ?? DEFAULT_CLASS_OPTIONS[0]);
    }
  }, [className, classOptions]);

  const onSave = async () => {
    try {
      const payload: TimetableRowRecord = {
        id: editingId || `TT-${Date.now()}`,
        className,
        period,
        subject,
        time,
        updatedAt: new Date().toISOString(),
      };

      const saved = await saveTimetableRow(payload);
      setRows((prev) => {
        const next = prev.filter((row) => row.id !== saved.id);
        next.push({
          id: saved.id,
          period: saved.period,
          className: saved.className,
          subject: saved.subject,
          time: saved.time,
        });
        return next.sort((a, b) => Number(a.period) - Number(b.period) || a.className.localeCompare(b.className));
      });
      toast(editingId ? "Timetable entry updated" : "Timetable entry added");
      resetForm();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to save timetable");
    }
  };

  return (
    <DemoPage title="Timetable" crumb="Teacher Â· Timetable">
      <div className="td-toolbar">
        <button type="button" className="td-btn-primary" onClick={onSave}>
          {editingId ? "Update Entry" : "Add Entry"}
        </button>
        {editingId ? (
          <button type="button" className="td-btn-secondary" onClick={resetForm}>
            Cancel Edit
          </button>
        ) : null}
      </div>

      <div className="td-panel">
        <div className="td-demo-grid-2">
          <label className="td-setting-row">
            <span>Period</span>
            <select className="td-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
              {periodOptions.map((p) => (
                <option key={p} value={p}>
                  Period {p}
                </option>
              ))}
            </select>
          </label>
          <label className="td-setting-row">
            <span>Class</span>
            <select className="td-select" value={className} onChange={(e) => setClassName(e.target.value)}>
              {classOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="td-setting-row">
            <span>Subject</span>
            <input className="td-select" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </label>
          <label className="td-setting-row">
            <span>Time</span>
            <select className="td-select" value={time} onChange={(e) => setTime(e.target.value)}>
              {timeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="td-panel td-table-wrap td-mt">
        <table className="td-data-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Class</th>
              <th>Subject</th>
              <th>Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.period}</td>
                <td>{r.className}</td>
                <td>{r.subject}</td>
                <td>{r.time}</td>
                <td>
                  <div className="td-action-ic">
                    <button
                      type="button"
                      className="td-ic-btn"
                      onClick={() => {
                        setEditingId(r.id);
                        setPeriod(r.period);
                        setClassName(r.className);
                        setSubject(r.subject);
                        setTime(r.time);
                        toast(`Editing period ${r.period}`);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DemoPage>
  );
}

function TeacherResultsInteractive({ toast }: { toast: ToastFn }) {
  const [studentDirectory, setStudentDirectory] = useState<StudentDirectoryRecord[]>(FALLBACK_STUDENTS);
  const classOptions = mergeClassOptions(studentDirectory);
  const [selectedClassName, setSelectedClassName] = useState(classOptions[0] ?? DEFAULT_CLASS_OPTIONS[0]);
  const [subject, setSubject] = useState("Mathematics");
  const [examType, setExamType] = useState<ExamType>("yearly");
  const [unitTestNumber, setUnitTestNumber] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState("Yearly Exam Result 2026");
  const [fileName, setFileName] = useState("yearly-result.pdf");
  const [sendToAll, setSendToAll] = useState(true);
  const [targetRollNo, setTargetRollNo] = useState("");
  const [studentNameQuery, setStudentNameQuery] = useState("");

  useEffect(() => {
    void getStudents()
      .then((items) => {
        if (!items.length) return;
        setStudentDirectory(items);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!classOptions.includes(selectedClassName)) {
      setSelectedClassName(classOptions[0] ?? DEFAULT_CLASS_OPTIONS[0]);
    }
  }, [classOptions, selectedClassName]);

  const finalClass = classOptions.includes(selectedClassName)
    ? selectedClassName
    : classOptions[0] ?? DEFAULT_CLASS_OPTIONS[0];
  const { section } = splitClassName(finalClass);
  const studentsForClass = studentDirectory
    .filter((student) => student.className === finalClass)
    .map((student) => ({ rollNo: student.rollNo, name: student.fullName }))
    .sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true }));
  const searchedStudents = studentsForClass.filter((s) =>
    s.name.toLowerCase().includes(studentNameQuery.trim().toLowerCase()),
  );

  return (
    <div>
      <p className="td-crumb">Teacher Â· Results</p>
      <h1 className="td-page-title">Upload Exam Results</h1>
      <p className="td-page-sub">
        Upload PDF/Image for Yearly, Half-Yearly, and Unit Tests. Students will see
        latest uploaded result in Student Portal.
      </p>

      <div className="td-panel">
        <div className="td-toolbar">
          <button
            type="button"
            className={examType === "yearly" ? "td-btn-primary" : "td-btn-secondary"}
            onClick={() => {
              setExamType("yearly");
              setTitle("Yearly Exam Result 2026");
            }}
          >
            Yearly Exam
          </button>
          <button
            type="button"
            className={examType === "half-yearly" ? "td-btn-primary" : "td-btn-secondary"}
            onClick={() => {
              setExamType("half-yearly");
              setTitle("Half-Yearly Result 2026");
            }}
          >
            Half-Yearly
          </button>
          <button
            type="button"
            className={examType === "unit-test" ? "td-btn-primary" : "td-btn-secondary"}
            onClick={() => {
              setExamType("unit-test");
              setTitle(`Unit Test ${unitTestNumber} Result`);
            }}
          >
            Unit Test
          </button>
          {examType === "unit-test" ? (
            <select
              className="td-select"
              value={unitTestNumber}
              onChange={(e) =>
                setUnitTestNumber(Number(e.target.value) as 1 | 2 | 3)
              }
            >
              <option value={1}>Unit Test 1</option>
              <option value={2}>Unit Test 2</option>
              <option value={3}>Unit Test 3</option>
            </select>
          ) : null}
        </div>

        <div className="td-demo-grid-2">
          <label className="td-setting-row">
            <span>Class</span>
            <select className="td-select" value={finalClass} onChange={(e) => setSelectedClassName(e.target.value)}>
              {classOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="td-setting-row">
            <span>Section</span>
            <input className="td-select" value={section} readOnly />
          </label>
          <label className="td-setting-row">
            <span>Subject</span>
            <select className="td-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option>Mathematics</option>
              <option>Science</option>
              <option>English</option>
            </select>
          </label>
          <label className="td-setting-row">
            <span>Exam Type</span>
            <input
              className="td-select"
              readOnly
              value={
                examType === "unit-test"
                  ? `Unit Test ${unitTestNumber}`
                  : examType === "half-yearly"
                    ? "Half-Yearly"
                    : "Yearly"
              }
            />
          </label>
          <label className="td-setting-row">
            <span>Roll No (Target Student)</span>
            <div style={{ display: "grid", gap: 8, width: "60%" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem" }}>
                <input
                  type="checkbox"
                  checked={sendToAll}
                  onChange={(e) => setSendToAll(e.target.checked)}
                />
                Send to all students
              </label>
              <input
                className="td-select"
                placeholder="Type roll no. e.g. 14"
                value={targetRollNo}
                disabled={sendToAll}
                onChange={(e) => setTargetRollNo(e.target.value)}
              />
            </div>
          </label>
          <label className="td-setting-row">
            <span>Search by Student Name</span>
            <div style={{ display: "grid", gap: 8, width: "60%" }}>
              <input
                className="td-select"
                placeholder="Type name for quick search"
                value={studentNameQuery}
                disabled={sendToAll}
                onChange={(e) => setStudentNameQuery(e.target.value)}
              />
              {!sendToAll && studentNameQuery.trim() ? (
                <div style={{ display: "grid", gap: 6 }}>
                  {searchedStudents.length ? (
                    searchedStudents.slice(0, 4).map((s) => (
                      <button
                        key={s.rollNo}
                        type="button"
                        className="td-btn-secondary"
                        style={{ textAlign: "left" }}
                        onClick={() => {
                          setTargetRollNo(s.rollNo);
                          setStudentNameQuery(s.name);
                          toast(`Selected ${s.name} (Roll ${s.rollNo})`);
                        }}
                      >
                        {s.name} â€” Roll {s.rollNo}
                      </button>
                    ))
                  ) : (
                    <span className="td-muted">No student found for this name.</span>
                  )}
                </div>
              ) : null}
            </div>
          </label>
        </div>

        <div className="td-setting-row">
          <span>Result Title</span>
          <input
            className="td-select"
            style={{ width: "60%" }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="td-setting-row">
          <span>Upload PDF/Image</span>
          <input
            type="file"
            accept=".pdf,image/*"
            className="td-select"
            style={{ width: "60%" }}
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? fileName)}
          />
        </div>

        <button
          type="button"
          className="td-btn-primary td-mt"
          onClick={async () => {
            if (!sendToAll && !targetRollNo.trim()) {
              toast("Please type/select a roll number");
              return;
            }
            try {
              await saveResultRecord({
                id: `${Date.now()}`,
                className: finalClass,
                section,
                subject,
                examType,
                unitTestNumber: examType === "unit-test" ? unitTestNumber : undefined,
                title,
                fileName,
                targetRollNo: sendToAll ? undefined : targetRollNo.trim(),
                teacherName: "Ms. Neha Sharma",
                createdAt: new Date().toISOString(),
              });
              toast(
                sendToAll
                  ? `Result uploaded for all students in ${finalClass}`
                  : `Result uploaded for Roll ${targetRollNo.trim()} in ${finalClass}`,
              );
            } catch (error) {
              toast(error instanceof Error ? error.message : "Failed to upload result");
            }
          }}
        >
          Upload Result
        </button>
      </div>
    </div>
  );
}

