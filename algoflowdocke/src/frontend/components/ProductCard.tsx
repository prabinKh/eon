import { Link } from "react-router-dom";
import { Star, Heart, GitCompareArrows, Eye, ArrowRight, MessageCircle } from "lucide-react";
import { type Product } from "@/lib/types";
import { wishlistStore } from "@/stores/wishlist";
import { compareStore } from "@/stores/compare";
import { toast } from "sonner";
import { useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CachedImage } from "@/components/ui/cached-image";
import { userActivityService } from "@/api/userActivityService";

type Props = {
  product: Product;
  index?: number;
};

export const ProductCard = ({ product, index = 0 }: Props) => {
  const wishlist = useSyncExternalStore(wishlistStore.subscribe, wishlistStore.getSnapshot);
  const compare = useSyncExternalStore(compareStore.subscribe, compareStore.getSnapshot);
  const isWishlisted = wishlist.some(p => p.id === product.id);
  const isComparing = compare.some(p => p.id === product.id);

  const handleCardClick = () => {
    userActivityService.track("click_product_card", {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      index
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = wishlistStore.toggle(product);
    toast(added ? "Added to wishlist" : "Removed from wishlist", {
      icon: <Heart className={`w-4 h-4 ${added ? "text-destructive fill-destructive" : ""}`} />,
    });
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = compareStore.toggle(product);
    if (result === null) {
      toast.error("You can compare up to 4 products");
    } else {
      toast(result ? "Added to compare" : "Removed from compare", {
        icon: <GitCompareArrows className="w-4 h-4 text-primary" />,
      });
    }
  };

  const handleQuery = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const payload = {
      type: 'product' as const,
      productName: product.name,
      productPrice: "",
      productUrl: window.location.origin + (product.slug || product.id ? `/product/${product.slug || product.id}` : ""),
      productImage: product.image
    };

    if (window.openChat) {
      window.openChat(payload);
    } else {
      window.dispatchEvent(new CustomEvent("open-chat", { detail: payload }));
    }
  };

  // ── Star Rating Logic ─────────────────────────────────────────────────────
  const numericRating = Math.min(5, Math.max(0, product.rating || 5));
  const fullStars = Math.floor(numericRating);
  const hasHalfStar = (numericRating - fullStars) >= 0.5;

  return (
    <div className="h-full gsap-reveal">
      <Link
        to={product.slug || product.id ? `/product/${product.slug || product.id}` : "#"}
        onClick={handleCardClick}
        className={`group product-card h-full flex flex-col p-3.5 sm:p-4 rounded-2xl bg-card border border-border/80 hover:border-primary/50 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden ${
          !(product.slug || product.id) ? "pointer-events-none" : ""
        }`}
      >
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 pointer-events-none">
          <AnimatePresence>
            {product.isNew && (
              <motion.span
                key="new-badge"
                initial={{ scale: 0.8, opacity: 0, x: -10 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                className="px-2 py-0.5 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider rounded-lg shadow-sm"
              >
                New
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Action Buttons (Wishlist & Compare) */}
        <div className="absolute top-3 right-3 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWishlist}
            className={`w-8 h-8 rounded-xl backdrop-blur-md border flex items-center justify-center shadow-md transition-all ${
              isWishlisted
                ? "bg-destructive text-white border-destructive"
                : "bg-background/90 border-border/80 text-muted-foreground hover:text-destructive hover:border-destructive/40"
            }`}
            title="Wishlist"
          >
            <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCompare}
            className={`w-8 h-8 rounded-xl backdrop-blur-md border flex items-center justify-center shadow-md transition-all ${
              isComparing
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background/90 border-border/80 text-muted-foreground hover:text-primary hover:border-primary/40"
            }`}
            title="Compare"
          >
            <GitCompareArrows size={15} />
          </motion.button>
        </div>

        {/* Compact Image Area (Shorter height) */}
        <div className="relative w-full h-40 sm:h-44 mb-3 rounded-xl bg-accent/20 overflow-hidden flex items-center justify-center p-3">
          <CachedImage
            whileHover={{ scale: 1.06 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain drop-shadow-sm"
          />

          {/* Quick View Button Overlay */}
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-card text-primary px-3.5 py-1.5 rounded-xl font-extrabold text-[11px] uppercase tracking-wider shadow-lg flex items-center gap-1.5 border border-primary/20"
            >
              <Eye size={14} />
              Quick View
            </motion.div>
          </div>

          {!product.inStock && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
              <span className="px-3 py-1 bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest rounded-lg border border-destructive/30">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Information - Compact & Wide */}
        <div className="flex-1 flex flex-col justify-between space-y-2">
          <div className="space-y-1.5">
            {/* Brand & Dynamic Star Rating */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-primary">
                {product.brand_name || (typeof product.brand === 'object' && product.brand !== null ? (product.brand as any).name : String(product.brand || 'Dahua'))}
              </span>

              {/* 5-Star Rating Display */}
              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const isFilled = i < fullStars;
                    const isHalf = i === fullStars && hasHalfStar;
                    return (
                      <Star
                        key={i}
                        size={12}
                        className={
                          isFilled || isHalf
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }
                      />
                    );
                  })}
                </div>
                <span className="text-[11px] font-black font-mono text-amber-600 dark:text-amber-400 ml-0.5">
                  {numericRating.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Product Name - Prominent font */}
            <h3 className="text-base sm:text-lg font-black text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 min-h-[2.4rem]">
              {product.name}
            </h3>

            {/* Specs tags */}
            {Array.isArray(product.specs) && product.specs.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.specs.slice(0, 2).map((spec: any, i: number) => {
                  let label = "";
                  if (typeof spec === 'string') {
                    label = spec;
                  } else if (spec && typeof spec === 'object') {
                    if (spec.key && spec.value) {
                      label = `${spec.key}: ${spec.value}`;
                    } else if (spec.value) {
                      label = String(spec.value);
                    } else if (spec.label) {
                      label = String(spec.label);
                    } else {
                      const firstKey = Object.keys(spec)[0];
                      if (firstKey && typeof spec[firstKey] === 'string') {
                        label = `${firstKey}: ${spec[firstKey]}`;
                      }
                    }
                  }
                  if (!label || typeof label !== 'string' || !label.trim()) return null;
                  return (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-accent text-[9px] font-bold uppercase tracking-wider text-muted-foreground truncate max-w-[200px]"
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Row: View Product Button & Enquiry */}
          <div className="pt-2.5 border-t border-border/60 flex items-center gap-2">
            <div
              className="flex-1 h-10 sm:h-11 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 bg-primary text-primary-foreground group-hover:bg-primary/90 shadow-sm"
            >
              <Eye size={15} />
              <span>View Product</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </div>

            <button
              type="button"
              onClick={handleQuery}
              className="h-10 sm:h-11 px-3 flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground rounded-xl transition-all border border-primary/20 shrink-0"
              title="Sales Enquiry"
            >
              <MessageCircle size={15} />
              <span className="hidden sm:inline">Request Details</span>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
