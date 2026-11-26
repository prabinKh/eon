import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { offerService, SpecialOffer } from "@/api/offerService";
import BlurryTextSpin from "./components/BlurryTextSpin";
import { 
  Tag, Flame, Sparkles, Copy, Check, ArrowRight, ShoppingBag, 
  ShieldCheck, Gift
} from "lucide-react";
import { toast } from "sonner";

export default function OfferPage() {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    const fetchOffers = async () => {
      try {
        const data = await offerService.getAll();
        if (isMounted) {
          // Strictly show offers with images
          const valid = data.filter(o => o.is_active && o.image && o.image.trim() !== "");
          setOffers(valid);
        }
      } catch (err) {
        console.error("Error fetching offers:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchOffers();
    return () => { isMounted = false; };
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleSelectImage = (offerId: string, imgUrl: string) => {
    setSelectedImages(prev => ({ ...prev, [offerId]: imgUrl }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <Helmet>
        <title>Special Offers & Hardware Promotions | Eon Technology Nepal</title>
        <meta name="description" content="Discover authorized limited-time deals, festive bundles, and promotional hardware packages on Dahua, CP Plus, Ant Esports, Intex, and Bestor." />
      </Helmet>

      {/* Atmospheric #F28BF2 background glows across the whole offer page */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[850px] h-[550px] rounded-full blur-[160px] opacity-25 pointer-events-none -z-10"
        style={{ backgroundColor: "#F28BF2" }}
      />
      <div 
        className="fixed bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[170px] opacity-20 pointer-events-none -z-10"
        style={{ backgroundColor: "#F28BF2" }}
      />

      <Header />

      <main className="flex-1 pb-20">
        {/* Page Hero Header with #F28BF2 theme */}
        <section className="relative py-14 sm:py-20 border-b border-border/80 bg-gradient-to-b from-[#F28BF2]/15 via-card/70 to-background overflow-hidden">
          <div className="neo-container text-center max-w-4xl mx-auto space-y-5 relative z-10">
            {/* Top Left / Center Accent Badge with #F28BF2 */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl"
              style={{
                backgroundColor: "#F28BF2",
                color: "#1c0024",
                boxShadow: "0 10px 25px -4px rgba(242, 139, 242, 0.45)"
              }}
            >
              <Gift size={16} className="text-[#1c0024] animate-bounce" />
              <span>Verified Hardware Promotions</span>
            </div>

            {/* Blurry Text Spin Headline */}
            <BlurryTextSpin
              text="Exclusive Special Offers & Mega Hardware Bundles"
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.12]"
            />

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Official authorized promotional bundles for <strong>Dahua</strong>, <strong>CP Plus</strong>, <strong>Ant Esports</strong>, <strong>Intex</strong>, and <strong>Bestor</strong> with genuine warranty and certified technical support.
            </p>
          </div>
        </section>

        <div className="neo-container mt-10 sm:mt-16 space-y-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div 
                className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "#F28BF2", borderTopColor: "transparent" }}
              />
              <p className="text-sm text-muted-foreground font-semibold animate-pulse">Loading active promotions...</p>
            </div>
          ) : offers.length === 0 ? (
            /* Friendly Empty State if no offers or no images */
            <div className="my-10 p-12 sm:p-20 rounded-3xl bg-card border-2 border-border text-center max-w-xl mx-auto space-y-5 shadow-sm">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-[#1c0024]"
                style={{ backgroundColor: "#F28BF2" }}
              >
                <Tag size={32} />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                No Active Offers Right Now
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We are actively curating new seasonal deals and hardware combos. Check back soon!
              </p>
              <div className="pt-2">
                <Link
                  to="/products"
                  className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold"
                >
                  <ShoppingBag size={16} />
                  <span>Browse Full Catalog</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Large Offers Cards List */
            <div className="space-y-12">
              {offers.map((offer, index) => {
                const galleryImages = Array.from(new Set([
                  offer.image,
                  ...(Array.isArray(offer.images) ? offer.images : [])
                ])).filter(Boolean) as string[];

                const activeImage = selectedImages[offer.id] || offer.image;

                return (
                  <article
                    key={offer.id}
                    className="p-7 sm:p-12 rounded-3xl bg-gradient-to-br from-card via-[#F28BF2]/10 to-[#F28BF2]/15 border-2 border-[#F28BF2]/35 shadow-2xl shadow-[#F28BF2]/15 hover:shadow-[#F28BF2]/25 transition-all relative overflow-hidden group/card"
                  >
                    {/* Corner ambient glow */}
                    <div 
                      className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-[120px] opacity-25 pointer-events-none"
                      style={{ backgroundColor: "#F28BF2" }}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                      {/* Left: Text & Badges (6 cols) */}
                      <div className="lg:col-span-6 space-y-5 text-left">
                        {/* Top Left Side: Attractive #F28BF2 Offer Badge */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div 
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase shadow-md"
                            style={{
                              backgroundColor: "#F28BF2",
                              color: "#1c0024"
                            }}
                          >
                            <Sparkles size={15} className="text-[#1c0024]" />
                            <span>{offer.badge_text || "SPECIAL OFFER"}</span>
                          </div>

                          {offer.discount_label && (
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wide border border-rose-500/25">
                              <Flame size={14} />
                              {offer.discount_label}
                            </span>
                          )}

                          <span className="text-xs font-mono text-muted-foreground ml-auto hidden sm:inline">
                            Offer #{index + 1}
                          </span>
                        </div>

                        {/* Blurry Text Spin Animation on Scroll */}
                        <BlurryTextSpin
                          key={`${offer.id}-${offer.title}`}
                          text={offer.title}
                          className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-[1.18]"
                        />

                        {offer.subtitle && (
                          <p className="text-base sm:text-lg font-semibold text-foreground/85 leading-relaxed">
                            {offer.subtitle}
                          </p>
                        )}

                        {offer.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                            {offer.description}
                          </p>
                        )}

                        {/* Promo Code Block */}
                        {offer.coupon_code && (
                          <div className="pt-1 flex items-center gap-3">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Coupon Code:</span>
                            <button
                              onClick={() => handleCopyCode(offer.coupon_code!)}
                              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-card border-2 border-dashed border-[#F28BF2]/70 hover:border-[#F28BF2] text-foreground text-xs font-mono font-black tracking-widest hover:bg-[#F28BF2]/10 transition-all cursor-pointer shadow-xs group/code"
                            >
                              <span>{offer.coupon_code}</span>
                              {copiedCode === offer.coupon_code ? (
                                <Check size={14} className="text-emerald-500" />
                              ) : (
                                <Copy size={13} className="text-[#F28BF2]" />
                              )}
                            </button>
                          </div>
                        )}

                        {/* Action Link */}
                        <div className="pt-3 flex flex-wrap items-center gap-4">
                          <Link
                            to={offer.cta_link || "/products"}
                            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-black text-sm text-[#1c0024] shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all"
                            style={{
                              backgroundColor: "#F28BF2",
                              boxShadow: "0 10px 25px -4px rgba(242, 139, 242, 0.45)"
                            }}
                          >
                            <span>{offer.cta_text || "Claim Offer"}</span>
                            <ArrowRight size={17} />
                          </Link>

                          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                            <ShieldCheck size={16} className="text-[#F28BF2]" />
                            <span>100% Genuine Partner Guarantee</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Larger Banner Showcase & Gallery (6 cols) */}
                      <div className="lg:col-span-6 flex flex-col items-center">
                        <div className="relative w-full aspect-[16/10] min-h-[290px] sm:min-h-[380px] rounded-3xl overflow-hidden border-2 border-[#F28BF2]/40 bg-accent/30 shadow-2xl">
                          <img
                            src={activeImage}
                            alt={offer.title}
                            className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                          />
                          {offer.discount_label && (
                            <div 
                              className="absolute top-4 right-4 px-3.5 py-1.5 rounded-2xl font-black text-xs sm:text-sm text-[#1c0024] shadow-lg"
                              style={{
                                backgroundColor: "#F28BF2",
                                boxShadow: "0 8px 20px -3px rgba(242, 139, 242, 0.5)"
                              }}
                            >
                              {offer.discount_label}
                            </div>
                          )}
                        </div>

                        {/* Multi-Image Thumbnails */}
                        {galleryImages.length > 1 && (
                          <div className="flex items-center gap-3 mt-4 overflow-x-auto py-1 max-w-full">
                            {galleryImages.map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSelectImage(offer.id, img)}
                                className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                                  activeImage === img
                                    ? "border-[#F28BF2] ring-3 ring-[#F28BF2]/30 scale-105 shadow-md"
                                    : "border-border/70 hover:border-[#F28BF2]/60 opacity-70 hover:opacity-100"
                                }`}
                              >
                                <img
                                  src={img}
                                  alt={`View ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
