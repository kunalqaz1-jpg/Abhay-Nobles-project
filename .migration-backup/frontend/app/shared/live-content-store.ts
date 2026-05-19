"use client";

import { apiRequest } from "./api-base";
import type { StudentDirectoryRecord } from "./directory-store";

export type NoticeRecord = {
  id: string;
  title: string;
  description: string;
  audience: string;
  className: string;
  teacherName: string;
  createdAt: string;
};

export type MessageRecord = {
  id: string;
  subject: string;
  body: string;
  audience: string;
  className: string;
  studentId?: string;
  studentName?: string;
  teacherName: string;
  sentAt: string;
};

export type StudyMaterialRecord = {
  id: string;
  title: string;
  className: string;
  fileName: string;
  videoUrl: string;
  resourceType: string;
  updatedAt: string;
};

export type TimetableRowRecord = {
  id: string;
  className: string;
  period: string;
  subject: string;
  time: string;
  updatedAt: string;
};

export type EventRecord = {
  id: string;
  className: string;
  title: string;
  description: string;
  eventDate: string;
  teacherName: string;
  createdAt: string;
};

export async function getNotices(className?: string) {
  const params = new URLSearchParams();
  if (className) params.set("className", className);
  return apiRequest<NoticeRecord[]>(`/notices${params.size ? `?${params.toString()}` : ""}`);
}

export async function saveNotice(record: NoticeRecord) {
  return apiRequest<NoticeRecord>("/notices", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

export async function getMessages(className?: string, studentId?: string) {
  const params = new URLSearchParams();
  if (className) params.set("className", className);
  if (studentId) params.set("studentId", studentId);
  return apiRequest<MessageRecord[]>(`/messages${params.size ? `?${params.toString()}` : ""}`);
}

export async function saveMessage(record: MessageRecord) {
  return apiRequest<MessageRecord>("/messages", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

export async function getMaterials(className?: string) {
  const params = new URLSearchParams();
  if (className) params.set("className", className);
  return apiRequest<StudyMaterialRecord[]>(`/materials${params.size ? `?${params.toString()}` : ""}`);
}

export async function saveMaterial(record: StudyMaterialRecord) {
  return apiRequest<StudyMaterialRecord>("/materials", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

export async function getTimetable(className?: string) {
  const params = new URLSearchParams();
  if (className) params.set("className", className);
  return apiRequest<TimetableRowRecord[]>(`/timetable${params.size ? `?${params.toString()}` : ""}`);
}

export async function saveTimetableRow(record: TimetableRowRecord) {
  return apiRequest<TimetableRowRecord>("/timetable", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

export async function getEvents(className?: string) {
  const params = new URLSearchParams();
  if (className) params.set("className", className);
  return apiRequest<EventRecord[]>(`/events${params.size ? `?${params.toString()}` : ""}`);
}

export async function saveEvent(record: EventRecord) {
  return apiRequest<EventRecord>("/events", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

export async function updateStudentFees(studentId: string, fees: StudentDirectoryRecord["fees"]) {
  return apiRequest<StudentDirectoryRecord>(`/students/${encodeURIComponent(studentId)}/fees`, {
    method: "POST",
    body: JSON.stringify({ fees }),
  });
}
