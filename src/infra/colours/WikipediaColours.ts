import { Colours, Metals, Shade } from '../../domain/models/Tinctures';
import { ColorModel, Paint } from '../../domain/services/IBlazonDrawer';

/**
 * The shades Wikipedia paints its tincture table with, at
 * https://en.wikipedia.org/wiki/Tincture_(heraldry).
 *
 * That table names CSS colours rather than hex codes, so each one is given here
 * as the hex it resolves to. They are a convention and nothing more: heraldry
 * fixes no shade, and an armorist is free to choose their own.
 *
 * The furs are not among them. A fur is a figure repeated over the field rather
 * than a shade, and the figure is the drawer's: what this contributes to an
 * ermine is the argent it is strewn on and the sable it is strewn with, both of
 * which are here already.
 */
const TINCTURES: Record<Shade, Paint> = {
  [Metals.argent]: '#ffffff', // white
  [Metals.or]: '#ffd700', // gold
  [Colours.azure]: '#0000ff', // blue
  [Colours.gules]: '#ff0000', // red
  [Colours.sable]: '#000000', // black
  [Colours.vert]: '#008000', // green
  [Colours.purpure]: '#800080', // purple
};

/**
 * This colouring draws in no marks at all, and so has no ink: its tinctures are
 * colours and colours tell themselves apart. An ermine spot is simply sable, and
 * bells cut from two colours need no line between them.
 */
export const WikipediaColours: ColorModel = TINCTURES;
