import { ReactNode } from 'react';

export interface BodyProps {
  readonly children: ReactNode;
}

/**
 * Everything a slide says under its title.
 *
 * No deck writes this: the build gathers it, so that a slide's title can be left
 * where a title is looked for — at the top — while what it introduces is set in
 * the middle of the room the title leaves. A slide with no title is all body,
 * and is centred whole.
 */
export function Body({ children }: BodyProps) {
  return <div className="deck__body">{children}</div>;
}
