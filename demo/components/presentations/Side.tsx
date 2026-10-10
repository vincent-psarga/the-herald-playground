import { ReactNode } from 'react';

/**
 * Where what a side holds stands within its own column.
 *
 * A column is wider than what it usually holds — a set of arms, a figure, a
 * short list — and where that sits across the column is a thing a slide can mean
 * something by: arms centred under a heading read as the subject of it, and arms
 * pushed to the outer edge read as a margin note.
 */
export type Align = 'left' | 'center' | 'right';

export interface SideProps {
  /** Where what it holds stands across its column. To the left unless told. */
  readonly align?: Align;
  readonly children: ReactNode;
}

export interface RestProps {
  readonly children: ReactNode;
}

/**
 * Something set beside the rest of a slide.
 *
 * Two things shown side by side are being compared, and a slide that means them
 * to be compared has to put them side by side: a reader across a room will not
 * hold the first in mind while the second scrolls past.
 *
 * A deck says so by putting the smaller of the two — a set of arms, a figure —
 * inside a Side, and leaves the rest of the slide as it would have written it
 * anyway. Where the Side stands in the file is where it stands on the slide:
 * written first, it takes the left; written after something, it takes the right.
 * A slide with no Side is one column, as it always was.
 *
 *     ## Heraldry & AI
 *
 *     <Side>
 *     <Blazon blazon={"D'argent à trois molettes de gueules"} />
 *     </Side>
 *
 *     - nine centuries worth of documentation
 *     - a domain AI understands, but not that much
 *
 * A heading is a title and not a column, so the ones a slide opens with span the
 * whole of it whichever side the Side is on. And a Side holding markdown rather
 * than a component wants a blank line above and below what it holds, which is
 * what tells MDX to read it as markdown.
 *
 * Where what it holds stands across that column is the slide's to say:
 *
 *     <Side align="center">
 *     <Blazon blazon={"D'argent à trois molettes de gueules"} />
 *     </Side>
 */
export function Side({ children, align = 'left' }: SideProps) {
  return <div className={`deck__side deck__side--${align}`}>{children}</div>;
}

/**
 * Everything on the slide that is not the side, which is the other column.
 *
 * No deck writes this: the build gathers it, having paired the two off, so that
 * a deck says only what stands beside what and never has to say what the rest of
 * its own slide is.
 */
export function Rest({ children }: RestProps) {
  return <div className="deck__rest">{children}</div>;
}
