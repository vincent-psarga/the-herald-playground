import { Attribute } from '../../../../../domain/models/Attributes';
import { diamond } from '../../shapes/diamond';
import { ring } from '../../shapes/ring';
import { ChargeFigure } from '../Figures';
import { charge } from './Charge';
import { Spot } from './disposition';

/** How much of an annulet is ring rather than the field it encloses. */
const BAND = 0.22;

/** How wide the stone of a gem-ring stands, against the room the charge has. */
const STONE_ACROSS = 0.38;

/** How tall it stands, cut to a point above and below as a gem is. */
const STONE_TALL = 0.34;

/** How thick the ring is drawn, which both drawings are measured off. */
const bandOf = (size: number) => Math.round(size * BAND);

/** The hoop: a plain ring, and what a gem-ring is a ring of. */
const hoop = ({ x, y, size }: Spot) => ring(x, y, (size - bandOf(size)) / 2, bandOf(size));

/**
 * The stone, resting on the inner edge of the hoop in chief and standing proud
 * of it, which is where a finger-ring carries one.
 *
 * It stands taller than the room the charge was given, by about a tenth. A
 * charge takes two thirds of its own cell and the rest is the space around it,
 * so the stone has room to stand in however many are borne.
 */
const stone = ({ x, y, size }: Spot) => {
  const across = Math.round((size * STONE_ACROSS) / 2);
  const tall = Math.round((size * STONE_TALL) / 2);
  return diamond(x, y - size / 2 + bandOf(size) - tall, across, tall);
};

/**
 * A plain ring: what it encloses is the field showing through, not its own
 * tincture.
 *
 * Stoned, it keeps the hoop and gains a stone set on it in chief — a gem cut to
 * a point above and below, standing where a finger-ring carries one. The stone
 * is a part and not a second charge, so it is drawn over the hoop rather than
 * beside it, and the hoop is the same ring either way.
 */
export const annulet: ChargeFigure = charge(hoop, {}, { [Attribute.stoned]: stone });
