import { useMemo, useState } from 'react';
import { Header } from './components/Header';
import { DrawerForm } from './components/DrawerForm';
import { GridCanvas } from './components/GridCanvas';
import { PanelLibrary } from './components/PanelLibrary';
import { PanelInspector } from './components/PanelInspector';
import { PlacementToolbar } from './components/PlacementToolbar';
import { SummarySheet } from './components/SummarySheet';
import { PresetGallery } from './components/PresetGallery';
import { PANELS, PanelDefinition } from './data/panels';
import { PRESETS } from './data/presets';
import { PanelInstance, PanelOrientation, doesPanelFit } from './lib/layout';
import {
  makePanelInstance,
  updatePanelLabel,
  updatePanelPosition,
  useLayoutState
} from './hooks/useLayoutState';

const mapPanels = (definitions: PanelDefinition[]) => {
  return definitions.reduce<Record<string, PanelDefinition>>((map, panel) => {
    map[panel.id] = panel;
    return map;
  }, {});
};

const PANEL_MAP = mapPanels(PANELS);

const findFirstFit = (
  definition: PanelDefinition,
  orientation: PanelOrientation,
  grid: { columns: number; rows: number },
  panels: PanelInstance[]
) => {
  for (let y = 0; y < grid.rows; y += 1) {
    for (let x = 0; x < grid.columns; x += 1) {
      const fits = doesPanelFit(grid, definition, orientation, { x, y }, panels);
      if (fits) {
        return { x, y };
      }
    }
  }
  return null;
};

const availabilityMap = (
  definitions: PanelDefinition[],
  grid: { columns: number; rows: number },
  panels: PanelInstance[]
) => {
  return definitions.reduce<Record<string, boolean>>((acc, definition) => {
    const fitsDefault = findFirstFit(definition, 'default', grid, panels);
    const fitsRotated = findFirstFit(definition, 'rotated', grid, panels);
    acc[definition.id] = Boolean(fitsDefault ?? fitsRotated);
    return acc;
  }, {});
};

const App = () => {
  const {
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
  } = useLayoutState();
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [pendingPanel, setPendingPanel] = useState<PanelDefinition | null>(null);
  const [pendingOrientation, setPendingOrientation] = useState<PanelOrientation>('default');
  const [isSummaryOpen, setSummaryOpen] = useState(false);

  const selectedPanel = state.panels.find((panel) => panel.instanceId === selectedPanelId) ?? null;
  const selectedDefinition = selectedPanel ? PANEL_MAP[selectedPanel.definitionId] ?? null : null;

  const handleSelectPanelDefinition = (panel: PanelDefinition) => {
    setPendingPanel(panel);
    setPendingOrientation('default');
  };

  const handlePlacePanel = (position: { x: number; y: number }) => {
    if (!pendingPanel) return;
    const fits = doesPanelFit(state.grid, pendingPanel, pendingOrientation, position, state.panels);
    if (!fits) return;
    const instance = makePanelInstance(pendingPanel.id, {
      x: position.x,
      y: position.y,
      orientation: pendingOrientation
    });
    addPanel(instance);
    setSelectedPanelId(instance.instanceId);
    setPendingPanel(null);
  };

  const handleMovePanel = (panel: PanelInstance, position: { x: number; y: number }) => {
    updatePanel(updatePanelPosition(panel, position));
  };

  const handleRotatePanel = (panel: PanelInstance) => {
    const next = rotatePanel(panel);
    const definition = PANEL_MAP[next.definitionId];
    if (!definition) return;
    const fits = doesPanelFit(
      state.grid,
      definition,
      next.orientation,
      { x: next.x, y: next.y },
      state.panels.filter((item) => item.instanceId !== panel.instanceId)
    );
    if (fits) {
      updatePanel(next);
    } else {
      window.alert('Brak miejsca na obrót panelu w tym położeniu.');
    }
  };

  const handleRenamePanel = (panel: PanelInstance, name: string) => {
    updatePanel(updatePanelLabel(panel, name));
  };

  const effectiveAvailability = useMemo(
    () => availabilityMap(PANELS, state.grid, state.panels),
    [state.grid, state.panels]
  );

  const handleLoadPreset = (presetId: string) => {
    const preset = PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    replaceLayout({
      ...preset.layout,
      panels: preset.layout.panels.map((panel) =>
        makePanelInstance(panel.definitionId, {
          x: panel.x,
          y: panel.y,
          orientation: panel.orientation,
          customLabel: panel.customLabel
        })
      )
    });
    setPendingPanel(null);
    setSelectedPanelId(null);
  };

  const panelMap = PANEL_MAP;

  return (
    <div className="app-shell">
      <Header totalPrice={totalPrice} onOpenSummary={() => setSummaryOpen(true)} />
      <main className="app-main">
        <div className="app-main__content">
          <DrawerForm value={state.drawer} onSubmit={setDrawer} />
          <PlacementToolbar
            panel={pendingPanel}
            orientation={pendingOrientation}
            onCancel={() => setPendingPanel(null)}
            onToggleOrientation={() =>
              setPendingOrientation((prev) => (prev === 'default' ? 'rotated' : 'default'))
            }
          />
          <GridCanvas
            grid={state.grid}
            panels={state.panels}
            panelMap={panelMap}
            onPanelMove={handleMovePanel}
            onPanelSelect={setSelectedPanelId}
            selectedPanelId={selectedPanelId}
            pendingPanel={
              pendingPanel ? { definition: pendingPanel, orientation: pendingOrientation } : null
            }
            onPlacePanel={handlePlacePanel}
          />
        </div>
        <aside className="app-sidebar">
          <PanelLibrary
            panels={PANELS}
            availability={effectiveAvailability}
            onSelect={handleSelectPanelDefinition}
            activePanelId={pendingPanel?.id ?? null}
          />
          <PresetGallery onLoad={handleLoadPreset} />
        </aside>
      </main>
      <PanelInspector
        panel={selectedPanel}
        definition={selectedDefinition}
        onRotate={handleRotatePanel}
        onRemove={(panel) => {
          removePanel(panel.instanceId);
          if (selectedPanelId === panel.instanceId) {
            setSelectedPanelId(null);
          }
        }}
        onRename={handleRenamePanel}
      />
      <SummarySheet
        layout={state}
        panelMap={panelMap}
        open={isSummaryOpen}
        onClose={() => setSummaryOpen(false)}
        onExportPdf={exportPdf}
        shareLink={shareLink}
      />
    </div>
  );
};

export default App;
