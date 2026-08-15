import type { ReactNode } from "react";

export const renderTitleWithCode = (title: string, _gap?: boolean): ReactNode[] => {
  const match = /^\/[a-zA-Z0-9]+/.exec(title);
  return match ? [
    <span key="code" className="mr-2.5">
        <code>{match[0]}</code>
      </span>,
    <span key="text">{title.slice(match[0].length)}</span>,
  ] : [<span key="full">{title}</span>];
};
