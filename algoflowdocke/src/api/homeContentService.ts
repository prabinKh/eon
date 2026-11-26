import axiosInstance from "./axiosConfig";

export interface FeatureItem {
  title: string;
  desc: string;
}

export interface WhyItem {
  title: string;
  desc: string;
  tag: string;
  icon: string;
}

export interface ServiceItem {
  title: string;
  desc: string;
  turnaround: string;
  icon: string;
}

export interface CounterItem {
  value: string;
  suffix: string;
  label: string;
  desc: string;
}

export interface ProductItem {
  id?: string;
  title: string;
  desc: string;
  image: string;
  link: string;
}

export interface HomePageContent {
  id?: string;
  // About / Brand Foundation
  about_badge: string;
  about_title: string;
  about_subtitle: string;
  about_description: string;
  about_image: string;
  about_features: FeatureItem[];
  about_cta_text: string;
  about_cta_link: string;
  about_secondary_cta_text: string;
  about_secondary_cta_link: string;

  // Why Choose Us
  why_badge: string;
  why_title: string;
  why_description: string;
  why_items: WhyItem[];

  // Authorized Technical Services
  services_badge: string;
  services_title: string;
  services_description: string;
  services_items: ServiceItem[];

  // Products & Solutions
  products_badge: string;
  products_title: string;
  products_description: string;
  products_cta_text: string;
  products_cta_link: string;
  products_items: ProductItem[];

  // Featured Hardware Products Catalog
  catalog_badge: string;
  catalog_title: string;
  catalog_description: string;
  catalog_cta_text: string;
  catalog_cta_link: string;

  // Counters
  counters: CounterItem[];
  updated_at?: string;
}

export const homeContentService = {
  async get(): Promise<HomePageContent | null> {
    try {
      const response = await axiosInstance.get("/store/home-content/");
      return response.data as HomePageContent;
    } catch (error) {
      console.error("Error fetching home content:", error);
      return null;
    }
  },

  async getAdmin(): Promise<HomePageContent | null> {
    try {
      const response = await axiosInstance.get("/admin/home-content/");
      return response.data as HomePageContent;
    } catch (error) {
      console.error("Error fetching admin home content:", error);
      return null;
    }
  },

  async update(data: Partial<HomePageContent>): Promise<HomePageContent> {
    const response = await axiosInstance.put("/admin/home-content/", data);
    return response.data as HomePageContent;
  }
};
