import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Save, 
  Upload, 
  Loader2, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Sparkles, 
  RefreshCw, 
  Monitor, 
  Layers,
  CheckCircle2,
  ExternalLink,
  Video,
  Image as ImageIcon
} from "lucide-react";
import { heroService, type HeroContent, type HeroSpec } from "@/api/heroService";
import { uploadService } from "@/api/uploadService";

export default function HeroSettings() {
  const [slides, setSlides] = useState<HeroContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Modal / Drawer state for Create / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroContent | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<HeroContent>>({
    title: "",
    subtitle: "",
    description: "",
    badge_text: "New Tech Arrival",
    media_type: "image",
    image: "",
    video_url: "",
    buttonText: "Explore Catalog",
    link: "/category/all",
    order: 1,
    is_active: true,
    specs: [],
  });


  const [newSpecLabel, setNewSpecLabel] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const data = await heroService.adminGetAll();
      const sorted = [...data].sort((a, b) => (a.order || 0) - (b.order || 0));
      setSlides(sorted);
    } catch (error) {
      console.error("Failed to load hero slides:", error);
      toast.error("Failed to load hero slides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const openCreateModal = () => {
    setEditingSlide(null);
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      badge_text: "New Tech Arrival",
      media_type: "image",
      background_image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2000&q=80",
      card_image: "/eontechnology-logo.png",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2000&q=80",
      video_url: "",
      buttonText: "Explore Catalog",
      link: "/products",
      order: slides.length + 1,
      is_active: true,
      specs: [
        { label: "Hardware", value: "Enterprise Grade" },
        { label: "Warranty", value: "Official Distributor" }
      ],
    });
    setModalOpen(true);
  };

  const openEditModal = (slide: HeroContent) => {
    setEditingSlide(slide);
    const isVid = slide.media_type === "video" || 
      Boolean(slide.video_url) || 
      Boolean(slide.background_image && (slide.background_image.endsWith(".mp4") || slide.background_image.endsWith(".webm") || slide.background_image.includes(".mp4?"))) ||
      Boolean(slide.image && (slide.image.endsWith(".mp4") || slide.image.endsWith(".webm") || slide.image.includes(".mp4?")));
    setFormData({
      ...slide,
      media_type: isVid ? "video" : "image",
      background_image: slide.background_image || (isVid ? "" : slide.image) || "",
      card_image: slide.card_image || (!isVid && slide.image !== slide.background_image ? slide.image : "") || "",
      video_url: slide.video_url || (isVid ? (slide.background_image || slide.image) : ""),
      specs: slide.specs || [],
    });
    setModalOpen(true);
  };


  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      toast.error("Slide headline is required");
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<HeroContent> = {
        ...formData,
        background_image: formData.background_image || (formData.media_type === 'video' ? formData.video_url : formData.image) || "",
        card_image: formData.card_image || "",
        image: formData.card_image || formData.background_image || formData.image || "",
        video_url: formData.media_type === 'video' ? (formData.video_url || formData.background_image || "") : "",
      };

      if (editingSlide && editingSlide.id) {
        await heroService.adminUpdate(editingSlide.id, payload);
        toast.success("Hero slide updated successfully");
      } else {
        await heroService.adminCreate(payload);
        toast.success("Hero slide created successfully");
      }
      setModalOpen(false);
      fetchSlides();
      window.dispatchEvent(new CustomEvent("hero-settings-updated"));
    } catch (error) {
      console.error("Failed to save hero slide:", error);
      toast.error("Failed to save slide");
    } finally {
      setSaving(false);
    }
  };

  const handleOrderChange = async (slideId: string, newOrder: number) => {
    try {
      await heroService.adminUpdate(slideId, { order: newOrder });
      toast.success(`Slide moved to position #${newOrder}`);
      fetchSlides();
      window.dispatchEvent(new CustomEvent("hero-settings-updated"));
    } catch (err) {
      toast.error("Failed to update slide order");
      console.error(err);
    }
  };

  const handleToggleActive = async (slide: HeroContent) => {
    if (!slide.id) return;
    try {
      await heroService.adminUpdate(slide.id, { is_active: !slide.is_active });
      toast.success(`Slide #${slide.order} marked as ${!slide.is_active ? "Active" : "Hidden"}`);
      setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, is_active: !s.is_active } : s));
      window.dispatchEvent(new CustomEvent("hero-settings-updated"));
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    try {
      await heroService.adminDelete(id);
      toast.success("Slide deleted successfully");
      setDeleteConfirmId(null);
      setSlides(prev => prev.filter(s => s.id !== id));
      window.dispatchEvent(new CustomEvent("hero-settings-updated"));
    } catch (err) {
      toast.error("Failed to delete slide");
      console.error(err);
    }
  };


  const handleSeedExamples = async () => {
    if (!confirm("This will load the 4 recommended Eon Technology hardware slides (Dahua, CP Plus, Ant Esports, Bestor). Continue?")) {
      return;
    }
    setLoading(true);
    try {
      const data = await heroService.adminSeedExamples();
      setSlides(data);
      toast.success("Loaded 4 recommended example slides successfully!");
    } catch (err) {
      toast.error("Failed to load example slides");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadService.uploadImage(file, 'hero/images');
      setFormData(prev => ({ 
        ...prev, 
        background_image: url, 
        image: prev.image || url, 
        media_type: "image" 
      }));
      toast.success("Background image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadService.uploadImage(file, 'hero/videos');
      setFormData(prev => ({ 
        ...prev, 
        video_url: url, 
        media_type: "video",
        background_image: url,
        image: prev.image || url 
      }));
      toast.success("Background video uploaded successfully");
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadService.uploadImage(file, 'hero/cards');
      setFormData(prev => ({ 
        ...prev, 
        card_image: url, 
        image: prev.image || url 
      }));
      toast.success("Showcase card image uploaded successfully");
    } catch (error) {
      console.error("Error uploading card image:", error);
      toast.error("Failed to upload card image");
    } finally {
      setUploading(false);
    }
  };


  const addSpec = () => {
    if (!newSpecLabel.trim() || !newSpecValue.trim()) return;
    setFormData(prev => ({
      ...prev,
      specs: [...(prev.specs || []), { label: newSpecLabel.trim(), value: newSpecValue.trim() }]
    }));
    setNewSpecLabel("");
    setNewSpecValue("");
  };

  const removeSpec = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specs: (prev.specs || []).filter((_, i) => i !== index)
    }));
  };

  const moveSlide = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const currentSlide = slides[index];
    const otherSlide = slides[targetIndex];
    if (!currentSlide.id || !otherSlide.id) return;

    const currentOrder = currentSlide.order || (index + 1);
    const otherOrder = otherSlide.order || (targetIndex + 1);

    try {
      await heroService.adminReorder([
        { id: currentSlide.id, order: otherOrder },
        { id: otherSlide.id, order: currentOrder }
      ]);
      toast.success("Order updated");
      fetchSlides();
    } catch (err) {
      toast.error("Failed to reorder slides");
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Layers size={22} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Hero Slideshow & Banner Settings
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure the 4 rotating hero images and headlines on your home page. Select which comes 1st, 2nd, 3rd, and 4th.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={fetchSlides}
            className="p-2.5 rounded-xl border border-border bg-accent/40 hover:bg-accent text-foreground transition-colors"
            title="Refresh Slides"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleSeedExamples}
            className="px-3.5 py-2.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all flex items-center gap-1.5"
            title="Reset to 4 Brand Hardware Examples"
          >
            <Sparkles size={14} />
            <span>Load 4 Brand Examples</span>
          </button>

          <button
            onClick={openCreateModal}
            className="btn-primary px-4 py-2.5 flex items-center gap-2 shadow-md text-xs font-bold"
          >
            <Plus size={16} />
            <span>Add Slide</span>
          </button>
        </div>
      </div>

      {/* Slide Order Summary Pill Bar */}
      <div className="bg-card p-4 rounded-2xl border border-border flex items-center gap-3 overflow-x-auto">
        <span className="text-xs font-black uppercase text-muted-foreground shrink-0">Playback Sequence:</span>
        <div className="flex items-center gap-2 flex-wrap">
          {slides.map((s, idx) => (
            <div 
              key={s.id || idx}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-xs font-bold border border-border/80"
            >
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-mono">
                {s.order || idx + 1}
              </span>
              <span className="truncate max-w-[140px] text-foreground">{s.badge_text || s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Slides Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 text-center text-xs text-muted-foreground bg-card rounded-2xl border border-border">
            <RefreshCw size={24} className="mx-auto animate-spin mb-3 text-primary" />
            Loading hero slides...
          </div>
        ) : slides.length === 0 ? (
          <div className="p-16 text-center text-xs text-muted-foreground bg-card rounded-2xl border border-dashed border-border">
            <Layers size={36} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-bold text-foreground text-sm">No hero slides found.</p>
            <p className="mt-1">Click "Load 4 Brand Examples" to populate the 4 default Eon Technology slides.</p>
            <button
              onClick={handleSeedExamples}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold"
            >
              Load 4 Brand Examples
            </button>
          </div>
        ) : (
          slides.map((slide, index) => {
            const orderNum = slide.order || index + 1;
            const orderLabel = orderNum === 1 ? "1st (First)" : orderNum === 2 ? "2nd (Second)" : orderNum === 3 ? "3rd (Third)" : orderNum === 4 ? "4th (Fourth)" : `#${orderNum}`;

            return (
              <div
                key={slide.id || index}
                className={`bg-card rounded-2xl border transition-all p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                  slide.is_active ? "border-border hover:border-primary/40" : "border-dashed border-border/60 opacity-60"
                }`}
              >
                {/* Left: Sequence Rank & Thumbnail */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">
                      Sequence
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-lg shadow-xs">
                      {orderNum}
                    </div>

                    <div className="flex items-center gap-1 mt-2">
                      <button
                        onClick={() => moveSlide(index, "up")}
                        disabled={index === 0}
                        className="p-1 rounded-md bg-accent hover:bg-accent/80 disabled:opacity-30 text-muted-foreground hover:text-foreground"
                        title="Move Up"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => moveSlide(index, "down")}
                        disabled={index === slides.length - 1}
                        className="p-1 rounded-md bg-accent hover:bg-accent/80 disabled:opacity-30 text-muted-foreground hover:text-foreground"
                        title="Move Down"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Media Previews: Background Media + Showcase Card */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Background Media Thumbnail */}
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Background
                      </span>
                      {slide.media_type === "video" || slide.video_url || (slide.background_image && (slide.background_image.endsWith(".mp4") || slide.background_image.endsWith(".webm") || slide.background_image.includes(".mp4?"))) ? (
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-border bg-black flex items-center justify-center">
                          <video
                            src={slide.video_url || slide.background_image || slide.image}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-bold text-[#4ade80] uppercase flex items-center gap-1 border border-white/20">
                            <Video size={8} className="text-[#4ade80]" />
                            Video
                          </span>
                        </div>
                      ) : (
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-border bg-accent flex items-center justify-center">
                          <img
                            src={slide.background_image || slide.image || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&h=200&fit=crop"}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-bold text-white uppercase flex items-center gap-1 border border-white/20">
                            <ImageIcon size={8} />
                            Image
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Showcase Card Image Thumbnail */}
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Showcase Card
                      </span>
                      {slide.card_image ? (
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-emerald-500/30 bg-neutral-900/90 p-2 flex items-center justify-center">
                          <img
                            src={slide.card_image}
                            alt="Card"
                            className="max-h-full max-w-full object-contain drop-shadow"
                          />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-emerald-950/85 text-[8px] font-bold text-emerald-400 uppercase border border-emerald-500/30">
                            Card
                          </span>
                        </div>
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-dashed border-border bg-accent/30 flex flex-col items-center justify-center text-center p-1 text-muted-foreground">
                          <ImageIcon size={14} className="opacity-40 mb-0.5" />
                          <span className="text-[8px] opacity-70">No Card</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Slide Details */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                        {slide.badge_text || "Feature"}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground">
                        Position: <strong className="text-foreground">{orderLabel}</strong>
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug line-clamp-1">
                      {slide.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {slide.subtitle || slide.description}
                    </p>

                    {slide.specs && slide.specs.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                        {slide.specs.map((sp, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-accent/60 text-foreground/80 border border-border/50">
                            {sp.label}: <strong>{sp.value}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Quick Order Selector & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-border">
                  {/* Select Order Dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground hidden sm:inline">
                      Play Order:
                    </label>
                    <select
                      value={orderNum}
                      onChange={(e) => slide.id && handleOrderChange(slide.id, parseInt(e.target.value))}
                      className="h-9 px-2.5 rounded-xl bg-accent border border-border text-xs font-bold text-foreground focus:border-primary outline-none"
                    >
                      <option value={1}>1st Slide (First)</option>
                      <option value={2}>2nd Slide (Second)</option>
                      <option value={3}>3rd Slide (Third)</option>
                      <option value={4}>4th Slide (Fourth)</option>
                      <option value={5}>5th Slide</option>
                      <option value={6}>6th Slide</option>
                    </select>
                  </div>

                  {/* Active Toggle */}
                  <button
                    onClick={() => handleToggleActive(slide)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      slide.is_active
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                    title="Click to toggle visibility"
                  >
                    {slide.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                    <span className="hidden sm:inline">{slide.is_active ? "Active" : "Hidden"}</span>
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => openEditModal(slide)}
                    className="p-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                    title="Edit Slide Content"
                  >
                    <Edit3 size={16} />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => slide.id && setDeleteConfirmId(slide.id)}
                    className="p-2 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                    title="Delete Slide"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create or Edit Hero Slide */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <Layers size={18} />
                </div>
                <h3 className="text-lg font-black text-foreground">
                  {editingSlide ? `Edit Slide #${formData.order}` : "Add New Hero Slide"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-4">
              {/* Order Selection & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Play Sequence / Order *
                  </label>
                  <select
                    value={formData.order || 1}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                    className="w-full h-10 px-3 rounded-xl bg-accent border border-border text-xs font-bold text-foreground focus:border-primary outline-none"
                  >
                    <option value={1}>1st Slide (First to display)</option>
                    <option value={2}>2nd Slide (Second to display)</option>
                    <option value={3}>3rd Slide (Third to display)</option>
                    <option value={4}>4th Slide (Fourth to display)</option>
                    <option value={5}>5th Slide</option>
                    <option value={6}>6th Slide</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={formData.badge_text || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, badge_text: e.target.value }))}
                    placeholder="e.g. AI Surveillance Flagship"
                    className="w-full h-10 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none"
                  />
                </div>
              </div>

              {/* Main Headline */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Main Headline *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Dahua 4K WizSense AI Security Systems"
                  className="w-full h-10 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none font-bold"
                />
              </div>

              {/* Subtitle / Description */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Subtitle / Description
                </label>
                <textarea
                  rows={3}
                  value={formData.subtitle || formData.description || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({ ...prev, subtitle: val, description: val }));
                  }}
                  placeholder="Comprehensive description of the featured hardware..."
                  className="w-full p-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none resize-none leading-relaxed"
                />
              </div>

              {/* SECTION 1: Slide Background Media (Image or Looping Video) */}
              <div className="space-y-3 p-4 rounded-2xl bg-accent/40 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-foreground">
                      1. Slide Background Media *
                    </label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Covers the entire slide background behind the text content.
                    </p>
                  </div>

                  {/* Toggle: Image vs Video */}
                  <div className="flex items-center p-0.5 rounded-lg bg-accent border border-border">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, media_type: "image" }))}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                        formData.media_type !== "video" 
                          ? "bg-primary text-primary-foreground shadow-xs" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <ImageIcon size={12} />
                      <span>Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, media_type: "video" }))}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                        formData.media_type === "video" 
                          ? "bg-primary text-primary-foreground shadow-xs" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Video size={12} />
                      <span>Video (Auto-play)</span>
                    </button>
                  </div>
                </div>

                {formData.media_type === "video" ? (
                  /* Video Background Inputs */
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Background video will autoplay on a continuous loop (muted). Enter a video URL or upload an MP4/WebM file.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.video_url || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({ ...prev, video_url: val, background_image: val, media_type: "video" }));
                        }}
                        placeholder="https://.../video.mp4 or /media/uploads/video.mp4"
                        className="flex-1 h-10 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none font-mono"
                      />
                      <label className="h-10 px-4 rounded-xl bg-accent hover:bg-accent/80 border border-border text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer shrink-0">
                        <Upload size={14} className={uploading ? "animate-bounce" : ""} />
                        <span>{uploading ? "Uploading..." : "Upload Video"}</span>
                        <input type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*" className="hidden" onChange={handleVideoUpload} />
                      </label>
                    </div>

                    {(formData.video_url || (formData.background_image && formData.background_image.endsWith(".mp4"))) && (
                      <div className="p-3 bg-black/80 rounded-xl border border-border space-y-2">
                        <div className="flex items-center justify-between text-xs text-white/70">
                          <span className="font-bold flex items-center gap-1 text-[#4ade80]">
                            <Video size={13} /> Live Background Video Preview:
                          </span>
                          <span className="text-[10px] opacity-75">Auto-playing on loop (muted)</span>
                        </div>
                        <div className="relative aspect-video max-h-44 w-full rounded-lg overflow-hidden bg-black">
                          <video
                            src={formData.video_url || formData.background_image}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Image Background Inputs */
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Full background image for this hero slide. Enter an image URL or upload a backdrop file.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.background_image || formData.image || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({ ...prev, background_image: val, image: val, media_type: "image" }));
                        }}
                        placeholder="https://images.unsplash.com/... or /media/uploads/..."
                        className="flex-1 h-10 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none font-mono"
                      />
                      <label className="h-10 px-4 rounded-xl bg-accent hover:bg-accent/80 border border-border text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer shrink-0">
                        <Upload size={14} className={uploading ? "animate-bounce" : ""} />
                        <span>{uploading ? "Uploading..." : "Upload Image"}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundImageUpload} />
                      </label>
                    </div>

                    {(formData.background_image || formData.image) && (
                      <div className="p-2 bg-accent/40 rounded-xl border border-border/60 flex items-center gap-3">
                        <img 
                          src={formData.background_image || formData.image} 
                          alt="Background Preview" 
                          className="w-16 h-12 object-cover rounded-lg border border-border bg-card shrink-0" 
                        />
                        <span className="text-[11px] text-muted-foreground truncate">{formData.background_image || formData.image}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 2: Featured Showcase Card Image (Right-Side Glass Card) */}
              <div className="space-y-3 p-4 rounded-2xl bg-accent/40 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      2. Featured Showcase Card Image (Right-Side Floating Card)
                    </label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Displays inside the floating glass card (<code className="text-[10px] text-primary">w-full max-w-[340px] aspect-[4/3] rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/20</code>). Perfect for brand logos or featured device hardware photos.
                    </p>
                  </div>
                  {formData.card_image && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, card_image: "" }))}
                      className="text-[10px] font-bold text-destructive hover:underline shrink-0"
                    >
                      Clear Card Image
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.card_image || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, card_image: e.target.value }))}
                    placeholder="https://.../brand-logo.png or /media/uploads/device.png"
                    className="flex-1 h-10 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none font-mono"
                  />
                  <label className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-xs">
                    <Upload size={14} className={uploading ? "animate-bounce" : ""} />
                    <span>{uploading ? "Uploading..." : "Upload Card Image"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleCardImageUpload} />
                  </label>
                </div>

                {formData.card_image ? (
                  <div className="p-4 bg-black/90 rounded-xl border border-border/80 flex flex-col sm:flex-row items-center gap-4">
                    {/* Live Showcase Card Replica */}
                    <div className="relative w-full max-w-[220px] aspect-[4/3] rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/20 p-4 flex flex-col items-center justify-center shadow-2xl overflow-hidden group shrink-0">
                      <div className="absolute -inset-8 bg-primary/25 rounded-full blur-2xl pointer-events-none" />
                      <img
                        src={formData.card_image}
                        alt="Showcase card preview"
                        className="max-h-[90px] w-auto max-w-full object-contain drop-shadow-xl"
                      />
                      <div className="mt-3 pt-2 border-t border-white/10 w-full text-center">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-300">
                          Official Hardware Partner
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#4ade80]">
                        <CheckCircle2 size={13} />
                        <span>Showcase Card Image Active</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground break-all font-mono">
                        {formData.card_image}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        This image appears inside the right-hand floating card on the desktop hero section alongside your headline and CTAs.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-accent/30 rounded-xl border border-dashed border-border/70 text-center">
                    <p className="text-xs text-muted-foreground">
                      No card image uploaded yet. If left blank, the headline and description on the left will expand to full width.
                    </p>
                  </div>
                )}
              </div>


              {/* Button Text & Button Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={formData.buttonText || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value, cta_text: e.target.value }))}
                    placeholder="e.g. Explore Dahua"
                    className="w-full h-10 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">CTA Destination Link</label>
                  <input
                    type="text"
                    value={formData.link || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value, cta_link: e.target.value }))}
                    placeholder="/brand/dahua or /solutions"
                    className="w-full h-10 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none font-mono"
                  />
                </div>
              </div>

              {/* Specs Array Editor */}
              <div className="space-y-2 border-t border-border pt-3">
                <label className="block text-xs font-bold text-foreground">
                  Hardware Specifications (3 icons displayed on slide)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSpecLabel}
                    onChange={(e) => setNewSpecLabel(e.target.value)}
                    placeholder="Label (e.g. Resolution)"
                    className="w-1/3 h-9 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none"
                  />
                  <input
                    type="text"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSpec(); }}}
                    placeholder="Value (e.g. 4K Ultra-HD)"
                    className="flex-1 h-9 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={addSpec}
                    className="px-3.5 h-9 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(formData.specs || []).map((sp, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent text-xs font-medium border border-border">
                      <span className="text-muted-foreground">{sp.label}:</span>
                      <strong className="text-foreground">{sp.value}</strong>
                      <button type="button" onClick={() => removeSpec(idx)} className="text-muted-foreground hover:text-destructive ml-1">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Is Active Toggle */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <input
                  type="checkbox"
                  id="slide-active-check"
                  checked={formData.is_active ?? true}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                />
                <label htmlFor="slide-active-check" className="text-xs font-bold text-foreground cursor-pointer">
                  Published and Active in Carousel Rotation
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingSlide ? "Save Changes" : "Create Slide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-foreground">Delete Slide?</h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to permanently remove this slide from the homepage hero carousel?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSlide(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}