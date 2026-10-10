import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router';
import { ArmorialPage } from './pages/ArmorialPage';
import { ArmorialsPage } from './pages/ArmorialsPage';
import { BlazonPage } from './pages/BlazonPage';
import { ConventionsPage } from './pages/ConventionsPage';
import { DocIndexPage } from './pages/DocIndexPage';
import { PresentationsPage } from './pages/PresentationsPage';
import { VocabularyPage } from './pages/VocabularyPage';
import { WorkInProgressPage } from './pages/WorkInProgressPage';
import { ARMORIALS } from './armorials';
import { currentPullRequests } from './preview/PullRequests';
import { Languages } from '../src/domain/models/Languages';
import { languageIn } from './utils/Languages';
import { PRESENTATIONS, presentationNamed } from './utils/Presentations';
import { readingIn } from './utils/Reading';
import { vocabularyPath } from './utils/Vocabulary';

/**
 * The presenter is a library of its own, and a large one. It is fetched when a
 * deck is opened and not before: a reader who came to write a blazon should not
 * be made to download a slideshow to do it.
 */
const PresentationPage = lazy(() =>
  import('./pages/PresentationPage').then((module) => ({ default: module.PresentationPage }))
);

const DOCS = [
  { path: vocabularyPath(Languages.fr), label: 'French vocabulary' },
  { path: vocabularyPath(Languages.en), label: 'English vocabulary' },
  { path: '/doc/conventions', label: 'Conventions' },
  { path: '/doc/presentations', label: 'Presentations' },
];

/**
 * The demo is served from the root in development and from a subdirectory on
 * GitHub Pages, so every route below is written without that prefix and the
 * router puts it back the moment an address reaches the browser.
 *
 * Routing is the application's, never the library's: the router lives here, and
 * the parser neither knows nor cares that there is one.
 */
export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ToTheTop />
      <Rail />
      <Routes>
        <Route path="/" element={<ReadBlazon />} />
        <Route path="/doc" element={<DocIndexPage />} />
        <Route path="/doc/vocabulary/:language" element={<ReadVocabulary />} />
        <Route path="/doc/conventions" element={<ConventionsPage />} />
        <Route
          path="/doc/presentations"
          element={<PresentationsPage presentations={PRESENTATIONS} />}
        />
        <Route path="/doc/presentations/:slug" element={<ReadPresentation />} />
        <Route path="/armorials" element={<ArmorialsPage armorials={ARMORIALS} />} />
        <Route path="/armorial/:slug" element={<ReadArmorial />} />
        {currentPullRequests.length !== 0 && (
          <Route path="/pr-preview" element={<WorkInProgressPage />} />
        )}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * A new page is read from its beginning — unless its address names a place
 * within it, which is a request to be put at that place instead.
 *
 * An anchor reached from another page is a request nobody else answers: a
 * browser scrolls to a fragment it was handed in the address bar, and does not
 * when a router swapped the page underneath it. So it is answered here, and only
 * on arrival: a word struck on the vocabulary changes the hash without changing
 * the page, and must leave the scroll where it stands.
 */
function ToTheTop() {
  const { pathname, hash } = useLocation();

  // The page is the dependency and the anchor is not: a word struck on a
  // reference changes the hash, and must leave the scroll where it stands.
  useEffect(() => {
    if (hash === '') {
      // Instant, the page under it having changed outright: the stylesheet
      // scrolls smoothly, which is for moving within one page and not between
      // two.
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    // The place may not be there at all — an address can name anything — and a
    // page that does not hold it is simply read from where it opened.
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'start' });
  }, [pathname]);
  return null;
}

/**
 * A documentation page hands a blazon over by naming it in the address, so the
 * handover is linkable and survives a reload. The page starts from what it is
 * handed, so it is begun afresh whenever the address hands it something else.
 */
function ReadBlazon() {
  const [params] = useSearchParams();
  const { blazon, language } = readingIn(params);
  return <BlazonPage key={params.toString()} initialText={blazon} initialLanguage={language} />;
}

/**
 * A tongue's vocabulary answers to the tongue's own code, there being a page
 * apiece: a reader comes with a word in hand, and the word is in one tongue.
 */
function ReadVocabulary() {
  const language = languageIn(useParams().language);
  return language === undefined ? <NotFound /> : <VocabularyPage language={language} />;
}

/** One armorial answers to its own slug, the one part of an address that is data. */
function ReadArmorial() {
  const { slug } = useParams();
  const armorial = ARMORIALS.find((candidate) => candidate.slug === slug);
  return armorial !== undefined ? <ArmorialPage armorial={armorial} /> : <NotFound />;
}

/** One deck answers to its own slug, taken from the name of the file it is kept in. */
function ReadPresentation() {
  const { slug } = useParams();
  const presentation = slug === undefined ? undefined : presentationNamed(slug);
  if (presentation === undefined) {
    return <NotFound />;
  }
  return (
    <Suspense fallback={<Fetching />}>
      <PresentationPage presentation={presentation} />
    </Suspense>
  );
}

/** What stands in for a page while the code that draws it is on its way. */
function Fetching() {
  return (
    <main className="plane">
      <p className="plane__extent">Fetching the slides…</p>
    </main>
  );
}

function Rail() {
  const { pathname } = useLocation();

  return (
    <nav className="rail">
      <Link to="/" aria-current={pathname === '/' ? 'page' : undefined}>
        Playground
      </Link>
      <RailMenu label="Doc" docs={DOCS} pathname={pathname} />
      <Link to="/armorials" aria-current={pathname.startsWith('/armorial') ? 'page' : undefined}>
        Armorials
      </Link>
      {/* Only where there is work open to look at. A preview is built from a
          branch, which knows of none, so a preview offers no way into one. */}
      {currentPullRequests.length !== 0 && (
        <Link to="/pr-preview" aria-current={pathname === '/pr-preview' ? 'page' : undefined}>
          WIP
        </Link>
      )}
    </nav>
  );
}

function RailMenu({
  label,
  docs,
  pathname,
}: {
  readonly label: string;
  readonly docs: readonly { readonly path: string; readonly label: string }[];
  readonly pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);

  // A menu left open after the reader has looked elsewhere is just clutter, so it
  // closes on the two gestures that mean "never mind": Escape, and a click that
  // lands anywhere else.
  useEffect(() => {
    if (!open) {
      return;
    }
    const dismiss = (event: Event) => {
      if (!menu.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="rail__menu" ref={menu}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-current={pathname.startsWith('/doc') ? 'page' : undefined}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        {label}
      </button>
      {open && (
        <ul>
          {[{ path: '/doc', label: 'Everything' }, ...docs].map((doc) => (
            <li key={doc.path}>
              <Link
                to={doc.path}
                aria-current={doc.path === pathname ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {doc.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NotFound() {
  const { pathname } = useLocation();

  return (
    <main className="plane">
      <h1>Nothing here</h1>
      <p className="plane__extent">No page answers to {pathname}</p>
      <p className="plane__lead">Try the vocabulary, or write a blazon.</p>
    </main>
  );
}
