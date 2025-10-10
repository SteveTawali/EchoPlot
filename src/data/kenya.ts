// Kenya-specific data constants

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
  englishName: string;
  swahiliName: string;
  scientificName: string;
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
    englishName: 'Mango',
    swahiliName: 'Muembe',
    scientificName: 'Mangifera indica',
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
    englishName: 'Grevillea',
    swahiliName: 'Grevelia',
    scientificName: 'Grevillea robusta',
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
    englishName: 'Acacia',
    swahiliName: 'Mgunga',
    scientificName: 'Acacia tortilis',
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
    englishName: 'Bamboo',
    swahiliName: 'Mianzi',
    scientificName: 'Bambusa vulgaris',
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
    englishName: 'Avocado',
    swahiliName: 'Parachichi',
    scientificName: 'Persea americana',
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
    englishName: 'Moringa',
    swahiliName: 'Moringa',
    scientificName: 'Moringa oleifera',
    suitableCounties: ['Machakos', 'Makueni', 'Kitui', 'Mombasa', 'Kilifi'],
    agroZones: ['IL1', 'IL2', 'LM2', 'LM3', 'CL1'],
    price: 80,
    uses: ['medicine', 'fodder'],
    description: {
      en: 'Nutritious multipurpose tree with medicinal properties',
      sw: 'Mti wenye lishe na dawa za asili, una matumizi mengi'
    }
  }
];

export type KenyanCounty = typeof KENYAN_COUNTIES[number];
export type AgroEcologicalZone = typeof AGRO_ECOLOGICAL_ZONES[number];
