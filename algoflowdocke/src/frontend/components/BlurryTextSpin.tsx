import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface BlurryTextSpinProps {
  text: string;
  className?: string;
  stagger?: number;
  triggerHook?: string;
}

export default function BlurryTextSpin({
  text,
  className = "",
  stagger = 0.05,
  triggerHook = "top 85%"
}: BlurryTextSpinProps) {
  const containerRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const words = el.querySelectorAll(".spin-word");
    if (!words || words.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        {
          opacity: 0,
          filter: "blur(18px)",
          rotation: -55,
          scale: 0.65,
          y: 45,
        },
        {
          opacity: 1,
          filter: "blur(0px)",
          rotation: 0,
          scale: 1,
          y: 0,
          duration: 1.0,
          stagger: stagger,
          ease: "back.out(1.6)",
          scrollTrigger: {
            trigger: el,
            start: triggerHook,
            toggleActions: "play reverse play reverse",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [text, stagger, triggerHook]);

  const words = (text || "").split(" ");

  return (
    <h2 ref={containerRef} className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className="spin-word inline-block mr-[0.28em] will-change-transform origin-center"
        >
          {word}
        </span>
      ))}
    </h2>
  );
}
