import { Attribute } from '../../../../domain/models/Attributes';
import { Modifier } from '../../../../domain/models/Modifier';
import { Frame } from '../Ground';
import { Shape } from '../shapes/Shape';
import { Tile } from '../shapes/tile';
import { Spot } from './charges/disposition';

/*
 * What each kind of term contributes to a drawing.
 *
 * Every one of them is a record with a named member rather than a bare
 * function, because the day a band can be charged it will have to answer for
 * more than its own paint: three mullets on a bend are clipped to the band and
 * arranged along its axis, so the bend must offer the frame it carries as well
 * as the shapes it lays. A record grows that member; a bare function would have
 * to become one.
 *
 * Every member takes the frame it is drawn in rather than measuring itself
 * against the drawing, so that nothing here has to change the day a quarter is
 * a frame of its own.
 */

/**
 * One part of a divided field: the whole of what it covers, and the room it
 * gives whatever it bears.
 *
 * What it covers is a path rather than a shape, being asked for twice over: once
 * to paint the part's own tincture, and once to cut off whatever the part carries
 * at the line.
 */
export type FieldPart = {
  readonly covers: string;
  /** The frame whatever the part bears is drawn against, in the part's own coordinates. */
  readonly room: Frame;
  /** Where that room sits in the frame the field was cut from. */
  readonly at: readonly [x: number, y: number];
};

/**
 * A field cut along a line, part by part, the part in chief first — the upper,
 * or the one at dexter where two stand side by side.
 *
 * As many as the line leaves rather than a fixed pair: a line drawn once leaves
 * two and a line that crosses itself leaves four, and the drawing is the one
 * place that difference shows. How many there should be is the model's to say,
 * so what is returned here is checked against it rather than trusted.
 */
export type DivisionFigure = {
  readonly parts: (frame: Frame) => readonly FieldPart[];
};

/**
 * A field cut along one line over and over. Half the pieces are drawn — the
 * field is painted the first tincture entire and these are laid over it in the
 * second — so what is returned is the shapes to lay, not every piece.
 */
export type VariationFigure = {
  readonly pieces: (frame: Frame, pieces: number) => readonly Shape[];
};

/**
 * A pelt: a figure tiled over a ground, cut from two paints rather than two
 * tinctures.
 *
 * It is handed the paints already resolved, because a pelt may be cut from a
 * fur as readily as from a colour — "vairé d'hermine et de gueules" — and
 * resolving one is the tinctures' business rather than the pelt's.
 */
export type FurredFigure = {
  readonly pelt: (frame: Frame, ground: string, figure: string, edge?: string) => Tile;
};

/**
 * Something the field bears — a band or a charge, which are drawn alike however
 * differently they are placed. Each is asked how many are borne, and the ones
 * borne but once are entitled to ignore the answer: a chief is the top of the
 * shield and there is one of those.
 */
export type BorneFigure = {
  readonly shapes: (frame: Frame, count: number) => readonly Shape[];
};

/**
 * A band, which a blazon modifies by the line it is drawn along rather than by
 * anything taken out of its middle: a fess indented is the fess it always was,
 * its edges cut into teeth.
 *
 * What a modified line leaves is a band in its own right and not a shape: it
 * lies where the plain one would lie, in the same number and the same width, so
 * what is held here is a figure and the rest of the drawing never learns that
 * there was a modifier at all.
 */
export type OrdinaryFigure = BorneFigure & {
  /**
   * The same band as each modifier draws it, for the modifiers it may be drawn
   * under, and empty for the bands that take none.
   */
  readonly modified: Readonly<Partial<Record<Modifier, CutBand>>>;
};

/**
 * A band drawn along a modified line, which is two drawings rather than one: the
 * whole of the cut band, and the band inside the cut.
 *
 * The second is there because a blazon may paint the line in a tincture of its
 * own — "à la bande de gueules engrêlée de sable" — and what is painted is the
 * part of the band the line added. So the cut band is laid in the line's
 * tincture and this is laid over it in the band's, the two meeting at the
 * notches, where the cut comes back to the band it was cut in.
 *
 * A band whose line was given no tincture never asks for it: the whole of the
 * cut band is painted in the one tincture and there is nothing to lay over
 * anything.
 */
export type CutBand = BorneFigure & {
  readonly within: (frame: Frame, count: number) => readonly Shape[];
};

/**
 * A charge, which is the one kind of borne figure a field may also be sown with.
 *
 * It answers for what it looks like at a single spot, and the dispositions
 * answer for where the spots are — a counted few ranged in ranks, or a lattice
 * of small ones covering the field. A band has no such member: a semy of fesses
 * is a barry, and heraldry has a word for that already.
 */
export type ChargeFigure = BorneFigure & {
  readonly at: (spot: Spot) => Shape;
  /** The figures of a semy: small, past counting, and running off every edge. */
  readonly strewn: (frame: Frame) => readonly Shape[];
  /**
   * The same charge as each modifier leaves it, for the modifiers it may be
   * borne under, and empty for the charges that take none.
   *
   * What a modifier leaves is a charge in its own right and not a shape: it
   * stands where the plain one would stand, in the same number, and is sown the
   * same way — a voided lozenge is a lozenge in everything but the hole in it.
   * So what is held here is a figure, and the rest of the drawing never learns
   * that there was a modifier at all.
   */
  readonly modified: Readonly<Partial<Record<Modifier, ChargeFigure>>>;
  /**
   * The parts of the figure a blazon may paint on their own, for the attributes
   * it may be borne with, and empty for the charges that have none.
   *
   * A part is not the charge as an attribute leaves it: the charge is drawn
   * entire and the part is drawn over it in a tincture of its own, which is what
   * makes a gem-ring one figure in two paints rather than a ring and a gem
   * beside it. So what is held here is the part alone, laid at the same spots
   * and in the same number as the figure it sits on.
   *
   * Whether the figure draws the part when nothing paints it is the figure's own
   * to settle, and the two answers are both right. A beast has claws whatever a
   * blazon says of them, so they are drawn with it and in its tincture, and
   * armed paints over what was there. A ring has no stone until something says
   * there is one, so the plain figure draws none and stoned adds it. Naming the
   * part is the same either way; what differs is what it was named against.
   */
  readonly parts: Readonly<Partial<Record<Attribute, BorneFigure>>>;
  /**
   * The marks the figure is modelled by, for the figures that are modelled at
   * all, and nothing for the ones that are not.
   *
   * A plain shape needs none: a billet is a rectangle and there is nothing in it
   * to be told from anything else. A beast is a tangle of limbs that pass behind
   * one another, and painted in one flat tincture it reads as a blot — so the
   * folio it was traced from paints it in two, and these are the marks of the
   * second. They are laid last of all and in no tincture of the blazon's, being
   * a fact about drawing beasts rather than about what the blazon said.
   */
  readonly modelling?: (frame: Frame, count: number) => readonly Shape[];
};
