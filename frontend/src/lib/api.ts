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

// Convert image URLs from backend to absolute, normalizing localhost or mismatched origins
export function toImageUrl(u?: string) {
  if (!u) return undefined;
  const apiOrigin = API_BASE.replace(/\/api\/?$/, '');

  try {
    // Absolute URL provided
    if (/^https?:\/\//i.test(u)) {
      const url = new URL(u);
      const api = new URL(apiOrigin);
      const path = url.pathname + (url.search || '');
      // If the stored absolute URL points to localhost or a different host, and looks like an asset path, rewrite to API origin
      const isLocalhost = /^(localhost|127\.0\.0\.1)$/i.test(url.hostname);
      const isForeignHost = url.host !== api.host;
      const isAssetPath = /^(\/uploads\/|\/assets\/|\/images\/)/i.test(url.pathname);
      if ((isLocalhost || isForeignHost) && isAssetPath) {
        return api.origin + path;
      }
      return u; // keep as-is
    }

    // Protocol-relative
    if (/^\/\//.test(u)) {
      const api = new URL(apiOrigin);
      return `${api.protocol}${u}`;
    }

    // Relative path
    const startsWithSlash = u.startsWith('/');
    return (startsWithSlash ? apiOrigin + u : apiOrigin + '/' + u);
  } catch {
    // Fallback: best-effort join
    const startsWithSlash = u.startsWith('/');
    return (startsWithSlash ? apiOrigin + u : apiOrigin + '/' + u);
  }
}
