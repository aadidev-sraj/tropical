import { apiFetch, toImageUrl } from "./api";

export type BackendProduct = {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  price: number;
  description?: string;
  images?: string[];
  sizes?: string[];
};

export async function listProducts() {
  try {
    const res = await apiFetch<{ data: BackendProduct[] }>(`/products`);
    return res;
  } catch (error) {
    console.error('Error fetching products:', error);
    return { data: [] } as { data: BackendProduct[] };
  }
}

export async function getProduct(idOrSlug: string | number) {
  try {
    return await apiFetch<{ data: BackendProduct }>(`/products/${idOrSlug}`);
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error("Product not found");
  }
}

export function firstImageUrl(p?: BackendProduct | null): string | undefined {
  const u = p?.images && p.images[0];
  return toImageUrl(u);
}
