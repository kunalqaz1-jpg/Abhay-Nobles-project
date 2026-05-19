"use client";

import { apiRequest } from "./api-base";

export type ExamType = "yearly" | "half-yearly" | "unit-test";

export type ResultRecord = {
  id: string;
  className: string;
  section: string;
  subject: string;
  examType: ExamType;
  unitTestNumber?: 1 | 2 | 3;
  title: string;
  fileName: string;
  targetRollNo?: string;
  teacherName: string;
  createdAt: string;
};

export async function saveResultRecord(record: ResultRecord) {
  return apiRequest<ResultRecord>("/results", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

export async function getLatestResultForClass(className: string) {
  const params = new URLSearchParams({ className });
  return apiRequest<ResultRecord | null>(`/results/latest?${params.toString()}`);
}

export async function getLatestResultForStudent(className: string, rollNo: string) {
  const params = new URLSearchParams({ className, rollNo });
  return apiRequest<ResultRecord | null>(`/results/latest?${params.toString()}`);
}
