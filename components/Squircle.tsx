"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

interface SquircleProps {
  children: ReactNode;
  cornerRadius?: number;
  cornerSmoothing?: number;
  className?: string;
  style?: CSSProperties;
  borderColor?: string;
  borderOpacity?: string;
  shadow?: string;
  /** If true, renders as inline-flex instead of block */
  inline?: boolean;
  onClick?: () => void;
}

let idCounter = 0;

export function Squircle({
  children,
  cornerRadius = 10,
  cornerSmoothing = 1,
  className = "",
  style,
  borderColor,
  borderOpacity = "1",
  shadow,
  inline = false,
  onClick,
}: SquircleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const uid = useRef(`sqc-${++idCounter}`);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const update = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (w < 1 || h < 1) return;
      const { getSvgPath } = require("figma-squircle");
      const r = Math.min(cornerRadius, w / 2, h / 2);
      const d = getSvgPath({ width: w, height: h, cornerRadius: r, cornerSmoothing });

      const cp = document.getElementById(`${uid.current}-cp`);
      if (cp) cp.setAttribute("d", d);

      const bp = document.getElementById(`${uid.current}-bp`);
      if (bp) bp.setAttribute("d", d);

      // Update border SVG viewBox to match element dimensions
      const borderSvg = bp?.closest("svg");
      if (borderSvg) borderSvg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    };

    // Create defs SVG in body (hidden)
    const defsSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    defsSvg.id = `${uid.current}-defs`;
    defsSvg.setAttribute("width", "0");
    defsSvg.setAttribute("height", "0");
    defsSvg.style.position = "fixed";
    defsSvg.style.pointerEvents = "none";
    defsSvg.style.opacity = "0";
    defsSvg.setAttribute("aria-hidden", "true");
    defsSvg.innerHTML = `<defs><clipPath id="${uid.current}-clip"><path id="${uid.current}-cp" d=""/></clipPath></defs>`;
    document.body.appendChild(defsSvg);

    el.style.clipPath = `url(#${uid.current}-clip)`;
    update();

    const ro = new ResizeObserver(() => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      defsSvg.remove();
      el.style.clipPath = "";
    };
  }, [cornerRadius, cornerSmoothing]);

  const filterStyle = shadow
    ? `drop-shadow(${shadow.trim()})`
    : undefined;

  const display = inline ? "inline-flex" : "flex";

  return (
    <div
      ref={ref}
      className={`${display} ${className}`}
      style={{
        ...style,
        position: "relative",
        filter: filterStyle,
      }}
      onClick={onClick}
    >
      {children}
      {/* Border stroke — on top of content, NOT clipped */}
      {borderColor && (
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: "100%", height: "100%", zIndex: 1 }}
          aria-hidden="true"
        >
          <path
            id={`${uid.current}-bp`}
            d=""
            fill="none"
            stroke={borderColor}
            strokeOpacity={borderOpacity}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
    </div>
  );
}
