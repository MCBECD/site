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

/* =========================================================================
 * MCBECD 宣传动画 —— 30 秒 @ 30fps（900 帧）
 *
 * 场景 1（0–140）：开场 Logo + 标题
 * 场景 2（140–740）：产品走查 —— 浏览器窗口 mockup，搜索 execute →
 *                   点击命令卡片 → 详情 + 代码块 → 复制
 * 场景 3（740–900）：结尾
 *
 * 设计要点：
 *   - 所有元素都在 1920×1080 安全区内，布局确定、不重叠
 *   - 光标只在与真实元素交互时出现，轨迹对齐点击目标
 *   - 卡片/代码块与背景有明确对比，避免"糊成一片"
 * ========================================================================= */

const FONT = "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Inter', system-ui, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', 'Consolas', monospace";

const BG = "#070b15";
const WINDOW_BG = "#0d1424";
const CARD = "#151d33";
const CODE_BG = "#0a1120";
const ACCENT = "#4f8cff";
const WARM = "#ffb454";
const GREEN = "#9ee6a0";
const PINK = "#ff9ecb";
const TEXT = "#f2f6ff";
const MUTED = "#93a0bd";
const BORDER = "rgba(255,255,255,0.10)";

const smooth = { damping: 200 };
const bouncy = { damping: 14, stiffness: 120 };

/* ================= 弹簧入场 hook（场景内相对帧） ================= */
const useIn = (delay = 0, config = smooth) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame, fps, config, durationInFrames: 26, delay });
};

/* ================= 主组件 ================= */
export const DemoAnimation = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: FONT,
        overflow: "hidden",
      }}
    >
      {/* 背景光晕 + 网格（贯穿全片，轻微推镜） */}
      <Backdrop frame={frame} />

      {/* 场景 1：开场 */}
      <Sequence from={0} durationInFrames={140}>
        <Intro />
      </Sequence>

      {/* 场景 2：产品走查 */}
      <Sequence from={140} durationInFrames={600}>
        <Showcase />
      </Sequence>

      {/* 场景 3：结尾 */}
      <Sequence from={740} durationInFrames={160}>
        <Ending />
      </Sequence>

      {/* 光标（只出现在场景 2 的交互时刻） */}
      <Cursor />
    </AbsoluteFill>
  );
};

/* ================= 背景 ================= */
const Backdrop: React.FC<{ frame: number }> = ({ frame }) => {
  const zoom = interpolate(frame, [0, 900], [1, 1.05]);
  const bgShift = interpolate(frame, [0, 900], [0, -24]);
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 22%, rgba(79,140,255,0.16), transparent 55%), radial-gradient(circle at 12% 88%, rgba(139,108,255,0.13), transparent 48%)",
          transform: `translateY(${bgShift}px) scale(${zoom})`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: 0.55,
        }}
      />
    </>
  );
};

/* ================= 场景 1：开场 ================= */
const Intro: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const logoIn = spring({ frame, fps, config: bouncy, durationInFrames: 30 });
  const titleIn = useIn(8, bouncy);
  const subIn = useIn(20, smooth);
  const fade = interpolate(frame, [104, 136], [1, 0], {
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
          width: 160,
          height: 160,
          transform: `scale(${logoIn})`,
          borderRadius: 30,
          boxShadow: `0 0 90px rgba(79,140,255,0.35)`,
        }}
      />
      <div style={{ height: 40 }} />
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: TEXT,
          letterSpacing: -1.5,
          transform: `translateY(${(1 - titleIn) * 44}px)`,
          opacity: titleIn,
        }}
      >
        MCBECD
      </div>
      <div style={{ height: 20 }} />
      <div
        style={{
          fontSize: 32,
          color: MUTED,
          lineHeight: 1.6,
          opacity: subIn,
          transform: `translateY(${(1 - subIn) * 22}px)`,
        }}
      >
        Minecraft 基岩版命令库
      </div>
    </AbsoluteFill>
  );
};

/* ================= 场景 2：产品走查 ================= */
const Showcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 浏览器窗口整体入场
  const winIn = spring({ frame, fps, config: bouncy, durationInFrames: 30 });
  const winOut = interpolate(frame, [556, 590], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const winTransform = `translateY(${(1 - winIn) * 60}px) scale(${0.94 + 0.06 * winIn})`;

  // 搜索框内逐字打出 "execute"（场景内相对帧）
  const typed = useTypedText("execute", 6, 65);
  const searchIn = useIn(58, smooth);

  // 结果卡片
  const card1In = useIn(128, bouncy);
  const card2In = useIn(156, bouncy);

  // 点击卡片 1 → 打开详情（绝对帧 358 = 场景内 218）
  const clicked = frame >= 218;
  const card2Out = interpolate(frame, [218, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const detailIn = useIn(218, bouncy);
  const highlight = clicked ? "0 0 0 3px rgba(79,140,255,0.45)" : "none";

  // 复制按钮 → 已复制（绝对帧 454 = 场景内 314，紧跟点击之后）
  const copied = frame >= 314;
  const toastIn = useIn(314, bouncy);
  const copyDone = copied
    ? { background: GREEN, color: "#0a1a12", borderColor: GREEN }
    : { background: ACCENT, color: "#fff", borderColor: ACCENT };

  // 底部标签（复制后出现）
  const pillsIn = useIn(344, smooth);

  return (
    <AbsoluteFill style={{ opacity: winOut }}>
      {/* ---- 浏览器窗口 ---- */}
      <div
        style={{
          position: "absolute",
          left: 340,
          top: 130,
          width: 1240,
          height: 800,
          borderRadius: 20,
          background: `linear-gradient(180deg, ${WINDOW_BG} 0%, #101830 100%)`,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 40px 120px rgba(0,0,0,0.55)",
          overflow: "hidden",
          transform: winTransform,
        }}
      >
        {/* 标题栏 */}
        <div
          style={{
            height: 52,
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
            <div
              key={c}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: c,
                marginRight: i < 2 ? 8 : 0,
                opacity: 0.9,
              }}
            />
          ))}
          <div
            style={{
              flex: 1,
              margin: "0 24px",
              height: 34,
              borderRadius: 10,
              background: CODE_BG,
              border: `1px solid ${BORDER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: MONO,
              fontSize: 20,
              color: MUTED,
              letterSpacing: 0.3,
            }}
          >
            mcbecd.pages.dev/docs
          </div>
        </div>

        {/* 站内导航条 */}
        <div
          style={{
            height: 60,
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <Img
            src={staticFile("Logo.png")}
            style={{ width: 30, height: 30, borderRadius: 8 }}
          />
          <span
            style={{
              marginLeft: 12,
              fontSize: 22,
              fontWeight: 700,
              color: TEXT,
              letterSpacing: -0.3,
            }}
          >
            MCBECD
          </span>
          <div style={{ flex: 1 }} />
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: ACCENT, marginRight: 10 }} />
          <div style={{ width: 30, height: 30, borderRadius: "50%", border: `1.5px solid ${BORDER}`, marginRight: 10 }} />
          <div style={{ width: 30, height: 30, borderRadius: "50%", border: `1.5px solid ${BORDER}` }} />
        </div>

        {/* 内容区（position:relative —— 卡片/详情/toast 以此为定位基准） */}
        <div style={{ padding: "28px 56px", position: "relative" }}>
          {/* Hero */}
          <div
            style={{
              opacity: searchIn,
              transform: `translateY(${(1 - searchIn) * 24}px)`,
            }}
          >
            <div style={{ fontSize: 40, fontWeight: 800, color: TEXT, letterSpacing: -0.5 }}>
              Minecraft 基岩版命令库
            </div>
            <div style={{ fontSize: 22, color: MUTED, marginTop: 10 }}>
              社区驱动的命令参考 · 26 条命令可直接复制
            </div>
          </div>

          {/* 搜索框 */}
          <div
            style={{
              marginTop: 28,
              width: 720,
              height: 58,
              borderRadius: 14,
              background: CODE_BG,
              border: `1px solid ${BORDER}`,
              display: "flex",
              alignItems: "center",
              padding: "0 18px",
              opacity: searchIn,
              transform: `translateY(${(1 - searchIn) * 20}px)`,
              boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: 12, flexShrink: 0 }}>
              <circle cx="11" cy="11" r="7" stroke={MUTED} strokeWidth="2.2" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" stroke={MUTED} strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 24, color: TEXT, fontFamily: MONO, letterSpacing: 0.5 }}>
              {typed}
              <Caret frame={frame} />
            </span>
          </div>

          {/* 结果卡片 1（绝对定位基准 = 内容区 padding box (340,242)，+56/+28 对齐内容盒） */}
          <ResultCard
            s={card1In}
            y={228}
            highlight={highlight}
            title="/execute 执行命令"
            desc="以其他实体的身份、位置或维度执行命令，支持条件判断"
            icon=">_"
          />

          {/* 结果卡片 2（被点击后淡出） */}
          <div style={{ opacity: card2In * card2Out, transform: `translateY(${(1 - card2In) * 30}px)` }}>
            <ResultCard
              s={1}
              y={358}
              highlight="none"
              title="/scoreboard 记分板"
              desc="管理目标与计分项，构建复杂命令逻辑"
              icon="±"
            />
          </div>

          {/* 详情面板（点击卡片 1 后展开） */}
          {clicked && (
            <div
              style={{
                position: "absolute",
                left: 56,
                top: 358,
                width: 720,
                height: 300,
                borderRadius: 16,
                background: CARD,
                border: "1px solid rgba(79,140,255,0.35)",
                boxShadow: "0 18px 60px rgba(0,0,0,0.4)",
                padding: "20px 24px",
                opacity: detailIn,
                transform: `translateY(${(1 - detailIn) * 26}px) scale(${0.97 + 0.03 * detailIn})`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: TEXT }}>/execute 执行命令</span>
                <span
                  style={{
                    marginLeft: 14,
                    padding: "4px 12px",
                    borderRadius: 999,
                    background: "rgba(255,180,84,0.14)",
                    color: WARM,
                    fontSize: 17,
                    fontWeight: 600,
                  }}
                >
                  OP2
                </span>
              </div>
              <div style={{ fontSize: 20, color: MUTED, marginTop: 10 }}>
                以其他实体的身份、位置或维度执行命令，支持条件判断
              </div>

              {/* 代码块 */}
              <div
                style={{
                  marginTop: 16,
                  background: CODE_BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  padding: "14px 18px",
                  fontFamily: MONO,
                  fontSize: 22,
                  lineHeight: 1.75,
                  color: "#c9d4f0",
                  position: "relative",
                }}
              >
                <div>
                  <CodeTok c={ACCENT}>/execute</CodeTok> <CodeTok c={MUTED}>as</CodeTok>{" "}
                  <CodeTok c={GREEN}>@a</CodeTok> <CodeTok c={MUTED}>at</CodeTok> <CodeTok c={GREEN}>@s</CodeTok>{" "}
                  <CodeTok c={MUTED}>run</CodeTok>
                </div>
                <div>
                  <CodeTok c={WARM}>setblock</CodeTok> <CodeTok c={MUTED}>~ ~-1 ~</CodeTok>{" "}
                  <CodeTok c={PINK}>diamond_block</CodeTok>
                </div>

                {/* 复制按钮 */}
                <div
                  style={{
                    position: "absolute",
                    right: 14,
                    top: 14,
                    width: 52,
                    height: 34,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1.5px solid ${copyDone.borderColor}`,
                    background: copyDone.background,
                    color: copyDone.color,
                  }}
                >
                  {copied ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M4 12.5L9.5 18L20 6.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="12" height="12" rx="2.5" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </div>
              </div>

              {/* 底部标签（复制后出现） */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 16,
                  opacity: pillsIn,
                  transform: `translateY(${(1 - pillsIn) * 14}px)`,
                }}
              >
                {["条件判断", "命令方块", "自动化", "批量"].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "5px 14px",
                      borderRadius: 999,
                      background: "rgba(79,140,255,0.12)",
                      color: "#8fb4ff",
                      fontSize: 18,
                      fontWeight: 600,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 已复制 toast（贴在代码块右侧空白处，紧邻复制按钮） */}
          {copied && (
            <div
              style={{
                position: "absolute",
                left: 486,
                top: 494,
                padding: "10px 22px",
                borderRadius: 999,
                background: "#0f1726",
                border: "1px solid rgba(158,230,160,0.5)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: toastIn,
                transform: `translateY(${(1 - toastIn) * -12}px)`,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 12.5L9.5 18L20 6.5" stroke={GREEN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ color: TEXT, fontSize: 20, fontWeight: 600 }}>已复制</span>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================= 结果卡片 ================= */
const ResultCard: React.FC<{
  s: number;
  y: number;
  highlight: string;
  title: string;
  desc: string;
  icon: string;
}> = ({ s, y, highlight, title, desc, icon }) => (
  <div
    style={{
      position: "absolute",
      left: 56,
      top: y,
      width: 720,
      height: 112,
      borderRadius: 14,
      background: CARD,
      border: `1px solid ${BORDER}`,
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      opacity: s,
      transform: `translateY(${(1 - s) * 34}px) scale(${0.95 + 0.05 * s})`,
      boxShadow:
        highlight === "none"
          ? "0 12px 40px rgba(0,0,0,0.35)"
          : `${highlight}, 0 12px 40px rgba(0,0,0,0.35)`,
    }}
  >
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: "rgba(79,140,255,0.16)",
        color: ACCENT,
        fontFamily: MONO,
        fontSize: 22,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ marginLeft: 18, flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: TEXT }}>{title}</div>
      <div style={{ fontSize: 20, color: MUTED, marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {desc}
      </div>
    </div>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}>
      <path d="M9 6L15 12L9 18" stroke={MUTED} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

/* ================= 代码高亮 token ================= */
const CodeTok: React.FC<{ c: string; children: React.ReactNode }> = ({ c, children }) => (
  <span style={{ color: c }}>{children}</span>
);

/* ================= 打字机文字 ================= */
const useTypedText = (text: string, framesPerChar: number, startFrame: number) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  if (local < 0) return "";
  const count = Math.min(text.length, Math.floor(local / framesPerChar) + 1);
  return text.slice(0, count);
};

/* ================= 光标 ================= */
const Cursor: React.FC = () => {
  const frame = useCurrentFrame();

  // 关键帧：只在交互时刻出现，位置对齐点击目标
  const path: { t: number; x: number; y: number }[] = [
    { t: 0, x: 1500, y: 860 },
    { t: 290, x: 1500, y: 860 },   // 等待
    { t: 342, x: 756, y: 526 },    // → 卡片 1 中心
    { t: 378, x: 756, y: 526 },    // 点击（360 按下）
    { t: 420, x: 1052, y: 741 },   // → 复制按钮中心
    { t: 452, x: 1052, y: 741 },   // 点击（450 按下）
    { t: 500, x: 1000, y: 640 },   // 后退
    { t: 560, x: 620, y: 880 },    // 移到下方
    { t: 620, x: 620, y: 880 },    // 停留
  ];

  const pos = followPath(frame, path);

  // 可见性：280 淡入，620 淡出
  const opacity = interpolate(frame, [280, 305, 616, 640], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 点击按压动画（360 / 450 两次点击）
  const press1 = frame >= 358 && frame <= 368 ? 0.85 : 1;
  const press2 = frame >= 448 && frame <= 458 ? 0.85 : 1;
  const scale = press1 * press2;

  return (
    <Img
      src={staticFile("cursors/dark/pointer_arrow.svg")}
      style={{
        position: "absolute",
        left: pos.x - 7,
        top: pos.y - 5,
        width: 36,
        height: 36,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "0 0",
        filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.6))",
      }}
    />
  );
};

/* 分段平滑插值（smoothstep），解决 noUncheckedIndexedAccess */
const followPath = (frame: number, path: { t: number; x: number; y: number }[]) => {
  if (frame <= path[0]!.t) return { x: path[0]!.x, y: path[0]!.y };
  const last = path[path.length - 1]!;
  if (frame >= last.t) return { x: last.x, y: last.y };
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]!;
    const b = path[i + 1]!;
    if (frame >= a.t && frame <= b.t) {
      const p = (frame - a.t) / (b.t - a.t);
      const e = p * p * (3 - 2 * p);
      return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e };
    }
  }
  return { x: last.x, y: last.y };
};

/* ================= 闪烁光标 ================= */
const Caret: React.FC<{ frame: number }> = ({ frame }) => {
  const on = Math.floor(frame / 20) % 2 === 0;
  return (
    <span
      style={{
        display: "inline-block",
        width: 2,
        height: 28,
        background: on ? ACCENT : "transparent",
        verticalAlign: -5,
        marginLeft: 3,
      }}
    />
  );
};

/* ================= 场景 3：结尾 ================= */
const Ending: React.FC = () => {
  const honestIn = useIn(0, bouncy);
  const authorIn = useIn(44, bouncy);
  const thanksIn = useIn(84, smooth);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ transform: `translateY(${(1 - honestIn) * 40}px)`, opacity: honestIn }}>
        <div style={{ fontSize: 56, fontWeight: 800, color: WARM }}>坦白说</div>
        <div style={{ height: 18 }} />
        <div style={{ fontSize: 32, color: MUTED, lineHeight: 1.75 }}>
          项目目前非常早期
          <br />
          还有很多错误和未打磨的细节
        </div>
      </div>

      <div style={{ height: 84 }} />

      <div style={{ transform: `translateY(${(1 - authorIn) * 40}px)`, opacity: authorIn }}>
        <div style={{ fontSize: 42, fontWeight: 700, color: TEXT }}>作者：丁丁QZ</div>
        <div style={{ fontSize: 26, color: MUTED, marginTop: 14 }}>
          GitHub · 哔哩哔哩 · 快手
        </div>
      </div>

      <div style={{ height: 64 }} />

      <div style={{ opacity: thanksIn, fontSize: 30, color: MUTED }}>
        感谢观看 —— 它会继续变好
      </div>
    </AbsoluteFill>
  );
};
