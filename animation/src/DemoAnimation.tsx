import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/* ================= 常量与主题 ================= */
const FONT = "'Noto Sans SC', 'Inter', system-ui, -apple-system, sans-serif";
const BG = "#0a0e1a";
const CARD = "#131a2e";
const ACCENT = "#4f8cff";
const ACCENT2 = "#8b6cff";
const TEXT = "#f2f5fb";
const MUTED = "#8f9ab3";

const smooth = { damping: 200 };
const bouncy = { damping: 14, stiffness: 120 };

/* ================= 弹簧入场 hook ================= */
const useIn = (delay = 0, config = smooth) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame, fps, config, durationInFrames: 26, delay });
};

/* ================= 卡片 ================= */
const Card: React.FC<{
  delay: number;
  x: number;
  y: number;
  children: React.ReactNode;
  accent?: string;
}> = ({ delay, x, y, children, accent = ACCENT }) => {
  const s = useIn(delay, bouncy);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translateY(${(1 - s) * 70}px) scale(${0.92 + 0.08 * s})`,
        opacity: Math.min(1, s * 1.4),
        background: CARD,
        borderRadius: 22,
        padding: "34px 44px",
        boxShadow: "0 24px 70px rgba(0,0,0,0.45)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderTop: `3px solid ${accent}`,
      }}
    >
      {children}
    </div>
  );
};

/* ================= 小标签 ================= */
const Tag: React.FC<{ children: React.ReactNode; accent?: string }> = ({
  children,
  accent = ACCENT,
}) => (
  <span
    style={{
      display: "inline-block",
      padding: "6px 16px",
      borderRadius: 999,
      background: `${accent}22`,
      color: accent,
      fontSize: 22,
      fontWeight: 600,
      marginRight: 12,
      marginBottom: 12,
    }}
  >
    {children}
  </span>
);

/* ================= 主标题 ================= */
const Title: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const s = useIn(delay, bouncy);
  return (
    <div
      style={{
        fontSize: 64,
        fontWeight: 800,
        color: TEXT,
        letterSpacing: -1,
        transform: `translateY(${(1 - s) * 40}px)`,
        opacity: s,
      }}
    >
      {children}
    </div>
  );
};

const Sub: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const s = useIn(delay, smooth);
  return (
    <div
      style={{
        fontSize: 30,
        color: MUTED,
        lineHeight: 1.6,
        opacity: s,
        transform: `translateY(${(1 - s) * 20}px)`,
      }}
    >
      {children}
    </div>
  );
};

/* ================= 光标（AOSP，弹簧跟手） ================= */
const Cursor: React.FC<{ frame: number }> = ({ frame }) => {
  // 几个关键位置，用平滑插值串联
  const pts = [
    { t: 40, x: 700, y: 560 },
    { t: 120, x: 1220, y: 380 },
    { t: 210, x: 700, y: 700 },
    { t: 300, x: 1250, y: 620 },
    { t: 380, x: 760, y: 780 },
    { t: 460, x: 1200, y: 500 },
    { t: 540, x: 800, y: 560 },
  ];
  const t = interpolate(frame, [0, 560], [0, 560], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // 在关键点之间做分段线性 + smoothstep
  let x = 960, y = 540;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    if (t >= a.t && t <= b.t) {
      const p = (t - a.t) / (b.t - a.t);
      const e = p * p * (3 - 2 * p); // smoothstep
      x = a.x + (b.x - a.x) * e;
      y = a.y + (b.y - a.y) * e;
    }
  }
  if (t > pts[pts.length - 1].t) {
    x = pts[pts.length - 1].x;
    y = pts[pts.length - 1].y;
  }
  return (
    <Img
      src={staticFile("cursors/dark/pointer_arrow.svg")}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 40,
        height: 40,
        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))",
      }}
    />
  );
};

/* ================= 代码块 mock ================= */
const CodeBlock: React.FC<{ delay: number; x: number; y: number }> = ({
  delay,
  x,
  y,
}) => {
  const s = useIn(delay, bouncy);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translateX(${(1 - s) * 80}px)`,
        opacity: s,
        background: "#0d1322",
        borderRadius: 16,
        padding: "26px 34px",
        border: "1px solid rgba(255,255,255,0.08)",
        fontFamily: "'JetBrains Mono','SF Mono',monospace",
        fontSize: 30,
        color: "#c9d4f0",
        boxShadow: "0 18px 50px rgba(0,0,0,0.4)",
      }}
    >
      <span style={{ color: "#7aa2ff" }}>/execute</span>
      <span style={{ color: MUTED }}> as </span>
      <span style={{ color: "#9ee6a0" }}>@a</span>
      <span style={{ color: MUTED }}> at </span>
      <span style={{ color: "#9ee6a0" }}>@s</span>
      <span style={{ color: MUTED }}> run </span>
      <span style={{ color: "#ffd479" }}>setblock</span>
      <span style={{ color: MUTED }}> ~ ~-1 ~ </span>
      <span style={{ color: "#ff9ecb" }}>diamond_block</span>
    </div>
  );
};

/* ================= 主组件 ================= */
export const DemoAnimation = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 整体轻微推镜
  const zoom = interpolate(frame, [0, 1500], [1, 1.06]);
  const bgShift = interpolate(frame, [0, 1500], [0, -30]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: FONT,
        overflow: "hidden",
      }}
    >
      {/* 背景光晕 */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 25%, rgba(79,140,255,0.16), transparent 55%), radial-gradient(circle at 15% 85%, rgba(139,108,255,0.12), transparent 50%)",
          transform: `translateY(${bgShift}px) scale(${zoom})`,
        }}
      />
      {/* 网格纹理 */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: 0.6,
        }}
      />

      {/* ---- 场景 1：开场 ---- */}
      <Sequence from={0} durationInFrames={100}>
        <Intro frame={frame} fps={fps} />
      </Sequence>

      {/* ---- 场景 2：功能卡片 ---- */}
      <Sequence from={100} durationInFrames={760}>
        <Features frame={frame - 100} fps={fps} />
      </Sequence>

      {/* ---- 场景 3：结尾 ---- */}
      <Sequence from={860} durationInFrames={640}>
        <Ending frame={frame - 860} fps={fps} />
      </Sequence>

      {/* 光标（贯穿全片） */}
      <Cursor frame={frame} />
    </AbsoluteFill>
  );
};

/* ================= 场景 1：开场 ================= */
const Intro: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const logoIn = spring({ frame, fps: 30, config: bouncy, durationInFrames: 30 });
  const titleIn = useIn(8, bouncy);
  const subIn = useIn(18, smooth);
  const fade = interpolate(frame, [70, 100], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        opacity: fade,
      }}
    >
      <Img
        src={staticFile("Logo.png")}
        style={{
          width: 150,
          height: 150,
          transform: `scale(${logoIn})`,
          borderRadius: 28,
        }}
      />
      <div style={{ height: 36 }} />
      <Title delay={8}>MCBECD</Title>
      <div style={{ height: 18 }} />
      <Sub delay={18}>Minecraft 基岩版命令库</Sub>
    </AbsoluteFill>
  );
};

/* ================= 场景 2：功能卡片 ================= */
const Features: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  return (
    <AbsoluteFill style={{ padding: "140px 160px" }}>
      <Title delay={0}>它是做什么的</Title>
      <Sub delay={8}>一个社区驱动的命令参考</Sub>

      <Card delay={16} x={120} y={320} accent={ACCENT}>
        <div style={{ fontSize: 34, fontWeight: 700, color: TEXT }}>26 条命令</div>
        <div style={{ marginTop: 14 }}>
          <Tag>give</Tag>
          <Tag>execute</Tag>
          <Tag>tp</Tag>
          <Tag>scoreboard</Tag>
        </div>
      </Card>

      <Card delay={24} x={120} y={620} accent={ACCENT2}>
        <div style={{ fontSize: 34, fontWeight: 700, color: TEXT }}>真实原理</div>
        <div style={{ fontSize: 24, color: MUTED, marginTop: 10 }}>
          每条命令讲清底层机制，不是空话
        </div>
      </Card>

      <CodeBlock delay={40} x={760} y={320} />

      <Card delay={48} x={760} y={620} accent="#ffb454">
        <div style={{ fontSize: 34, fontWeight: 700, color: TEXT }}>即用即复制</div>
        <div style={{ fontSize: 24, color: MUTED, marginTop: 10 }}>
          命令方块图标 · 代码高亮 · 一键复制
        </div>
      </Card>
    </AbsoluteFill>
  );
};

/* ================= 场景 3：结尾 ================= */
const Ending: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const honestIn = useIn(0, bouncy);
  const authorIn = useIn(40, bouncy);
  const thanksIn = useIn(80, smooth);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ transform: `translateY(${(1 - honestIn) * 40}px)`, opacity: honestIn }}>
        <div style={{ fontSize: 52, fontWeight: 800, color: "#ffd479" }}>坦白说</div>
        <div style={{ height: 16 }} />
        <div style={{ fontSize: 34, color: MUTED, lineHeight: 1.7 }}>
          项目目前非常早期
          <br />
          还有很多错误和未打磨的细节
        </div>
      </div>

      <div style={{ height: 80 }} />

      <div style={{ transform: `translateY(${(1 - authorIn) * 40}px)`, opacity: authorIn }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: TEXT }}>作者：丁丁QZ</div>
        <div style={{ fontSize: 26, color: MUTED, marginTop: 12 }}>
          GitHub · 哔哩哔哩 · 快手
        </div>
      </div>

      <div style={{ height: 60 }} />

      <div style={{ opacity: thanksIn, fontSize: 30, color: MUTED }}>
        感谢观看 —— 它会继续变好
      </div>
    </AbsoluteFill>
  );
};
