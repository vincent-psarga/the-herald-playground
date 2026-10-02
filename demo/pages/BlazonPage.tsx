import { useMemo, useState } from 'react';
import { Languages } from '../../src/domain/models/Languages';
import { BlazonShield } from '../components/BlazonShield';
import { BlazonStructure } from '../components/BlazonStructure';
import { COLOURINGS, Colouring, OUTLINE } from '../utils/Colourings';
import { LANGUAGES, otherThan } from '../utils/Languages';
import { Read, readBlazon } from '../utils/Reading';

export interface BlazonPageProps {
  /** The language the blazon is written in to begin with. */
  readonly initialLanguage?: Languages;
  /** A blazon to start from, as handed over by a documentation page. */
  readonly initialText?: string;
  /** The paintings to show the arms in. */
  readonly colourings?: readonly Colouring[];
}

/** Nothing typed is nothing read: an empty page is not a blazon that failed. */
function read(text: string, language: Languages): Read | undefined {
  return text.trim() === '' ? undefined : readBlazon(text, language);
}

export function BlazonPage({
  initialLanguage = Languages.fr,
  initialText,
  colourings = COLOURINGS,
}: BlazonPageProps) {
  const [language, setLanguage] = useState<Languages>(initialLanguage);
  const [text, setText] = useState(initialText ?? LANGUAGES[initialLanguage].example);

  const reading = useMemo(() => read(text, language), [text, language]);
  const blazon = reading !== undefined && 'blazon' in reading ? reading.blazon : undefined;

  const other = otherThan(language);
  const translation = blazon === undefined ? '' : LANGUAGES[other].writer.write(blazon);

  // Switching language would otherwise leave the text unreadable in the language
  // now selected, so a blazon that was understood is carried over translated.
  function switchTo(next: Languages) {
    if (next !== language && blazon !== undefined) {
      setText(LANGUAGES[next].writer.write(blazon));
    }
    setLanguage(next);
  }

  return (
    <main className="plane">
      <h1>The Herald Playground</h1>
      <p className="plane__extent">Written in one tongue · read in the other</p>

      <div className="compose">
        <div>
          <label htmlFor="blazon-language">Language</label>
          <select
            id="blazon-language"
            value={language}
            onChange={(event) => switchTo(event.target.value as Languages)}
          >
            {Object.entries(LANGUAGES).map(([code, { label }]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="blazon-text">Blazon</label>
          <textarea
            id="blazon-text"
            rows={2}
            value={text}
            spellCheck={false}
            placeholder={LANGUAGES[language].example}
            onChange={(event) => setText(event.target.value)}
          />
        </div>

        <section className="compose__out" aria-labelledby="blazon-translation-heading">
          <h2 className="compose__label" id="blazon-translation-heading">
            {LANGUAGES[other].label}
          </h2>
          {reading !== undefined && 'refused' in reading ? (
            <p role="alert">{reading.refused}</p>
          ) : (
            <p lang={other}>{translation}</p>
          )}
        </section>
      </div>

      {blazon !== undefined && (
        <div className="showing" aria-live="polite">
          {/* The arms and the sentence they were drawn from, side by side: each
              is the other explained, and a reader looking from one to the other
              is doing the thing the page is for. */}
          <div className="showing__both">
            <div className="showing__fields">
              {colourings.map(({ label, colours }) => (
                <figure key={label} className="showing__field">
                  <BlazonShield
                    blazon={blazon}
                    alt={`${translation} (${label.toLowerCase()})`}
                    colours={colours}
                    outline={OUTLINE}
                    width={200}
                  />
                  <figcaption>{label}</figcaption>
                </figure>
              ))}
            </div>

            <section className="showing__structure" aria-labelledby="blazon-structure-heading">
              <h2 className="compose__label" id="blazon-structure-heading">
                As read
              </h2>
              <BlazonStructure
                blazon={blazon}
                language={language}
                colours={colourings[0]?.colours}
              />
            </section>
          </div>
        </div>
      )}
    </main>
  );
}
