export enum Metals {
  or = 'Metals.or',
  argent = 'Metals.argent',
}

export enum Colours {
  azure = 'Colours.azure',
  gules = 'Colours.gules',
  sable = 'Colours.sable',
  vert = 'Colours.vert',
  purpure = 'Colours.purpure',
}

/**
 * Neither metal nor colour but a rank of their own, being the patterned pelts a
 * field may be covered with.
 */
export enum Furs {
  ermine = 'Furs.ermine',
  vair = 'Furs.vair',
}

export type Tincture = Metals | Colours | Furs;

/**
 * The tinctures that are a shade, which is every one but the furs.
 *
 * A colouring answers for these and no others. A fur is a figure rather than a
 * shade — an ermine spot is an ermine spot in every armorial, where the red of
 * gules is a convention and nothing more — so a fur is drawn rather than
 * painted, and what a colouring contributes to one is only the shades its
 * figures are cut from.
 */
export type Shade = Metals | Colours;

/**
 * Each rank as a list of its own.
 *
 * A word may be borne in one rank and refuse another — a besant is a roundel in
 * metal, a tourteau one in colour — so the vocabulary names the rank it takes
 * rather than listing its members over again.
 */
export const METALS: readonly Metals[] = Object.values(Metals);
export const COLOURS: readonly Colours[] = Object.values(Colours);
export const PELTS: readonly Furs[] = Object.values(Furs);

export const SHADES: readonly Shade[] = [...METALS, ...COLOURS];

const FURRED: ReadonlySet<string> = new Set(PELTS);

export function isFur(tincture: Tincture): tincture is Furs {
  return FURRED.has(tincture);
}

export const TINCTURES: readonly Tincture[] = [...SHADES, ...PELTS];

export function isTincture(value: string): value is Tincture {
  return (TINCTURES as readonly string[]).includes(value);
}
