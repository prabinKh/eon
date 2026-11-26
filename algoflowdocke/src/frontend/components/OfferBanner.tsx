import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { offerService, SpecialOffer } from "@/api/offerService";
import BlurryTextSpin from "./BlurryTextSpin";
import { 
  Sparkles, Tag, ArrowRight, Copy, Check, ChevronLeft, ChevronRight, 
  Flame, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

export default function OfferBanner() {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadOffers = async () => {
      try {
        const data = await offerService.getAll();
        if (isMounted) {
          // Strictly filter: if nothing image add it dont show the offer
          const withImages = data.filter(o => o.is_active && o.image && o.image.trim() !== "");
          setOffers(withImages);
        }
      } catch (err) {
        console.error("Failed to load offers:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadOffers();
    return () => { isMounted = false; };
  }, []);

  const currentOffer = offers[currentIndex];

  useEffect(() => {
    if (currentOffer) {
      setSelectedGalleryImg(currentOffer.image || null);
    }
  }, [currentIndex, currentOffer]);

  // CRITICAL REQUIREMENT: if nothing image add it dont show the offer
  if (loading || offers.length === 0 || !currentOffer || !currentOffer.image || currentOffer.image.trim() === "") {
    return null;
  }

  const allImages = Array.from(new Set([
    currentOffer.image,
    ...(Array.isArray(currentOffer.images) ? currentOffer.images : [])
  ])).filter(Boolean) as string[];

  const activeImage = selectedGalleryImg || currentOffer.image;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % offers.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
  };

  return (
    <div className="my-8 sm:my-10 p-7 sm:p-10 lg:p-14 rounded-3xl bg-gradient-to-br from-card via-[#F28BF2]/10 to-[#F28BF2]/20 border-2 border-[#F28BF2]/35 shadow-2xl shadow-[#F28BF2]/15 gsap-reveal relative overflow-hidden group min-h-[460px] sm:min-h-[520px] lg:min-h-[560px] flex items-center">
      {/* Attractive #F28BF2 ambient background lighting */}
      <div 
        className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full blur-[130px] opacity-35 pointer-events-none"
        style={{ backgroundColor: "#F28BF2" }}
      />
      <div 
        className="absolute -bottom-32 -right-32 w-[450px] h-[450px] rounded-full blur-[140px] opacity-30 pointer-events-none"
        style={{ backgroundColor: "#F28BF2" }}
      />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#F28BF2 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-14 w-full">
        {/* Left Content */}
        <div className="flex-1 space-y-5 text-center lg:text-left w-full">
          {/* Top Left Side: Attractive #F28BF2 Offer Badge */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <div 
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl transition-transform hover:scale-105"
              style={{
                backgroundColor: "#F28BF2",
                color: "#1c0024",
                boxShadow: "0 10px 25px -5px rgba(242, 139, 242, 0.45)"
              }}
            >
              <Sparkles size={16} className="text-[#1c0024] animate-spin" />
              <span>{currentOffer.badge_text || "SPECIAL OFFER"}</span>
              {currentOffer.discount_label && (
                <span className="bg-[#1c0024] text-[#F28BF2] px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide ml-1">
                  {currentOffer.discount_label}
                </span>
              )}
            </div>

            {offers.length > 1 && (
              <span className="text-xs font-mono text-foreground/80 px-2.5 py-1 rounded-full bg-card/80 border border-[#F28BF2]/30 shadow-xs">
                0{currentIndex + 1} / 0{offers.length}
              </span>
            )}
          </div>

          {/* Offer Title with Blurry Text Spin Animation on Scroll */}
          <BlurryTextSpin
            key={`${currentOffer.id}-${currentOffer.title}`}
            text={currentOffer.title}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-[1.15]"
          />

          {/* Subtitle */}
          {currentOffer.subtitle && (
            <p className="text-base sm:text-lg font-semibold text-foreground/85 leading-relaxed max-w-2xl">
              {currentOffer.subtitle}
            </p>
          )}

          {/* Full Description */}
          {currentOffer.description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3 max-w-2xl">
              {currentOffer.description}
            </p>
          )}

          {/* Promo Code Pill */}
          {currentOffer.coupon_code && (
            <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Coupon Code:</span>
              <button
                onClick={() => handleCopyCode(currentOffer.coupon_code!)}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-card border-2 border-dashed border-[#F28BF2]/70 hover:border-[#F28BF2] text-foreground text-xs font-mono font-black tracking-widest hover:bg-[#F28BF2]/10 transition-all cursor-pointer shadow-sm group/code"
                title="Click to copy code"
              >
                <span>{currentOffer.coupon_code}</span>
                {copiedCode === currentOffer.coupon_code ? (
                  <Check size={14} className="text-emerald-500" />
                ) : (
                  <Copy size={13} className="text-[#F28BF2] group-hover/code:scale-110 transition-transform" />
                )}
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
            <Link
              to={currentOffer.cta_link || "/offers"}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-black text-sm text-[#1c0024] shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all"
              style={{
                backgroundColor: "#F28BF2",
                boxShadow: "0 12px 30px -6px rgba(242, 139, 242, 0.45)"
              }}
            >
              <span>{currentOffer.cta_text || "Claim Offer"}</span>
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/offers"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-card/80 hover:bg-card border-2 border-[#F28BF2]/40 font-bold text-xs sm:text-sm text-foreground hover:border-[#F28BF2] transition-all shadow-sm"
            >
              <Tag size={15} className="text-[#F28BF2]" />
              <span>Explore All Offers</span>
            </Link>

            {/* Previous / Next Slide Controls */}
            {offers.length > 1 && (
              <div className="inline-flex items-center gap-1.5 border border-[#F28BF2]/30 rounded-2xl p-1.5 bg-card/90 shadow-sm ml-auto lg:ml-0">
                <button
                  onClick={handlePrev}
                  aria-label="Previous Offer"
                  className="p-2 rounded-xl hover:bg-[#F28BF2]/15 text-foreground transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Next Offer"
                  className="p-2 rounded-xl hover:bg-[#F28BF2]/15 text-foreground transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Content: Expansive Larger Banner Showcase */}
        <div className="flex-1 w-full max-w-[560px] lg:max-w-[640px] flex flex-col items-center">
          {/* Main Large Hero Image Frame */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[280px] sm:min-h-[350px] lg:min-h-[390px] rounded-3xl overflow-hidden border-2 border-[#F28BF2]/40 bg-accent/40 shadow-2xl group/img">
            <img
              src={activeImage}
              alt={currentOffer.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
            />
            {currentOffer.discount_label && (
              <div 
                className="absolute top-4 right-4 px-3.5 py-1.5 rounded-2xl font-black text-xs sm:text-sm text-[#1c0024] shadow-lg"
                style={{
                  backgroundColor: "#F28BF2",
                  boxShadow: "0 8px 20px -3px rgba(242, 139, 242, 0.5)"
                }}
              >
                {currentOffer.discount_label}
              </div>
            )}
          </div>

          {/* Multi-Image Gallery Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3 mt-4 overflow-x-auto py-1.5 max-w-full">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedGalleryImg(img)}
                  className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activeImage === img
                      ? "border-[#F28BF2] ring-3 ring-[#F28BF2]/30 scale-105 shadow-md"
                      : "border-border/70 hover:border-[#F28BF2]/60 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Offer view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
