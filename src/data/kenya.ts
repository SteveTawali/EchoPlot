// Kenya-specific data constants
import kenyaMango from "@/assets/kenya-mango.jpg";
import kenyaGrevillea from "@/assets/kenya-grevillea.jpg";
import kenyaAcacia from "@/assets/kenya-acacia.jpg";
import kenyaBamboo from "@/assets/kenya-bamboo.jpg";
import kenyaAvocado from "@/assets/kenya-avocado.jpg";
import kenyaMoringa from "@/assets/kenya-moringa.jpg";
import kenyaCroton from "@/assets/kenya-croton.jpg";
import kenyaCypress from "@/assets/kenya-cypress.jpg";
import kenyaMacadamia from "@/assets/kenya-macadamia.jpg";
import kenyaNeem from "@/assets/kenya-neem.jpg";
import kenyaCasuarina from "@/assets/kenya-casuarina.jpg";
import kenyaPapaya from "@/assets/kenya-papaya.jpg";
import kenyaEucalyptus from "@/assets/kenya-eucalyptus.jpg";
import kenyaOrange from "@/assets/kenya-orange.jpg";
import kenyaCalliandra from "@/assets/kenya-calliandra.jpg";
import kenyaSesbania from "@/assets/kenya-sesbania.jpg";
import kenyaCoconut from "@/assets/kenya-coconut.jpg";
import kenyaGuava from "@/assets/kenya-guava.jpg";
import kenyaLeucaena from "@/assets/kenya-leucaena.jpg";
import kenyaJacaranda from "@/assets/kenya-jacaranda.jpg";

export const KENYAN_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay',
  'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii',
  'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
  'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi',
  'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
  'Tharaka-Nithi', 'Trans-Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
] as const;

export const AGRO_ECOLOGICAL_ZONES = [
  'LH1', 'LH2', 'LH3', 'LH4', // Lower Highland
  'UM1', 'UM2', 'UM3', 'UM4', // Upper Midland
  'LM1', 'LM2', 'LM3', 'LM4', 'LM5', // Lower Midland
  'IL1', 'IL2', 'IL3', 'IL4', 'IL5', 'IL6', // Inland Lowland
  'CL1', 'CL2', 'CL3', 'CL4', 'CL5', // Coastal Lowland
  'UH1', 'UH2', 'UH3', 'UH4', 'UH5', 'UH6' // Upper Highland
] as const;

export interface KenyanTreeSpecies {
  id: string;
  dbId: number; // For database compatibility
  englishName: string;
  swahiliName: string;
  scientificName: string;
  image: string;
  suitableCounties: string[];
  agroZones: string[];
  price: number; // KSH
  kefriCode?: string;
  uses: ('fruit' | 'timber' | 'fodder' | 'medicine' | 'shade' | 'conservation')[];
  description: {
    en: string;
    sw: string;
  };
}

export const KENYAN_TREES: KenyanTreeSpecies[] = [
  {
    id: 'mango',
    dbId: 1,
    englishName: 'Mango',
    swahiliName: 'Muembe',
    scientificName: 'Mangifera indica',
    image: kenyaMango,
    suitableCounties: ['Mombasa', 'Kilifi', 'Kwale', 'Taita-Taveta', 'Makueni', 'Machakos'],
    agroZones: ['CL1', 'CL2', 'LM1', 'LM2'],
    price: 200,
    uses: ['fruit', 'shade'],
    description: {
      en: 'Popular fruit tree suitable for coastal and lower midland areas',
      sw: 'Mti wa matunda maarufu unaofaa maeneo ya pwani na midland ya chini'
    }
  },
  {
    id: 'grevillea',
    dbId: 2,
    englishName: 'Grevillea',
    swahiliName: 'Grevelia',
    scientificName: 'Grevillea robusta',
    image: kenyaGrevillea,
    suitableCounties: ['Nyeri', 'Kiambu', 'Murang\'a', 'Embu', 'Meru', 'Nakuru'],
    agroZones: ['UH1', 'UH2', 'UM1', 'UM2', 'LH1', 'LH2'],
    price: 150,
    kefriCode: 'GRV001',
    uses: ['timber', 'shade', 'conservation'],
    description: {
      en: 'Fast-growing timber tree ideal for highlands and tea/coffee farms',
      sw: 'Mti wa mbao unaokua haraka unaofaa maeneo ya juu na mashamba ya chai/kahawa'
    }
  },
  {
    id: 'acacia',
    dbId: 3,
    englishName: 'Acacia',
    swahiliName: 'Mgunga',
    scientificName: 'Acacia tortilis',
    image: kenyaAcacia,
    suitableCounties: ['Kajiado', 'Taita-Taveta', 'Makueni', 'Kitui', 'Baringo'],
    agroZones: ['IL1', 'IL2', 'IL3', 'LM3', 'LM4'],
    price: 100,
    uses: ['fodder', 'conservation', 'timber'],
    description: {
      en: 'Drought-resistant tree excellent for arid and semi-arid areas',
      sw: 'Mti usiotishwa na ukame unaofaa maeneo ya jangwa na nusu-jangwa'
    }
  },
  {
    id: 'bamboo',
    dbId: 4,
    englishName: 'Bamboo',
    swahiliName: 'Mianzi',
    scientificName: 'Bambusa vulgaris',
    image: kenyaBamboo,
    suitableCounties: ['Kisii', 'Nyamira', 'Kakamega', 'Vihiga', 'Bungoma'],
    agroZones: ['UH1', 'UH2', 'LH1', 'LH2', 'UM1'],
    price: 120,
    uses: ['timber', 'conservation'],
    description: {
      en: 'Fast-growing multipurpose plant for construction and erosion control',
      sw: 'Mmea unaoukua haraka wenye matumizi mengi kwa ujenzi na kuzuia mmomonyoko'
    }
  },
  {
    id: 'avocado',
    dbId: 5,
    englishName: 'Avocado',
    swahiliName: 'Parachichi',
    scientificName: 'Persea americana',
    image: kenyaAvocado,
    suitableCounties: ['Murang\'a', 'Kiambu', 'Nyeri', 'Meru', 'Embu', 'Kakamega'],
    agroZones: ['LH1', 'LH2', 'UM1', 'UM2'],
    price: 300,
    uses: ['fruit'],
    description: {
      en: 'High-value fruit tree for export and local markets',
      sw: 'Mti wa matunda ya thamani ya juu kwa masoko ya nje na ndani'
    }
  },
  {
    id: 'moringa',
    dbId: 6,
    englishName: 'Moringa',
    swahiliName: 'Moringa',
    scientificName: 'Moringa oleifera',
    image: kenyaMoringa,
    suitableCounties: ['Machakos', 'Makueni', 'Kitui', 'Mombasa', 'Kilifi'],
    agroZones: ['IL1', 'IL2', 'LM2', 'LM3', 'CL1'],
    price: 80,
    uses: ['medicine', 'fodder'],
    description: {
      en: 'Nutritious multipurpose tree with medicinal properties',
      sw: 'Mti wenye lishe na dawa za asili, una matumizi mengi'
    }
  },
  {
    id: 'croton',
    dbId: 7,
    englishName: 'Croton',
    swahiliName: 'Mukinduri',
    scientificName: 'Croton megalocarpus',
    image: kenyaCroton,
    suitableCounties: ['Kiambu', 'Nyeri', 'Embu', 'Meru', 'Nakuru', 'Nyandarua'],
    agroZones: ['UH1', 'UH2', 'UM1', 'LH1', 'LH2'],
    price: 130,
    kefriCode: 'CRT001',
    uses: ['timber', 'conservation', 'shade'],
    description: {
      en: 'Indigenous tree excellent for fuel wood and soil improvement',
      sw: 'Mti wa asili mzuri kwa kuni na kuboresha udongo'
    }
  },
  {
    id: 'cypress',
    dbId: 8,
    englishName: 'Cypress',
    swahiliName: 'Msaipresi',
    scientificName: 'Cupressus lusitanica',
    image: kenyaCypress,
    suitableCounties: ['Nyandarua', 'Nyeri', 'Kiambu', 'Nakuru', 'Kericho', 'Bomet'],
    agroZones: ['UH1', 'UH2', 'UH3', 'LH1'],
    price: 140,
    uses: ['timber', 'conservation'],
    description: {
      en: 'Popular timber tree for highland areas and water catchments',
      sw: 'Mti wa mbao maarufu kwa maeneo ya juu na maeneo ya kuhifadhi maji'
    }
  },
  {
    id: 'macadamia',
    dbId: 9,
    englishName: 'Macadamia',
    swahiliName: 'Makadamia',
    scientificName: 'Macadamia integrifolia',
    image: kenyaMacadamia,
    suitableCounties: ['Embu', 'Meru', 'Kiambu', 'Murang\'a', 'Kirinyaga', 'Nyeri'],
    agroZones: ['LH1', 'LH2', 'UM1', 'UM2'],
    price: 350,
    uses: ['fruit'],
    description: {
      en: 'Premium nut tree with high export value',
      sw: 'Mti wa njugu zenye thamani kubwa ya biashara ya nje'
    }
  },
  {
    id: 'neem',
    dbId: 10,
    englishName: 'Neem',
    swahiliName: 'Mwarobaini',
    scientificName: 'Azadirachta indica',
    image: kenyaNeem,
    suitableCounties: ['Machakos', 'Makueni', 'Kitui', 'Kajiado', 'Taita-Taveta'],
    agroZones: ['IL1', 'IL2', 'LM2', 'LM3', 'LM4'],
    price: 90,
    uses: ['medicine', 'timber', 'conservation'],
    description: {
      en: 'Versatile tree with medicinal and pest control properties',
      sw: 'Mti wenye matumizi mengi kwa dawa na kudhibiti wadudu'
    }
  },
  {
    id: 'casuarina',
    dbId: 11,
    englishName: 'Casuarina',
    swahiliName: 'Mkenge',
    scientificName: 'Casuarina equisetifolia',
    image: kenyaCasuarina,
    suitableCounties: ['Mombasa', 'Kilifi', 'Kwale', 'Lamu', 'Tana River'],
    agroZones: ['CL1', 'CL2', 'CL3', 'CL4'],
    price: 110,
    uses: ['timber', 'conservation'],
    description: {
      en: 'Coastal tree excellent for windbreaks and soil stabilization',
      sw: 'Mti wa pwani mzuri kwa kuzuia upepo na kudhibiti mmomonyoko'
    }
  },
  {
    id: 'papaya',
    dbId: 12,
    englishName: 'Papaya',
    swahiliName: 'Mpapai',
    scientificName: 'Carica papaya',
    image: kenyaPapaya,
    suitableCounties: ['Mombasa', 'Kilifi', 'Kwale', 'Makueni', 'Machakos', 'Taita-Taveta'],
    agroZones: ['CL1', 'CL2', 'LM1', 'LM2', 'IL1'],
    price: 150,
    uses: ['fruit', 'medicine'],
    description: {
      en: 'Fast-growing fruit tree with nutritious and medicinal fruits',
      sw: 'Mti wa matunda unaokua haraka wenye lishe na dawa'
    }
  },
  {
    id: 'eucalyptus',
    dbId: 13,
    englishName: 'Eucalyptus',
    swahiliName: 'Mukalitusi',
    scientificName: 'Eucalyptus grandis',
    image: kenyaEucalyptus,
    suitableCounties: ['Nakuru', 'Uasin Gishu', 'Trans-Nzoia', 'Kericho', 'Nandi'],
    agroZones: ['UH1', 'UH2', 'LH1', 'LH2', 'UM1'],
    price: 100,
    uses: ['timber', 'conservation'],
    description: {
      en: 'Fast-growing timber tree suitable for commercial plantations',
      sw: 'Mti wa mbao unaokua haraka unaofaa mashamba ya biashara'
    }
  },
  {
    id: 'orange',
    dbId: 14,
    englishName: 'Orange',
    swahiliName: 'Mchungwa',
    scientificName: 'Citrus sinensis',
    image: kenyaOrange,
    suitableCounties: ['Machakos', 'Makueni', 'Mombasa', 'Kilifi', 'Kwale'],
    agroZones: ['LM1', 'LM2', 'CL1', 'CL2', 'IL1'],
    price: 220,
    uses: ['fruit'],
    description: {
      en: 'Citrus fruit tree for fresh fruit and juice production',
      sw: 'Mti wa matunda ya machungwa kwa matunda safi na juice'
    }
  },
  {
    id: 'calliandra',
    dbId: 15,
    englishName: 'Calliandra',
    swahiliName: 'Kaliandra',
    scientificName: 'Calliandra calothyrsus',
    image: kenyaCalliandra,
    suitableCounties: ['Embu', 'Meru', 'Nyeri', 'Kiambu', 'Murang\'a'],
    agroZones: ['LH1', 'LH2', 'UM1', 'UM2'],
    price: 80,
    uses: ['fodder', 'conservation'],
    description: {
      en: 'Nitrogen-fixing fodder tree excellent for dairy farming',
      sw: 'Mti wa malisho unaozalisha nitrojeni mzuri kwa ufugaji wa ng\'ombe wa maziwa'
    }
  },
  {
    id: 'sesbania',
    dbId: 16,
    englishName: 'Sesbania',
    swahiliName: 'Msesbania',
    scientificName: 'Sesbania sesban',
    image: kenyaSesbania,
    suitableCounties: ['Kisumu', 'Siaya', 'Busia', 'Kakamega', 'Vihiga'],
    agroZones: ['LM1', 'LM2', 'UM1', 'LH1'],
    price: 70,
    uses: ['fodder', 'conservation'],
    description: {
      en: 'Fast-growing fodder tree that enriches soil fertility',
      sw: 'Mti wa malisho unaokua haraka unaoboresha rutuba ya udongo'
    }
  },
  {
    id: 'coconut',
    dbId: 17,
    englishName: 'Coconut',
    swahiliName: 'Mnazi',
    scientificName: 'Cocos nucifera',
    image: kenyaCoconut,
    suitableCounties: ['Mombasa', 'Kilifi', 'Kwale', 'Lamu', 'Tana River'],
    agroZones: ['CL1', 'CL2', 'CL3'],
    price: 250,
    uses: ['fruit', 'timber'],
    description: {
      en: 'Iconic coastal tree producing nuts, oil, and building materials',
      sw: 'Mti maarufu wa pwani unazalisha nazi, mafuta na vifaa vya ujenzi'
    }
  },
  {
    id: 'guava',
    dbId: 18,
    englishName: 'Guava',
    swahiliName: 'Mpera',
    scientificName: 'Psidium guajava',
    image: kenyaGuava,
    suitableCounties: ['Machakos', 'Makueni', 'Embu', 'Meru', 'Kisii'],
    agroZones: ['LM1', 'LM2', 'LM3', 'UM1'],
    price: 180,
    uses: ['fruit', 'medicine'],
    description: {
      en: 'Hardy fruit tree with nutritious vitamin-rich fruits',
      sw: 'Mti wa matunda wenye nguvu na matunda yenye vitamini nyingi'
    }
  },
  {
    id: 'leucaena',
    dbId: 19,
    englishName: 'Leucaena',
    swahiliName: 'Msindizi',
    scientificName: 'Leucaena leucocephala',
    image: kenyaLeucaena,
    suitableCounties: ['Machakos', 'Makueni', 'Kitui', 'Taita-Taveta'],
    agroZones: ['LM2', 'LM3', 'IL1', 'IL2'],
    price: 75,
    uses: ['fodder', 'conservation', 'timber'],
    description: {
      en: 'Multi-purpose legume tree for fodder and soil improvement',
      sw: 'Mti wa kunde wenye matumizi mengi kwa malisho na kuboresha udongo'
    }
  },
  {
    id: 'jacaranda',
    dbId: 20,
    englishName: 'Jacaranda',
    swahiliName: 'Mjakaranda',
    scientificName: 'Jacaranda mimosifolia',
    image: kenyaJacaranda,
    suitableCounties: ['Nairobi', 'Kiambu', 'Nakuru', 'Nyeri', 'Eldoret'],
    agroZones: ['UH1', 'UM1', 'LH1', 'LH2'],
    price: 160,
    uses: ['shade', 'timber'],
    description: {
      en: 'Ornamental tree with beautiful purple flowers for urban areas',
      sw: 'Mti wa mapambo wenye maua mazuri ya urujuani kwa miji'
    }
  }
];

export type KenyanCounty = typeof KENYAN_COUNTIES[number];
export type AgroEcologicalZone = typeof AGRO_ECOLOGICAL_ZONES[number];
