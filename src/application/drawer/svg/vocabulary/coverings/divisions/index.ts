import { DivisionType, FieldType } from '../../../../../../domain/models/Field';
import { DivisionFigure } from '../../Figures';
import { bend } from './bend';
import { bendSinister } from './bendSinister';
import { cross } from './cross';
import { fess } from './fess';
import { pale } from './pale';
import { saltire } from './saltire';

/**
 * Where the two halves of a divided field lie, before the frame clips them.
 *
 * Being keyed on DivisionType, a partition added to the vocabulary breaks this
 * until it is given a shape.
 */
export const DIVISIONS: Record<DivisionType, DivisionFigure> = {
  [FieldType.pale]: pale,
  [FieldType.fess]: fess,
  [FieldType.bend]: bend,
  [FieldType.bendSinister]: bendSinister,
  [FieldType.cross]: cross,
  [FieldType.saltire]: saltire,
};
