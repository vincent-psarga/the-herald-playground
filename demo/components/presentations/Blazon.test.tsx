// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Blazon } from './Blazon';

afterEach(cleanup);

describe('a blazon on a slide', () => {
  test('draws the arms the words name, read as the slide is shown', () => {
    render(<Blazon blazon="d'or au sautoir de gueules" language="french" />);
    const arms = screen.getByRole('img', { name: "d'or au sautoir de gueules" });
    expect(arms.getAttribute('src')).toMatch(/^data:image\/svg\+xml/);
    // Or and gules, which is what the words said: the drawing is the parser's.
    expect(decodeURIComponent(arms.getAttribute('src') ?? '')).toContain('#ffd700');
  });

  test('says the blazon as it was written, a talk being about the words', () => {
    render(<Blazon blazon="d'or au sautoir de gueules" language="french" />);
    expect(screen.getByText("d'or au sautoir de gueules")).toHaveAttribute('lang', 'fr');
  });

  test('says it back in the other tongue, which is the whole of the trick', () => {
    render(<Blazon blazon="d'or au sautoir de gueules" language="french" />);
    expect(screen.getByText('Or a saltire gules.')).toHaveAttribute('lang', 'en');
  });

  test('reads an English blazon into French when the slide says English', () => {
    render(<Blazon blazon="Azure, a bend or" language="english" />);
    expect(screen.getByText("D'azur à la bande d'or.")).toHaveAttribute('lang', 'fr');
  });

  test('takes the tongue by its code as readily as by its name', () => {
    render(<Blazon blazon="Azure, a bend or" language="en" />);
    expect(screen.getByText("D'azur à la bande d'or.")).toBeInTheDocument();
  });

  test('is written in French unless the slide says otherwise', () => {
    render(<Blazon blazon="de gueules" />);
    expect(screen.getByText('Gules.')).toBeInTheDocument();
  });

  test('draws the arms middling when the slide asks for no size', () => {
    render(<Blazon blazon="de gueules" />);
    expect(screen.getByRole('img', { name: 'de gueules' })).toHaveAttribute('width', '260');
  });

  test.each([
    ['xs', '120'],
    ['sm', '180'],
    ['m', '260'],
    ['lg', '340'],
    ['xl', '420'],
  ] as const)('draws them at the %s the slide asked for', (size, width) => {
    render(<Blazon blazon="de gueules" size={size} />);
    expect(screen.getByRole('img', { name: 'de gueules' })).toHaveAttribute('width', width);
  });

  test('keeps the arms in shape whatever size they are drawn at', () => {
    render(<Blazon blazon="de gueules" size="xl" />);
    const arms = screen.getByRole('img', { name: 'de gueules' });
    // A shield is taller than it is wide, by the same reckoning at every size.
    expect(Number(arms.getAttribute('height'))).toBe(Math.round(420 * (240 / 200)));
  });

  test('answers an exact width before the ladder does, for the slide that wants one', () => {
    render(<Blazon blazon="de gueules" size="xs" width={500} />);
    expect(screen.getByRole('img', { name: 'de gueules' })).toHaveAttribute('width', '500');
  });

  test('draws them middling when asked for a size the ladder has no rung for', () => {
    // A mistyped size should cost a slide its emphasis and not its arms.
    render(<Blazon blazon="de gueules" size={'enormous' as 'xl'} />);
    expect(screen.getByRole('img', { name: 'de gueules' })).toHaveAttribute('width', '260');
  });

  test('leaves the words off when the slide asked for the shape alone', () => {
    render(<Blazon blazon="d'or au sautoir de gueules" language="french" showBlazon={false} />);
    expect(screen.queryByText("d'or au sautoir de gueules")).toBeNull();
    expect(screen.queryByText('Or a saltire gules.')).toBeNull();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  test('still answers to the blazon for whoever cannot see the arms', () => {
    render(<Blazon blazon="d'or au sautoir de gueules" language="french" showBlazon={false} />);
    // Left off the screen is not left unsaid: the arms carry the words for a
    // reader who is not looking at them.
    expect(screen.getByRole('img', { name: "d'or au sautoir de gueules" })).toBeInTheDocument();
  });

  test('says the words unless the slide says not to', () => {
    render(<Blazon blazon="d'or au sautoir de gueules" language="french" />);
    expect(screen.getByText("d'or au sautoir de gueules")).toBeInTheDocument();
    expect(screen.getByText('Or a saltire gules.')).toBeInTheDocument();
  });

  test('says a refusal whatever the slide asked for, there being nothing else to show', () => {
    render(<Blazon blazon="d'azur à la licorne" language="french" showBlazon={false} />);
    expect(screen.getByText(/Refused:/)).toBeInTheDocument();
  });

  test('says a refusal on the slide rather than drawing nothing', () => {
    render(<Blazon blazon="d'azur à la licorne" language="french" />);
    expect(screen.getByText(/Refused:/)).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });
});
