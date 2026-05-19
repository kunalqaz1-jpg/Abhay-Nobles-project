"use client";

import { useEffect, useState } from "react";
import {
  getStudents,
  getTeachers,
  saveStudent,
  saveTeacher,
  type StudentDirectoryRecord,
} from "@/app/shared/directory-store";

type JoinedTeacher = {
  id: string;
  name: string;
  subject: string;
  qualification: string;
  joinDate: string;
  phone: string;
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
  },
  {
    id: "JT-102",
    name: "Rohan Patel",
    subject: "Computer Science",
    qualification: "MCA, B.Tech",
    joinDate: "08 May 2026",
    phone: "+91 98765 12002",
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
      { id: nextId, name: "", subject: "", qualification: "", joinDate: "", phone: "" },
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
        breadcrumb="Dashboard Â· Teachers"
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
          breadcrumb="Dashboard Â· Attendance"
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

    case "settings":
      return <SettingsInteractive toast={toast} />;

    default:
      return null;
  }
}
