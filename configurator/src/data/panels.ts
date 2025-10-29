export type PanelCategory =
  | 'uniwersalne'
  | 'sztućce'
  | 'narzędzia'
  | 'biuro'
  | 'hobby';

export type PanelDefinition = {
  id: string;
  name: string;
  gridWidth: number;
  gridHeight: number;
  price: number;
  category: PanelCategory;
  image: string;
  sampleItems: string[];
  description: string;
  previewModel?: string;
};

const encodeBase64 = (value: string) => {
  if (typeof btoa === 'function') {
    return btoa(value);
  }
  const globalBuffer = (globalThis as { Buffer?: { from: (input: string, encoding: string) => { toString: (encoding: string) => string } } }).Buffer;
  if (globalBuffer) {
    return globalBuffer.from(value, 'utf-8').toString('base64');
  }
  throw new Error('Brak wsparcia dla kodowania base64.');
};

const base64Thumbnail = (label: string, bg: string) =>
  `data:image/svg+xml;base64,${encodeBase64(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>` +
      `<rect width='120' height='120' rx='12' fill='${bg}'/>` +
      `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Inter' font-size='28' fill='white'>${label}</text>` +
      '</svg>'
  )}`;

export const PANELS: PanelDefinition[] = [
  {
    id: 'gridfinity-bin-1x1',
    name: 'Pojemnik 1×1',
    gridWidth: 1,
    gridHeight: 1,
    price: 18,
    category: 'uniwersalne',
    image: base64Thumbnail('1×1', '#2563eb'),
    sampleItems: ['Łyżeczka', 'Klip biurowy', 'Słuchawki douszne'],
    description: 'Uniwersalny moduł 1×1 do przechowywania drobiazgów.',
    previewModel: '/models/bin-1x1.stl'
  },
  {
    id: 'gridfinity-bin-1x2',
    name: 'Pojemnik 1×2',
    gridWidth: 1,
    gridHeight: 2,
    price: 24,
    category: 'sztućce',
    image: base64Thumbnail('1×2', '#7c3aed'),
    sampleItems: ['Nóż stołowy', 'Widelec', 'Pędzel do makijażu'],
    description: 'Wąski moduł na sztućce, pędzle oraz narzędzia ręczne.',
    previewModel: '/models/bin-1x2.stl'
  },
  {
    id: 'gridfinity-bin-2x2',
    name: 'Pojemnik 2×2',
    gridWidth: 2,
    gridHeight: 2,
    price: 35,
    category: 'uniwersalne',
    image: base64Thumbnail('2×2', '#0ea5e9'),
    sampleItems: ['Nożyczki', 'Taśma pakowa', 'Miarka zwijana'],
    description: 'Średni moduł do większych akcesoriów kuchennych lub biurowych.',
    previewModel: '/models/bin-2x2.stl'
  },
  {
    id: 'gridfinity-bin-2x3',
    name: 'Pojemnik 2×3',
    gridWidth: 2,
    gridHeight: 3,
    price: 48,
    category: 'narzędzia',
    image: base64Thumbnail('2×3', '#f97316'),
    sampleItems: ['Szczypce', 'Nóż kuchenny', 'Kleje w sztyfcie'],
    description: 'Większy moduł idealny na narzędzia lub akcesoria kuchenne.',
    previewModel: '/models/bin-2x3.stl'
  },
  {
    id: 'gridfinity-bin-3x3',
    name: 'Pojemnik 3×3',
    gridWidth: 3,
    gridHeight: 3,
    price: 62,
    category: 'hobby',
    image: base64Thumbnail('3×3', '#22c55e'),
    sampleItems: ['Zestaw farb', 'Klocki', 'Organizer kabli'],
    description: 'Największy z dostępnych modułów do przechowywania dużych przedmiotów.',
    previewModel: '/models/bin-3x3.stl'
  }
];
