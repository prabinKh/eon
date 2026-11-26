import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, Sparkles, Filter, PackageOpen, Layers } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useBrands } from "@/hooks/useBrands";
import { useHomeContent } from "@/hooks/useHomeContent";
import { ProductCard } from "@/frontend/components/ProductCard";
import { ProductGridSkeleton } from "@/components/skeletons/ProductGridSkeleton";

export const HomeProductsSection = () => {
  const { products, loading: productsLoading } = useProducts();
  const { brands } = useBrands();
  const { content } = useHomeContent();

  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "featured" | "new" | "discount">("all");

  const badge = content?.catalog_badge || "OFFICIAL PRODUCT CATALOG";
  const title = content?.catalog_title || "Genuine Hardware & Products Portfolio";
  const description = content?.catalog_description || "Explore official manufacturer warranty products across Dahua, CP Plus, Ant Esports, Intex, and Bestor directly available for Nepal's IT channel.";
  const ctaText = content?.catalog_cta_text || "Explore Full Catalog";
  const ctaLink = content?.catalog_cta_link || "/category/all";

  // Filter products by selected brand and quick status filter
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    let list = [...products];

    // Filter by brand
    if (selectedBrand !== "all") {
      const target = selectedBrand.toLowerCase().trim();
      list = list.filter((p) => {
        const brandName = (p.brand_name || "").toLowerCase().trim();
        const brandSlug = (p.brand_slug || "").toLowerCase().trim();
        const brandVal = (typeof p.brand === "string" ? p.brand : "").toLowerCase().trim();
        return (
          (brandName && (brandName === target || brandName.includes(target) || target.includes(brandName))) ||
          (brandSlug && (brandSlug === target || brandSlug.includes(target))) ||
          brandVal === target
        );
      });
    }

    // Filter by quick filter tab
    if (selectedFilter === "featured") {
      list = list.filter((p) => p.isPopular || p.isBestSeller || (p.discount && p.discount > 0));
    } else if (selectedFilter === "new") {
      list = list.filter((p) => p.isNew);
    } else if (selectedFilter === "discount") {
      list = list.filter((p) => p.discount && p.discount > 0);
    }

    return list.slice(0, 12); // Limit to top 12 for high performance home display
  }, [products, selectedBrand, selectedFilter]);

  // Brand filter tabs: "All" + active brands
  const brandTabs = useMemo(() => {
    const list = [{ label: "All Brands", value: "all" }];
    if (brands && brands.length > 0) {
      brands.forEach((b) => {
        list.push({ label: b.name, value: b.name });
      });
    } else {
      list.push(
        { label: "Dahua", value: "Dahua" },
        { label: "CP Plus", value: "CP Plus" },
        { label: "Ant Esports", value: "Ant Esports" },
        { label: "Intex", value: "Intex" },
        { label: "Bestor", value: "Bestor" }
      );
    }
    return list;
  }, [brands]);

  return (
    <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6">
        <div className="space-y-3 max-w-2xl">
          <span className="section-pre-title">{badge}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        <Link
          to={ctaLink}
          className="inline-flex items-center gap-2 self-start md:self-end px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <span>{ctaText}</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* Brand & Filter Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pb-4 border-b border-border/60">
        {/* Brand Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {brandTabs.map((tab) => {
            const isActive = selectedBrand === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setSelectedBrand(tab.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-105"
                    : "bg-accent/40 text-muted-foreground hover:bg-accent hover:text-foreground border border-border/50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Quick Attribute Pills */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedFilter === "all"
                ? "bg-foreground text-background"
                : "bg-accent/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setSelectedFilter("featured")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedFilter === "featured"
                ? "bg-foreground text-background"
                : "bg-accent/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            Featured
          </button>
          <button
            onClick={() => setSelectedFilter("discount")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedFilter === "discount"
                ? "bg-foreground text-background"
                : "bg-accent/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            Special Offers
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {productsLoading ? (
        <ProductGridSkeleton count={8} />
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product, idx) => (
            <div key={product.id || idx} className="h-full">
              <ProductCard product={product} index={idx} />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl bg-accent/20 border border-border/60 p-8 space-y-4">
          <PackageOpen size={48} className="mx-auto text-muted-foreground/50" />
          <h3 className="text-lg font-bold text-foreground">No Products Found for Selected Filter</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Try switching to another brand tab or explore the full hardware catalog.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSelectedBrand("all");
                setSelectedFilter("all");
              }}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Bottom Catalog Discovery Bar */}
      <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-accent/50 via-card to-accent/30 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Looking for Specific Technical Specifications?</h4>
            <p className="text-xs text-muted-foreground">Browse all 4,300+ genuine products with category filters, datasheets, and serial numbers.</p>
          </div>
        </div>

        <Link
          to="/category/all"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card hover:bg-accent border border-border text-foreground font-bold text-xs uppercase tracking-wider transition-all shrink-0 shadow-sm"
        >
          <span>View All 580+ Hardware SKUs</span>
          <ChevronRight size={14} className="text-primary" />
        </Link>
      </div>
    </section>
  );
};
