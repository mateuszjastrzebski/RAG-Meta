import { LayoutState } from '../lib/layout';

export const PRESETS: { id: string; name: string; description: string; layout: LayoutState }[] = [
  {
    id: 'starter-kitchen',
    name: 'Starter kuchenny',
    description: 'Układ na podstawowe sztućce i akcesoria kuchenne.',
    layout: {
      drawer: { widthMm: 300, depthMm: 420, heightMm: 60 },
      grid: { columns: 7, rows: 10 },
      panels: [
        {
          instanceId: 'preset-1',
          definitionId: 'gridfinity-bin-1x2',
          x: 0,
          y: 0,
          orientation: 'default',
          customLabel: 'Noże'
        },
        {
          instanceId: 'preset-2',
          definitionId: 'gridfinity-bin-1x2',
          x: 1,
          y: 0,
          orientation: 'default',
          customLabel: 'Widelce'
        },
        {
          instanceId: 'preset-3',
          definitionId: 'gridfinity-bin-2x2',
          x: 2,
          y: 0,
          orientation: 'default',
          customLabel: 'Przyprawy'
        },
        {
          instanceId: 'preset-4',
          definitionId: 'gridfinity-bin-2x3',
          x: 4,
          y: 0,
          orientation: 'default',
          customLabel: 'Akcesoria'
        }
      ]
    }
  },
  {
    id: 'desk-pro',
    name: 'Biurko PRO',
    description: 'Optymalizacja miejsca na biurku do przechowywania kabli i gadżetów.',
    layout: {
      drawer: { widthMm: 336, depthMm: 378, heightMm: 50 },
      grid: { columns: 8, rows: 9 },
      panels: [
        {
          instanceId: 'preset-5',
          definitionId: 'gridfinity-bin-3x3',
          x: 0,
          y: 0,
          orientation: 'default',
          customLabel: 'Kable'
        },
        {
          instanceId: 'preset-6',
          definitionId: 'gridfinity-bin-2x2',
          x: 3,
          y: 0,
          orientation: 'default',
          customLabel: 'Gadżety'
        },
        {
          instanceId: 'preset-7',
          definitionId: 'gridfinity-bin-1x2',
          x: 5,
          y: 0,
          orientation: 'rotated',
          customLabel: 'Długopisy'
        }
      ]
    }
  }
];
