import { useEffect, useRef } from "react";

let idCounter = 0;

/**
 * Hook that applies a squircle (G2 continuous curvature) clip-path to a DOM element.
 *
 * Usage:
 *   const ref = useSquircle<HTMLDivElement>(10); // 10px corner radius
 *   return <div ref={ref} className="...">content</div>;
 *
 * The hook creates a hidden SVG in document.body with a <clipPath> and
 * updates the path on resize. The element gets clip-path: url(#id) applied.
 */
export function useSquircle<T extends HTMLElement>(cornerRadius = 10, cornerSmoothing = 1) {
  const ref = useRef<T>(null);
  const uid = useRef(`sq-${++idCounter}`);

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

      const pathEl = document.getElementById(`${uid.current}-p`);
      if (pathEl) pathEl.setAttribute("d", d);
    };

    // Create hidden SVG in body
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.position = "fixed";
    svg.style.pointerEvents = "none";
    svg.style.opacity = "0";
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = `<defs><clipPath id="${uid.current}-clip"><path id="${uid.current}-p" d=""/></clipPath></defs>`;
    document.body.appendChild(svg);

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
      svg.remove();
      el.style.clipPath = "";
    };
  }, [cornerRadius, cornerSmoothing]);

  return ref;
}
