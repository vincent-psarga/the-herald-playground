import { parker } from '../Sources';
import { Word } from '../Word';

/**
 * The words English says a band or a charge is laid over the rest by: "Barry of
 * six argent and azure, over all a bend gules".
 *
 * It names no term and draws no figure — what it says is which of two things
 * already named is on top — so there is no vocabulary keyed on a term to hold
 * it, and it is kept here as the French word for the same thing is.
 *
 * English puts it before what it is said of, where French puts its own word
 * after. That is the one thing the two tongues disagree about here, and it is
 * the grammar's to know rather than the word's.
 *
 * It agrees with nothing, standing unchanged before one band and before three.
 *
 * What is not read: "surtout" and "sur-le-tout", which Parker names in the same
 * breath. In English those are the escutcheon borne over the quarters, which is
 * a coat upon a coat, and this vocabulary holds no field that can carry one:
 * reading them would promise a drawing that is not drawn.
 */
export const EnglishOverAll = new Word('over all', {
  value:
    'Said of a band or a charge laid over everything else the field bears, and written before it where French writes its own word after: Barry of six argent and azure, over all a bend gules. What is named last is over the rest in any case, and Parker says as much — over a particoloured field the words "are understood, and therefore may be omitted, but in the other examples they are almost indispensable". So the word earns its keep where what covers is named before what it covers.',
  sources: [parker('Over all')],
});
