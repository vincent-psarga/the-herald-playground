import { Armorial } from '../../src/domain/models/Armorial';
import { Languages } from '../../src/domain/models/Languages';

/**
 * The knights of the Round Table, copied from the French Wikipedia armorial.
 * Their arms are imaginary — attributed by later heralds to men who never bore
 * them — which makes them no less a test of the vocabulary: whoever wrote them
 * was writing blazon, and owed the parser nothing.
 *
 * One source is named for the whole roll, every entry coming from the same
 * page. Where a knight is given a second coat the first is kept, and the
 * descriptions the source hangs beside a name — whose son he is, what else he
 * was called — are left out, the name alone being the entry.
 */
export const TableRondeArmorial: Armorial = {
  name: 'Chevaliers de la Table ronde',
  slug: 'table-ronde',
  language: Languages.fr,
  licence: 'CC BY-SA 4.0',
  source: {
    title: 'Wikipédia, Armorial des chevaliers de la Table ronde',
    url: 'https://fr.wikipedia.org/wiki/Armorial_des_chevaliers_de_la_Table_ronde',
    language: Languages.fr,
  },
  entries: [
    {
      name: 'Abandain le Fortuné',
      slug: 'abandain-le-fortune',
      blazon: "D'argent à l'écusson de gueules.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Armes_imaginaires_de_Abandain_le_Fortun%C3%A9.svg/120px-Armes_imaginaires_de_Abandain_le_Fortun%C3%A9.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Abilan du Désert',
      slug: 'abilan-du-desert',
      blazon: "De sable à un rais d'escarboucle d'or.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Blason_imaginaire_d%27Abilan_du_D%C3%A9sert.svg/120px-Blason_imaginaire_d%27Abilan_du_D%C3%A9sert.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: "Acostant l'Aduré",
      slug: 'acostant-l-adure',
      blazon: "D'or à la fasce d'azur.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Armes_imaginaires_de_Acostant_l%27Adur%C3%A9.svg/120px-Armes_imaginaires_de_Acostant_l%27Adur%C3%A9.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Agloval de Galles',
      slug: 'agloval-de-galles',
      blazon:
        "De pourpre semé de croisettes d'or, au léopard d'argent armé et lampassé de gueules brochant sur le tout.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Blason_imaginaire_d%27Agloval_de_Galles.svg/120px-Blason_imaginaire_d%27Agloval_de_Galles.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: "Agravain l'Orgueilleux",
      slug: 'agravain-l-orgueilleux',
      blazon:
        'De pourpre à l’aigle bicéphale d’or membrée et becquée de gueules, à la fasce de sinople brochant.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Blason_Agravain.svg/120px-Blason_Agravain.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Agricor le Beau Géant',
      slug: 'agricor-le-beau-geant',
      blazon: "D'hermine plain.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Blason_imaginaire_d%27Agricor_le_Beau_G%C3%A9ant.svg/120px-Blason_imaginaire_d%27Agricor_le_Beau_G%C3%A9ant.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Aguisant',
      slug: 'aguisant',
      blazon:
        "D'argent au lion de gueules armé et lampassé de sable, à une cordelière de gueules à l'entour.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Blason_imaginaire_d%27Aguisant.svg/120px-Blason_imaginaire_d%27Aguisant.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Aiglin des Vaus',
      slug: 'aiglin-des-vaus',
      blazon: "De gueules à la fasce coupée-crénelée d'or et de sable.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Blason_imaginaire_d%27Aiglin_des_Vaus.svg/120px-Blason_imaginaire_d%27Aiglin_des_Vaus.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Aliblel',
      slug: 'aliblel',
      blazon: "Parti d'azur à six macles d'argent, et d'hermine plain",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Blason_imaginaire_d%27Aliblel.svg/120px-Blason_imaginaire_d%27Aliblel.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: "Alixandre l'Orphelin",
      slug: 'alixandre-l-orphelin',
      blazon: "De sinople au lion d'argent.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Blason_imaginaire_d%27Alixandre_l%27Orphelin.svg/120px-Blason_imaginaire_d%27Alixandre_l%27Orphelin.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Amant le Bel Jouteur',
      slug: 'amant-le-bel-jouteur',
      blazon: "De sable au visage de femme de carnation chevelée d'or.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Blason_imaginaire_Amant_le_Bel_Jouteur.svg/120px-Blason_imaginaire_Amant_le_Bel_Jouteur.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Andeliz le Roux',
      slug: 'andeliz-le-roux',
      blazon: "D'argent au vol renversé de sable.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Blason_imaginaire_d%27Andeliz_le_Roux.svg/120px-Blason_imaginaire_d%27Andeliz_le_Roux.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Aran du Pin',
      slug: 'aran-du-pin',
      blazon: "De sinople à trois pommes de pin d'or.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Blason_imaginaire_d%27Aran_du_Pin.svg/120px-Blason_imaginaire_d%27Aran_du_Pin.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Argaanor le Riche',
      slug: 'argaanor-le-riche',
      blazon:
        "De sable à un cavalier en armes d'or tenant une hache de sinople emmanchée de gueules.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Blason_imaginaire_d%27Argaanor_le_Riche.svg/120px-Blason_imaginaire_d%27Argaanor_le_Riche.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Argaas le Bel',
      slug: 'argaas-le-bel',
      blazon: "D'or à un taureau de gueules accorné, ancorné et lampassé d'azur.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Blason_imaginaire_d%27Argaas_le_Bel.svg/120px-Blason_imaginaire_d%27Argaas_le_Bel.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Argoier le Fel',
      slug: 'argoier-le-fel',
      blazon: "D'or à trois cotices de sable en bande.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Blason_imaginaire_d%27Argoier_le_Fel.svg/120px-Blason_imaginaire_d%27Argoier_le_Fel.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Ariohan',
      slug: 'ariohan',
      blazon: "D'argent à un dragon de sable armé et lampassé de gueules.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Blason_imaginaire_d%27Ariohan.svg/120px-Blason_imaginaire_d%27Ariohan.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Armand le Pèlerin',
      slug: 'armand-le-pelerin',
      blazon: "De sable semé de coquilles alternées d'or et d'argent.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Blason_imaginaire_d%27Armand_le_P%C3%A8lerin.svg/120px-Blason_imaginaire_d%27Armand_le_P%C3%A8lerin.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Armond',
      slug: 'armond',
      blazon: "D'or au griffon de sinople armé, becqué et membré d'argent.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Blason_imaginaire_d%27Armond.svg/120px-Blason_imaginaire_d%27Armond.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Arphasar',
      slug: 'arphasar',
      blazon: "De sable au sautoir d'argent.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Blason_imaginaire_d%27Arphasar.svg/120px-Blason_imaginaire_d%27Arphasar.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Arthur',
      slug: 'arthur',
      blazon: "D'azur à treize couronnes d'or, 4, 4, 4 et 1.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Blason_imaginaire_d%27Arthur.svg/120px-Blason_imaginaire_d%27Arthur.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Arthur le Petit',
      slug: 'arthur-le-petit',
      blazon: "De sable à l'arbre d'or.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Blason_imaginaire_d%27Arthur_le_Petit.svg/120px-Blason_imaginaire_d%27Arthur_le_Petit.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Artus ly Blois',
      slug: 'artus-ly-blois',
      blazon: "De sable à l'épervier d'argent becqué et membré d'or.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Blason_imaginaire_d%27Artus_ly_Blois.svg/120px-Blason_imaginaire_d%27Artus_ly_Blois.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Balaan',
      slug: 'balaan',
      blazon: "D'argent à un sanglier de sable onglé et défendu de gueules.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Blason_imaginaire_de_Balaan.svg/120px-Blason_imaginaire_de_Balaan.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Balaain',
      slug: 'balaain',
      blazon:
        "D'argent à un sanglier de sable onglé et défendu de gueules, surmonté de trois étoiles d'azur rangées en chef.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Blason_imaginaire_de_Balaain.svg/120px-Blason_imaginaire_de_Balaain.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Ban de Bénoïc',
      slug: 'ban-de-benoic',
      blazon: "D'argent à trois bandes de gueules",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Blason_Lancelot.svg/120px-Blason_Lancelot.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Banyers le Forcené',
      slug: 'banyers-le-forcene',
      blazon: "Gironné d'argent et de gueules.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Blason_imaginaire_de_Banyers_le_Forcen%C3%A9.svg/120px-Blason_imaginaire_de_Banyers_le_Forcen%C3%A9.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Baudemagu',
      slug: 'baudemagu',
      blazon: "De gueules aux trois gants d'argent.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Blason_imaginaire_de_Baudemagu.svg/120px-Blason_imaginaire_de_Baudemagu.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Bédivère',
      slug: 'bedivere',
      blazon: "D'or au gonfanon de gueules.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Blason_imaginaire_de_B%C3%A9doier.svg/120px-Blason_imaginaire_de_B%C3%A9doier.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Blanor',
      slug: 'blanor',
      blazon: "D'argent semé de croissants de sable, à trois bandes de gueules brochant .",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Blason_imaginaire_de_Blanor_et_de_Blioberis.svg/120px-Blason_imaginaire_de_Blanor_et_de_Blioberis.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Blioberis',
      slug: 'blioberis',
      blazon: "D'argent semé de croissants de sable, à trois bandes de gueules brochant .",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Blason_imaginaire_de_Blanor_et_de_Blioberis.svg/120px-Blason_imaginaire_de_Blanor_et_de_Blioberis.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Bohort',
      slug: 'bohort',
      blazon: "D'hermine à trois bandes de gueules.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Blason_imaginaire_Bohort.svg/120px-Blason_imaginaire_Bohort.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Bohors de Gaunes',
      slug: 'bohors-de-gaunes',
      blazon: "D'argent semé d'étoiles de sable, à trois bandes de gueules brochant .",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Blason_imaginaire_de_Bohors_de_Gaunes.svg/120px-Blason_imaginaire_de_Bohors_de_Gaunes.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Brandelis',
      slug: 'brandelis',
      blazon: "De gueules à trois épées d'argent mal ordonnées, garnies et pommetées d'azur.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Blason_imaginaire_de_Brandelis.svg/120px-Blason_imaginaire_de_Brandelis.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Brien des Iles',
      slug: 'brien-des-iles',
      blazon: "De sable à un chien courant d'or armé et lampassé de gueules.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Blason_imaginaire_de_Brien_des_Iles.svg/120px-Blason_imaginaire_de_Brien_des_Iles.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: "Broadas l'Espagnol",
      slug: 'broadas-l-espagnol',
      blazon: "De sable à l'écrevisse d'or posée en pal.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Blason_imaginaire_de_Broadas_l%27Espagnol.svg/120px-Blason_imaginaire_de_Broadas_l%27Espagnol.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Brumer de la Fontaine',
      slug: 'brumer-de-la-fontaine',
      blazon: "Écartelé d'or et de sable, à la fontaine d'argent brochant sur le tout.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Blason_imaginaire_de_Brumer_de_la_Fontaine.svg/120px-Blason_imaginaire_de_Brumer_de_la_Fontaine.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Brun sans Joie',
      slug: 'brun-sans-joie',
      blazon: "Parti de gueules semé de larmes d'argent, et de sinople semé de larmes d'or.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Blason_imaginaire_de_Brun_sans_Joie.svg/120px-Blason_imaginaire_de_Brun_sans_Joie.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Brun sans Pitié',
      slug: 'brun-sans-pitie',
      blazon: "De sable à un dragon d'argent.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Blason_imaginaire_de_Brun_sans_Piti%C3%A9.svg/120px-Blason_imaginaire_de_Brun_sans_Piti%C3%A9.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Brunor le Chevalier sans Peur',
      slug: 'brunor-le-chevalier-sans-peur',
      blazon: "D'argent plain.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Blason_imaginaire_de_Brunor_le_Chevalier_sans_Peur.svg/120px-Blason_imaginaire_de_Brunor_le_Chevalier_sans_Peur.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Brunor le Noir',
      slug: 'brunor-le-noir',
      blazon: "D'argent au lion échiqueté de sable et de gueules, armé et lampassé de sinople",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Blason_Brunor_le_Noir.svg/120px-Blason_Brunor_le_Noir.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Busterin le Grand',
      slug: 'busterin-le-grand',
      blazon: "D'or à un quadrupède de sable, à la bordure componée d'argent et de gueules.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Blason_imaginaire_de_Busterin_le_grand.svg/120px-Blason_imaginaire_de_Busterin_le_grand.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Cadrus',
      slug: 'cadrus',
      blazon: 'D’or semé de tourteaux de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Blason_Cadrus.svg/120px-Blason_Cadrus.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: "Calinan le Blanc, surnommé l'Orgueilleux",
      slug: 'calinan-le-blanc-surnomme-l-orgueilleux',
      blazon: 'D’or à un dragon de gueules armé et langué de sable.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Blason_Calinan.svg/120px-Blason_Calinan.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Calogrenant',
      slug: 'calogrenant',
      blazon: 'De gueules à une guivre d’or.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Blason_Calogrenant.svg/120px-Blason_Calogrenant.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Claudas',
      slug: 'claudas',
      blazon: 'D’azur à un pin d’or.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Blason_Claudas.svg/120px-Blason_Claudas.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Courant de Roche Dure',
      slug: 'courant-de-roche-dure',
      blazon: 'De sable à trois lapins d’argent, onglés de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Blason_Courant_de_Roche_Dure.svg/120px-Blason_Courant_de_Roche_Dure.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Dalides de la Rivière',
      slug: 'dalides-de-la-riviere',
      blazon: 'D’argent à deux dauphins de sable adossés en pal et langués de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Blason_imaginaire_de_Dalides_de_la_Rivi%C3%A8re.svg/120px-Blason_imaginaire_de_Dalides_de_la_Rivi%C3%A8re.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Damatha',
      slug: 'damatha',
      blazon: 'De vair plain.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Blason_imaginaire_de_Damatha.svg/120px-Blason_imaginaire_de_Damatha.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Danain le Roux',
      slug: 'danain-le-roux',
      blazon: 'De sable à un porc-épic d’or onglé d’azur.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Blason_imaginaire_de_Danain_le_Roux.svg/120px-Blason_imaginaire_de_Danain_le_Roux.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Desier le Fier',
      slug: 'desier-le-fier',
      blazon: 'D’argent à une hydre à sept têtes de gueules, languée de sinople.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Blason_imaginaire_de_Desier_le_Fier.svg/120px-Blason_imaginaire_de_Desier_le_Fier.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Dinadan',
      slug: 'dinadan',
      blazon: 'D’argent au lion de sable, armé et lampassé de sinople.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Blason_imaginaire_de_Dinadan.svg/120px-Blason_imaginaire_de_Dinadan.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Dodinel le Sauvage',
      slug: 'dodinel-le-sauvage',
      blazon: 'D’argent à l’aigle d’azur becquée et membrée d’or.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Blason_imaginaire_de_Dodinel_le_Sauvage.svg/120px-Blason_imaginaire_de_Dodinel_le_Sauvage.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Érec',
      slug: 'erec',
      blazon: 'D’or à trois têtes de serpent de gueules languées de sinople.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Blason_%C3%89rec.svg/120px-Blason_%C3%89rec.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Esclabor le Méconnu',
      slug: 'esclabor-le-meconnu',
      blazon: 'Échiqueté d’or et de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Blason_Esclabor_le_M%C3%A9connu.svg/120px-Blason_Esclabor_le_M%C3%A9connu.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Faran le Noir',
      slug: 'faran-le-noir',
      blazon: 'D’azur à trois aiglettes d’argent, becquées et membrées de sable.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Blason_Faran_le_Noir.svg/120px-Blason_Faran_le_Noir.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Faran le Roux',
      slug: 'faran-le-roux',
      blazon:
        'D’azur aux trois aiglettes d’argent, becquées et membrées de sable ; à la bordure componée d’or et de sable.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Blason_Faran_le_Roux.svg/120px-Blason_Faran_le_Roux.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Le Fée des Dames',
      slug: 'le-fee-des-dames',
      blazon: "De sable à trois billettes d'argent.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Blason_imaginaire_Fee_des_Dames.svg/120px-Blason_imaginaire_Fee_des_Dames.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Félix le Quérant',
      slug: 'felix-le-querant',
      blazon: 'De sinople à un cerf passant ailé d’or, onglé de sable.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Blason_F%C3%A9lix_le_Qu%C3%A9rant.svg/120px-Blason_F%C3%A9lix_le_Qu%C3%A9rant.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Fergus',
      slug: 'fergus',
      blazon: 'Palé contre-palé d’argent et de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Blason_Fergus_table_ronde.svg/120px-Blason_Fergus_table_ronde.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Ferrandon le Pauvre',
      slug: 'ferrandon-le-pauvre',
      blazon: 'D’or à six burelles de sinople.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Blason_Ferrandon_le_Pauvre.svg/120px-Blason_Ferrandon_le_Pauvre.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Ferrant du Tertre',
      slug: 'ferrant-du-tertre',
      blazon: 'De gueules à un ours d’or armé de sable.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Blason_Ferrant_du_Tertre.svg/120px-Blason_Ferrant_du_Tertre.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Le Forestier du Danemark',
      slug: 'le-forestier-du-danemark',
      blazon: "d'or au chêne de sinople, au huchet d'argent brochant.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Blason_imaginaire_Forestier.svg/120px-Blason_imaginaire_Forestier.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Le Fort Trouvé',
      slug: 'le-fort-trouve',
      blazon: "D'argent au sanglier de sable, onglé et défendu de gueules.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Blason_imaginaire_de_Balaan.svg/120px-Blason_imaginaire_de_Balaan.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: "Le Fortuné de l'Île",
      slug: 'le-fortune-de-l-ile',
      blazon: "De gueules à un éléphant d'or, onglé et défendu d'azur.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Blason_imaginaire_de_Fortun%C3%A9_de_l%27Isle.svg/120px-Blason_imaginaire_de_Fortun%C3%A9_de_l%27Isle.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Friadus le Gai',
      slug: 'friadus-le-gai',
      blazon: 'D’or mantelé de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Blason_Friadus_le_Gai.svg/120px-Blason_Friadus_le_Gai.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Gaheriet',
      slug: 'gaheriet',
      blazon:
        'De pourpre à l’aigle bicéphale d’or becquée et membrée de gueules, à la cotice en bande du même brochant.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Blason_imaginaire_de_Gaheriet.svg/120px-Blason_imaginaire_de_Gaheriet.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Galaad',
      slug: 'galaad',
      blazon: 'D’argent à la croix de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Blason-argent-croix-gueules.svg/120px-Blason-argent-croix-gueules.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Galegantin le Galois',
      slug: 'galegantin-le-galois',
      blazon: 'Parti d’or et de sable, au lion de sinople armé et lampassé de gueules brochant.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Blason_Galegantin_le_Galois.svg/120px-Blason_Galegantin_le_Galois.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Galegantin de Norgalles',
      slug: 'galegantin-de-norgalles',
      blazon: 'De pourpre au lion d’argent armé et lampassé de sinople.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Blason_Galegantin_de_Norgalles.svg/120px-Blason_Galegantin_de_Norgalles.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Galehaut',
      slug: 'galehaut',
      blazon:
        'D’argent semé d’étoiles d’azur, au lion de gueules armé et lampassé de sinople brochant.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Blason_Galehaut.svg/120px-Blason_Galehaut.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Galinde du Tertre',
      slug: 'galinde-du-tertre',
      blazon: 'D’argent à une merlette de sable.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Blason_Galinde_du_Tertre.svg/120px-Blason_Galinde_du_Tertre.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Ganemor',
      slug: 'ganemor',
      blazon: 'De gueules à un loup d’or armé et lampassé de sable.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Blason_Ganemor.svg/120px-Blason_Ganemor.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Gauvain',
      slug: 'gauvain',
      blazon: 'De pourpre à l’aigle bicéphale d’or becquée et membrée d’azur.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Blason_imaginaire_de_Gauvain.svg/120px-Blason_imaginaire_de_Gauvain.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Geffroi de la Tour',
      slug: 'geffroi-de-la-tour',
      blazon: 'De gueules à une tour d’or maçonnée de sable.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Blason_Geffroi_de_la_Tour.svg/120px-Blason_Geffroi_de_la_Tour.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Girflet',
      slug: 'girflet',
      blazon: 'D’or semé de chardons de sable.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Blason_Girflet.svg/120px-Blason_Girflet.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Gornain',
      slug: 'gornain',
      blazon: 'De sable au chef d’or chargé de trois coquilles de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Blason_Gornain.svg/120px-Blason_Gornain.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: "Gosenain d'Estrangort",
      slug: 'gosenain-d-estrangort',
      blazon: "D'azur au léopard lionné d'argent, armé et lampassé de gueules.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Blason_Gosenain_d%E2%80%99Estrangort.svg/120px-Blason_Gosenain_d%E2%80%99Estrangort.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Gringalas le Fort',
      slug: 'gringalas-le-fort',
      blazon: 'De sable à une licorne d’argent accornée et ancornée d’azur.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Blason_imaginaire_de_Gringalas_le_Fort.svg/120px-Blason_imaginaire_de_Gringalas_le_Fort.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Guerrehet',
      slug: 'guerrehet',
      blazon:
        'De pourpre à l’aigle bicéphale d’or, becquée et membrée d’argent, à la bordure de gouttes de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Blason_Guerrehet.svg/120px-Blason_Guerrehet.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Guinglain',
      slug: 'guinglain',
      blazon: 'D’argent à un bâton noueux de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Blason_imaginaire_de_Guinglan.svg/120px-Blason_imaginaire_de_Guinglan.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Guiron le Courtois',
      slug: 'guiron-le-courtois',
      blazon: 'D’or plain.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Blason_imaginaire_de_Guiron_le_Courtois.svg/120px-Blason_imaginaire_de_Guiron_le_Courtois.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Guivret le Petit',
      slug: 'guivret-le-petit',
      blazon: 'Coupé-émanché d’argent et de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Blason_Guivret_le_Petit.svg/120px-Blason_Guivret_le_Petit.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Harpin le Dur',
      slug: 'harpin-le-dur',
      blazon: 'De sable à la croix ancrée d’argent.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Blason_Harpin_le_Dur.svg/120px-Blason_Harpin_le_Dur.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Hector des Mares',
      slug: 'hector-des-mares',
      blazon: 'D’argent à trois bandes de gueules, un soleil d’azur brochant.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Blason_Hector_des_mares.svg/120px-Blason_Hector_des_mares.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Hélain le Blanc',
      slug: 'helain-le-blanc',
      blazon: 'D’argent à trois bandes de gueules, un lambel de sable brochant.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Blason_Helain_le_Blanc.svg/120px-Blason_Helain_le_Blanc.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Hermin le Félon',
      slug: 'hermin-le-felon',
      blazon: 'Burelé d’or et d’azur.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Blason_Hermin_le_F%C3%A9lon.svg/120px-Blason_Hermin_le_F%C3%A9lon.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Herrois le Joyeux',
      slug: 'herrois-le-joyeux',
      blazon: 'D’argent à trois croisettes au pied fiché de sable.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Blason_Herrois_le_Joyeux.svg/120px-Blason_Herrois_le_Joyeux.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Hervi de Rivel',
      slug: 'hervi-de-rivel',
      blazon:
        'De sinople semé de gouttes d’or, au léopard d’argent armé et lampassé de gueules brochant.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Blason_Henri_de_Rivel.svg/120px-Blason_Henri_de_Rivel.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Hideux le Fort Tirant',
      slug: 'hideux-le-fort-tirant',
      blazon: 'D’argent à une chimère de gueules, tachetée d’azur.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Blason_Hideux_le_Fort_Tirant.svg/120px-Blason_Hideux_le_Fort_Tirant.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Hoscalen le Prussien',
      slug: 'hoscalen-le-prussien',
      blazon: 'D’argent à trois rubis de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Blason_imaginaire_d%27Hoscalen_le_Prussien.svg/120px-Blason_imaginaire_d%27Hoscalen_le_Prussien.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: "L'Irlandais de Ruse",
      slug: 'l-irlandais-de-ruse',
      blazon: "De gueules à la cloche d'argent bataillée de sable.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Blason_imaginaire_Hyrlandois.svg/120px-Blason_imaginaire_Hyrlandois.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Kahedin',
      slug: 'kahedin',
      blazon: 'De gueules à trois macles d’or.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Blason_Kahedin.svg/120px-Blason_Kahedin.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Kahedin de la Vallée',
      slug: 'kahedin-de-la-vallee',
      blazon: 'De gueules à une faux d’or, emmanchée de sable.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Blason_Kahedin_de_la_Vall%C3%A9e.svg/120px-Blason_Kahedin_de_la_Vall%C3%A9e.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Kalaart le Petit',
      slug: 'kalaart-le-petit',
      blazon: 'De sable à l’orle d’or de trois pièces.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Blason_Kalaart_le_Petit.svg/120px-Blason_Kalaart_le_Petit.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Karados',
      slug: 'karados',
      blazon: 'D’azur à une couronne d’argent.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Blason_Karados.svg/120px-Blason_Karados.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Keu',
      slug: 'keu',
      blazon: 'D’azur à deux clefs d’argent adossées en pal.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Blason_Keu_table_ronde.svg/120px-Blason_Keu_table_ronde.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Keu d’Estraus',
      slug: 'keu-d-estraus',
      blazon: 'D’or à deux jumelles de sable.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Blason_Keu_d%E2%80%99Estraus.svg/120px-Blason_Keu_d%E2%80%99Estraus.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Lac',
      slug: 'lac',
      blazon: "D'or à trois têtes de serpent de gueules, languées de sinople.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Blason_%C3%89rec.svg/120px-Blason_%C3%89rec.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Le Laid Hardi',
      slug: 'le-laid-hardi',
      blazon: "Losangé d'argent et de sable.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Blason_imaginaire_de_Le_Lais_Hardi.svg/120px-Blason_imaginaire_de_Le_Lais_Hardi.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Lambègue le Galois',
      slug: 'lambegue-le-galois',
      blazon: "D'argent à trois annelets de gueules.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Blason_imaginaire_de_Lamb%C3%A8gue_le_Galois.svg/120px-Blason_imaginaire_de_Lamb%C3%A8gue_le_Galois.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Lamorak de Gulis',
      slug: 'lamorak-de-gulis',
      blazon:
        "De pourpre semé de croisettes d'or, au léopard d'argent armé et lampassé de gueules brochant sur le tout.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Blason_imaginaire_d%27Agloval_de_Galles.svg/120px-Blason_imaginaire_d%27Agloval_de_Galles.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Lamorat de Listenois',
      slug: 'lamorat-de-listenois',
      blazon: "De pourpre au léopard d'argent armé de gueules",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Blason_imaginaire_d%27Agloval_de_Listenois.svg/120px-Blason_imaginaire_d%27Agloval_de_Listenois.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Lanborc du Chatel',
      slug: 'lanborc-du-chatel',
      blazon: "De pourpre au léopard lionné d'argent, armé et lampassé d'azur.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Blason_imaginaire_de_Lanborc_du_Chatel.svg/120px-Blason_imaginaire_de_Lanborc_du_Chatel.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Lancelot',
      slug: 'lancelot',
      blazon: "D'argent à trois bandes de gueules",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Blason_Lancelot.svg/120px-Blason_Lancelot.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Lanval du Bois',
      slug: 'lanval-du-bois',
      blazon: "D'or à la bande de gueules engrêlée de sable.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Blason_imaginaire_de_Lanval.svg/120px-Blason_imaginaire_de_Lanval.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Léodegan de Carmélide',
      slug: 'leodegan-de-carmelide',
      blazon: "De sable au léopard d'or, armé et lampassé de gueules.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Blason_imaginaire_de_L%C3%A9odegan.svg/120px-Blason_imaginaire_de_L%C3%A9odegan.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Lionel de Gaunes',
      slug: 'lionel-de-gaunes',
      blazon: "D'argent semé d'étoiles de sable, à trois bandes de gueules brochant .",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Blason_Lionel_table_ronde.svg/120px-Blason_Lionel_table_ronde.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Lot',
      slug: 'lot',
      blazon: "De pourpre à l'aigle bicéphale d'or, becquée et membrée d'azur",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Blason_imaginaire_de_Gauvain.svg/120px-Blason_imaginaire_de_Gauvain.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Lot le Preux',
      slug: 'lot-le-preux',
      blazon: "D'argent au corbeau de sable, becqué et membré d'azur.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Blason_imaginaire_Loth_le_Preux.svg/120px-Blason_imaginaire_Loth_le_Preux.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Lucan',
      slug: 'lucan',
      blazon: "D'or au loup-cervier de gueules, armé de sable",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Blason_imaginaire_Lucan_le_boutillier.svg/120px-Blason_imaginaire_Lucan_le_boutillier.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Ludinas le Bon Chevalier de Norgalles',
      slug: 'ludinas-le-bon-chevalier-de-norgalles',
      blazon: "De gueules à trois pattes de lion d'or.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Blason_imaginaire_de_Ludinas_le_Bon_Chevalier_de_Norgalles.svg/120px-Blason_imaginaire_de_Ludinas_le_Bon_Chevalier_de_Norgalles.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Lupin des Croix',
      slug: 'lupin-des-croix',
      blazon: "D'azur semé de croissants d'or.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Blason_ville_fr_Menoncourt_90.svg/120px-Blason_ville_fr_Menoncourt_90.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: "L'Enfant du Plessis",
      slug: 'l-enfant-du-plessis',
      blazon: "De gueules à trois roses d'argent",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Blason_imaginaire_de_L%27Enfant_du_Plessis.svg/120px-Blason_imaginaire_de_L%27Enfant_du_Plessis.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Mador de la Porte',
      slug: 'mador-de-la-porte',
      blazon: 'De sable à sept pommes d’argent ombrées de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Blason_imaginaire_de_Maldor_de_la_Porte.svg/120px-Blason_imaginaire_de_Maldor_de_la_Porte.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Malaquin le Danois',
      slug: 'malaquin-le-danois',
      blazon: 'D’or à une tête de maure de sable couronnée d’argent.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Blason_imaginaire_de_Malaquin_le_Danois.svg/120px-Blason_imaginaire_de_Malaquin_le_Danois.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Malaquin le Gallois',
      slug: 'malaquin-le-gallois',
      blazon: 'de sable à un calice d’argent.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Blason_Malaquin_le_galois.svg/120px-Blason_Malaquin_le_galois.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Malaquin le Gros',
      slug: 'malaquin-le-gros',
      blazon: 'De pourpre à la bande d’argent chargée de trois lions léopardés de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Blason_Malaquin_le_Gros.svg/120px-Blason_Malaquin_le_Gros.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Mandin l’Envoisié',
      slug: 'mandin-l-envoisie',
      blazon: 'De gueules à une sirène d’argent se peignant, écaillée de pourpre.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Blason_Imaginaire_Mandin_l_Envoisie.svg/120px-Blason_Imaginaire_Mandin_l_Envoisie.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Mandin le Sage',
      slug: 'mandin-le-sage',
      blazon: 'Parti vairé d’or et de pourpre, et de gueules plain.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Blason_Mandin_le_Sage.svg/120px-Blason_Mandin_le_Sage.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Margondes le Rouge',
      slug: 'margondes-le-rouge',
      blazon: 'Bandé de gueules et d’or de six pièces.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Blason_Margondes_le_Rouge.svg/120px-Blason_Margondes_le_Rouge.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Méliadus de l’Espine Noire',
      slug: 'meliadus-de-l-espine-noire',
      blazon: 'D’or à trois croisettes tréflées de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Blason_M%C3%A9liadus_de_l%E2%80%99Espine_Noire.svg/120px-Blason_M%C3%A9liadus_de_l%E2%80%99Espine_Noire.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Méliadus de Léonois',
      slug: 'meliadus-de-leonois',
      blazon: 'De sinople plain.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Blason_M%C3%A9liadus_de_L%C3%A9onois.svg/120px-Blason_M%C3%A9liadus_de_L%C3%A9onois.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Melian de Lis',
      slug: 'melian-de-lis',
      blazon: 'De gueules à un renard d’or, armé et lampassé d’azur.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Blason_Melian_de_Lis.svg/120px-Blason_Melian_de_Lis.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Mélior de l’Espine',
      slug: 'melior-de-l-espine',
      blazon: 'De sable à une divise d’or.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Blason_M%C3%A9lior_de_l%E2%80%99Espine.svg/120px-Blason_M%C3%A9lior_de_l%E2%80%99Espine.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Melios le Beau Chevalier',
      slug: 'melios-le-beau-chevalier',
      blazon: 'Fascé contre-fascé d’argent et de sinople.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Blason_Melios_le_Beau_Chevalier.svg/120px-Blason_Melios_le_Beau_Chevalier.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Mélyadus le Blanc',
      slug: 'melyadus-le-blanc',
      blazon: 'De sable à la croix pattée d’or.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Blason_M%C3%A9lyadus_le_Blanc.svg/120px-Blason_M%C3%A9lyadus_le_Blanc.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Mélyadus le Noir',
      slug: 'melyadus-le-noir',
      blazon: 'D’argent à trois chevrons de sable.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Blason_M%C3%A9lyadus_le_Noir.svg/120px-Blason_M%C3%A9lyadus_le_Noir.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Méraugis de Port les Guez',
      slug: 'meraugis-de-port-les-guez',
      blazon: 'd’argent à la bordure de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Blason_M%C3%A9raugis_de_Port_les_Guez.svg/120px-Blason_M%C3%A9raugis_de_Port_les_Guez.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Mirandon de la Tamise',
      slug: 'mirandon-de-la-tamise',
      blazon: 'De sable à un moulin à vent d’or.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Blason_Mirandon_de_la_Tamise.svg/120px-Blason_Mirandon_de_la_Tamise.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Mordred',
      slug: 'mordred',
      blazon: 'De pourpre à l’aigle bicéphale d’or, au chef d’argent.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Blason_Mordret.svg/120px-Blason_Mordret.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: "Le Morholt d'Irlande",
      slug: 'le-morholt-d-irlande',
      blazon: "Burelé d'argent et d'azur au lion de gueules brochant.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Blason_imaginaire_du_Morholt_d%27Irlande.svg/120px-Blason_imaginaire_du_Morholt_d%27Irlande.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Nabon le Fel',
      slug: 'nabon-le-fel',
      blazon: 'D’argent à trois fusées de gueules rangées en fasce.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Blason_Nabon_le_Fel.svg/120px-Blason_Nabon_le_Fel.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Le Noir perdu',
      slug: 'le-noir-perdu',
      blazon: "D'argent au tigre héraldique de sable, lampassé de sinople.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Blason_imaginaire_le_Noir_perdu.svg/120px-Blason_imaginaire_le_Noir_perdu.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Osenain Cœur Hardi',
      slug: 'osenain-coeur-hardi',
      blazon: 'Écartelé d’argent et de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Blason_Osenain_C%C5%93ur_Hardi.svg/120px-Blason_Osenain_C%C5%93ur_Hardi.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: "Ossenet d’Estrangot ou Gosenain d'Estrangort",
      slug: 'ossenet-d-estrangot-ou-gosenain-d-estrangort',
      blazon: 'D’azur au léopard lionné d’argent, armé et lampassé de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Blason_Ossenet_d%E2%80%99Estrangot.svg/120px-Blason_Ossenet_d%E2%80%99Estrangot.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Palamède',
      slug: 'palamede',
      blazon: 'Échiqueté d’argent et de sable.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Blason_Palam%C3%A8de.svg/120px-Blason_Palam%C3%A8de.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Patrides au Cercle d’Or',
      slug: 'patrides-au-cercle-d-or',
      blazon: 'De gueules au chef d’or, au lion de sable armé et lampassé de sinople brochant.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Blason_Patrides_au_Cercle_d%E2%80%99Or.svg/120px-Blason_Patrides_au_Cercle_d%E2%80%99Or.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Patrides le Hardi',
      slug: 'patrides-le-hardi',
      blazon: 'D’argent fretté de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Blason_Patrides_le_Hardi.svg/120px-Blason_Patrides_le_Hardi.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Pellinor',
      slug: 'pellinor',
      blazon: 'D’or semé de croisettes d’azur.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Blason_Pellinor.svg/120px-Blason_Pellinor.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Perceval',
      slug: 'perceval',
      blazon: 'De pourpre semé de croisettes d’or.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Blason_Perceval.svg/120px-Blason_Perceval.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Persides',
      slug: 'persides',
      blazon: "D'argent semé de tourteaux d'azur",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Blason_imaginaire_Persides.svg/120px-Blason_imaginaire_Persides.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Pharamond',
      slug: 'pharamond',
      blazon: 'De sable à trois crapauds d’or.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Blason_Pharamon.svg/120px-Blason_Pharamon.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Radouin le Persien',
      slug: 'radouin-le-persien',
      blazon: 'De sable à une chapelle d’argent, ajourée de campanée de sable.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Blason_imaginaire_de_Radouin_le_Persien.svg/120px-Blason_imaginaire_de_Radouin_le_Persien.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Randon le Léger',
      slug: 'randon-le-leger',
      blazon: 'Bandé-contre-bandé d’or et d’azur.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Blason_Randon_le_L%C3%A9ger.svg/120px-Blason_Randon_le_L%C3%A9ger.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Rion',
      slug: 'rion',
      blazon: 'D’or au léopard de pourpre, armé et lampassé d’azur.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Blason_Rion.svg/120px-Blason_Rion.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Rousselin du Haut Mont',
      slug: 'rousselin-du-haut-mont',
      blazon: 'D’or à un sauvage de gueules enbastonné de même.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Blason_imaginaire_de_Rousselin_du_Haut_Mont.svg/120px-Blason_imaginaire_de_Rousselin_du_Haut_Mont.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Sadoc de Vencon',
      slug: 'sadoc-de-vencon',
      blazon: 'Fascé-ondé d’argent et d’azur.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Blason_Sadoc_de_Vencon.svg/120px-Blason_Sadoc_de_Vencon.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Sagremor le Desreez',
      slug: 'sagremor-le-desreez',
      blazon:
        'De gueules à trois étoiles d’or, au franc-quartier d’argent chargé d’une étoile de sable.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Blason_Sagremor_le_Desreez.svg/120px-Blason_Sagremor_le_Desreez.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Saphar',
      slug: 'saphar',
      blazon: "Parti de vair plain, et d' un échiqueté d’or et de sinople.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Blason_Saphar.svg/120px-Blason_Saphar.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Ségurades de Mont Grand',
      slug: 'segurades-de-mont-grand',
      blazon: 'D’or à un mont de sable.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Blason_Segurades_de_Mont_Grand.svg/120px-Blason_Segurades_de_Mont_Grand.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Ségurant le Brun',
      slug: 'segurant-le-brun',
      blazon: 'D’or à un dragon de sable armé et langué de sinople.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Blason_Seguran_le_Brun.svg/120px-Blason_Seguran_le_Brun.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Sibilias aux Dures Mains',
      slug: 'sibilias-aux-dures-mains',
      blazon: 'D’or à un feu de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Blason_Sibilias_aux_Dures_Mains.svg/120px-Blason_Sibilias_aux_Dures_Mains.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Sicambrin le Troyen',
      slug: 'sicambrin-le-troyen',
      blazon: 'De sable à un sagittaire d’or, armé d’un arc du même et d’une flèche de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Blason_Sicambrin_le_Troyen.svg/120px-Blason_Sicambrin_le_Troyen.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Sinados au Fil d’Or',
      slug: 'sinados-au-fil-d-or',
      blazon: "De gueules à une filière d'or en orle.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Blason_Sinados_au_Fil_d%E2%80%99Or.svg/120px-Blason_Sinados_au_Fil_d%E2%80%99Or.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Soliman du Bois Grand',
      slug: 'soliman-du-bois-grand',
      blazon: 'D’argent à un daim de gueules accorné de sable.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Blason_imaginaire_de_Soliman_du_Bois_Grand.svg/120px-Blason_imaginaire_de_Soliman_du_Bois_Grand.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Synados des Sept Fontaines',
      slug: 'synados-des-sept-fontaines',
      blazon: 'D’azur semé de gouttes d’argent.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Blason_Synados_des_Sept_Fontaines.svg/120px-Blason_Synados_des_Sept_Fontaines.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Talamor le Bouillant',
      slug: 'talamor-le-bouillant',
      blazon: 'De sinople à une colombe d’argent becquée et membrée de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Blason_imaginaire_de_Talamor_le_Bouillant.svg/120px-Blason_imaginaire_de_Talamor_le_Bouillant.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Taulas de la Montagne',
      slug: 'taulas-de-la-montagne',
      blazon: 'D’or à un globe impérial de sable, cerclé, cintré et croisetté de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Blason_imaginaire_de_Taulas_de_la_Montagne.svg/120px-Blason_imaginaire_de_Taulas_de_la_Montagne.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Tor',
      slug: 'tor',
      blazon: 'D’or semé de croisettes de sable.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Blason_Tor.svg/120px-Blason_Tor.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Toscan le Romain',
      slug: 'toscan-le-romain',
      blazon: 'D’or à une main de sable armée d’une épée de gueules en pal.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Blason_imaginaire_de_Toscan_le_Romain.svg/120px-Blason_imaginaire_de_Toscan_le_Romain.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Tristan de Lyonesse',
      slug: 'tristan-de-lyonesse',
      blazon: 'De sinople au lion d’or, armé et lampassé de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Blason_imaginaire_de_Tristan.svg/120px-Blason_imaginaire_de_Tristan.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Urien',
      slug: 'urien',
      blazon: 'D’azur au lion d’or, armé et lampassé de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Blason_Urien.svg/120px-Blason_Urien.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: "Le Valet au Cercle d'Or",
      slug: 'le-valet-au-cercle-d-or',
      blazon: "De pourpre au cercle d'or lié de sable.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Blason_imaginaire_Varlet_au_cercle_d_or.svg/120px-Blason_imaginaire_Varlet_au_cercle_d_or.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Le Valet de Gluie',
      slug: 'le-valet-de-gluie',
      blazon: "De sable à la bordure engrêlée d'or.",
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Blason_imaginaire_Varlet_de_Gluyne.svg/120px-Blason_imaginaire_Varlet_de_Gluyne.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Virant de la Roche',
      slug: 'virant-de-la-roche',
      blazon: 'De gueules à un chien d’or, armé et lampassé de sable.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Blason_imaginaire_Virant_de_la_Roche.svg/120px-Blason_imaginaire_Virant_de_la_Roche.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Yder',
      slug: 'yder',
      blazon: 'De gueules à trois têtes de lion d’or, lampassées de sable.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Blason_imaginaire_d%27Yder.svg/120px-Blason_imaginaire_d%27Yder.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Yvain',
      slug: 'yvain',
      blazon: 'D’azur au lion d’or, armé et lampassé de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Blason_imaginaire_d%27Yvain.svg/120px-Blason_imaginaire_d%27Yvain.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Yvain d’Ussenel',
      slug: 'yvain-d-ussenel',
      blazon: 'D’or aux deux fasces paillées de gueules.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Blason_imaginaire_d%27Yvain_d%27Ussenel.svg/120px-Blason_imaginaire_d%27Yvain_d%27Ussenel.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
    {
      name: 'Yvain l’Avoutre',
      slug: 'yvain-l-avoutre',
      blazon: 'D’azur au pal d’or.',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Blason_imaginaire_d%27Yvain_l%27Avoutre.svg/120px-Blason_imaginaire_d%27Yvain_l%27Avoutre.svg.png?utm_source=fr.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
    },
  ],
};
