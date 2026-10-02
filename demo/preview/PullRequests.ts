/**
 * The work that is open but not yet landed, and the preview each piece of it
 * can be read in.
 *
 * The list below is written by scripts/pull-requests.mjs when the demo is
 * deployed from main, and is committed empty on purpose: a preview is built
 * from a branch, which carries this file as it stands here, so a preview shows
 * no work in progress and offers no way into one. Only the published demo
 * knows what is open, which is the one place that knowing is of any use.
 */
export type PullRequest = {
  /** The number GitHub gave it, which also names its preview. */
  readonly id: number;
  readonly title: string;
  /** The opening paragraph of the description, as markdown. */
  readonly description: string;
  /** The pull request itself, for a reader who wants the whole of it. */
  readonly url: string;
};

export const currentPullRequests: readonly PullRequest[] = [
  {
    id: 1,
    title: 'Support modifiers for ordinaries',
    description:
      'Allow: `azure, a bend indented or`\n<img width="484" height="310" alt="Capture d’écran 2026-10-01 à 14 33 51" src="https://github.com/user-attachments/assets/ddec5399-34e4-4ea0-8ede-8f02c9609492" />\n\nAlso, add support for:\n- [ ] `denché`\n- [ ] `vivré`\n- [ ] `engrelée`\n- [ ] a specific color for the line itself (like in Lanval example: "D\'or à la bande de gueules engrêlée de sable."',
    url: 'https://github.com/vincent-psarga/the-herald-playground/pull/1',
  },
  {
    id: 2,
    title: 'Support composed arms',
    description:
      'Add support for composed arms, such as:\n\n```\nParti \nau premier d\'azur semé de fleurs de lys d\'or\nau second d\'hermine au chef de gueules\n```\n<img width="467" height="323" alt="Capture d’écran 2026-10-01 à 14 53 39" src="https://github.com/user-attachments/assets/2a674f3f-a3ef-4ca5-ac14-ad7a140c577b" />',
    url: 'https://github.com/vincent-psarga/the-herald-playground/pull/2',
  },
  {
    id: 3,
    title: 'Add slides in demo',
    description: 'Add a page to share decks, based on [reveal.js](https://revealjs.com/)',
    url: 'https://github.com/vincent-psarga/the-herald-playground/pull/3',
  },
  {
    id: 4,
    title: 'Support split colors',
    description:
      'Add support for split colors, eg: `Per pale azure and or, a chevron counterchanged`\n<img width="465" height="307" alt="Capture d’écran 2026-10-01 à 15 14 22" src="https://github.com/user-attachments/assets/1ce5d51e-2c53-446b-b291-610147a404c4" />\n\n- [x] Add support for counterchanged\n- [ ] Add support for partitions as tincture (eg: `L\'aigle échiquetée rouge argentée`)',
    url: 'https://github.com/vincent-psarga/the-herald-playground/pull/4',
  },
  {
    id: 5,
    title: 'Handle charge attributes',
    description:
      '- Add "complex" charges that can have more than one color (eg: "a lion gules crowned or")\n- Add "attributes" linked to specific models',
    url: 'https://github.com/vincent-psarga/the-herald-playground/pull/5',
  },
];
