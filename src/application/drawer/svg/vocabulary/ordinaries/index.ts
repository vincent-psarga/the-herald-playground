import { OrdinaryType } from '../../../../../domain/models/Ordinary';
import { OrdinaryFigure } from '../Figures';
import { barGemel } from './barGemel';
import { bend } from './bend';
import { bendSinister } from './bendSinister';
import { bordure } from './bordure';
import { chevron } from './chevron';
import { chief } from './chief';
import { cross } from './cross';
import { fess } from './fess';
import { pale } from './pale';
import { saltire } from './saltire';

/**
 * The band, or bands, each ordinary lays over the field, before the frame clips
 * them.
 *
 * Every one is drawn past the edges it meets and left to the clip path, so the
 * band keeps its own width and angle instead of being fitted to the frame's
 * curve. Being keyed on OrdinaryType, an ordinary added to the vocabulary breaks
 * this until it is given a shape.
 */
export const ORDINARIES: Record<OrdinaryType, OrdinaryFigure> = {
  [OrdinaryType.chief]: chief,
  [OrdinaryType.pale]: pale,
  [OrdinaryType.fess]: fess,
  [OrdinaryType.barGemel]: barGemel,
  [OrdinaryType.bend]: bend,
  [OrdinaryType.bendSinister]: bendSinister,
  [OrdinaryType.chevron]: chevron,
  [OrdinaryType.cross]: cross,
  [OrdinaryType.saltire]: saltire,
  [OrdinaryType.bordure]: bordure,
};
