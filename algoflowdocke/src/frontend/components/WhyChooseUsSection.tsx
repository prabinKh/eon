import { ShieldCheck, ArrowRight, Clock, Target, Settings, Globe2, Cpu, Wrench, Users, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useHomeContent } from "@/hooks/useHomeContent";
import { useStore } from "@/frontend/context/StoreContext";

const ICON_MAP: Record<string, React.ElementType> = {
  Clock,
  Target,
  Settings,
  Globe2,
  Cpu,
  Wrench,
  Users,
  ShieldCheck,
  CheckCircle2,
};

export const WhyChooseUsSection = () => {
  const { company } = useStore();
  const { content } = useHomeContent();
  const companyName = company?.name || "Eon Technology";

  const badge = content?.why_badge || "ENTERPRISE EXCELLENCE";
  const title = content?.why_title || "Why Nepal’s Technology Channel Chooses EON";
  const description = content?.why_description || "Engineered for uncompromising reliability, official distribution warranties, fast RMA processing, and certified engineer support.";

  const items = content?.why_items && content.why_items.length > 0
    ? content.why_items
    : [
        { title: "Official Brand Warranties", desc: "100% genuine hardware with verified manufacturer backing and direct RMA pathways.", tag: "Authorized", icon: "ShieldCheck" },
        { title: "Scalable Infrastructure", desc: "Turnkey enterprise servers, SAN storage, optical networking, and 4K surveillance.", tag: "Enterprise", icon: "Cpu" },
        { title: "Certified Component RMA Center", desc: "Official in-house component maintenance facility ensuring minimum downtime.", tag: "Service Hub", icon: "Wrench" },
        { title: "Dedicated B2B Channel Support", desc: "Pre-sales engineering consultations, solution architecture, and prompt quotation.", tag: "Partner First", icon: "Users" }
      ];

  return (
    <section className="relative py-20 sm:py-28 bg-[#18100A] text-white overflow-hidden border-t border-[#F4D9A0]/15">
      {/* Background Graphic Elements */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center mix-blend-overlay"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#18100A] via-[#2A1C12]/95 to-[#18100A]" />
      
      {/* Glow Spheres - Warm Bronze, Copper and Champagne Gold */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#CB792C]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#F4D9A0]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#5B4632]/25 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5B4632]/50 border border-[#F4D9A0]/30 shadow-[0_0_15px_rgba(244,217,160,0.15)] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#CB792C] animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#F4D9A0] text-lighting-gold">
              {badge}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight letter-lighting text-gradient-gold-light max-w-3xl mx-auto">
            {title}
          </h2>
          <p className="text-[#F4D9A0]/80 text-sm sm:text-base max-w-2xl mx-auto font-light leading-relaxed">
            {description}
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {items.map((item, idx) => {
            const IconComponent = (item.icon && ICON_MAP[item.icon]) ? ICON_MAP[item.icon] : ShieldCheck;
            return (
              <div
                key={idx}
                className="group relative bg-[#5B4632]/20 hover:bg-[#5B4632]/40 border border-[#F4D9A0]/25 hover:border-[#CB792C] rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between shadow-lg hover:shadow-[0_10px_30px_rgba(203,121,44,0.25)] backdrop-blur-sm"
              >
                <div className="space-y-4">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#CB792C]/30 to-[#5B4632]/40 border border-[#F4D9A0]/35 text-[#F4D9A0] flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-[0_0_15px_rgba(244,217,160,0.15)] group-hover:text-white group-hover:border-[#CB792C]">
                    <IconComponent size={28} strokeWidth={2} />
                  </div>

                  {/* Title & Tag */}
                  <div>
                    {item.tag && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#F4D9A0] text-lighting-gold block mb-1">
                        {item.tag}
                      </span>
                    )}
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#F4D9A0] transition-colors leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-neutral-300/90 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom Accent Indicator */}
                <div className="pt-6">
                  <div className="h-1 w-10 bg-[#F4D9A0]/25 group-hover:w-full group-hover:bg-gradient-to-r group-hover:from-[#CB792C] group-hover:to-[#F4D9A0] transition-all duration-300 rounded-full" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Assurance Bar */}
        <div className="mt-16 pt-8 border-t border-[#F4D9A0]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#CB792C]/20 border border-[#F4D9A0]/30 flex items-center justify-center text-[#F4D9A0]">
              <ShieldCheck size={18} className="shrink-0" />
            </div>
            <p className="text-xs sm:text-sm text-[#F4D9A0]/90 font-medium">
              Every system distributed by {companyName} carries manufacturer serial traceability and verified warranty.
            </p>
          </div>

          <Link
            to="/service-center"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F4D9A0] hover:text-white transition-colors bg-[#5B4632]/40 hover:bg-[#CB792C] px-4 py-2.5 rounded-xl border border-[#F4D9A0]/30 shadow-sm"
          >
            <span className="letter-lighting">Learn About Authorized Warranty</span>
            <ArrowRight size={14} className="text-[#CB792C] group-hover:text-white" />
          </Link>
        </div>
      </div>
    </section>
  );
};
