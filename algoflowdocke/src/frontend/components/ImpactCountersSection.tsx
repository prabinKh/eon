import { useState, useEffect, useRef } from "react";
import { Award, Package, Calendar, Globe, Users, TrendingUp } from "lucide-react";
import { useHomeContent } from "@/hooks/useHomeContent";

const COUNTER_ICONS = [Award, Globe, Package, TrendingUp, Calendar, Users];

export const ImpactCountersSection = () => {
  const { content } = useHomeContent();
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const rawCounters = content?.counters && content.counters.length > 0
    ? content.counters
    : [
        { value: "18", suffix: "+", label: "Years Channel Leadership", desc: "Dedicated B2B tech distribution in Nepal" },
        { value: "500", suffix: "+", label: "Active Dealer Network", desc: "Trusted partners across all provinces" },
        { value: "4300", suffix: "+", label: "Genuine SKU Catalog", desc: "IT, security, networking and audio" },
        { value: "99.8", suffix: "%", label: "SLA Turnaround Rate", desc: "Fast RMA fulfillment and support" }
      ];

  const parsedNumbers = rawCounters.map((c) => parseFloat(c.value) || 0);
  const [counts, setCounts] = useState<number[]>(parsedNumbers.map(() => 0));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const duration = 1800;
          const steps = 35;
          const intervalTime = duration / steps;
          let currentStep = 0;

          const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);

            setCounts(
              parsedNumbers.map((num) => {
                const val = num * easeOutProgress;
                return num % 1 === 0 ? Math.round(val) : Math.round(val * 10) / 10;
              })
            );

            if (currentStep >= steps) {
              clearInterval(timer);
              setCounts(parsedNumbers);
            }
          }, intervalTime);
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, parsedNumbers]);

  return (
    <section ref={sectionRef} className="py-14 sm:py-20 bg-gradient-to-b from-[#18100A] via-[#22160E] to-[#18100A] border-y border-[#F4D9A0]/20 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-[#CB792C]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-[#F4D9A0]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {rawCounters.map((counter, idx) => {
            const Icon = COUNTER_ICONS[idx % COUNTER_ICONS.length];
            return (
              <div
                key={idx}
                className="group flex flex-col items-center text-center p-6 sm:p-7 rounded-2xl bg-[#5B4632]/25 hover:bg-[#5B4632]/45 border border-[#F4D9A0]/25 hover:border-[#CB792C] shadow-lg hover:shadow-[0_10px_30px_rgba(203,121,44,0.25)] transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm"
              >
                {/* Icon Container */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#CB792C]/30 to-[#5B4632]/40 border border-[#F4D9A0]/35 text-[#F4D9A0] flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300 shadow-[0_0_15px_rgba(244,217,160,0.15)] group-hover:text-white group-hover:border-[#CB792C]">
                  <Icon size={26} strokeWidth={2.2} />
                </div>

                {/* Number with letter lighting */}
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold letter-lighting text-gradient-gold-light tracking-tight">
                    {hasAnimated ? counts[idx] : counter.value}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-[#CB792C] text-lighting-copper">
                    {counter.suffix}
                  </span>
                </div>

                {/* Label */}
                <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-[#F4D9A0] transition-colors mt-1">
                  {counter.label}
                </h4>
                {counter.desc && (
                  <p className="text-xs text-[#F4D9A0]/75 mt-0.5 font-light">
                    {counter.desc}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
