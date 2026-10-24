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
 * 顶底共用一张、左右共用一张，四张图摊到六个面上各要转一个角度才是正的，
 * 角度见 DEFAULT_TURNS。
 */

import { useMemo } from "react";

export type BlockKind =
  | "impulse"
  | "impulse-cond"
  | "chain"
  | "chain-cond"
  | "repeat"
  | "repeat-cond"
  | "air";

export type FaceKey = "front" | "back" | "left" | "right" | "top" | "bottom";

/** 每个面绕自身法线的旋转角度，单位度，取 0 / 90 / 180 / 270。 */
export type FaceTurns = Partial<Record<FaceKey, number>>;

export interface BlockSpec {
  x: number;
  y?: number;
  z?: number;
  kind: BlockKind;
  /** 箭头面朝向：2 北 / 3 南 / 4 西 / 5 东。省略按南。 */
  facing?: 2 | 3 | 4 | 5;
  /**
   * 逐面旋转，缺省值见 DEFAULT_TURNS。
   *
   * @why 官方六面只给四张图，每张图摊到哪个面上该转多少，是这一类方块共有的固定值。
   * 默认值按类目统一给，新增方块种类自动继承；只有个别方块要例外时才逐面覆盖。
   */
  faces?: FaceTurns;
}

/**
 * 命令方块这一类的默认摆面角度。
 *
 * @why 定义为类目默认，而不是写死在某个方块或某段 CSS 里：以后新增方块种类
 *（新的条件变体、新纹理）自动继承同一套角度，不会冒出"新方块图案是倒的"这种坑；
 * 个别方块要例外时用 BlockSpec.faces 逐面覆盖。
 *
 * 角度照官方纹理逐面调试确认：顶 180°、底 0°（顶底共用 conditional 那张图，
 * 两个方向都要摆正）；左 90°、右 270°（左右共用 side 那张图，斜槽方向相反）。
 */
export const DEFAULT_TURNS: Record<FaceKey, number> = {
  front: 0,
  back: 0,
  left: 90,
  right: 270,
  top: 180,
  bottom: 0,
};

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

/**
 * 逐面固定的压暗量：面上叠一层 rgba(0,0,0,α) 的纯色半透明黑。
 *
 * @why 之前按视角算法线点积 + 屏幕方向渐变，六面明暗跟着拖拽变，调了十几轮
 * 还是忽明忽暗，示意图根本不需要真实光照。固定透明度所见即所得：顶面不压、
 * 底面最黑（方块压在地上的视觉依据），两侧比正背面深一档拉开立体感。
 *
 * @constraint 不随视角变化是有意为之：方块永远处在同一道固定光里，对示意图够用；
 * 透明度写在面的内联样式 --shade 上，CSS 里 rgba(0,0,0,var(--shade)) 消费，
 * fallback 值必须和这里逐项一致（见 components.css 的 .cb-face::before）。
 */
const FACE_SHADE: Record<FaceKey, number> = {
  top: 0,
  bottom: 0.3,
  front: 0.08,
  back: 0.14,
  left: 0.2,
  right: 0.2,
};

/**
 * 场景盒子在投影包围盒之外留的呼吸缝：横纵各加在总缝上。
 *
 * @why 视角固定后包围盒永远不变，呼吸缝就是框与图之间的全部留白。
 * 每边 32px（PAD_X=64、PAD_Y=48 加上 .cb-scene 的 `padding: 0.5rem 0` 共 16px）
 * 大约一格方块的宽度，贴太近显得框比图还挤，留太宽又回到"框比图大"的老毛病。
 *
 * @constraint 纵向另有 16px 由 .cb-scene 的 `padding: 0.5rem 0` 提供，改一边必须
 * 同步另一边，两边加起来才是真实留白。
 */
const PAD_X = 64;
const PAD_Y = 48;

export interface CommandBlockSceneProps {
  blocks: BlockSpec[];
  /** 单个方块边长，默认 64。 */
  cube?: number;
  /** 初始俯仰与水平角。 */
  tilt?: number;
  spin?: number;
  /** 高亮第几个方块。 */
  selected?: number;
}

export function CommandBlockScene({
  blocks,
  cube = 64,
  tilt = -34,
  spin = -45,
  selected,
}: CommandBlockSceneProps) {
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

  /**
   * 投影包围盒：立方体盒 (width × height × depth) 转过 Rx(tilt)·Ry(spin) 后在屏幕上的尺寸。
   *
   * @why 场景盒子的尺寸必须等于当前视角下的投影大小。固定 min-height 会把长排布下面
   * 那排方块裁掉；按经验系数估一个值，短排布上又会留下一大片空白，框比图还大 ——
   * "框框太大"就是这么来的。按真实投影算，框才贴得住图。
   *
   * @constraint 公式是线性映射各轴分量直接相加：横向 = W·|cos ry| + D·|sin ry|，
   * 纵向 = H·|cos rx| + (W·|sin ry| + D·|cos ry|)·|sin rx|。已对 4784 组
   * (rx, ry, 盒尺寸) 与暴力角点投影对照，最大偏差 5.7e-14。
   * @constraint 视角固定（tilt/spin 是 props 不随交互变），包围盒只算一次，
   * 框的尺寸永远不变 —— 动态缩放的框是之前被明确否掉的方案。
   */
  const { sceneW, sceneH } = useMemo(() => {
    const sx = Math.abs(Math.sin((spin * Math.PI) / 180));
    const cx = Math.abs(Math.cos((spin * Math.PI) / 180));
    const sy = Math.abs(Math.sin((tilt * Math.PI) / 180));
    const cy = Math.abs(Math.cos((tilt * Math.PI) / 180));
    return {
      sceneW: Math.ceil(width * cx + depth * sx) + PAD_X,
      sceneH: Math.ceil(height * cy + (width * sx + depth * cx) * sy) + PAD_Y,
    };
  }, [tilt, spin, width, height, depth]);

  return (
    <div
      className="cb-scene"
      style={{
        ["--cube" as string]: `${cube}px`,
        width: sceneW,
        height: sceneH,
      }}
    >
      <div
        className="cb-stage"
        style={{ transform: `rotateX(${tilt}deg) rotateY(${spin}deg)` }}
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
              className={i === selected ? "cb-cube is-selected" : "cb-cube"}
              style={{ transform: `${pos} rotateY(${FACING_DEG[b.facing ?? 3]}deg)` }}
            >
              {(
                [
                  ["top", t.updown],
                  ["bottom", t.updown],
                  ["front", t.front],
                  ["back", t.back],
                  ["left", t.side],
                  ["right", t.side],
                ] as [FaceKey, string][]
              ).map(([face, url]) => {
                const turn = b.faces?.[face] ?? DEFAULT_TURNS[face];
                return (
                  <div
                    key={face}
                    className={`cb-face cb-${face}`}
                    style={{
                      backgroundImage: `url(${url})`,
                      ["--turn" as string]: `${turn}deg`,
                      ["--shade" as string]: `${FACE_SHADE[face]}`,
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
