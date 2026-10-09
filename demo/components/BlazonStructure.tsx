import { useMemo } from 'react';
import { Blazon } from '../../src/domain/models/Blazon';
import { Languages } from '../../src/domain/models/Languages';
import { ColorModel } from '../../src/domain/services/IBlazonDrawer';
import { OUTLINE } from '../utils/Colourings';
import { Branch, structureIn } from '../utils/Structure';
import { VocabularyEntry, vocabularyIn, vocabularyPath } from '../utils/Vocabulary';
import { BlazonShield } from './BlazonShield';
import { PreviewedLink } from './WordPreview';

export interface BlazonStructureProps {
  readonly blazon: Blazon;
  /** The tongue the blazon was written in, whose words it is taken apart into. */
  readonly language: Languages;
  readonly colours?: ColorModel;
}

/**
 * The blazon taken apart: what was said of the field, and what was said of that.
 *
 * A blazon is a sentence with a shape, and the shape is the part a reader has to
 * work out for themselves — which tincture belongs to the field and which to the
 * band laid over it, and what the last word in the sentence was said of. Set
 * beside the arms, the sentence and the shield explain each other.
 *
 * Every word is the way to its own page, and shows itself on the way: a reader
 * who has just met "vidée" can see what it is without losing the blazon they
 * were reading.
 */
export function BlazonStructure({ blazon, language, colours }: BlazonStructureProps) {
  const branches = useMemo(() => structureIn(language, blazon), [language, blazon]);
  // By rank and spelling together, which is what tells two words apart where one
  // spelling names two things — a fess is a partition and a band both.
  const words = useMemo(() => {
    const vocabulary = vocabularyIn(language);
    return new Map(vocabulary.map((entry) => [`${entry.rank}/${entry.word}`, entry]));
  }, [language]);

  return (
    <ul className="structure" role="list">
      {branches.map((branch, at) => (
        <Twig
          key={at}
          branch={branch}
          depth={0}
          language={language}
          words={words}
          colours={colours}
        />
      ))}
    </ul>
  );
}

/** How far the scale falls before it levels off, a blazon nesting no deeper. */
const DEEPEST = 2;

interface TwigProps {
  readonly branch: Branch;
  /** How far under the field it stands, which is what the scale is read off. */
  readonly depth: number;
  readonly language: Languages;
  readonly words: ReadonlyMap<string, VocabularyEntry>;
  readonly colours?: ColorModel;
}

/** One word, and whatever was said of it standing under it. */
function Twig({ branch, depth, language, words, colours }: TwigProps) {
  // A branch that names no word of the vocabulary is a place in the shield
  // rather than a term of it, and leads nowhere.
  const word = branch.rank === undefined ? undefined : words.get(`${branch.rank}/${branch.word}`);
  /*
   * Every branch carries arms of its own: the blazon reduced to the one thing it
   * names, drawn by the drawer that drew the shields beside it and in the same
   * paint, so the fur comes out a fur and the two answer to one colouring.
   *
   * Cut from this blazon and not from the vocabulary's own demonstration of the
   * word. The vocabulary shows its terms in gules and argent, and a parti shown
   * red and white beside a shield painted azure would be telling the reader
   * something the shield plainly contradicts.
   */
  const painted = branch.arms;

  return (
    <li
      className="structure__twig"
      data-deep={Math.min(depth, DEEPEST)}
      data-painted={painted === undefined ? undefined : 'true'}
    >
      <span className="structure__said">
        {word === undefined ? (
          /* Either a half of a divided field, which no word names, or a word the
             vocabulary does not file under that rank — and neither is a way to
             anywhere. The arms still stand: a half that cannot be named can at
             least be shown. */
          <>
            {painted !== undefined && (
              <BlazonShield
                blazon={painted}
                alt=""
                colours={colours}
                outline={OUTLINE}
                width={32}
              />
            )}
            {branch.word !== undefined && (
              <span className="structure__word" lang={language}>
                {branch.word}
              </span>
            )}
          </>
        ) : (
          <PreviewedLink
            word={word}
            language={language}
            to={`${vocabularyPath(language)}#${word.anchor}`}
            colours={colours}
          >
            {painted !== undefined && (
              <BlazonShield
                blazon={painted}
                // The word is beside it and names the tincture outright, so arms
                // announced as well would say it twice.
                alt=""
                colours={colours}
                outline={OUTLINE}
                width={32}
              />
            )}
            <span className="structure__word">{branch.word}</span>
          </PreviewedLink>
        )}
        {/* How many are borne, where more than one is. A numeral rather than the
            tongue's own word for it: the count is not a term of the vocabulary
            and must not read as one. */}
        {branch.count !== undefined && <b className="structure__count">×{branch.count}</b>}
      </span>

      {branch.children.length !== 0 && (
        <ul role="list">
          {branch.children.map((child, at) => (
            <Twig
              key={at}
              branch={child}
              depth={depth + 1}
              language={language}
              words={words}
              colours={colours}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
