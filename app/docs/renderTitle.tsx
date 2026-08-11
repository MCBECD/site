import { Fragment } from "react";
import { type ReactNode } from "react";

export const renderTitleWithCode = (title: string) => {
  const regex = /\/[a-zA-Z0-9]+/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(title)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<Fragment key={lastIndex}>{title.slice(lastIndex, match.index)}</Fragment>);
    }
    parts.push(<code key={match.index} style={{ marginRight: 16 }}>{match[0]}</code>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < title.length) {
    parts.push(<Fragment key={lastIndex}>{title.slice(lastIndex)}</Fragment>);
  }
  console.log(parts);
  return parts;
};