import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  ShieldCheck, 
  Network, 
  Gamepad2, 
  Monitor, 
  Laptop, 
  Server, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  PhoneCall, 
  Mail, 
  Search, 
  Layers,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { solutionService, type CompanySolution } from "@/api/solutionService";

const ICON_MAP: Record<string, React.ElementType> = {
  ShieldCheck,
  Network,
  Gamepad2,
  Monitor,
  Laptop,
  Server,
  Layers,
  Building2,
};

export default function SolutionsPage() {
  const [solutions, setSolutions] = useState<CompanySolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadSolutions() {
      setLoading(true);
      try {
        const data = await solutionService.getAll();
        setSolutions(data);
      } catch (err) {
        console.error("Failed to load solutions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSolutions();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    solutions.forEach(s => {
      if (s.category) cats.add(s.category);
    });
    return ["all", ...Array.from(cats)];
  }, [solutions]);

  const filteredSolutions = useMemo(() => {
    return solutions.filter(sol => {
      const matchesCategory = selectedCategory === "all" || sol.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = !searchQuery.trim() || 
        sol.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sol.summary && sol.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sol.tagline && sol.tagline.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sol.target_industries && sol.target_industries.some(ind => ind.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [solutions, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Helmet>
        <title>Company Solutions & Hardware Architectures | Eon Technology</title>
        <meta 
          name="description" 
          content="Explore turnkey hardware and security architectures by Eon Technology. AI CCTV surveillance, enterprise optical networking, esports rigs, smart meeting rooms, and high-density storage." 
        />
      </Helmet>

      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-card via-background to-background border-b border-border py-16 sm:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.25),rgba(0,0,0,0))] pointer-events-none" />
          
          <div className="neo-container relative z-10 max-w-5xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="animate-pulse" />
              <span>Eon Technology Solutions</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
              Turnkey Hardware & <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">Enterprise Architectures</span>
            </h1>

            <p className="max-w-3xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
              We engineer mission-critical hardware ecosystems powered by authorized distributions of Dahua, CP Plus, Ant Esports, Intex, and Bestor. Built for uncompromising reliability, high performance, and rapid deployment.
            </p>

            {/* Quick Search & Filters */}
            <div className="pt-4 max-w-xl mx-auto">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search solutions by industry, keyword or use-case..."
                  className="w-full h-12 pl-11 pr-4 rounded-2xl bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm shadow-sm transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")} 
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-semibold px-2 py-1 bg-accent rounded-lg"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Categories Bar */}
        <section className="sticky top-14 sm:top-16 z-30 bg-background/90 backdrop-blur-md border-b border-border py-3">
          <div className="neo-container flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md scale-102"
                      : "bg-accent/50 text-muted-foreground hover:text-foreground hover:bg-accent border border-border/50"
                  }`}
                >
                  {cat === "all" ? "All Architectures" : cat}
                </button>
              );
            })}
          </div>
        </section>

        {/* Solutions Grid */}
        <section className="py-12 sm:py-16">
          <div className="neo-container">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-96 rounded-3xl bg-accent/30 animate-pulse border border-border" />
                ))}
              </div>
            ) : filteredSolutions.length === 0 ? (
              <div className="text-center py-20 bg-card/50 rounded-3xl border border-dashed border-border p-8">
                <Layers size={48} className="mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-bold">No Solutions Found</h3>
                <p className="text-sm text-muted-foreground mt-1">Try resetting your filter or search query.</p>
                <button
                  onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredSolutions.map((solution) => {
                  const IconComponent = (solution.icon && ICON_MAP[solution.icon]) || ShieldCheck;
                  return (
                    <article
                      key={solution.id}
                      className="group flex flex-col bg-card hover:bg-card/90 border border-border hover:border-primary/40 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                      {/* Image Header */}
                      <div className="relative h-52 w-full overflow-hidden bg-accent">
                        <img
                          src={solution.image || "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80"}
                          alt={solution.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary text-primary-foreground shadow-sm">
                            {solution.category}
                          </span>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-background/90 backdrop-blur-md flex items-center justify-center text-primary shadow-md shrink-0">
                            <IconComponent size={20} />
                          </div>
                          <h2 className="text-lg font-bold text-white leading-tight drop-shadow-sm">
                            {solution.title}
                          </h2>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          {solution.tagline && (
                            <p className="text-xs font-semibold text-primary line-clamp-1">
                              {solution.tagline}
                            </p>
                          )}

                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {solution.summary || solution.description}
                          </p>

                          {/* Features Preview */}
                          {solution.features && solution.features.length > 0 && (
                            <div className="pt-2 space-y-1.5">
                              {solution.features.slice(0, 3).map((feat, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-foreground/90">
                                  <CheckCircle2 size={13} className="text-primary mt-0.5 shrink-0" />
                                  <span className="line-clamp-1">{feat}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Target Industries */}
                          {solution.target_industries && solution.target_industries.length > 0 && (
                            <div className="pt-2 flex flex-wrap gap-1.5">
                              {solution.target_industries.slice(0, 3).map((ind, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-accent text-foreground/80 border border-border/50"
                                >
                                  {ind}
                                </span>
                              ))}
                              {solution.target_industries.length > 3 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 text-muted-foreground">
                                  +{solution.target_industries.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* CTA Footer */}
                        <div className="pt-4 border-t border-border flex items-center justify-between">
                          <Link
                            to={`/solutions/${solution.slug}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform"
                          >
                            <span>Explore Solution</span>
                            <ArrowRight size={14} />
                          </Link>

                          <button
                            onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
                            className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline"
                          >
                            Inquire
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Custom Engineering Banner */}
        <section className="py-16 bg-card border-t border-border">
          <div className="neo-container">
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/40 rounded-3xl border border-primary/20 p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl text-center lg:text-left">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary/20 text-primary">
                  Custom Architecture Design
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-foreground">
                  Need a Customized Hardware Deployment?
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Our certified network engineers and surveillance architects can design tailored bill-of-materials (BOM), IP topology, and storage plans for your facility.
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                  <a
                    href="tel:+97714567890"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 shadow-md transition-all"
                  >
                    <PhoneCall size={14} />
                    <span>Call Solution Desk</span>
                  </a>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/80 border border-border font-bold text-xs text-foreground transition-all"
                  >
                    <Mail size={14} />
                    <span>Start Consultation</span>
                  </button>
                </div>
              </div>

              <div className="w-full lg:w-80 p-6 bg-card rounded-2xl border border-border shadow-lg space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-foreground">Authorized Assurance</h4>
                    <p className="text-[11px] text-muted-foreground">100% genuine brand warranties</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    ⚙
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-foreground">On-Site Survey</h4>
                    <p className="text-[11px] text-muted-foreground">Engineering deployment survey</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                    ★
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-foreground">Eon Support SLA</h4>
                    <p className="text-[11px] text-muted-foreground">Priority repair & RMA processing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
