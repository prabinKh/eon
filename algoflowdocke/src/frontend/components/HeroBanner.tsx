import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Monitor, ChevronLeft, ChevronRight, Pause, Play, Sparkles } from "lucide-react";
import { CachedImage } from "@/components/ui/cached-image";
import { heroService, type HeroContent } from "@/api/heroService";
import { useStore } from "@/frontend/context/StoreContext";

const DEFAULT_SLIDES: HeroContent[] = [
  {
    order: 1,
    badge_text: "About Eon Technology",
    title: "Eon Technology Pvt. Ltd.",
    subtitle: "Premier Authorized Distributor & IT Solution Provider in Nepal. Delivering authentic security surveillance, optical networking, gaming hardware, and enterprise smart office solutions.",
    description: "Premier Authorized Distributor & IT Solution Provider in Nepal. Delivering authentic security surveillance, optical networking, gaming hardware, and enterprise smart office solutions.",
    image: "/eontechnology-logo.png",
    buttonText: "Company Solutions",
    link: "/solutions",
    specs: [
      { label: "Authorized", value: "5 Global Brands" },
      { label: "Hardware", value: "4,300+ Products" },
      { label: "Service", value: "Official Repair Center" }
    ],
    is_active: true,
  },
  {
    order: 2,
    badge_text: "AI Surveillance Flagship",
    title: "Dahua 4K WizSense AI Security Systems",
    subtitle: "Next-generation perimeter protection with 24/7 full-color night vision and deep-learning human/vehicle analytics.",
    description: "Next-generation perimeter protection with 24/7 full-color night vision and deep-learning human/vehicle analytics.",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&h=600&fit=crop",
    buttonText: "Explore Dahua",
    link: "/brand/dahua",
    specs: [
      { label: "Resolution", value: "4K Ultra-HD" },
      { label: "AI Engine", value: "WizSense 4.0" },
      { label: "Night Vision", value: "Full-Color 24/7" }
    ],
    is_active: true,
  },
  {
    order: 3,
    badge_text: "Enterprise Network",
    title: "CP Plus High-Speed Gigabit & PoE Infrastructure",
    subtitle: "Robust commercial surveillance switching, long-range 250m PoE delivery, and ultra-durable network backbones.",
    description: "Robust commercial surveillance switching, long-range 250m PoE delivery, and ultra-durable network backbones.",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=600&fit=crop",
    buttonText: "Explore CP Plus",
    link: "/brand/cp-plus",
    specs: [
      { label: "Bandwidth", value: "10Gbps Uplink" },
      { label: "PoE Distance", value: "Up to 250m" },
      { label: "Protection", value: "6kV Surge" }
    ],
    is_active: true,
  },
  {
    order: 4,
    badge_text: "Esports Battlestation",
    title: "Ant Esports Tournament-Grade Gaming Rigs",
    subtitle: "Engineered for high-FPS competitive esports. High-airflow chassis, ARGB liquid cooling, and tactile mechanical hardware.",
    description: "Engineered for high-FPS competitive esports. High-airflow chassis, ARGB liquid cooling, and tactile mechanical hardware.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop",
    buttonText: "Explore Ant Esports",
    link: "/brand/ant-esports",
    specs: [
      { label: "Cooling", value: "360mm AIO ARGB" },
      { label: "Keyboards", value: "Optical Mechanical" },
      { label: "Latency", value: "Sub-1ms Response" }
    ],
    is_active: true,
  },
  {
    order: 5,
    badge_text: "Smart Workstation",
    title: "Bestor & Intex Multi-Port Productivity Docks",
    subtitle: "Transform your laptop into an ergonomic multi-display powerhouse with 100W PD charging and high-speed NVMe data transfer.",
    description: "Transform your laptop into an ergonomic multi-display powerhouse with 100W PD charging and high-speed NVMe data transfer.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
    buttonText: "Explore Workstations",
    link: "/solutions",
    specs: [
      { label: "Displays", value: "Dual 4K HDMI" },
      { label: "Power Delivery", value: "100W Fast Charge" },
      { label: "Transfer", value: "10Gbps NVMe Hub" }
    ],
    is_active: true,
  }
];

const AUTO_SLIDE_INTERVAL = 5500; // 5.5 seconds per slide

export const HeroBanner = () => {
  const [slides, setSlides] = useState<HeroContent[]>(DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fadeState, setFadeState] = useState<"in" | "out">("in");
  const { companySlug } = useStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch slides from database
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const data = await heroService.getAllSlides({ company: companySlug });
        if (data && data.length > 0) {
          // Sort explicitly by order
          const sorted = [...data].sort((a, b) => (a.order || 0) - (b.order || 0));
          setSlides(sorted);
        }
      } catch (err) {
        console.error("Error loading hero slides:", err);
      }
    };
    fetchHero();
  }, [companySlug]);

  // Auto slide timer
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setFadeState("out");
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
        setFadeState("in");
      }, 250);
    }, AUTO_SLIDE_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, isPaused, currentIndex]);

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setFadeState("out");
    setTimeout(() => {
      setCurrentIndex(index);
      setFadeState("in");
    }, 200);
  };

  const nextSlide = () => {
    setFadeState("out");
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
      setFadeState("in");
    }, 200);
  };

  const prevSlide = () => {
    setFadeState("out");
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
      setFadeState("in");
    }, 200);
  };

  const currentSlide = slides[currentIndex] || DEFAULT_SLIDES[0];

  return (
    <div 
      className="relative overflow-hidden rounded-[var(--radius-outer)] bg-gradient-to-br from-foreground to-primary/20 text-background min-h-[440px] sm:min-h-[480px] lg:min-h-[520px] flex items-center group/banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative grid */}
      <div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }} 
      />

      {/* Target Container requested by user: */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 sm:gap-10 p-6 sm:p-10 lg:p-16 w-full">
        {/* Left: Text & Specs Content */}
        <div 
          className={`flex-1 space-y-5 sm:space-y-6 text-center lg:text-left transition-all duration-300 transform ${
            fadeState === "in" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/25 border border-primary/30 rounded-full text-[10px] sm:text-xs font-mono uppercase tracking-widest text-primary-foreground mx-auto lg:mx-0 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span>{currentSlide.badge_text || "Featured Hardware"}</span>
            <span className="text-[9px] opacity-70 border-l border-white/20 pl-2">
              0{currentIndex + 1} / 0{slides.length}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight leading-[1.15] whitespace-pre-line text-white">
            {currentSlide.title}
          </h1>

          {/* Description */}
          <p className="text-white/80 text-sm sm:text-base lg:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed line-clamp-3">
            {currentSlide.description || currentSlide.subtitle}
          </p>
          
          {/* Technical Specs List */}
          {currentSlide.specs && currentSlide.specs.length > 0 && (
            <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-6 pt-1 flex-wrap">
              {currentSlide.specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/30 flex items-center justify-center border border-primary/30 text-white shrink-0">
                    <Monitor size={15} />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] uppercase tracking-wider text-white/50 font-bold">{spec.label}</p>
                    <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[120px]">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA Link */}
          <div className="pt-2 flex items-center justify-center lg:justify-start gap-4">
            <Link
              to={currentSlide.link || "/category/all"}
              className="btn-primary group inline-flex items-center gap-2 shadow-xl shadow-primary/30"
            >
              <span>{currentSlide.buttonText || "Explore Catalog"}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <span className="text-xs text-white/50 font-semibold hidden sm:inline">
              Slide {currentIndex + 1} of {slides.length}
            </span>
          </div>
        </div>

        {/* Right: Featured Image with Glow */}
        <div 
          className={`flex-1 flex justify-center w-full lg:w-auto transition-all duration-300 transform ${
            fadeState === "in" ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <div className="relative group">
            <div className="absolute -inset-10 bg-primary/25 rounded-full blur-[90px] opacity-60 group-hover:opacity-90 transition-opacity duration-700 pointer-events-none" />
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 p-4 sm:p-5 rounded-3xl backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden flex flex-col items-center justify-center">
              {currentSlide.image?.toLowerCase().includes("logo") ? (
                <div className="w-full max-w-[280px] sm:max-w-[380px] lg:max-w-[460px] h-[220px] sm:h-[300px] flex items-center justify-center bg-card/60 dark:bg-black/40 rounded-2xl p-6 sm:p-8 border border-white/10 shadow-inner">
                  <img
                    src={currentSlide.image || "/eontechnology-logo.png"}
                    alt={currentSlide.title}
                    className="max-h-[140px] sm:max-h-[180px] w-auto object-contain transform group-hover:scale-105 transition-transform duration-500 filter drop-shadow-md"
                  />
                </div>
              ) : (
                <CachedImage
                  src={currentSlide.image}
                  alt={currentSlide.title}
                  className="w-full max-w-[280px] sm:max-w-[380px] lg:max-w-[460px] h-[220px] sm:h-[300px] object-cover rounded-2xl transform group-hover:scale-[1.03] transition-transform duration-500"
                />
              )}
              <div className="absolute bottom-6 left-6 right-6 p-2.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/15 text-center">
                <p className="text-[11px] font-bold text-white tracking-wide truncate">
                  {currentSlide.badge_text}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-70 hover:opacity-100 transition-all z-20 shadow-lg hover:scale-110"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-70 hover:opacity-100 transition-all z-20 shadow-lg hover:scale-110"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Bottom Indicator Dots & Progress Bars (1st, 2nd, 3rd, 4th) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
        {slides.map((s, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 flex items-center justify-center ${
                isActive ? "w-8 bg-primary shadow-sm" : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
              title={`Go to Slide ${idx + 1}: ${s.title}`}
            />
          );
        })}

        <button
          onClick={() => setIsPaused(!isPaused)}
          className="ml-1 text-white/60 hover:text-white transition-colors"
          title={isPaused ? "Resume slideshow" : "Pause slideshow"}
        >
          {isPaused ? <Play size={10} /> : <Pause size={10} />}
        </button>
      </div>

      {/* Decorative corner gradients */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/15 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
    </div>
  );
};
