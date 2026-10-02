# Parsing

- Handle line modifications (indented, embattled etc)
- Handle the disposition of charges (en chef, en orle, mal ordonnées). Counterchanging
  shows what it costs: "coupé d'or et de sable à deux losanges de l'un à l'autre"
  wants one lozenge in each half, and the two are drawn side by side across the line
- Grow the modifiers past "voided" and "pierced": alésé, and the rest
- Let a modifier take a tincture (eg: "Monsire Gerard SALVAYN, port d'argent; au cheif de sable deux molletts d'or, voydes vert--Roll, temp. ED. III.")
- Let an ordinary take a modifier, its own being lines drawn otherwise [#1](https://github.com/vincent-psarga/the-herald-playground/pull/1)
- Allow complex partition (eg: "per fess azur a bend or and argent")
- Handle a semy of more than one figure ("semé alterné de tours et de fleurs de lys")
- Sow a divided field, once the blazon can say which half was sown [#2](https://github.com/vincent-psarga/the-herald-playground/pull/2)
- Support for "shortcuts" (eg: "du même", "l'un dans l'autre" [#4](https://github.com/vincent-psarga/the-herald-playground/pull/4), "brochant sur le tout")
- Support for charges attributes (lampassé, armé etc)
- Quarter a field beyond two tinctures: the quartering that marshals a coat to
  each quarter ("écartelé : aux 1 et 4 ..., aux 2 et 3 ..."), which needs a field
  able to hold a coat
- Counterchange a varied field by a partition line ("barry of six, sable and or,
  per pale counterchanged"), which is what Parker, Fox-Davies and Wikipedia all
  document under counterchanging a variation — a complex partition rather than a
  figure laid on the field. A band or a charge counterchanged over a varied field
  is a different thing, drawn easily enough and asked for by no source found so
  far, so it waits for an armorial that writes one

# Display

- Cross display seems too low
- Bends and saltire have a "weird" rendering - angles seem wrong.

# Documentation

- Settle the wording of the ranks (charge, sub-ordinary, meuble), which the
  vocabulary page now has to name out loud
- Translate the vocabulary pages: the words are French and English, what they
  mean is written in English on both

# Armorials

- Allow search/filter
