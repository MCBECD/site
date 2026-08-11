import { Fragment, type ReactNode } from "react";

const TITLE_CODE_GAP = 4;

export const renderTitleWithCode = (title: string): ReactNode[] => {
  const regex = /\/[a-zA-Z0-9]+/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(title)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<Fragment key={`t-${lastIndex}`}>{title.slice(lastIndex, match.index)}</Fragment>);
    }
    parts.push(
      <code key={`c-${match.index}`} className="cmd-code" style={{ marginRight: TITLE_CODE_GAP }}>
        {match[0]}
      </code>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < title.length) {
    parts.push(<Fragment key={`t-${lastIndex}`}>{title.slice(lastIndex)}</Fragment>);
  }

  return parts;
};
