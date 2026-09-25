import { Frame, Ink, Painter } from '../Ground';
import { Shape } from '../shapes/Shape';
import { clipped } from './clipped';
import { outlining } from './inked';
import { split } from './split';

/**
 * A figure painted out of the ground it is laid on rather than out of an ink of
 * its own: the ground cut in two as it already is, the two inks swapped, and the
 * pair cut again to the figure. Every part of the figure is then painted the
 * opposite of what lies under it — which is the whole of the rule, and it makes
 * no difference whether the figure crosses the line or lies to one side of it.
 *
 * The ground cut to the figure rather than the figure painted twice, because the
 * line between the two inks has to be drawn where it falls inside the figure: a
 * colouring that rules its tinctures reads ruling against ruling as neither, and
 * a split already draws that line where its halves meet. Painted the other way
 * round — the figure filled with one ink and half of it filled over — the two
 * fills would meet along the cut with nothing between them.
 *
 * The figure's own outline is laid first and under everything, exactly as a
 * figure painted in one ink lays it. What is left is a line round the figure and
 * a line along the cut inside it, and nothing at all where the colouring draws
 * in colour and wants neither.
 */
export const countered =
  (
    shapes: (frame: Frame) => readonly Shape[],
    halves: (frame: Frame) => readonly [Shape, Shape],
    first: Ink,
    second: Ink
  ): Painter =>
  (ground) => {
    const figure = shapes(ground.frame);
    // Swapped: what lies over the half in chief is painted the ink of the half
    // in base, and what lies over the half in base the ink of the half in chief.
    return outlining(figure, ground) + clipped(figure, split(halves, second, first))(ground);
  };
