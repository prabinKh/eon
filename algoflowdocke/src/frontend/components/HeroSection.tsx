import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Pause, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { heroService, type HeroContent } from "@/api/heroService";
import { useStore } from "@/frontend/context/StoreContext";

const FALLBACK_SLIDES: HeroContent[] = [
  {
    id: "fallback-1",
    badge_text: "One Trusted Partner for IT, Security & Business Solutions",
    title: "Reliable distribution for Nepal’s technology channel",
    subtitle: "IT • SECURITY • NETWORKING • AUDIO",
    description: "A B2B distribution partner connecting global technology brands with Nepal’s dealers, integrators and business customers with certified local warranty support.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2000&q=80",
    media_type: "image",
    buttonText: "Become an EON Channel Partner",
    link: "/solutions",
    order: 1,
    is_active: true,
    specs: [
      { label: "Pillars", value: "IT • Security • Network • Audio" },
      { label: "Distribution", value: "Nationwide Dealers" },
      { label: "Service", value: "Authorized Support Center" }
    ]
  },
  {
    id: "fallback-2",
    badge_text: "AI Vision & Surveillance Architecture",
    title: "Dahua 4K WizSense & AI Perimeter Security",
    subtitle: "Next-Generation Intelligent Commercial Monitoring",
    description: "Empowering businesses with 24/7 full-color optics, human and vehicle classification, thermal imaging, and centralized command-and-control surveillance.",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=2000&q=80",
    media_type: "image",
    buttonText: "Explore Dahua",
    link: "/brand/dahua",
    order: 2,
    is_active: true,
    specs: [
      { label: "Resolution", value: "4K Ultra-HD" },
      { label: "AI Engine", value: "WizSense 4.0" },
      { label: "Night Vision", value: "Full-Color 24/7" }
    ]
  },
  {
    id: "fallback-3",
    badge_text: "Enterprise Optical & High-Throughput Switching",
    title: "CP Plus Commercial Telecom & PoE Backbones",
    subtitle: "Robust Industrial Connectivity for Digital Enterprises",
    description: "Industrial-grade 250m long-range PoE delivery, 10Gbps optical fiber aggregation, and fault-tolerant network topologies built for demanding enterprise workloads.",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=2000&q=80",
    media_type: "image",
    buttonText: "Explore CP Plus",
    link: "/brand/cp-plus",
    order: 3,
    is_active: true,
    specs: [
      { label: "Bandwidth", value: "10Gbps Uplink" },
      { label: "PoE Distance", value: "Up to 250m" },
      { label: "Protection", value: "6kV Surge" }
    ]
  }
];

export const HeroSection = () => {
  const { company } = useStore();
  const [slides, setSlides] = useState<HeroContent[]>(FALLBACK_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const SLIDE_DURATION = 6000;

  useEffect(() => {
    let mounted = true;
    heroService.getAllSlides().then((data) => {
      if (mounted && Array.isArray(data) && data.length > 0) {
        const active = data.filter((s) => s.is_active !== false);
        if (active.length > 0) setSlides(active);
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const total = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % total);
    setProgress(0);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + total) % total);
    setProgress(0);
  }, [total]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    if (isPlaying && total > 1) {
      const step = 50;
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => Math.min(prev + (step / SLIDE_DURATION) * 100, 100));
      }, step);

      timerRef.current = setInterval(() => {
        nextSlide();
      }, SLIDE_DURATION);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, currentSlide, total, nextSlide]);

  const active = slides[currentSlide] || slides[0] || FALLBACK_SLIDES[0];

  return (
    <section className="relative w-full overflow-hidden bg-[#120D09] text-white min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] flex items-center">
      {/* Ambient Lighting Spheres with Bronze & Gold Glow */}
      <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] bg-[#5B4632]/40 rounded-full blur-[140px] pointer-events-none z-10" />
      <div className="absolute bottom-0 right-10 w-[450px] h-[450px] bg-[#CB792C]/20 rounded-full blur-[130px] pointer-events-none z-10" />
      <div className="absolute top-1/3 left-10 w-[300px] h-[300px] bg-[#F4D9A0]/15 rounded-full blur-[100px] pointer-events-none z-10" />

      {/* Background Media with smooth transition */}
      {slides.map((s, idx) => (
        <div
          key={s.id || idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          {s.media_type === "video" && s.video_url ? (
            <video
              src={s.video_url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={s.image || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2000&q=80"}
              alt={s.title || "Hero banner"}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#140E0A]/95 via-[#140E0A]/85 to-[#140E0A]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#140E0A] via-transparent to-transparent" />
        </div>
      ))}

      {/* Hero Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <div className="max-w-3xl space-y-6">
          {/* Badge with Illuminated Golden Lettering */}
          {active.badge_text && (
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#5B4632]/85 border border-[#F4D9A0]/50 shadow-[0_0_20px_rgba(244,217,160,0.3)] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#CB792C] shadow-[0_0_10px_#CB792C] animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#F4D9A0] drop-shadow-[0_0_8px_rgba(244,217,160,0.4)]">
                {active.badge_text}
              </span>
            </div>
          )}

          {/* Title with Illuminated Letter Lighting */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] letter-lighting text-gradient-gold-light">
            {active.title}
          </h1>

          {/* Subtitle / Description */}
          <p className="text-sm sm:text-lg text-[#F4D9A0]/90 leading-relaxed font-normal max-w-2xl drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
            {active.description || active.subtitle}
          </p>

          {/* Specs / Highlights */}
          {active.specs && active.specs.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {active.specs.slice(0, 3).map((spec, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#5B4632]/40 backdrop-blur-md border border-[#F4D9A0]/25 shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:border-[#CB792C]/60 transition-colors">
                  <div className="text-[10px] uppercase tracking-wider text-[#F4D9A0]/70 font-semibold">{spec.label}</div>
                  <div className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate drop-shadow-[0_0_10px_rgba(244,217,160,0.3)]">{spec.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              to={active.link || "/solutions"}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#CB792C] hover:bg-[#b86922] text-white border border-[#F4D9A0]/40 font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-[0_0_24px_rgba(203,121,44,0.45)] hover:shadow-[0_0_32px_rgba(244,217,160,0.5)] hover:-translate-y-0.5"
            >
              <span>{active.buttonText || "Explore Solutions"}</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/service-center"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#5B4632]/50 hover:bg-[#5B4632]/80 border border-[#F4D9A0]/30 hover:border-[#F4D9A0]/60 text-white hover:text-[#F4D9A0] font-bold text-xs uppercase tracking-wider transition-all backdrop-blur-sm shadow-md"
            >
              <ShieldCheck size={16} className="text-[#CB792C]" />
              <span>Authorized Support</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Navigation Controls */}
      {total > 1 && (
        <div className="absolute z-20 bottom-6 right-6 sm:bottom-10 sm:right-10 flex items-center gap-3 bg-[#1A120C]/80 backdrop-blur-md border border-[#F4D9A0]/30 px-4 py-2.5 rounded-2xl shadow-xl">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-[#F4D9A0] hover:text-white p-1 transition-colors"
            aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>

          {/* Indicators */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentSlide(i);
                  setProgress(0);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentSlide ? "w-6 bg-[#CB792C] shadow-[0_0_10px_#CB792C]" : "w-1.5 bg-[#F4D9A0]/30 hover:bg-[#F4D9A0]/70"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="h-4 w-[1px] bg-[#F4D9A0]/20 mx-1" />

          {/* Arrows */}
          <button
            onClick={prevSlide}
            className="text-[#F4D9A0] hover:text-white p-1 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextSlide}
            className="text-[#F4D9A0] hover:text-white p-1 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
};
