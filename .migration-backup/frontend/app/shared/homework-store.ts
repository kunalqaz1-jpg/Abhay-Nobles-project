"use client";

import { apiRequest } from "./api-base";

export type HomeworkRecord = {
  id: string;
  className: string;
  section: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  fileName: string;
  teacherName: string;
  createdAt: string;
};

export async function saveHomework(record: HomeworkRecord) {
  return apiRequest<HomeworkRecord>("/homework", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

export async function getLatestHomeworkForClass(className: string) {
  return apiRequest<HomeworkRecord | null>(`/homework/latest/${encodeURIComponent(className)}`);
}
