import { useState, useEffect } from "react";
import { 
  Save, 
  Upload, 
  Plus, 
  Trash2, 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  Wrench, 
  Layers, 
  TrendingUp, 
  Eye, 
  RefreshCw,
  Package 
} from "lucide-react";
import { homeContentService, type HomePageContent, type FeatureItem, type WhyItem, type ServiceItem, type CounterItem, type ProductItem } from "@/api/homeContentService";
import { uploadService } from "@/api/uploadService";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export const HomePageSettings = () => {
  const [activeTab, setActiveTab] = useState<"about" | "why" | "services" | "catalog" | "products" | "counters">("about");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<HomePageContent>({
    about_badge: "BRAND FOUNDATION",
    about_title: "One Trusted Partner for IT, Security & Business Solutions.",
    about_subtitle: "Technology Distribution for Nepal’s Business Ecosystem",
    about_description: "EON Technology is a dedicated B2B technology distribution partner connecting world-class global technology brands with Nepal’s dealers, system integrators, and business customers. We make hardware access, technical specifications, and channel support easier through one trusted partner across IT • Security • Networking • Audio.",
    about_image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    about_features: [
      { title: "100% Genuine Guaranteed", desc: "Official manufacturer warranties and direct distribution" },
      { title: "Authorized Service Center", desc: "Certified technicians, original spare parts, and fast turnaround" }
    ],
    about_cta_text: "Become an EON Channel Partner",
    about_cta_link: "/solutions",
    about_secondary_cta_text: "Contact EON Technology",
    about_secondary_cta_link: "/service-center",

    why_badge: "ENTERPRISE EXCELLENCE",
    why_title: "Why Nepal’s Technology Channel Chooses EON",
    why_description: "Engineered for uncompromising reliability, official distribution warranties, fast RMA processing, and certified engineer support.",
    why_items: [
      { title: "Official Brand Warranties", desc: "100% genuine hardware with verified manufacturer backing and direct RMA pathways.", tag: "Authorized", icon: "ShieldCheck" },
      { title: "Scalable Infrastructure", desc: "Turnkey enterprise servers, SAN storage, optical networking, and 4K surveillance.", tag: "Enterprise", icon: "Cpu" },
      { title: "Certified Component RMA Center", desc: "Official in-house component maintenance facility ensuring minimum downtime.", tag: "Service Hub", icon: "Wrench" },
      { title: "Dedicated B2B Channel Support", desc: "Pre-sales engineering consultations, solution architecture, and prompt quotation.", tag: "Partner First", icon: "Users" }
    ],

    services_badge: "AUTHORIZED TECHNICAL SERVICES",
    services_title: "Component Maintenance & Technical Support",
    services_description: "Certified component-level diagnosis, hardware warranty RMA processing, enterprise surveillance SLAs, and rapid turnaround.",
    services_items: [
      { title: "Component-Level Micro Repair", desc: "Precision BGA chip rework, motherboard capacitor diagnostics, and power rail restoration.", turnaround: "24-48h Priority", icon: "Wrench" },
      { title: "Enterprise Surveillance SLA", desc: "On-site NVR/XVR maintenance, camera calibration, optical cleaning, and firmware compliance.", turnaround: "Same-Day Dispatch", icon: "ShieldCheck" },
      { title: "Structured Cabling & Fiber Splicing", desc: "OTDR testing, core-alignment fusion splicing, and structured rack cabling certification.", turnaround: "Scheduled Deployment", icon: "Network" },
      { title: "Official Warranty & RMA Processing", desc: "Direct manufacturer RMA claim fulfillment, instant DOA replacements, and status tracking.", turnaround: "Rapid Exchange", icon: "CheckCircle2" }
    ],

    products_badge: "PRODUCTS",
    products_title: "Powering Possibilities With Complete IT Solutions",
    products_description: "EON Technology offers a wide range of products from mobile to computing products, servers, storage, networking, security, surveillance, GIS, databases, video conferencing etc.",
    products_cta_text: "View More",
    products_cta_link: "/solutions",
    products_items: [
      {
        id: "enterprise-it",
        title: "Enterprise IT Solutions",
        desc: "We assist businesses of all sizes in achieving digital transformation.",
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
        link: "/solutions/enterprise-it-datacenter-solutions"
      },
      {
        id: "surveillance",
        title: "Surveillance Security and Virtual Collaboration",
        desc: "We offer comprehensive security solutions that ensure enhanced protection for your property.",
        image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80",
        link: "/solutions/surveillance-ai-security-collaboration"
      },
      {
        id: "telecom",
        title: "Telecom and Broadband",
        desc: "We provide the widest broadband coverage in Nepal, delivering the highest traffic and unmatched connectivity.",
        image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80",
        link: "/solutions/telecom-optical-broadband-networks"
      },
      {
        id: "computing",
        title: "Computer, Accessories and Peripherals",
        desc: "We deliver essential, cutting-edge computer solutions that seamlessly support modern lifestyles.",
        image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80",
        link: "/solutions/computer-gaming-hardware-peripherals"
      },
      {
        id: "appliances",
        title: "Domestic and Commercial Appliances",
        desc: "We offer a diverse range of household and commercial appliances, providing modern and efficient solutions for everyday living.",
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
        link: "/solutions/commercial-interactive-smart-displays"
      },
      {
        id: "specializations",
        title: "Specializations and Software Solutions",
        desc: "We bring together a team of dedicated experts, committed to delivering exceptional ICT services and solutions.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
        link: "/solutions/specializations-turnkey-solutions"
      }
    ],

    catalog_badge: "OFFICIAL PRODUCT CATALOG",
    catalog_title: "Genuine Hardware & Products Portfolio",
    catalog_description: "Explore official manufacturer warranty products across Dahua, CP Plus, Ant Esports, Intex, and Bestor directly available for Nepal's IT channel.",
    catalog_cta_text: "Explore Full Catalog",
    catalog_cta_link: "/category/all",

    counters: [
      { value: "18", suffix: "+", label: "Years Channel Leadership", desc: "Dedicated B2B tech distribution in Nepal" },
      { value: "500", suffix: "+", label: "Active Dealer Network", desc: "Trusted partners across all provinces" },
      { value: "4300", suffix: "+", label: "Genuine SKU Catalog", desc: "IT, security, networking and audio" },
      { value: "99.8", suffix: "%", label: "SLA Turnaround Rate", desc: "Fast RMA fulfillment and support" }
    ]
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const data = await homeContentService.getAdmin();
      if (data) {
        setFormData(prev => ({
          ...prev,
          ...data,
          catalog_badge: data.catalog_badge || prev.catalog_badge,
          catalog_title: data.catalog_title || prev.catalog_title,
          catalog_description: data.catalog_description || prev.catalog_description,
          catalog_cta_text: data.catalog_cta_text || prev.catalog_cta_text,
          catalog_cta_link: data.catalog_cta_link || prev.catalog_cta_link,
          about_features: (data.about_features && data.about_features.length > 0) ? data.about_features : prev.about_features,
          why_items: (data.why_items && data.why_items.length > 0) ? data.why_items : prev.why_items,
          services_items: (data.services_items && data.services_items.length > 0) ? data.services_items : prev.services_items,
          products_items: (data.products_items && Array.isArray(data.products_items) && data.products_items.length > 0) ? data.products_items : prev.products_items,
          counters: (data.counters && data.counters.length > 0) ? data.counters : prev.counters,
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load home page content");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await homeContentService.update(formData);
      toast.success("Home page & About page content updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadService.uploadImage(file, `home/about_${Date.now()}`);
      setFormData(prev => ({ ...prev, about_image: url }));
      toast.success("About image uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Feature item helpers
  const handleAddFeature = () => {
    setFormData(prev => ({
      ...prev,
      about_features: [...prev.about_features, { title: "New Feature", desc: "Feature description" }]
    }));
  };

  const handleUpdateFeature = (index: number, field: "title" | "desc", value: string) => {
    setFormData(prev => {
      const updated = [...prev.about_features];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, about_features: updated };
    });
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      about_features: prev.about_features.filter((_, i) => i !== index)
    }));
  };

  // Why Item helpers
  const handleAddWhyItem = () => {
    setFormData(prev => ({
      ...prev,
      why_items: [...prev.why_items, { title: "Pillar Title", desc: "Pillar description", tag: "Highlight", icon: "ShieldCheck" }]
    }));
  };

  const handleUpdateWhyItem = (index: number, field: keyof WhyItem, value: string) => {
    setFormData(prev => {
      const updated = [...prev.why_items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, why_items: updated };
    });
  };

  const handleRemoveWhyItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      why_items: prev.why_items.filter((_, i) => i !== index)
    }));
  };

  // Services Item helpers
  const handleAddServiceItem = () => {
    setFormData(prev => ({
      ...prev,
      services_items: [...prev.services_items, { title: "Service Title", desc: "Service description", turnaround: "24-48h", icon: "Wrench" }]
    }));
  };

  const handleUpdateServiceItem = (index: number, field: keyof ServiceItem, value: string) => {
    setFormData(prev => {
      const updated = [...prev.services_items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, services_items: updated };
    });
  };

  const handleRemoveServiceItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services_items: prev.services_items.filter((_, i) => i !== index)
    }));
  };

  // Products items helpers
  const handleAddProductItem = () => {
    setFormData(prev => ({
      ...prev,
      products_items: [
        ...(prev.products_items || []),
        {
          id: `item-${Date.now()}`,
          title: "New Solution",
          desc: "Description of the product solution.",
          image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
          link: "/solutions"
        }
      ]
    }));
  };

  const handleUpdateProductItem = (index: number, field: keyof ProductItem, value: string) => {
    setFormData(prev => {
      const updated = [...(prev.products_items || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, products_items: updated };
    });
  };

  const handleRemoveProductItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products_items: (prev.products_items || []).filter((_, i) => i !== index)
    }));
  };

  // Counter helpers
  const handleAddCounter = () => {
    setFormData(prev => ({
      ...prev,
      counters: [...prev.counters, { value: "100", suffix: "+", label: "Metric Label", desc: "Sub description" }]
    }));
  };

  const handleUpdateCounter = (index: number, field: keyof CounterItem, value: string) => {
    setFormData(prev => {
      const updated = [...prev.counters];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, counters: updated };
    });
  };

  const handleRemoveCounter = (index: number) => {
    setFormData(prev => ({
      ...prev,
      counters: prev.counters.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Home & About Page Content Editor
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Easily edit the About page, Brand Foundation, Why Choose Us, Products showcase, and Services sections displayed on your website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/about"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent/80 border border-border text-xs font-bold transition-colors"
          >
            <Eye size={14} />
            <span>Preview Page</span>
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === "about"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Building2 size={16} />
          <span>Brand Foundation / About</span>
        </button>

        <button
          onClick={() => setActiveTab("why")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === "why"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <ShieldCheck size={16} />
          <span>Why Choose Us</span>
        </button>

        <button
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === "services"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Wrench size={16} />
          <span>Authorized Services</span>
        </button>

        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === "catalog"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Package size={16} />
          <span>Hardware Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === "products"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Layers size={16} />
          <span>Company Solutions</span>
        </button>

        <button
          onClick={() => setActiveTab("counters")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === "counters"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <TrendingUp size={16} />
          <span>Impact Counters</span>
        </button>
      </div>

      {/* Tab 1: Brand Foundation / About */}
      {activeTab === "about" && (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Section Pre-Title / Badge
              </label>
              <input
                type="text"
                value={formData.about_badge}
                onChange={e => setFormData({ ...formData, about_badge: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-accent/40 border border-border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. BRAND FOUNDATION"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Subtitle
              </label>
              <input
                type="text"
                value={formData.about_subtitle}
                onChange={e => setFormData({ ...formData, about_subtitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-accent/40 border border-border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Subtitle"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Main Heading Title
            </label>
            <input
              type="text"
              value={formData.about_title}
              onChange={e => setFormData({ ...formData, about_title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-accent/40 border border-border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Main Title"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Description / Narrative (Markdown or Plain Text)
            </label>
            <textarea
              rows={4}
              value={formData.about_description}
              onChange={e => setFormData({ ...formData, about_description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-accent/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Describe your corporate mission, authorized brands, and presence..."
            />
          </div>

          {/* Image & Preview */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Feature Image
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="text"
                value={formData.about_image}
                onChange={e => setFormData({ ...formData, about_image: e.target.value })}
                className="flex-1 w-full px-4 py-2.5 rounded-xl bg-accent/40 border border-border text-sm"
                placeholder="Image URL"
              />
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent/80 border border-border text-xs font-bold cursor-pointer shrink-0">
                <Upload size={14} />
                <span>{uploading ? "Uploading..." : "Upload Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            {formData.about_image && (
              <div className="mt-2 w-48 h-28 rounded-xl overflow-hidden border border-border">
                <img src={formData.about_image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Features Points */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Key Bullet Points / Badges
              </label>
              <button
                type="button"
                onClick={handleAddFeature}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <Plus size={14} />
                <span>Add Point</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.about_features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 border border-border">
                  <input
                    type="text"
                    value={feat.title}
                    onChange={e => handleUpdateFeature(idx, "title", e.target.value)}
                    placeholder="Feature title"
                    className="w-1/3 px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={feat.desc}
                    onChange={e => handleUpdateFeature(idx, "desc", e.target.value)}
                    placeholder="Feature detail"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-background border border-border text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Primary CTA Button
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.about_cta_text}
                  onChange={e => setFormData({ ...formData, about_cta_text: e.target.value })}
                  placeholder="Button text"
                  className="w-1/2 px-3 py-2 rounded-xl bg-accent/40 border border-border text-xs font-bold"
                />
                <input
                  type="text"
                  value={formData.about_cta_link}
                  onChange={e => setFormData({ ...formData, about_cta_link: e.target.value })}
                  placeholder="Link URL"
                  className="w-1/2 px-3 py-2 rounded-xl bg-accent/40 border border-border text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Secondary CTA Button
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.about_secondary_cta_text}
                  onChange={e => setFormData({ ...formData, about_secondary_cta_text: e.target.value })}
                  placeholder="Button text"
                  className="w-1/2 px-3 py-2 rounded-xl bg-accent/40 border border-border text-xs font-bold"
                />
                <input
                  type="text"
                  value={formData.about_secondary_cta_link}
                  onChange={e => setFormData({ ...formData, about_secondary_cta_link: e.target.value })}
                  placeholder="Link URL"
                  className="w-1/2 px-3 py-2 rounded-xl bg-accent/40 border border-border text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Why Choose Us */}
      {activeTab === "why" && (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Section Pre-Title
              </label>
              <input
                type="text"
                value={formData.why_badge}
                onChange={e => setFormData({ ...formData, why_badge: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-accent/40 border border-border text-sm font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Section Heading
              </label>
              <input
                type="text"
                value={formData.why_title}
                onChange={e => setFormData({ ...formData, why_title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-accent/40 border border-border text-sm font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Section Description
            </label>
            <textarea
              rows={2}
              value={formData.why_description}
              onChange={e => setFormData({ ...formData, why_description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-accent/40 border border-border text-sm"
            />
          </div>

          {/* Why Items Cards */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Pillars & Advantages ({formData.why_items.length})
              </h3>
              <button
                type="button"
                onClick={handleAddWhyItem}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <Plus size={14} />
                <span>Add Advantage</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.why_items.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-accent/30 border border-border space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-primary">Item #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWhyItem(idx)}
                      className="text-destructive hover:bg-destructive/10 p-1 rounded-lg"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={e => handleUpdateWhyItem(idx, "title", e.target.value)}
                      placeholder="Title"
                      className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={item.tag}
                      onChange={e => handleUpdateWhyItem(idx, "tag", e.target.value)}
                      placeholder="Tag (e.g. Authorized)"
                      className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-semibold"
                    />
                  </div>

                  <textarea
                    rows={2}
                    value={item.desc}
                    onChange={e => handleUpdateWhyItem(idx, "desc", e.target.value)}
                    placeholder="Description narrative"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Authorized Services */}
      {activeTab === "services" && (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Badge Pre-Title
              </label>
              <input
                type="text"
                value={formData.services_badge}
                onChange={e => setFormData({ ...formData, services_badge: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-accent/40 border border-border text-sm font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Section Heading
              </label>
              <input
                type="text"
                value={formData.services_title}
                onChange={e => setFormData({ ...formData, services_title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-accent/40 border border-border text-sm font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Services Description
            </label>
            <textarea
              rows={2}
              value={formData.services_description}
              onChange={e => setFormData({ ...formData, services_description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-accent/40 border border-border text-sm"
            />
          </div>

          {/* Service Cards */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Service Offerings ({formData.services_items.length})
              </h3>
              <button
                type="button"
                onClick={handleAddServiceItem}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <Plus size={14} />
                <span>Add Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.services_items.map((svc, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-accent/30 border border-border space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-primary">Service #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveServiceItem(idx)}
                      className="text-destructive hover:bg-destructive/10 p-1 rounded-lg"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={svc.title}
                      onChange={e => handleUpdateServiceItem(idx, "title", e.target.value)}
                      placeholder="Service title"
                      className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={svc.turnaround}
                      onChange={e => handleUpdateServiceItem(idx, "turnaround", e.target.value)}
                      placeholder="Turnaround (e.g. 24-48h)"
                      className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs"
                    />
                  </div>

                  <textarea
                    rows={2}
                    value={svc.desc}
                    onChange={e => handleUpdateServiceItem(idx, "desc", e.target.value)}
                    placeholder="Service description"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Hardware Products Catalog */}
      {activeTab === "catalog" && (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Section Pre-Title / Badge
              </label>
              <input
                type="text"
                value={formData.catalog_badge}
                onChange={e => setFormData({ ...formData, catalog_badge: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-accent/40 border border-border text-sm font-semibold"
                placeholder="e.g. OFFICIAL PRODUCT CATALOG"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Main Heading Title
              </label>
              <input
                type="text"
                value={formData.catalog_title}
                onChange={e => setFormData({ ...formData, catalog_title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-accent/40 border border-border text-sm font-bold"
                placeholder="e.g. Genuine Hardware & Products Portfolio"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.catalog_description}
              onChange={e => setFormData({ ...formData, catalog_description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-accent/40 border border-border text-sm"
              placeholder="Description narrative for hardware catalog"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                CTA Button Text
              </label>
              <input
                type="text"
                value={formData.catalog_cta_text}
                onChange={e => setFormData({ ...formData, catalog_cta_text: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-accent/40 border border-border text-xs font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                CTA Button Link
              </label>
              <input
                type="text"
                value={formData.catalog_cta_link}
                onChange={e => setFormData({ ...formData, catalog_cta_link: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-accent/40 border border-border text-xs"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Individual hardware products, pricing, stock, categories, and brands are managed directly in the <strong className="text-foreground">Products Database</strong>.
            </div>
            <Link
              to="/admin/products"
              className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shrink-0"
            >
              Manage Products
            </Link>
          </div>
        </div>
      )}

      {/* Tab 4: Products & Solutions */}
      {activeTab === "products" && (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Section Pre-Title / Badge
              </label>
              <input
                type="text"
                value={formData.products_badge}
                onChange={e => setFormData({ ...formData, products_badge: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-accent/40 border border-border text-sm font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Main Heading Title
              </label>
              <input
                type="text"
                value={formData.products_title}
                onChange={e => setFormData({ ...formData, products_title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-accent/40 border border-border text-sm font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.products_description}
              onChange={e => setFormData({ ...formData, products_description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-accent/40 border border-border text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Action Button Text
              </label>
              <input
                type="text"
                value={formData.products_cta_text}
                onChange={e => setFormData({ ...formData, products_cta_text: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-accent/40 border border-border text-xs font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Action Button Link
              </label>
              <input
                type="text"
                value={formData.products_cta_link}
                onChange={e => setFormData({ ...formData, products_cta_link: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-accent/40 border border-border text-xs"
              />
            </div>
          </div>

          {/* Solution Cards List */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Product Solution Cards ({(formData.products_items || []).length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Cards displayed on the right side of the split layout (images, titles, descriptions, and links).
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddProductItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider"
              >
                <Plus size={14} />
                <span>Add Card</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(formData.products_items || []).map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-accent/30 border border-border space-y-3 relative flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-primary">Card #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProductItem(idx)}
                        className="text-destructive hover:bg-destructive/10 p-1 rounded-lg"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Image Preview & URL */}
                    <div className="space-y-1">
                      <div className="aspect-[16/10] w-full rounded-lg overflow-hidden bg-muted border border-border/80">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80";
                          }}
                        />
                      </div>
                      <input
                        type="text"
                        value={item.image}
                        onChange={e => handleUpdateProductItem(idx, "image", e.target.value)}
                        placeholder="Image URL"
                        className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Title</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={e => handleUpdateProductItem(idx, "title", e.target.value)}
                        placeholder="e.g. Enterprise IT Solutions"
                        className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-bold text-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Description</label>
                      <textarea
                        rows={2}
                        value={item.desc}
                        onChange={e => handleUpdateProductItem(idx, "desc", e.target.value)}
                        placeholder="Short card summary"
                        className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Link / Route</label>
                      <input
                        type="text"
                        value={item.link}
                        onChange={e => handleUpdateProductItem(idx, "link", e.target.value)}
                        placeholder="e.g. /solutions/enterprise-it-datacenter-solutions"
                        className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              To add or edit specific deep architecture pages (Datacenter, Surveillance, Telecom, etc.), manage them under the <strong className="text-foreground">Company Solutions</strong> admin page.
            </div>
            <Link
              to="/admin/solutions"
              className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shrink-0"
            >
              Manage Solutions
            </Link>
          </div>
        </div>
      )}

      {/* Tab 5: Impact Counters */}
      {activeTab === "counters" && (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Live Numbers & Impact Statistics ({formData.counters.length})
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                These numbers animate automatically when viewers scroll into the section.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddCounter}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <Plus size={14} />
              <span>Add Counter</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formData.counters.map((counter, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-accent/30 border border-border space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-primary">Stat #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCounter(idx)}
                    className="text-destructive hover:bg-destructive/10 p-1 rounded-lg"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={counter.value}
                      onChange={e => handleUpdateCounter(idx, "value", e.target.value)}
                      placeholder="Value (e.g. 18)"
                      className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-bold"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={counter.suffix}
                      onChange={e => handleUpdateCounter(idx, "suffix", e.target.value)}
                      placeholder="Suffix (+, %)"
                      className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-bold"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  value={counter.label}
                  onChange={e => handleUpdateCounter(idx, "label", e.target.value)}
                  placeholder="Label (e.g. Years Channel Leadership)"
                  className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-semibold"
                />

                <input
                  type="text"
                  value={counter.desc}
                  onChange={e => handleUpdateCounter(idx, "desc", e.target.value)}
                  placeholder="Sub description"
                  className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs text-muted-foreground"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePageSettings;
