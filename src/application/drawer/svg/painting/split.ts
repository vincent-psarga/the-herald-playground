import { Frame, Ink, Painter } from '../Ground';
import { Shape } from '../shapes/Shape';
import { inked } from './inked';

/**
 * The ground cut into pieces, each in an ink of its own.
 *
 * The pieces are drawn past the edges they meet and left to the clip path, so
 * each line keeps its own angle instead of being fitted to whatever curve the
 * frame has.
 *
 * Each piece is outlined on its own account rather than all of them together,
 * which is what puts a line along every cut where the colouring draws in marks:
 * a piece is laid over the ones before it, and its outline over their fills.
 *
 * However many pieces there are, rather than a pair: a line drawn once cuts the
 * ground in two and a line that crosses itself cuts it in four, and nothing here
 * has to know which — the inks arrive one to a piece and are used in that order.
 * A piece with no ink to go with it is not painted, which is a caller that has
 * miscounted rather than anything this can put right.
 */
export const split =
  (pieces: (frame: Frame) => readonly Shape[], inks: readonly Ink[]): Painter =>
  (ground) =>
    pieces(ground.frame)
      .slice(0, inks.length)
      .map((piece, which) => inked([piece], inks[which])(ground))
      .join('');
