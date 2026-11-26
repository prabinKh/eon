import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import Stack from "@/frontend/components/Stack";
import { useAuth } from "@/context/AuthContext";
import { productService } from "@/api/productService";
import { categoryService } from "@/api/categoryService";
import { uploadService } from "@/api/uploadService";
import { brandService } from "@/api/brandService";
import { collectionService, type Collection } from "@/api/collectionService";
import { toast } from "sonner";
import { useGSAPReveal } from "@/hooks/useGSAP";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, ChevronRight, Save, X, Image as ImageIcon, Plus, Trash2, Package,
  LayoutDashboard, CheckCircle2, TrendingUp, Upload, Box, Eye, Check,
  Settings, Truck, Star, Tag, Loader2, Video, ChevronDown, FolderOpen,
  Layers, Building2, ArrowRight, CornerDownRight,
} from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { type Category } from "@/lib/types";

// ─── Step Definitions ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Brand",          icon: Building2 },
  { id: 2, label: "Category",       icon: Layers },
  { id: 3, label: "Basic Info",     icon: Package },
  { id: 4, label: "Pricing & Stock",icon: Tag },
  { id: 5, label: "Media",          icon: ImageIcon },
  { id: 6, label: "Specs & Extras", icon: Settings },
];

// ─── Utility ─────────────────────────────────────────────────────────────────
function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ─── Hierarchical Category Tree Selector ─────────────────────────────────────
interface CategoryTreeNodeProps {
  cat: Category;
  depth: number;
  selectedSlug: string;
  onSelect: (cat: Category) => void;
  onAddSubcategory?: (parentCat: Category, name: string) => Promise<void>;
}
function CategoryTreeNode({ cat, depth, selectedSlug, onSelect, onAddSubcategory }: CategoryTreeNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const [isAddingSubcat, setIsAddingSubcat] = useState(false);
  const [subcatName, setSubcatName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasChildren = cat.children && cat.children.length > 0;
  const isSelected = selectedSlug === cat.slug;

  const handleSubmitSubcat = async () => {
    if (!subcatName.trim() || !onAddSubcategory) return;
    setIsSubmitting(true);
    try {
      await onAddSubcategory(cat, subcatName.trim());
      setSubcatName("");
      setIsAddingSubcat(false);
      setExpanded(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all group
          ${isSelected
            ? "bg-primary/10 border border-primary/40 text-primary"
            : "hover:bg-accent/50 text-foreground border border-transparent"}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => onSelect(cat)}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded(p => !p); }}
            className="p-0.5 hover:text-primary transition-colors flex-shrink-0"
          >
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${expanded ? "rotate-0" : "-rotate-90"}`}
            />
          </button>
        ) : (
          <div className="w-5 flex-shrink-0" />
        )}
        <FolderOpen size={13} className="flex-shrink-0 opacity-60" />
        <span className="text-sm font-medium flex-1 truncate">{cat.name}</span>
        {cat.product_count !== undefined && cat.product_count > 0 && (
          <span className="text-[10px] text-muted-foreground bg-accent px-1.5 py-0.5 rounded-full">
            {cat.product_count}
          </span>
        )}
        {isSelected && <Check size={13} className="flex-shrink-0 text-primary" />}

        {/* Plus sign button on every category / dropdown node to toggle Add Subcategory */}
        {onAddSubcategory && (
          <button
            type="button"
            title={`Add subcategory under ${cat.name}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsAddingSubcat(prev => !prev);
              if (!expanded) setExpanded(true);
            }}
            className={`p-1 rounded-lg transition-colors flex-shrink-0 opacity-70 group-hover:opacity-100 ${
              isAddingSubcat
                ? "bg-primary text-primary-foreground opacity-100"
                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            }`}
          >
            <Plus size={13} className={isAddingSubcat ? "rotate-45 transition-transform" : "transition-transform"} />
          </button>
        )}
      </div>

      {/* Inline subcategory creation input and Add Subcategory button */}
      <AnimatePresence>
        {isAddingSubcat && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div
              className="flex items-center gap-2 py-1.5 pr-2 my-1 bg-accent/40 border border-primary/30 rounded-xl"
              style={{ paddingLeft: `${18 + (depth + 1) * 16}px` }}
              onClick={(e) => e.stopPropagation()}
            >
              <CornerDownRight size={13} className="text-primary flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={subcatName}
                onChange={(e) => setSubcatName(e.target.value)}
                placeholder={`Subcategory name under "${cat.name}"...`}
                className="flex-1 min-w-0 bg-background/90 border border-border rounded-lg px-2.5 py-1 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-foreground"
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (subcatName.trim()) {
                      await handleSubmitSubcat();
                    }
                  } else if (e.key === "Escape") {
                    setIsAddingSubcat(false);
                    setSubcatName("");
                  }
                }}
              />
              <button
                type="button"
                disabled={isSubmitting || !subcatName.trim()}
                onClick={handleSubmitSubcat}
                className="px-2.5 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-1 disabled:opacity-50 flex-shrink-0 shadow-sm"
              >
                {isSubmitting ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <>
                    <Plus size={12} />
                    <span>Add Subcategory</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingSubcat(false);
                  setSubcatName("");
                }}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent flex-shrink-0"
                title="Cancel"
              >
                <X size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {cat.children!.map(child => (
              <CategoryTreeNode
                key={child.slug}
                cat={child}
                depth={depth + 1}
                selectedSlug={selectedSlug}
                onSelect={onSelect}
                onAddSubcategory={onAddSubcategory}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const AddProduct = () => {
  const { setIsSidebarOpen } = useOutletContext<{ setIsSidebarOpen: (open: boolean) => void }>();
  const { user } = useAuth();
  const isAdmin = user?.is_staff || user?.is_superuser;
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // ── Form State ────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    categorySlug: "",
    brand: "",
    brandId: null as number | string | null,
    type: "",
    description: "",
    price: "",
    originalPrice: "",
    discount: "",
    stockCount: "10",
    rating: "0",
    reviews: "0",
    inStock: true,
    isNew: false,
    isBestSeller: false,
    isPopular: false,
    isOffer: false,
    freeShipping: false,
    image: "",
    images: [] as string[],
    model3D: "",
    model3DFrames: [] as string[],
    colors: [] as { name: string; hex: string }[],
    collections: [] as string[],
    details: "",
    specs: [{ key: "", value: "" }],
    keySpecifications: [] as string[],
    features: [] as string[],
  });

  // ── Media State ───────────────────────────────────────────────────────────
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [bulkImageFiles, setBulkImageFiles] = useState<File[]>([]);
  const [model3DFile, setModel3DFile] = useState<File | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoFramePreviewIndex, setVideoFramePreviewIndex] = useState(0);

  // ── Category State ────────────────────────────────────────────────────────
  const [catSearch, setCatSearch] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryParentSlug, setNewCategoryParentSlug] = useState("");

  // ── Brand State ───────────────────────────────────────────────────────────
  const [brandSearch, setBrandSearch] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [addingNewBrand, setAddingNewBrand] = useState(false);

  // ── Collection State ──────────────────────────────────────────────────────
  const [newCollectionInput, setNewCollectionInput] = useState("");

  // ── API Queries ───────────────────────────────────────────────────────────
  const { categories: flatCategories, loading: categoriesLoading } = useCategories();

  const { data: categoryTree = [], isLoading: treeLoading } = useQuery({
    queryKey: ["category-tree"],
    queryFn: () => categoryService.getTree(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: dbBrands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: () => brandService.getAll(),
  });

  const { data: availableCollections = [], isLoading: collectionsLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: () => collectionService.getAll(),
  });

  // Products per brand (for showing brand's product hierarchy)
  const { data: brandProducts = [], isLoading: brandProductsLoading } = useQuery({
    queryKey: ["brand-products", formData.brand],
    queryFn: async () => {
      if (!formData.brand) return [];
      try {
        const res = await productService.getAll({ brand: formData.brand });
        return Array.isArray(res) ? res : (res as any).results || [];
      } catch { return []; }
    },
    enabled: !!formData.brand,
  });

  useGSAPReveal(containerRef, ".gsap-reveal", { opacity: 0, y: 20, duration: 0.5, stagger: 0.04 });

  useEffect(() => {
    document.body.style.overflow = showPreview ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [showPreview]);

  // ── Category helpers ──────────────────────────────────────────────────────
  const filteredTree = useMemo(() => {
    if (!catSearch.trim()) return categoryTree;
    const q = catSearch.toLowerCase();
    const filterNodes = (nodes: Category[]): Category[] =>
      nodes.reduce<Category[]>((acc, node) => {
        const filteredChildren = filterNodes(node.children || []);
        if (node.name.toLowerCase().includes(q) || filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren });
        }
        return acc;
      }, []);
    return filterNodes(categoryTree);
  }, [categoryTree, catSearch]);

  const handleCategorySelect = async (cat: Category) => {
    setFormData(prev => ({
      ...prev,
      category: cat.name,
      categorySlug: cat.slug,
      type: "",
    }));
    // Fetch features to auto-suggest specs
    try {
      const featuresData = await categoryService.getFeatures(cat.slug);
      if (featuresData?.features?.length > 0) {
        setFormData(prev => {
          const currentKeys = prev.specs.map(s => s.key.toLowerCase());
          const newSpecs = [...prev.specs];
          featuresData.features.forEach((f: string) => {
            if (!currentKeys.includes(f.toLowerCase())) {
              if (newSpecs.length === 1 && !newSpecs[0].key) newSpecs[0] = { key: f, value: "" };
              else newSpecs.push({ key: f, value: "" });
            }
          });
          return { ...prev, specs: newSpecs };
        });
      }
    } catch { /* ignore */ }
  };

  // Build breadcrumb path for selected category
  const selectedCategoryPath = useMemo(() => {
    if (!formData.categorySlug) return "";
    const cat = flatCategories.find(c => c.slug === formData.categorySlug);
    if (!cat) return formData.category;
    // Use full_path if available
    if (cat.full_path) return cat.full_path;
    return cat.parent_name ? `${cat.parent_name} → ${cat.name}` : cat.name;
  }, [formData.categorySlug, flatCategories, formData.category]);

  // ── Add new category ──────────────────────────────────────────────────────
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setLoading(true);
    try {
      // Resolve parent ID from slug
      const parentCat = newCategoryParentSlug
        ? flatCategories.find(c => c.slug === newCategoryParentSlug)
        : null;
      const payload: Partial<Category> = {
        name: newCategoryName.trim(),
        slug: slugify(newCategoryName.trim()),
        ...(parentCat?.id ? { parent: parentCat.id } : {}),
      };
      await categoryService.create(payload);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["category-tree"] });
      setNewCategoryName("");
      setNewCategoryParentSlug("");
      toast.success(`Category "${newCategoryName}" created`);
    } catch { toast.error("Failed to create category"); }
    finally { setLoading(false); }
  };

  // ── Add subcategory under existing category (creates child in tree) ───────
  const handleAddSubcategory = async (parentCat: Category, name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const payload: any = {
        name: name.trim(),
        slug: slugify(name.trim()),
        parent: parentCat.id,
      };
      if (formData.brandId) {
        payload.brand = formData.brandId;
      } else if (formData.brand) {
        payload.brand = formData.brand;
      }
      await categoryService.create(payload);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["category-tree"] });
      toast.success(`Subcategory "${name}" added under "${parentCat.name}"`);
    } catch {
      toast.error("Failed to add subcategory");
    } finally {
      setLoading(false);
    }
  };

  // ── Brand helpers ─────────────────────────────────────────────────────────
  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return dbBrands;
    const q = brandSearch.toLowerCase();
    return dbBrands.filter((b: any) => b.name.toLowerCase().includes(q));
  }, [dbBrands, brandSearch]);

  const handleBrandSelect = (brand: any) => {
    setFormData(prev => ({ ...prev, brand: brand.name, brandId: brand.id }));
  };

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) { toast.error("Brand name required"); return; }
    setLoading(true);
    try {
      const res = await brandService.createBrand({
        name: newBrandName.trim(),
        slug: slugify(newBrandName.trim()),
        is_active: true,
      });
      await queryClient.invalidateQueries({ queryKey: ["brands"] });
      setFormData(prev => ({ ...prev, brand: newBrandName.trim(), brandId: res.id }));
      setNewBrandName("");
      setAddingNewBrand(false);
      toast.success(`Brand "${newBrandName}" created`);
    } catch { toast.error("Failed to create brand"); }
    finally { setLoading(false); }
  };

  // ── General Input handlers ────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: val,
      ...(name === "name" ? { slug: slugify(value) } : {}),
    }));
  };

  const handleColorToggle = (color: { name: string; hex: string }) => {
    setFormData(prev => {
      const exists = prev.colors.find(c => c.name === color.name);
      return exists
        ? { ...prev, colors: prev.colors.filter(c => c.name !== color.name) }
        : { ...prev, colors: [...prev.colors, color] };
    });
  };

  const handleCollectionToggle = (name: string) => {
    setFormData(prev => ({
      ...prev,
      collections: prev.collections.includes(name)
        ? prev.collections.filter(c => c !== name)
        : [...prev.collections, name],
    }));
  };

  // ── Media ─────────────────────────────────────────────────────────────────
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setMainImageFile(e.target.files[0]);
      setFormData(prev => ({ ...prev, image: URL.createObjectURL(e.target.files![0]) }));
    }
  };

  const handleBulkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setBulkImageFiles(prev => [...prev, ...files]);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...files.map(f => URL.createObjectURL(f))] }));
    }
  };

  const handle3DModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setModel3DFile(e.target.files[0]);
      toast.success("3D Model selected");
    }
  };

  const handleVideoToFramesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("video_file", file);
      const token = localStorage.getItem("access_token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch("/api/videos/upload/", { method: "POST", headers, body: uploadData });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      if (data.frames?.length > 0) {
        setFormData(prev => ({ ...prev, model3DFrames: data.frames }));
        setVideoFramePreviewIndex(0);
        toast.success(`${data.frames.length} frames extracted`);
      } else toast.error("No frames extracted");
    } catch (err: any) {
      toast.error(err.message || "Error processing video");
    } finally { setVideoUploading(false); }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !isAdmin) { toast.error("No permission"); return; }
    if (!formData.name.trim()) { toast.error("Product name required"); return; }
    if (!formData.brand.trim()) { toast.error("Brand required"); return; }
    const priceNum = Number(formData.price.toString().replace(/,/g, ""));
    if (!formData.price || isNaN(priceNum) || priceNum <= 0) { toast.error("Valid price required"); return; }

    setLoading(true);
    try {
      let mainImageUrl = formData.image;
      if (mainImageFile) mainImageUrl = await uploadService.uploadImage(mainImageFile, "products/main");

      const bulkUrls: string[] = formData.images.filter(img => !img.startsWith("blob:"));
      for (const file of bulkImageFiles) bulkUrls.push(await uploadService.uploadImage(file, "products/gallery"));

      let model3DUrl = formData.model3D;
      if (model3DFile) model3DUrl = await uploadService.uploadModel(model3DFile);

      const detailedSpecs: Record<string, string> = {};
      formData.specs.forEach(s => { if (s.key.trim() && s.value.trim()) detailedSpecs[s.key.trim()] = s.value.trim(); });

      const catObj = flatCategories.find(c => c.slug === formData.categorySlug || c.name === formData.category);
      const categoryId = catObj?.id || formData.categorySlug || formData.category;

      let brandId: number | string | null = formData.brandId;
      if (!brandId) {
        const brandObj = dbBrands.find((b: any) => b.name.toLowerCase() === formData.brand.toLowerCase());
        brandId = brandObj?.id || null;
      }
      if (!brandId) {
        try {
          const newBrand = await brandService.createBrand({
            name: formData.brand.trim(),
            slug: slugify(formData.brand.trim()),
            is_active: true,
          });
          brandId = newBrand.id;
          await queryClient.invalidateQueries({ queryKey: ["brands"] });
        } catch { brandId = formData.brand as any; }
      }

      const productData = {
        ...formData,
        category: categoryId,
        categorySlug: (formData.categorySlug || formData.category).toLowerCase(),
        brand: brandId,
        image: mainImageUrl,
        images: bulkUrls,
        model3D: model3DUrl,
        price: priceNum,
        originalPrice: formData.originalPrice ? Number(formData.originalPrice.toString().replace(/,/g, "")) : null,
        discount: Number(formData.discount || 0),
        stockCount: Number(formData.stockCount || 0),
        rating: Number(formData.rating || 0),
        specs: formData.specs
          .filter(s => s.key && s.key.trim() && s.value && s.value.trim())
          .map(s => `${s.key.trim()}: ${s.value.trim()}`),
        detailedSpecs,
        keySpecifications: formData.keySpecifications.filter(s => s.trim()),
      };

      await productService.create(productData);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product added successfully!");
      setSuccess(true);
      setTimeout(() => navigate("/admin/products"), 1800);
    } catch (error: any) {
      const d = error?.response?.data;
      let msg = "Failed to add product";
      if (typeof d === "string") msg = d;
      else if (d && typeof d === "object") msg = Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ");
      else if (error?.message) msg = error.message;
      toast.error(msg);
    } finally { setLoading(false); }
  };

  // ── Step validation ───────────────────────────────────────────────────────
  const canProceed = (step: number) => {
    if (step === 1) return formData.brand.trim().length > 0;
    if (step === 2) return formData.category.trim().length > 0 || formData.categorySlug.trim().length > 0;
    if (step === 3) return formData.name.trim().length > 0;
    return true;
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="animate-bounce" />
          </div>
          <h1 className="text-3xl font-display font-bold">Product Created!</h1>
          <p className="text-muted-foreground">Redirecting to products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-full pb-20 lg:pb-0" ref={containerRef}>
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="neo-container flex items-center justify-between h-14 gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/admin")} className="p-2 hover:bg-accent rounded-full transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-1.5 text-primary mb-0.5">
                <LayoutDashboard size={12} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Admin</span>
              </div>
              <h1 className="text-base font-bold leading-none">Add New Product</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-bold hover:bg-accent transition-all"
            >
              <Eye size={13} /> Preview
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-all shadow-md disabled:opacity-50"
            >
              <Save size={13} />
              <span className="hidden sm:inline">Save Product</span>
            </button>
          </div>
        </div>

        {/* ── Step Progress ── */}
        <div className="neo-container pb-2">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isDone = currentStep > step.id;
              return (
                <div key={step.id} className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (step.id > 1 && !formData.brand.trim()) {
                        toast.error("Please select a brand first!");
                        return;
                      }
                      if (step.id > 2 && !formData.category.trim()) {
                        toast.error("Please select a category first!");
                        return;
                      }
                      setCurrentStep(step.id);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap
                      ${isActive ? "bg-primary text-primary-foreground shadow-sm" : ""}
                      ${isDone ? "text-emerald-500" : ""}
                      ${!isActive && !isDone ? "text-muted-foreground hover:text-foreground" : ""}`}
                  >
                    {isDone ? <Check size={11} /> : <Icon size={11} />}
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden">{step.id}</span>
                  </button>
                  {idx < STEPS.length - 1 && <ArrowRight size={11} className="text-border flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <main className="neo-container py-6 max-w-4xl mx-auto w-full">
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {/* ════════════════════════════════════════════════════════════════
                STEP 1 — Brand Selection First
            ════════════════════════════════════════════════════════════════ */}
            {currentStep === 1 && (
              <motion.section
                key="step1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="space-y-6"
              >
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest">Brand Selection</h2>
                        <p className="text-[10px] text-muted-foreground">Select the product brand first to configure its category hierarchy & details</p>
                      </div>
                    </div>
                    {formData.brand && (
                      <span className="text-xs bg-emerald-500/10 text-emerald-600 font-bold px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                        <Check size={12} /> Brand Selected: {formData.brand}
                      </span>
                    )}
                  </div>

                  {/* Selected brand badge */}
                  {formData.brand && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                      <Check size={14} className="text-primary flex-shrink-0" />
                      <span className="text-sm font-semibold text-primary">{formData.brand}</span>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, brand: "", brandId: null }))} className="ml-auto p-1 hover:bg-primary/10 rounded-lg text-primary/60 hover:text-primary">
                        <X size={13} />
                      </button>
                    </div>
                  )}

                  {/* Brand search */}
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                      <input
                        value={brandSearch}
                        onChange={e => setBrandSearch(e.target.value)}
                        placeholder="Search brands..."
                        className="w-full bg-accent/30 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 pr-10"
                      />
                      {brandSearch && (
                        <button type="button" onClick={() => setBrandSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={14} /></button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setAddingNewBrand(p => !p)}
                      className="px-3 py-2 border border-primary/40 text-primary rounded-xl text-xs font-bold hover:bg-primary/5 transition-colors flex items-center gap-1.5"
                    >
                      <Plus size={13} /> New Brand
                    </button>
                  </div>

                  {/* Add brand form */}
                  <AnimatePresence>
                    {addingNewBrand && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-3"
                      >
                        <div className="flex gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                          <input
                            autoFocus
                            value={newBrandName}
                            onChange={e => setNewBrandName(e.target.value)}
                            placeholder="Brand name (e.g. Dahua, Hikvision)"
                            className="flex-1 bg-accent/30 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50"
                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleCreateBrand(); } }}
                          />
                          <button type="button" onClick={handleCreateBrand} disabled={loading || !newBrandName.trim()} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50">Create</button>
                          <button type="button" onClick={() => setAddingNewBrand(false)} className="p-2 text-muted-foreground hover:text-foreground"><X size={14} /></button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Brand list */}
                  {brandsLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[1,2,3,4,5,6].map(i => <div key={i} className="h-12 bg-muted/30 rounded-xl animate-pulse" />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                      {filteredBrands.map((brand: any) => (
                        <button
                          key={brand.id || brand.slug || brand.name}
                          type="button"
                          onClick={() => handleBrandSelect(brand)}
                          className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left truncate
                            ${formData.brand === brand.name
                              ? "bg-primary/10 border-primary text-primary ring-1 ring-primary"
                              : "bg-accent/20 border-border hover:border-primary/40 text-foreground"}`}
                        >
                          {brand.name}
                        </button>
                      ))}
                      {filteredBrands.length === 0 && (
                        <div className="col-span-full text-center py-4 text-sm text-muted-foreground">
                          {brandSearch ? `No brands match "${brandSearch}"` : "No brands found. Create one above."}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Continue button once brand is selected */}
                  {formData.brand && (
                    <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Selected Brand: <strong className="text-foreground">{formData.brand}</strong>
                      </p>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
                      >
                        Continue: Choose Category <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Brand Hierarchy Panel ── */}
                {formData.brand && (
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Layers size={18} />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest">{formData.brand} — Existing Products</h2>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Products already in this brand, grouped by category</p>
                      </div>
                    </div>

                    {brandProductsLoading ? (
                      <div className="space-y-2">
                        {[1,2,3].map(i => <div key={i} className="h-10 bg-muted/30 rounded-xl animate-pulse" />)}
                      </div>
                    ) : brandProducts.length === 0 ? (
                      <div className="py-6 text-center border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground">
                        No existing products for <strong>{formData.brand}</strong>. This will be the first!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Group by category */}
                        {Object.entries(
                          (brandProducts as any[]).reduce((groups: Record<string, any[]>, p: any) => {
                            const key = p.category_name || p.category || p.categorySlug || "Uncategorized";
                            (groups[key] = groups[key] || []).push(p);
                            return groups;
                          }, {} as Record<string, any[]>)
                        ).map(([catName, prods]: [string, any[]]) => (
                          <div key={catName} className="border border-border rounded-xl overflow-hidden">
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-accent/30 border-b border-border">
                              <FolderOpen size={13} className="text-primary" />
                              <span className="text-xs font-bold">{catName}</span>
                              <span className="ml-auto text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded-full border">{prods.length}</span>
                            </div>
                            <div className="divide-y divide-border">
                              {prods.map((p: any) => (
                                <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/20 transition-colors">
                                  {p.image && <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover border border-border" />}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{p.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{p.slug}</p>
                                  </div>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.inStock ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
                                    {p.inStock ? "In Stock" : "Out"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.section>
            )}

            {/* ════════════════════════════════════════════════════════════════
                STEP 2 — Category
            ════════════════════════════════════════════════════════════════ */}
            {currentStep === 2 && (
              <motion.section
                key="step2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="space-y-6"
              >
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Layers size={18} />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest">Category Selection</h2>
                        <p className="text-[10px] text-muted-foreground">Select a category for this <strong>{formData.brand || "brand"}</strong> product</p>
                      </div>
                    </div>
                    {formData.brand && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span>Brand:</span>
                        <span className="font-bold text-primary">{formData.brand}</span>
                        <button type="button" onClick={() => setCurrentStep(1)} className="text-[10px] text-primary/70 hover:text-primary underline ml-1">Change</button>
                      </div>
                    )}
                  </div>

                  {/* Selected path breadcrumb */}
                  {formData.category && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                      <Check size={14} className="text-primary flex-shrink-0" />
                      <span className="text-sm font-medium text-primary">{selectedCategoryPath || formData.category}</span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: "", categorySlug: "" }))}
                        className="ml-auto p-1 hover:bg-primary/10 rounded-lg text-primary/60 hover:text-primary transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )}

                  {/* Search */}
                  <div className="relative mb-3">
                    <input
                      value={catSearch}
                      onChange={e => setCatSearch(e.target.value)}
                      placeholder="Search categories..."
                      className="w-full bg-accent/30 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 pr-10"
                    />
                    {catSearch && (
                      <button type="button" onClick={() => setCatSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Tree */}
                  <div className="border border-border rounded-xl overflow-hidden max-h-[480px] overflow-y-auto">
                    {(treeLoading || categoriesLoading) ? (
                      <div className="p-4 space-y-2">
                        {[1,2,3,4,5].map(i => <div key={i} className="h-9 bg-muted/30 rounded-xl animate-pulse" />)}
                      </div>
                    ) : filteredTree.length === 0 ? (
                      <div className="p-6 text-center text-sm text-muted-foreground">
                        {catSearch ? "No categories match your search" : "No categories found"}
                      </div>
                    ) : (
                      <div className="p-2 space-y-0.5">
                        {filteredTree.map(cat => (
                          <CategoryTreeNode
                            key={cat.slug}
                            cat={cat}
                            depth={0}
                            selectedSlug={formData.categorySlug}
                            onSelect={handleCategorySelect}
                            onAddSubcategory={handleAddSubcategory}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add new root category */}
                  <div className="mt-4 p-4 bg-accent/20 border border-border/50 rounded-xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Create New Category</p>
                    <div className="flex gap-2 flex-wrap">
                      <input
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        placeholder="Category name"
                        className="flex-1 min-w-0 bg-accent/30 border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/50"
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddCategory(); } }}
                      />
                      <select
                        value={newCategoryParentSlug}
                        onChange={e => setNewCategoryParentSlug(e.target.value)}
                        className="flex-1 min-w-0 bg-accent/30 border border-border rounded-xl px-3 py-2 text-xs outline-none"
                      >
                        <option value="">— Root (no parent) —</option>
                        {flatCategories.map(c => (
                          <option key={c.slug} value={c.slug}>{c.parent_name ? `${c.parent_name} → ${c.name}` : c.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        disabled={!newCategoryName.trim() || loading}
                        className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Plus size={13} /> Create
                      </button>
                    </div>
                  </div>

                  {/* Continue button once category is selected */}
                  {formData.category && (
                    <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Selected Category: <strong className="text-foreground">{selectedCategoryPath || formData.category}</strong>
                      </p>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
                      >
                        Continue: Basic Information <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {/* ════════════════════════════════════════════════════════════════
                STEP 3 — Basic Info
            ════════════════════════════════════════════════════════════════ */}
            {currentStep === 3 && (
              <motion.section
                key="step3"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="space-y-6"
              >
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Package size={18} />
                      </div>
                      <h2 className="text-sm font-bold uppercase tracking-widest">Basic Information</h2>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">{formData.brand}</span>
                      <span>›</span>
                      <span className="font-medium text-foreground">{formData.category || "No category"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Product Name *</label>
                      <input
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Dahua IPC-HFW2849S-S-IL"
                        className="w-full bg-accent/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">URL Slug</label>
                      <input
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        placeholder="auto-generated-from-name"
                        className="w-full bg-accent/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Summary Description *</label>
                      <textarea
                        required
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Short description for product cards..."
                        className="w-full bg-accent/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none h-24"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Detailed Highlights</label>
                      <textarea
                        name="details"
                        value={formData.details}
                        onChange={handleInputChange}
                        placeholder="Comprehensive product details, features, and selling points..."
                        className="w-full bg-accent/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none min-h-[140px]"
                      />
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* ════════════════════════════════════════════════════════════════
                STEP 4 — Pricing & Stock
            ════════════════════════════════════════════════════════════════ */}
            {currentStep === 4 && (
              <motion.section
                key="step4"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="space-y-6"
              >
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Tag size={18} />
                    </div>
                    <h2 className="text-sm font-bold uppercase tracking-widest">Pricing & Inventory</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                      { name: "price", label: "Price *", placeholder: "0.00", type: "number" },
                      { name: "originalPrice", label: "Original Price", placeholder: "Optional", type: "number" },
                      { name: "discount", label: "Discount (%)", placeholder: "0", type: "number" },
                      { name: "stockCount", label: "Stock Count", placeholder: "0", type: "number" },
                      { name: "rating", label: "Rating (0–5)", placeholder: "4.5", type: "number" },
                      { name: "reviews", label: "Reviews Count", placeholder: "0", type: "number" },
                    ].map(f => (
                      <div key={f.name} className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{f.label}</label>
                        <input
                          type={f.type}
                          name={f.name}
                          value={(formData as any)[f.name]}
                          onChange={handleInputChange}
                          placeholder={f.placeholder}
                          step={f.name === "rating" ? "0.1" : undefined}
                          min={f.name === "rating" ? "0" : undefined}
                          max={f.name === "rating" ? "5" : undefined}
                          className="w-full bg-accent/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-5 mt-6 pt-5 border-t border-border/50">
                    {[
                      { name: "inStock", label: "In Stock", Icon: CheckCircle2, color: "emerald" },
                      { name: "isNew", label: "New Arrival", Icon: Star, color: "yellow" },
                      { name: "isBestSeller", label: "Best Seller", Icon: TrendingUp, color: "blue" },
                      { name: "isPopular", label: "Popular", Icon: TrendingUp, color: "orange" },
                      { name: "isOffer", label: "Offer", Icon: Tag, color: "green" },
                      { name: "freeShipping", label: "Free Shipping", Icon: Truck, color: "primary" },
                    ].map(({ name, label, Icon, color }) => (
                      <label key={name} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name={name}
                          checked={(formData as any)[name]}
                          onChange={handleInputChange}
                          className="w-4 h-4 rounded border-border accent-primary"
                        />
                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                          <Icon size={12} /> {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Collections */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest">Collections</h2>
                    <div className="flex gap-2">
                      <input
                        value={newCollectionInput}
                        onChange={e => setNewCollectionInput(e.target.value)}
                        placeholder="New collection name"
                        className="bg-accent/20 border border-border rounded-xl px-3 py-1.5 text-xs outline-none"
                        onKeyDown={async e => {
                          if (e.key === "Enter" && newCollectionInput.trim()) {
                            e.preventDefault();
                            try {
                              await collectionService.create(newCollectionInput.trim());
                              await queryClient.invalidateQueries({ queryKey: ["collections"] });
                              setNewCollectionInput("");
                              toast.success("Collection added");
                            } catch { toast.error("Failed to add collection"); }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!newCollectionInput.trim()) return;
                          try {
                            await collectionService.create(newCollectionInput.trim());
                            await queryClient.invalidateQueries({ queryKey: ["collections"] });
                            setNewCollectionInput("");
                            toast.success("Collection added");
                          } catch { toast.error("Failed to add collection"); }
                        }}
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {collectionsLoading ? [1,2,3].map(i => <div key={i} className="h-8 w-24 bg-muted/30 rounded-xl animate-pulse" />) :
                      availableCollections.map((coll: Collection) => {
                        const isSelected = formData.collections.includes(coll.name);
                        return (
                          <button
                            key={coll.id}
                            type="button"
                            onClick={() => handleCollectionToggle(coll.name)}
                            className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wide transition-all
                              ${isSelected ? "border-primary bg-primary/5 text-primary ring-1 ring-primary" : "border-border bg-accent/30 text-muted-foreground hover:bg-accent/50"}`}
                          >
                            {isSelected && <Check size={11} className="inline mr-1" />}
                            {coll.name}
                          </button>
                        );
                      })}
                    {!collectionsLoading && availableCollections.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">No collections yet.</p>
                    )}
                  </div>
                </div>
              </motion.section>
            )}

            {/* ════════════════════════════════════════════════════════════════
                STEP 5 — Media
            ════════════════════════════════════════════════════════════════ */}
            {currentStep === 5 && (
              <motion.section
                key="step5"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="space-y-6"
              >
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <ImageIcon size={18} />
                    </div>
                    <h2 className="text-sm font-bold uppercase tracking-widest">Media & Appearance</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Main Image */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Main Image</label>
                      <div className="flex gap-2">
                        <input
                          name="image"
                          value={formData.image}
                          onChange={handleInputChange}
                          placeholder="Paste image URL or upload →"
                          className="flex-1 bg-accent/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                        <label className="cursor-pointer bg-primary/10 text-primary p-2.5 rounded-xl hover:bg-primary/20 transition-colors">
                          <Upload size={18} />
                          <input type="file" accept="image/*" className="hidden" onChange={handleMainImageUpload} />
                        </label>
                      </div>
                      {formData.image && (
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-border">
                          <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => { setFormData(prev => ({ ...prev, image: "" })); setMainImageFile(null); }} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"><X size={12} /></button>
                        </div>
                      )}
                    </div>

                    {/* 3D Model */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">3D Model (.glb/.gltf)</label>
                      <div className="flex gap-2">
                        <input name="model3D" value={formData.model3D} onChange={handleInputChange} placeholder="URL or upload →" className="flex-1 bg-accent/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                        <label className="cursor-pointer bg-primary/10 text-primary p-2.5 rounded-xl hover:bg-primary/20 transition-colors">
                          <Box size={18} />
                          <input type="file" accept=".glb,.gltf" className="hidden" onChange={handle3DModelUpload} />
                        </label>
                      </div>
                      {model3DFile && <p className="text-[10px] text-emerald-500 font-medium">✓ {model3DFile.name}</p>}
                    </div>
                  </div>

                  {/* Video → frames */}
                  <div className="mt-6 pt-5 border-t border-border/50 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-accent/20 p-4 rounded-2xl border border-border">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">3D Spin Video Converter</label>
                        <span className="text-[11px] text-muted-foreground">Upload a product video to extract 30 spin frames for 360° view.</span>
                      </div>
                      <label className={`cursor-pointer px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all shadow-sm ${videoUploading ? "bg-primary/50 text-white cursor-not-allowed" : "bg-primary text-white hover:bg-primary/90"}`}>
                        {videoUploading ? <Loader2 size={16} className="animate-spin" /> : <Video size={16} />}
                        <span>{videoUploading ? "Converting..." : "Upload Video"}</span>
                        <input type="file" accept="video/*" className="hidden" disabled={videoUploading} onChange={handleVideoToFramesUpload} />
                      </label>
                    </div>

                    {formData.model3DFrames.length > 0 && (
                      <div className="space-y-3 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5"><CheckCircle2 size={14} /> {formData.model3DFrames.length} Frames Ready</span>
                          <button type="button" onClick={() => setFormData(prev => ({ ...prev, model3DFrames: [] }))} className="text-xs text-destructive hover:underline">Clear</button>
                        </div>
                        <div className="relative aspect-video w-full max-w-xs mx-auto bg-black/80 rounded-xl overflow-hidden">
                          <img src={formData.model3DFrames[videoFramePreviewIndex]} alt="" className="w-full h-full object-contain" />
                        </div>
                        <input type="range" min={0} max={formData.model3DFrames.length - 1} value={videoFramePreviewIndex} onChange={e => setVideoFramePreviewIndex(Number(e.target.value))} className="w-full max-w-xs mx-auto block accent-primary" />
                      </div>
                    )}
                  </div>

                  {/* Gallery */}
                  <div className="mt-6 pt-5 border-t border-border/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gallery Images</label>
                      <div className="flex gap-3">
                        <label className="cursor-pointer text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                          <Upload size={11} /> Add Images
                          <input type="file" multiple accept="image/*" className="hidden" onChange={handleBulkImageUpload} />
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {formData.images.map((img, i) => (
                        <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-accent/20">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={11} /></button>
                        </div>
                      ))}
                      {formData.images.length === 0 && (
                        <label className="cursor-pointer col-span-full border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground hover:border-primary/40 transition-colors">
                          <ImageIcon size={28} className="opacity-30" />
                          <span className="text-xs">Click to upload gallery images</span>
                          <input type="file" multiple accept="image/*" className="hidden" onChange={handleBulkImageUpload} />
                        </label>
                      )}
                    </div>
                    {formData.images.length > 1 && (
                      <div className="h-52 w-52 mx-auto mt-4">
                        <Stack cards={formData.images.map((img, i) => <img key={i} src={img} alt="" className="w-full h-full object-cover" />)} />
                      </div>
                    )}
                  </div>

                  {/* Colors */}
                  <div className="mt-6 pt-5 border-t border-border/50 space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Available Colors</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: "Red", hex: "#EF4444" }, { name: "Blue", hex: "#3B82F6" },
                        { name: "Black", hex: "#000000" }, { name: "White", hex: "#FFFFFF" },
                        { name: "Silver", hex: "#C0C0C0" }, { name: "Gold", hex: "#D4A017" },
                        { name: "Green", hex: "#22C55E" }, { name: "Yellow", hex: "#EAB308" },
                      ].map(color => {
                        const isSelected = formData.colors.some(c => c.name === color.name);
                        return (
                          <button key={color.name} type="button" onClick={() => handleColorToggle(color)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-accent/30 hover:bg-accent/50"}`}>
                            <div className="w-4 h-4 rounded-full border border-border/60" style={{ backgroundColor: color.hex }} />
                            <span className="text-xs font-medium">{color.name}</span>
                            {isSelected && <Check size={11} className="text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* ════════════════════════════════════════════════════════════════
                STEP 6 — Specs & Features
            ════════════════════════════════════════════════════════════════ */}
            {currentStep === 6 && (
              <motion.section
                key="step6"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="space-y-6"
              >
                {/* Key Specs */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Settings size={18} /></div>
                      <h2 className="text-sm font-bold uppercase tracking-widest">Key Specifications</h2>
                    </div>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, keySpecifications: [...prev.keySpecifications, ""] }))} className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"><Plus size={12} /> Add</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formData.keySpecifications.map((spec, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={spec}
                          onChange={e => { const n = [...formData.keySpecifications]; n[i] = e.target.value; setFormData(prev => ({ ...prev, keySpecifications: n })); }}
                          placeholder="e.g. 4MP Resolution, H.265+ Compression"
                          className="flex-1 bg-accent/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, keySpecifications: prev.keySpecifications.filter((_, idx) => idx !== i) }))} className="p-2.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all"><Trash2 size={16} /></button>
                      </div>
                    ))}
                    {formData.keySpecifications.length === 0 && (
                      <div className="col-span-full text-center py-6 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground">
                        Add key spec bullet points here
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical Specs Table */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-sm font-bold uppercase tracking-widest">Technical Specifications</h2>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, specs: [...prev.specs, { key: "", value: "" }] }))} className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"><Plus size={12} /> Add Row</button>
                  </div>
                  <div className="space-y-3">
                    {formData.specs.map((spec, i) => (
                      <div key={i} className="flex flex-col sm:flex-row gap-2">
                        <input value={spec.key} onChange={e => { const n = [...formData.specs]; n[i] = { ...n[i], key: e.target.value }; setFormData(prev => ({ ...prev, specs: n })); }} placeholder="Property (e.g. Resolution)" className="flex-1 bg-accent/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                        <input value={spec.value} onChange={e => { const n = [...formData.specs]; n[i] = { ...n[i], value: e.target.value }; setFormData(prev => ({ ...prev, specs: n })); }} placeholder="Value (e.g. 4MP)" className="flex-1 bg-accent/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, specs: prev.specs.filter((_, idx) => idx !== i) }))} className="p-2.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all self-end sm:self-auto"><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Star size={18} /></div>
                      <h2 className="text-sm font-bold uppercase tracking-widest">Product Features</h2>
                    </div>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, features: [...prev.features, ""] }))} className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors"><Plus size={14} /> Add Feature</button>
                  </div>
                  <div className="space-y-3">
                    {formData.features.map((feat, i) => (
                      <div key={i} className="flex gap-3">
                        <input value={feat} onChange={e => { const n = [...formData.features]; n[i] = e.target.value; setFormData(prev => ({ ...prev, features: n })); }} placeholder="e.g. Smart Dual Light, AI-powered detection" className="flex-1 bg-accent/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, features: prev.features.filter((_, idx) => idx !== i) }))} className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"><Trash2 size={18} /></button>
                      </div>
                    ))}
                    {formData.features.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-border rounded-2xl text-sm text-muted-foreground">
                        No features added. Click "Add Feature" to start.
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Submit */}
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setShowPreview(true)} className="flex-1 flex items-center justify-center gap-2 py-4 border border-border rounded-2xl font-bold text-sm hover:bg-accent transition-colors">
                    <Eye size={18} /> Preview
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={18} /> Save Product</>}
                  </button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ── Step Navigation ── */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-border/50">
            <button
              type="button"
              onClick={() => setCurrentStep(p => Math.max(1, p - 1))}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl text-sm font-bold hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} /> Previous
            </button>

            {/* Step dots */}
            <div className="flex items-center gap-2">
              {STEPS.map(step => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-2 h-2 rounded-full transition-all duration-200
                    ${currentStep === step.id ? "w-6 bg-primary" : ""}
                    ${currentStep > step.id ? "bg-emerald-500" : ""}
                    ${currentStep < step.id ? "bg-border" : ""}`}
                />
              ))}
            </div>

            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1 && !formData.brand.trim()) {
                    toast.error("Please select a brand first to continue!");
                    return;
                  }
                  if (currentStep === 2 && !formData.category.trim()) {
                    toast.error("Please select a category from the tree!");
                    return;
                  }
                  if (currentStep === 3 && !formData.name.trim()) {
                    toast.error("Please enter a product name!");
                    return;
                  }
                  setCurrentStep(p => Math.min(STEPS.length, p + 1));
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 shadow-md transition-colors"
              >
                {currentStep === 1 ? "Next: Choose Category" : currentStep === 2 ? "Next: Basic Info" : "Next"} <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 shadow-md disabled:opacity-50"
              >
                <Save size={16} /> {loading ? "Saving..." : "Save Product"}
              </button>
            )}
          </div>
        </form>
      </main>

      {/* ── Preview Modal ── */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto"
          >
            <div className="neo-container py-8 max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Eye size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Preview Mode</span>
                  </div>
                  <h1 className="text-2xl font-bold">{formData.name || "Product Name"}</h1>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowPreview(false)} className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-accent">← Edit</button>
                  <button onClick={() => { setShowPreview(false); handleSubmit(); }} disabled={loading} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50">
                    {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
                    Publish
                  </button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
                <div className="p-6 sm:p-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <div className="aspect-square rounded-2xl overflow-hidden border border-border bg-accent/20">
                        {formData.image ? <img src={formData.image} alt="" className="w-full h-full object-cover" /> : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon size={48} className="opacity-20" /></div>
                        )}
                      </div>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {formData.images.map((img, i) => (
                          <div key={i} className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border border-border">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {formData.brand && <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{formData.brand}</span>}
                          {formData.category && <><div className="w-1 h-1 rounded-full bg-border" /><span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{formData.category}</span></>}
                        </div>
                        <h2 className="text-2xl font-bold">{formData.name || "Product Name"}</h2>
                        <p className="text-muted-foreground text-sm mt-2">{formData.description}</p>
                      </div>

                      <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-bold">PKR {formData.price || "—"}</span>
                        {formData.originalPrice && <span className="text-lg text-muted-foreground line-through">PKR {formData.originalPrice}</span>}
                        {formData.discount && <span className="text-sm font-bold text-primary">{formData.discount}% OFF</span>}
                      </div>

                      {formData.specs.filter(s => s.key && s.value).length > 0 && (
                        <div className="border border-border rounded-xl overflow-hidden">
                          <div className="divide-y divide-border">
                            {formData.specs.filter(s => s.key && s.value).map((s, i) => (
                              <div key={i} className="flex justify-between px-4 py-2 text-sm">
                                <span className="text-muted-foreground font-medium">{s.key}</span>
                                <span className="font-bold">{s.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {formData.features.filter(Boolean).length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Features</p>
                          <ul className="space-y-1">
                            {formData.features.filter(Boolean).map((f, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogs placeholder for delete confirmations (kept minimal) */}
    </div>
  );
};

export default AddProduct;
