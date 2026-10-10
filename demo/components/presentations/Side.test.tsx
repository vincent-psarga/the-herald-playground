// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Rest, Side } from './Side';

afterEach(cleanup);

describe('what a slide sets aside', () => {
  test('stands apart from the rest of the slide, each knowing which it is', () => {
    const { container } = render(
      <>
        <Side>Some arms</Side>
        <Rest>What they are about</Rest>
      </>
    );
    expect(container.querySelector('.deck__side')?.textContent).toBe('Some arms');
    expect(container.querySelector('.deck__rest')?.textContent).toBe('What they are about');
  });

  test.each(['left', 'center', 'right'] as const)(
    'stands what it holds to the %s when the slide says so',
    (align) => {
      const { container } = render(<Side align={align}>Some arms</Side>);
      expect(container.querySelector('.deck__side')).toHaveClass(`deck__side--${align}`);
    }
  );

  test('stands it to the left when the slide says nothing, as a column always did', () => {
    const { container } = render(<Side>Some arms</Side>);
    expect(container.querySelector('.deck__side')).toHaveClass('deck__side--left');
  });

  test("says nothing of where the rest of a slide stands, that being the slide's own", () => {
    // The rest of a slide is prose and a list, read from the margin they began
    // at: only what was set aside is placed across its column.
    const { container } = render(<Rest>What they are about</Rest>);
    expect(container.querySelector('.deck__rest')?.className).toBe('deck__rest');
  });

  test('holds more than a line, a side being a stretch of a deck', () => {
    render(
      <Side>
        <h2>A heading</h2>
        <p>And what stands under it</p>
      </Side>
    );
    expect(screen.getByRole('heading', { name: 'A heading' })).toBeInTheDocument();
    expect(screen.getByText('And what stands under it')).toBeInTheDocument();
  });
});
