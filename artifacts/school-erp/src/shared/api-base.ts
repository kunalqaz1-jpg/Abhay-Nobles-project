export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || "/api";

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // ignore parse errors and use default message
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}
