import { EnglishDivisionType } from '../../domain/translations/en/Divisions';
import { EnglishFurType } from '../../domain/translations/en/Furs';
import { EnglishChargeType } from '../../domain/translations/en/Charges';
import { EnglishModifiers } from '../../domain/translations/en/Modifiers';
import { EnglishStrewings, OF as SOWN_OF, SOWN } from '../../domain/translations/en/Strewings';
import { EnglishNumbers } from '../../domain/translations/en/Numbers';
import { EnglishOrdinaryType } from '../../domain/translations/en/Ordinaries';
import { EnglishOverAll } from '../../domain/translations/en/OverAll';
import { EnglishTinctures } from '../../domain/translations/en/Tinctures';
import { EnglishVariationType, OF } from '../../domain/translations/en/Variations';
import { BlazonWording } from '../writer/BlazonWording';
import { CONJUNCTION, bearing } from './EnglishGrammar';

export const EnglishBlazonWording: BlazonWording = {
  tinctures: EnglishTinctures,
  divisions: EnglishDivisionType,
  variations: EnglishVariationType,
  furs: EnglishFurType,
  ordinaries: EnglishOrdinaryType,
  charges: EnglishChargeType,
  modifiers: EnglishModifiers,
  strewings: EnglishStrewings,
  numbers: EnglishNumbers,
  // English names a tincture bare: "Azure.", "Per pale azure and or."
  introduce: (word) => word.value,
  bear: bearing,
  // English counts the pieces of a varied field wherever it can: Greaves' Guide
  // to Blazonry, published by the Royal Heraldry Society of Canada, uses "terms
  // like 'barry', 'paly' and 'bendy', always stating the number and the tinctures
  // involved". So the usual number is written like any other and nothing is left
  // to be understood.
  vary: (word, tinctures, pieces) => `${word.value} ${OF} ${pieces} ${tinctures}`,
  // "a lozenge or voided", "three billets sable voided": English agrees the word
  // with nothing, so it is written as it stands wherever it stands.
  modify: (_, modifier) => modifier.value,
  // "semy of billets": the English spelling of the participle, though both it
  // and the French one are read.
  strew: (word) => `${SOWN[0].value} ${SOWN_OF} ${word.plural}`,
  // "over all a bend gules": English says it in front of what it is said of,
  // where French says its own word after. Parker writes it exactly so.
  overAll: (bearing) => `${EnglishOverAll.value} ${bearing}`,
  conjunction: CONJUNCTION,
};
