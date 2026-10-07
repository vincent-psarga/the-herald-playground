import { EnglishDivisionType } from '../../domain/translations/en/Divisions';
import { EnglishFurType } from '../../domain/translations/en/Furs';
import { EnglishChargeType } from '../../domain/translations/en/Charges';
import { EnglishModifiers } from '../../domain/translations/en/Modifiers';
import { EnglishStrewings, OF as SOWN_OF, SOWN } from '../../domain/translations/en/Strewings';
import { EnglishNumbers } from '../../domain/translations/en/Numbers';
import { EnglishOrdinaryType } from '../../domain/translations/en/Ordinaries';
import { EnglishTinctures } from '../../domain/translations/en/Tinctures';
import { EnglishVariationType, OF } from '../../domain/translations/en/Variations';
import { BlazonWording } from '../writer/BlazonWording';
import { EnglishLiquids } from '../../domain/translations/en/Liquids';
import { pouredIn } from '../../domain/translations/Liquids';
import { withArticle } from '../french/FrenchGrammar';
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
  // "gutté de sang", "three gouttes d'eau": Parker gives a distinct term for each
  // tincture of a drop, and they are French and keep their French article.
  pour: (type, tincture) => {
    const liquid = pouredIn(EnglishLiquids, type, tincture);
    return liquid === undefined ? undefined : withArticle(liquid);
  },
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
  conjunction: CONJUNCTION,
};
