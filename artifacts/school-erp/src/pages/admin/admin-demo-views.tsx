

import { useEffect, useState } from "react";
import {
  getStudents,
  getTeachers,
  saveStudent,
  saveTeacher,
  type StudentDirectoryRecord,
} from "@/shared/directory-store";

type JoinedTeacher = {
  id: string;
  name: string;
  subject: string;
  qualification: string;
  joinDate: string;
  phone: string;
  password: string;
};

type EmployeeRecord = {
  id: string;
  name: string;
  role: string;
  department: string;
  joinDate: string;
  phone: string;
};

type TeacherAttendanceRecord = {
  id: string;
  name: string;
  monthLabel: string;
  attendancePercent: string;
  daysPresent: number;
  daysAbsent: number;
  weeklyRows: { week: string; present: number; absent: number }[];
  calendarDays: { day: number; status: "present" | "absent" | "muted"; offset?: number }[];
};

export type NavKey =
  | "dashboard"
  | "students"
  | "teachers"
  | "attendance"
  | "academics"
  | "exams"
  | "homework"
  | "fees"
  | "financial-reports"
  | "expenses"
  | "timetable"
  | "notices"
  | "documents"
  | "analytics"
  | "enquiries"
  | "gallery"
  | "settings";

type ToastFn = (message: string) => void;

const demoStudents = [
  { id: "SAN-1024", name: "Aarav Sharma", cls: "X-A", roll: "14", status: "Active" },
  { id: "SAN-1025", name: "Ishita Meena", cls: "IX-B", roll: "07", status: "Active" },
  { id: "SAN-1026", name: "Kabir Singh", cls: "XII-Sci", roll: "22", status: "Fee pending" },
  { id: "SAN-1027", name: "Neha Gupta", cls: "VIII-A", roll: "31", status: "Active" },
];

const demoTeachers = [
  { id: "T-401", name: "Dr. Meera Joshi", subject: "Physics", classes: "XI–XII", load: "18 hrs/wk" },
  { id: "T-402", name: "Rajesh Verma", subject: "Mathematics", classes: "IX–X", load: "20 hrs/wk" },
  { id: "T-403", name: "Sunita Rao", subject: "English", classes: "VI–X", load: "16 hrs/wk" },
];

const demoAttendance = [
  { cls: "X-A", present: 94, total: 96, day: "8 May 2026" },
  { cls: "IX-B", present: 38, total: 40, day: "8 May 2026" },
  { cls: "XII-Sci", present: 41, total: 44, day: "8 May 2026" },
];

const demoExams = [
  { name: "Pre-Board — Science Practical", grade: "XII", when: "22 May 2026 · 10:00 AM", hall: "Lab 2" },
  { name: "Unit Test — Mathematics", grade: "X", when: "15 May 2026 · 09:00 AM", hall: "Block A" },
];

const demoHomework = [
  { title: "Physics — Ray optics worksheet", cls: "XI", due: "12 May", submitted: "32/36" },
  { title: "English — Essay draft", cls: "IX-B", due: "11 May", submitted: "28/40" },
];

const demoFees = [
  { student: "Kabir Singh", cls: "XII-Sci", amount: "₹24,000", status: "Pending", term: "Term II" },
  { student: "Aarav Sharma", cls: "X-A", amount: "₹18,500", status: "Paid", term: "Term II" },
];

const demoExpenses = [
  { cat: "Laboratory supplies", amt: "₹1,24,000", when: "6 May 2026", by: "Accounts" },
  { cat: "Transport fuel", amt: "₹86,400", when: "4 May 2026", by: "Transport" },
];

const demoNotices = [
  { title: "PTM schedule — Class X", priority: "High", date: "10 May 2026" },
  { title: "Summer uniform effective 1 June", priority: "Normal", date: "8 May 2026" },
];

const demoDocs = [
  { name: "Grade X — Marksheet template.pdf", type: "PDF", updated: "7 May 2026" },
  { name: "Admission checklist 2026.docx", type: "Doc", updated: "5 May 2026" },
];

const initialJoinedTeachers: JoinedTeacher[] = [
  {
    id: "JT-101",
    name: "Anjali Sharma",
    subject: "Biology",
    qualification: "M.Sc., B.Ed.",
    joinDate: "06 May 2026",
    phone: "+91 98765 12001",
    password: "teacher123",
  },
  {
    id: "JT-102",
    name: "Rohan Patel",
    subject: "Computer Science",
    qualification: "MCA, B.Tech",
    joinDate: "08 May 2026",
    phone: "+91 98765 12002",
    password: "teacher123",
  },
];

const initialEmployees: EmployeeRecord[] = [
  {
    id: "EMP-201",
    name: "Kavita Singh",
    role: "Account Assistant",
    department: "Accounts",
    joinDate: "28 Apr 2026",
    phone: "+91 98765 22001",
  },
  {
    id: "EMP-202",
    name: "Mahesh Yadav",
    role: "Transport Supervisor",
    department: "Transport",
    joinDate: "03 May 2026",
    phone: "+91 98765 22002",
  },
];

const teacherAttendanceDirectory: TeacherAttendanceRecord[] = [
  {
    id: "T-401",
    name: "Dr. Meera Joshi",
    monthLabel: "May 2026",
    attendancePercent: "94%",
    daysPresent: 21,
    daysAbsent: 2,
    weeklyRows: [
      { week: "W1 May", present: 5, absent: 0 },
      { week: "W2 May", present: 5, absent: 1 },
      { week: "W3 May", present: 6, absent: 0 },
      { week: "W4 May", present: 5, absent: 1 },
    ],
    calendarDays: [
      { day: 1, status: "present", offset: 5 },
      { day: 2, status: "muted" },
      { day: 3, status: "muted" },
      { day: 4, status: "absent" },
      { day: 5, status: "present" },
      { day: 6, status: "present" },
      { day: 7, status: "absent" },
      { day: 8, status: "present" },
      { day: 9, status: "muted" },
      { day: 10, status: "muted" },
      { day: 11, status: "present" },
      { day: 12, status: "present" },
      { day: 13, status: "present" },
      { day: 14, status: "present" },
      { day: 15, status: "present" },
      { day: 16, status: "muted" },
      { day: 17, status: "muted" },
      { day: 18, status: "absent" },
      { day: 19, status: "present" },
      { day: 20, status: "present" },
      { day: 21, status: "present" },
      { day: 22, status: "present" },
      { day: 23, status: "muted" },
      { day: 24, status: "muted" },
      { day: 25, status: "present" },
      { day: 26, status: "present" },
      { day: 27, status: "present" },
      { day: 28, status: "present" },
      { day: 29, status: "absent" },
      { day: 30, status: "muted" },
    ],
  },
  {
    id: "T-402",
    name: "Rajesh Verma",
    monthLabel: "May 2026",
    attendancePercent: "91%",
    daysPresent: 20,
    daysAbsent: 2,
    weeklyRows: [
      { week: "W1 May", present: 4, absent: 1 },
      { week: "W2 May", present: 5, absent: 0 },
      { week: "W3 May", present: 6, absent: 0 },
      { week: "W4 May", present: 5, absent: 1 },
    ],
    calendarDays: [
      { day: 1, status: "present", offset: 5 },
      { day: 2, status: "muted" },
      { day: 3, status: "muted" },
      { day: 4, status: "present" },
      { day: 5, status: "present" },
      { day: 6, status: "present" },
      { day: 7, status: "absent" },
      { day: 8, status: "present" },
      { day: 9, status: "muted" },
      { day: 10, status: "muted" },
      { day: 11, status: "present" },
      { day: 12, status: "present" },
      { day: 13, status: "present" },
      { day: 14, status: "present" },
      { day: 15, status: "present" },
      { day: 16, status: "muted" },
      { day: 17, status: "muted" },
      { day: 18, status: "absent" },
      { day: 19, status: "present" },
      { day: 20, status: "present" },
      { day: 21, status: "present" },
      { day: 22, status: "present" },
      { day: 23, status: "muted" },
      { day: 24, status: "muted" },
      { day: 25, status: "present" },
      { day: 26, status: "present" },
      { day: 27, status: "present" },
      { day: 28, status: "present" },
      { day: 29, status: "muted" },
      { day: 30, status: "muted" },
    ],
  },
  {
    id: "T-403",
    name: "Sunita Rao",
    monthLabel: "May 2026",
    attendancePercent: "96%",
    daysPresent: 22,
    daysAbsent: 1,
    weeklyRows: [
      { week: "W1 May", present: 5, absent: 0 },
      { week: "W2 May", present: 6, absent: 0 },
      { week: "W3 May", present: 6, absent: 0 },
      { week: "W4 May", present: 5, absent: 1 },
    ],
    calendarDays: [
      { day: 1, status: "present", offset: 5 },
      { day: 2, status: "muted" },
      { day: 3, status: "muted" },
      { day: 4, status: "present" },
      { day: 5, status: "present" },
      { day: 6, status: "present" },
      { day: 7, status: "present" },
      { day: 8, status: "present" },
      { day: 9, status: "muted" },
      { day: 10, status: "muted" },
      { day: 11, status: "present" },
      { day: 12, status: "present" },
      { day: 13, status: "present" },
      { day: 14, status: "present" },
      { day: 15, status: "present" },
      { day: 16, status: "muted" },
      { day: 17, status: "muted" },
      { day: 18, status: "absent" },
      { day: 19, status: "present" },
      { day: 20, status: "present" },
      { day: 21, status: "present" },
      { day: 22, status: "present" },
      { day: 23, status: "muted" },
      { day: 24, status: "muted" },
      { day: 25, status: "present" },
      { day: 26, status: "present" },
      { day: 27, status: "present" },
      { day: 28, status: "present" },
      { day: 29, status: "present" },
      { day: 30, status: "muted" },
    ],
  },
];

export function DemoSectionHeader({
  title,
  subtitle,
  breadcrumb,
}: {
  title: string;
  subtitle: string;
  breadcrumb: string;
}) {
  return (
    <div className="ap-demo-head">
      <p className="ap-breadcrumb">{breadcrumb}</p>
      <h1 className="ap-demo-title">{title}</h1>
      <p className="ap-demo-sub">{subtitle}</p>
    </div>
  );
}

export function DemoToolbar({
  onPrimary,
  onSecondary,
  primaryLabel,
  secondaryLabel,
}: {
  onPrimary: () => void;
  onSecondary?: () => void;
  primaryLabel: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="ap-toolbar">
      <button type="button" className="ap-btn-demo-primary" onClick={onPrimary}>
        {primaryLabel}
      </button>
      {secondaryLabel && onSecondary ? (
        <button type="button" className="ap-btn-demo-secondary" onClick={onSecondary}>
          {secondaryLabel}
        </button>
      ) : null}
      <select className="ap-filter ap-filter-inline" aria-label="Filter demo">
        <option>All</option>
        <option>This week</option>
        <option>This month</option>
      </select>
    </div>
  );
}

function SettingsInteractive({ toast }: { toast: ToastFn }) {
  const [sms, setSms] = useState(true);
  const [maint, setMaint] = useState(false);

  return (
    <>
      <DemoSectionHeader
        breadcrumb="Dashboard · Settings"
        title="Institution settings"
        subtitle="Branding, roles, integrations — demo toggles only."
      />
      <div className="ap-panel ap-settings">
        <label className="ap-setting-row">
          <span>Academic year</span>
          <select className="ap-filter ap-filter-inline" aria-label="Academic year">
            <option>2025–26</option>
            <option>2026–27</option>
          </select>
        </label>
        <label className="ap-setting-row">
          <span>Enable parent SMS alerts</span>
          <input
            type="checkbox"
            className="ap-checkbox"
            checked={sms}
            onChange={(e) => {
              setSms(e.target.checked);
              toast(e.target.checked ? "SMS alerts enabled (demo)" : "SMS alerts disabled (demo)");
            }}
          />
        </label>
        <label className="ap-setting-row">
          <span>Maintenance mode</span>
          <input
            type="checkbox"
            className="ap-checkbox"
            checked={maint}
            onChange={(e) => {
              setMaint(e.target.checked);
              toast(e.target.checked ? "Maintenance mode ON (demo)" : "Maintenance mode OFF (demo)");
            }}
          />
        </label>
        <button type="button" className="ap-btn-demo-primary ap-mt" onClick={() => toast("Demo: Settings saved")}>
          Save changes (demo)
        </button>
      </div>
    </>
  );
}

function StudentsInteractive({ toast }: { toast: ToastFn }) {
  const [students, setStudents] = useState<StudentDirectoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    studentId: "",
    password: "",
    fullName: "",
    className: "",
    section: "",
    rollNo: "",
  });

  useEffect(() => {
    let ignore = false;

    async function hydrate() {
      try {
        const data = await getStudents();
        if (!ignore) setStudents(data);
      } catch (error) {
        if (!ignore) {
          toast(error instanceof Error ? error.message : "Failed to load students");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void hydrate();
    return () => {
      ignore = true;
    };
  }, [toast]);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      studentId: "",
      password: "",
      fullName: "",
      className: "",
      section: "",
      rollNo: "",
    });
  };

  const startEdit = (student: StudentDirectoryRecord) => {
    setEditingId(student.studentId);
    setForm({
      studentId: student.studentId,
      password: "",
      fullName: student.fullName,
      className: student.className,
      section: student.section,
      rollNo: student.rollNo,
    });
  };

  const onSave = async () => {
    try {
      const existing = students.find((item) => item.studentId === form.studentId);
      const saved = await saveStudent({
        studentId: form.studentId.trim(),
        password: form.password.trim() || undefined,
        fullName: form.fullName.trim(),
        className: form.className.trim(),
        section: form.section.trim(),
        rollNo: form.rollNo.trim(),
        photo: existing?.photo || "./demo-student-profile.png",
        parents: existing?.parents || [],
        fees:
          existing?.fees || {
            currentTermStatus: "Pending",
            currentTermNote: "",
            nextDueAmount: "0",
            nextDueLabel: "",
            history: [],
          },
      });
      setStudents((current) => {
        const next = current.filter((item) => item.studentId !== saved.studentId);
        return [...next, saved].sort((a, b) => a.className.localeCompare(b.className) || a.rollNo.localeCompare(b.rollNo));
      });
      toast(editingId ? `Student updated: ${saved.fullName}` : `Student added: ${saved.fullName}`);
      resetForm();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to save student");
    }
  };

  return (
    <>
      <DemoSectionHeader
        breadcrumb="Dashboard · Students"
        title="Student management"
        subtitle="Create portal-ready students here so the same records appear in the teacher dashboard and student portal."
      />
      <div className="ap-panel ap-settings">
        <div className="ap-setting-row">
          <span>Student ID</span>
          <input value={form.studentId} onChange={(e) => setForm((current) => ({ ...current, studentId: e.target.value }))} />
        </div>
        <div className="ap-setting-row">
          <span>Full name</span>
          <input value={form.fullName} onChange={(e) => setForm((current) => ({ ...current, fullName: e.target.value }))} />
        </div>
        <div className="ap-setting-row">
          <span>Class</span>
          <input value={form.className} onChange={(e) => setForm((current) => ({ ...current, className: e.target.value }))} placeholder="Example: X-A" />
        </div>
        <div className="ap-setting-row">
          <span>Section</span>
          <input value={form.section} onChange={(e) => setForm((current) => ({ ...current, section: e.target.value }))} />
        </div>
        <div className="ap-setting-row">
          <span>Roll no</span>
          <input value={form.rollNo} onChange={(e) => setForm((current) => ({ ...current, rollNo: e.target.value }))} />
        </div>
        <div className="ap-setting-row">
          <span>{editingId ? "New password (optional)" : "Portal password"}</span>
          <input value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} />
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button type="button" className="ap-btn-demo-primary" onClick={() => void onSave()}>
            {editingId ? "Update student" : "Add student"}
          </button>
          <button type="button" className="ap-btn-demo-secondary" onClick={resetForm}>
            Clear form
          </button>
        </div>
      </div>

      <div className="ap-panel ap-table-panel">
        <table className="ap-data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Class</th>
              <th>Section</th>
              <th>Roll</th>
              <th>Fee Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>Loading students...</td>
              </tr>
            ) : students.length ? (
              students.map((student) => (
                <tr key={student.studentId}>
                  <td>{student.studentId}</td>
                  <td>{student.fullName}</td>
                  <td>{student.className}</td>
                  <td>{student.section}</td>
                  <td>{student.rollNo}</td>
                  <td>
                    <span className={`ap-pill ${student.fees.currentTermStatus === "Paid" ? "ap-pill-ok" : "ap-pill-warn"}`}>
                      {student.fees.currentTermStatus || "Pending"}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="ap-link-btn" onClick={() => startEdit(student)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>No students found yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TeachersInteractive({ toast }: { toast: ToastFn }) {
  const [joinedTeachers, setJoinedTeachers] = useState<JoinedTeacher[]>(initialJoinedTeachers);
  const [employees, setEmployees] = useState<EmployeeRecord[]>(initialEmployees);
  const [rowDetail, setRowDetail] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function hydrate() {
      try {
        const records = await getTeachers();
        if (!ignore && records.length) {
          setJoinedTeachers(
            records.map((teacher) => ({
              id: teacher.teacherId,
              name: teacher.name,
              subject: teacher.subject,
              qualification: teacher.qualification,
              joinDate: teacher.joinDate,
              phone: teacher.phone,
              password: "",
            })),
          );
        }
      } catch (error) {
        if (!ignore) {
          toast(error instanceof Error ? error.message : "Failed to load teachers");
        }
      }
    }

    void hydrate();
    return () => {
      ignore = true;
    };
  }, [toast]);

  const updateJoinedTeacher = (id: string, field: keyof JoinedTeacher, value: string) => {
    setJoinedTeachers((current) =>
      current.map((teacher) => (teacher.id === id ? { ...teacher, [field]: value } : teacher)),
    );
  };

  const updateEmployee = (id: string, field: keyof EmployeeRecord, value: string) => {
    setEmployees((current) =>
      current.map((employee) => (employee.id === id ? { ...employee, [field]: value } : employee)),
    );
  };

  const addJoinedTeacher = () => {
    const nextId = `TCH-${joinedTeachers.length + 3001}`;
    setJoinedTeachers((current) => [
      ...current,
      { id: nextId, name: "", subject: "", qualification: "", joinDate: "", phone: "", password: "teacher123" },
    ]);
    setRowDetail(`Added new teacher card ${nextId}`);
    toast("New teacher card added");
  };

  const addEmployee = () => {
    const nextId = `EMP-${employees.length + 201}`;
    setEmployees((current) => [
      ...current,
      { id: nextId, name: "", role: "", department: "", joinDate: "", phone: "" },
    ]);
    setRowDetail(`Added new employee card ${nextId}`);
    toast("New employee card added");
  };

  const saveSection = async () => {
    try {
      await Promise.all(
        joinedTeachers
          .filter((teacher) => teacher.id && teacher.name && teacher.subject)
          .map((teacher) =>
            saveTeacher({
              teacherId: teacher.id,
              name: teacher.name,
              subject: teacher.subject,
              qualification: teacher.qualification,
              joinDate: teacher.joinDate,
              phone: teacher.phone,
              assignedClasses: [],
              password: teacher.password.trim() || undefined,
            }),
          ),
      );
      setRowDetail("Teacher records saved to shared API");
      toast("Teacher details saved");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to save teacher details");
    }
  };

  return (
    <>
      <DemoSectionHeader
        breadcrumb="Dashboard · Teachers"
        title="Teacher & employee management"
        subtitle="Add newly joined teachers, add other employees, and edit details directly in the grid."
      />
      <DemoToolbar
        primaryLabel="+ Add joined teacher"
        secondaryLabel="+ Add employee"
        onPrimary={addJoinedTeacher}
        onSecondary={addEmployee}
      />

      <div className="ap-staff-section">
        <div className="ap-panel">
          <div className="ap-staff-head">
            <div>
              <h3 className="ap-panel-title-sm">Newly joined teachers</h3>
              <p className="ap-muted-text">Update subject, qualification, joining date, and contact details.</p>
            </div>
            <button type="button" className="ap-btn-demo-secondary" onClick={() => void saveSection()}>
              Save teacher details
            </button>
          </div>
          <div className="ap-staff-grid">
            {joinedTeachers.map((teacher) => (
              <div key={teacher.id} className="ap-staff-card">
                <div className="ap-staff-card-top">
                  <strong>{teacher.id}</strong>
                  <span className="ap-pill ap-pill-ok">Teacher</span>
                </div>
                <label className="ap-staff-field">
                  <span>Name</span>
                  <input
                    value={teacher.name}
                    onChange={(e) => updateJoinedTeacher(teacher.id, "name", e.target.value)}
                    placeholder="Teacher name"
                  />
                </label>
                <label className="ap-staff-field">
                  <span>Subject</span>
                  <input
                    value={teacher.subject}
                    onChange={(e) => updateJoinedTeacher(teacher.id, "subject", e.target.value)}
                    placeholder="Subject"
                  />
                </label>
                <label className="ap-staff-field">
                  <span>Qualification</span>
                  <input
                    value={teacher.qualification}
                    onChange={(e) => updateJoinedTeacher(teacher.id, "qualification", e.target.value)}
                    placeholder="Qualification"
                  />
                </label>
                <label className="ap-staff-field">
                  <span>Join date</span>
                  <input
                    value={teacher.joinDate}
                    onChange={(e) => updateJoinedTeacher(teacher.id, "joinDate", e.target.value)}
                    placeholder="DD Mon YYYY"
                  />
                </label>
                <label className="ap-staff-field">
                  <span>Phone</span>
                  <input
                    value={teacher.phone}
                    onChange={(e) => updateJoinedTeacher(teacher.id, "phone", e.target.value)}
                    placeholder="+91"
                  />
                </label>
                <label className="ap-staff-field">
                  <span>Portal Password</span>
                  <input
                    type="text"
                    value={teacher.password}
                    onChange={(e) => updateJoinedTeacher(teacher.id, "password", e.target.value)}
                    placeholder="Required for teacher login"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="ap-panel">
          <div className="ap-staff-head">
            <div>
              <h3 className="ap-panel-title-sm">Other employees</h3>
              <p className="ap-muted-text">Add office, transport, accounts, or support staff and edit their details.</p>
            </div>
            <button type="button" className="ap-btn-demo-secondary" onClick={saveSection}>
              Save employee details
            </button>
          </div>
          <div className="ap-staff-grid">
            {employees.map((employee) => (
              <div key={employee.id} className="ap-staff-card">
                <div className="ap-staff-card-top">
                  <strong>{employee.id}</strong>
                  <span className="ap-pill ap-pill-warn">Employee</span>
                </div>
                <label className="ap-staff-field">
                  <span>Name</span>
                  <input
                    value={employee.name}
                    onChange={(e) => updateEmployee(employee.id, "name", e.target.value)}
                    placeholder="Employee name"
                  />
                </label>
                <label className="ap-staff-field">
                  <span>Role</span>
                  <input
                    value={employee.role}
                    onChange={(e) => updateEmployee(employee.id, "role", e.target.value)}
                    placeholder="Role"
                  />
                </label>
                <label className="ap-staff-field">
                  <span>Department</span>
                  <input
                    value={employee.department}
                    onChange={(e) => updateEmployee(employee.id, "department", e.target.value)}
                    placeholder="Department"
                  />
                </label>
                <label className="ap-staff-field">
                  <span>Join date</span>
                  <input
                    value={employee.joinDate}
                    onChange={(e) => updateEmployee(employee.id, "joinDate", e.target.value)}
                    placeholder="DD Mon YYYY"
                  />
                </label>
                <label className="ap-staff-field">
                  <span>Phone</span>
                  <input
                    value={employee.phone}
                    onChange={(e) => updateEmployee(employee.id, "phone", e.target.value)}
                    placeholder="+91"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {rowDetail ? <p className="ap-demo-hint">Last action: {rowDetail}</p> : null}
    </>
  );
}

// ─── GALLERY MANAGER ─────────────────────────────────────────────────────────

const GALLERY_CATS = [
  { label: "All Photos", val: "__all__" },
  { label: "Gallery – Campus", val: "gallery-campus" },
  { label: "Gallery – Events", val: "gallery-events" },
  { label: "Gallery – Sports", val: "gallery-sports" },
  { label: "Gallery – Art & Culture", val: "gallery-cultural" },
  { label: "Campus Facilities", val: "campus-facilities" },
  { label: "Student Life", val: "student-life" },
  { label: "Faculty Photos", val: "faculty" },
  { label: "About Photo", val: "about" },
];

interface GalleryItem { _id: string; title: string; alt: string; category: string; imageData: string; mimeType: string; }

function compressImage(file: File, maxPx = 1400, quality = 0.82): Promise<{ dataUrl: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxPx || h > maxPx) {
          if (w > h) { h = Math.round(h * maxPx / w); w = maxPx; }
          else { w = Math.round(w * maxPx / h); h = maxPx; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve({ dataUrl, mimeType: "image/jpeg" });
      };
      img.onerror = reject;
      img.src = ev.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface QueueItem {
  id: string;
  file: File;
  dataUrl: string;
  title: string;
  status: "pending" | "uploading" | "done" | "error";
  errorMsg?: string;
}

function GalleryManager({ toast }: { toast: (msg: string) => void }) {
  const [activeTab, setActiveTab] = useState<string>("gallery-campus");
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileInputRef = { current: null as HTMLInputElement | null };

  const API = (import.meta.env.VITE_API_BASE_URL as string) || "/api";
  const SESSION_KEY = "abhay_admin_token";
  const getToken = () => sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY) || "";

  const load = (cat: string) => {
    setLoading(true);
    const url = cat === "__all__" ? `${API}/gallery-images` : `${API}/gallery-images?category=${encodeURIComponent(cat)}`;
    fetch(url)
      .then((r) => r.json())
      .then((data: GalleryItem[]) => setImages(data))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(activeTab); }, [activeTab]);

  const addFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!arr.length) return;
    const newItems: QueueItem[] = await Promise.all(
      arr.map(async (file) => {
        const { dataUrl } = await compressImage(file);
        return {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          dataUrl,
          title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
          status: "pending" as const,
        };
      })
    );
    setQueue((prev) => [...prev, ...newItems]);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const removeFromQueue = (id: string) => setQueue((prev) => prev.filter((q) => q.id !== id));

  const updateQueueTitle = (id: string, title: string) =>
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, title } : q)));

  const uploadAll = async () => {
    const pending = queue.filter((q) => q.status === "pending");
    if (!pending.length) { toast("No photos queued"); return; }

    setUploadProgress({ done: 0, total: pending.length });

    let done = 0;
    for (const item of pending) {
      setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: "uploading" } : q));
      try {
        const body = {
          title: item.title,
          alt: item.title,
          category: activeTab,
          imageData: item.dataUrl,
          mimeType: "image/jpeg",
        };
        const res = await fetch(`${API}/gallery-images`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || "Upload failed");
        }
        setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: "done" } : q));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error";
        setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: "error", errorMsg: msg } : q));
      }
      done++;
      setUploadProgress({ done, total: pending.length });
    }

    const succeeded = queue.filter((q) => q.status === "done").length + done;
    toast(`Uploaded ${done} of ${pending.length} photo${pending.length !== 1 ? "s" : ""}`);
    setUploadProgress(null);
    // Remove successfully uploaded items from queue after a short delay
    setTimeout(() => {
      setQueue((prev) => prev.filter((q) => q.status !== "done"));
    }, 1200);
    load(activeTab);
  };

  const clearDone = () => setQueue((prev) => prev.filter((q) => q.status !== "done" && q.status !== "error"));

  const onDelete = async (id: string) => {
    if (!confirm("Delete this photo?")) return;
    try {
      await fetch(`${API}/gallery-images/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
      toast("Photo deleted");
      setImages((prev) => prev.filter((img) => img._id !== id));
    } catch {
      toast("Delete failed");
    }
  };

  const imgSrc = (img: GalleryItem) =>
    img.imageData.startsWith("data:") || img.imageData.startsWith("http") ? img.imageData : `data:${img.mimeType};base64,${img.imageData}`;

  const pendingCount = queue.filter((q) => q.status === "pending").length;
  const catLabel = GALLERY_CATS.find((c) => c.val === activeTab)?.label ?? activeTab;

  return (
    <>
      <DemoSectionHeader
        breadcrumb="Dashboard · Gallery Manager"
        title="Gallery Manager"
        subtitle="Upload multiple photos at once — drag & drop or select files, then upload all in one click."
      />

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {GALLERY_CATS.map((cat) => (
          <button
            key={cat.val}
            type="button"
            className={activeTab === cat.val ? "ap-btn-demo-primary" : "ap-filter"}
            style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}
            onClick={() => { setActiveTab(cat.val); setQueue([]); }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Upload Panel — hidden when viewing All Photos */}
      {activeTab === "__all__" && (
        <div className="ap-panel" style={{ marginBottom: "1.5rem", padding: "1rem 1.25rem", background: "#f8fafc", border: "1px dashed #cbd5e1" }}>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.88rem" }}>
            Select a specific category tab above to upload new photos.
          </p>
        </div>
      )}
      <div className="ap-panel" style={{ marginBottom: "1.5rem", padding: "1.25rem", display: activeTab === "__all__" ? "none" : undefined }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>
            Upload to → <span style={{ color: "var(--ap-accent, #4f46e5)", fontWeight: 400 }}>{catLabel}</span>
          </h3>
          {queue.length > 0 && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="button" className="ap-filter" style={{ fontSize: "0.78rem" }} onClick={clearDone}>
                Clear finished
              </button>
              <button
                type="button"
                className="ap-btn-demo-primary"
                style={{ fontSize: "0.82rem", padding: "0.4rem 1rem", opacity: pendingCount === 0 ? 0.5 : 1 }}
                disabled={pendingCount === 0 || !!uploadProgress}
                onClick={uploadAll}
              >
                {uploadProgress
                  ? `Uploading ${uploadProgress.done}/${uploadProgress.total}…`
                  : `Upload All (${pendingCount})`}
              </button>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {uploadProgress && (
          <div style={{ marginBottom: "1rem", background: "#f1f5f9", borderRadius: 6, overflow: "hidden", height: 8 }}>
            <div style={{ height: "100%", background: "var(--ap-accent, #4f46e5)", width: `${Math.round((uploadProgress.done / uploadProgress.total) * 100)}%`, transition: "width 0.3s" }} />
          </div>
        )}

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById("gal-bulk-input")?.click()}
          style={{
            border: `2px dashed ${isDragOver ? "var(--ap-accent,#4f46e5)" : "#d1d5db"}`,
            borderRadius: 10,
            padding: "2rem",
            textAlign: "center",
            cursor: "pointer",
            background: isDragOver ? "rgba(79,70,229,0.04)" : "#fafafa",
            transition: "all 0.15s",
            marginBottom: queue.length ? "1.25rem" : 0,
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🖼️</div>
          <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem", color: "#374151" }}>
            Drag & drop photos here, or click to select
          </p>
          <p style={{ margin: "0.3rem 0 0", fontSize: "0.78rem", color: "#9ca3af" }}>
            Select multiple images at once · auto-compressed before upload
          </p>
        </div>
        <input
          id="gal-bulk-input"
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={onFileInputChange}
          ref={(el) => { fileInputRef.current = el; }}
        />

        {/* Queue grid */}
        {queue.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "0.85rem" }}>
            {queue.map((item) => (
              <div
                key={item.id}
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  border: `1.5px solid ${item.status === "done" ? "#22c55e" : item.status === "error" ? "#ef4444" : item.status === "uploading" ? "#a5b4fc" : "#e5e7eb"}`,
                  background: "#fff",
                  position: "relative",
                }}
              >
                <div style={{ height: 100, background: "#f3f4f6", overflow: "hidden" }}>
                  <img src={item.dataUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: item.status === "uploading" ? 0.6 : 1, transition: "opacity 0.2s" }} />
                  {item.status === "uploading" && (
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.4)" }}>
                      <div style={{ width: 28, height: 28, border: "3px solid #e5e7eb", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    </div>
                  )}
                  {item.status === "done" && (
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(34,197,94,0.18)" }}>
                      <span style={{ fontSize: "1.8rem" }}>✓</span>
                    </div>
                  )}
                  {item.status === "error" && (
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(239,68,68,0.15)", padding: "0.4rem" }}>
                      <span style={{ fontSize: "1.2rem" }}>⚠️</span>
                      <span style={{ fontSize: "0.65rem", color: "#dc2626", textAlign: "center", marginTop: 2 }}>{item.errorMsg}</span>
                    </div>
                  )}
                  {item.status === "pending" && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFromQueue(item.id); }}
                      style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", width: 22, height: 22, borderRadius: "50%", fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                    >×</button>
                  )}
                </div>
                <div style={{ padding: "0.4rem" }}>
                  <input
                    className="ap-input"
                    placeholder="Title"
                    value={item.title}
                    disabled={item.status !== "pending"}
                    onChange={(e) => updateQueueTitle(item.id, e.target.value)}
                    style={{ fontSize: "0.75rem", padding: "0.3rem 0.5rem" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Existing Images */}
      <div className="ap-panel" style={{ padding: "1.25rem" }}>
        <h3 style={{ margin: "0 0 1rem", fontSize: "0.95rem", fontWeight: 600 }}>
          Current Photos ({images.length})
        </h3>
        {loading ? (
          <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem" }}>Loading…</p>
        ) : images.length === 0 ? (
          <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem" }}>No photos yet in this category. Upload some above.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: "1rem" }}>
            {images.map((img) => (
              <div key={img._id} style={{ position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "1", background: "#f3f4f6" }}>
                {activeTab === "__all__" && (
                  <div style={{ position: "absolute", top: 4, left: 4, zIndex: 2, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: "0.6rem", fontWeight: 600, padding: "2px 6px", borderRadius: 4, maxWidth: "80%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {GALLERY_CATS.find(c => c.val === img.category)?.label ?? img.category}
                  </div>
                )}
                <img
                  src={imgSrc(img)}
                  alt={img.alt || img.title}
                  loading="lazy"
                  onClick={() => setLightbox(imgSrc(img))}
                  style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in", display: "block" }}
                />
                <div
                  style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", transition: "background 0.2s", display: "flex", alignItems: "flex-end" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.35)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0)")}
                >
                  <button
                    type="button"
                    onClick={() => onDelete(img._id)}
                    style={{ position: "absolute", top: 6, right: 6, background: "#ef4444", border: "none", color: "#fff", width: 26, height: 26, borderRadius: "50%", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}
                  >×</button>
                  {img.title && (
                    <span style={{ padding: "0.3rem 0.5rem", fontSize: "0.7rem", color: "#fff", lineHeight: 1.3, textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>{img.title}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", cursor: "zoom-out" }}
        >
          <img src={lightbox} alt="preview" style={{ maxWidth: "90vw", maxHeight: "88vh", objectFit: "contain", borderRadius: 8 }} onClick={(e) => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 40, height: 40, borderRadius: "50%", fontSize: "1.4rem", cursor: "pointer" }}>×</button>
        </div>
      )}
    </>
  );
}

export function AdminDemoView({ nav, toast }: { nav: NavKey; toast: ToastFn }) {
  const [rowDetail, setRowDetail] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teacherAttendanceDirectory[0].id);

  if (nav === "dashboard") return null;

  const onView = (label: string) => {
    setRowDetail(label);
    toast(`Demo: ${label}`);
  };

  const selectedTeacherAttendance =
    teacherAttendanceDirectory.find((item) => item.id === selectedTeacherId) ?? teacherAttendanceDirectory[0];

  if (nav === "students") return <StudentsInteractive toast={toast} />;
  if (nav === "teachers") return <TeachersInteractive toast={toast} />;
  if (nav === "attendance") {
    return (
      <>
        <DemoSectionHeader
          breadcrumb="Dashboard · Attendance"
          title="Attendance"
          subtitle="Monthly attendance summary with weekly overview and calendar tracking."
        />
        <div className="ap-att-toolbar">
          <label className="ap-att-teacher-select">
            <span>Select teacher</span>
            <select
              className="ap-filter"
              value={selectedTeacherId}
              onChange={(e) => {
                setSelectedTeacherId(e.target.value);
                const nextTeacher = teacherAttendanceDirectory.find((item) => item.id === e.target.value);
                if (nextTeacher) toast(`Viewing attendance for ${nextTeacher.name}`);
              }}
            >
              {teacherAttendanceDirectory.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="ap-att-stats">
          {[
            { value: selectedTeacherAttendance.attendancePercent, label: `${selectedTeacherAttendance.monthLabel} - Present` },
            { value: String(selectedTeacherAttendance.daysPresent), label: "Days Present" },
            { value: String(selectedTeacherAttendance.daysAbsent), label: "Days Absent" },
          ].map((card) => (
            <div key={card.label} className="ap-att-stat-card">
              <strong>{card.value}</strong>
              <span>{card.label}</span>
            </div>
          ))}
        </div>
        <div className="ap-att-layout">
          <div className="ap-panel ap-att-panel">
            <div className="ap-att-panel-head">
              <h3>Monthly Overview</h3>
              <button type="button" className="ap-btn-demo-secondary" onClick={() => toast("Monthly attendance exported (demo)")}>
                Export
              </button>
            </div>
            <p className="ap-muted-text ap-att-note">Attendance is recorded daily. Contact class teacher for discrepancy.</p>
            <div className="ap-table-panel">
              <table className="ap-data-table ap-att-table">
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Present</th>
                    <th>Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTeacherAttendance.weeklyRows.map((row) => (
                    <tr key={row.week}>
                      <td>{row.week}</td>
                      <td>{row.present}</td>
                      <td>{row.absent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="ap-panel ap-att-panel">
            <div className="ap-att-panel-head">
              <h3>{`Calendar - ${selectedTeacherAttendance.monthLabel}`}</h3>
              <button type="button" className="ap-btn-demo-secondary" onClick={() => toast("Calendar synced (demo)")}>
                Sync
              </button>
            </div>
            <div className="ap-att-calendar-head">
              {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="ap-att-calendar">
              {selectedTeacherAttendance.calendarDays.map((item) => (
                <div
                  key={item.day}
                  className={`ap-att-day ap-att-day-${item.status}`}
                  style={item.offset ? { gridColumnStart: item.offset + 1 } : undefined}
                >
                  {item.day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  switch (nav as string) {
    case "students":
      return (
        <>
          <DemoSectionHeader
            breadcrumb="Dashboard · Students"
            title="Student management"
            subtitle="Demo records — add, edit, and track learners (review UI only)."
          />
          <DemoToolbar
            primaryLabel="+ Add student (demo)"
            secondaryLabel="Export CSV (demo)"
            onPrimary={() => toast("Demo: Add student form would open")}
            onSecondary={() => toast("Demo: Export started")}
          />
          <div className="ap-panel ap-table-panel">
            <table className="ap-data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Roll</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {demoStudents.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.name}</td>
                    <td>{s.cls}</td>
                    <td>{s.roll}</td>
                    <td>
                      <span className={`ap-pill ${s.status === "Active" ? "ap-pill-ok" : "ap-pill-warn"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="ap-link-btn" onClick={() => onView(`Open profile · ${s.name}`)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rowDetail ? <p className="ap-demo-hint">Last action: {rowDetail}</p> : null}
        </>
      );

    case "teachers":
      if (false) return <TeachersInteractive toast={toast} />;
      return (
        <>
          <DemoSectionHeader
            breadcrumb="Dashboard · Teachers"
            title="Teacher management"
            subtitle="Assign subjects, classes, and monitor workload (demo)."
          />
          <DemoToolbar
            primaryLabel="+ Add teacher (demo)"
            secondaryLabel="Assign class (demo)"
            onPrimary={() => toast("Demo: Add teacher")}
            onSecondary={() => toast("Demo: Assign class wizard")}
          />
          <div className="ap-panel ap-table-panel">
            <table className="ap-data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Classes</th>
                  <th>Load</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {demoTeachers.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.name}</td>
                    <td>{t.subject}</td>
                    <td>{t.classes}</td>
                    <td>{t.load}</td>
                    <td>
                      <button type="button" className="ap-link-btn" onClick={() => onView(`Teacher profile · ${t.name}`)}>
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );

    case "attendance":
      return (
        <>
          <DemoSectionHeader
            breadcrumb="Dashboard · Attendance"
            title="Attendance overview"
            subtitle="Class-wise presence for today (demo snapshot)."
          />
          <DemoToolbar
            primaryLabel="Mark attendance (demo)"
            onPrimary={() => toast("Demo: Opens class attendance grid")}
          />
          <div className="ap-panel ap-table-panel">
            <table className="ap-data-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Present</th>
                  <th>Total</th>
                  <th>Rate</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {demoAttendance.map((r) => (
                  <tr key={r.cls}>
                    <td>{r.cls}</td>
                    <td>{r.present}</td>
                    <td>{r.total}</td>
                    <td>{Math.round((r.present / r.total) * 100)}%</td>
                    <td>{r.day}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );

    case "academics":
      return (
        <>
          <DemoSectionHeader
            breadcrumb="Dashboard · Academics"
            title="Academic management"
            subtitle="Curriculum, syllabi, and class performance (demo)."
          />
          <div className="ap-demo-grid-2">
            <div className="ap-panel">
              <h3 className="ap-panel-title-sm">Classes</h3>
              <ul className="ap-demo-list">
                <li>Grade VI–VIII — NCERT mapped · Term II</li>
                <li>Grade IX–X — Board pattern · Internal assessments on track</li>
                <li>Grade XI–XII — Science stream · Lab hours 94% utilized</li>
              </ul>
              <button type="button" className="ap-link-btn" onClick={() => toast("Demo: Open syllabus manager")}>
                Manage syllabus →
              </button>
            </div>
            <div className="ap-panel">
              <h3 className="ap-panel-title-sm">Quick stats</h3>
              <p className="ap-stat-line">
                <strong>42</strong> <span>active classes</span>
              </p>
              <p className="ap-stat-line">
                <strong>128</strong> <span>subjects scheduled this week</span>
              </p>
            </div>
          </div>
        </>
      );

    case "exams":
      return (
        <>
          <DemoSectionHeader
            breadcrumb="Dashboard · Exams"
            title="Exam scheduling"
            subtitle="Upcoming assessments and halls (demo)."
          />
          <DemoToolbar primaryLabel="+ Schedule exam (demo)" onPrimary={() => toast("Demo: New exam slot")} />
          <div className="ap-panel">
            {demoExams.map((e) => (
              <div key={e.name} className="ap-event ap-event-flat">
                <div>
                  <p className="ap-event-name">{e.name}</p>
                  <small className="ap-muted-text">
                    {e.grade} · {e.when} · {e.hall}
                  </small>
                </div>
                <button type="button" className="ap-btn-demo-secondary" onClick={() => onView(`Edit ${e.name}`)}>
                  Edit
                </button>
              </div>
            ))}
          </div>
        </>
      );

    case "homework":
      return (
        <>
          <DemoSectionHeader
            breadcrumb="Dashboard · Homework"
            title="Homework & assignments"
            subtitle="Track submissions and deadlines (demo)."
          />
          <DemoToolbar primaryLabel="+ New assignment (demo)" onPrimary={() => toast("Demo: Assignment composer")} />
          <div className="ap-panel ap-table-panel">
            <table className="ap-data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Class</th>
                  <th>Due</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {demoHomework.map((h) => (
                  <tr key={h.title}>
                    <td>{h.title}</td>
                    <td>{h.cls}</td>
                    <td>{h.due}</td>
                    <td>{h.submitted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );

    case "fees":
      return (
        <>
          <DemoSectionHeader
            breadcrumb="Dashboard · Fee Management"
            title="Fee collection"
            subtitle="Pending and completed payments (demo)."
          />
          <DemoToolbar
            primaryLabel="Record payment (demo)"
            secondaryLabel="Send reminder (demo)"
            onPrimary={() => toast("Demo: Payment entry")}
            onSecondary={() => toast("Demo: Reminder queued")}
          />
          <div className="ap-panel ap-table-panel">
            <table className="ap-data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Amount</th>
                  <th>Term</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {demoFees.map((f) => (
                  <tr key={f.student}>
                    <td>{f.student}</td>
                    <td>{f.cls}</td>
                    <td>{f.amount}</td>
                    <td>{f.term}</td>
                    <td>
                      <span className={`ap-pill ${f.status === "Paid" ? "ap-pill-ok" : "ap-pill-warn"}`}>{f.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );

    case "financial-reports":
      return (
        <>
          <DemoSectionHeader
            breadcrumb="Dashboard · Financial Reports"
            title="Financial reports"
            subtitle="Income, expense, and reconciliation (demo PDFs)."
          />
          <div className="ap-demo-grid-2">
            {["Monthly P&L", "Fee reconciliation", "Salary ledger", "GST summary"].map((r) => (
              <button
                key={r}
                type="button"
                className="ap-report-card"
                onClick={() => toast(`Demo: Download ${r}`)}
              >
                <strong>{r}</strong>
                <span>PDF · Demo</span>
              </button>
            ))}
          </div>
        </>
      );

    case "expenses":
      return (
        <>
          <DemoSectionHeader
            breadcrumb="Dashboard · Expenses"
            title="Expense tracking"
            subtitle="Operational spend by category (demo)."
          />
          <DemoToolbar primaryLabel="+ Add expense (demo)" onPrimary={() => toast("Demo: Expense form")} />
          <div className="ap-panel ap-table-panel">
            <table className="ap-data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {demoExpenses.map((x) => (
                  <tr key={x.cat + x.when}>
                    <td>{x.cat}</td>
                    <td>{x.amt}</td>
                    <td>{x.when}</td>
                    <td>{x.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );

    case "timetable":
      return (
        <>
          <DemoSectionHeader
            breadcrumb="Dashboard · Timetable"
            title="Timetable management"
            subtitle="Master schedule preview (demo)."
          />
          <div className="ap-panel">
            <table className="ap-data-table ap-timetable">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Mon</th>
                  <th>Tue</th>
                  <th>Wed</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Math · X-A</td>
                  <td>Science · IX-B</td>
                  <td>English · VIII-A</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Physics · XII</td>
                  <td>Hindi · X-A</td>
                  <td>CS Lab · XI</td>
                </tr>
              </tbody>
            </table>
            <button type="button" className="ap-link-btn ap-mt" onClick={() => toast("Demo: Open full timetable editor")}>
              Open editor →
            </button>
          </div>
        </>
      );

    case "notices":
      return (
        <>
          <DemoSectionHeader
            breadcrumb="Dashboard · Notices"
            title="School notices"
            subtitle="Broadcast to staff, students, or parents (demo)."
          />
          <DemoToolbar primaryLabel="+ Compose notice (demo)" onPrimary={() => toast("Demo: Notice composer")} />
          <div className="ap-panel">
            {demoNotices.map((n) => (
              <div key={n.title} className="ap-notice-row">
                <div>
                  <p className="ap-event-name">{n.title}</p>
                  <small className="ap-muted-text">{n.date}</small>
                </div>
                <span className={`ap-pill ${n.priority === "High" ? "ap-pill-bad" : "ap-pill-ok"}`}>{n.priority}</span>
                <button type="button" className="ap-link-btn" onClick={() => onView(`Preview · ${n.title}`)}>
                  Preview
                </button>
              </div>
            ))}
          </div>
        </>
      );

    case "documents":
      return (
        <>
          <DemoSectionHeader
            breadcrumb="Dashboard · Documents"
            title="Document repository"
            subtitle="Circulars, marksheets, and admissions (demo)."
          />
          <DemoToolbar primaryLabel="Upload file (demo)" onPrimary={() => toast("Demo: File picker")} />
          <div className="ap-panel ap-table-panel">
            <table className="ap-data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {demoDocs.map((d) => (
                  <tr key={d.name}>
                    <td>{d.name}</td>
                    <td>{d.type}</td>
                    <td>{d.updated}</td>
                    <td>
                      <button type="button" className="ap-link-btn" onClick={() => toast(`Demo: Download ${d.name}`)}>
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );

    case "analytics":
      return (
        <>
          <DemoSectionHeader
            breadcrumb="Dashboard · Analytics"
            title="Analytics & insights"
            subtitle="Trends and cohort performance (demo widgets)."
          />
          <div className="ap-demo-grid-3">
            <div className="ap-panel ap-metric-card">
              <small>Retention risk</small>
              <strong>3.2%</strong>
              <span className="ap-muted-text">Students flagged this month</span>
            </div>
            <div className="ap-panel ap-metric-card">
              <small>Fee collection velocity</small>
              <strong>+11%</strong>
              <span className="ap-muted-text">Vs last month</span>
            </div>
            <div className="ap-panel ap-metric-card">
              <small>Teacher utilization</small>
              <strong>91%</strong>
              <span className="ap-muted-text">Scheduled hours</span>
            </div>
          </div>
          <button type="button" className="ap-btn-demo-primary ap-mt" onClick={() => toast("Demo: Open full BI dashboard")}>
            Open advanced analytics (demo)
          </button>
        </>
      );

    case "enquiries":
      return <EnquiriesView toast={toast} />;

    case "gallery":
      return <GalleryManager toast={toast} />;

    case "settings":
      return <SettingsInteractive toast={toast} />;

    default:
      return null;
  }
}

// ─── ENQUIRIES VIEW ───────────────────────────────────────────────────────────

type AdmissionRow = {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  email: string;
  classApplied: string;
  message: string;
  status: string;
  createdAt: string;
};

type ContactRow = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

function EnquiriesView({ toast }: { toast: ToastFn }) {
  const [tab, setTab] = useState<"admissions" | "contacts">("admissions");
  const [admissions, setAdmissions] = useState<AdmissionRow[]>([]);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandId, setExpandId] = useState<string | null>(null);

  const token = (() => { try { return sessionStorage.getItem("abhay_admin_token") ?? ""; } catch { return ""; } })();
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admissions", { headers: authHeader }).then((r) => r.json()),
      fetch("/api/contacts", { headers: authHeader }).then((r) => r.json()),
    ])
      .then(([adm, con]) => {
        setAdmissions(Array.isArray(adm) ? adm : []);
        setContacts(Array.isArray(con) ? con : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setAdmissions((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
        toast(`Status updated to "${status}"`);
      }
    } catch {
      toast("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  function fmtDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return iso; }
  }

  const statusColor: Record<string, { bg: string; color: string }> = {
    pending:   { bg: "#ffedd5", color: "#c2410c" },
    contacted: { bg: "#dbeafe", color: "#1d4ed8" },
    admitted:  { bg: "#dcfce7", color: "#15803d" },
    rejected:  { bg: "#fee2e2", color: "#dc2626" },
  };

  return (
    <>
      <DemoSectionHeader
        breadcrumb="Dashboard · Enquiries"
        title="Enquiries"
        subtitle="Admission enquiries and contact messages submitted from the school website."
      />

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        <button
          type="button"
          className={tab === "admissions" ? "ap-btn-demo-primary" : "ap-btn-demo-secondary"}
          onClick={() => setTab("admissions")}
        >
          Admission Enquiries ({admissions.length})
        </button>
        <button
          type="button"
          className={tab === "contacts" ? "ap-btn-demo-primary" : "ap-btn-demo-secondary"}
          onClick={() => setTab("contacts")}
        >
          Contact Messages ({contacts.length})
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--ap-muted)" }}>Loading enquiries…</div>
      ) : tab === "admissions" ? (
        admissions.length === 0 ? (
          <div className="ap-panel" style={{ padding: "2rem", textAlign: "center", color: "var(--ap-muted)" }}>
            No admission enquiries yet. They will appear here when parents submit the form on the website.
          </div>
        ) : (
          <div className="ap-panel ap-table-panel">
            <table className="ap-data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Parent / Phone</th>
                  <th>Class</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {admissions.map((a) => {
                  const sc = statusColor[a.status] ?? { bg: "#f1f5f9", color: "#64748b" };
                  return (
                    <>
                      <tr key={a.id} style={{ cursor: "pointer" }} onClick={() => setExpandId(expandId === a.id ? null : a.id)}>
                        <td><strong style={{ fontSize: "0.8125rem" }}>{a.studentName}</strong></td>
                        <td>
                          <span style={{ display: "block", fontSize: "0.8125rem" }}>{a.parentName || "—"}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--ap-muted)" }}>{a.phone}</span>
                        </td>
                        <td style={{ fontSize: "0.8125rem" }}>{a.classApplied || "—"}</td>
                        <td style={{ fontSize: "0.75rem", color: "var(--ap-muted)", whiteSpace: "nowrap" }}>{fmtDate(a.createdAt)}</td>
                        <td>
                          <span className="ap-pill" style={{ background: sc.bg, color: sc.color }}>
                            {a.status}
                          </span>
                        </td>
                        <td>
                          <select
                            className="ap-filter"
                            style={{ fontSize: "0.75rem", padding: "0.3rem 0.5rem" }}
                            value={a.status}
                            disabled={updatingId === a.id}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateStatus(a.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="admitted">Admitted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                      {expandId === a.id && (
                        <tr key={`${a.id}-exp`}>
                          <td colSpan={6} style={{ background: "#f8fafc", padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "var(--ap-muted)" }}>
                            <strong style={{ color: "var(--ap-text)" }}>Email:</strong> {a.email || "—"} &nbsp;·&nbsp;
                            <strong style={{ color: "var(--ap-text)" }}>Message:</strong> {a.message || "—"}
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        contacts.length === 0 ? (
          <div className="ap-panel" style={{ padding: "2rem", textAlign: "center", color: "var(--ap-muted)" }}>
            No contact messages yet.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {contacts.map((c) => (
              <div key={c.id} className="ap-panel" style={{ padding: "1rem 1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div>
                    <strong style={{ fontSize: "0.875rem" }}>{c.fullName}</strong>
                    {c.subject && <span style={{ marginLeft: "0.75rem", fontSize: "0.75rem", color: "var(--ap-muted)" }}>Re: {c.subject}</span>}
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "var(--ap-muted)" }}>{fmtDate(c.createdAt)}</span>
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--ap-text)", marginBottom: "0.5rem", lineHeight: 1.6 }}>{c.message}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--ap-muted)" }}>
                  {c.phone && <span>📞 {c.phone} &nbsp;·&nbsp;</span>}
                  {c.email && <span>✉️ {c.email}</span>}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </>
  );
}
