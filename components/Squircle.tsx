"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { getSvgPath, type FigmaSquircleParams } from "figma-squircle";

type CornerRadius = number | { tl?: number; tr?: number; br?: number; bl?: number };

interface SquircleProps {
  children: ReactNode;
  cornerRadius?: CornerRadius;
  cornerSmoothing?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Border color — CSS value (supports var()). Rendered as SVG stroke. */
  borderColor?: string;
  /** Border opacity — CSS value (supports var()). Default 1. */
  borderOpacity?: string;
  /** Shadow — applied as CSS filter: drop-shadow (works with clip-path).
   *  Supports comma-separated values like box-shadow, each becomes a separate drop-shadow. */
  shadow?: string;
}

/**
 * G2 continuous-curvature squircle via figma-squircle JS library.
 *
 * Uses ResizeObserver + SVG clip-path for cross-browser support.
 * Border is rendered as SVG stroke (CSS border would be clipped by clip-path).
 * Shadow uses filter: drop-shadow (box-shadow would be clipped).
 */
export function Squircle({
  children,
  cornerRadius = 14,
  cornerSmoothing = 1,
  className = "",
  style,
  borderColor,
  borderOpacity = "1",
  shadow,
}: SquircleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [svgPath, setSvgPath] = useState("");
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const clipId = useRef(`sq-${(Math.random() * 1e8 | 0).toString(36)}`);
  const id = clipId.current;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setDims({ w: Math.round(width), h: Math.round(height) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (dims.w === 0 || dims.h === 0) return;
    const r = typeof cornerRadius === "number" ? cornerRadius : 14;
    const params: FigmaSquircleParams = {
      width: dims.w,
      height: dims.h,
      cornerSmoothing,
      ...(typeof cornerRadius === "number"
        ? { cornerRadius: r }
        : {
            topLeftCornerRadius: cornerRadius.tl ?? r,
            topRightCornerRadius: cornerRadius.tr ?? r,
            bottomRightCornerRadius: cornerRadius.br ?? r,
            bottomLeftCornerRadius: cornerRadius.bl ?? r,
          }),
    };
    setSvgPath(getSvgPath(params));
  }, [dims, cornerRadius, cornerSmoothing]);

  const clipUrl = svgPath ? `url(#${id})` : undefined;

  // Convert comma-separated shadow values to multiple drop-shadow filters
  const shadowFilter = shadow
    ? shadow.split(',').map(s => `drop-shadow(${s.trim()})`).join(' ')
    : undefined;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: "relative",
        borderRadius: 0,
        ...style,
        ...(clipUrl ? { clipPath: clipUrl } : {}),
        ...(shadowFilter ? { filter: shadowFilter } : {}),
      }}
    >
      {svgPath && (
        <svg
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            overflow: "visible",
          }}
          viewBox={`0 0 ${dims.w} ${dims.h}`}
          preserveAspectRatio="none"
        >
          <defs>
            <clipPath id={id} clipPathUnits="userSpaceOnUse">
              <path d={svgPath} />
            </clipPath>
          </defs>
          {borderColor && (
            <path
              d={svgPath}
              fill="none"
              stroke={borderColor}
              strokeOpacity={borderOpacity}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              style={{ transition: "stroke 0.2s ease, stroke-opacity 0.2s ease" }}
            />
          )}
        </svg>
      )}
      {children}
    </div>
  );
}