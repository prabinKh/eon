import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { 
  FolderTree, 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Package, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  Check, 
  X, 
  RefreshCw,
  FolderPlus,
  ArrowRight,
  ListTree,
  Table as TableIcon,
  Building2,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { categoryService } from "@/api/categoryService";
import { brandService, type Brand } from "@/api/brandService";
import { type Category } from "@/lib/types";

interface CategoryFormData {
  name: string;
  slug: string;
  brand: string;
  parent: string | null;
  order: number;
  icon: string;
  image: string;
  description: string;
  is_active: boolean;
}

const initialFormData: CategoryFormData = {
  name: "",
  slug: "",
  brand: "",
  parent: null,
  order: 0,
  icon: "",
  image: "",
  description: "",
  is_active: true,
};

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [treeCategories, setTreeCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"tree" | "table">("tree");
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allList, treeList, brandList] = await Promise.all([
        categoryService.getAll(),
        categoryService.getTree(),
        brandService.getAll(),
      ]);
      setCategories(allList || []);
      setTreeCategories(treeList || []);
      setBrands(brandList || []);
      
      // Expand root nodes by default
      const initialExpanded = new Set<string>();
      (treeList || []).forEach(cat => initialExpanded.add(cat.id));
      setExpandedIds(initialExpanded);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (cats: Category[]) => {
      cats.forEach(c => {
        allIds.add(c.id);
        if (c.children && c.children.length > 0) {
          collectIds(c.children);
        }
      });
    };
    collectIds(treeCategories);
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleOpenAdd = (parentCategory?: Category) => {
    setEditingCategory(null);
    const parentBrand = parentCategory?.related_brands?.[0] || 
      (Array.isArray(parentCategory?.brands) ? parentCategory?.brands[0] : "") || 
      (parentCategory?.brand_list?.[0] || "");
    setFormData({
      ...initialFormData,
      brand: parentBrand || (selectedBrandFilter !== "all" ? selectedBrandFilter : ""),
      parent: parentCategory ? parentCategory.id : null,
      order: 0,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    const catBrand = cat.related_brands?.[0] || 
      (Array.isArray(cat.brands) ? cat.brands[0] : "") || 
      (cat.brand_list?.[0] || "");
    setFormData({
      name: cat.name,
      slug: cat.slug,
      brand: catBrand,
      parent: cat.parent || (cat.parent_id ? String(cat.parent_id) : null),
      order: cat.order ?? 0,
      icon: cat.icon || "",
      image: cat.image || "",
      description: cat.description || "",
      is_active: cat.is_active ?? true,
    });
    setModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setSubmitting(true);
      const payload: Partial<Category> & { brand?: string; brand_id?: string } = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
        parent: formData.parent || undefined,
        brand: formData.brand || undefined,
        brand_id: formData.brand || undefined,
        order: Number(formData.order) || 0,
        icon: formData.icon.trim() || undefined,
        image: formData.image.trim() || undefined,
        description: formData.description.trim() || undefined,
        is_active: formData.is_active,
      };

      if (editingCategory) {
        await categoryService.update(editingCategory.slug, payload);
        toast.success(`Category "${formData.name}" updated successfully`);
      } else {
        await categoryService.create(payload);
        toast.success(`Category "${formData.name}" created successfully`);
      }

      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-tree'] });
      await fetchData();
    } catch (err: unknown) {
      console.error(err);
      toast.error(editingCategory ? "Failed to update category" : "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await categoryService.delete(cat.slug);
      toast.success(`Category "${cat.name}" deleted`);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-tree'] });
      await fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category");
    }
  };

  // Build flattened list with indentation for parent selector
  const buildFlatHierarchy = (
    items: Category[], 
    depth = 0, 
    excludeId?: string
  ): Array<{ id: string; name: string; depth: number; full_path?: string }> => {
    let result: Array<{ id: string; name: string; depth: number; full_path?: string }> = [];
    for (const item of items) {
      if (excludeId && item.id === excludeId) continue;
      result.push({
        id: item.id,
        name: `${"─ ".repeat(depth)}${item.name}`,
        depth,
        full_path: item.full_path,
      });
      if (item.children && item.children.length > 0) {
        result = result.concat(buildFlatHierarchy(item.children, depth + 1, excludeId));
      }
    }
    return result;
  };

  const availableParents = buildFlatHierarchy(treeCategories, 0, editingCategory?.id);

  // Filter tree categories by Brand and Search
  const filterTreeRecursively = (nodes: Category[]): Category[] => {
    return nodes.reduce<Category[]>((acc, node) => {
      const nodeBrandList = [
        ...(node.related_brands || []),
        ...(node.brand_list || []),
        ...(Array.isArray(node.brands) ? node.brands : [])
      ];

      const brandMatch = selectedBrandFilter === "all" || nodeBrandList.some(
        b => String(b).toLowerCase() === selectedBrandFilter.toLowerCase()
      );

      const searchMatch = !searchQuery.trim() ||
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (node.full_path && node.full_path.toLowerCase().includes(searchQuery.toLowerCase()));

      const filteredChildren = node.children && node.children.length > 0 
        ? filterTreeRecursively(node.children) 
        : [];

      if ((brandMatch && searchMatch) || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren,
        });
      }
      return acc;
    }, []);
  };

  const displayedTree = useMemo(() => {
    if (selectedBrandFilter === "all" && !searchQuery.trim()) {
      return treeCategories;
    }
    return filterTreeRecursively(treeCategories);
  }, [treeCategories, selectedBrandFilter, searchQuery]);

  // Filtered categories for table view
  const filteredCategories = categories.filter(c => {
    const nodeBrandList = [
      ...(c.related_brands || []),
      ...(c.brand_list || []),
      ...(Array.isArray(c.brands) ? c.brands : [])
    ];
    const brandMatch = selectedBrandFilter === "all" || nodeBrandList.some(
      b => String(b).toLowerCase() === selectedBrandFilter.toLowerCase()
    );
    const searchMatch = !searchQuery.trim() ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.full_path && c.full_path.toLowerCase().includes(searchQuery.toLowerCase()));

    return brandMatch && searchMatch;
  });

  // Stats calculation
  const totalCategories = categories.length;
  const rootCategoriesCount = treeCategories.length;
  const maxDepth = Math.max(0, ...categories.map(c => c.depth ?? 0));
  const totalProducts = categories.reduce((sum, c) => sum + (c.product_count || 0), 0);

  // Recursive Tree Node Component
  const TreeNode = ({ node, level = 0 }: { node: Category; level?: number }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const categoryUrl = `/products/${node.full_path || node.slug}`;

    return (
      <div className="select-none">
        <div 
          className={`group flex items-center justify-between py-2.5 px-3 rounded-xl border transition-all ${
            level === 0 
              ? "bg-card hover:bg-muted/40 border-border/80 font-semibold mb-2 shadow-xs" 
              : "bg-muted/20 hover:bg-muted/50 border-border/40 my-1"
          }`}
          style={{ marginLeft: `${level * 24}px` }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {hasChildren ? (
              <button 
                onClick={() => toggleExpand(node.id)}
                className="p-1 hover:bg-accent rounded-lg text-muted-foreground transition-colors"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              <span className="w-6 h-6 flex items-center justify-center text-muted-foreground/40 text-xs">●</span>
            )}

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold truncate text-foreground">
                {node.name}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground/70 hidden sm:inline">
                /{node.slug}
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                Lvl {node.depth ?? level}
              </Badge>
              {((node.related_brands && node.related_brands.length > 0) || (node.brand_list && node.brand_list.length > 0)) && (
                <Badge variant="outline" className="text-[10px] px-2 py-0 border-emerald-500/30 text-emerald-600 bg-emerald-500/5 font-semibold flex items-center gap-1">
                  <Building2 size={10} />
                  {node.related_brands?.[0] || node.brand_list?.[0]}
                </Badge>
              )}
              {node.is_active === false && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  Inactive
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mr-2 font-mono">
              <Package size={13} className="text-emerald-500" />
              <span>{node.product_count ?? 0}</span>
            </div>

            {/* Quick Actions */}
            <div className="opacity-80 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
              <button
                onClick={() => handleOpenAdd(node)}
                className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors"
                title="Add Subcategory under this"
              >
                <PlusCircle size={15} />
              </button>
              <Link
                to={categoryUrl}
                target="_blank"
                className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                title="View on store"
              >
                <ExternalLink size={14} />
              </Link>
              <button
                onClick={() => handleOpenEdit(node)}
                className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                title="Edit category"
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={() => handleDelete(node)}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                title="Delete category"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-border/60 ml-3 pl-1">
            {node.children!.map((child) => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <FolderTree size={22} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-foreground uppercase">
                Categories & <span className="text-emerald-500">Hierarchy</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage multi-level category trees, series, subcategories, and catalog paths
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData} 
            disabled={loading}
            className="rounded-xl gap-1.5"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button 
            onClick={() => handleOpenAdd()} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 font-bold shadow-sm"
          >
            <Plus size={16} />
            Add Root Category
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Categories</span>
          <div className="text-2xl font-black text-foreground mt-1">{totalCategories}</div>
          <span className="text-[11px] text-muted-foreground">Across all levels</span>
        </div>
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Root Categories</span>
          <div className="text-2xl font-black text-emerald-500 mt-1">{rootCategoriesCount}</div>
          <span className="text-[11px] text-muted-foreground">Top-level sections</span>
        </div>
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Hierarchy Depth</span>
          <div className="text-2xl font-black text-blue-500 mt-1">{maxDepth + 1} <span className="text-xs font-normal text-muted-foreground">Levels</span></div>
          <span className="text-[11px] text-muted-foreground">Deep nested hierarchy</span>
        </div>
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Catalog Products</span>
          <div className="text-2xl font-black text-purple-500 mt-1">{totalProducts}</div>
          <span className="text-[11px] text-muted-foreground">In active categories</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/80">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search categories or path..."
              className="pl-9 h-9 text-xs rounded-xl bg-muted/40 border-border/60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/40 border border-border/60 rounded-xl">
            <Building2 size={13} className="text-emerald-500 flex-shrink-0" />
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Brand:</span>
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-foreground outline-none cursor-pointer"
            >
              <option value="all" className="bg-card text-foreground">All Brands ({brands.length})</option>
              {brands.map((b) => (
                <option key={b.id || b.slug} value={b.name} className="bg-card text-foreground">
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {viewMode === "tree" && (
            <>
              <Button variant="ghost" size="sm" onClick={expandAll} className="text-xs h-8 rounded-lg">
                Expand All
              </Button>
              <Button variant="ghost" size="sm" onClick={collapseAll} className="text-xs h-8 rounded-lg">
                Collapse All
              </Button>
            </>
          )}

          <div className="flex items-center border border-border rounded-xl p-0.5 bg-muted/30">
            <button
              onClick={() => setViewMode("tree")}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                viewMode === "tree" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground"
              }`}
              title="Hierarchy Tree View"
            >
              <ListTree size={15} />
              <span className="hidden sm:inline">Tree</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                viewMode === "table" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground"
              }`}
              title="Flat Table View"
            >
              <TableIcon size={15} />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="animate-spin text-emerald-500" size={28} />
          <p className="text-xs text-muted-foreground">Loading category hierarchy...</p>
        </div>
      ) : viewMode === "tree" ? (
        /* HIERARCHY TREE VIEW */
        <div className="bg-card/50 border border-border/80 rounded-2xl p-4 sm:p-6 space-y-2">
          {displayedTree.length === 0 ? (
            <div className="text-center py-12">
              <FolderPlus size={36} className="mx-auto text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm font-semibold text-muted-foreground">
                {selectedBrandFilter !== "all" 
                  ? `No categories found for brand "${selectedBrandFilter}"`
                  : "No categories found"}
              </p>
              <Button onClick={() => handleOpenAdd()} size="sm" className="mt-3 bg-emerald-600 text-white rounded-xl">
                Create First Category
              </Button>
            </div>
          ) : (
            displayedTree.map((node) => (
              <TreeNode key={node.id} node={node} level={0} />
            ))
          )}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border/80 uppercase text-[10px] font-bold text-muted-foreground tracking-wider">
                <tr>
                  <th className="px-4 py-3">Category Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Full URL Path</th>
                  <th className="px-4 py-3">Parent</th>
                  <th className="px-4 py-3 text-center">Depth</th>
                  <th className="px-4 py-3 text-center">Order</th>
                  <th className="px-4 py-3 text-center">Products</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {cat.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{cat.slug}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {(cat.related_brands?.[0] || cat.brand_list?.[0]) ? (
                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/20 bg-emerald-500/5 font-semibold flex items-center gap-1 w-fit">
                          <Building2 size={10} />
                          {cat.related_brands?.[0] || cat.brand_list?.[0]}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground/40 italic">Global</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground/80 max-w-xs truncate">
                      {cat.full_path ? `/products/${cat.full_path}` : `/products/${cat.slug}`}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {cat.parent_name ? (
                        <Badge variant="outline" className="text-[10px]">
                          {cat.parent_name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground/50 italic">None (Root)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-mono">
                      <Badge variant="secondary" className="text-[10px]">
                        Lvl {cat.depth ?? 0}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center font-mono">{cat.order ?? 0}</td>
                    <td className="px-4 py-3 text-center font-mono font-semibold text-emerald-600">
                      {cat.product_count ?? 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge 
                        variant={cat.is_active !== false ? "default" : "destructive"} 
                        className="text-[10px] px-2 py-0"
                      >
                        {cat.is_active !== false ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenAdd(cat)}
                          className="p-1 hover:bg-emerald-500/10 text-emerald-600 rounded"
                          title="Add child subcategory"
                        >
                          <PlusCircle size={14} />
                        </button>
                        <Link
                          to={`/products/${cat.full_path || cat.slug}`}
                          target="_blank"
                          className="p-1 hover:bg-accent text-muted-foreground hover:text-foreground rounded"
                          title="View on store"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1 hover:bg-accent text-muted-foreground hover:text-foreground rounded"
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-1 hover:bg-rose-500/10 text-rose-500 rounded"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-5">
              <h2 className="text-xl font-bold text-foreground">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {editingCategory 
                  ? `Updating ${editingCategory.name}` 
                  : "Add a new category or subcategory to your catalog tree"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* 1. Brand Selection Feature First */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-foreground text-xs flex items-center gap-1.5">
                    <Building2 size={15} className="text-emerald-500" />
                    Brand Association <span className="text-emerald-500 font-bold">(Select Brand First)</span>
                  </label>
                  {formData.brand && (
                    <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full">
                      Brand: {formData.brand}
                    </span>
                  )}
                </div>
                <select
                  value={formData.brand || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full h-10 rounded-xl bg-background border border-input px-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="">-- All / Global (No specific brand) --</option>
                  {brands.map((b) => (
                    <option key={b.id || b.slug} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-muted-foreground block">
                  Select brand first to bind this category to the brand's catalog and hierarchy.
                </span>
              </div>
              {/* Category Name */}
              <div>
                <label className="block font-semibold text-foreground mb-1">Category Name *</label>
                <Input
                  required
                  placeholder="e.g. Smart Dual Light or WizMind 4 Series"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block font-semibold text-foreground mb-1">Slug (URL Segment) *</label>
                <Input
                  required
                  placeholder="e.g. smart-dual-lght"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="rounded-xl h-10 font-mono text-xs"
                />
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  Used in URL: /products/.../<strong>{formData.slug || "slug"}</strong>
                </span>
              </div>

              {/* Parent Category Selector */}
              <div>
                <label className="block font-semibold text-foreground mb-1">Parent Category</label>
                <select
                  value={formData.parent || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, parent: e.target.value || null }))}
                  className="w-full h-10 rounded-xl bg-background border border-input px-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                >
                  <option value="">-- None (Root Level Category) --</option>
                  {availableParents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name} {parent.full_path ? `(/${parent.full_path})` : ""}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  Select a parent to nest this as a subcategory or series.
                </span>
              </div>

              {/* Order and Icon */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Display Order</label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="rounded-xl h-10 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Icon Identifier</label>
                  <Input
                    placeholder="e.g. Camera, Shield, Cpu"
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className="rounded-xl h-10 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block font-semibold text-foreground mb-1">Banner Image URL</label>
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-foreground mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of this category / series..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl bg-background border border-input p-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Active Switch */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="category_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-border text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="category_is_active" className="text-xs font-medium text-foreground cursor-pointer">
                  Active (Visible on frontend store and sidebar)
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold gap-1.5"
                >
                  {submitting && <RefreshCw size={13} className="animate-spin" />}
                  {editingCategory ? "Save Changes" : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
