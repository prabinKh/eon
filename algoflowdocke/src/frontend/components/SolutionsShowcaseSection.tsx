import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ArrowRight, Brain, Cpu, Database, Network, ShieldCheck, User, Sparkles } from "lucide-react";
import { solutionService, type CompanySolution } from "@/api/solutionService";
import { useHomeContent } from "@/hooks/useHomeContent";
import { useStore } from "@/frontend/context/StoreContext";

interface DisplaySolutionItem {
  id?: string;
  title: string;
  summary: string;
  image: string;
  link: string;
}

const FALLBACK_SOLUTIONS: DisplaySolutionItem[] = [
  {
    id: "enterprise-it",
    title: "Enterprise IT Solutions",
    summary: "We assist businesses of all sizes in achieving digital transformation.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
    link: "/solutions/enterprise-it-datacenter-solutions"
  },
  {
    id: "surveillance",
    title: "Surveillance Security and Virtual Collaboration",
    summary: "We offer comprehensive security solutions that ensure enhanced protection for your property.",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80",
    link: "/solutions/surveillance-ai-security-collaboration"
  },
  {
    id: "telecom",
    title: "Telecom and Broadband",
    summary: "We provide the widest broadband coverage in Nepal, delivering the highest traffic and unmatched connectivity.",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80",
    link: "/solutions/telecom-optical-broadband-networks"
  },
  {
    id: "computing",
    title: "Computer, Accessories and Peripherals",
    summary: "We deliver essential, cutting-edge computer solutions that seamlessly support modern lifestyles.",
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80",
    link: "/solutions/computer-gaming-hardware-peripherals"
  },
  {
    id: "appliances",
    title: "Domestic and Commercial Appliances",
    summary: "We offer a diverse range of household and commercial appliances, providing modern and efficient solutions for everyday living.",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
    link: "/solutions/commercial-interactive-smart-displays"
  },
  {
    id: "specializations",
    title: "Specializations and Software Solutions",
    summary: "We bring together a team of dedicated experts, committed to delivering exceptional ICT services and solutions.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
    link: "/solutions/specializations-turnkey-solutions"
  }
];

export const SolutionsShowcaseSection = () => {
  const { content } = useHomeContent();
  const { company } = useStore();
  const [solutions, setSolutions] = useState<CompanySolution[]>([]);
  const companyName = company?.name || "Eon Technology";

  const badge = content?.products_badge || "PRODUCTS";
  const title = content?.products_title || "Powering Possibilities With Complete IT Solutions";
  const description =
    content?.products_description ||
    `${companyName} offers a wide range of products from mobile to computing products, servers, storage, networking, security, surveillance, GIS, databases, video conferencing etc.`;

  useEffect(() => {
    let mounted = true;
    solutionService.getAll()
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          setSolutions(data.slice(0, 6));
        }
      })
      .catch(() => {
        // Fallback gracefully to default items
      });

    return () => { mounted = false; };
  }, []);

  // Determine display list:
  // 1. If admin configured products_items in home settings, use those
  // 2. Otherwise if database CompanySolution items exist, format those
  // 3. Otherwise use FALLBACK_SOLUTIONS
  const displayList: DisplaySolutionItem[] = (() => {
    if (content?.products_items && Array.isArray(content.products_items) && content.products_items.length > 0) {
      return content.products_items.map((item, idx) => ({
        id: item.id || `admin-item-${idx}`,
        title: item.title,
        summary: item.desc,
        image: item.image || FALLBACK_SOLUTIONS[idx % FALLBACK_SOLUTIONS.length].image,
        link: item.link || "/solutions"
      }));
    }

    if (solutions && solutions.length > 0) {
      return solutions.map((sol, idx) => ({
        id: sol.id,
        title: sol.title,
        summary: sol.summary || (sol as any).description || FALLBACK_SOLUTIONS[idx % FALLBACK_SOLUTIONS.length].summary,
        image: sol.image || FALLBACK_SOLUTIONS[idx % FALLBACK_SOLUTIONS.length].image,
        link: sol.slug ? `/solutions/${sol.slug}` : "/solutions"
      }));
    }

    return FALLBACK_SOLUTIONS;
  })();

  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ── LEFT COLUMN: High-Tech Featured Banner ──────────────────────────── */}
        <div className="lg:col-span-4 xl:col-span-4 rounded-3xl relative overflow-hidden bg-gradient-to-br from-[#2D1F16] via-[#5B4632] to-[#18100A] text-white p-7 sm:p-10 flex flex-col justify-between shadow-2xl border border-[#F4D9A0]/30 min-h-[460px] lg:min-h-[640px] group">
          
          {/* Cybernetic Tech Circles & Concentric Circuit Rings */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
            {/* Ambient Radial Glow */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#CB792C]/25 rounded-full blur-[100px]" />
            <div className="absolute bottom-10 right-0 w-80 h-80 bg-[#F4D9A0]/20 rounded-full blur-[110px]" />

            {/* Circuit Ring Graphic SVG */}
            <svg
              className="absolute -right-20 top-1/2 -translate-y-1/2 w-[460px] h-[460px] opacity-30 group-hover:opacity-45 transition-opacity duration-700 pointer-events-none"
              viewBox="0 0 400 400"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="200" cy="200" r="190" stroke="#F4D9A0" strokeWidth="1" strokeDasharray="6 6" className="opacity-40 animate-[spin_60s_linear_infinite]" />
              <circle cx="200" cy="200" r="150" stroke="#CB792C" strokeWidth="1.5" className="opacity-60" />
              <circle cx="200" cy="200" r="110" stroke="#F4D9A0" strokeWidth="2" strokeDasharray="14 10" className="opacity-80 animate-[spin_40s_linear_infinite_reverse]" />
              <circle cx="200" cy="200" r="70" stroke="#CB792C" strokeWidth="1.5" className="opacity-90" />
              <circle cx="200" cy="200" r="30" fill="#F4D9A0" className="opacity-20" />
              <line x1="200" y1="10" x2="200" y2="390" stroke="#F4D9A0" strokeWidth="1" strokeDasharray="4 4" className="opacity-30" />
              <line x1="10" y1="200" x2="390" y2="200" stroke="#CB792C" strokeWidth="1" strokeDasharray="4 4" className="opacity-30" />
            </svg>

            {/* Orbiting Tech Icons with Golden Amber Glow */}
            <div className="absolute top-10 right-10 p-2.5 rounded-full bg-[#5B4632]/80 border border-[#F4D9A0]/40 text-[#F4D9A0] backdrop-blur-sm shadow-[0_0_12px_rgba(244,217,160,0.3)]">
              <Brain size={18} />
            </div>
            <div className="absolute top-28 right-4 p-2.5 rounded-full bg-[#5B4632]/80 border border-[#CB792C]/50 text-[#F4D9A0] backdrop-blur-sm shadow-[0_0_12px_rgba(203,121,44,0.3)]">
              <Database size={16} />
            </div>
            <div className="absolute bottom-24 right-10 p-2.5 rounded-full bg-[#5B4632]/80 border border-[#F4D9A0]/40 text-[#F4D9A0] backdrop-blur-sm shadow-[0_0_12px_rgba(244,217,160,0.3)]">
              <Network size={18} />
            </div>
            <div className="absolute bottom-36 left-6 p-2 rounded-full bg-[#5B4632]/80 border border-[#CB792C]/40 text-[#F4D9A0] backdrop-blur-sm shadow-[0_0_12px_rgba(203,121,44,0.3)]">
              <Cpu size={15} />
            </div>
          </div>

          {/* Main Left Content */}
          <div className="relative z-10 space-y-5">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B4632]/90 border border-[#F4D9A0]/40 shadow-[0_0_15px_rgba(244,217,160,0.25)]">
              <span className="w-2 h-2 rounded-full bg-[#CB792C] shadow-[0_0_8px_#CB792C] animate-pulse" />
              <span className="text-[#F4D9A0] font-extrabold text-xs uppercase tracking-[0.25em] drop-shadow-[0_0_6px_rgba(244,217,160,0.4)]">
                {badge}
              </span>
            </div>

            {/* Big Headline with Illuminated Letter Lighting */}
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-white leading-[1.2] tracking-tight letter-lighting text-gradient-gold-light">
              {title}
            </h2>

            {/* Description Narrative */}
            <p className="text-[#F4D9A0]/90 text-xs sm:text-sm leading-relaxed max-w-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
              {description}
            </p>
          </div>

          {/* Bottom Branding & Watermark */}
          <div className="relative z-10 pt-8 mt-6 border-t border-[#F4D9A0]/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5B4632] border border-[#F4D9A0]/40 flex items-center justify-center text-[#F4D9A0] shadow-[0_0_15px_rgba(244,217,160,0.3)]">
                <ShieldCheck size={22} className="text-[#CB792C]" />
              </div>
              <div>
                <span className="block text-white font-bold text-sm tracking-wide drop-shadow-[0_0_10px_rgba(244,217,160,0.3)]">
                  {companyName}
                </span>
                <span className="block text-[11px] text-[#F4D9A0]/80">
                  Authorized National Distributor
                </span>
              </div>
            </div>

            <Link
              to="/solutions"
              aria-label="View all enterprise IT solutions"
              className="p-2.5 rounded-full bg-[#CB792C] hover:bg-[#b86922] text-white border border-[#F4D9A0]/40 transition-all hover:scale-110 shadow-[0_0_20px_rgba(203,121,44,0.4)]"
            >
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* ── RIGHT COLUMN: 6 Product Solutions Cards (3 cols x 2 rows) ──────── */}
        <div className="lg:col-span-8 xl:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 h-full">
            {displayList.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-card hover:bg-accent/40 rounded-2xl p-4 sm:p-5 border border-[#F4D9A0]/25 hover:border-[#CB792C] shadow-sm hover:shadow-[0_16px_36px_-8px_rgba(91,70,50,0.18),0_0_20px_-2px_rgba(244,217,160,0.25)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Image Banner */}
                  <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-muted mb-4 relative shadow-inner">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Card Title (in Rich Copper #CB792C) */}
                  <h3 className="text-[#CB792C] font-bold text-sm sm:text-[15px] text-center leading-snug line-clamp-2 mb-2 group-hover:underline transition-colors">
                    <Link to={item.link}>
                      {item.title}
                    </Link>
                  </h3>

                  {/* Card Narrative */}
                  <p className="text-xs text-muted-foreground text-center line-clamp-3 leading-relaxed mb-4">
                    {item.summary}
                  </p>
                </div>

                {/* Card View More Link */}
                <div className="pt-2 border-t border-border/50 text-center">
                  <Link
                    to={item.link}
                    className="inline-flex items-center justify-center gap-1 text-xs font-bold text-[#CB792C] hover:text-[#b86922] transition-colors uppercase tracking-wider py-1 group-hover:drop-shadow-[0_0_8px_rgba(203,121,44,0.4)]"
                  >
                    <span>View More</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
