import { useParams, Link } from "react-router-dom";
import { useState, useSyncExternalStore, useRef, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useGSAPReveal } from "@/hooks/useGSAP";
import { Header } from "@/frontend/components/Header";
import { Footer } from "@/frontend/components/Footer";
import { MobileBottomNav } from "@/frontend/components/MobileBottomNav";
import { wishlistStore } from "@/stores/wishlist";
import { compareStore } from "@/stores/compare";
import { ProductCard } from "@/frontend/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/api/productService";
import { ChevronRight, ChevronLeft, Truck, Shield, RotateCcw, Star, CheckCircle, Heart, GitCompareArrows, Search, Check, MessageCircle, Settings, Maximize2, X, FileText, Download, ExternalLink, Eye, Send, Headphones, Award, FileDown } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { CachedImage } from "@/components/ui/cached-image";
import ImageRingGallery from "@/frontend/components/ImageRingGallery";
import { useStore } from "@/frontend/context/StoreContext";

const parseImageList = (raw: unknown): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map(item => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object') {
          const obj = item as Record<string, unknown>;
          if (typeof obj.image === 'string') return obj.image.trim();
          if (typeof obj.url === 'string') return obj.url.trim();
          if (typeof obj.src === 'string') return obj.src.trim();
        }
        return '';
      })
      .filter(Boolean);
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parseImageList(parsed);
        }
      } catch {
        // ignore error
      }
    }
    if (trimmed.includes(',')) {
      return trimmed.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [trimmed];
  }
  return [];
};

const ProductDetailPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { company } = useStore();
  const { slug } = useParams<{ slug: string }>();

  const { data: fetchedProduct } = useQuery({
    queryKey: ['product_detail', slug],
    queryFn: () => slug ? productService.getBySlug(slug) : Promise.resolve(null),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const product = useMemo(() => {
    if (!fetchedProduct) return null;
    const categoryName = fetchedProduct.category_name || (typeof fetchedProduct.category === 'string' ? fetchedProduct.category : String(fetchedProduct.category || ''));
    const categorySlug = fetchedProduct.categorySlug || fetchedProduct.category_slug || '';
    const brandName = fetchedProduct.brand_name || (typeof fetchedProduct.brand === 'string' ? fetchedProduct.brand : String(fetchedProduct.brand || ''));
    return {
      ...fetchedProduct,
      category: categoryName,
      categorySlug: categorySlug,
      brand: brandName
    };
  }, [fetchedProduct]);

  const fallbackProduct = useMemo(() => {
    if (!slug) return null;
    const sampleImages = [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80",
    ];
    return {
      id: slug,
      slug: slug,
      name: `Product Preview (${slug})`,
      brand: "Unknown Brand",
      price: 0,
      originalPrice: undefined,
      discount: 0,
      rating: 0,
      reviews: 0,
      inStock: false,
      stockCount: 0,
      image: sampleImages[0],
      images: sampleImages,
      gallery: sampleImages,
      description: "Product details not available.",
      specs: [],
      category: "General",
      categorySlug: "general",
      keySpecifications: []
    };
  }, [slug]);

  const activeProduct = product || fallbackProduct;

  const targetCategorySlug = activeProduct?.categorySlug || '';

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['related_products', targetCategorySlug],
    queryFn: () => targetCategorySlug ? productService.getByCategory(targetCategorySlug) : Promise.resolve([]),
    enabled: !!targetCategorySlug && targetCategorySlug !== 'general',
    staleTime: 5 * 60 * 1000,
  });

  const related = useMemo(() => 
    (relatedProducts || [])
      .filter(p => activeProduct && p.slug !== activeProduct.slug && p.id !== activeProduct.id)
      .slice(0, 4),
    [relatedProducts, activeProduct]
  );

  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "downloads">("overview");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [activePdfTitle, setActivePdfTitle] = useState<string>('');
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState<boolean>(false);
  const [enquiryForm, setEnquiryForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState<boolean>(false);

  const datasheetUrl = activeProduct?.datasheetUrl || (activeProduct as any)?.datasheet_url || (
    Array.isArray((activeProduct as any)?.downloads)
      ? (activeProduct as any).downloads.find((d: any) => d && (d.type === 'Datasheet' || d.name?.toLowerCase().includes('datasheet') || d.url?.toLowerCase().includes('datasheet')))?.url
      : undefined
  );

  const productDownloads = useMemo(() => {
    const raw = (activeProduct as any)?.downloads;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.filter((d: any) => d && d.url);
    }
    if (datasheetUrl) {
      return [{ name: `${activeProduct?.name || 'Product'} Technical Datasheet`, url: datasheetUrl, type: 'Datasheet' }];
    }
    return [];
  }, [activeProduct, datasheetUrl]);

  const handleViewDoc = (url: string, title: string) => {
    setActivePdfUrl(url);
    setActivePdfTitle(title);
    setIsPdfModalOpen(true);
  };

  const handleDownloadDoc = (url: string, title?: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = title || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Download started for ${title || 'document'}`);
  };

  const handleSubmitEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryForm.name || !enquiryForm.email) {
      toast.error("Please enter your name and email");
      return;
    }
    setIsSubmittingEnquiry(true);
    setTimeout(() => {
      setIsSubmittingEnquiry(false);
      setIsEnquiryModalOpen(false);
      toast.success(`Enquiry for ${activeProduct?.name} submitted! Our team will contact you shortly.`);
      setEnquiryForm({ name: '', email: '', phone: '', message: '' });
    }, 600);
  };

  const allGalleryImages = useMemo(() => {
    const list: string[] = [];
    if (activeProduct?.image && typeof activeProduct.image === 'string' && activeProduct.image.trim()) {
      list.push(activeProduct.image.trim());
    }

    const imagesFromProp = parseImageList(activeProduct?.images);
    const galleryFromProp = parseImageList((activeProduct as any)?.gallery);
    const colorImages = Array.isArray((activeProduct as any)?.colors)
      ? parseImageList((activeProduct as any)?.colors)
      : [];

    [...imagesFromProp, ...galleryFromProp, ...colorImages].forEach(img => {
      if (img && !list.includes(img)) {
        list.push(img);
      }
    });

    return list;
  }, [activeProduct]);

  const ringImages = useMemo(() => {
    const rawFrames = (activeProduct as any)?.model3DFrames || (activeProduct as any)?.frames;
    if (Array.isArray(rawFrames) && rawFrames.length > 0) {
      const parsed = parseImageList(rawFrames);
      if (parsed.length > 0) return parsed;
    }
    return allGalleryImages;
  }, [activeProduct, allGalleryImages]);

  const currentMainImage = useMemo(() => {
    if (allGalleryImages.length > 0 && currentImageIndex < allGalleryImages.length) {
      return allGalleryImages[currentImageIndex];
    }
    return activeProduct?.image || '';
  }, [allGalleryImages, currentImageIndex, activeProduct?.image]);

  const handlePrevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (allGalleryImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev - 1 + allGalleryImages.length) % allGalleryImages.length);
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (allGalleryImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % allGalleryImages.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (allGalleryImages.length <= 1) return;
      if (e.key === "ArrowLeft") {
        setCurrentImageIndex((prev) => (prev - 1 + allGalleryImages.length) % allGalleryImages.length);
      } else if (e.key === "ArrowRight") {
        setCurrentImageIndex((prev) => (prev + 1) % allGalleryImages.length);
      } else if (e.key === "Escape" && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [allGalleryImages.length, isLightboxOpen]);



  // Reveal animations
  useGSAPReveal(containerRef, ".gsap-reveal", { opacity: 0, y: 30, duration: 0.8, stagger: 0.1 });
  useGSAPReveal(containerRef, ".gsap-reveal-img", { opacity: 0, scale: 0.9, duration: 1 });

  // Subscribe to stores to trigger re-renders
  useSyncExternalStore(wishlistStore.subscribe, wishlistStore.getSnapshot);
  useSyncExternalStore(compareStore.subscribe, compareStore.getSnapshot);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center py-24">
          <div className="neo-container text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The product you are looking for might have been moved, deleted, or the link is incorrect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/" 
                className="neo-button bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                Back to Home
              </Link>
              <Link 
                to="/search" 
                className="neo-button bg-secondary text-secondary-foreground px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                Search Products
              </Link>
            </div>
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  const handleQuery = () => {
    if (!activeProduct) return;
    const payload = {
      type: 'product' as const,
      productName: activeProduct.name,
      productPrice: "",
      productUrl: window.location.href,
      productImage: activeProduct.image
    };

    if (window.openChat) {
      window.openChat(payload);
    } else {
      window.dispatchEvent(new CustomEvent("open-chat", { detail: payload }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" ref={containerRef}>
      <Helmet>
        <title>{`${activeProduct?.name} | ${company?.name || "Eon Technology"}`}</title>
        <meta name="description" content={activeProduct?.description?.substring(0, 160) || ''} />
        <meta name="keywords" content={`${activeProduct?.name}, ${activeProduct?.brand}, ${activeProduct?.category}, ${company?.name || "Eon Technology"}`} />
        <link rel="canonical" href={window.location.href} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:title" content={`${activeProduct?.name} | ${company?.name || "Eon Technology"}`} />
        <meta property="og:description" content={activeProduct?.description?.substring(0, 160) || ''} />
        <meta property="og:image" content={activeProduct?.image || ''} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="product" />
        <meta property="product:brand" content={activeProduct?.brand || ''} />
        <meta property="product:category" content={activeProduct?.category || ''} />
        <meta property="product:availability" content={activeProduct?.inStock ? "instock" : "oos"} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${activeProduct?.name} | ${company?.name || "Eon Technology"}`} />
        <meta name="twitter:description" content={activeProduct?.description?.substring(0, 160) || ''} />
        <meta name="twitter:image" content={activeProduct?.image || ''} />

        {/* Structured Data (JSON-LD) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": activeProduct?.name,
            "image": activeProduct?.image,
            "description": activeProduct?.description,
            "brand": {
              "@type": "Brand",
              "name": activeProduct?.brand
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": activeProduct?.rating,
              "reviewCount": activeProduct?.reviews
            }
          })}
        </script>
      </Helmet>
      <Header />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="neo-container space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to={`/category/${activeProduct?.categorySlug}`} className="hover:text-primary transition-colors">{activeProduct?.category}</Link>
            <ChevronRight size={12} />
            <span className="text-foreground truncate max-w-[200px] sm:max-w-none">{activeProduct?.name}</span>
          </nav>

          {/* Product Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Images Gallery */}
            <div className="gsap-reveal-img flex flex-col gap-4">
              {/* Main Image Display Box */}
              <div 
                onClick={(e) => {
                  if (allGalleryImages.length > 1 && (e.target as HTMLElement).tagName !== 'BUTTON' && !(e.target as HTMLElement).closest('button')) {
                    handleNextImage();
                  }
                }}
                className="relative group bg-gradient-to-br from-accent/50 to-muted/80 rounded-[var(--radius-outer)] p-6 sm:p-8 flex items-center justify-center aspect-square border border-border/60 shadow-xl overflow-hidden cursor-pointer select-none"
              >
                {/* Main Image */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentMainImage}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <CachedImage
                        src={currentMainImage}
                        alt={activeProduct?.name || ''}
                        className="w-full h-full object-contain"
                        fallback={activeProduct?.image || ''}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Counter badge & Next button shortcut */}
                {allGalleryImages.length > 1 && (
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                    <div className="bg-black/70 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-md">
                      <span>{currentImageIndex + 1}</span>
                      <span className="opacity-50">/</span>
                      <span>{allGalleryImages.length}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="bg-primary/90 hover:bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md backdrop-blur-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                )}

                {/* Fullscreen Lightbox Zoom Trigger */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 z-20 shadow-md cursor-pointer"
                  title="Fullscreen Zoom"
                >
                  <Maximize2 size={16} />
                </button>
                


                {/* One-by-One Navigation Arrows (Previous / Next) */}
                {allGalleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-primary text-white p-3 sm:p-3.5 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xl z-20 flex items-center justify-center border border-white/20 cursor-pointer"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-primary text-white p-3 sm:p-3.5 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xl z-20 flex items-center justify-center border border-white/20 cursor-pointer"
                      aria-label="Next image"
                    >
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}

                {/* Dots indicator */}
                {allGalleryImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                    {allGalleryImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                        className={`transition-all duration-300 rounded-full cursor-pointer ${
                          currentImageIndex === idx
                            ? 'w-5 h-2 bg-primary shadow-md'
                            : 'w-2 h-2 bg-white/50 hover:bg-white'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Side/Bottom Multiple Thumbnail Gallery Selector */}
              {allGalleryImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto py-2 px-1 no-scrollbar">
                  {allGalleryImages.map((imgUrl, index) => {
                    const isSelected = (currentImageIndex === index);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative w-20 h-20 rounded-2xl border-2 overflow-hidden flex-shrink-0 transition-all duration-300 ${
                          isSelected
                            ? 'border-primary ring-4 ring-primary/30 scale-105 shadow-lg'
                            : 'border-border opacity-70 hover:opacity-100 hover:border-primary/50'
                        }`}
                      >
                        <CachedImage
                          src={imgUrl}
                          alt={`${activeProduct?.name} thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          fallback={activeProduct?.image || ''}
                        />
                        {isSelected && (
                          <div className="absolute bottom-0 inset-x-0 h-1 bg-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-4 sm:space-y-6 gsap-reveal">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="spec-label">{activeProduct?.brand}</p>
                  {(activeProduct as any)?.collections && (activeProduct as any).collections.length > 0 && (
                    <div className="flex gap-1">
                      {(activeProduct as any).collections.map((c: string) => (
                        <span key={c} className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-widest rounded-full border border-primary/20">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold tracking-tight">{activeProduct?.name}</h1>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(activeProduct?.rating || 5) ? "fill-warning text-warning" : "text-border"}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({activeProduct?.reviews} reviews)</span>
              </div>

              {/* Specs */}
              <div className="flex gap-2 flex-wrap">
                {(Array.isArray(activeProduct?.specs) ? activeProduct.specs : []).map((spec: any, i) => {
                  const label = typeof spec === 'object' && spec !== null
                    ? (spec.value ? `${spec.key ? `${spec.key}: ` : ''}${spec.value}` : JSON.stringify(spec))
                    : String(spec || '');
                  if (!label.trim()) return null;
                  return (
                    <span key={i} className="px-3 py-1.5 bg-accent border border-border/50 rounded-lg text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      {label}
                    </span>
                  );
                })}
              </div>

              {/* Key Highlights */}
              {activeProduct?.keySpecifications && activeProduct.keySpecifications.length > 0 && (
                <div className="space-y-3 bg-primary/5 border border-primary/15 rounded-2xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <CheckCircle size={14} />
                    Product Key Points
                  </h3>
                  <ul className="grid grid-cols-1 gap-2.5">
                    {activeProduct.keySpecifications.map((spec, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-foreground/90 font-medium leading-snug">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Status / Availability */}
              <div className="text-sm flex items-center gap-2">
                {activeProduct?.inStock ? (
                  <div className="flex items-center gap-2 bg-success/10 border border-success/20 px-3.5 py-1.5 rounded-full">
                    <CheckCircle size={15} className="text-success" />
                    <span className="text-success font-semibold text-xs uppercase tracking-wider">
                      Available • Official Genuine Model
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 px-3.5 py-1.5 rounded-full">
                    <Shield size={15} className="text-destructive" />
                    <span className="text-destructive font-semibold text-xs uppercase tracking-wider">
                      Request Pre-Order
                    </span>
                  </div>
                )}
              </div>

              {/* Enterprise / Dahua Action Buttons */}
              <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-2">
                <button
                  onClick={() => setIsEnquiryModalOpen(true)}
                  className="flex-1 min-w-[160px] btn-primary py-3.5 px-6 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all rounded-xl"
                >
                  <Send size={15} />
                  <span>Contact EON Technology</span>
                </button>

                {datasheetUrl && (
                  <>
                    <button
                      onClick={() => handleViewDoc(datasheetUrl, `${activeProduct?.name || 'Product'} Datasheet`)}
                      className="btn-outline py-3 px-4 border-primary/30 text-primary bg-primary/5 hover:bg-primary hover:text-primary-foreground flex items-center gap-2 transition-all shadow-sm rounded-xl font-semibold text-xs"
                      title="View Official Datasheet PDF"
                    >
                      <Eye size={15} />
                      <span className="text-xs font-bold uppercase tracking-wider">View Datasheet</span>
                    </button>
                    <button
                      onClick={() => handleDownloadDoc(datasheetUrl, `${activeProduct?.name || 'Product'}_Datasheet.pdf`)}
                      className="btn-outline py-3 px-3.5 border-border hover:bg-accent flex items-center gap-1.5 transition-all rounded-xl text-foreground"
                      title="Download Datasheet PDF"
                    >
                      <Download size={16} />
                    </button>
                  </>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => { if (activeProduct) { const r = compareStore.toggle(activeProduct as any); if (r === null) toast.error("Max 4 products"); else toast(r ? "Added to compare" : "Removed"); } }}
                    className={`btn-outline py-3 px-3.5 rounded-xl transition-all ${activeProduct && compareStore.has(activeProduct.id) ? "text-primary border-primary/40 bg-primary/10" : "border-border"}`}
                    title="Compare model"
                  >
                    <GitCompareArrows size={17} />
                  </button>
                  <button
                    onClick={() => { if (activeProduct) { const added = wishlistStore.toggle(activeProduct as any); toast(added ? "Added to favorites" : "Removed from favorites"); } }}
                    className={`btn-outline py-3 px-3.5 rounded-xl transition-all ${activeProduct && wishlistStore.has(activeProduct.id) ? "text-destructive border-destructive/30 bg-destructive/5" : "border-border"}`}
                    title="Bookmark model"
                  >
                    <Heart size={17} className={activeProduct && wishlistStore.has(activeProduct.id) ? "fill-current" : ""} />
                  </button>
                </div>
              </div>

              {/* Guarantees / Assurances */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 pt-3 border-t border-border">
                {[
                  { icon: Shield, label: "Genuine Product", sub: "Official Security" },
                  { icon: FileText, label: "Technical Docs", sub: "PDF Datasheet" },
                  { icon: Headphones, label: "Enterprise Support", sub: "Direct Assistance" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center gap-1 text-center p-2.5 bg-accent/40 rounded-xl border border-border/40">
                    <Icon size={16} className="text-primary mb-0.5" />
                    <span className="text-[11px] font-semibold text-foreground leading-tight">{label}</span>
                    <span className="text-[9px] text-muted-foreground leading-tight">{sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>



          {/* Tabs */}
          <div className="mt-12 sm:mt-16 gsap-reveal">
            <div className="flex border-b border-border gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
              {[
                { id: "overview", label: "Overview", icon: CheckCircle },
                { id: "specs", label: "Specifications", icon: Settings },
                { id: "downloads", label: `Downloads & Documentation (${productDownloads.length})`, icon: FileDown },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 sm:px-6 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap
                      ${activeTab === tab.id
                        ? "border-primary text-primary bg-primary/5 rounded-t-xl"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                      }`}
                  >
                    <Icon size={15} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="py-6 sm:py-8">
              {activeTab === "overview" && (
                <div className="space-y-6 max-w-4xl">
                  {/* Cleaned Overview Description */}
                  <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base">
                    <p className="whitespace-pre-line text-foreground/90 font-normal">{activeProduct?.description}</p>
                  </div>

                  {/* Highlights Card */}
                  {activeProduct?.keySpecifications && activeProduct.keySpecifications.length > 0 && (
                    <div className="p-6 bg-accent/20 border border-border/80 rounded-2xl space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                        <CheckCircle size={14} /> Key Features & Capabilities
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {activeProduct.keySpecifications.map((spec, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs text-foreground/80 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            <span>{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Raw Full Details */}
                  {(activeProduct as any)?.details && (
                    <div className="p-6 bg-accent/15 border border-border/60 rounded-2xl space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Detailed Overview</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                        {(activeProduct as any).details}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "specs" && (
                <div className="space-y-8">
                  {activeProduct?.keySpecifications && activeProduct.keySpecifications.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <CheckCircle size={14} className="text-primary" /> Key Highlights
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {activeProduct.keySpecifications.map((spec, idx) => (
                          <div key={idx} className="p-3.5 bg-card border border-border/80 rounded-xl text-xs font-medium flex items-center gap-2.5 shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                            <span>{spec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Settings size={14} className="text-primary" /> Technical Data
                    </h3>
                    <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-border">
                          {(activeProduct as any)?.detailedSpecs && Object.entries((activeProduct as any).detailedSpecs).length > 0 ? (
                            Object.entries((activeProduct as any).detailedSpecs).map(([key, val]) => (
                              <tr key={key} className="bg-card hover:bg-accent/30 transition-colors">
                                <td className="py-3.5 px-6 font-medium text-foreground w-1/3 border-r border-border/50 bg-accent/10 text-xs sm:text-sm">{key}</td>
                                <td className="py-3.5 px-6 text-muted-foreground font-mono text-xs">
                                  {typeof val === 'object' && val !== null 
                                    ? (Array.isArray(val) ? val.join(', ') : JSON.stringify(val)) 
                                    : String(val ?? '')}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={2} className="py-8 px-6 text-center text-muted-foreground italic bg-accent/5">
                                No technical specifications listed for this product.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "downloads" && (
                <div className="space-y-6 max-w-5xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-primary/5 border border-primary/15 rounded-2xl">
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <FileText size={16} className="text-primary" />
                        Official Technical Documentation
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Download or preview official Dahua datasheets, user manuals, and dimension diagrams.
                      </p>
                    </div>
                    {datasheetUrl && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleViewDoc(datasheetUrl, `${activeProduct?.name} Datasheet`)}
                          className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5 rounded-lg"
                        >
                          <Eye size={13} />
                          View Datasheet
                        </button>
                        <button
                          onClick={() => handleDownloadDoc(datasheetUrl, `${activeProduct?.name}_Datasheet.pdf`)}
                          className="btn-outline py-2 px-3 text-xs flex items-center gap-1.5 bg-card rounded-lg"
                        >
                          <Download size={13} />
                          Download
                        </button>
                      </div>
                    )}
                  </div>

                  {productDownloads.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {productDownloads.map((doc: any, idx: number) => {
                        const isPdf = doc.url.toLowerCase().endsWith('.pdf') || doc.type === 'Datasheet' || doc.type === 'User Manual';
                        return (
                          <div 
                            key={idx}
                            className="p-4 bg-card border border-border/80 hover:border-primary/40 rounded-xl flex items-center justify-between gap-3 transition-all hover:shadow-sm group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <FileText size={20} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-muted-foreground">
                                    {doc.type || 'Document'}
                                  </span>
                                  {isPdf && (
                                    <span className="text-[9px] font-mono text-destructive uppercase font-bold">PDF</span>
                                  )}
                                </div>
                                <h4 className="text-xs font-semibold text-foreground truncate mt-1" title={doc.name}>
                                  {doc.name}
                                </h4>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleViewDoc(doc.url, doc.name)}
                                className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                                title="View Document"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleDownloadDoc(doc.url, doc.name)}
                                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                title="Download File"
                              >
                                <Download size={16} />
                              </button>
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                title="Open in new window"
                              >
                                <ExternalLink size={15} />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center bg-accent/10 border border-dashed border-border rounded-xl">
                      <FileText size={32} className="mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-xs text-muted-foreground">No documents attached for this model.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 3D Ring Gallery */}
          {ringImages.length > 0 && (
            <section className="border-t border-border gsap-reveal">
              <div className="flex items-center gap-3 mb-2 pt-8">
                <div className="w-1 h-6 bg-primary rounded-full" />
                <h2 className="section-title">
                  {(activeProduct as any)?.model3DFrames?.length > 0 || (activeProduct as any)?.frames?.length > 0
                    ? "3D Frame 360° View"
                    : "Image Gallery"}
                </h2>
              </div>
              <ImageRingGallery
                images={ringImages}
                activeIndex={currentImageIndex}
                onSelect={setCurrentImageIndex}
                productTitle={activeProduct?.name || ''}
              />
            </section>
          )}

          {/* Related */}
          {related.length > 0 && (
            <section className="py-8 sm:py-12 border-t border-border gsap-reveal">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="w-1 h-6 bg-primary rounded-full" />
                <h2 className="section-title">Related Products</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {related.map((p, i) => (
                  <ProductCard key={p.id} product={p as any} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between z-10 max-w-7xl mx-auto w-full">
              <div className="flex items-center gap-3 text-white">
                <span className="font-display text-sm sm:text-base font-bold truncate max-w-[200px] sm:max-w-md">{activeProduct?.name}</span>
                {allGalleryImages.length > 1 && (
                  <span className="bg-white/10 text-xs font-mono px-3 py-1 rounded-full border border-white/10">
                    {currentImageIndex + 1} / {allGalleryImages.length}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-rose-500 text-white transition-all hover:scale-110 active:scale-95 cursor-pointer"
                aria-label="Close Lightbox"
              >
                <X size={24} />
              </button>
            </div>

            {/* Main Lightbox Image Display */}
            <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
              <motion.img
                key={currentMainImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                src={currentMainImage}
                alt={activeProduct?.name || 'Product'}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
              />

              {/* Lightbox Navigation Arrows */}
              {allGalleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-primary text-white p-3 sm:p-4 rounded-full backdrop-blur-md transition-all hover:scale-110 active:scale-95 border border-white/20 cursor-pointer"
                    aria-label="Previous Image"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-primary text-white p-3 sm:p-4 rounded-full backdrop-blur-md transition-all hover:scale-110 active:scale-95 border border-white/20 cursor-pointer"
                    aria-label="Next Image"
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Thumbnails */}
            {allGalleryImages.length > 1 && (
              <div className="flex justify-center gap-3 overflow-x-auto py-2 no-scrollbar max-w-3xl mx-auto w-full">
                {allGalleryImages.map((imgUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${
                      currentImageIndex === index
                        ? 'border-primary ring-4 ring-primary/40 scale-105'
                        : 'border-white/20 opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Lightbox thumb ${index}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Document Viewer Modal */}
      <AnimatePresence>
        {isPdfModalOpen && activePdfUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-background border border-border rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText size={18} className="text-primary shrink-0" />
                  <h3 className="text-sm font-bold text-foreground truncate">{activePdfTitle}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={activePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline py-1.5 px-3 text-xs flex items-center gap-1.5"
                  >
                    <ExternalLink size={13} />
                    <span className="hidden sm:inline">Open in New Tab</span>
                  </a>
                  <button
                    onClick={() => handleDownloadDoc(activePdfUrl, activePdfTitle)}
                    className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5"
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => setIsPdfModalOpen(false)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent ml-1"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Iframe Content */}
              <div className="flex-1 bg-muted/20 relative">
                <iframe
                  src={activePdfUrl}
                  title={activePdfTitle}
                  className="w-full h-full border-0"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sales Enquiry Modal */}
      <AnimatePresence>
        {isEnquiryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-background border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Send size={16} className="text-primary" />
                    Product Sales Enquiry
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Submit your request and our Dahua solutions expert will contact you.
                  </p>
                </div>
                <button
                  onClick={() => setIsEnquiryModalOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitEnquiry} className="p-6 space-y-4">
                <div className="p-3 bg-accent/40 border border-border/60 rounded-xl flex items-center gap-3">
                  {activeProduct?.image && (
                    <img src={activeProduct.image} alt={activeProduct.name} className="w-12 h-12 object-contain rounded bg-white p-1" />
                  )}
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {activeProduct?.brand || 'Dahua'} Model
                    </span>
                    <h4 className="text-xs font-semibold text-foreground truncate">{activeProduct?.name}</h4>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.name}
                    onChange={e => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full px-3.5 py-2.5 text-xs bg-card border border-border rounded-xl focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={enquiryForm.email}
                      onChange={e => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                      placeholder="name@company.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-card border border-border rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      value={enquiryForm.phone}
                      onChange={e => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                      placeholder="+977 / Phone"
                      className="w-full px-3.5 py-2.5 text-xs bg-card border border-border rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Requirements / Estimated Quantity</label>
                  <textarea
                    rows={3}
                    value={enquiryForm.message}
                    onChange={e => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    placeholder="Please specify estimated quantity, project details, or questions..."
                    className="w-full px-3.5 py-2.5 text-xs bg-card border border-border rounded-xl focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEnquiryModalOpen(false)}
                    className="btn-outline py-2.5 px-4 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEnquiry}
                    className="btn-primary py-2.5 px-5 text-xs flex items-center gap-1.5"
                  >
                    <Send size={13} />
                    <span>{isSubmittingEnquiry ? "Submitting..." : "Submit Enquiry"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default ProductDetailPage;
