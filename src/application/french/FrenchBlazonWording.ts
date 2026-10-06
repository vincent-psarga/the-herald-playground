import { FrenchDivisionType } from '../../domain/translations/fr/Divisions';
import { FrenchFurType } from '../../domain/translations/fr/Furs';
import { FrenchAttributes } from '../../domain/translations/fr/Attributes';
import { FrenchChargeType } from '../../domain/translations/fr/Charges';
import { FrenchModifiers } from '../../domain/translations/fr/Modifiers';
import { FrenchStrewings, SOWN } from '../../domain/translations/fr/Strewings';
import { FrenchNumbers } from '../../domain/translations/fr/Numbers';
import { FrenchOrdinaryType } from '../../domain/translations/fr/Ordinaries';
import { FrenchTinctures } from '../../domain/translations/fr/Tinctures';
import { FrenchVariationType } from '../../domain/translations/fr/Variations';
import { FrenchWord } from '../../domain/translations/fr/FrenchWord';
import { BlazonWording } from '../writer/BlazonWording';
import { CONJUNCTION, agreeing, bearing, cutIn, sownIn, withArticle } from './FrenchGrammar';

export const FrenchBlazonWording: BlazonWording<FrenchWord> = {
  tinctures: FrenchTinctures,
  divisions: FrenchDivisionType,
  variations: FrenchVariationType,
  furs: FrenchFurType,
  ordinaries: FrenchOrdinaryType,
  charges: FrenchChargeType,
  modifiers: FrenchModifiers,
  attributes: FrenchAttributes,
  strewings: FrenchStrewings,
  numbers: FrenchNumbers,
  introduce: withArticle,
  bear: bearing,
  vary: cutIn,
  // "au tourteau de gueules évidé", "à trois billettes d'or évidées": the
  // participle agrees with the word the charge comes back in, whichever gender
  // the blazon that was read had chosen for it.
  modify: agreeing,
  // "à l'anneau d'or chatonné d'argent": a participle like the modifier, agreeing
  // with the word the charge comes back in, and the part's tincture after it
  // under the same article any tincture takes.
  paint: agreeing,
  // "semé de billettes", "semé d'annelets": the same "de" a tincture is
  // introduced by, elided on the word's own terms.
  strew: (word) => `${SOWN.value} ${sownIn(word)}`,
  conjunction: CONJUNCTION,
};
