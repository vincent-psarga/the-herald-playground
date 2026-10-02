import { useMemo } from 'react';
import { BlazonShield } from '../BlazonShield';
import { Languages } from '../../../src/domain/models/Languages';
import { LANGUAGES, otherThan } from '../../utils/Languages';
import { readBlazon } from '../../utils/Reading';

/**
 * A deck names its tongue the way a talk does, in full: a slide is written for
 * a reader rather than for a router, and `language="french"` is what somebody
 * writing one reaches for. The two-letter code is accepted just as readily.
 *
 * What it reads into is the library's own set, this being a way of spelling a
 * tongue rather than a second set of them.
 */
const SPOKEN: Record<string, Languages> = {
  french: Languages.fr,
  français: Languages.fr,
  fr: Languages.fr,
  english: Languages.en,
  en: Languages.en,
};

/**
 * How large the arms are drawn, in the sizes a slide is likely to want.
 *
 * Given against the canvas the slides are drawn on — 1366 by 768, scaled into
 * whatever room the page leaves it — so a size is a proportion of a slide and
 * holds whatever the window is doing. The largest is the largest that still
 * leaves a slide its title, its footer and the words under the arms.
 *
 * A ladder rather than a number, because what a slide means to say is that these
 * arms are the point and those are an aside, and it should not have to do
 * arithmetic against a canvas it never sees to say so.
 */
const SIZES = {
  xs: 120,
  sm: 180,
  m: 260,
  lg: 340,
  xl: 420,
} as const;

export type Size = keyof typeof SIZES;

export interface BlazonProps {
  /** The blazon itself, written as it would be written anywhere else. */
  readonly blazon: string;
  /** The tongue it is written in. French unless the slide says otherwise. */
  readonly language?: string;
  /** How large the arms are drawn. Middling unless the slide says otherwise. */
  readonly size?: Size;
  /**
   * How wide the arms are drawn, exactly, for the slide that wants a size the
   * ladder has no rung for. It answers before the ladder does.
   */
  readonly width?: number;
  /**
   * Whether the words are said under the arms. They are unless the slide says
   * not to: a slide showing what a bend is wants the shape and not a reading of
   * it, and the blazon under every one of a row of arms is a wall of words
   * nobody was asked to read.
   */
  readonly showBlazon?: boolean;
}

/**
 * The library's whole trick on one slide: a blazon read, drawn, and said back in
 * the other tongue.
 *
 * It is the parser that answers here and not a fixture — the arms are drawn from
 * what the parser made of the words, and the translation is what the writer said
 * of that. A blazon the parser refuses says so on the slide, which is worth
 * showing too: a talk that only ever shows what works is not showing the parser.
 *
 * How large they are drawn is the slide's to say, in the sizes above:
 *
 *     <Blazon blazon={"D'azur au sautoir d'argent"} size="xl" />
 *
 * The words under the arms keep their own size whatever the arms do. They are
 * the evidence and not the claim, and a slide that enlarged them along with the
 * shield would be shouting its footnotes. A slide that wants the shape alone
 * leaves them off altogether:
 *
 *     <Blazon blazon={"d'argent à la bande de gueules"} size="xs" showBlazon={false} />
 *
 * The arms still answer to the blazon for anyone who cannot see them, a thing
 * left unsaid on the screen being no reason to leave it unsaid to a reader; and
 * a refusal is said whatever the slide asked for, there being nothing else to
 * show when the parser could read nothing.
 */
export function Blazon({
  blazon,
  language = 'french',
  size = 'm',
  width,
  showBlazon = true,
}: BlazonProps) {
  const spoken = SPOKEN[language.toLowerCase()] ?? Languages.fr;
  const other = otherThan(spoken);
  const read = useMemo(() => readBlazon(blazon, spoken), [blazon, spoken]);
  // A size the ladder has no rung for is middling rather than nothing: a
  // mistyped size should cost a slide its emphasis and not its arms.
  const drawn = width ?? SIZES[size] ?? SIZES.m;

  return (
    <figure className="slide-blazon">
      {'blazon' in read ? (
        <BlazonShield blazon={read.blazon} alt={blazon} width={drawn} />
      ) : (
        <p className="slide-blazon__refused">Refused: {read.refused}</p>
      )}
      {showBlazon && (
        <figcaption>
          <p lang={spoken}>{blazon}</p>
          {'blazon' in read && (
            <p className="slide-blazon__abroad" lang={other}>
              {LANGUAGES[other].writer.write(read.blazon)}
            </p>
          )}
        </figcaption>
      )}
    </figure>
  );
}
