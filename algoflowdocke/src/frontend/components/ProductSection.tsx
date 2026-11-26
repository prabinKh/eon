import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { type Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { motion } from "motion/react";

type Props = {
  title: string;
  products: Product[];
  viewAllLink?: string;
  columns?: number;
};

export const ProductSection = ({ title, products, viewAllLink }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll bounds
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, products]);

  const handleScrollLeft = () => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({ left: -amount, behavior: "smooth" });
  };

  const handleScrollRight = () => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 lg:py-16 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />
      
      {/* Section Header */}
      {title && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-2 h-10 sm:h-12 bg-primary rounded-full shadow-[0_0_20px_hsl(var(--primary)/0.5)]" />
            <div className="flex flex-col">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-black tracking-tighter text-foreground uppercase leading-none">
                {title}
              </h2>
              <div className="h-1 w-24 bg-primary/20 rounded-full mt-2 overflow-hidden">
                <motion.div 
                  initial={{ x: "-100%" }}
                  whileInView={{ x: "0%" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full w-full bg-primary"
                />
              </div>
            </div>
          </div>

          {/* Right Action Controls: Left/Right Arrows + Explore All */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Arrow Navigation */}
            {products.length > 4 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleScrollLeft}
                  disabled={!canScrollLeft}
                  className={`w-10 h-10 rounded-full border border-border flex items-center justify-center transition-all duration-200 shadow-sm ${
                    canScrollLeft
                      ? "bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary text-foreground cursor-pointer shadow-md active:scale-95"
                      : "bg-accent/30 text-muted-foreground/40 border-border/40 cursor-not-allowed"
                  }`}
                  aria-label="Previous products"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={handleScrollRight}
                  disabled={!canScrollRight}
                  className={`w-10 h-10 rounded-full border border-border flex items-center justify-center transition-all duration-200 shadow-sm ${
                    canScrollRight
                      ? "bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary text-foreground cursor-pointer shadow-md active:scale-95"
                      : "bg-accent/30 text-muted-foreground/40 border-border/40 cursor-not-allowed"
                  }`}
                  aria-label="Next products"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {viewAllLink && (
              <Link
                to={viewAllLink}
                className="group flex items-center gap-2 text-xs sm:text-sm font-bold text-primary transition-all hover:gap-3 bg-primary/5 px-4 py-2 rounded-full border border-primary/10 hover:bg-primary/10"
              >
                <span className="uppercase tracking-[0.2em]">Explore All</span>
                <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </motion.div>
      )}

      {/* Horizontal Single-Row Carousel Slider (No Wrap) */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar py-2 px-1 flex-nowrap"
      >
        {products.map((product, i) => (
          <div
            key={product.id}
            className="w-full md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] flex-shrink-0 snap-start"
          >
            <ProductCard product={product} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
};
