import axiosInstance from "./axiosConfig";

export interface HeroSpec {
  id?: string;
  label: string;
  value: string;
}

export interface HeroContent {
  id?: string;
  title: string;
  subtitle: string;
  description?: string;
  image: string;
  background_image?: string;
  card_image?: string;
  video_url?: string;
  media_type?: "image" | "video";
  badge_text?: string;
  link?: string;
  buttonText?: string;
  cta_text?: string;
  cta_link?: string;
  specs: HeroSpec[];
  order?: number;
  is_active?: boolean;
  created_at?: string;
}

const mapSlide = (hero: any): HeroContent => {
  const bgImg = hero.background_image || hero.image || "";
  const cardImg = hero.card_image || "";
  const isVid = hero.media_type === "video" || 
    Boolean(hero.video_url) || 
    Boolean(bgImg && (bgImg.endsWith('.mp4') || bgImg.endsWith('.webm') || bgImg.includes('.mp4?')));

  return {
    id: hero.id,
    title: hero.title || "",
    subtitle: hero.subtitle || hero.description || "",
    description: hero.description || hero.subtitle || "",
    image: cardImg || hero.image || bgImg,
    background_image: bgImg,
    card_image: cardImg,
    video_url: hero.video_url || (isVid && bgImg.endsWith('.mp4') ? bgImg : ""),
    media_type: isVid ? "video" : "image",
    badge_text: hero.badge_text || "New Tech Arrival",
    link: hero.link || hero.cta_link || "/products",
    buttonText: hero.buttonText || hero.cta_text || "Explore Catalog",
    specs: Array.isArray(hero.specs) ? hero.specs : [],
    order: typeof hero.order === "number" ? hero.order : 1,
    is_active: hero.is_active !== false,
    created_at: hero.created_at,
  };
};



export const heroService = {
  // Public: get all active slides ordered by display order
  getAllSlides: async (options?: { company?: string }): Promise<HeroContent[]> => {
    try {
      const response = await axiosInstance.get("/store/hero-settings/", { params: options });
      const data = response.data;
      if (Array.isArray(data)) {
        return data.map(mapSlide);
      } else if (data && Array.isArray(data.results)) {
        return data.results.map(mapSlide);
      }
      return [];
    } catch (error) {
      console.error("Error fetching hero slides:", error);
      return [];
    }
  },

  // Public: backward compatibility for single slide
  getSettings: async (options?: { company?: string }): Promise<HeroContent | null> => {
    const slides = await heroService.getAllSlides(options);
    return slides.length > 0 ? slides[0] : null;
  },

  // Admin: get all slides
  adminGetAll: async (): Promise<HeroContent[]> => {
    try {
      const response = await axiosInstance.get("/admin/hero-settings/");
      const data = response.data;
      if (Array.isArray(data)) {
        return data.map(mapSlide);
      } else if (data && Array.isArray(data.results)) {
        return data.results.map(mapSlide);
      }
      return [];
    } catch (error) {
      console.error("Error fetching admin hero slides:", error);
      return [];
    }
  },

  adminCreate: async (data: Partial<HeroContent>): Promise<HeroContent> => {
    const response = await axiosInstance.post("/admin/hero-settings/", data);
    return mapSlide(response.data);
  },

  adminUpdate: async (id: string, data: Partial<HeroContent>): Promise<HeroContent> => {
    const response = await axiosInstance.patch(`/admin/hero-settings/${id}/`, data);
    return mapSlide(response.data);
  },

  adminDelete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/hero-settings/${id}/`);
  },

  adminReorder: async (orders: { id: string; order: number }[]): Promise<HeroContent[]> => {
    const response = await axiosInstance.post("/admin/hero-settings/reorder/", { orders });
    const data = response.data;
    if (Array.isArray(data)) return data.map(mapSlide);
    return [];
  },

  adminSeedExamples: async (): Promise<HeroContent[]> => {
    const response = await axiosInstance.post("/admin/hero-settings/seed_examples/");
    const data = response.data;
    if (Array.isArray(data)) return data.map(mapSlide);
    return [];
  },

  updateSettings: async (data: HeroContent): Promise<void> => {
    if (data.id) {
      await heroService.adminUpdate(data.id, data);
    } else {
      await heroService.adminCreate(data);
    }
  }
};
