import type { BlockKind, BlockSpec, FaceKey, FaceTurns } from "@/components/blocks/CommandBlockScene";

/**
 * 把字符网格解析成方块列表 —— 文档里画排布用的那套简易语法。
 *
 * @why 说明书不能要求读者写 React 数组。坐标数组表达"第 3 个方块朝东"要读半天，
 * 而网格是照着游戏里的摆放直接画出来：一行一行、一个字符一个方块。
 *
 * 语法：
 *   I 脉冲   C 连锁   R 重复        大写 = 无条件
 *   i       c        r             小写 = 有条件
 *   . 或 _  空气
 *   后面紧跟一个方向符：> 东  v 南  < 西  ^ 北（省略按东）
 *
 * 坐标约定：第 1 行是 z=0，往下 z 递增；第 1 列是 x=0，往右 x 递增。
 *
 * @gotcha token 之间必须有空格。`R>C>` 这种连写会被当成一个未知 token 忽略掉，
 * 这是最容易踩的坑，所以解析器遇到不认识的 token 会直接抛错而不是静默跳过。
 */

const KIND: Record<string, BlockKind> = {
  I: "impulse",
  i: "impulse-cond",
  C: "chain",
  c: "chain-cond",
  R: "repeat",
  r: "repeat-cond",
};

const FACING: Record<string, 2 | 3 | 4 | 5> = {
  ">": 5,
  v: 3,
  "<": 4,
  "^": 2,
};

const AIR = new Set([".", "_"]);

export function parseLayout(src: string, defaultFacing: 2 | 3 | 4 | 5 = 5): BlockSpec[] {
  const blocks: BlockSpec[] = [];

  src
    .split("\n")
    .forEach((line, z) => {
      if (!line.trim()) return;
      line
        .trim()
        .split(/\s+/)
        .forEach((token, x) => {
          if (AIR.has(token)) {
            blocks.push({ x, z, kind: "air" });
            return;
          }
          const kind = KIND[token[0]!];
          if (!kind) {
            throw new Error(
              `无法识别的方块符号「${token}」（第 ${z + 1} 行第 ${x + 1} 个）。可用：I i C c R r . _ ，方向符 > v < ^`,
            );
          }
          const dir = token[1] ? FACING[token[1]] : defaultFacing;
          if (token.length > 1 && dir === undefined) {
            throw new Error(
              `未知方向符「${token[1]}」。可用：> 东  v 南  < 西  ^ 北`,
            );
          }
          blocks.push({ x, z, kind, facing: dir });
        });
    });

  return blocks;
}

const FACE_KEYS: FaceKey[] = ["front", "back", "left", "right", "top", "bottom"];

const VALID_KINDS = new Set<string>([
  "impulse",
  "impulse-cond",
  "chain",
  "chain-cond",
  "repeat",
  "repeat-cond",
  "air",
]);

export interface ParsedLayout {
  blocks: BlockSpec[];
  cube?: number;
}

/**
 * 解析 ```cmdblock 的内容：字符网格或 JSON，两种都收。
 *
 * @why 字符网格适合"整排同向"的简单排布，逐面微调做不到（一个字符表达不了六面各转多少）。
 * 需要精调时用编辑器导出 JSON，格式与 BlockSpec 一一对应，这里只做校验不放宽。
 *
 * @constraint 遇到不认识的东西必须抛错：文档里写错一个字段，宁可渲染成红色提示，
 * 也不能悄悄画成另一个样子——读者不会去核对，只会照着错的摆。
 */
export function parseBlockSource(src: string): ParsedLayout {
  const text = src.trim();
  if (!text.startsWith("{")) return { blocks: parseLayout(src) };

  const doc = JSON.parse(text) as { blocks?: unknown; cube?: unknown };
  if (!Array.isArray(doc.blocks)) throw new Error("JSON 顶层需要一个 blocks 数组");

  const blocks = doc.blocks.map((raw, i) => {
    const r = raw as Record<string, unknown>;
    const kind = String(r.kind ?? "");
    if (!VALID_KINDS.has(kind)) {
      throw new Error(`第 ${i + 1} 个方块的 kind 无效：「${kind}」`);
    }
    const facing = Number(r.facing ?? 3);
    if (![2, 3, 4, 5].includes(facing)) {
      throw new Error(`第 ${i + 1} 个方块的 facing 无效：${r.facing}（只能是 2/3/4/5）`);
    }
    let faces: FaceTurns | undefined;
    if (r.faces && typeof r.faces === "object") {
      const rawFaces = r.faces as Record<string, unknown>;
      faces = {};
      for (const f of FACE_KEYS) {
        if (rawFaces[f] === undefined) continue;
        const v = Number(rawFaces[f]);
        if (!Number.isFinite(v)) throw new Error(`第 ${i + 1} 个方块的 faces.${f} 不是数字`);
        faces[f] = ((Math.round(v) % 360) + 360) % 360;
      }
    }
    return {
      x: Number(r.x ?? 0),
      y: Number(r.y ?? 0),
      z: Number(r.z ?? 0),
      kind: kind as BlockKind,
      facing: facing as 2 | 3 | 4 | 5,
      faces,
    };
  });

  const cube = Number(doc.cube);
  return { blocks, cube: Number.isFinite(cube) && cube > 0 ? cube : undefined };
}
