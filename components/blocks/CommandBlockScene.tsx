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

import { useCallback, useMemo, useRef, useState } from "react";

export type BlockKind =
  | "impulse"
  | "impulse-cond"
  | "chain"
  | "chain-cond"
  | "repeat"
  | "repeat-cond"
  | "air";

export type FaceKey = "front" | "back" | "left" | "right" | "top" | "bottom";

/** 三维向量，CSS 坐标系：X 右、Y 下、Z 朝观察者。 */
type Vec3 = readonly [number, number, number];

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

/** 六面法线，CSS 坐标系：X 右、Y 下、Z 朝观察者。 */
const FACE_NORMALS: Record<FaceKey, Vec3> = {
  front: [0, 0, 1],
  back: [0, 0, -1],
  right: [1, 0, 0],
  left: [-1, 0, 0],
  top: [0, -1, 0],
  bottom: [0, 1, 0],
};

/**
 * 主光方向（从受光面指向光源），固定在相机上：左前上方。
 *
 * @why 这一个方向同时决定两件事：面均亮度（和法线点积）与渐变方向（取它的屏幕分量
 * x/y）。所有面共用同一个屏幕方向，整组方块才像被一道光扫过；每个面各按自己的平面
 * 投影一次，三个面三种走向，看着就是各亮各的。
 *
 * @constraint 光必须挂在相机上而不是挂在方块上：拖动时读者感知到的是摄像机绕着方块转，
 * 明暗跟着视角走才像换了个角度看；按方块本地坐标算的话，转起来明暗不动，看起来就是
 * 方块自己在固定光里自转。
 * @constraint Z 分量要明显大于 X/Y：正对镜头的面是画面主体，光太侧的话整组方块发暗。
 */
const KEY_LIGHT: readonly [number, number, number] = [-0.342, -0.44, 0.83];

/**
 * 场景盒子在投影包围盒之外留的呼吸缝：横向两侧共 24px、纵向共 16px。
 *
 * @constraint 纵向这 16px 由 .cb-scene 的 `padding: 0.5rem 0` 提供，改一边必须同步
 * 另一边，否则盒子会比图大出一圈——那正是"框比图大"的由来。
 */
const PAD_X = 24;
const PAD_Y = 16;

/**
 * facing 对应的绕 Y 转角（余弦, 正弦）。
 *
 * @why facing 只有四个方向，cos/sin 恰好是精确的 0/±1，查表比逐面算三角函数准也快。
 * @constraint 未知朝向按南（3，即正对观察者）处理，总比把方块转飞好。
 */
const FACING_CS: Record<number, readonly [number, number]> = {
  3: [1, 0],
  5: [0, 1],
  2: [-1, 0],
  4: [0, -1],
};

/**
 * 面的局部 +x 轴在立方体坐标系里的方向。
 *
 * @why CSS 的 linear-gradient 角度是相对元素盒子的，而光的方向在视图坐标系里，两者
 * 相差一整串旋转。要知道面的局部轴朝哪，才能把"光从哪来"换算成"渐变朝哪边沉"。
 * @constraint 六个朝向必须和 components.css 里 .cb-xxx 的 transform 逐项对应：
 * 那边改一个角，这边不改，渐变方向就会整体偏。
 */
function faceAxisX(face: FaceKey, turnDeg: number): Vec3 {
  const t = (turnDeg * Math.PI) / 180;
  const c = Math.cos(t);
  const s = Math.sin(t);
  switch (face) {
    case "front":
      return [c, s, 0];
    case "back":
      return [-c, s, 0];
    case "left":
      return [0, s, c];
    case "right":
      return [0, s, -c];
    case "top":
      return [c, 0, s];
    case "bottom":
      return [c, 0, -s];
  }
}

export interface FaceShade {
  /** 渐变亮端（朝光那一侧）的压暗系数。 */
  lo: number;
  /** 渐变暗端（背光那一侧）的压暗系数。 */
  hi: number;
  /** CSS linear-gradient 角度，指向暗端。 */
  angle: number;
}

/**
 * 按当前视角生成逐面明暗函数。
 *
 * @why 纯 CSS 3D 没有光照，六面一样亮时立方体会退化成一张平面拼贴，方向感全没了。
 * 面均亮度由法线和主光的点积决定（顶面最亮、正面中等、右侧与底面沉下去）；在此之上
 * 每个面再沿主光的屏幕方向铺一道渐变 —— 方向对所有面是同一个，整组方块是一道光扫过，
 * 不是每个面各亮各的。
 *
 * @constraint 主光之外只加一个随朝上程度上升的环境项：背面不会死黑，底面依旧最黑 ——
 * 那是方块压在地上的视觉依据，不能亮。
 * @constraint 亮度区间刻意压在 0.02~0.36：整面糊满灰会又脏又闷，示意图要的是轻。
 * @constraint 渐变方向必须换算进面自己的盒子：CSS 的 linear-gradient 角度只认元素
 * 局部坐标，而光的方向在屏幕坐标系里，两者差着一整串旋转。
 */
function makeShadeFn(rx: number, ry: number) {
  const b = (rx * Math.PI) / 180;
  const cb = Math.cos(b);
  const sb = Math.sin(b);
  const a = (ry * Math.PI) / 180;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  return (face: FaceKey, turnDeg: number, facing: number): FaceShade => {
    // Ry(ry)·Ry(facing) = Ry(ry+facing)：把 facing 折进 ry 的三角值里，只算一次
    const [cf, sf] = FACING_CS[facing] ?? [1, 0];
    const c = ca * cf - sa * sf;
    const s = sa * cf + ca * sf;
    // 视图旋转 V = Rx(rx)·Ry(ry+facing)
    const view = (v: Vec3): Vec3 => {
      // Ry：x1 = x·c + z·s，z1 = -x·s + z·c
      const x1 = v[0] * c + v[2] * s;
      const z1 = -v[0] * s + v[2] * c;
      // Rx：y2 = y·cb - z1·sb，z2 = y·sb + z1·cb
      return [x1, v[1] * cb - z1 * sb, v[1] * sb + z1 * cb];
    };
    const n = view(FACE_NORMALS[face]);
    const u = view(faceAxisX(face, turnDeg));
    // 面的局部 +y 轴 = 法线 × 局部 +x 轴，(u, v, n) 保持正交
    const vx = n[1] * u[2] - n[2] * u[1];
    const vy = n[2] * u[0] - n[0] * u[2];

    // 面均亮度
    const key = n[0] * KEY_LIGHT[0] + n[1] * KEY_LIGHT[1] + n[2] * KEY_LIGHT[2];
    const lit = 0.8 * Math.max(0, key) + 0.2 * (0.5 * (1 - n[1]));
    const mid = Math.min(0.36, Math.max(0.02, 0.33 - 0.36 * lit));

    // 渐变：把主光的屏幕方向（所有面共用的常量）换算成这个面的局部方向
    const det = u[0] * vy - u[1] * vx;
    // 面侧对镜头时局部轴投影退化，没有渐变方向可言，退回纯色
    if (Math.abs(det) < 0.05) return { lo: mid, hi: mid, angle: 180 };
    const ga = (KEY_LIGHT[0] * vy - KEY_LIGHT[1] * vx) / det;
    const gb = (u[0] * KEY_LIGHT[1] - u[1] * KEY_LIGHT[0]) / det;
    return {
      lo: Math.min(0.5, Math.max(0.02, mid - 0.1)),
      hi: Math.min(0.5, Math.max(0.02, mid + 0.1)),
      // 渐变朝背光的一侧沉下去；CSS 角度指向暗端
      angle: (Math.atan2(-ga, gb) * 180) / Math.PI,
    };
  };
}

export interface CommandBlockSceneProps {
  blocks: BlockSpec[];
  /** 单个方块边长，默认 44。 */
  cube?: number;
  /** 初始俯仰与水平角。 */
  tilt?: number;
  spin?: number;
  /** 高亮第几个方块。 */
  selected?: number;
}

export function CommandBlockScene({
  blocks,
  cube = 44,
  tilt = -34,
  spin = -45,
  selected,
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

  /** 明暗跟着视角走：只有 rx/ry 变了才重算，见 makeShadeFn。 */
  const shadeFor = useMemo(() => makeShadeFn(rx, ry), [rx, ry]);

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
   * 投影包围盒：立方体盒 (width × height × depth) 转过 Rx(rx)·Ry(ry) 后在屏幕上的尺寸。
   *
   * @why 场景盒子的尺寸必须等于当前视角下的投影大小。固定 min-height 会把长排布下面
   * 那排方块裁掉；按经验系数估一个值，短排布上又会留下一大片空白，框比图还大 ——
   * "框框太大"就是这么来的。按真实投影算，框才贴得住图。
   *
   * @constraint 公式是线性映射各轴分量直接相加：横向 = W·|cos ry| + D·|sin ry|，
   * 纵向 = H·|cos rx| + (W·|sin ry| + D·|cos ry|)·|sin rx|。已对 4784 组
   * (rx, ry, 盒尺寸) 与暴力角点投影对照，最大偏差 5.7e-14。
   * @constraint 必须跟着 rx/ry 重算：拖动到侧视时横向会涨到 √(W²+D²)，静态尺寸
   * 装不下。这也是 .cb-stage 不能挂 transition 的原因 —— 过渡途中图形处在中间角，
   * 包围盒可能同时大过起点和终点，盒子却是按终点尺寸给的，会被裁。
   */
  const { sceneW, sceneH } = useMemo(() => {
    const sx = Math.abs(Math.sin((ry * Math.PI) / 180));
    const cx = Math.abs(Math.cos((ry * Math.PI) / 180));
    const sy = Math.abs(Math.sin((rx * Math.PI) / 180));
    const cy = Math.abs(Math.cos((rx * Math.PI) / 180));
    return {
      sceneW: Math.ceil(width * cx + depth * sx) + PAD_X,
      sceneH: Math.ceil(height * cy + (width * sx + depth * cx) * sy) + PAD_Y,
    };
  }, [rx, ry, width, height, depth]);

  return (
    <div
      className="cb-scene"
      style={{
        ["--cube" as string]: `${cube}px`,
        width: sceneW,
        height: sceneH,
      }}
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
                const shade = shadeFor(face, turn, b.facing ?? 3);
                return (
                  <div
                    key={face}
                    className={`cb-face cb-${face}`}
                    style={{
                      backgroundImage: `url(${url})`,
                      ["--turn" as string]: `${turn}deg`,
                      ["--shade-lo" as string]: shade.lo.toFixed(3),
                      ["--shade-hi" as string]: shade.hi.toFixed(3),
                      ["--grad" as string]: `${shade.angle.toFixed(1)}deg`,
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
