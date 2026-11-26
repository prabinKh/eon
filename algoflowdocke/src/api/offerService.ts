import axiosInstance from "./axiosConfig";

export interface SpecialOffer {
  id: string;
  title: string;
  badge_text?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  images?: string[];
  discount_label?: string;
  coupon_code?: string;
  cta_text?: string;
  cta_link?: string;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export const offerService = {
  // Public store endpoint - returns only active offers with valid images
  async getAll(): Promise<SpecialOffer[]> {
    try {
      const response = await axiosInstance.get("/store/offers/");
      const data = response.data;
      if (Array.isArray(data)) {
        return (data as SpecialOffer[]).filter(o => o.image && o.image.trim() !== "");
      } else if (data && typeof data === "object" && "results" in data && Array.isArray((data as Record<string, unknown>).results)) {
        return ((data as Record<string, unknown>).results as SpecialOffer[]).filter(o => o.image && o.image.trim() !== "");
      }
      return [];
    } catch (error) {
      console.error("Error fetching special offers:", error);
      return [];
    }
  },

  // Admin endpoints
  async adminGetAll(): Promise<SpecialOffer[]> {
    try {
      const response = await axiosInstance.get("/admin/offers/");
      const data = response.data;
      if (Array.isArray(data)) {
        return data as SpecialOffer[];
      } else if (data && typeof data === "object" && "results" in data && Array.isArray((data as Record<string, unknown>).results)) {
        return (data as Record<string, unknown>).results as SpecialOffer[];
      }
      return [];
    } catch (error) {
      console.error("Error fetching admin offers:", error);
      return [];
    }
  },

  async adminCreate(data: Partial<SpecialOffer>): Promise<SpecialOffer> {
    const response = await axiosInstance.post("/admin/offers/", data);
    return response.data;
  },

  async adminUpdate(id: string, data: Partial<SpecialOffer>): Promise<SpecialOffer> {
    const response = await axiosInstance.put(`/admin/offers/${id}/`, data);
    return response.data;
  },

  async adminDelete(id: string): Promise<void> {
    await axiosInstance.delete(`/admin/offers/${id}/`);
  },

  async adminReorder(orders: { id: string; order: number }[]): Promise<SpecialOffer[]> {
    const response = await axiosInstance.post("/admin/offers/reorder/", { orders });
    return response.data;
  },

  async adminSeedExamples(): Promise<SpecialOffer[]> {
    const response = await axiosInstance.post("/admin/offers/seed_examples/");
    return response.data;
  }
};
