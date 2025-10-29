import {
  FC,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { PanelDefinition } from '../data/panels';
import {
  GridSize,
  PanelInstance,
  PanelOrientation,
  doesPanelFit,
  getPanelFootprint
} from '../lib/layout';

const useBoundingRect = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(() => {
      if (!ref.current) return;
      setRect(ref.current.getBoundingClientRect());
    });
    observer.observe(ref.current);
    setRect(ref.current.getBoundingClientRect());
    return () => observer.disconnect();
  }, []);

  return { ref, rect } as const;
};

type DragState = {
  panel: PanelInstance;
  offsetX: number;
  offsetY: number;
};

type GridCanvasProps = {
  grid: GridSize;
  panels: PanelInstance[];
  panelMap: Record<string, PanelDefinition>;
  onPanelMove: (panel: PanelInstance, position: { x: number; y: number }) => void;
  onPanelSelect: (panelId: string) => void;
  selectedPanelId: string | null;
  pendingPanel?: { definition: PanelDefinition; orientation: PanelOrientation } | null;
  onPlacePanel?: (position: { x: number; y: number }) => void;
};

export const GridCanvas: FC<GridCanvasProps> = ({
  grid,
  panels,
  panelMap,
  onPanelMove,
  onPanelSelect,
  selectedPanelId,
  pendingPanel,
  onPlacePanel
}) => {
  const { rect, ref } = useBoundingRect<HTMLDivElement>();
  const [drag, setDrag] = useState<DragState | null>(null);
  const [dragPreview, setDragPreview] = useState<
    { x: number; y: number; width: number; height: number; valid: boolean } | null
  >(null);

  const cellSize = useMemo(() => {
    if (!rect) return 48;
    return rect.width / grid.columns;
  }, [rect, grid.columns]);

  const getDefinition = useCallback(
    (panel: PanelInstance) => panelMap[panel.definitionId],
    [panelMap]
  );

  const handlePointerDown = useCallback(
    (panel: PanelInstance, event: ReactPointerEvent<HTMLDivElement>) => {
      event.stopPropagation();
      if (!rect) return;
      const bounding = event.currentTarget.getBoundingClientRect();
      const offsetX = event.clientX - bounding.left;
      const offsetY = event.clientY - bounding.top;
      setDrag({ panel, offsetX, offsetY });
      onPanelSelect(panel.instanceId);
    },
    [rect, onPanelSelect]
  );

  useEffect(() => {
    if (!drag || !rect) return;

    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault();
      const definition = getDefinition(drag.panel);
      if (!definition) return;
      const footprint = getPanelFootprint(definition, drag.panel.orientation);
      const x = Math.round((event.clientX - rect.left - drag.offsetX) / cellSize + drag.panel.x);
      const y = Math.round((event.clientY - rect.top - drag.offsetY) / cellSize + drag.panel.y);
      const valid = doesPanelFit(
        grid,
        definition,
        drag.panel.orientation,
        { x, y },
        panels.filter((p) => p.instanceId !== drag.panel.instanceId)
      );
      setDragPreview({ x, y, width: footprint.width, height: footprint.height, valid });
    };

    const handlePointerUp = (event: PointerEvent) => {
      event.preventDefault();
      const definition = getDefinition(drag.panel);
      if (!definition) {
        setDrag(null);
        setDragPreview(null);
        return;
      }
      const x = Math.round((event.clientX - rect.left - drag.offsetX) / cellSize + drag.panel.x);
      const y = Math.round((event.clientY - rect.top - drag.offsetY) / cellSize + drag.panel.y);
      const valid = doesPanelFit(
        grid,
        definition,
        drag.panel.orientation,
        { x, y },
        panels.filter((p) => p.instanceId !== drag.panel.instanceId)
      );
      setDrag(null);
      setDragPreview(null);
      if (valid) {
        onPanelMove(drag.panel, { x, y });
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp, { passive: false });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [drag, rect, cellSize, grid, panels, getDefinition, onPanelMove]);

  const handleGridClick = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pendingPanel || !rect || !onPlacePanel) return;
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);
    onPlacePanel({ x, y });
  };

  const renderPanel = (panel: PanelInstance) => {
    const definition = getDefinition(panel);
    if (!definition) return null;
    const footprint = getPanelFootprint(definition, panel.orientation);
    const style: React.CSSProperties = {
      width: `calc(${footprint.width} * var(--cell-size))`,
      height: `calc(${footprint.height} * var(--cell-size))`,
      transform: `translate(${panel.x * cellSize}px, ${panel.y * cellSize}px)`
    };
    const isSelected = panel.instanceId === selectedPanelId;
    return (
      <div
        key={panel.instanceId}
        className={`grid-panel ${isSelected ? 'grid-panel--selected' : ''}`}
        style={style}
        onPointerDown={(event) => handlePointerDown(panel, event)}
        role="button"
        tabIndex={0}
        onClick={(event) => {
          event.stopPropagation();
          onPanelSelect(panel.instanceId);
        }}
      >
        <span className="grid-panel__label">{panel.customLabel ?? definition.name}</span>
      </div>
    );
  };

  const pendingPreview = useMemo(() => {
    if (!pendingPanel) return null;
    const footprint = getPanelFootprint(pendingPanel.definition, pendingPanel.orientation);
    return (
      <div className="grid-overlay" aria-hidden>
        <span>
          Wybierz miejsce w siatce, aby dodać panel {pendingPanel.definition.name} ({footprint.width}×
          {footprint.height} oczek).
        </span>
      </div>
    );
  }, [pendingPanel]);

  return (
    <section className="grid-section">
      <header>
        <h2>Układ wkładu</h2>
        <p>
          Siatka {grid.columns}×{grid.rows} oczek. Przytrzymaj panel, aby go przesunąć.
        </p>
      </header>
      <div
        className="grid-canvas"
        ref={ref}
        style={{
          gridTemplateColumns: `repeat(${grid.columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${grid.rows}, minmax(0, 1fr))`,
          ['--cell-size' as string]: `${cellSize}px`
        }}
        onClick={handleGridClick}
        role="presentation"
      >
        {Array.from({ length: grid.rows * grid.columns }).map((_, index) => (
          <div key={index} className="grid-cell" aria-hidden />
        ))}
        {panels.map((panel) => renderPanel(panel))}
        {dragPreview && (
          <div
            className={`grid-preview ${dragPreview.valid ? 'grid-preview--valid' : 'grid-preview--invalid'}`}
            style={{
              width: `calc(${dragPreview.width} * var(--cell-size))`,
              height: `calc(${dragPreview.height} * var(--cell-size))`,
              transform: `translate(${dragPreview.x * cellSize}px, ${dragPreview.y * cellSize}px)`
            }}
          />
        )}
        {pendingPreview}
      </div>
    </section>
  );
};
