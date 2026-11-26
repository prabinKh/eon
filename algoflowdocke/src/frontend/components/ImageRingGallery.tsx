import React, { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";

interface ImageRingGalleryProps {
  images: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
  productTitle?: string;
  productSubtitle?: string;
}

const fillTo30 = (arr: string[]): string[] => {
  if (arr.length === 0) return [];
  const result: string[] = [];
  while (result.length < 30) result.push(...arr);
  return result.slice(0, 30);
};

const TOTAL       = 30;
const ANGLE_STEP  = 360 / TOTAL;   // 12 deg per card
const CARD_W      = 56;
const CARD_H      = 78;
const RING_RADIUS = 360;            // ring radius in px
const TILT_X      = 74;             // degrees to tilt ring flat (coin effect)

const ImageRingGallery: React.FC<ImageRingGalleryProps> = ({
  images,
  activeIndex,
  onSelect,
  productTitle   = "Product",
  productSubtitle = "",
}) => {
  const wrapRef      = useRef<HTMLDivElement>(null);
  const ringRef      = useRef<HTMLDivElement>(null);
  const centerImgRef = useRef<HTMLImageElement>(null);
  const prevSrcRef   = useRef("");

  const state = useRef({
    current:      0,     // smoothed display angle
    target:       0,     // destination angle
    velocity:     0,     // current angular velocity (deg/frame)
    autoSpin:     true,
    dragging:     false,
    dragStartX:   0,
    dragStartRot: 0,
    prevDragX:    0,     // for velocity calculation on release
    mouseOver:    false,
    lastMouseX:   0,
    scrubAccum:   0,
  });

  const items      = React.useMemo(() => fillTo30(images), [images]);
  const activeSrc  = items[activeIndex] ?? items[0] ?? "";

  // ── velocity-based physics ticker ────────────────────────────
  useEffect(() => {
    const FRICTION   = 0.92;    // velocity decay per frame
    const LERP       = 0.035;   // how fast current chases target
    const AUTO_VEL   = 0.12;    // auto-spin speed (deg/frame)

    const tick = () => {
      const s = state.current;

      if (s.dragging) {
        // while dragging, current follows target with tight lerp
        s.current += (s.target - s.current) * 0.18;
      } else {
        // apply velocity (from throw or auto-spin)
        if (s.autoSpin) {
          s.velocity += (AUTO_VEL - s.velocity) * 0.04; // ease into auto-speed
        } else {
          s.velocity *= FRICTION; // friction when not auto-spinning
        }
        s.target  += s.velocity;
        s.current += (s.target - s.current) * LERP;
      }

      if (ringRef.current) gsap.set(ringRef.current, { rotateY: s.current });
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  // ── sync activeIndex → ring ───────────────────────────────────
  useEffect(() => {
    const s      = state.current;
    const raw    = -activeIndex * ANGLE_STEP;
    const rounds = Math.round(s.target / 360) * 360;
    s.target     = rounds + raw;
    s.autoSpin   = false;
    clearTimeout((s as any)._rt);
    (s as any)._rt = setTimeout(() => { s.autoSpin = true; }, 5000);
  }, [activeIndex]);

  // ── animate center image ──────────────────────────────────────
  useEffect(() => {
    if (!centerImgRef.current || !activeSrc) return;
    if (activeSrc === prevSrcRef.current) return;
    prevSrcRef.current = activeSrc;
    gsap.fromTo(centerImgRef.current,
      { opacity: 0, scale: 0.9, y: 8 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.6)" }
    );
  }, [activeSrc]);

  // ── entry ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!wrapRef.current) return;
    gsap.fromTo(wrapRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", delay: 0.1 }
    );
  }, []);

  // ── drag ──────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    const s        = state.current;
    s.dragging     = true;
    s.autoSpin     = false;
    s.velocity     = 0;
    s.dragStartX   = e.clientX;
    s.prevDragX    = e.clientX;
    s.dragStartRot = s.target;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!state.current.dragging) return;
    const s          = state.current;
    // track velocity from last frame
    s.velocity       = (e.clientX - s.prevDragX) * 0.28;
    s.prevDragX      = e.clientX;
    s.target         = s.dragStartRot + (e.clientX - s.dragStartX) * 0.35;
  };
  const snapAndSelect = useCallback(() => {
    const s       = state.current;
    if (!s.dragging) return;
    s.dragging    = false;
    // throw: keep velocity, let friction decay it naturally
    // just snap target to nearest card after a short delay
    clearTimeout((s as any)._snap);
    (s as any)._snap = setTimeout(() => {
      const nearest = Math.round(s.target / ANGLE_STEP);
      s.target      = nearest * ANGLE_STEP;
      s.velocity    = 0;
      const idx     = ((-nearest % TOTAL) + TOTAL) % TOTAL;
      onSelect(idx);
    }, 320); // let momentum play out a bit first
    clearTimeout((s as any)._rt);
    (s as any)._rt = setTimeout(() => { s.autoSpin = true; }, 5500);
  }, [onSelect]);

  // ── mouse move scrub ──────────────────────────────────────
  const onMouseMove = (e: React.MouseEvent) => {
    const s = state.current;
    if (s.dragging) return;                      // let drag handle it
    const dx = e.clientX - s.lastMouseX;
    s.lastMouseX = e.clientX;
    s.scrubAccum += dx;
    const THRESHOLD = 22;                        // px per frame
    if (Math.abs(s.scrubAccum) >= THRESHOLD) {
      const steps = Math.trunc(s.scrubAccum / THRESHOLD);
      s.scrubAccum -= steps * THRESHOLD;
      const newIdx = ((activeIndex - steps) % TOTAL + TOTAL) % TOTAL;
      // spin ring to match
      const raw    = -newIdx * ANGLE_STEP;
      const rounds = Math.round(s.target / 360) * 360;
      s.target     = rounds + raw;
      onSelect(newIdx);
    }
  };

  const onMouseEnter = (e: React.MouseEvent) => {
    const s = state.current;
    s.mouseOver  = true;
    s.lastMouseX = e.clientX;
    s.scrubAccum = 0;
    s.autoSpin   = false;
  };

  const onMouseLeave = () => {
    const s = state.current;
    s.mouseOver  = false;
    s.scrubAccum = 0;
    clearTimeout((s as any)._rt);
    (s as any)._rt = setTimeout(() => { s.autoSpin = true; }, 1200);
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    state.current.autoSpin = false;
    state.current.target  += e.deltaY * 0.13;
    clearTimeout((state.current as any)._rt);
    (state.current as any)._rt = setTimeout(() => { state.current.autoSpin = true; }, 4000);
  };

  const onCardClick = (idx: number) => {
    if (state.current.dragging) return;
    const s      = state.current;
    s.autoSpin   = false;
    const raw    = -idx * ANGLE_STEP;
    const rounds = Math.round(s.target / 360) * 360;
    s.target     = rounds + raw;
    onSelect(idx);
    clearTimeout((s as any)._rt);
    (s as any)._rt = setTimeout(() => { s.autoSpin = true; }, 5000);
  };

  if (items.length === 0) return null;

  return (
    <div ref={wrapRef} className="w-full select-none" style={{ opacity: 0 }}>

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-2 px-1">
        <div className="w-1 h-5 bg-primary rounded-full" />
        <h2 className="text-sm font-black uppercase tracking-widest text-foreground">
          360° Gallery
        </h2>
        <span className="text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
          {items.length} frames
        </span>
      </div>

      {/* ── 3D Stage ── */}
      <div
        className="relative w-full cursor-grab active:cursor-grabbing"
        style={{
          height:            520,
          perspective:       950,
          perspectiveOrigin: "50% 10%",   // looking down from above
          overflow:          "hidden",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={snapAndSelect}
        onPointerLeave={(e) => { snapAndSelect(); onMouseLeave(); }}
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onWheel={onWheel}
      >

        {/* ─── CENTER CARD (flat 2-D overlay, not in the 3D ring) ─── */}
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            width:     360,
            height:    280,
            top:       "46%",
            left:      "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* card */}
          <div
            className="w-full rounded-2xl overflow-hidden border-2 border-primary/40 p-2 relative group"
            style={{
              height:     250,
              boxShadow:  "0 20px 70px rgba(0,0,0,0.65), 0 0 35px hsl(var(--primary)/0.25)",
              background: "rgba(18, 18, 22, 0.85)",
              backdropFilter: "blur(12px)",
            }}
          >
            <img
              ref={centerImgRef}
              src={activeSrc}
              alt={productTitle}
              className="w-full h-full object-contain drop-shadow-2xl rounded-xl"
              draggable={false}
            />
          </div>

          {/* caption below card */}
          <div className="text-center mt-3 space-y-1">
            <p className="text-base font-black text-foreground tracking-tight leading-tight">
              {productTitle}
            </p>
            {productSubtitle && (
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {productSubtitle}
              </p>
            )}
            <p className="text-[10px] text-primary font-black uppercase tracking-widest bg-primary/10 border border-primary/20 inline-block px-3 py-0.5 rounded-full">
              FRAME {activeIndex + 1} / {items.length}
            </p>
          </div>
        </div>

        {/* ─── 3D RING ─── */}
        {/* Outer tilter: rotateX tilts the ring to look like an oval from above */}
        <div
          className="absolute"
          style={{
            top:    "50%",
            left:   "50%",
            width:  0,
            height: 0,
            transform:      `translateX(0) translateY(60px) rotateX(${TILT_X}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Inner spinner: rotateY spins the ring */}
          <div
            ref={ringRef}
            style={{ transformStyle: "preserve-3d" }}
          >
            {items.map((src, i) => {
              const cardAngle = i * ANGLE_STEP;
              const isActive  = i === activeIndex;
              return (
                <div
                  key={i}
                  onClick={() => onCardClick(i)}
                  className="absolute"
                  style={{
                    width:       CARD_W,
                    height:      CARD_H,
                    marginLeft:  -(CARD_W / 2),
                    marginTop:   -(CARD_H / 2),
                    // position on ring, then counter-tilt so card faces viewer
                    transform:   `rotateY(${cardAngle}deg) translateZ(${RING_RADIUS}px) rotateX(-${TILT_X}deg)`,
                    cursor:      "pointer",
                  }}
                >
                  <div
                    className={`w-full h-full rounded-lg overflow-hidden border transition-all duration-300 ${
                      isActive
                        ? "border-primary shadow-[0_0_14px_3px_hsl(var(--primary)/0.5)] scale-110"
                        : "border-white/20 hover:border-primary/50 hover:scale-105"
                    }`}
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)" }}
                  >
                    <img
                      src={src}
                      alt={`frame ${i + 1}`}
                      className="w-full h-full object-cover"
                      draggable={false}
                      loading="lazy"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-20"
          style={{ background: "linear-gradient(to top, hsl(var(--background)) 0%, transparent 100%)" }}
        />
      </div>

      {/* ── Dot strip ── */}
      <div className="flex justify-center gap-1 mt-4 flex-wrap max-w-sm mx-auto">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onCardClick(i)}
            className={`rounded-full transition-all duration-300 ${
              i === activeIndex
                ? "w-6 h-[4px] bg-primary"
                : "w-[4px] h-[4px] bg-muted-foreground/25 hover:bg-muted-foreground/60"
            }`}
            aria-label={`Frame ${i + 1}`}
          />
        ))}
      </div>
      <p className="text-center text-[9px] text-muted-foreground/40 mt-2 font-mono tracking-wider">
        AUTO-SPINNING · DRAG OR SCROLL TO CONTROL
      </p>
    </div>
  );
};

export default ImageRingGallery;
