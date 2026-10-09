import { FrenchCompony } from '../../domain/translations/fr/Compony';
import { FrenchDivisionType } from '../../domain/translations/fr/Divisions';
import { FrenchFurType } from '../../domain/translations/fr/Furs';
import { FrenchChargeType } from '../../domain/translations/fr/Charges';
import { FrenchCounterchanged } from '../../domain/translations/fr/Counterchanged';
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
  // "à la bordure de l'un à l'autre": the phrase stands where the tincture would
  // and agrees with nothing, naming the two halves rather than the band.
  counterchanged: FrenchCounterchanged,
  // "à la bordure componée de gueules et d'argent": the participle agrees with
  // the band as a modifier does, and the two tinctures follow it as a varied
  // field's follow its name.
  compony: FrenchCompony,
  strewings: FrenchStrewings,
  numbers: FrenchNumbers,
  introduce: withArticle,
  bear: bearing,
  vary: cutIn,
  // "au tourteau de gueules évidé", "à trois billettes d'or évidées": the
  // participle agrees with the word the charge comes back in, whichever gender
  // the blazon that was read had chosen for it.
  modify: agreeing,
  // "semé de billettes", "semé d'annelets": the same "de" a tincture is
  // introduced by, elided on the word's own terms.
  strew: (word) => `${SOWN.value} ${sownIn(word)}`,
  conjunction: CONJUNCTION,
};
