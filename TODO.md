# Parsing

- Handle the disposition of charges (en chef, en orle, mal ordonnées)
- Grow the modifiers past "voided" and "pierced": alésé, and the rest
- Let a modifier take a tincture (eg: "Monsire Gerard SALVAYN, port d'argent; au cheif de sable deux molletts d'or, voydes vert--Roll, temp. ED. III.")
- Let an ordinary take a modifier, its own being lines drawn otherwise [#1](https://github.com/vincent-psarga/the-herald-playground/pull/1)
- Read what the shield itself bears under a ranked partition, which wants "sur le
  tout": in the ranked form a bearing after the last part is that part's, and an
  armorial that means the shield says so — «sur le tout : de gueules à un lion
  léopardé d'or» — though the armorial of the Plantagenets writes a shield's
  bordure after the last quarter and marks nothing
- Handle a semy of more than one figure ("semé alterné de tours et de fleurs de lys")
- Read a part covered with a pelt ("parti vairé d'or et de pourpre, et de
  gueules plain", which the armorial of the Round Table writes): a pelt is a
  pattern sized to what it covers, and the drawing carries one definition for
  the shield rather than one per part
- Read a part that is itself cut, which is a half parti or a quarter
  contre-écartelé: the model already holds it, a part being arms, and neither
  tongue is read there yet
- Read the noun after a rank, which the dictionaries write and the rolls here do
  not: "au 1 quartier", "aux premier et quatrième quartiers"
- Support for "shortcuts" (eg: "du même", "l'un dans l'autre" [#4](https://github.com/vincent-psarga/the-herald-playground/pull/4), "brochant sur le tout")
- Support for charges attributes (lampassé, armé etc)

# Display

- Draw a band that follows an outline inside a part of a divided field: a part's
  outline is its box, so a bordure borne on a part runs down the line the part
  was cut along — where heraldry ends it there, "hold-overs from the days of
  dimidiation ... which do not surround the shield but end at the line of
  partition" (Greaves) — and loses the curve at the base. Everything else laid in
  a part is measured against the part and drawn where it belongs
- Draw a part that is itself cut, and a part covered with a pelt: a cut part's
  second tincture is nowhere and neither is the line between them, and a pelt
  has no definition of its own — both parts are painted the one tincture their
  field is laid on. A part cut into pieces is drawn, its pieces measured against
  the part
- Scale a band to the part it is borne in: a band is drawn to a width of its own
  rather than to a share of its frame, so a cross borne in a quarter all but
  fills it — the quarter being a quarter of the shield and the cross still the
  width of one drawn on the whole of it
- Cross display seems too low
- Bends and saltire have a "weird" rendering - angles seem wrong.

# Documentation

- The conventions page owes two rules it cannot carry until a charged part can be
  drawn, every case showing arms that contradict their own blazon: where a part's
  bearings stand (before the conjunction they are the part's, after the second
  part they are the shield's), and that the rank is written only where the
  unranked form could not say what a part bears
- The vocabulary pages owe the ranks — "au premier", "au second", "deuxième", the
  Roman numerals, and the English "first" and "fourth" — which are read and appear
  on no page. They can be shown with parts that are plain tinctures, where the
  arms draw as they should and the written form is the unranked one, which is the
  convention itself on show
- Settle the wording of the ranks (charge, sub-ordinary, meuble), which the
  vocabulary page now has to name out loud
- Translate the vocabulary pages: the words are French and English, what they
  mean is written in English on both

# Armorials

- Allow search/filter
