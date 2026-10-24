"use client";

/**
 * 命令方块编辑器的交互层。
 *
 * @why 文档里那套字符网格只适合"整排同向"的简单排布；一旦要逐面微调贴图方向、
 * 或者摆一个拐弯的链，字符就不够用了。这个编辑器把两个层次接上：画布上摆方块，
 * 面板里转某一面，最后导出 JSON 贴进 ```cmdblock 代码块。
 *
 * @constraint 导出的 JSON 就是渲染器的输入格式，两边共用 BlockSpec 与 DEFAULT_TURNS，
 * 编辑器里看到的和文档里渲染的是同一套逻辑，不会出现"编辑时一个样、发布后另一个样"。
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CommandBlockScene,
  DEFAULT_TURNS,
  type BlockKind,
  type BlockSpec,
  type FaceKey,
} from "@/components/blocks/CommandBlockScene";

interface EBlock {
  x: number;
  y: number;
  z: number;
  kind: BlockKind;
  facing: 2 | 3 | 4 | 5;
  faces: Record<FaceKey, number>;
}

const KINDS: { id: BlockKind; label: string; letter: string; color: string }[] = [
  { id: "impulse", label: "脉冲", letter: "I", color: "#d9834f" },
  { id: "impulse-cond", label: "脉冲·有条件", letter: "i", color: "#c76b47" },
  { id: "chain", label: "连锁", letter: "C", color: "#3f9e83" },
  { id: "chain-cond", label: "连锁·有条件", letter: "c", color: "#327f6a" },
  { id: "repeat", label: "重复", letter: "R", color: "#7d63c9" },
  { id: "repeat-cond", label: "重复·有条件", letter: "r", color: "#6550a3" },
];

const FACES: { key: FaceKey; label: string }[] = [
  { key: "top", label: "顶面" },
  { key: "bottom", label: "底面" },
  { key: "front", label: "正面（箭头）" },
  { key: "back", label: "背面" },
  { key: "left", label: "左侧" },
  { key: "right", label: "右侧" },
];

const FACING_LABEL: Record<number, string> = { 2: "北", 3: "南", 4: "西", 5: "东" };

function mkBlock(x: number, y: number, z: number, kind: BlockKind = "impulse"): EBlock {
  return { x, y, z, kind, facing: 5, faces: { ...DEFAULT_TURNS } };
}

const DEMO: EBlock[] = [
  { ...mkBlock(0, 0, 0, "repeat"), facing: 5 },
  { ...mkBlock(1, 0, 0, "chain"), facing: 5 },
  { ...mkBlock(2, 0, 0, "chain-cond"), facing: 5 },
];

const kindOf = (id: BlockKind) => KINDS.find((k) => k.id === id)!;

export function EditorClient() {
  const [blocks, setBlocks] = useState<EBlock[]>(DEMO);
  const [brush, setBrush] = useState<BlockKind>("impulse");
  const [layer, setLayer] = useState(0);
  const [sel, setSel] = useState<string | null>("0,0,0");
  const [json, setJson] = useState("");
  const [note, setNote] = useState<string | null>(null);

  /**
   * @why 编辑器是全屏工具，站点导航必须让位。AppShell 在根 layout 里，页面无法卸载它，
   * 只能由这里给 <html> 打标记，CSS 据此隐藏 [data-site-nav] 与页面滚动。
   */
  useEffect(() => {
    document.documentElement.dataset.editor = "1";
    return () => {
      delete document.documentElement.dataset.editor;
    };
  }, []);

  const key = (x: number, y: number, z: number) => `${x},${y},${z}`;
  const selected = blocks.find((b) => key(b.x, b.y, b.z) === sel) ?? null;

  const at = useCallback(
    (x: number, z: number) => blocks.find((b) => b.x === x && b.y === layer && b.z === z),
    [blocks, layer],
  );

  /** 网格尺寸跟着内容长：至少 8×6，超出就多留一格空位方便继续画。 */
  const { cols, rows } = useMemo(() => {
    const mx = blocks.reduce((m, b) => Math.max(m, b.x), 0);
    const mz = blocks.reduce((m, b) => Math.max(m, b.z), 0);
    return { cols: Math.max(8, mx + 2), rows: Math.max(6, mz + 2) };
  }, [blocks]);

  const spec: BlockSpec[] = useMemo(
    () => blocks.map((b) => ({ ...b, faces: b.faces })),
    [blocks],
  );
  const selIndex = selected ? blocks.indexOf(selected) : undefined;

  const place = (x: number, z: number) => {
    const hit = at(x, z);
    if (hit) {
      setSel(key(x, layer, z));
      return;
    }
    setBlocks((prev) => [...prev, mkBlock(x, layer, z, brush)]);
    setSel(key(x, layer, z));
  };

  const erase = (x: number, z: number) => {
    setBlocks((prev) => prev.filter((b) => !(b.x === x && b.y === layer && b.z === z)));
    if (sel === key(x, layer, z)) setSel(null);
  };

  const patch = (fn: (b: EBlock) => EBlock) => {
    if (!selected) return;
    setBlocks((prev) =>
      prev.map((b) => (key(b.x, b.y, b.z) === sel ? fn({ ...b, faces: { ...b.faces } }) : b)),
    );
  };

  const turn = (face: FaceKey, delta: number) => {
    patch((b) => {
      b.faces[face] = ((b.faces[face] + delta) % 360 + 360) % 360;
      return b;
    });
  };

  const exportJson = () => {
    const out = blocks.map((b) => {
      const faces: Partial<Record<FaceKey, number>> = {};
      for (const { key: f } of FACES) {
        const v = b.faces[f];
        if (v !== DEFAULT_TURNS[f]) faces[f] = v;
      }
      const o: Record<string, unknown> = { x: b.x, y: b.y, z: b.z, kind: b.kind, facing: b.facing };
      if (Object.keys(faces).length) o.faces = faces;
      return o;
    });
    const text = JSON.stringify({ v: 1, blocks: out }, null, 1);
    setJson(text);
    setNote(`已生成 ${out.length} 个方块`);
  };

  const importJson = () => {
    try {
      const d = JSON.parse(json) as { blocks?: unknown };
      if (!Array.isArray(d.blocks)) throw new Error("缺少 blocks 数组");
      const next: EBlock[] = d.blocks.map((raw, i) => {
        const r = raw as Record<string, unknown>;
        const kind = String(r.kind) as BlockKind;
        if (!KINDS.some((k) => k.id === kind)) throw new Error(`第 ${i + 1} 个方块类型无效：${kind}`);
        const facing = Number(r.facing ?? 5);
        if (![2, 3, 4, 5].includes(facing)) throw new Error(`第 ${i + 1} 个方块朝向无效：${r.facing}`);
        const faces = { ...DEFAULT_TURNS };
        const rf = (r.faces ?? {}) as Record<string, unknown>;
        for (const { key: f } of FACES) {
          if (rf[f] !== undefined) faces[f] = Number(rf[f]) || 0;
        }
        return {
          x: Number(r.x ?? 0),
          y: Number(r.y ?? 0),
          z: Number(r.z ?? 0),
          kind,
          facing: facing as 2 | 3 | 4 | 5,
          faces,
        };
      });
      setBlocks(next);
      setSel(next[0] ? key(next[0].x, next[0].y, next[0].z) : null);
      setNote(`已导入 ${next.length} 个方块`);
    } catch (e) {
      setNote(`导入失败：${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const box = "rounded-[var(--radius-sm)] border border-[var(--color-border)]";
  const btn =
    "rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-[12px] hover:bg-[var(--color-bg-tertiary)]";

  return (
    <div className="flex h-full flex-col text-[13px] text-[var(--color-fg)]">
      <header className="flex shrink-0 items-center gap-3 border-b border-[var(--color-border)] px-4 py-2">
        <strong className="text-[14px]">命令方块编辑器</strong>
        <span className="opacity-55">工具页 · 不进文档列表</span>
        <div className="ml-auto flex gap-2">
          <button className={btn} onClick={() => { setBlocks(DEMO); setSel("0,0,0"); setNote(null); }}>
            示例
          </button>
          <button className={btn} onClick={() => { setBlocks([]); setSel(null); setNote(null); }}>
            清空
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="min-h-[300px] flex-1 overflow-hidden">
            <CommandBlockScene blocks={spec} cube={48} selected={selIndex} />
          </div>

          <div className={`m-3 shrink-0 overflow-auto p-3 ${box}`}>
            <div className="mb-2 flex items-center gap-2 text-[12px] opacity-70">
              <span>平面网格</span>
              <span>第 {layer} 层</span>
              <span className="ml-auto">左键放置 / 右键删除</span>
            </div>
            <div
              className="inline-grid gap-1"
              style={{ gridTemplateColumns: `repeat(${cols}, 30px)` }}
            >
              {Array.from({ length: rows * cols }).map((_, i) => {
                const x = i % cols;
                const z = Math.floor(i / cols);
                const b = at(x, z);
                const k = b ? kindOf(b.kind) : null;
                const isSel = b && key(b.x, b.y, b.z) === sel;
                return (
                  <button
                    key={i}
                    title={`x=${x} z=${z}`}
                    onClick={() => place(x, z)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      erase(x, z);
                    }}
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-[3px] border text-[12px] font-semibold"
                    style={{
                      borderColor: isSel ? "var(--color-accent)" : "var(--color-border)",
                      background: k ? k.color : "transparent",
                      color: k ? "#fff" : "var(--color-muted)",
                      opacity: k && !k.label.includes("有条件") ? 1 : 0.92,
                    }}
                  >
                    {k ? k.letter : ""}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="w-full shrink-0 space-y-4 overflow-auto border-l border-[var(--color-border)] p-3 md:w-[330px]">
          <div>
            <div className="mb-1 text-[12px] opacity-70">画笔</div>
            <div className="flex flex-wrap gap-1">
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setBrush(k.id)}
                  className="rounded-[3px] border px-2 py-1 text-[12px]"
                  style={{
                    borderColor: brush === k.id ? "var(--color-accent)" : "var(--color-border)",
                    background: brush === k.id ? k.color : "transparent",
                    color: brush === k.id ? "#fff" : "inherit",
                  }}
                >
                  {k.letter} {k.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 text-[12px] opacity-70">编辑层（y）</div>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((y) => (
                <button
                  key={y}
                  onClick={() => setLayer(y)}
                  className="rounded-[3px] border px-3 py-1 text-[12px]"
                  style={{
                    borderColor: layer === y ? "var(--color-accent)" : "var(--color-border)",
                  }}
                >
                  y={y}
                </button>
              ))}
            </div>
          </div>

          <div className={`p-3 ${box}`}>
            <div className="mb-2 text-[12px] opacity-70">选中方块</div>
            {!selected ? (
              <p className="text-[12px] opacity-55">在网格或预览里点一个方块。</p>
            ) : (
              <div className="space-y-3">
                <div className="text-[12px] opacity-70">
                  ({selected.x}, {selected.y}, {selected.z})
                </div>

                <label className="block text-[12px]">
                  <span className="opacity-70">类型</span>
                  <select
                    value={selected.kind}
                    onChange={(e) => patch((b) => ({ ...b, kind: e.target.value as BlockKind }))}
                    className="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
                  >
                    {KINDS.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-[12px]">
                  <span className="opacity-70">箭头朝向</span>
                  <select
                    value={selected.facing}
                    onChange={(e) => patch((b) => ({ ...b, facing: Number(e.target.value) as 2 | 3 | 4 | 5 }))}
                    className="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
                  >
                    {[5, 3, 4, 2].map((f) => (
                      <option key={f} value={f}>
                        {FACING_LABEL[f]}
                      </option>
                    ))}
                  </select>
                </label>

                <div>
                  <div className="mb-1 flex items-center justify-between text-[12px]">
                    <span className="opacity-70">逐面旋转</span>
                    <button
                      className="underline opacity-60"
                      onClick={() => patch((b) => ({ ...b, faces: { ...DEFAULT_TURNS } }))}
                    >
                      全部复位
                    </button>
                  </div>
                  <div className="space-y-1">
                    {FACES.map(({ key: f, label }) => (
                      <div key={f} className="flex items-center gap-2">
                        <span className="w-[76px] text-[12px] opacity-80">{label}</span>
                        <span className="w-[46px] text-right text-[12px] tabular-nums">
                          {selected.faces[f]}°
                        </span>
                        <button className={btn} onClick={() => turn(f, 90)}>
                          +90
                        </button>
                        <button className={btn} onClick={() => turn(f, -90)}>
                          −90
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={`p-3 ${box}`}>
            <div className="mb-2 flex items-center gap-2 text-[12px]">
              <span className="opacity-70">JSON</span>
              <button className={`${btn} ml-auto`} onClick={exportJson}>
                从当前生成
              </button>
              <button className={btn} onClick={importJson}>
                应用
              </button>
            </div>
            <textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              spellCheck={false}
              placeholder={'点「从当前生成」，或把之前导出的 JSON 粘进来。\n贴到文档里：\n```cmdblock\n<这段 JSON>\n```'}
              className="h-[180px] w-full resize-y rounded-[3px] border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-2 font-mono text-[11px] leading-5"
            />
            {note && <div className="mt-1 text-[11px] opacity-65">{note}</div>}
          </div>
        </aside>
      </div>
    </div>
  );
}
