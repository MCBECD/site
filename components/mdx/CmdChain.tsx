/**
 * 连锁命令方块图标 + 行内命令
 * MDX 用法: <CmdChain>/setblock ~ ~-1 ~ stone</CmdChain>
 */
export function CmdChain({ children }: { children?: React.ReactNode }) {
  return (
    <span className="cmd-icon-wrapper">
      <img src="/icons/cmd/chain.png" alt="" width={16} height={16} className="cmd-icon" />
      <code className="cmd-code">{children}</code>
    </span>
  );
}