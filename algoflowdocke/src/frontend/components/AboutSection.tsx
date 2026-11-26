import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, Wrench, CheckCircle2 } from "lucide-react";
import { useHomeContent } from "@/hooks/useHomeContent";
import { useStore } from "@/frontend/context/StoreContext";

interface AboutSectionProps {
  className?: string;
  showExtraImages?: boolean;
}

export const AboutSection = ({ className = "", showExtraImages = true }: AboutSectionProps) => {
  const { company } = useStore();
  const { content } = useHomeContent();
  const companyName = company?.name || "Eon Technology";

  const badge = content?.about_badge || "BRAND FOUNDATION";
  const title = content?.about_title || "One Trusted Partner for IT, Security & Business Solutions.";
  const description = content?.about_description || `${companyName} is a dedicated B2B technology distribution partner connecting world-class global technology brands with Nepal’s dealers, system integrators, and business customers. We make hardware access, technical specifications, and channel support easier through one trusted partner across IT • Security • Networking • Audio.`;
  const image = content?.about_image || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80";
  const features = content?.about_features && content.about_features.length > 0
    ? content.about_features
    : [
        { title: "100% Genuine Guaranteed", desc: "Official manufacturer warranties and direct distribution" },
        { title: "Authorized Service Center", desc: "Certified technicians, original spare parts, and fast turnaround" }
      ];
  const ctaText = content?.about_cta_text || "Become an EON Channel Partner";
  const ctaLink = content?.about_cta_link || "/solutions";
  const secondaryCtaText = content?.about_secondary_cta_text || "Contact EON Technology";
  const secondaryCtaLink = content?.about_secondary_cta_link || "/service-center";

  return (
    <section className={`py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Narrative Content */}
        <div className="lg:col-span-6 space-y-6">
          {/* Badge */}
          <div>
            <span className="section-pre-title text-[#CB792C] font-black">{badge}</span>
          </div>

          {/* Main Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            {title}
          </h2>

          {/* Description */}
          <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
            <p>{description}</p>
          </div>

          {/* Feature Badges */}
          {features && features.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-[#F4D9A0]/35 hover:border-[#CB792C] shadow-sm hover:shadow-[0_8px_20px_-4px_rgba(91,70,50,0.12)] transition-all">
                  <div className="w-9 h-9 rounded-lg bg-[#5B4632]/10 text-[#CB792C] border border-[#F4D9A0]/40 flex items-center justify-center shrink-0 mt-0.5">
                    {idx === 0 ? <ShieldCheck size={19} /> : <Wrench size={19} />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">{feat.title}</span>
                    {feat.desc && <span className="text-[11px] text-muted-foreground leading-tight block mt-0.5">{feat.desc}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Call to Actions */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            {ctaText && (
              <Link
                to={ctaLink}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#CB792C] hover:bg-[#b86922] text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-[0_0_20px_rgba(203,121,44,0.35)] hover:shadow-[0_0_28px_rgba(244,217,160,0.45)] hover:-translate-y-0.5 border border-[#F4D9A0]/40"
              >
                <span>{ctaText}</span>
                <ArrowRight size={15} />
              </Link>
            )}

            {secondaryCtaText && (
              <Link
                to={secondaryCtaLink}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-card hover:bg-accent border border-[#F4D9A0]/40 hover:border-[#CB792C] text-foreground font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                <span>{secondaryCtaText}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Right Column: Imagery */}
        <div className="lg:col-span-6 relative">
          <div className="relative mx-auto max-w-lg lg:max-w-none">
            {/* Primary Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/60 aspect-[16/10] z-10">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            {/* Overlapping secondary image if enabled */}
            {showExtraImages && (
              <>
                <div className="relative -mt-16 sm:-mt-24 ml-auto w-4/5 rounded-2xl overflow-hidden shadow-2xl border-4 border-background z-20 aspect-[16/10]">
                  <img
                    src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
                    alt="Authorized Engineering Services"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>

                {/* Floating Achievement Badge */}
                <div className="absolute top-6 -left-4 sm:-left-6 z-30 bg-card/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-lg">
                    18+
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">Years in Nepal</div>
                    <div className="text-[11px] text-muted-foreground">Premier IT & Security</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
