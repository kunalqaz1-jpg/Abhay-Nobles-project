import { apiRequest } from "./api-base";

export type FeeHistoryItem = {
  period: string;
  amount: string;
  status: string;
};

export type StudentFees = {
  currentTermStatus: string;
  currentTermNote: string;
  nextDueAmount: string;
  nextDueLabel: string;
  history: FeeHistoryItem[];
};

export type StudentParent = {
  relation: string;
  name: string;
  phone: string;
};

export type StudentDirectoryRecord = {
  studentId: string;
  fullName: string;
  className: string;
  section: string;
  rollNo: string;
  photo: string;
  parents: StudentParent[];
  fees: StudentFees;
};

export type StudentUpsertPayload = StudentDirectoryRecord & {
  password?: string;
};

export type TeacherDirectoryRecord = {
  teacherId: string;
  name: string;
  subject: string;
  qualification: string;
  joinDate: string;
  phone: string;
  assignedClasses: string[];
};

export async function getStudents() {
  return apiRequest<StudentDirectoryRecord[]>("/students");
}

export async function saveStudent(record: StudentUpsertPayload) {
  return apiRequest<StudentDirectoryRecord>("/students", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

export async function getTeachers() {
  return apiRequest<TeacherDirectoryRecord[]>("/teachers");
}

export async function saveTeacher(record: TeacherDirectoryRecord) {
  return apiRequest<TeacherDirectoryRecord>("/teachers", {
    method: "POST",
    body: JSON.stringify(record),
  });
}
