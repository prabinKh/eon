import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Folder, FolderOpen, Layers, Package, Search, ArrowRight } from "lucide-react";
import { type Category, type Product } from "@/lib/types";

interface Props {
  categories: Category[];
  activeSlug?: string;
  activePath?: string;
  currentProductSlug?: string;
  products?: Product[];
  onSelectCategory?: (category: Category) => void;
  onSelectAll?: () => void;
  title?: string;
  subtitle?: string;
}

export const HierarchicalCategorySidebar: React.FC<Props> = ({
  categories,
  activeSlug,
  activePath,
  currentProductSlug,
  products,
  onSelectCategory,
  onSelectAll,
  title = "Product Catalog",
  subtitle = "Explore categories & series",
}) => {
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set());
  const [searchFilter, setSearchFilter] = useState("");
  const location = useLocation();

  // Index products by category slug and path
  const productsByCategory = useMemo(() => {
    const map = new Map<string, Product[]>();
    if (!products || products.length === 0) return map;

    products.forEach((p) => {
      const slugsToTag = new Set<string>();
      if (p.categorySlug) slugsToTag.add(p.categorySlug.toLowerCase());
      if (p.category) slugsToTag.add(String(p.category).toLowerCase());
      if (p.category_path) {
        p.category_path.split("/").forEach((seg) => {
          if (seg) slugsToTag.add(seg.toLowerCase());
        });
      }
      if (p.category_hierarchy && Array.isArray(p.category_hierarchy)) {
        p.category_hierarchy.forEach((h: any) => {
          if (typeof h === "string") {
            slugsToTag.add(h.toLowerCase().replace(/\s+/g, "-"));
          } else if (h && typeof h === "object") {
            if (h.slug) slugsToTag.add(String(h.slug).toLowerCase());
            if (h.name) slugsToTag.add(String(h.name).toLowerCase().replace(/\s+/g, "-"));
            if (h.full_path) {
              String(h.full_path).split("/").forEach((seg) => {
                if (seg) slugsToTag.add(seg.toLowerCase());
              });
            }
          }
        });
      }

      slugsToTag.forEach((k) => {
        if (!map.has(k)) map.set(k, []);
        map.get(k)!.push(p);
      });
    });

    return map;
  }, [products]);

  // Auto-expand active path branches
  useEffect(() => {
    if (activePath || activeSlug) {
      const parts = (activePath || "").split("/").filter(Boolean);
      if (activeSlug && !parts.includes(activeSlug)) {
        parts.push(activeSlug);
      }

      setExpandedSlugs((prev) => {
        const next = new Set(prev);
        parts.forEach((p) => next.add(p));
        return next;
      });
    }
  }, [activePath, activeSlug]);

  // If searching, auto-expand categories that have matching items
  useEffect(() => {
    if (searchFilter.trim().length > 1) {
      const lowerSearch = searchFilter.toLowerCase();
      const matchingSlugs = new Set<string>();

      const checkCategory = (cat: Category) => {
        let hasMatch = cat.name.toLowerCase().includes(lowerSearch);
        const catProds = productsByCategory.get(cat.slug.toLowerCase()) || [];
        if (catProds.some((p) => p.name.toLowerCase().includes(lowerSearch))) {
          hasMatch = true;
        }

        if (cat.children && cat.children.length > 0) {
          cat.children.forEach((c) => {
            if (checkCategory(c)) hasMatch = true;
          });
        }

        if (hasMatch) {
          matchingSlugs.add(cat.slug);
        }
        return hasMatch;
      };

      categories.forEach(checkCategory);
      setExpandedSlugs((prev) => new Set([...prev, ...matchingSlugs]));
    }
  }, [searchFilter, categories, productsByCategory]);

  const toggleExpand = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const renderCategoryNode = (cat: Category, level: number = 0) => {
    const hasChildren = Boolean(cat.children && cat.children.length > 0);
    const isExpanded = expandedSlugs.has(cat.slug);
    const targetUrl = cat.full_path ? `/products/${cat.full_path}` : `/category/${cat.slug}`;
    const isActive =
      activeSlug === cat.slug ||
      (activePath && (activePath === cat.full_path || activePath === cat.slug));

    // Products belonging directly to this category
    const catProducts = productsByCategory.get(cat.slug.toLowerCase()) || [];
    const directProducts = products
      ? hasChildren
        ? catProducts.filter((p) => p.categorySlug?.toLowerCase() === cat.slug.toLowerCase())
        : catProducts
      : [];

    const lowerSearch = searchFilter.toLowerCase();
    const matchesSearch =
      !searchFilter ||
      cat.name.toLowerCase().includes(lowerSearch) ||
      catProducts.some((p) => p.name.toLowerCase().includes(lowerSearch)) ||
      (cat.children &&
        cat.children.some((c) => c.name.toLowerCase().includes(lowerSearch)));

    if (!matchesSearch) return null;

    const displayCount =
      catProducts.length > 0
        ? catProducts.length
        : typeof cat.product_count === "number" && cat.product_count > 0
        ? cat.product_count
        : 0;

    return (
      <div key={cat.id || cat.slug} className="select-none">
        <div
          className={`group flex items-center justify-between py-2 px-3 rounded-xl transition-all duration-150 cursor-pointer ${
            isActive
              ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20"
              : "text-foreground/80 hover:text-primary hover:bg-primary/5"
          }`}
          style={{ paddingLeft: `${Math.max(12, level * 16 + 12)}px` }}
        >
          {onSelectCategory ? (
            <button
              type="button"
              onClick={() => onSelectCategory(cat)}
              className="flex-1 flex items-center gap-2 min-w-0 pr-2 text-left"
            >
              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen
                    size={15}
                    className={isActive ? "text-primary-foreground" : "text-primary/80 shrink-0"}
                  />
                ) : (
                  <Folder
                    size={15}
                    className={isActive ? "text-primary-foreground" : "text-muted-foreground shrink-0"}
                  />
                )
              ) : (
                <Layers
                  size={14}
                  className={isActive ? "text-primary-foreground" : "text-muted-foreground/60 shrink-0"}
                />
              )}
              <span className="text-xs truncate">{cat.name}</span>
            </button>
          ) : (
            <Link
              to={targetUrl}
              className="flex-1 flex items-center gap-2 min-w-0 pr-2"
            >
              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen
                    size={15}
                    className={isActive ? "text-primary-foreground" : "text-primary/80 shrink-0"}
                  />
                ) : (
                  <Folder
                    size={15}
                    className={isActive ? "text-primary-foreground" : "text-muted-foreground shrink-0"}
                  />
                )
              ) : (
                <Layers
                  size={14}
                  className={isActive ? "text-primary-foreground" : "text-muted-foreground/60 shrink-0"}
                />
              )}
              <span className="text-xs truncate">{cat.name}</span>
            </Link>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            {displayCount > 0 && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                }`}
              >
                {displayCount}
              </span>
            )}

            {(hasChildren || directProducts.length > 0) && (
              <button
                onClick={(e) => toggleExpand(cat.slug, e)}
                className={`p-1 rounded-lg transition-transform duration-200 ${
                  isActive
                    ? "text-primary-foreground hover:bg-white/20"
                    : "text-muted-foreground hover:text-primary hover:bg-accent"
                }`}
                title={isExpanded ? "Collapse" : "Expand"}
              >
                <ChevronRight
                  size={14}
                  className={`transition-transform duration-200 ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Nested Child Nodes & Products */}
        {isExpanded && (
          <div className="relative border-l border-border/40 ml-4 pl-1 my-1 space-y-0.5 animate-in fade-in duration-150">
            {/* 1. Sub-categories */}
            {hasChildren &&
              cat.children!.map((child) => renderCategoryNode(child, level + 1))}

            {/* 2. Direct Products list inside this category */}
            {directProducts.length > 0 && (
              <div className="space-y-0.5 pt-1 pl-1">
                {directProducts.map((prod) => {
                  const isCurrent = currentProductSlug === prod.slug;
                  const matchesProd =
                    !searchFilter || prod.name.toLowerCase().includes(lowerSearch);
                  if (!matchesProd) return null;

                  return (
                    <Link
                      key={prod.id || prod.slug}
                      to={`/product/${prod.slug}`}
                      className={`group/prod flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs transition-all ${
                        isCurrent
                          ? "bg-primary text-primary-foreground font-bold shadow-sm"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                      }`}
                      style={{ paddingLeft: `${Math.max(8, (level + 1) * 12)}px` }}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        <Package
                          size={12}
                          className={
                            isCurrent
                              ? "text-primary-foreground"
                              : "text-primary/70 shrink-0 group-hover/prod:scale-110 transition-transform"
                          }
                        />
                        <span className="truncate text-[11px] font-medium">{prod.name}</span>
                      </div>
                      <ArrowRight
                        size={11}
                        className="opacity-0 group-hover/prod:opacity-100 transition-opacity shrink-0 text-primary"
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-full bg-card border border-border rounded-2xl shadow-sm p-4 space-y-4 lg:max-h-[calc(100vh-10rem)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Package size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
              {title}
            </h3>
            <p className="text-[10px] text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <button
          onClick={() => {
            if (expandedSlugs.size > 0) {
              setExpandedSlugs(new Set());
            } else {
              const allSlugs = new Set<string>();
              const collect = (list: Category[]) => {
                list.forEach((c) => {
                  allSlugs.add(c.slug);
                  if (c.children) collect(c.children);
                });
              };
              collect(categories);
              setExpandedSlugs(allSlugs);
            }
          }}
          className="text-[10px] font-bold text-primary hover:underline"
        >
          {expandedSlugs.size > 0 ? "Collapse All" : "Expand All"}
        </button>
      </div>

      {/* Filter search box */}
      <div className="relative shrink-0">
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter categories & products..."
          className="w-full h-8 pl-8 pr-3 text-xs bg-accent/60 border border-border/60 rounded-xl
                     placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        />
        <Search
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        {searchFilter && (
          <button
            onClick={() => setSearchFilter("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Quick All Products Button */}
      {onSelectAll && (
        <button
          type="button"
          onClick={onSelectAll}
          className={`w-full shrink-0 flex items-center justify-between py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            !activeSlug
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "text-foreground/80 hover:text-primary hover:bg-primary/5 border border-border/40"
          }`}
        >
          <span className="flex items-center gap-2">
            <Layers size={14} />
            All {title}
          </span>
          {products && products.length > 0 && (
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                !activeSlug
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {products.length}
            </span>
          )}
        </button>
      )}

      {/* Categories & Products Tree */}
      <div className="space-y-0.5 flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-thin">
        {categories.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            Loading catalog items...
          </div>
        ) : (
          categories.map((cat) => renderCategoryNode(cat, 0))
        )}
      </div>
    </aside>
  );
};
