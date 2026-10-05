/**
 * The modifiers: what a blazon says has been done to something the field bears,
 * which changes how the figure is drawn and nothing else about it.
 *
 * A modifier is not a term of its own. A voided lozenge is a lozenge — the same
 * charge, in the same tincture, borne in the same number — so it is carried
 * beside the term rather than listed among the terms, and a vocabulary that made
 * a charge of it would have to make another one of every charge that can be
 * voided. An indented fess answers the same way: the band is the fess it always
 * was, drawn along a line with teeth in it.
 *
 * A band and a charge take different ones, and neither takes the other's: a
 * charge is a figure and what is done to it is done to its middle, where a band
 * is named after a line and what is done to it is done to that line. Which of
 * them each will take is its own business and is declared with it — an annulet is
 * a roundel voided already, and voiding one again says nothing a blazon could
 * draw; a fess has no middle to take out.
 */
export enum Modifier {
  /**
   * The middle taken out, so that the field shows through and what is left of
   * the charge is the outline of it: "a lozenge voided", "à la losange vidée".
   */
  voided = 'Modifier.voided',
  /**
   * A hole punched through it, round, and smaller than the charge: "a billet
   * pierced", "à la billette percée".
   *
   * It is not voiding said another way, though the armorials file the two words
   * together — blason-armoiries gives "percées" under Vidé, as the word to use of
   * the billettes. What is left of a voided charge is its own outline, the hole
   * being the charge shrunk; what is left of a pierced one is the charge with a
   * round bite out of the middle, and no outline anywhere. Two drawings, so two
   * terms: a blazon that must be drawn differently said something different.
   *
   * Heraldry keeps the distinction where it matters most. A lozenge voided is a
   * mascle and a lozenge pierced is a rustre, and no armorial has ever taken one
   * for the other.
   *
   * The shape of the hole is round unless a blazon says otherwise — "the shape of
   * the hole should be stated, e.g. square-pierced, lozenge-pierced" — and no
   * blazon can say otherwise here yet, so round is all that is drawn.
   */
  pierced = 'Modifier.pierced',
  /**
   * The edges of a band cut into teeth rather than run straight: "a fess
   * indented", "à la fasce dentelée".
   *
   * It is the first of the modified lines, which are what a blazon says of a
   * band where it says of a charge that the middle is out. Parker has it
   * "notched after the manner of dancetty, but with smaller teeth", and says it
   * "is applied most frequently to the fesse, though the bend, the pale, and the
   * chevron are sometimes thus treated" — which is the list the ordinaries
   * declare, along with the mirror of the bend, and the chief and the bordure,
   * whose single free edge is a line like any other.
   *
   * A band with two free edges keeps its width, both being cut alike; a band
   * with one is deeper where a tooth reaches and shallower where a notch does,
   * the shield's own outline being no line a blazon may modify.
   *
   * The teeth are what parts it from the dancetty, which is the same line drawn
   * larger and fewer — "differing from indented only in the indentations, being
   * larger in size, and consequently fewer in number". Two drawings, so two
   * terms, and the vivré is a third: the lines differ in how big the tooth is
   * and how sharp its point, and in nothing else at all.
   */
  indented = 'Modifier.indented',
  /**
   * The same teeth cut larger, and fewer of them: "a fess dancetty", "à la fasce
   * denchée".
   *
   * Parker has it "a zigzag line of partition, differing from indented only in
   * the indentations, being larger in size, and consequently fewer in number",
   * and draws three of them across a fess where the indented fess has half a
   * dozen. Nothing else parts the two — same band, same edges, same teeth — so a
   * blazon that cared which it got had to say which, and both tongues give it
   * two words to say it with.
   *
   * French measures it the same way and under its own pair. Denché is said of
   * the pieces "dont les bords sont formés en dents de scie", and "on se sert du
   * mot dentelé quand les dents de la bordure sont de petites dimensions": so
   * denché is the great-toothed one and dentelé the small, which is the pair
   * English spells dancetty and indented. Parker glosses both of his with
   * denché, which is the looser of the two readings and not the one taken here —
   * a blazon asking for great teeth is answered with great teeth.
   */
  dancetty = 'Modifier.dancetty',
  /**
   * The great teeth brought to a right angle instead of a sharper one: "à la
   * bande vivrée", "a bend vivré".
   *
   * It is the dancetty with the point of its tooth opened out. Parker:
   * "practically equivalent to dancetty, except that the indentations are more
   * open, i.e. the lines forming them produce right angles, instead of the acute
   * angles which are usually represented in the drawing of indented or
   * dancetty". A third angle, so a third drawing, so a third term.
   *
   * What is square is the angle at the point and not the tooth. Parker adds that
   * "when applied to the bend or chevron, the appearance of rectangular steps is
   * produced" — which is what a right-angled zigzag looks like on a band that
   * runs at a slant, each limb standing upright or lying flat, so that the band
   * climbs like a staircase. Across a fess the same cut is a zigzag and nothing
   * stair-like at all.
   *
   * The band keeps the width it always had, the steps carrying both its edges
   * along together. That is what the French dictionaries use to part the vivré
   * band from the vivre — a narrow angular fillet borne as a charge of its own —
   * "en ce qu'elles ont leur largeur ordinaire, qui est de deux parties des sept
   * de la largeur de l'écu". That fillet is another thing, and is not read here.
   */
  vivre = 'Modifier.vivre',
  /**
   * The edges cut into small round hollows, with the points between them
   * standing out into the field: "a bend engrailed", "à la bande engrêlée".
   *
   * It is the fourth modified line and the first that is not a saw. Parker has
   * it "the cutting of the edge of a border, bend, or fesse, &c., into small
   * semicircular indents, the teeth or points of which being outward enter the
   * field", and the French dictionary parts it from the saw-toothed line by
   * exactly the hollow: the engrêlé has "petites dents dont les intervalles sont
   * creux et arrondis ; c’est en cela que l’Engrêlé diffère du dentelé dont les
   * intervalles sont à angles droits, comme des dents de scie".
   *
   * The hollows all bite the same way, which is what makes the points points. A
   * saw-toothed line is a zigzag standing evenly about the line it cuts, so
   * either side of it may be called the outside and the band keeps its width; an
   * engrailed band is hollowed inwards from both its edges at once, so it is
   * widest at the points and narrowest between them. Parker says as much of the
   * blazon — "when a fesse chevron or bend is blazoned engrailed, it implies
   * that the ordinary is to be so on both sides" — which is why the word needs
   * to be told which side of an edge the band lies on, where the three saws
   * never did.
   *
   * Which way the hollows bite is the whole of the difference between this line
   * and the invected, where "the points are inwards". That is a second drawing
   * and would be a second term, and no blazon here asks for it yet.
   */
  engrailed = 'Modifier.engrailed',
}

/**
 * The modified lines: what a blazon says of the line a band is named after,
 * rather than of anything taken out of a charge's middle.
 *
 * They are one family because they are cut by one walk along the same edges, and
 * what differs is the shape left behind — so a band that can be cut at all can
 * be cut by any of them, and the bands declare the family rather than listing
 * its members. A line that some band could not take would have to be listed
 * apart, and none of the four is: the dictionaries write the whole family of the
 * same pieces.
 *
 * Three of them are saws and differ in how big the tooth is and how sharp its
 * point and in nothing else at all. The fourth is cut round instead, which is
 * another drawing and not another family.
 */
export const LINES: readonly Modifier[] = [
  Modifier.indented,
  Modifier.dancetty,
  Modifier.vivre,
  Modifier.engrailed,
];
