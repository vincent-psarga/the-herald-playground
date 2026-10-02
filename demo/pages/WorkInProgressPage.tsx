import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { currentPullRequests, type PullRequest } from '../preview/PullRequests';

/**
 * A description is written on GitHub, in the dialect of markdown GitHub reads:
 * it ticks things off in task lists, and it drops in a screenshot as the HTML
 * tag GitHub itself writes when a picture is pasted into the box.
 *
 * So the raw tags are parsed rather than passed over -- and then sanitised,
 * which is what makes that safe to do. The schema is the sanitiser's own,
 * widened only by the attributes a picture needs to be worth showing: the
 * default admits `img` but strips it to its source, leaving no alternative text
 * and no dimensions to hold the layout still while it loads.
 *
 * The sanitiser already admits the disabled checkbox a task list renders to,
 * and admits no script, no style and no handler, whatever a description says.
 */
const PICTURES = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    img: [...(defaultSchema.attributes?.img ?? []), 'alt', 'title', 'width', 'height', 'loading'],
  },
};

/**
 * Where a preview is served from.
 *
 * A preview is a build of its own, under a prefix of its own, and is reached by
 * leaving this one rather than by routing within it — so this is an address and
 * not a route, and the links to it are plain anchors.
 */
export function previewUrl(pull: PullRequest): string {
  return `${import.meta.env.BASE_URL}pr-preview/pr-${pull.id}/`;
}

/**
 * The work that is open but not yet landed, each piece of it with the preview
 * it can be read in.
 *
 * The page shows only what the published demo was built knowing. A preview
 * carries an empty list and never routes here at all, a preview being one piece
 * of this work rather than a place to survey the rest of it.
 */
export function WorkInProgressPage() {
  return (
    <main className="plane">
      <h1>Work in progress</h1>
      <p className="plane__lead">
        Branches open against the parser, each built and served as it stands. They are work in hand
        rather than anything settled: what a preview shows may change or be abandoned, and what it
        reads today the published demo may still refuse.
      </p>

      <div className="index">
        {currentPullRequests.map((pull) => (
          <div className="index__page" key={pull.id}>
            <a className="index__name" href={previewUrl(pull)}>
              {pull.title}
            </a>
            {pull.description !== '' && (
              <div className="index__said">
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, [rehypeSanitize, PICTURES]]}
                >
                  {pull.description}
                </Markdown>
              </div>
            )}
            <p className="index__note">
              <a href={pull.url}>View pull request #{pull.id} on GitHub</a>
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
