import { apiFetch } from "./api";

export type FeaturedItem = {
  _id: string;
  strapiId?: number;
  images: string[]; // Array of image URLs
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export async function listFeatured() {
  return apiFetch<{ data: FeaturedItem[] }>(`/featured`);
}
