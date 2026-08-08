/**
 * 聊天图标 + 行内命令
 * MDX 用法: <CmdChat>/say hello</CmdChat>
 */
export function CmdChat({ children }: { children?: React.ReactNode }) {
  return (
    <span className="cmd-icon-wrapper">
      <img src="/icons/cmd/chat.png" alt="" width={14} height={14} className="cmd-icon" />
      <code className="cmd-code">{children}</code>
    </span>
  );
}