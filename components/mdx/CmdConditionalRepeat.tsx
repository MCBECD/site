/**
 * 条件制约循环命令方块图标 + 行内命令
 * MDX 用法: <CmdConditionalRepeat>/execute as @a run ...</CmdConditionalRepeat>
 */
export function CmdConditionalRepeat({ children }: { children?: React.ReactNode }) {
  return (
    <span className="cmd-icon-wrapper">
      <img src="/icons/cmd/conditional-repeat.png" alt="" width={16} height={16} className="cmd-icon" />
      <code className="cmd-code">{children}</code>
    </span>
  );
}