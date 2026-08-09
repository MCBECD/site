/**
 * 条件制约连锁命令方块图标 + 行内命令
 * MDX 用法: <CmdConditionalChain>/setblock ~ ~-1 ~ stone</CmdConditionalChain>
 */
export function CmdConditionalChain({ children }: { children?: React.ReactNode }) {
  return (
    <span className="cmd-icon-wrapper">
      <img src="/icons/cmd/conditional-chain.png" alt="" width={16} height={16} className="cmd-icon" />
      <code className="cmd-code">{children}</code>
    </span>
  );
}