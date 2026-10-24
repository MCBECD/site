import type { BlockKind, BlockSpec } from "@/components/blocks/CommandBlockScene";

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
