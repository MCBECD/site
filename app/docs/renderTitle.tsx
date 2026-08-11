import type { ReactNode } from "react";

export const renderTitleWithCode = (title: string): ReactNode[] => {
  const regex = /^\/[a-zA-Z0-9]+/;
  const match = regex.exec(title);

  if (match) {
    return [
      <span key="c-0" style={{ display: "inline-block", width: "16ch", textAlign: "left" }}>
        <code>{match[0]}</code>
      </span>,
      <span key="t-1">{title.slice(match[0].length)}</span>,
    ];
  }

  return [<span key="t-0">{title}</span>];
};