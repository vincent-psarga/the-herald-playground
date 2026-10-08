// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Step, Steps } from './Steps';

afterEach(cleanup);

const waiting = (container: HTMLElement) =>
  [...container.querySelectorAll('.deck__step')].map((step) => [
    step.textContent,
    step.classList.contains('fragment'),
  ]);

describe('things said one after another', () => {
  test('leaves the first where it is and makes every later one wait', () => {
    const { container } = render(
      <Steps>
        <Step>Said on arrival</Step>
        <Step>Said next</Step>
        <Step>Said last</Step>
      </Steps>
    );
    expect(waiting(container)).toEqual([
      ['Said on arrival', false],
      ['Said next', true],
      ['Said last', true],
    ]);
  });

  test('shows a step whole, however many blocks it runs to', () => {
    const { container } = render(
      <Steps>
        <Step>First</Step>
        <Step>
          <p>What there is a great deal of:</p>
          <ul>
            <li>and what it is made of</li>
          </ul>
        </Step>
      </Steps>
    );
    // One thing waits, not two: a line introducing a list is saying what the
    // list says, and arrives with it.
    const [, second] = [...container.querySelectorAll('.deck__step')];
    expect(second).toHaveClass('fragment');
    expect(second?.querySelector('p')).not.toHaveClass('fragment');
    expect(second?.querySelector('ul')).not.toHaveClass('fragment');
  });

  test('keeps them in the order they were written', () => {
    const { container } = render(
      <Steps>
        <Step>One</Step>
        <Step>Two</Step>
      </Steps>
    );
    expect(container.textContent).toBe('OneTwo');
  });
});
