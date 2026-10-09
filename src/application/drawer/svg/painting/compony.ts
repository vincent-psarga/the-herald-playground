import { Frame, Ink, Painter } from '../Ground';
import { Shape } from '../shapes/Shape';
import { clipped } from './clipped';
import { outlining } from './inked';
import { laid } from './laid';
import { over } from './over';
import { plain } from './plain';

/**
 * A figure cut into compons of two inks: painted the first entire, every other
 * compon laid over it in the second, and the pair cut to the figure.
 *
 * The compons are laid as shapes of their own rather than as the figure split,
 * so that a colouring which rules its tinctures outlines every one of them and
 * the line between two compons is drawn where they meet: ruling against ruling
 * reads as neither. The figure's own outline is laid first and under
 * everything, as for a figure painted in one ink.
 */
export const compony =
  (
    shapes: (frame: Frame) => readonly Shape[],
    compons: (frame: Frame) => readonly Shape[],
    first: Ink,
    second: Ink
  ): Painter =>
  (ground) => {
    const figure = shapes(ground.frame);
    return (
      outlining(figure, ground) + clipped(figure, over(plain(first), laid(compons, second)))(ground)
    );
  };
