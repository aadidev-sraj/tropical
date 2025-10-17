export const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || "http://localhost:1337";
export const STRAPI_TOKEN = import.meta.env.VITE_STRAPI_TOKEN as string | undefined;

function buildUrl(path: string) {
  return `${STRAPI_URL}${path}`;
}

export async function getProductById(id: number) {
  if (!id || Number.isNaN(id)) return null;
  // Strapi single by ID
  try {
    const json = await strapiFetch<{ data: Product }>(`/api/products/${id}?populate=*`);
    return json.data ?? null;
  } catch {
    // Fallback via filter if direct ID endpoint is restricted
    const list = await strapiFetch<{ data: Product[] }>(`/api/products?filters[id][$eq]=${id}&populate=*`);
    return list.data?.[0] ?? null;
  }
}

export async function strapiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (STRAPI_TOKEN) headers["Authorization"] = `Bearer ${STRAPI_TOKEN}`;

  const res = await fetch(buildUrl(path), { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export type StrapiImage = {
  url: string;
  alternativeText?: string;
};

export type Product = {
  id: number;
  attributes: {
    name: string;
    slug: string;
    price: number;
    description?: string;
    images?: { data: Array<{ id: number; attributes: StrapiImage }> };
    image?: { data: { id: number; attributes: StrapiImage } };
  };
};

export async function getProducts(params: string = "") {
  const query = params || "?populate=*";
  return strapiFetch<{ data: Product[] }>(`/api/products${query}`);
}

export async function getProductBySlug(slug: string) {
  const query = `/api/products?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`;
  const json = await strapiFetch<{ data: Product[] }>(query);
  return json.data?.[0] || null;
}

export function getFirstImageUrl(p?: Product | null): string | undefined {
  if (!p) return undefined;
  const img = p.attributes.images?.data?.[0]?.attributes?.url
    || p.attributes.image?.data?.attributes?.url;
  if (!img) return undefined;
  return img.startsWith("http") ? img : `${STRAPI_URL}${img}`;
}
