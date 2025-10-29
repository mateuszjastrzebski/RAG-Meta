import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { PANELS } from '../data/panels';
import {
  LayoutState,
  PanelInstance,
  calculateGridSize,
  calculatePanelPrice,
  createPdf,
  defaultDrawer,
  layoutFromQuery,
  layoutToQuery,
  registerPanels
} from '../lib/layout';

registerPanels(PANELS);

type Action =
  | { type: 'SET_DRAWER'; payload: LayoutState['drawer'] }
  | { type: 'ADD_PANEL'; payload: PanelInstance }
  | { type: 'UPDATE_PANEL'; payload: PanelInstance }
  | { type: 'REMOVE_PANEL'; payload: string }
  | { type: 'REPLACE_LAYOUT'; payload: LayoutState };

const reducer = (state: LayoutState, action: Action): LayoutState => {
  switch (action.type) {
    case 'SET_DRAWER': {
      const drawer = action.payload;
      const grid = calculateGridSize(drawer);
      const filteredPanels = state.panels.filter((panel) => {
        const def = PANELS.find((p) => p.id === panel.definitionId);
        if (!def) return false;
        const width = panel.orientation === 'default' ? def.gridWidth : def.gridHeight;
        const height = panel.orientation === 'default' ? def.gridHeight : def.gridWidth;
        return panel.x + width <= grid.columns && panel.y + height <= grid.rows;
      });
      return { drawer, grid, panels: filteredPanels };
    }
    case 'ADD_PANEL':
      return { ...state, panels: [...state.panels, action.payload] };
    case 'UPDATE_PANEL':
      return {
        ...state,
        panels: state.panels.map((panel) =>
          panel.instanceId === action.payload.instanceId ? action.payload : panel
        )
      };
    case 'REMOVE_PANEL':
      return {
        ...state,
        panels: state.panels.filter((panel) => panel.instanceId !== action.payload)
      };
    case 'REPLACE_LAYOUT':
      return action.payload;
    default:
      return state;
  }
};

const initialState = (): LayoutState => ({
  drawer: defaultDrawer,
  grid: calculateGridSize(defaultDrawer),
  panels: []
});

export const useLayoutState = () => {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const addPanel = useCallback((panel: PanelInstance) => {
    dispatch({ type: 'ADD_PANEL', payload: panel });
  }, []);

  const updatePanel = useCallback((panel: PanelInstance) => {
    dispatch({ type: 'UPDATE_PANEL', payload: panel });
  }, []);

  const removePanel = useCallback((instanceId: string) => {
    dispatch({ type: 'REMOVE_PANEL', payload: instanceId });
  }, []);

  const setDrawer = useCallback((drawer: LayoutState['drawer']) => {
    dispatch({ type: 'SET_DRAWER', payload: drawer });
  }, []);

  const replaceLayout = useCallback((layout: LayoutState) => {
    dispatch({ type: 'REPLACE_LAYOUT', payload: layout });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const serialized = params.get('layout');
    const restored = layoutFromQuery(serialized);
    if (restored) {
      dispatch({ type: 'REPLACE_LAYOUT', payload: restored });
    }
  }, []);

  useEffect(() => {
    const serialized = layoutToQuery(state);
    const params = new URLSearchParams(window.location.search);
    params.set('layout', serialized);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [state]);

  const totalPrice = useMemo(
    () => calculatePanelPrice(state.panels, (id) => PANELS.find((panel) => panel.id === id)),
    [state.panels]
  );

  const exportPdf = useCallback(() => {
    createPdf(state, (id) => PANELS.find((panel) => panel.id === id));
  }, [state]);

  const shareLink = useMemo(() => {
    const serialized = layoutToQuery(state);
    return `${window.location.origin}${window.location.pathname}?layout=${serialized}`;
  }, [state]);

  const rotatePanel = useCallback(
    (panel: PanelInstance): PanelInstance => ({
      ...panel,
      orientation: panel.orientation === 'default' ? 'rotated' : 'default'
    }),
    []
  );

  return {
    state,
    addPanel,
    updatePanel,
    removePanel,
    setDrawer,
    replaceLayout,
    totalPrice,
    exportPdf,
    shareLink,
    rotatePanel
  };
};

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `panel-${Math.random().toString(36).slice(2, 10)}`;
};

export const makePanelInstance = (
  definitionId: string,
  options: Partial<Omit<PanelInstance, 'definitionId' | 'instanceId'>> & {
    instanceId?: string;
  } = {}
): PanelInstance => ({
  instanceId: options.instanceId ?? createId(),
  definitionId,
  x: options.x ?? 0,
  y: options.y ?? 0,
  orientation: options.orientation ?? 'default',
  customLabel: options.customLabel
});

export const updatePanelPosition = (
  panel: PanelInstance,
  position: { x: number; y: number }
): PanelInstance => ({
  ...panel,
  x: position.x,
  y: position.y
});

export const updatePanelLabel = (panel: PanelInstance, label: string): PanelInstance => ({
  ...panel,
  customLabel: label
});
