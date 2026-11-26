import { Link } from "react-router-dom";
import { Network, ShieldCheck, Laptop, Zap, ArrowUpRight } from "lucide-react";

interface QuickCardItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  link: string;
  color: string;
}

const QUICK_CARDS: QuickCardItem[] = [
  {
    id: "it-infra",
    category: "IT & TELECOM INFRA",
    title: "Smart Enterprise Tech",
    subtitle: "Enterprise servers, optical networking & high-density data storage.",
    icon: Network,
    link: "/solutions",
    color: "#ea580c"
  },
  {
    id: "security",
    category: "AI SURVEILLANCE & SECURITY",
    title: "AI Vision & Perimeter",
    subtitle: "Dahua & CP Plus intelligent 4K commercial surveillance architectures.",
    icon: ShieldCheck,
    link: "/brand/dahua",
    color: "#3b82f6"
  },
  {
    id: "distribution",
    category: "IT DISTRIBUTION & RETAIL",
    title: "Hardware Distribution",
    subtitle: "Authorized workstations, competitive esports rigs & authentic parts.",
    icon: Laptop,
    link: "/catalog",
    color: "#8b5cf6"
  },
  {
    id: "power",
    category: "POWER & INFRASTRUCTURE",
    title: "Reliable Backup Power",
    subtitle: "Industrial backup power, server racks, cooling & cable management.",
    icon: Zap,
    link: "/solutions",
    color: "#f59e0b"
  }
];

export const HeroQuickCards = () => {
  return (
    <section className="relative z-30 -mt-8 sm:-mt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {QUICK_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.id}
              to={card.link}
              className="group relative bg-card/95 hover:bg-card border border-[#F4D9A0]/30 hover:border-[#CB792C] rounded-2xl p-5 shadow-lg hover:shadow-[0_16px_36px_-8px_rgba(91,70,50,0.18),0_0_20px_-2px_rgba(244,217,160,0.3)] transition-all duration-300 hover:-translate-y-1 backdrop-blur-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-200 shadow-sm"
                    style={{ backgroundColor: `${card.color}15`, color: card.color, border: `1px solid ${card.color}30` }}
                  >
                    <Icon size={22} strokeWidth={2.2} />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-accent/60 group-hover:bg-[#CB792C] group-hover:text-white text-muted-foreground flex items-center justify-center transition-all duration-200 group-hover:shadow-[0_0_12px_rgba(203,121,44,0.4)]">
                    <ArrowUpRight size={14} />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#CB792C] block mb-0.5">
                    {card.category}
                  </span>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-[#CB792C] transition-colors leading-snug">
                    {card.title}
                  </h3>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {card.subtitle}
                </p>
              </div>

              <div className="pt-3">
                <div className="h-0.5 w-8 bg-border group-hover:w-full group-hover:bg-gradient-to-r group-hover:from-[#CB792C] group-hover:via-[#F4D9A0] group-hover:to-[#CB792C] transition-all duration-300 rounded-full" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
