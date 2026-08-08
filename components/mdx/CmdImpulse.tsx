/**
 * 脉冲命令方块图标 + 行内命令
 * MDX 用法: <CmdImpulse>/give @p diamond 64</CmdImpulse>
 */
export function CmdImpulse({ children }: { children?: React.ReactNode }) {
  return (
    <span className="cmd-icon-wrapper">
      <img src="/icons/cmd/impulse.png" alt="" width={16} height={16} className="cmd-icon" />
      <code className="cmd-code">{children}</code>
    </span>
  );
}
