import { ReactNode, Suspense, lazy, useMemo } from 'react';
import { Link } from 'react-router';
import { Deck, DeckProps, Slide } from '@revealjs/react';
import * as OF_THE_DECKS from '../components/presentations';
import { Presentation } from '../utils/Presentations';
import 'reveal.js/reveal.css';

/**
 * How the presenter is set up.
 *
 * The canvas is the size every slide is drawn against and then scaled from, so
 * a length written anywhere on a slide is a proportion of this and not pixels on
 * the reader's screen. It is stated rather than left to the default because the
 * stylesheet's slide rules are written against it.
 *
 * Embedded, because the deck is a page of the demo and not a takeover of the
 * window: it stays inside the box the page lays out for it, and the keyboard is
 * its own only while it is being read. The slide a reader is on is left in the
 * address, so a slide can be handed to somebody else as it stands.
 */
const CONFIG: DeckProps['config'] = {
  width: 1366,
  height: 768,
  embedded: true,
  hash: true,
  respondToHashChanges: true,
  controls: true,
  progress: true,
  slideNumber: 'c/t',
  // The presenter centres a slide whole, title and all, and a title that drifts
  // down the frame with its content has stopped being where a title is looked
  // for. The stylesheet sets the title at the top and the body in the middle of
  // what is left, so the presenter is asked to leave the slide where it is.
  center: false,
  transition: 'slide',
};

/**
 * One slide.
 *
 * A slide is a title and a body: the title stays at the top, where a title is
 * looked for, and the body is set in the middle of the room the title leaves it.
 * The build has already gathered the one and the other — and, within the body,
 * paired off whatever was set aside with the rest of it, in the order the two
 * are to be read across — which leaves nothing to decide here.
 */
function DeckSlide({ children }: { readonly children?: ReactNode }) {
  return (
    <Slide>
      <div className="deck__slide">{children}</div>
    </Slide>
  );
}

/**
 * What a deck is allowed to call by name.
 *
 * The slide itself first, the build having wrapped each stretch between two
 * rules in one. Then whatever the demo keeps for decks, each under the name it
 * is exported by — so a new component is offered to every deck by exporting it,
 * and this page never hears about it.
 *
 * Nothing maps the ordinary marks of markdown: a heading is a heading and a list
 * is a list, drawn by the browser and dressed by the stylesheet, where the rest
 * of the demo's look also lives.
 */
const SPEAKING = {
  Slide: DeckSlide,
  ...OF_THE_DECKS,
};

export interface PresentationPageProps {
  readonly presentation: Presentation;
}

/**
 * One deck, shown as slides.
 *
 * The file is written as markdown and cut where the markdown says to cut it, so
 * a deck is written the way decks have always been written here and nothing
 * about the demo's routing shows up in the file. A slide that needs more than
 * markdown calls a component by name, and the components are the demo's own:
 * the arms on a slide are drawn by the parser as the slide is shown, not pasted
 * in as a picture taken earlier.
 *
 * Arrow keys, the controls in the corner and a swipe carry the reader through.
 */
export function PresentationPage({ presentation }: PresentationPageProps) {
  // The deck is fetched rather than bundled with the page, so the component that
  // draws it is only settled once there is a deck to draw.
  const Content = useMemo(() => lazy(presentation.load), [presentation]);

  return (
    <main className="plane plane--deck">
      <div className="deck__head">
        <h1>{presentation.title}</h1>
        <Link to="/doc/presentations">All presentations</Link>
      </div>

      <div className="deck">
        <Suspense fallback={<p className="deck__fetching">Fetching the slides…</p>}>
          <Deck
            // Remade outright when the reader opens another deck: the slide a
            // deck is on is state, and it is not the next deck's state.
            key={presentation.slug}
            config={CONFIG}
          >
            <Content components={SPEAKING} />
          </Deck>
        </Suspense>
      </div>
    </main>
  );
}
