import { apiRequest } from "./api-base";

export type AttendanceStatus = "present" | "absent";

export type AttendanceEntry = {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  remark: string;
};

export type ClassAttendanceRecord = {
  className: string;
  date: string;
  teacherName: string;
  updatedAt: string;
  entries: AttendanceEntry[];
};

export async function saveClassAttendance(record: ClassAttendanceRecord) {
  return apiRequest<ClassAttendanceRecord>("/attendance/class", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

export async function getClassAttendance(className: string, date: string) {
  const params = new URLSearchParams({ className, date });
  return apiRequest<ClassAttendanceRecord | null>(`/attendance/class?${params.toString()}`);
}

export async function getLatestAttendanceForStudent(studentId: string) {
  return apiRequest<{
    record: ClassAttendanceRecord;
    entry: AttendanceEntry;
  } | null>(`/attendance/student/${encodeURIComponent(studentId)}/latest`);
}
