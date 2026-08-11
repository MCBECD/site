/**
 * 循环命令方块图标 + 行内命令
 * MDX 用法: <CmdRepeat>/execute as @a run ...</CmdRepeat>
 */
export function CmdRepeat({ children }: { children?: React.ReactNode }) {
  return (
    <span className="cmd-icon-wrapper">
      <img src="/icons/cmd/repeat.png" alt="" width={16} height={16} className="cmd-icon" />
      <code className="cmd-code">{children}</code>
    </span>
  );
}