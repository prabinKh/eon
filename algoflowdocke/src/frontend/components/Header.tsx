import { useState, useSyncExternalStore, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, Package, Star, MapPin, Heart, GitCompareArrows, LayoutGrid, ChevronDown, ChevronRight, LogOut, LayoutDashboard, History, MessageSquare, Sparkles, CreditCard, MessageSquarePlus, Wrench, Layers } from "lucide-react";
import { cartStore } from "@/stores/cart";
import { wishlistStore } from "@/stores/wishlist";
import { compareStore } from "@/stores/compare";
import { type Category, type Product, type MegaMenuItem } from "@/lib/types";
import { renderCategoryIcon, getCategoryColor } from "@/lib/icons";
import { CartSidebar } from "./CartSidebar";
import { ModeToggle } from "@/components/ModeToggle";
import { toast } from "sonner";
import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";

import { useCategories, useCategoryTree } from "@/hooks/useCategories";
import { useBrands } from "@/hooks/useBrands";
import { productService } from "@/api/productService";
import { useStore } from "@/frontend/context/StoreContext";

export const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [expandedMenuCat, setExpandedMenuCat] = useState<string | null>(null);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [menuTop, setMenuTop] = useState(0);
  const [clampedTop, setClampedTop] = useState(0);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const { categories } = useCategories();
  const { brands } = useBrands();
  const { company } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Top Nav Bar: Dynamically populated from backend
  const dynamicNavItems = useMemo(() => {
    const baseItems = [
      { label: 'Home', href: '/', sub: undefined as { label: string; href: string }[] | undefined },
      { label: 'Solutions', href: '/solutions', sub: undefined as { label: string; href: string }[] | undefined },
      { label: 'Service Center', href: '/service-center', sub: undefined as { label: string; href: string }[] | undefined },
      { label: 'Offers', href: '/offers', sub: undefined as { label: string; href: string }[] | undefined },
    ];

    const brandNav = (brands && brands.length > 0)
      ? brands.map(b => ({
          label: b.name,
          href: `/brand/${b.slug || b.name.toLowerCase().replace(/\s+/g, '-')}`,
          sub: undefined as { label: string; href: string }[] | undefined,
        }))
      : [
          { label: 'Dahua', href: '/brand/dahua', sub: undefined },
          { label: 'CP Plus', href: '/brand/cp-plus', sub: undefined },
          { label: 'Ant Esports', href: '/brand/ant-esports', sub: undefined },
          { label: 'Intex', href: '/brand/intex', sub: undefined },
          { label: 'Bestor', href: '/brand/bestor', sub: undefined },
        ];

    return [...baseItems, ...brandNav];
  }, [brands]);

  const isHomePage = location.pathname === "/";

  // Check for admin state
  useEffect(() => {
    if (user) {
      const adminEmail = "algoflownono1264@gmail.com";
      const isUserAdmin = user.is_staff || user.is_superuser || user.email === adminEmail;
      setIsAdmin(!!isUserAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // Click outside to close nav dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.nav-dropdown-wrapper')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (hoveredCat && flyoutRef.current) {
      const flyoutHeight = flyoutRef.current.offsetHeight;
      const dropdown = flyoutRef.current.closest('.category-dropdown-container');
      if (dropdown) {
        const dropdownHeight = (dropdown as HTMLElement).offsetHeight;
        const idealTop = menuTop - (flyoutHeight / 2);
        const safeTop = Math.max(0, Math.min(idealTop, Math.max(0, dropdownHeight - flyoutHeight)));
        setClampedTop(safeTop);
      }
    }
  }, [hoveredCat, menuTop]);

  const dynamicMegaMenu = useMemo(() => {
    const menuData: Record<string, MegaMenuItem> = {};

    categories.forEach(cat => {
      const dynamicColumns: MegaMenuItem['columns'] = [];

      // 1. Categories/Subcategories Column
      if (cat.sections && cat.sections.length > 0) {
        cat.sections.forEach(section => {
          dynamicColumns.push({
            type: 'categories',
            title: section.title,
            items: section.items.map(item => ({
              name: item.name,
              href: (item.slug && typeof item.slug === 'string' && item.slug.startsWith('/')) ? item.slug : `/category/${item.slug || ''}`
            }))
          });
        });
      } else {
        const subItems = cat.subcategories && cat.subcategories.length > 0
          ? cat.subcategories.slice(0, 10).map(s => ({ name: s.name, href: `/category/${s.slug}` }))
          : [{ name: 'All ' + cat.name, href: `/category/${cat.slug}` }];
        dynamicColumns.push({
          type: 'categories',
          title: 'Subcategories',
          items: subItems
        });
      }

      // 2. Brands Column
      const architectureBrands = cat.brands || ['Dahua'];
      dynamicColumns.push({
        type: 'brands',
        title: 'Top Brands',
        items: architectureBrands.map(brand => ({
          name: brand,
          href: `/category/${cat.slug}?brand=${brand}`
        }))
      });

      // 3. More Categories if any
      if (cat.subcategories && cat.subcategories.length > 10) {
        dynamicColumns.push({
          type: 'categories',
          title: 'More Categories',
          items: cat.subcategories.slice(10, 20).map(s => ({ name: s.name, href: `/category/${s.slug}` }))
        });
      }

      menuData[cat.slug] = {
        title: cat.name,
        href: `/category/${cat.slug}`,
        columns: dynamicColumns
      };
    });

    return menuData;
  }, [categories]);

  const renderIcon = (icon: string, name: string = '') => {
    return renderCategoryIcon(icon, 18, getCategoryColor(name));
  };

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  // Close categories when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showCategories && !target.closest('.category-dropdown-container')) {
        setShowCategories(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCategories]);

  useEffect(() => {
    setShowCategories(false);
  }, [location.pathname]);

  const cartItems = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot);
  const wishlistItems = useSyncExternalStore(wishlistStore.subscribe, wishlistStore.getSnapshot);
  const compareItems = useSyncExternalStore(compareStore.subscribe, compareStore.getSnapshot);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    if (searchQuery.trim().length <= 1) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await productService.search(searchQuery.trim(), 6);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border shadow-[var(--shadow-sm)]">
        <div className="neo-container">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3 sm:gap-4">
            {/* Mobile menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <Link to="/" className="flex items-center group py-1">
                <img
                  src={company?.logo || "/eontechnology-logo.png"}
                  alt={company?.name || "Eon Technology"}
                  className="min-w-[140px] w-[140px] sm:w-[165px] h-auto max-h-12 object-contain transition-transform group-hover:scale-105"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== `${window.location.origin}/eontechnology-logo.png`) {
                      target.src = "/eontechnology-logo.png";
                    }
                  }}
                />
              </Link>

              {/* Mobile Category Toggle */}
              <div className="lg:hidden relative category-dropdown-container">
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className="p-2 text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 bg-accent/50 rounded-xl border border-border/60"
                >
                  <LayoutGrid size={20} className="text-primary" />
                  <span className="text-xs font-black uppercase tracking-wider text-foreground">Categories</span>
                </button>
                
                {showCategories && (
                  <div className="fixed inset-0 bg-background z-[100] flex flex-col animate-in fade-in slide-in-from-right duration-300">
                    <div className="flex items-center justify-between p-5 border-b border-border bg-card">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                          <LayoutGrid size={24} />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-wider text-foreground">Browse Categories</h2>
                      </div>
                      <button 
                        onClick={() => setShowCategories(false)} 
                        className="p-2.5 hover:bg-accent rounded-full transition-colors"
                      >
                        <X size={26} />
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                      <div className="p-4 space-y-4">
                        {categories.map(cat => {
                          const isExpanded = expandedCat === cat.slug;
                          return (
                            <div key={cat.slug} className="space-y-2">
                              <button
                                onClick={() => setExpandedCat(isExpanded ? null : cat.slug)}
                                className={`flex items-center justify-between w-full p-4 border rounded-2xl transition-all ${
                                  isExpanded 
                                    ? "bg-primary/5 border-primary/30 shadow-sm" 
                                    : "bg-accent/30 border-border hover:bg-accent/50"
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  <span className={`text-2xl w-12 h-12 flex items-center justify-center rounded-2xl shadow-sm transition-colors ${
                                    isExpanded ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                                  }`}>
                                    {renderIcon(cat.icon)}
                                  </span>
                                  <span className={`font-black text-base ${isExpanded ? "text-primary" : "text-foreground"}`}>
                                    {cat.name}
                                  </span>
                                </div>
                                <ChevronDown 
                                  size={20} 
                                  className={`transition-transform duration-300 ${isExpanded ? "rotate-180 text-primary" : "text-muted-foreground"}`} 
                                />
                              </button>

                              {/* Accordion Content */}
                              {isExpanded && dynamicMegaMenu[cat.slug] && (
                                <div className="mx-2 p-4 bg-card border border-border rounded-2xl space-y-6 animate-in slide-in-from-top-2 duration-300">
                                  {/* Quick Link to Category Page */}
                                  <Link
                                    to={`/category/${cat.slug}`}
                                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary/10 text-primary rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/20 transition-colors"
                                    onClick={() => setShowCategories(false)}
                                  >
                                    View All {cat.name}
                                  </Link>

                                  {dynamicMegaMenu[cat.slug].columns.map((col, idx) => (
                                    <div key={idx} className="space-y-3">
                                      <h4 className="text-xs font-black uppercase tracking-wider text-primary/80 flex items-center gap-2 border-b border-border/50 pb-1">
                                        <span className="w-1.5 h-3.5 bg-primary rounded-full" />
                                        {col.title}
                                      </h4>
                                      <div className="grid grid-cols-2 gap-2">
                                        {col.items.map((item, iIdx) => (
                                          <Link 
                                            key={iIdx} 
                                            to={item.href} 
                                            className="flex flex-col gap-1.5 p-2.5 rounded-xl hover:bg-accent transition-colors group bg-accent/30 border border-border/40"
                                            onClick={() => setShowCategories(false)}
                                          >
                                            {col.type === 'products' && item.image ? (
                                              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                              </div>
                                            ) : null}
                                            <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                              {item.name}
                                            </span>
                                          </Link>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-4 border-t border-border bg-accent/10">
                      <p className="text-[10px] text-center text-muted-foreground uppercase tracking-[0.2em]">
                        {company ? `${company.name} navigation` : 'Eon Technology navigation'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search - Desktop */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl relative">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                  placeholder="Search products, brands, specs..."
                  className="w-full h-10 pl-4 pr-10 bg-accent border border-border rounded-lg text-sm
                           placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20
                           focus:border-primary transition-all"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                  <Search size={16} />
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {searchOpen && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-[var(--shadow-lg)] overflow-hidden z-50">
                  {searchResults.map(product => (
                    <Link
                      key={product.id}
                      to={product.slug || product.id ? `/product/${product.slug || product.id}` : "#"}
                      className={`flex items-center gap-3 p-3 hover:bg-accent transition-colors ${!(product.slug || product.id) ? "pointer-events-none" : ""}`}
                      onClick={() => { setSearchQuery(""); setSearchOpen(false); }}
                    >
                      <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg bg-accent" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-primary font-mono font-bold uppercase">{product.brand}</span>
                          {product.category && <span className="text-[10px] text-muted-foreground truncate">{product.category}</span>}
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Link
                    to={`/search?q=${encodeURIComponent(searchQuery)}`}
                    className="block text-center py-2.5 text-xs text-primary font-medium hover:bg-accent/50 border-t border-border transition-colors"
                    onClick={() => { setSearchQuery(""); setSearchOpen(false); }}
                  >
                    View all results →
                  </Link>
                </div>
              )}
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1.5">

              {/* Company Solutions Header Link */}
              <Link
                to="/solutions"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-foreground/85 hover:text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 transition-all shrink-0 group mr-0.5"
                title="Company Solutions"
              >
                <Layers size={14} className="text-primary group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline">Company Solutions</span>
                <span className="md:hidden">Solutions</span>
              </Link>

              {/* Quick Links Dropdown */}
              <div className="relative group/quick hidden sm:block">
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-primary rounded-lg hover:bg-accent transition-all group-hover/quick:text-primary group-hover/quick:bg-primary/5">
                  <LayoutGrid size={15} />
                  <span className="hidden md:inline">Menu</span>
                  <ChevronDown size={12} className="opacity-60 transition-transform duration-200 group-hover/quick:rotate-180 group-hover/quick:opacity-100" />
                </button>
                <div className="absolute right-0 top-full pt-1.5 w-56 z-[100] opacity-0 invisible group-hover/quick:opacity-100 group-hover/quick:visible transition-all duration-200 pointer-events-none group-hover/quick:pointer-events-auto">
                  <div className="absolute -top-2 left-0 right-0 h-3" />
                  <div className="bg-popover/95 backdrop-blur-xl border border-border/80 rounded-xl shadow-2xl p-1.5 ring-1 ring-black/5 dark:ring-white/10 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70 border-b border-border/40 mb-1">
                      Quick Access
                    </div>
                    <Link to="/solutions" className="group/item flex items-center gap-3 px-3 py-2 text-xs font-semibold text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-150">
                      <Layers size={14} className="text-primary/70 group-hover/item:text-primary group-hover/item:scale-110 transition-transform" />
                      <span className="group-hover/item:translate-x-1 transition-transform">Company Solutions</span>
                    </Link>
                    <Link to="/compare" className="group/item flex items-center gap-3 px-3 py-2 text-xs font-semibold text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-150">
                      <GitCompareArrows size={14} className="text-primary/70 group-hover/item:text-primary group-hover/item:scale-110 transition-transform" />
                      <span className="group-hover/item:translate-x-1 transition-transform">Compare Products</span>
                      {compareItems.length > 0 && <span className="ml-auto bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">{compareItems.length}</span>}
                    </Link>
                    <Link to="/wishlist" className="group/item flex items-center gap-3 px-3 py-2 text-xs font-semibold text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-150">
                      <Heart size={14} className="text-rose-500/70 group-hover/item:text-rose-500 group-hover/item:scale-110 transition-transform" />
                      <span className="group-hover/item:translate-x-1 transition-transform">My Wishlist</span>
                      {wishlistItems.length > 0 && <span className="ml-auto bg-destructive text-destructive-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">{wishlistItems.length}</span>}
                    </Link>
                    <Link to="/track-orders" className="group/item flex items-center gap-3 px-3 py-2 text-xs font-semibold text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-150">
                      <Package size={14} className="text-amber-500/70 group-hover/item:text-amber-500 group-hover/item:scale-110 transition-transform" />
                      <span className="group-hover/item:translate-x-1 transition-transform">Track Orders</span>
                    </Link>
                    {user && (
                      <Link to="/customer/history" className="group/item flex items-center gap-3 px-3 py-2 text-xs font-semibold text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-150">
                        <History size={14} className="text-emerald-500/70 group-hover/item:text-emerald-500 group-hover/item:scale-110 transition-transform" />
                        <span className="group-hover/item:translate-x-1 transition-transform">Order History</span>
                      </Link>
                    )}
                    <div className="border-t border-border/50 my-1" />
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
                      className="w-full group/item flex items-center gap-3 px-3 py-2 text-xs font-semibold text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-150"
                    >
                      <MessageSquare size={14} className="text-primary/70 group-hover/item:text-primary group-hover/item:scale-110 transition-transform" />
                      <span className="group-hover/item:translate-x-1 transition-transform">Live Chat</span>
                    </button>
                  </div>
                </div>
              </div>

              {user ? (
                <div className="flex items-center gap-1">
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-1.5 px-2 sm:px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <LayoutDashboard size={14} />
                      <span className="hidden md:inline">Admin</span>
                    </Link>
                  )}
                  <div className="relative group">
                    <button className="flex items-center gap-1.5 px-2 sm:px-3 py-2 text-xs font-medium text-muted-foreground hover:text-primary rounded-lg hover:bg-accent transition-colors">
                      {user.name ? (
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[11px]">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <User size={16} />
                      )}
                      <span className="hidden md:inline max-w-[80px] truncate">{user.name || 'Account'}</span>
                      <ChevronDown size={12} className="opacity-60" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-[var(--shadow-lg)] py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <div className="px-4 py-3 border-b border-border mb-1">
                        <p className="text-xs font-bold truncate">{user.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-rose-500 hover:bg-rose-500/5 transition-colors font-medium"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/signin" className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors">
                  <User size={14} />
                  <span>Sign In</span>
                </Link>
              )}

              <div className="flex items-center gap-1 ml-1">
                <ModeToggle />
              </div>

              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-1.5 px-2 sm:px-3 py-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-accent transition-colors"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-mono font-bold rounded-full flex items-center justify-center animate-fade-in-up">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="lg:hidden pb-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full h-10 pl-4 pr-10 bg-accent border border-border rounded-lg text-sm
                         placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Eon Technology Product Nav Bar */}
        <div className="hidden lg:block border-t border-border bg-card/80 backdrop-blur-md relative z-40">
          <div className="neo-container">
            <nav className="flex items-center gap-1 h-11 relative overflow-visible">
              {dynamicNavItems.map((item) => {
                const isOpen = openDropdown === item.label;
                const isActive = item.href === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.href);

                return (
                  <div
                    key={item.label}
                    className={`nav-dropdown-wrapper ${isOpen ? 'is-open' : ''}`}
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setOpenDropdown(null)}
                      className={`flex items-center gap-1.5 px-4 h-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${
                        isActive || isOpen
                          ? "text-primary border-primary bg-primary/10 font-extrabold"
                          : "text-muted-foreground border-transparent hover:text-primary hover:border-primary hover:bg-primary/5"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.sub && (
                        <ChevronDown
                          size={12}
                          className={`opacity-60 transition-transform duration-200 ${
                            isOpen ? "rotate-180 opacity-100 text-primary" : ""
                          }`}
                        />
                      )}
                    </Link>

                    {item.sub && (
                      <div
                        className="nav-dropdown-panel"
                        style={{ display: isOpen ? 'block' : undefined }}
                      >
                        <div className="nav-dropdown-card w-72">
                          <div className="px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 border-b border-border/50 mb-1.5 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {item.label} Products
                            </span>
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              {item.sub.length} Items
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            {item.sub.map((sub) => (
                              <Link
                                key={sub.label}
                                to={sub.href}
                                onClick={() => setOpenDropdown(null)}
                                className="nav-dropdown-item group/item"
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 group-hover/item:bg-primary group-hover/item:scale-125 transition-all duration-150 shrink-0" />
                                  <span className="truncate group-hover/item:text-primary transition-colors">
                                    {sub.label}
                                  </span>
                                </div>
                                <ChevronRight
                                  size={14}
                                  className="text-primary opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-150 shrink-0"
                                />
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-foreground/40 backdrop-blur-md lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <nav className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-85 bg-card shadow-2xl flex flex-col animate-slide-in-left border-r border-border" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between bg-card">
              <Link to="/" className="flex items-center group py-1" onClick={() => setMobileMenuOpen(false)}>
                <img
                  src={company?.logo || "/eontechnology-logo.png"}
                  alt={company?.name || "Eon Technology"}
                  className="h-9 sm:h-10 w-auto object-contain"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== `${window.location.origin}/eontechnology-logo.png`) {
                      target.src = "/eontechnology-logo.png";
                    }
                  }}
                />
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2.5 hover:bg-accent rounded-full transition-colors text-foreground">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">Main Categories</h3>
                  <div className="space-y-2">
                    {categories.map(cat => {
                      const isExpanded = expandedMenuCat === cat.slug;
                      return (
                        <div key={cat.slug} className="space-y-1">
                          <button
                            onClick={() => setExpandedMenuCat(isExpanded ? null : cat.slug)}
                            className={`flex items-center gap-4 w-full px-4 py-3.5 text-base font-bold rounded-2xl transition-all ${
                              isExpanded ? "bg-primary text-primary-foreground shadow-md" : "text-foreground bg-accent/30 border border-border/50 hover:bg-primary/10 hover:text-primary"
                            }`}
                          >
                            <span className="text-2xl">{renderIcon(cat.icon)}</span>
                            <span className="font-bold text-base">{cat.name}</span>
                            <ChevronDown 
                              size={18} 
                              className={`ml-auto transition-transform duration-300 ${isExpanded ? "rotate-180" : "opacity-60"}`} 
                            />
                          </button>

                          {isExpanded && dynamicMegaMenu[cat.slug] && (
                            <div className="ml-4 pl-4 border-l-2 border-primary/30 py-2 space-y-4 animate-in slide-in-from-top-2 duration-200">
                              {dynamicMegaMenu[cat.slug].columns.map((col, idx) => (
                                <div key={idx} className="space-y-2">
                                  <h4 className="text-xs font-black uppercase tracking-wider text-primary">
                                    {col.title}
                                  </h4>
                                  <div className="space-y-1.5">
                                    {col.items.map((item, iIdx) => (
                                      <Link
                                        key={iIdx}
                                        to={item.href}
                                        className="block py-2 text-sm font-semibold text-foreground/90 hover:text-primary transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                      >
                                        {item.name}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              <Link
                                to={`/category/${cat.slug}`}
                                className="block py-2.5 text-sm font-black text-primary hover:underline uppercase tracking-wider"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                View All {cat.name} →
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">Features & Services</h3>
                  <div className="space-y-2">
                    <Link to="/solutions" className="flex items-center gap-3.5 px-4 py-3.5 text-base font-bold text-foreground bg-accent/40 hover:bg-primary/10 hover:text-primary rounded-2xl border border-border/50" onClick={() => setMobileMenuOpen(false)}>
                      <Layers size={22} className="text-primary" /> 
                      <span>Company Solutions</span>
                    </Link>
                    <Link to="/requirement-finder" className="flex items-center gap-3.5 px-4 py-3.5 text-base font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-2xl border border-primary/20" onClick={() => setMobileMenuOpen(false)}>
                      <Sparkles size={22} className="animate-pulse text-primary" /> 
                      <span>AI Finder</span>
                    </Link>
                    <Link to="/emi" className="flex items-center gap-3.5 px-4 py-3.5 text-base font-bold text-foreground bg-accent/40 hover:bg-primary/10 hover:text-primary rounded-2xl border border-border/50" onClick={() => setMobileMenuOpen(false)}>
                      <CreditCard size={22} className="text-amber-500" /> 
                      <span>EMI Financing</span>
                      <span className="ml-auto bg-amber-500/10 text-amber-500 text-xs font-extrabold px-2.5 py-0.5 rounded-full">0% Interest</span>
                    </Link>
                    <Link to="/feedback" className="flex items-center gap-3.5 px-4 py-3.5 text-base font-bold text-foreground bg-accent/40 hover:bg-primary/10 hover:text-primary rounded-2xl border border-border/50" onClick={() => setMobileMenuOpen(false)}>
                      <MessageSquarePlus size={22} className="text-blue-500" /> 
                      <span>Feedback & Reviews</span>
                    </Link>
                    <Link to="/service-center" className="flex items-center gap-3.5 px-4 py-3.5 text-base font-bold text-foreground bg-accent/40 hover:bg-primary/10 hover:text-primary rounded-2xl border border-border/50" onClick={() => setMobileMenuOpen(false)}>
                      <Wrench size={22} className="text-primary" /> 
                      <span>Service Center</span>
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-3.5 px-4 py-3.5 text-base font-bold text-foreground bg-accent/40 hover:bg-primary/10 hover:text-primary rounded-2xl border border-border/50" onClick={() => setMobileMenuOpen(false)}>
                      <Heart size={22} className="text-destructive" /> 
                      <span>Wishlist</span>
                      {wishlistItems.length > 0 && <span className="ml-auto bg-destructive text-destructive-foreground text-xs font-black px-2.5 py-0.5 rounded-full">{wishlistItems.length}</span>}
                    </Link>
                    <Link to="/compare" className="flex items-center gap-3.5 px-4 py-3.5 text-base font-bold text-foreground bg-accent/40 hover:bg-primary/10 hover:text-primary rounded-2xl border border-border/50" onClick={() => setMobileMenuOpen(false)}>
                      <GitCompareArrows size={22} className="text-primary" /> 
                      <span>Compare</span>
                      {compareItems.length > 0 && <span className="ml-auto bg-primary text-primary-foreground text-xs font-black px-2.5 py-0.5 rounded-full">{compareItems.length}</span>}
                    </Link>
                    <Link to="/track-orders" className="flex items-center gap-3.5 px-4 py-3.5 text-base font-bold text-foreground bg-accent/40 hover:bg-primary/10 hover:text-primary rounded-2xl border border-border/50" onClick={() => setMobileMenuOpen(false)}>
                      <Package size={22} className="text-emerald-500" /> 
                      <span>Track Orders</span>
                    </Link>
                    {user && (
                      <Link to="/customer/history" className="flex items-center gap-3.5 px-4 py-3.5 text-base font-bold text-foreground bg-accent/40 hover:bg-primary/10 hover:text-primary rounded-2xl border border-border/50" onClick={() => setMobileMenuOpen(false)}>
                        <History size={22} className="text-blue-500" /> 
                        <span>History</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-border bg-accent/20">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5 px-2 py-1">
                    {user.name ? (
                      <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-black text-base">
                        {user.name.charAt(0)}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                        <User size={22} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-base font-black truncate text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-primary-foreground rounded-2xl font-black text-sm shadow-lg shadow-primary/20"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard size={18} />
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl font-bold text-sm"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link 
                  to="/signin" 
                  className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-base shadow-xl shadow-primary/25"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={20} />
                  Sign In / Register
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};
