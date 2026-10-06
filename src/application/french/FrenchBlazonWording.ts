import { FrenchDivisionType } from '../../domain/translations/fr/Divisions';
import { FrenchFurType } from '../../domain/translations/fr/Furs';
import { FrenchAttributes } from '../../domain/translations/fr/Attributes';
import { FrenchChargeType } from '../../domain/translations/fr/Charges';
import { FrenchModifiers } from '../../domain/translations/fr/Modifiers';
import { FrenchStrewings, SOWN } from '../../domain/translations/fr/Strewings';
import { FrenchNumbers } from '../../domain/translations/fr/Numbers';
import { FrenchOrdinaryType } from '../../domain/translations/fr/Ordinaries';
import { FrenchOverAll } from '../../domain/translations/fr/OverAll';
import { FrenchTinctures } from '../../domain/translations/fr/Tinctures';
import { FrenchVariationType } from '../../domain/translations/fr/Variations';
import { FrenchWord } from '../../domain/translations/fr/FrenchWord';
import { BlazonWording } from '../writer/BlazonWording';
import {
  CONJUNCTION,
  agreeing,
  bearing,
  cutIn,
  ranked,
  sownIn,
  withArticle,
} from './FrenchGrammar';

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
  // "à la fasce de gueules brochant sur le tout": French says it after what it
  // is said of, last of all, and says it unchanged however many are borne — the
  // locution is invariable, and there is nothing here to agree with anything.
  overAll: (bearing) => `${bearing} ${FrenchOverAll.value}`,
  conjunction: CONJUNCTION,
  // "Parti, au premier d'azur à trois fleurs de lys d'or, au second d'hermine":
  // the rank is written where the unranked form could not say what a part bears.
  rank: ranked,
};
