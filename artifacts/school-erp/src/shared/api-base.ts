export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || "/api";

function getStoredToken() {
  if (typeof window === "undefined") return "";

  try {
    const path = window.location.pathname;
    const teacherToken = sessionStorage.getItem("abhay_teacher_token") ?? "";
    const adminToken = sessionStorage.getItem("abhay_admin_token") ?? "";
    const studentToken = localStorage.getItem("abhay_student_token") ?? "";

    if (path.startsWith("/admin")) return adminToken || teacherToken || studentToken;
    if (path.startsWith("/teacher")) return teacherToken || adminToken || studentToken;
    if (path.startsWith("/student")) return studentToken || teacherToken || adminToken;

    return adminToken || teacherToken || studentToken;
  } catch {
    return "";
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error || body?.message) message = body.error || body.message;
    } catch {
      // ignore parse errors and use default message
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}
