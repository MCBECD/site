/**
 * Unified command block icon component.
 * Replaces 7 duplicate Cmd*.tsx files.
 */
export function CmdBlock({ icon, children }: { icon: string; children?: React.ReactNode }) {
  return (
    <span className="cmd-icon-wrapper">
      <img src={`/icons/cmd/${icon}.png`} alt="" width={20} height={20} className="cmd-icon" />
      <code className="cmd-code">{children}</code>
    </span>
  );
}

/** Factory for backward-compatible MDX component aliases */
export function makeCmdBlock(icon: string) {
  return function CmdAlias({ children }: { children?: React.ReactNode }) {
    return <CmdBlock icon={icon}>{children}</CmdBlock>;
  };
}
