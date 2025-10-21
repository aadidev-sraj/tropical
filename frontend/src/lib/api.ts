export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || res.statusText);
  }
  return res.json();
}

// Convert relative image URLs from backend (e.g. /uploads/xyz.png) to absolute
export function toImageUrl(u?: string) {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  const origin = API_BASE.replace(/\/api\/?$/, '');
  return u.startsWith('/') ? origin + u : origin + '/' + u;
}
