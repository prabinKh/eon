import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, Truck, Wrench, ShieldCheck, Network, CheckCircle2, Store } from "lucide-react";
import { useHomeContent } from "@/hooks/useHomeContent";

const ICON_MAP: Record<string, React.ElementType> = {
  Truck,
  Wrench,
  ShieldCheck,
  Network,
  CheckCircle2,
  Store
};

export const ServicesSection = () => {
  const { content } = useHomeContent();

  const badge = content?.services_badge || "AUTHORIZED TECHNICAL SERVICES";
  const title = content?.services_title || "Component Maintenance & Technical Support";
  const description = content?.services_description || "Certified component-level diagnosis, hardware warranty RMA processing, enterprise surveillance SLAs, and rapid turnaround.";

  const items = content?.services_items && content.services_items.length > 0
    ? content.services_items
    : [
        { title: "Component-Level Micro Repair", desc: "Precision BGA chip rework, motherboard capacitor diagnostics, and power rail restoration.", turnaround: "24-48h Priority", icon: "Wrench" },
        { title: "Enterprise Surveillance SLA", desc: "On-site NVR/XVR maintenance, camera calibration, optical cleaning, and firmware compliance.", turnaround: "Same-Day Dispatch", icon: "ShieldCheck" },
        { title: "Structured Cabling & Fiber Splicing", desc: "OTDR testing, core-alignment fusion splicing, and structured rack cabling certification.", turnaround: "Scheduled Deployment", icon: "Network" },
        { title: "Official Warranty & RMA Processing", desc: "Direct manufacturer RMA claim fulfillment, instant DOA replacements, and status tracking.", turnaround: "Rapid Exchange", icon: "CheckCircle2" }
      ];

  return (
    <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        {/* Left Sticky Feature Column */}
        <div className="lg:col-span-4 relative rounded-2xl overflow-hidden p-8 sm:p-10 flex flex-col justify-between text-white shadow-2xl min-h-[380px] lg:min-h-full border border-[#F4D9A0]/25">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#18100A]/95 via-[#2D1F16]/90 to-[#5B4632]/95" />
          
          {/* Ambient Glow */}
          <div className="absolute top-10 right-10 w-48 h-48 bg-[#CB792C]/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#F4D9A0]/15 rounded-full blur-[80px] pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B4632]/70 border border-[#F4D9A0]/35 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CB792C]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F4D9A0] text-lighting-gold">
                {badge}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold letter-lighting text-gradient-gold-light leading-tight">
              {title}
            </h3>
            <p className="text-[#F4D9A0]/80 text-sm sm:text-base leading-relaxed font-light pt-2">
              {description}
            </p>
          </div>

          {/* Action */}
          <div className="relative z-10 pt-8">
            <Link
              to="/service-center"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#CB792C] hover:bg-[#b86c25] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_20px_rgba(203,121,44,0.35)] hover:shadow-[0_6px_25px_rgba(203,121,44,0.5)] hover:-translate-y-0.5 border border-[#F4D9A0]/40"
            >
              <span className="letter-lighting">Book A Service Request</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Right Cards Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {items.map((svc, idx) => {
            const IconComponent = (svc.icon && ICON_MAP[svc.icon]) ? ICON_MAP[svc.icon] : Wrench;

            return (
              <div
                key={idx}
                className="group relative bg-card hover:bg-[#5B4632]/5 rounded-2xl p-6 sm:p-7 border border-[#F4D9A0]/25 hover:border-[#CB792C] shadow-sm hover:shadow-[0_8px_25px_rgba(91,70,50,0.12)] transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#CB792C]/10 text-[#CB792C] border border-[#CB792C]/20 flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-[#CB792C] group-hover:text-white group-hover:border-[#F4D9A0]/40 duration-300">
                      <IconComponent size={24} />
                    </div>
                    {svc.turnaround && (
                      <span className="text-[11px] font-bold text-[#5B4632] dark:text-[#F4D9A0] bg-[#F4D9A0]/20 px-2.5 py-1 rounded-full border border-[#F4D9A0]/40">
                        {svc.turnaround}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-foreground group-hover:text-[#CB792C] transition-colors">
                    {svc.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {svc.desc}
                  </p>
                </div>

                <div className="pt-6">
                  <Link
                    to="/service-center"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#CB792C] group-hover:text-[#5B4632] dark:group-hover:text-[#F4D9A0] group-hover:translate-x-1 transition-all uppercase tracking-wider"
                  >
                    <span>View Service Center</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
