import axiosInstance from "./axiosConfig";

export interface CompanySolution {
  id: string;
  title: string;
  slug: string;
  category: string;
  tagline?: string;
  summary?: string;
  description?: string;
  icon?: string;
  image?: string;
  features?: string[];
  architecture_points?: string[];
  target_industries?: string[];
  recommended_products?: string[];
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export const solutionService = {
  // Public endpoints
  async getAll(params?: { category?: string; search?: string }): Promise<CompanySolution[]> {
    try {
      const response = await axiosInstance.get("/store/solutions/", { params });
      const data = response.data;
      if (Array.isArray(data)) {
        return data as CompanySolution[];
      } else if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as Record<string, unknown>).results)) {
        return (data as Record<string, unknown>).results as CompanySolution[];
      }
      return [] as CompanySolution[];
    } catch (error) {
      console.error("Error fetching solutions:", error);
      return [];
    }
  },

  async getBySlug(slug: string): Promise<CompanySolution | null> {
    try {
      const response = await axiosInstance.get(`/store/solutions/${slug}/`);
      return response.data as CompanySolution;
    } catch (error) {
      console.error(`Error fetching solution ${slug}:`, error);
      return null;
    }
  },

  // Admin endpoints
  async adminGetAll(params?: { search?: string }): Promise<CompanySolution[]> {
    try {
      const response = await axiosInstance.get("/admin/solutions/", { params });
      const data = response.data;
      if (Array.isArray(data)) {
        return data as CompanySolution[];
      } else if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as Record<string, unknown>).results)) {
        return (data as Record<string, unknown>).results as CompanySolution[];
      }
      return [] as CompanySolution[];
    } catch (error) {
      console.error("Error fetching admin solutions:", error);
      return [];
    }
  },

  async adminCreate(data: Partial<CompanySolution>): Promise<CompanySolution> {
    try {
      const response = await axiosInstance.post("/admin/solutions/", data);
      return response.data as CompanySolution;
    } catch (error) {
      console.error("Error creating solution:", error);
      throw error;
    }
  },

  async adminUpdate(id: string, data: Partial<CompanySolution>): Promise<CompanySolution> {
    try {
      const response = await axiosInstance.patch(`/admin/solutions/${id}/`, data);
      return response.data as CompanySolution;
    } catch (error) {
      console.error(`Error updating solution ${id}:`, error);
      throw error;
    }
  },

  async adminDelete(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/admin/solutions/${id}/`);
    } catch (error) {
      console.error(`Error deleting solution ${id}:`, error);
      throw error;
    }
  }
};
