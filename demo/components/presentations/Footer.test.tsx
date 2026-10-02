// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Footer } from './Footer';

afterEach(cleanup);

describe('what the talk is, said under every slide', () => {
  test('stands apart from what a slide says, and says so in the markup', () => {
    render(<Footer>Somewhere — some day</Footer>);
    // A footer by its element as well as by where it is drawn: it is about the
    // talk, and a reader taking the page apart should be told as much.
    expect(screen.getByText('Somewhere — some day').tagName).toBe('FOOTER');
  });
});
