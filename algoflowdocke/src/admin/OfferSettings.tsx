import { useState, useEffect } from "react";
import { 
  Tag, Plus, Trash2, Edit, Save, X, Eye, Upload, RefreshCw, 
  Check, ArrowRight, Flame, Sparkles, Image as ImageIcon,
  AlertCircle, ShieldCheck
} from "lucide-react";
import { offerService, SpecialOffer } from "@/api/offerService";
import { uploadService } from "@/api/uploadService";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function OfferSettings() {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<SpecialOffer>>({
    title: "",
    badge_text: "LIMITED TIME OFFER",
    subtitle: "",
    description: "",
    image: "",
    images: [],
    discount_label: "",
    coupon_code: "",
    cta_text: "Claim Offer",
    cta_link: "/products",
    order: 1,
    is_active: true
  });

  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  const loadOffers = async () => {
    setLoading(true);
    try {
      const data = await offerService.adminGetAll();
      setOffers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load offers from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleOpenAdd = () => {
    setEditingOffer(null);
    setFormData({
      title: "",
      badge_text: "LIMITED TIME OFFER",
      subtitle: "",
      description: "",
      image: "",
      images: [],
      discount_label: "",
      coupon_code: "",
      cta_text: "Claim Offer",
      cta_link: "/products",
      order: offers.length + 1,
      is_active: true
    });
    setNewGalleryUrl("");
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (offer: SpecialOffer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      badge_text: offer.badge_text || "LIMITED TIME OFFER",
      subtitle: offer.subtitle || "",
      description: offer.description || "",
      image: offer.image || "",
      images: Array.isArray(offer.images) ? [...offer.images] : [],
      discount_label: offer.discount_label || "",
      coupon_code: offer.coupon_code || "",
      cta_text: offer.cta_text || "Claim Offer",
      cta_link: offer.cta_link || "/products",
      order: offer.order || 1,
      is_active: offer.is_active
    });
    setNewGalleryUrl("");
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    try {
      await offerService.adminDelete(id);
      toast.success("Offer deleted successfully");
      loadOffers();
    } catch (err) {
      toast.error("Failed to delete offer");
    }
  };

  // Main Image Upload
  const handleMainImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMain(true);
    try {
      const url = await uploadService.uploadImage(file, "offers/main");
      setFormData(prev => ({ ...prev, image: url }));
      toast.success("Main offer image uploaded!");
    } catch (err) {
      toast.error("Failed to upload image. Please try again or paste image URL.");
    } finally {
      setUploadingMain(false);
    }
  };

  // Gallery Images Upload (Multiple Images)
  const handleGalleryImagesFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await uploadService.uploadImage(file, `offers/gallery_${Date.now()}_${i}`);
        uploadedUrls.push(url);
      }
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls]
      }));
      toast.success(`Uploaded ${uploadedUrls.length} gallery image(s)!`);
    } catch (err) {
      toast.error("Failed to upload one or more gallery images");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), newGalleryUrl.trim()]
    }));
    setNewGalleryUrl("");
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      toast.error("Please enter an offer title");
      return;
    }

    try {
      if (editingOffer) {
        await offerService.adminUpdate(editingOffer.id, formData);
        toast.success("Offer updated successfully!");
      } else {
        await offerService.adminCreate(formData);
        toast.success("New offer created successfully!");
      }
      setIsDialogOpen(false);
      loadOffers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save offer");
    }
  };

  const handleSeedExamples = async () => {
    if (!window.confirm("Load sample offers? This will reset demo offers with images and text.")) return;
    try {
      await offerService.adminSeedExamples();
      toast.success("Sample offers loaded successfully!");
      loadOffers();
    } catch (err) {
      toast.error("Failed to seed sample offers");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Tag size={20} />
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Offers & Promotions Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Create and edit promotional banners, festive combos, and upload multiple images & text.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedExamples}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent hover:bg-accent/80 border border-border text-xs font-semibold text-foreground transition-all"
            title="Load default sample offers"
          >
            <RefreshCw size={14} />
            <span>Seed Examples</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-primary/20"
          >
            <Plus size={16} />
            <span>Add New Offer</span>
          </button>
        </div>
      </div>

      {/* Crucial Rule Notice Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3">
        <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Storefront Visibility Rule:</strong> Any offer without an uploaded or linked image will <strong>never be shown</strong> on the customer-facing storefront. Ensure you add a high-quality main image for each offer.
        </div>
      </div>

      {/* Offers Cards / Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">Loading offer configurations...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-4">
          <Tag size={36} className="mx-auto text-muted-foreground/60" />
          <h3 className="text-lg font-bold text-foreground">No Offers Configured</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Click "Add New Offer" or "Seed Examples" to create promotional banners with images and text.
          </p>
          <button onClick={handleSeedExamples} className="btn-primary text-xs px-4 py-2 rounded-xl">
            Load Default Demo Offers
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((offer) => {
            const hasImage = Boolean(offer.image && offer.image.trim() !== "");
            const galleryCount = Array.isArray(offer.images) ? offer.images.length : 0;

            return (
              <div 
                key={offer.id}
                className={`p-5 rounded-2xl bg-card border transition-all space-y-4 shadow-sm flex flex-col justify-between ${
                  !hasImage ? "border-amber-400/50 bg-amber-500/5" : "border-border hover:border-primary/40"
                }`}
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-accent text-foreground font-semibold">
                        Order #{offer.order}
                      </span>
                      {offer.badge_text && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20 uppercase">
                          {offer.badge_text}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hasImage 
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" 
                          : "bg-rose-500/15 text-rose-600"
                      }`}>
                        {hasImage ? "✓ Has Image (Visible)" : "⚠ No Image (Hidden)"}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${offer.is_active ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                    </div>
                  </div>

                  {/* Thumbnail & Title */}
                  <div className="flex gap-4 items-start">
                    <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-accent/40 border border-border/80 shrink-0 flex items-center justify-center">
                      {hasImage ? (
                        <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-muted-foreground p-1 text-center">
                          <ImageIcon size={20} />
                          <span className="text-[9px] mt-1">No Image</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-foreground line-clamp-1">
                        {offer.title}
                      </h3>
                      {offer.subtitle && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {offer.subtitle}
                        </p>
                      )}
                      {offer.discount_label && (
                        <span className="inline-block text-[11px] font-bold text-rose-600 dark:text-rose-400">
                          {offer.discount_label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Gallery count & coupon */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                    <span>
                      Images: <strong>{hasImage ? 1 + galleryCount : 0}</strong> image(s)
                    </span>
                    {offer.coupon_code && (
                      <span className="font-mono font-bold bg-accent px-2 py-0.5 rounded">
                        {offer.coupon_code}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    onClick={() => handleOpenEdit(offer)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent/80 text-foreground text-xs font-semibold transition-colors"
                  >
                    <Edit size={13} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 text-xs font-semibold transition-colors"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Offer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <Tag size={18} className="text-primary" />
              <span>{editingOffer ? "Edit Offer" : "Add New Special Offer"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Upload images and configure promotion text, badges, coupon codes, and action links.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6 pt-2">
            {/* Title & Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Offer Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mega Surveillance & Smart Security Festive Upgrade"
                  value={formData.title || ""}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-accent/30 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Badge Text</label>
                <input
                  type="text"
                  placeholder="e.g. LIMITED TIME OFFER"
                  value={formData.badge_text || ""}
                  onChange={e => setFormData({ ...formData, badge_text: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-accent/30 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Subtitle & Discount */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-foreground">Subtitle / Catchline</label>
                <input
                  type="text"
                  placeholder="e.g. Save up to 35% on Dahua 4K WizSense & CP Plus Gigabit PoE Bundles."
                  value={formData.subtitle || ""}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-accent/30 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Discount Tag</label>
                <input
                  type="text"
                  placeholder="e.g. FLAT 35% OFF"
                  value={formData.discount_label || ""}
                  onChange={e => setFormData({ ...formData, discount_label: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-accent/30 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Full Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Full Description</label>
              <textarea
                rows={3}
                placeholder="Detailed terms, bundle contents, warranty details, and conditions..."
                value={formData.description || ""}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-accent/30 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Main Featured Image Upload & URL */}
            <div className="p-4 rounded-2xl bg-accent/20 border border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ImageIcon size={15} className="text-primary" />
                  <span>Main Offer Image (Banner)</span>
                  <span className="text-rose-500">* Required for Storefront Display</span>
                </label>
                {uploadingMain && (
                  <span className="text-xs text-primary font-semibold animate-pulse">
                    Uploading image...
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="Paste image URL or upload below..."
                  value={formData.image || ""}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  className="w-full flex-1 px-3.5 py-2 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-xs"
                />

                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold cursor-pointer hover:bg-primary/90 transition-all shrink-0">
                  <Upload size={14} />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleMainImageFile}
                  />
                </label>
              </div>

              {formData.image && (
                <div className="relative w-full h-36 rounded-xl overflow-hidden bg-card border border-border/70 mt-2">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: "" })}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Max Image Upload Feature (Multiple Gallery Images) */}
            <div className="p-4 rounded-2xl bg-accent/20 border border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles size={15} className="text-primary" />
                  <span>Additional Gallery Images (Max Image Upload Feature)</span>
                </label>
                {uploadingGallery && (
                  <span className="text-xs text-primary font-semibold animate-pulse">
                    Uploading files...
                  </span>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground">
                Upload multiple images or paste URLs. Visitors can click through all images in the offer showcase.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="Paste additional image URL..."
                  value={newGalleryUrl}
                  onChange={e => setNewGalleryUrl(e.target.value)}
                  className="w-full flex-1 px-3.5 py-2 rounded-xl bg-card border border-border text-sm focus:outline-none font-mono text-xs"
                />

                <button
                  type="button"
                  onClick={handleAddGalleryUrl}
                  className="px-3.5 py-2 rounded-xl bg-accent hover:bg-accent/80 border border-border text-xs font-bold shrink-0"
                >
                  Add URL
                </button>

                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent/80 border border-border text-foreground text-xs font-bold cursor-pointer shrink-0">
                  <Upload size={14} />
                  <span>Bulk Upload</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleGalleryImagesFiles}
                  />
                </label>
              </div>

              {/* Gallery Images List */}
              {formData.images && formData.images.length > 0 && (
                <div className="flex flex-wrap gap-2.5 pt-2">
                  {formData.images.map((imgUrl, i) => (
                    <div key={i} className="relative w-20 h-16 rounded-lg overflow-hidden border border-border bg-card group">
                      <img src={imgUrl} alt={`gallery ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(i)}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-rose-600 text-white opacity-80 hover:opacity-100"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coupon, CTA & Ordering */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Coupon / Promo Code</label>
                <input
                  type="text"
                  placeholder="e.g. EONSECURITY35"
                  value={formData.coupon_code || ""}
                  onChange={e => setFormData({ ...formData, coupon_code: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-accent/30 border border-border text-sm font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">CTA Button Text</label>
                <input
                  type="text"
                  placeholder="e.g. Claim Offer"
                  value={formData.cta_text || "Claim Offer"}
                  onChange={e => setFormData({ ...formData, cta_text: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-accent/30 border border-border text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">CTA Button Link</label>
                <input
                  type="text"
                  placeholder="e.g. /brand/dahua"
                  value={formData.cta_link || "/products"}
                  onChange={e => setFormData({ ...formData, cta_link: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-accent/30 border border-border text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Display Order</label>
                <input
                  type="number"
                  min={1}
                  value={formData.order || 1}
                  onChange={e => setFormData({ ...formData, order: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-accent/30 border border-border text-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="offer_active"
                  checked={Boolean(formData.is_active)}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-primary focus:ring-primary/20"
                />
                <label htmlFor="offer_active" className="text-xs font-bold text-foreground cursor-pointer">
                  Active (Published)
                </label>
              </div>
            </div>

            {/* Live Preview Container */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase">
                <Eye size={13} />
                <span>Live Storefront Preview</span>
              </div>
              <div className="my-2 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-card via-card to-accent/30 border border-border shadow-xs">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 space-y-2 text-left">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary uppercase">
                      {formData.badge_text || "OFFER"}
                    </span>
                    <h4 className="text-base font-bold text-foreground">
                      {formData.title || "Offer Title Preview"}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {formData.subtitle || formData.description || "Offer description and catchline preview..."}
                    </p>
                  </div>
                  {formData.image && (
                    <div className="w-28 h-20 rounded-xl overflow-hidden bg-accent shrink-0 border border-border">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 rounded-xl bg-accent hover:bg-accent/80 text-foreground text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary px-6 py-2 rounded-xl text-xs font-bold shadow-md shadow-primary/20"
              >
                {editingOffer ? "Save Changes" : "Create Offer"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
