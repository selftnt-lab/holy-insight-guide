import { ReactNode, Children, isValidElement, cloneElement } from "react";
import { useNavigate } from "react-router-dom";
import { findBibleReferences, buildReadingHref } from "@/lib/bible-reference-scan";

interface LinkProps {
  href: string;
  label: string;
}

const InlineRefLink = ({ href, label }: LinkProps) => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(href);
      }}
      className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
    >
      {label}
    </button>
  );
};

const processString = (text: string): ReactNode[] => {
  const matches = findBibleReferences(text);
  if (matches.length === 0) return [text];
  const parts: ReactNode[] = [];
  let cursor = 0;
  matches.forEach((m, i) => {
    if (m.start > cursor) parts.push(text.slice(cursor, m.start));
    parts.push(
      <InlineRefLink
        key={`ref-${i}-${m.start}`}
        href={buildReadingHref(m.parsed)}
        label={m.raw}
      />
    );
    cursor = m.end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
};

/**
 * Recursively walks React children and replaces bible references inside string
 * nodes with clickable links. Non-string nodes are preserved (respecting other
 * markdown formatting like bold/italics/links).
 */
export const renderChildrenWithBibleRefs = (children: ReactNode): ReactNode => {
  const arr = Children.toArray(children);
  return arr.flatMap((child, idx) => {
    if (typeof child === "string") {
      return processString(child).map((p, i) =>
        typeof p === "string" ? p : cloneElement(p as any, { key: `s-${idx}-${i}` })
      );
    }
    if (isValidElement(child)) {
      // Do not descend into anchor tags authored by the user
      if (child.type === "a") return child;
      const props: any = child.props ?? {};
      if (props.children === undefined) return child;
      return cloneElement(child, {
        ...props,
        children: renderChildrenWithBibleRefs(props.children),
      });
    }
    return child;
  });
};
