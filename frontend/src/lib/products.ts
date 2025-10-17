import { apiFetch } from "./api";
import { getProducts as strapiList, getProductBySlug as strapiGetBySlug } from "./strapi";

export type BackendProduct = {
  _id?: string;
  id?: string;
  strapiId?: number;
  name: string;
  slug: string;
  price: number;
  description?: string;
  images?: string[];
};

export async function listProducts() {
  // Try backend first
  try {
    const res = await apiFetch<{ data: BackendProduct[] }>(`/products`);
    if (Array.isArray(res?.data) && res.data.length > 0) return res;
  } catch {}

  // Fallback to Strapi if backend empty or failed
  try {
    const s = await strapiList("?populate=*");
    const data: BackendProduct[] = (s?.data || []).map((p) => {
      // Support flat (v5) and nested (v4) formats
      const a = p?.attributes || p || ({} as any);
      
      // Images: flat array or nested data
      let images: string[] = [];
      const imgField = a?.images || a?.image;
      if (Array.isArray(imgField) && imgField.length > 0 && imgField[0]?.url) {
        images = imgField.map((img: any) => img?.url).filter(Boolean);
      } else if (Array.isArray(imgField?.data)) {
        images = imgField.data.map((d: any) => d?.attributes?.url || d?.url).filter(Boolean);
      } else if (imgField?.data?.attributes?.url || imgField?.data?.url) {
        images = [imgField.data.attributes?.url || imgField.data.url];
      }
      const fullImages = images.map((u: string) => (String(u).startsWith("http") ? u : `${import.meta.env.VITE_STRAPI_URL || "http://localhost:1337"}${u}`));
      
      const price = typeof a?.price === "number" ? a.price : Number(a?.price) || 0;
      
      // Description: handle rich text blocks or plain string
      let desc = a?.description || a?.details || a?.summary || "";
      if (Array.isArray(desc)) {
        desc = desc.map((block: any) => 
          Array.isArray(block?.children) ? block.children.map((c: any) => c?.text || "").join("") : ""
        ).join("\n").trim();
      }
      if (typeof desc !== "string") desc = "";
      
      return {
        strapiId: p.id,
        name: a?.name || a?.title || "",
        slug: a?.slug || String(p.id),
        price,
        description: desc,
        images: fullImages,
      } as BackendProduct;
    });
    return { data };
  } catch (e) {
    // Final fallback: empty
    return { data: [] } as { data: BackendProduct[] };
  }
}

export async function getProduct(idOrSlug: string | number) {
  // Try backend first
  try {
    return await apiFetch<{ data: BackendProduct }>(`/products/${idOrSlug}`);
  } catch {}

  // Fallback to Strapi by slug (or numeric id as slug)
  try {
    const slug = String(idOrSlug);
    const sp = await strapiGetBySlug(slug);
    if (!sp) throw new Error("not found");
    const a = (sp as any).attributes || (sp as any) || {};
    
    // Images: flat array or nested data
    let images: string[] = [];
    const imgField = a?.images || a?.image;
    if (Array.isArray(imgField) && imgField.length > 0 && imgField[0]?.url) {
      images = imgField.map((img: any) => img?.url).filter(Boolean);
    } else if (Array.isArray(imgField?.data)) {
      images = imgField.data.map((d: any) => d?.attributes?.url || d?.url).filter(Boolean);
    } else if (imgField?.data?.attributes?.url || imgField?.data?.url) {
      images = [imgField.data.attributes?.url || imgField.data.url];
    }
    const fullImages = images.map((u: string) => (String(u).startsWith("http") ? u : `${import.meta.env.VITE_STRAPI_URL || "http://localhost:1337"}${u}`));
    
    const price = typeof a?.price === "number" ? a.price : Number(a?.price) || 0;
    
    // Description: handle rich text blocks or plain string
    let desc = a?.description || a?.details || a?.summary || "";
    if (Array.isArray(desc)) {
      desc = desc.map((block: any) => 
        Array.isArray(block?.children) ? block.children.map((c: any) => c?.text || "").join("") : ""
      ).join("\n").trim();
    }
    if (typeof desc !== "string") desc = "";
    
    return {
      data: {
        strapiId: (sp as any).id,
        name: a?.name || a?.title || "",
        slug: a?.slug || String((sp as any).id),
        price,
        description: desc,
        images: fullImages,
      },
    } as { data: BackendProduct };
  } catch (e) {
    throw new Error("Product not found");
  }
}

export function firstImageUrl(p?: BackendProduct | null): string | undefined {
  const u = p?.images && p.images[0];
  return u || undefined;
}
