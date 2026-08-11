import { Fragment, type ReactNode } from "react";

export const renderTitleWithCode = (title: string): ReactNode[] => {
  const regex = /^\/[a-zA-Z0-9]+/;
  const parts: ReactNode[] = [];
  const match = regex.exec(title);

  if (match) {
    parts.push(
      <span key="c-0" style={{ display: "inline-block", width: "20ch", textAlign: "left" }}>
      <code className="h-[1rem]">
        {match[0]}
      </code>
      </span>
    );
    parts.push(<span key="t-1">{title.slice(match.index + match[0].length)}</span>);
  } else {
    parts.push(<Fragment key="t-0">{title}</Fragment>);
  }

  return parts;
};