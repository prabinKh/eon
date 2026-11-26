import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  ShieldCheck, 
  Network, 
  Gamepad2, 
  Monitor, 
  Laptop, 
  Server, 
  ArrowLeft, 
  CheckCircle2, 
  Building2, 
  PhoneCall, 
  Mail, 
  Layers, 
  Send, 
  ChevronRight,
  Sparkles,
  Cpu,
  Share2
} from "lucide-react";
import { toast } from "sonner";
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

export default function SolutionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [solution, setSolution] = useState<CompanySolution | null>(null);
  const [loading, setLoading] = useState(true);
  const [allSolutions, setAllSolutions] = useState<CompanySolution[]>([]);
  
  // Inquiry Form State
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryCompany, setInquiryCompany] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setLoading(true);
      try {
        const [sol, all] = await Promise.all([
          solutionService.getBySlug(slug),
          solutionService.getAll()
        ]);
        setSolution(sol);
        setAllSolutions(all.filter(s => s.slug !== slug));
      } catch (err) {
        console.error("Error loading solution detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim()) {
      toast.error("Please enter your name and email.");
      return;
    }
    setSubmittingInquiry(true);
    // Simulate sending inquiry to solution sales team
    setTimeout(() => {
      setSubmittingInquiry(false);
      toast.success("Inquiry submitted! Our solutions engineer will contact you shortly.");
      setInquiryOpen(false);
      setInquiryName("");
      setInquiryEmail("");
      setInquiryPhone("");
      setInquiryCompany("");
      setInquiryMessage("");
    }, 800);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: solution?.title || "Eon Technology Solution",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Solution link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 neo-container py-20">
          <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
            <div className="h-6 w-36 bg-accent rounded-lg" />
            <div className="h-12 w-3/4 bg-accent rounded-2xl" />
            <div className="h-72 w-full bg-accent rounded-3xl" />
            <div className="h-32 w-full bg-accent rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 neo-container py-24 text-center">
          <Layers size={64} className="mx-auto text-muted-foreground/30 mb-4" />
          <h1 className="text-2xl font-bold">Solution Architecture Not Found</h1>
          <p className="text-sm text-muted-foreground mt-2">
            The solution you are looking for might have been moved or updated.
          </p>
          <Link
            to="/solutions"
            className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs"
          >
            <ArrowLeft size={14} />
            <span>Back to All Solutions</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const IconComponent = (solution.icon && ICON_MAP[solution.icon]) || ShieldCheck;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Helmet>
        <title>{`${solution.title} | Eon Technology Solutions`}</title>
        <meta name="description" content={solution.summary || solution.tagline || solution.title} />
      </Helmet>

      <Header />

      <main className="flex-1 pb-16">
        {/* Breadcrumb Header */}
        <div className="bg-card border-b border-border py-4">
          <div className="neo-container flex items-center justify-between">
            <nav className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <ChevronRight size={12} />
              <Link to="/solutions" className="hover:text-foreground">Solutions</Link>
              <ChevronRight size={12} />
              <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs">{solution.title}</span>
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-accent/60 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                title="Share Solution"
              >
                <Share2 size={16} />
              </button>
              <Link
                to="/solutions"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/60 hover:bg-accent text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">All Solutions</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Banner Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-card via-background to-background py-10 sm:py-16">
          <div className="neo-container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                  <IconComponent size={14} />
                  <span>{solution.category}</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
                  {solution.title}
                </h1>

                {solution.tagline && (
                  <p className="text-base sm:text-lg font-medium text-primary leading-relaxed">
                    {solution.tagline}
                  </p>
                )}

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {solution.summary || solution.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setInquiryOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg hover:bg-primary/90 transition-all hover:scale-102"
                  >
                    <Send size={14} />
                    <span>Request Architecture Proposal</span>
                  </button>

                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent hover:bg-accent/80 border border-border text-foreground font-bold text-xs transition-all"
                  >
                    <Sparkles size={14} className="text-primary" />
                    <span>Talk with Solution Engineer</span>
                  </button>
                </div>
              </div>

              {/* Banner Image */}
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl bg-card">
                  <img
                    src={solution.image || "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1000&q=80"}
                    alt={solution.title}
                    className="w-full h-72 sm:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-background/90 backdrop-blur-md border border-border/80 shadow-lg">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                        Distributor Warranty
                      </span>
                      <span className="font-black text-emerald-500">100% Genuine</span>
                    </div>
                    <p className="text-xs font-semibold text-foreground mt-1">
                      Direct Manufacturer Authorization & Local Technical Service
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Deep Dive Grid */}
        <section className="py-10">
          <div className="neo-container grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 8 Columns: Architecture & Features */}
            <div className="lg:col-span-8 space-y-10">
              {/* Detailed Overview */}
              <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 space-y-4">
                <h2 className="text-xl font-black text-foreground flex items-center gap-2.5">
                  <Cpu size={20} className="text-primary" />
                  <span>Architecture Overview & Scope</span>
                </h2>
                <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line space-y-3">
                  {solution.description || solution.summary}
                </div>
              </div>

              {/* Architecture Blueprint Steps */}
              {solution.architecture_points && solution.architecture_points.length > 0 && (
                <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 space-y-6">
                  <h2 className="text-xl font-black text-foreground flex items-center gap-2.5">
                    <Layers size={20} className="text-primary" />
                    <span>Key Architectural Components</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {solution.architecture_points.map((point, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3.5 p-4 rounded-2xl bg-accent/30 border border-border/60 hover:border-primary/30 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{point}</h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Tested for seamless integration & high throughput</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Features & Capabilities */}
              {solution.features && solution.features.length > 0 && (
                <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 space-y-6">
                  <h2 className="text-xl font-black text-foreground flex items-center gap-2.5">
                    <CheckCircle2 size={20} className="text-primary" />
                    <span>Technical Capabilities & Features</span>
                  </h2>
                  <div className="space-y-3">
                    {solution.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3.5 p-3.5 rounded-xl bg-accent/20 border border-border/40"
                      >
                        <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-sm font-medium text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Target Environments */}
              {solution.target_industries && solution.target_industries.length > 0 && (
                <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 space-y-4">
                  <h2 className="text-xl font-black text-foreground flex items-center gap-2.5">
                    <Building2 size={20} className="text-primary" />
                    <span>Target Deployment Environments</span>
                  </h2>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {solution.target_industries.map((ind, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 rounded-xl bg-accent/60 border border-border text-xs font-bold text-foreground flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 4 Columns: Sticky Quick Action Card & Related */}
            <div className="lg:col-span-4 space-y-6">
              {/* Direct Proposal Card */}
              <div className="bg-gradient-to-br from-card to-accent/40 rounded-3xl border border-border p-6 sm:p-7 shadow-lg space-y-5 sticky top-20">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                    Fast Inquiry
                  </span>
                  <h3 className="text-lg font-bold text-foreground">
                    Deploy this Architecture
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Contact our solution team for a customized Bill of Materials (BOM), system schematics, and wholesale pricing.
                  </p>
                </div>

                <div className="space-y-2.5 border-t border-border pt-4">
                  <button
                    onClick={() => setInquiryOpen(true)}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={14} />
                    <span>Request Custom Quote</span>
                  </button>

                  <a
                    href={`tel:${solution.contact_phone || "+97714567890"}`}
                    className="w-full py-3 rounded-xl bg-accent hover:bg-accent/80 border border-border text-foreground font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <PhoneCall size={14} className="text-primary" />
                    <span>{solution.contact_phone || "+977 1-4567890"}</span>
                  </a>

                  <a
                    href={`mailto:${solution.contact_email || "solutions@eontechnology.com"}?subject=${encodeURIComponent(`Inquiry for ${solution.title}`)}`}
                    className="w-full py-2.5 rounded-xl text-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors block"
                  >
                    {solution.contact_email || "solutions@eontechnology.com"}
                  </a>
                </div>

                {/* Related Hardware Catalog Link */}
                <div className="border-t border-border pt-4 space-y-2">
                  <p className="text-[11px] font-bold text-foreground">Browse Supporting Hardware:</p>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <Link
                      to="/brand/dahua"
                      className="p-2 rounded-xl bg-accent/50 hover:bg-accent border border-border text-xs font-bold text-primary transition-colors"
                    >
                      Dahua Lineup
                    </Link>
                    <Link
                      to="/brand/cp-plus"
                      className="p-2 rounded-xl bg-accent/50 hover:bg-accent border border-border text-xs font-bold text-primary transition-colors"
                    >
                      CP Plus Lineup
                    </Link>
                    <Link
                      to="/brand/ant-esports"
                      className="p-2 rounded-xl bg-accent/50 hover:bg-accent border border-border text-xs font-bold text-primary transition-colors"
                    >
                      Ant Esports
                    </Link>
                    <Link
                      to="/brand/bestor"
                      className="p-2 rounded-xl bg-accent/50 hover:bg-accent border border-border text-xs font-bold text-primary transition-colors"
                    >
                      Bestor Docks
                    </Link>
                  </div>
                </div>
              </div>

              {/* Other Solutions */}
              {allSolutions.length > 0 && (
                <div className="bg-card rounded-3xl border border-border p-6 space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                    Other Architectures
                  </h3>
                  <div className="space-y-3">
                    {allSolutions.slice(0, 3).map((other) => (
                      <Link
                        key={other.id}
                        to={`/solutions/${other.slug}`}
                        className="block p-3 rounded-2xl bg-accent/30 hover:bg-accent/60 border border-border/50 hover:border-primary/30 transition-all group"
                      >
                        <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {other.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {other.category}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Modal: Inquiry Modal */}
        {inquiryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Request Solution Proposal</h3>
                  <p className="text-xs text-muted-foreground">{solution.title}</p>
                </div>
                <button
                  onClick={() => setInquiryOpen(false)}
                  className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleInquirySubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="e.g. Ramesh Thapa"
                    className="w-full h-10 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full h-10 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      placeholder="+977 98..."
                      className="w-full h-10 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Organization / Facility</label>
                  <input
                    type="text"
                    value={inquiryCompany}
                    onChange={(e) => setInquiryCompany(e.target.value)}
                    placeholder="Company, Campus, or Project Name"
                    className="w-full h-10 px-3 rounded-xl bg-accent border border-border text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Project Scope & Requirements</label>
                  <textarea
                    rows={3}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Tell us about the number of channels, cameras, square footage, or target completion timeline..."
                    className="w-full p-3 rounded-xl bg-accent border border-border text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setInquiryOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-accent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 disabled:opacity-50"
                  >
                    {submittingInquiry ? "Submitting..." : "Submit Inquiry"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
