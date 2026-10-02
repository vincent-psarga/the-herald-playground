// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { mount } from '../testing/Mounting';

// The list is written by the deployment rather than kept in the repository, so
// a test that wants work to show has to say what the work is.
const { currentPullRequests } = vi.hoisted(() => ({
  currentPullRequests: [] as { id: number; title: string; description: string; url: string }[],
}));

vi.mock('../preview/PullRequests', () => ({ currentPullRequests }));

const OPEN = {
  id: 1,
  title: 'Support modifiers for ordinaries',
  description: 'Allow: `azure, a bend indented or`',
  url: 'https://github.com/vincent-psarga/the-herald-playground/pull/1',
};

beforeEach(() => {
  currentPullRequests.length = 0;
  vi.stubEnv('BASE_URL', '/the-herald-playground/');
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

async function showing(...pulls: (typeof OPEN)[]) {
  currentPullRequests.push(...pulls);
  const { WorkInProgressPage } = await import('./WorkInProgressPage');
  mount(<WorkInProgressPage />, '/pr-preview');
}

describe('the work in progress', () => {
  test('names each piece of it, leading to the preview it is read in', async () => {
    await showing(OPEN);
    expect(screen.getByRole('link', { name: OPEN.title })).toHaveAttribute(
      'href',
      '/the-herald-playground/pr-preview/pr-1/'
    );
  });

  // A preview is a build of its own under a prefix of its own, so it is left
  // rather than routed to: a router link would keep the reader in this build
  // and show them its not-found page.
  test('leaves the demo to reach a preview, rather than routing within it', async () => {
    await showing(OPEN);
    const link = screen.getByRole('link', { name: OPEN.title });
    expect(link.getAttribute('href')).toContain('/pr-preview/pr-1/');
    expect(link).not.toHaveAttribute('data-discover');
  });

  test('shows the opening of the description, markdown and all', async () => {
    await showing(OPEN);
    // The backticks are the author's, and say the thing between them is a
    // blazon rather than prose.
    expect(screen.getByText('azure, a bend indented or').tagName).toBe('CODE');
  });

  // GitHub writes the tag itself when a picture is pasted into the box, so a
  // description that shows what the work does says so in raw HTML.
  test('shows a screenshot pasted into the description', async () => {
    await showing({
      ...OPEN,
      description:
        'Allow this.\n<img width="484" alt="A bend indented" src="https://x.invalid/s.png" />',
    });
    const picture = screen.getByRole('img', { name: 'A bend indented' });
    expect(picture).toHaveAttribute('src', 'https://x.invalid/s.png');
    expect(picture).toHaveAttribute('width', '484');
  });

  test('shows what is still to do, ticked off as GitHub has it', async () => {
    await showing({
      ...OPEN,
      description: 'Also, add support for:\n- [x] `denché`\n- [ ] `vivré`',
    });
    const boxes = screen.getAllByRole('checkbox');
    expect(boxes).toHaveLength(2);
    expect(boxes[0]).toBeChecked();
    expect(boxes[1]).not.toBeChecked();
    // The work is changed where it is done, not on a page reporting it.
    expect(boxes[0]).toBeDisabled();
  });

  // Raw HTML is parsed so that the screenshot shows, and sanitised so that
  // parsing it is safe. Only someone who can already push here can write one of
  // these, the list leaving out anything opened from a fork, but the page does
  // not lean on that alone.
  test('shows no script a description carries', async () => {
    await showing({ ...OPEN, description: 'Before.<script>window.taken = true;</script>After.' });
    expect(document.querySelector('script')).toBeNull();
  });

  test('strips a handler hung on a tag it does show', async () => {
    await showing({
      ...OPEN,
      description: '<img src="https://x.invalid/s.png" onerror="window.taken = true" alt="shot" />',
    });
    expect(screen.getByRole('img', { name: 'shot' })).not.toHaveAttribute('onerror');
  });

  test('refuses a frame outright', async () => {
    await showing({ ...OPEN, description: '<iframe src="https://x.invalid/"></iframe>' });
    expect(document.querySelector('iframe')).toBeNull();
  });

  test('leads to the pull request itself, for the whole of what it says', async () => {
    await showing(OPEN);
    expect(screen.getByRole('link', { name: 'View pull request #1 on GitHub' })).toHaveAttribute(
      'href',
      OPEN.url
    );
  });

  test('shows each piece of open work, oldest first as the list has them', async () => {
    await showing(OPEN, { ...OPEN, id: 4, title: 'Support split colors' });
    const names = screen.getAllByRole('link').map((link) => link.textContent);
    expect(names).toContain('Support modifiers for ordinaries');
    expect(names).toContain('Support split colors');
  });

  test('says nothing of a description where there is none to say', async () => {
    await showing({ ...OPEN, description: '' });
    expect(screen.getByRole('link', { name: OPEN.title })).toBeInTheDocument();
    expect(screen.queryByRole('code')).not.toBeInTheDocument();
  });
});

describe('the address a preview is reached at', () => {
  test('is built from the prefix the demo was served under', async () => {
    vi.stubEnv('BASE_URL', '/');
    const { previewUrl } = await import('./WorkInProgressPage');
    expect(previewUrl({ ...OPEN, id: 12 })).toBe('/pr-preview/pr-12/');
  });
});
