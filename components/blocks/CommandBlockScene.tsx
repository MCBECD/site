"use client";

/**
 * CommandBlockScene —— 用官方方块纹理把命令方块的排布画成立体图。
 *
 * @why 文档里讲"这条链怎么摆"，用文字描述"指令 1 在箭头起点、2 到 9 依次指向它"
 * 读者很难在脑子里拼出来，截图又改不动。这里按坐标画立方体，改一个字符就能重画。
 *
 * @constraint 只用 CSS 3D，不引 three.js：场景固定是方块网格，没有光照与阴影需求，
 * 一个 3D 库带来的 600KB 和初始化开销都不值。
 *
 * @gotcha 纹理来自 Mojang 官方资源包示例（github.com/Mojang/bedrock-samples）。
 * 每个文件是 16×64 的四帧 flipbook（ticks_per_frame=10），四帧图案相同、亮度不同，
 * 游戏里表现为呼吸脉动。这里不播放动画，取第 2 帧（最亮帧），静态图才不会发暗。
 *
 * @constraint 六个面只用到四张图，按官方 blocks.json 的映射分配：
 *   north=front  south=back  east/west=side  up/down=conditional_side
 * 顶底共用同一张，底面必须再转 180°，否则从下方看图案是上下颠倒的。
 */

import { useCallback, useMemo, useRef, useState } from "react";

export type BlockKind =
  | "impulse"
  | "impulse-cond"
  | "chain"
  | "chain-cond"
  | "repeat"
  | "repeat-cond"
  | "air";

export interface BlockSpec {
  x: number;
  y?: number;
  z?: number;
  kind: BlockKind;
  /** 箭头面朝向：2 北 / 3 南 / 4 西 / 5 东。省略按南。 */
  facing?: 2 | 3 | 4 | 5;
}

const BASE: Record<Exclude<BlockKind, "air">, string> = {
  impulse: "command_block",
  "impulse-cond": "command_block",
  chain: "chain_command_block",
  "chain-cond": "chain_command_block",
  repeat: "repeating_command_block",
  "repeat-cond": "repeating_command_block",
};

/**
 * 六面纹理。
 *
 * @why 官方 blocks.json 里，命令方块的顶面和底面指向 `*_conditional_side`，
 * 也就是 `*_conditional.png` 这张图 —— 它画的是带缺口的顶面图案，不是正面。
 * 早先版本把这张图当成"有条件方块的正面"，导致有条件方块正面成了顶面花纹、
 * 顶面反而用侧面图，六面方向全乱。
 *
 * @gotcha 有条件方块的四个非箭头面（东西两侧 + 顶底）都换成 conditional 版：
 * 那个缺口就是游戏里"有条件"的视觉标记。正面与背面保持不变，因为箭头面
 * 在两种状态下玩法含义相同，资源包也没有单独的 `*_conditional_front`。
 */
function facesOf(kind: Exclude<BlockKind, "air">) {
  const base = BASE[kind];
  const conditional = kind.endsWith("-cond");
  return {
    front: `/blocks/${base}_front.png`,
    back: `/blocks/${base}_back.png`,
    side: `/blocks/${base}${conditional ? "_conditional" : "_side"}.png`,
    updown: `/blocks/${base}_conditional.png`,
  };
}

/** 面朝 +Z 时为 0 度；东(+X) 是 +90，北(-Z) 是 180，西(-X) 是 270。 */
const FACING_DEG: Record<number, number> = { 3: 0, 5: 90, 2: 180, 4: 270 };

export interface CommandBlockSceneProps {
  blocks: BlockSpec[];
  /** 单个方块边长，默认 56。 */
  cube?: number;
  /** 初始俯仰与水平角。 */
  tilt?: number;
  spin?: number;
}

export function CommandBlockScene({
  blocks,
  cube = 64,
  tilt = -34,
  spin = -45,
}: CommandBlockSceneProps) {
  const [rx, setRx] = useState(tilt);
  const [ry, setRy] = useState(spin);
  const drag = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current = { x: e.clientX, y: e.clientY };
    setRy((v) => v + dx * 0.45);
    setRx((v) => Math.max(-80, Math.min(80, v - dy * 0.45)));
  }, []);

  const onPointerUp = useCallback(() => {
    drag.current = null;
  }, []);

  /** 包围盒决定舞台尺寸，方块以左上角为原点摆放，最后整体居中。 */
  const { width, depth, height, spanX, spanZ, spanY } = useMemo(() => {
    const xs = blocks.map((b) => b.x);
    const zs = blocks.map((b) => b.z ?? 0);
    const ys = blocks.map((b) => b.y ?? 0);
    const minX = Math.min(...xs, 0);
    const maxX = Math.max(...xs, 0);
    const minZ = Math.min(...zs, 0);
    const maxZ = Math.max(...zs, 0);
    const maxY = Math.max(...ys, 0);
    return {
      width: (maxX - minX + 1) * cube,
      depth: (maxZ - minZ + 1) * cube,
      height: (maxY + 1) * cube,
      spanX: minX,
      spanZ: minZ,
      spanY: 0,
    };
  }, [blocks, cube]);

  return (
    <div
      className="cb-scene"
      style={{ ["--cube" as string]: `${cube}px` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="cb-stage"
        style={{ transform: `rotateX(${rx}deg) rotateY(${ry}deg)` }}
      >
        {blocks.map((b, i) => {
          const y = b.y ?? 0;
          const z = b.z ?? 0;
          /* 让整组方块以舞台中心为原点，旋转时才是绕着图形本身转，而不是绕左上角甩 */
          const pos = `translate3d(${(b.x - spanX) * cube - width / 2 + cube / 2}px, ${
            (spanY - y) * cube - height / 2 + cube / 2
          }px, ${(z - spanZ) * cube - depth / 2 + cube / 2}px)`;
          if (b.kind === "air") {
            // @why 空气也要六个面：只画一个平面的话，它在 3D 里会贴在地上像块地毯，
            // 读者分不清"这里空着一格"和"这里没有方块"。
            return (
              <div
                key={i}
                className="cb-cube"
                style={{ transform: `${pos} rotateY(${FACING_DEG[b.facing ?? 3]}deg)` }}
              >
                {["top", "bottom", "front", "back", "left", "right"].map((f) => (
                  <div key={f} className={`cb-face cb-air-face cb-${f}`} />
                ))}
              </div>
            );
          }
          const t = facesOf(b.kind);
          return (
            <div
              key={i}
              className="cb-cube"
              style={{ transform: `${pos} rotateY(${FACING_DEG[b.facing ?? 3]}deg)` }}
            >
              <div className="cb-face cb-top" style={{ backgroundImage: `url(${t.updown})` }} />
              <div className="cb-face cb-bottom" style={{ backgroundImage: `url(${t.updown})` }} />
              <div className="cb-face cb-front" style={{ backgroundImage: `url(${t.front})` }} />
              <div className="cb-face cb-back" style={{ backgroundImage: `url(${t.back})` }} />
              <div className="cb-face cb-left" style={{ backgroundImage: `url(${t.side})` }} />
              <div className="cb-face cb-right" style={{ backgroundImage: `url(${t.side})` }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
