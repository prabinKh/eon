import { useParams, Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useMemo, useCallback, useRef, useState } from "react";
import { useGSAPReveal } from "@/hooks/useGSAP";
import { Header } from "@/frontend/components/Header";
import { Footer } from "@/frontend/components/Footer";
import { MobileBottomNav } from "@/frontend/components/MobileBottomNav";
import { ProductCard } from "@/frontend/components/ProductCard";
import { HierarchicalCategorySidebar } from "@/frontend/components/HierarchicalCategorySidebar";
import { useProducts } from "@/hooks/useProducts";
import { useCategoryTree, useCategories } from "@/hooks/useCategories";
import { useStore } from "@/frontend/context/StoreContext";
import { ChevronRight, X, ChevronDown, Folder, Layers, Sparkles } from "lucide-react";

const SORT_OPTIONS = [
  { value: "latest", label: "Sort by latest" },
  { value: "name", label: "Name: A to Z" },
  { value: "popularity", label: "Popularity" },
  { value: "rating", label: "Rating" },
];

const BrandPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { company } = useStore();
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products: allProducts } = useProducts();
  const { treeCategories } = useCategoryTree();
  const { categories: flatCategories } = useCategories();

  useGSAPReveal(containerRef, ".gsap-reveal", { opacity: 0, y: 30, duration: 0.8, stagger: 0.1 });
  useGSAPReveal(containerRef, ".gsap-reveal-sidebar", { opacity: 0, x: -30, duration: 1 });

  const sortBy = searchParams.get("sort") || "latest";
  const selectedCategorySlug = searchParams.get("category");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const title = slug?.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Brand Products";

  // Match all products belonging to this brand (Dahua)
  const baseProducts = useMemo(() => {
    const targetSlug = slug?.toLowerCase();
    const targetName = slug?.replace(/-/g, " ").toLowerCase();
    return allProducts.filter((p) => {
      const bSlug = (p.brand_slug || (typeof p.brand === 'object' && p.brand !== null ? (p.brand as any).slug : '') || '').toLowerCase();
      const bName = (p.brand_name || (typeof p.brand === 'object' && p.brand !== null ? (p.brand as any).name : (typeof p.brand === 'string' ? p.brand : '')) || '').toLowerCase();
      return bSlug === targetSlug || bName === targetName || bName === targetSlug;
    });
  }, [slug, allProducts]);

  // Find active category object if selected
  const activeCategoryObj = useMemo(() => {
    if (!selectedCategorySlug) return null;
    return flatCategories.find(
      (c) => c.slug.toLowerCase() === selectedCategorySlug.toLowerCase()
    ) || null;
  }, [selectedCategorySlug, flatCategories]);

  // Filter products by selected category if user clicked a category in the sidebar
  const categoryFilteredProducts = useMemo(() => {
    if (!selectedCategorySlug) return baseProducts;
    const catLower = selectedCategorySlug.toLowerCase();
    return baseProducts.filter((p) => {
      const matchSlug = p.categorySlug?.toLowerCase() === catLower;
      const matchPath = p.category_path?.toLowerCase().split("/").includes(catLower);
      const matchHierarchy = p.category_hierarchy?.some((h: any) => {
        if (typeof h === "string") {
          return h.toLowerCase().replace(/\s+/g, "-") === catLower || h.toLowerCase() === catLower;
        } else if (h && typeof h === "object") {
          return (
            h.slug?.toLowerCase() === catLower ||
            h.name?.toLowerCase().replace(/\s+/g, "-") === catLower ||
            h.full_path?.toLowerCase().split("/").includes(catLower)
          );
        }
        return false;
      });
      return matchSlug || matchPath || matchHierarchy;
    });
  }, [baseProducts, selectedCategorySlug]);

  const updateParams = useCallback((key: string, value: string | string[] | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (Array.isArray(value)) {
        next.delete(key);
        value.forEach((v) => next.append(key, v));
      } else if (value === null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value as string);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const filtered = useMemo(() => {
    const result = [...categoryFilteredProducts];

    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "popularity":
        result.sort((a, b) => b.reviews - a.reviews);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [categoryFilteredProducts, sortBy]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background pb-16 lg:pb-0">
      <Helmet>
        <title>{`${title} Products | ${company?.name || "Eon Technology"}`}</title>
      </Helmet>
      <Header />
      <main className="neo-container py-4 sm:py-6">
        {/* Dynamic Breadcrumbs Bar */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto py-2.5 px-4 mb-6 bg-card border border-border/70 rounded-2xl shadow-sm scrollbar-none">
          <Link
            to="/"
            className="whitespace-nowrap hover:text-primary transition-colors font-medium flex items-center gap-1"
          >
            <Folder size={12} className="text-primary/70" />
            <span>Home</span>
          </Link>
          <ChevronRight size={13} className="text-muted-foreground/40 shrink-0" />
          <Link
            to={`/brand/${slug}`}
            onClick={() => updateParams("category", null)}
            className={`whitespace-nowrap transition-colors font-medium ${
              !selectedCategorySlug ? "font-bold text-foreground" : "hover:text-primary"
            }`}
          >
            {title}
          </Link>
          {selectedCategorySlug && (
            <>
              <ChevronRight size={13} className="text-muted-foreground/40 shrink-0" />
              <span className="whitespace-nowrap font-bold text-foreground truncate max-w-[280px]">
                {activeCategoryObj?.name ||
                  selectedCategorySlug
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            </>
          )}
        </nav>

        {/* Main Grid: Sidebar + Products Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left Column: Hierarchical Category Sidebar (exact same as /products) */}
          <div className="hidden lg:block lg:col-span-1 h-fit">
            <HierarchicalCategorySidebar
              categories={treeCategories}
              activeSlug={selectedCategorySlug || undefined}
            />
          </div>

          {/* Mobile Drawer for Category Side Nav */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
              <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
              <div
                className="absolute left-0 top-0 bottom-0 w-84 max-w-[88vw] bg-card shadow-[var(--shadow-xl)] p-5 overflow-auto animate-slide-in-left space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Layers size={15} />
                    </div>
                    <h2 className="font-display font-bold text-sm text-foreground">
                      Product Catalog
                    </h2>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent"
                  >
                    <X size={18} />
                  </button>
                </div>

                <HierarchicalCategorySidebar
                  categories={treeCategories}
                  activeSlug={selectedCategorySlug || undefined}
                />
              </div>
            </div>
          )}

          {/* Right Column: Catalog Products Grid */}
          <div className="lg:col-span-3 space-y-6 min-w-0 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto pr-1.5 scrollbar-thin">
            {/* Header controls bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-sm">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-display font-black tracking-tight text-foreground truncate">
                    {selectedCategorySlug && activeCategoryObj
                      ? activeCategoryObj.name
                      : `${title} Products`}
                  </h1>
                  <span className="bg-primary/10 text-primary text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    Official
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-semibold text-muted-foreground">
                    Showing <strong className="text-foreground">{filtered.length}</strong>{" "}
                    {title} products
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground border border-border px-4 py-2.5 rounded-xl hover:bg-accent transition-all active:scale-95 shadow-sm bg-card"
                >
                  <Layers size={15} className="text-primary" />
                  <span>Browse Categories</span>
                </button>

                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      updateParams("sort", e.target.value === "latest" ? null : e.target.value)
                    }
                    className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider bg-card border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none pr-9 shadow-sm"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Category Filter Chip */}
            {selectedCategorySlug && (
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2.5 rounded-xl text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <span>
                  Category: <strong>{activeCategoryObj?.name || selectedCategorySlug}</strong> (
                  {filtered.length} products)
                </span>
                <button
                  onClick={() => updateParams("category", null)}
                  className="ml-auto flex items-center gap-1 hover:bg-primary/20 px-2 py-0.5 rounded-lg text-[11px] font-bold transition-colors"
                  title="Clear category filter"
                >
                  <span>Show All</span>
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Products Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-16 sm:py-24 bg-card border border-border rounded-2xl p-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={22} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">
                  No {title} products found
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                  Select a category from the sidebar or clear the filter to view all products.
                </p>
                <button
                  onClick={() => updateParams("category", null)}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Show All {title} Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
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

export default BrandPage;
