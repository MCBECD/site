import { CommandBlockScene, type BlockSpec } from "@/components/blocks/CommandBlockScene";

export const metadata = {
  title: "命令方块排布 · MCBECD",
  description: "用官方纹理把命令方块的类型、条件、朝向画成立体图",
};

const SIX: BlockSpec[] = [
  { x: 0, kind: "impulse" },
  { x: 1, kind: "impulse-cond" },
  { x: 2, kind: "chain" },
  { x: 3, kind: "chain-cond" },
  { x: 4, kind: "repeat" },
  { x: 5, kind: "repeat-cond" },
];

const CHAIN: BlockSpec[] = [
  { x: 0, kind: "repeat", facing: 5 },
  { x: 1, kind: "chain", facing: 5 },
  { x: 2, kind: "chain-cond", facing: 5 },
];

const AIR: BlockSpec[] = [
  { x: 0, kind: "impulse" },
  { x: 1, kind: "air" },
  { x: 2, kind: "chain" },
];

export default function BlocksPage() {
  return (
    <main className="mx-auto max-w-3xl px-[var(--content-gutter)] py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
        命令方块排布
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-text-tertiary)]">
        拖动可以转视角。纹理取自 Mojang 官方资源包示例。
      </p>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
          六种状态
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-tertiary)]">
          橙=脉冲，青=连锁，紫=重复；带缺角的是有条件。
        </p>
        <CommandBlockScene blocks={SIX} cube={52} />
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
          一条链 · 箭头朝东
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-tertiary)]">
          后一个方块必须接在前一个的箭头头部。
        </p>
        <CommandBlockScene blocks={CHAIN} cube={64} />
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
          空气占位
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-tertiary)]">
          虚线格子表示这个位置是空的，用来对齐间距。
        </p>
        <CommandBlockScene blocks={AIR} cube={64} />
      </section>
    </main>
  );
}
