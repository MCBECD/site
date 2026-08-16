import { describe, it, expect } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { remarkCommandBlocks } from "@/lib/mdx/remark-command-blocks";

async function transform(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkCommandBlocks)
    .use(remarkStringify)
    .process(markdown);
  return String(file);
}

describe("remarkCommandBlocks", () => {
  it("transforms a standalone <CmdXxx>`code` paragraph into a Cmd code fence", async () => {
    const result = await transform("<CmdRepeat>`/scoreboard players add @a online_time 1`");
    expect(result).toContain("```CmdRepeat");
    expect(result).toContain("/scoreboard players add @a online_time 1");
  });

  it("keeps the command-block type as the fence language", async () => {
    const result = await transform("<CmdConditionalChain>`/scoreboard objectives remove 传送`");
    expect(result).toContain("```CmdConditionalChain");
  });

  it("does not transform inline-code mentions in prose", async () => {
    const result = await transform("每个指令使用 `<CmdXxx>` 组件");
    expect(result).not.toContain("```");
    expect(result).toContain("<CmdXxx>");
  });

  it("does not transform <Cmd...> examples inside a fenced code block", async () => {
    const result = await transform(
      "```mdx\n<CmdChat>`/scoreboard objectives add 雪球菜单 dummy`\n```",
    );
    expect(result).toContain("```mdx");
    expect(result).toContain("<CmdChat>");
    // Must not introduce a nested Cmd fence
    expect(result).not.toContain("```CmdChat");
  });

  it("ignores a paragraph that has extra content after the command", async () => {
    const result = await transform("<CmdRepeat>`/say hi` 说明文字");
    expect(result).not.toContain("```CmdRepeat");
    expect(result).toContain("/say hi");
  });
});
