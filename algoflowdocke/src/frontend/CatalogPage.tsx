import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ChevronRight,
  Folder,
  Layers,
  Package,
  Download,
  FileText,
  SlidersHorizontal,
  ShoppingCart,
  Heart,
  GitCompareArrows,
  Check,
  ShieldCheck,
  Zap,
  Info,
  ArrowRight,
  Share2,
  Eye,
} from "lucide-react";
import { Header } from "@/frontend/components/Header";
import { Footer } from "@/frontend/components/Footer";
import { MobileBottomNav } from "@/frontend/components/MobileBottomNav";
import { ProductCard } from "@/frontend/components/ProductCard";
import { HierarchicalCategorySidebar } from "@/frontend/components/HierarchicalCategorySidebar";
import { categoryService } from "@/api/categoryService";
import { productService } from "@/api/productService";
import { type Category, type Product } from "@/lib/types";
import { wishlistStore } from "@/stores/wishlist";
import { compareStore } from "@/stores/compare";
import { toast } from "sonner";

export const CatalogPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { "*": pathParam } = useParams<{ "*": string }>();

  // Extract path segments: e.g. ["network-products", "network-cameras", "wizmind-4-series", "smart-dual-lght", "ipc-hdbw4239e-s-il"]
  const rawPath = (pathParam || "").replace(/^\/+|\/+$/g, "");
  const segments = useMemo(() => rawPath.split("/").filter(Boolean), [rawPath]);
  const leafSegment = segments[segments.length - 1] || "";

  // State
  const [categoriesTree, setCategoriesTree] = useState<Category[]>([]);
  const [allCategoriesFlat, setAllCategoriesFlat] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // If leaf is a product
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isProductMode, setIsProductMode] = useState(false);

  // Category mode products
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

  // Product detail view state
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "downloads">("overview");
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [specSearch, setSpecSearch] = useState("");

  // Category filter state
  const [sortBy, setSortBy] = useState("latest");
  const [selectedBrand, setSelectedBrand] = useState("all");

  // 1. Fetch Categories Tree on Mount
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const [treeData, allData] = await Promise.all([
          categoryService.getTree(),
          categoryService.getAll(),
        ]);
        if (isMounted) {
          setCategoriesTree(treeData);
          setAllCategoriesFlat(allData);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Resolve Path: determine if leaf is a Product or Category
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function resolveRoute() {
      if (!leafSegment) {
        // Root /products
        setIsProductMode(false);
        setCurrentProduct(null);
        setCurrentCategory(null);
        try {
          const prods = await productService.getAll();
          if (isMounted) setCategoryProducts(prods);
        } catch {
          if (isMounted) setCategoryProducts([]);
        }
        if (isMounted) setLoading(false);
        return;
      }

      // First check if leafSegment is a product
      try {
        const prod = await productService.getBySlug(leafSegment);
        if (prod && prod.id && isMounted) {
          setCurrentProduct(prod);
          setIsProductMode(true);
          setSelectedImage(prod.image || "");
          setLoading(false);
          return;
        }
      } catch {
        // Not a product, proceed to category check
      }

      // If not a product, it's a category!
      if (isMounted) {
        setIsProductMode(false);
        setCurrentProduct(null);

        // Find matching category object
        const matchingCat = allCategoriesFlat.find(
          (c) => c.slug === leafSegment || c.full_path === rawPath
        );
        setCurrentCategory(matchingCat || { name: leafSegment.replace(/-/g, " "), slug: leafSegment });

        try {
          // Fetch products for this category or category path (includes descendants)
          const prods = await productService.getByCategoryPath(rawPath);
          if (isMounted) setCategoryProducts(prods);
        } catch (err) {
          console.error("Error loading products for category path:", err);
          if (isMounted) setCategoryProducts([]);
        }
        setLoading(false);
      }
    }

    resolveRoute();
    return () => {
      isMounted = false;
    };
  }, [rawPath, leafSegment, allCategoriesFlat]);

  // Breadcrumb items calculation
  const breadcrumbs = useMemo(() => {
    const list: { label: string; url: string }[] = [{ label: "Home", url: "/" }, { label: "Products", url: "/products" }];

    if (isProductMode && currentProduct) {
      if (currentProduct.category_hierarchy && currentProduct.category_hierarchy.length > 0) {
        currentProduct.category_hierarchy.forEach((item) => {
          list.push({
            label: item.name,
            url: `/products/${item.full_path}`,
          });
        });
      } else if (segments.length > 1) {
        let acc = "";
        segments.slice(0, -1).forEach((seg) => {
          acc = acc ? `${acc}/${seg}` : seg;
          const cat = allCategoriesFlat.find((c) => c.slug === seg);
          list.push({
            label: cat ? cat.name : seg.replace(/-/g, " "),
            url: `/products/${acc}`,
          });
        });
      }
      list.push({ label: currentProduct.name, url: "" });
    } else {
      let acc = "";
      segments.forEach((seg, idx) => {
        acc = acc ? `${acc}/${seg}` : seg;
        const cat = allCategoriesFlat.find((c) => c.slug === seg);
        list.push({
          label: cat ? cat.name : seg.replace(/-/g, " "),
          url: idx === segments.length - 1 ? "" : `/products/${acc}`,
        });
      });
    }
    return list;
  }, [isProductMode, currentProduct, segments, allCategoriesFlat]);

  // Direct child subcategories for current category
  const childSubcategories = useMemo(() => {
    if (isProductMode || !currentCategory) return [];
    if (currentCategory.children && currentCategory.children.length > 0) {
      return currentCategory.children;
    }
    // Search in allCategoriesFlat
    return allCategoriesFlat.filter((c) => c.parent_slug === currentCategory.slug || c.parent === currentCategory.id);
  }, [isProductMode, currentCategory, allCategoriesFlat]);

  // Filtered & sorted products in category mode
  const filteredProducts = useMemo(() => {
    let prods = [...categoryProducts];
    if (selectedBrand !== "all") {
      prods = prods.filter((p) => p.brand === selectedBrand || p.brand_name === selectedBrand);
    }
    if (sortBy === "price-low") prods.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") prods.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") prods.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return prods;
  }, [categoryProducts, selectedBrand, sortBy]);

  // Product brands for filter dropdown
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    categoryProducts.forEach((p) => {
      if (p.brand) set.add(p.brand);
      if (p.brand_name) set.add(p.brand_name);
    });
    return Array.from(set).filter(Boolean);
  }, [categoryProducts]);

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <Helmet>
        <title>
          {isProductMode && currentProduct
            ? `${currentProduct.name} | Eon Technology`
            : currentCategory
            ? `${currentCategory.name} | Eon Technology Products`
            : "Product Catalog | Eon Technology"}
        </title>
        <meta
          name="description"
          content={
            isProductMode && currentProduct
              ? currentProduct.description || "Dahua CCTV & Surveillance Solutions"
              : "Explore the comprehensive security and IT catalog from Eon Technology."
          }
        />
      </Helmet>

      <Header />

      <main className="neo-container py-4 sm:py-6">
        {/* Dynamic Breadcrumbs Bar */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto py-2.5 px-4 mb-6 bg-card border border-border/70 rounded-2xl shadow-sm scrollbar-none">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.url || crumb.label + idx}>
              {idx > 0 && <ChevronRight size={13} className="text-muted-foreground/40 shrink-0" />}
              {crumb.url ? (
                <Link
                  to={crumb.url}
                  className="whitespace-nowrap hover:text-primary transition-colors font-medium flex items-center gap-1"
                >
                  {idx === 0 && <Folder size={12} className="text-primary/70" />}
                  <span>{crumb.label}</span>
                </Link>
              ) : (
                <span className="whitespace-nowrap font-bold text-foreground truncate max-w-[280px]">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Main Grid: Sidebar + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left Column: Hierarchical Category Sidebar */}
          <div className="lg:col-span-1 h-fit">
            <HierarchicalCategorySidebar
              categories={categoriesTree}
              activeSlug={isProductMode ? currentProduct?.categorySlug : currentCategory?.slug}
              activePath={rawPath}
            />
          </div>

          {/* Right Column: Catalog Content */}
          <div className="lg:col-span-3 min-w-0 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto pr-1.5 scrollbar-thin">
            {loading ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center p-12 bg-card border border-border rounded-3xl">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-muted-foreground font-medium">
                  Loading catalog items...
                </p>
              </div>
            ) : isProductMode && currentProduct ? (
              /* =======================================================
                 PRODUCT DETAIL VIEW (Dahua Official Layout)
                 ======================================================= */
              <div className="space-y-8">
                {/* Product Detail Card */}
                <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left: Gallery */}
                    <div className="space-y-4">
                      <div className="aspect-[4/3] bg-accent/40 rounded-2xl border border-border/80 flex items-center justify-center p-6 overflow-hidden relative group">
                        <img
                          src={selectedImage || currentProduct.image}
                          alt={currentProduct.name}
                          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                        {currentProduct.isNew && (
                          <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                            New Release
                          </span>
                        )}
                      </div>

                      {/* Thumbnails */}
                      {currentProduct.gallery && currentProduct.gallery.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                          {currentProduct.gallery.map((imgUrl, imgIdx) => (
                            <button
                              key={imgIdx}
                              onClick={() => setSelectedImage(imgUrl)}
                              className={`w-16 h-16 rounded-xl border-2 p-1 bg-accent/20 shrink-0 transition-all ${
                                (selectedImage || currentProduct.image) === imgUrl
                                  ? "border-primary ring-2 ring-primary/20 scale-105"
                                  : "border-border hover:border-primary/50 opacity-70 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={imgUrl}
                                alt={`thumb-${imgIdx}`}
                                className="w-full h-full object-contain"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Info & Purchase */}
                    <div className="space-y-5">
                      {/* Model & Title */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-primary/10 text-primary text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg border border-primary/20">
                            {currentProduct.slug.toUpperCase()}
                          </span>
                          {currentProduct.brand && (
                            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                              {currentProduct.brand_name || currentProduct.brand}
                            </span>
                          )}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-display font-black text-foreground leading-tight">
                          {currentProduct.name}
                        </h1>
                      </div>

                      {/* Key Points (Dahua style) */}
                      <div className="bg-accent/40 border border-border/70 rounded-2xl p-4 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                          <Zap size={14} className="text-amber-500" />
                          <span>Key Features & Highlights</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-muted-foreground">
                          {(currentProduct.features && currentProduct.features.length > 0
                            ? currentProduct.features
                            : currentProduct.specs
                          ).map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2">
                              <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                        <Link
                          to={currentProduct.slug || currentProduct.id ? `/product/${currentProduct.slug || currentProduct.id}` : "#"}
                          className="w-full sm:flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all hover:scale-[1.01]"
                        >
                          <Eye size={17} />
                          <span>View Product</span>
                        </Link>

                        <button
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent("open-chat", {
                                detail: { message: `I am inquiring about ${currentProduct.name} (${currentProduct.slug}). Could you provide a formal quote?` }
                              })
                            );
                            toast.info("Sales inquiry initiated");
                          }}
                          className="w-full sm:w-auto h-12 px-6 bg-accent hover:bg-accent/80 text-foreground font-bold text-xs uppercase tracking-wider rounded-xl border border-border flex items-center justify-center gap-2 transition-colors"
                        >
                          <Info size={15} className="text-primary" />
                          <span>Sales Enquiry</span>
                        </button>
                      </div>

                      {/* Datasheet download quick pill */}
                      {currentProduct.datasheet_url && (
                        <div className="pt-2">
                          <a
                            href={currentProduct.datasheet_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline bg-primary/5 hover:bg-primary/10 px-3.5 py-2 rounded-xl border border-primary/20 transition-all"
                          >
                            <Download size={14} />
                            <span>Download Official Datasheet (PDF)</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub-tabs Navigation */}
                <div className="flex items-center gap-2 border-b border-border bg-card/60 backdrop-blur-md rounded-2xl p-1.5 shadow-sm">
                  {[
                    { id: "overview", label: "Overview & Description" },
                    { id: "specs", label: "Technical Specifications" },
                    { id: "downloads", label: "Download Center" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab 1: Overview */}
                {activeTab === "overview" && (
                  <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
                    <h3 className="text-lg font-black text-foreground">
                      Product Overview
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {currentProduct.description || currentProduct.details}
                    </p>

                    {currentProduct.specs && currentProduct.specs.length > 0 && (
                      <div className="pt-4 border-t border-border/60">
                        <h4 className="text-xs font-black uppercase tracking-wider text-foreground mb-4">
                          Specification Highlights
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {currentProduct.specs.map((spec: any, sIdx: number) => {
                            const label = typeof spec === 'object' && spec !== null
                              ? (spec.value ? `${spec.key ? `${spec.key}: ` : ''}${spec.value}` : JSON.stringify(spec))
                              : String(spec || '');
                            if (!label.trim()) return null;
                            return (
                              <div
                                key={sIdx}
                                className="bg-accent/40 border border-border/60 p-3 rounded-xl text-xs font-medium text-foreground/90 flex items-center gap-2"
                              >
                                <ShieldCheck size={15} className="text-primary shrink-0" />
                                <span>{label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Technical Specifications */}
                {activeTab === "specs" && (
                  <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
                      <div>
                        <h3 className="text-lg font-black text-foreground">
                          Technical Specifications
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Complete technical parameters & hardware properties
                        </p>
                      </div>
                    </div>

                    {currentProduct.detailed_specs || currentProduct.detailedSpecs ? (
                      <div className="space-y-6">
                        {Object.entries(
                          (currentProduct.detailed_specs || currentProduct.detailedSpecs) as Record<string, any>
                        ).map(([sectionTitle, sectionContent]) => {
                          const isDict = typeof sectionContent === "object" && sectionContent !== null;
                          return (
                            <div
                              key={sectionTitle}
                              className="border border-border rounded-2xl overflow-hidden shadow-sm"
                            >
                              <div className="bg-accent/60 px-5 py-3 border-b border-border flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                                  {sectionTitle}
                                </h4>
                              </div>
                              <div className="divide-y divide-border/60">
                                {isDict ? (
                                  Object.entries(sectionContent as Record<string, string>).map(
                                    ([paramKey, paramVal]) => (
                                      <div
                                        key={paramKey}
                                        className="grid grid-cols-1 sm:grid-cols-3 px-5 py-3 text-xs hover:bg-accent/20 transition-colors"
                                      >
                                        <span className="font-semibold text-muted-foreground sm:col-span-1">
                                          {paramKey}
                                        </span>
                                        <span className="text-foreground sm:col-span-2 font-mono">
                                          {String(paramVal)}
                                        </span>
                                      </div>
                                    )
                                  )
                                ) : (
                                  <div className="px-5 py-3 text-xs text-foreground">
                                    {String(sectionContent)}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        Standard specifications listed in Overview.
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Download Center */}
                {activeTab === "downloads" && (
                  <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
                    <div>
                      <h3 className="text-lg font-black text-foreground">
                        Documentation & Downloads
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Official datasheets, manuals, dimension blueprints, and guides
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Datasheet Card */}
                      {currentProduct.datasheet_url && (
                        <div className="p-5 bg-accent/40 border border-border rounded-2xl flex items-center justify-between gap-4 hover:border-primary/50 transition-colors">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                              <FileText size={20} />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-foreground">
                                Official Product Datasheet
                              </h4>
                              <span className="text-[11px] text-muted-foreground font-mono">
                                PDF Document
                              </span>
                            </div>
                          </div>
                          <a
                            href={currentProduct.datasheet_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0 shadow-sm"
                            title="Download Datasheet"
                          >
                            <Download size={16} />
                          </a>
                        </div>
                      )}

                      {/* Additional Downloads */}
                      {currentProduct.downloads &&
                        currentProduct.downloads.map((dl, dIdx) => (
                          <div
                            key={dIdx}
                            className="p-5 bg-accent/40 border border-border rounded-2xl flex items-center justify-between gap-4 hover:border-primary/50 transition-colors"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <FileText size={20} />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-foreground">
                                  {dl.title || dl.name}
                                </h4>
                                <span className="text-[11px] text-muted-foreground font-mono">
                                  {dl.name}
                                </span>
                              </div>
                            </div>
                            <a
                              href={dl.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0 shadow-sm"
                              title="Download"
                            >
                              <Download size={16} />
                            </a>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* =======================================================
                 CATEGORY BROWSING VIEW (Multi-Product Grid)
                 ======================================================= */
              <div className="space-y-6">
                {/* Category Header Banner */}
                <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
                  <div className="max-w-2xl space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                      Catalog Branch
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-display font-black text-foreground capitalize">
                      {currentCategory?.name || "All Products"}
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {currentCategory?.description ||
                        "Explore cutting-edge surveillance, networking, and IT hardware from Eon Technology."}
                    </p>
                  </div>
                </div>

                {/* Subcategory Quick Links Pills */}
                {childSubcategories.length > 0 && (
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">
                      Subcategories & Series
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {childSubcategories.map((sub) => (
                        <Link
                          key={sub.slug}
                          to={sub.full_path ? `/products/${sub.full_path}` : `/category/${sub.slug}`}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:border-primary hover:text-primary transition-all text-xs font-bold text-foreground/80 shrink-0 shadow-sm hover:shadow"
                        >
                          <Folder size={13} className="text-primary/70" />
                          <span>{sub.name}</span>
                          {typeof sub.product_count === "number" && sub.product_count > 0 && (
                            <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                              {sub.product_count}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filter & Sort Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-card border border-border/80 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">
                      {filteredProducts.length}
                    </span>{" "}
                    Products available
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Brand Filter */}
                    {availableBrands.length > 1 && (
                      <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="h-9 px-3 text-xs bg-accent border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="all">All Brands</option>
                        {availableBrands.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Sort Dropdown */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="h-9 px-3 text-xs bg-accent border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="latest">Sort by: Latest</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                    </select>
                  </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProducts.map((p, idx) => (
                      <ProductCard key={p.id || p.slug} product={p} index={idx} />
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center bg-card border border-border rounded-3xl p-8 space-y-3">
                    <Package size={36} className="mx-auto text-muted-foreground/40" />
                    <h3 className="text-base font-bold text-foreground">
                      No products found in this category
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Try exploring subcategories or clearing any active filters.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default CatalogPage;
