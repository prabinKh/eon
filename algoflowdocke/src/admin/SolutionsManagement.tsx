import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Layers, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Check, 
  X, 
  ShieldCheck, 
  Network, 
  Gamepad2, 
  Monitor, 
  Laptop, 
  Server, 
  Building2,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { solutionService, type CompanySolution } from "@/api/solutionService";

const AVAILABLE_ICONS = [
  "ShieldCheck",
  "Network",
  "Gamepad2",
  "Monitor",
  "Laptop",
  "Server",
  "Layers",
  "Building2",
];

const PRESET_CATEGORIES = [
  "Surveillance & Security",
  "Network Infrastructure",
  "Gaming & Esports",
  "Smart Commercial",
  "Workstation Productivity",
  "Storage & Cloud Solutions",
];

export default function SolutionsManagement() {
  const [solutions, setSolutions] = useState<CompanySolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSolution, setEditingSolution] = useState<CompanySolution | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState<Partial<CompanySolution>>({
    title: "",
    category: "Surveillance & Security",
    tagline: "",
    summary: "",
    description: "",
    icon: "ShieldCheck",
    image: "",
    features: [],
    architecture_points: [],
    target_industries: [],
    contact_email: "solutions@eontechnology.com",
    contact_phone: "+977 1-4567890",
    order: 0,
    is_active: true,
  });

  // Dynamic Array Inputs
  const [newFeature, setNewFeature] = useState("");
  const [newArchPoint, setNewArchPoint] = useState("");
  const [newIndustry, setNewIndustry] = useState("");

  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSolutions = async () => {
    setLoading(true);
    try {
      const data = await solutionService.adminGetAll();
      setSolutions(data);
    } catch (err) {
      toast.error("Failed to load solutions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolutions();
  }, []);

  const openCreateModal = () => {
    setEditingSolution(null);
    setFormData({
      title: "",
      category: "Surveillance & Security",
      tagline: "",
      summary: "",
      description: "",
      icon: "ShieldCheck",
      image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80",
      features: [
        "24/7 High-Reliability Architecture",
        "Direct Eon Technology Warranty & SLA",
        "Tested for High-Density Enterprise Operations"
      ],
      architecture_points: [
        "Core Aggregation Switch",
        "End-Point Hardware Nodes",
        "Central Management Controller"
      ],
      target_industries: [
        "Commercial Facilities",
        "Corporate Offices"
      ],
      contact_email: "solutions@eontechnology.com",
      contact_phone: "+977 1-4567890",
      order: solutions.length + 1,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (sol: CompanySolution) => {
    setEditingSolution(sol);
    setFormData({
      ...sol,
      features: sol.features || [],
      architecture_points: sol.architecture_points || [],
      target_industries: sol.target_industries || [],
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      if (editingSolution) {
        await solutionService.adminUpdate(editingSolution.id, formData);
        toast.success("Solution updated successfully!");
      } else {
        await solutionService.adminCreate(formData);
        toast.success("Solution created successfully!");
      }
      setModalOpen(false);
      fetchSolutions();
    } catch (err) {
      toast.error("Failed to save solution");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (sol: CompanySolution) => {
    try {
      await solutionService.adminUpdate(sol.id, { is_active: !sol.is_active });
      toast.success(`Solution marked as ${!sol.is_active ? "Active" : "Inactive"}`);
      setSolutions(prev => prev.map(s => s.id === sol.id ? { ...s, is_active: !s.is_active } : s));
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await solutionService.adminDelete(id);
      toast.success("Solution deleted successfully!");
      setDeleteConfirmId(null);
      setSolutions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      toast.error("Failed to delete solution");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // Helper Array Modifiers
  const addFeature = () => {
    if (!newFeature.trim()) return;
    setFormData(prev => ({ ...prev, features: [...(prev.features || []), newFeature.trim()] }));
    setNewFeature("");
  };
  const removeFeature = (idx: number) => {
    setFormData(prev => ({ ...prev, features: (prev.features || []).filter((_, i) => i !== idx) }));
  };

  const addArchPoint = () => {
    if (!newArchPoint.trim()) return;
    setFormData(prev => ({ ...prev, architecture_points: [...(prev.architecture_points || []), newArchPoint.trim()] }));
    setNewArchPoint("");
  };
  const removeArchPoint = (idx: number) => {
    setFormData(prev => ({ ...prev, architecture_points: (prev.architecture_points || []).filter((_, i) => i !== idx) }));
  };

  const addIndustry = () => {
    if (!newIndustry.trim()) return;
    setFormData(prev => ({ ...prev, target_industries: [...(prev.target_industries || []), newIndustry.trim()] }));
    setNewIndustry("");
  };
  const removeIndustry = (idx: number) => {
    setFormData(prev => ({ ...prev, target_industries: (prev.target_industries || []).filter((_, i) => i !== idx) }));
  };

  const filteredSolutions = useMemo(() => {
    return solutions.filter(sol => {
      const matchesSearch = !search.trim() || 
        sol.title.toLowerCase().includes(search.toLowerCase()) ||
        sol.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || sol.category.toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [solutions, search, categoryFilter]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    solutions.forEach(s => s.category && set.add(s.category));
    return ["all", ...Array.from(set)];
  }, [solutions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Layers size={22} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Company Solutions Management
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Create, edit, manage, and delete hardware and architectural solutions presented to clients.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchSolutions}
            className="p-2.5 rounded-xl border border-border bg-accent/40 hover:bg-accent text-foreground transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 transition-all"
          >
            <Plus size={16} />
            <span>Add Solution</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search solutions by title, category..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-xs focus:border-primary outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 px-3 rounded-xl bg-card border border-border text-xs font-semibold text-foreground focus:border-primary outline-none"
        >
          {categories.map(c => (
            <option key={c} value={c}>
              {c === "all" ? "All Categories" : c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            <RefreshCw size={24} className="mx-auto animate-spin mb-3 text-primary" />
            Loading company solutions...
          </div>
        ) : filteredSolutions.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            <Layers size={36} className="mx-auto text-muted-foreground/40 mb-3" />
            No solutions found. Click "Add Solution" to create your first solution architecture.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-accent/40 text-muted-foreground font-black uppercase tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="py-3.5 px-4">Solution</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center">Order</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredSolutions.map((sol) => (
                  <tr key={sol.id} className="hover:bg-accent/20 transition-colors">
                    {/* Solution Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={sol.image || "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=200&q=80"}
                          alt={sol.title}
                          className="w-12 h-12 rounded-xl object-cover border border-border shrink-0 bg-accent"
                        />
                        <div className="min-w-0 max-w-sm">
                          <p className="font-bold text-foreground text-sm truncate">{sol.title}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{sol.tagline || sol.summary}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                        {sol.category}
                      </span>
                    </td>

                    {/* Order */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-muted-foreground">
                      {sol.order}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(sol)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                          sol.is_active
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                        title="Click to toggle visibility"
                      >
                        {sol.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                        <span>{sol.is_active ? "Active" : "Hidden"}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/solutions/${sol.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                          title="View on site"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <button
                          onClick={() => openEditModal(sol)}
                          className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                          title="Edit Solution"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(sol.id)}
                          className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                          title="Delete Solution"
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
        )}
      </div>

      {/* Modal: Create / Edit Solution */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <Layers size={18} />
                </div>
                <h3 className="text-lg font-black text-foreground">
                  {editingSolution ? "Edit Solution Architecture" : "Add New Solution Architecture"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Solution Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. AI Smart Surveillance"
                    className="w-full h-10 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    list="category-suggestions"
                    value={formData.category || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g. Surveillance & Security"
                    className="w-full h-10 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none"
                  />
                  <datalist id="category-suggestions">
                    {PRESET_CATEGORIES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="e.g. High-Density 4K AI Cameras with Deep Learning Analytics"
                  className="w-full h-10 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none"
                />
              </div>

              {/* Icon & Banner Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Icon</label>
                  <select
                    value={formData.icon || "ShieldCheck"}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none font-semibold"
                  >
                    {AVAILABLE_ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Banner Image URL</label>
                  <input
                    type="text"
                    value={formData.image || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://..."
                    className="w-full h-10 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none"
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Short Summary (Cards)</label>
                <textarea
                  rows={2}
                  value={formData.summary || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief overview displayed on solution cards..."
                  className="w-full p-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none resize-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Full Architecture Description</label>
                <textarea
                  rows={4}
                  value={formData.description || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed architectural breakdown, system performance specs, and topology..."
                  className="w-full p-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none resize-none"
                />
              </div>

              {/* Key Features (Array) */}
              <div className="space-y-2 border-t border-border pt-3">
                <label className="block text-xs font-bold text-foreground">Technical Capabilities / Features</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); }}}
                    placeholder="Add feature e.g. 24/7 4K WizSense AI"
                    className="flex-1 h-9 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-3.5 h-9 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(formData.features || []).map((feat, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent text-[11px] font-medium border border-border">
                      <span>{feat}</span>
                      <button type="button" onClick={() => removeFeature(idx)} className="text-muted-foreground hover:text-destructive">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Architecture Components (Array) */}
              <div className="space-y-2 border-t border-border pt-3">
                <label className="block text-xs font-bold text-foreground">Architecture Blueprint Components</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newArchPoint}
                    onChange={(e) => setNewArchPoint(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addArchPoint(); }}}
                    placeholder="Add component e.g. Gigabit Managed PoE Switch"
                    className="flex-1 h-9 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={addArchPoint}
                    className="px-3.5 h-9 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(formData.architecture_points || []).map((point, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent text-[11px] font-medium border border-border">
                      <span>{point}</span>
                      <button type="button" onClick={() => removeArchPoint(idx)} className="text-muted-foreground hover:text-destructive">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Target Industries (Array) */}
              <div className="space-y-2 border-t border-border pt-3">
                <label className="block text-xs font-bold text-foreground">Target Industries</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addIndustry(); }}}
                    placeholder="Add industry e.g. Banking, Hospitals, Schools"
                    className="flex-1 h-9 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={addIndustry}
                    className="px-3.5 h-9 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(formData.target_industries || []).map((ind, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent text-[11px] font-medium border border-border">
                      <span>{ind}</span>
                      <button type="button" onClick={() => removeIndustry(idx)} className="text-muted-foreground hover:text-destructive">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Order & Contact & Active */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border pt-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.order ?? 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="w-full h-10 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contact_email || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.contact_phone || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="solution-active-check"
                  checked={formData.is_active ?? true}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                />
                <label htmlFor="solution-active-check" className="text-xs font-bold text-foreground cursor-pointer">
                  Active (Published and visible to customers on website)
                </label>
              </div>

              {/* Actions */}
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
                  {saving ? "Saving..." : editingSolution ? "Save Changes" : "Create Solution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-foreground">Confirm Deletion</h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete this company solution? This action cannot be undone.
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
                disabled={deleting}
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold hover:bg-destructive/90 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
